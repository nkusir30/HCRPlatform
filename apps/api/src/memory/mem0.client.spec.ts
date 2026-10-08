import 'reflect-metadata';
import {
  BadGatewayException,
  BadRequestException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Mem0Client } from './mem0.client';

const ok = (body: unknown) => ({ ok: true, status: 200, json: async () => body }) as Response;
const status = (code: number) => ({ ok: code < 400, status: code, json: async () => ({}) }) as Response;

describe('Mem0Client', () => {
  const realFetch = global.fetch;
  const env = { ...process.env };
  let fetchMock: jest.Mock;
  let client: Mem0Client;

  beforeEach(() => {
    fetchMock = jest.fn().mockResolvedValue(ok({ results: [] }));
    global.fetch = fetchMock as unknown as typeof fetch;
    process.env.MEM0_BASE_URL = 'http://mem0.test:8888/';
    process.env.MEM0_API_KEY = 'secret-key';
    delete process.env.MEM0_TIMEOUT_MS;
    client = new Mem0Client();
    jest.spyOn(client['logger'], 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    global.fetch = realFetch;
    process.env = { ...env };
  });

  it('isConfigured reflects MEM0_BASE_URL', () => {
    expect(client.isConfigured()).toBe(true);
    process.env.MEM0_BASE_URL = '  ';
    expect(client.isConfigured()).toBe(false);
    delete process.env.MEM0_BASE_URL;
    expect(client.isConfigured()).toBe(false);
  });

  it('throws 503 when not configured and never calls the network', async () => {
    delete process.env.MEM0_BASE_URL;
    await expect(client.search('org:u', 'q', 3)).rejects.toBeInstanceOf(ServiceUnavailableException);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('add posts messages, user_id and metadata with the API key header', async () => {
    await client.add('org-a:u1', [{ role: 'user', content: 'hi' }], { orgId: 'org-a' });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('http://mem0.test:8888/memories');
    expect(init.method).toBe('POST');
    expect(init.headers['X-API-Key']).toBe('secret-key');
    expect(JSON.parse(init.body)).toEqual({
      messages: [{ role: 'user', content: 'hi' }],
      user_id: 'org-a:u1',
      metadata: { orgId: 'org-a' },
    });
  });

  it('search sends the scope inside filters, not as a top-level field', async () => {
    await client.search('org-a:u1', 'shifts', 4);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('http://mem0.test:8888/search');
    expect(JSON.parse(init.body)).toEqual({ query: 'shifts', filters: { user_id: 'org-a:u1' }, top_k: 4 });
  });

  it('list URL-encodes the user id', async () => {
    await client.list('org-a:u 1');
    expect(fetchMock.mock.calls[0][0]).toBe('http://mem0.test:8888/memories?user_id=org-a%3Au%201');
    expect(fetchMock.mock.calls[0][1].method).toBe('GET');
  });

  it('get and remove URL-encode the memory id and send no body', async () => {
    await client.get('a/b');
    await client.remove('a/b');
    expect(fetchMock.mock.calls[0][0]).toBe('http://mem0.test:8888/memories/a%2Fb');
    expect(fetchMock.mock.calls[1][1].method).toBe('DELETE');
    expect(fetchMock.mock.calls[1][1].body).toBeUndefined();
  });

  it('omits X-API-Key when none is configured', async () => {
    delete process.env.MEM0_API_KEY;
    await client.list('org-a:u1');
    expect(fetchMock.mock.calls[0][1].headers['X-API-Key']).toBeUndefined();
  });

  it('maps upstream failures to safe HTTP errors', async () => {
    fetchMock.mockResolvedValueOnce(status(404));
    await expect(client.get('x')).rejects.toBeInstanceOf(NotFoundException);
    fetchMock.mockResolvedValueOnce(status(401));
    await expect(client.get('x')).rejects.toBeInstanceOf(BadGatewayException);
    fetchMock.mockResolvedValueOnce(status(403));
    await expect(client.get('x')).rejects.toBeInstanceOf(BadGatewayException);
    fetchMock.mockResolvedValueOnce(status(422));
    await expect(client.get('x')).rejects.toBeInstanceOf(BadRequestException);
    fetchMock.mockResolvedValueOnce(status(500));
    await expect(client.get('x')).rejects.toBeInstanceOf(BadGatewayException);
  });

  it('maps network errors and timeouts to 502 without leaking details', async () => {
    fetchMock.mockRejectedValueOnce(new Error('connect ECONNREFUSED 10.0.0.5:8888'));
    const err = await client.get('x').catch((e: unknown) => e);
    expect(err).toBeInstanceOf(BadGatewayException);
    expect(JSON.stringify((err as BadGatewayException).getResponse())).not.toContain('10.0.0.5');
    fetchMock.mockRejectedValueOnce('boom');
    await expect(client.get('x')).rejects.toBeInstanceOf(BadGatewayException);
  });

  it('honours MEM0_TIMEOUT_MS', async () => {
    const spy = jest.spyOn(AbortSignal, 'timeout');
    process.env.MEM0_TIMEOUT_MS = '2500';
    await client.list('org-a:u1');
    expect(spy).toHaveBeenCalledWith(2500);
    delete process.env.MEM0_TIMEOUT_MS;
    await client.list('org-a:u1');
    expect(spy).toHaveBeenLastCalledWith(15000);
  });
});
