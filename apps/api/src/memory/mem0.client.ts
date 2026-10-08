import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { JsonObject } from '../common/json.types';

export interface Mem0Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface Mem0Memory {
  id: string;
  memory?: string | null;
  user_id?: string | null;
  metadata?: JsonObject | null;
  created_at?: string | null;
  updated_at?: string | null;
  score?: number | null;
}

export interface Mem0Results {
  results: Mem0Memory[];
}

const DEFAULT_TIMEOUT_MS = 15000;

/**
 * Thin HTTP client for the self-hosted mem0 server (mem0/server, port 8888).
 * Configuration is read per call so it can change without a restart in tests:
 *   MEM0_BASE_URL    e.g. http://localhost:8888
 *   MEM0_API_KEY     sent as X-API-Key
 *   MEM0_TIMEOUT_MS  optional request timeout
 */
@Injectable()
export class Mem0Client {
  private readonly logger = new Logger(Mem0Client.name);

  isConfigured(): boolean {
    return Boolean(process.env.MEM0_BASE_URL?.trim());
  }

  add(
    userId: string,
    messages: Mem0Message[],
    metadata: JsonObject,
  ): Promise<Mem0Results> {
    return this.request<Mem0Results>('POST', '/memories', {
      messages,
      user_id: userId,
      metadata,
    });
  }

  search(userId: string, query: string, topK: number): Promise<Mem0Results> {
    return this.request<Mem0Results>('POST', '/search', {
      query,
      filters: { user_id: userId },
      top_k: topK,
    });
  }

  list(userId: string): Promise<Mem0Results> {
    return this.request<Mem0Results>('GET', `/memories?user_id=${encodeURIComponent(userId)}`);
  }

  get(memoryId: string): Promise<Mem0Memory> {
    return this.request<Mem0Memory>('GET', `/memories/${encodeURIComponent(memoryId)}`);
  }

  async remove(memoryId: string): Promise<void> {
    await this.request<unknown>('DELETE', `/memories/${encodeURIComponent(memoryId)}`);
  }

  private async request<T>(method: 'GET' | 'POST' | 'DELETE', path: string, body?: unknown): Promise<T> {
    const base = (process.env.MEM0_BASE_URL ?? '').trim().replace(/\/+$/, '');
    if (!base) {
      throw new ServiceUnavailableException('Memory service is not configured');
    }

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const apiKey = process.env.MEM0_API_KEY?.trim();
    if (apiKey) headers['X-API-Key'] = apiKey;

    const timeout = Number(process.env.MEM0_TIMEOUT_MS) || DEFAULT_TIMEOUT_MS;

    let res: Response;
    try {
      res = await fetch(`${base}${path}`, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: AbortSignal.timeout(timeout),
      });
    } catch (err) {
      // Never log the request body: it can contain employee data.
      this.logger.error(`mem0 ${method} ${path} failed: ${err instanceof Error ? err.message : String(err)}`);
      throw new BadGatewayException('Memory service is unreachable');
    }

    if (res.status === 404) throw new NotFoundException('Memory not found');
    if (res.status === 401 || res.status === 403) {
      this.logger.error(`mem0 ${method} ${path} was refused (${res.status}); check MEM0_API_KEY`);
      throw new BadGatewayException('Memory service rejected our credentials');
    }
    if (res.status >= 400 && res.status < 500) {
      throw new BadRequestException('Memory service rejected the request');
    }
    if (!res.ok) {
      this.logger.error(`mem0 ${method} ${path} returned ${res.status}`);
      throw new BadGatewayException('Memory service error');
    }

    return (await res.json()) as T;
  }
}
