import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ListMemoriesQueryDto, RecallDto, RememberDto, SUBJECT_ID_PATTERN } from './memory.dto';

const errorsFor = async <T extends object>(cls: new () => T, plain: object) =>
  validate(plainToInstance(cls, plain), { whitelist: true, forbidNonWhitelisted: true });

const goodMessages = [{ role: 'user', content: 'Prefers mornings' }];

describe('memory DTO validation', () => {
  describe('SUBJECT_ID_PATTERN', () => {
    it.each(['clx123abc', 'user_1', 'a-b', 'A'.repeat(64)])('accepts %p', (id) => {
      expect(SUBJECT_ID_PATTERN.test(id)).toBe(true);
    });
    it.each(['', 'a:b', 'org-a:u1', 'a b', 'a/b', '../x', 'a.b', 'A'.repeat(65)])('rejects %p', (id) => {
      expect(SUBJECT_ID_PATTERN.test(id)).toBe(false);
    });
  });

  describe('RememberDto', () => {
    it('accepts a valid payload', async () => {
      expect(await errorsFor(RememberDto, { messages: goodMessages, subjectId: 'u1', metadata: { k: 'v' } })).toHaveLength(0);
    });
    it('requires 1-20 messages', async () => {
      expect((await errorsFor(RememberDto, { messages: [] })).length).toBeGreaterThan(0);
      expect((await errorsFor(RememberDto, { messages: Array(21).fill(goodMessages[0]) })).length).toBeGreaterThan(0);
    });
    it('rejects a bad role, empty content and oversize content', async () => {
      expect((await errorsFor(RememberDto, { messages: [{ role: 'system', content: 'x' }] })).length).toBeGreaterThan(0);
      expect((await errorsFor(RememberDto, { messages: [{ role: 'user', content: '' }] })).length).toBeGreaterThan(0);
      expect((await errorsFor(RememberDto, { messages: [{ role: 'user', content: 'x'.repeat(4001) }] })).length).toBeGreaterThan(0);
    });
    it('rejects a subjectId that tries to inject a tenant prefix', async () => {
      expect((await errorsFor(RememberDto, { messages: goodMessages, subjectId: 'org-b:u1' })).length).toBeGreaterThan(0);
    });
    it('rejects unknown properties such as a client-supplied orgId', async () => {
      expect((await errorsFor(RememberDto, { messages: goodMessages, orgId: 'org-b' })).length).toBeGreaterThan(0);
    });
  });

  describe('RecallDto', () => {
    it('accepts a valid query', async () => {
      expect(await errorsFor(RecallDto, { query: 'shifts', limit: 10, subjectId: 'u1' })).toHaveLength(0);
    });
    it('rejects empty or oversize queries', async () => {
      expect((await errorsFor(RecallDto, { query: '' })).length).toBeGreaterThan(0);
      expect((await errorsFor(RecallDto, { query: 'x'.repeat(501) })).length).toBeGreaterThan(0);
    });
    it('bounds the limit to 1-50 and requires an integer', async () => {
      expect((await errorsFor(RecallDto, { query: 'q', limit: 0 })).length).toBeGreaterThan(0);
      expect((await errorsFor(RecallDto, { query: 'q', limit: 51 })).length).toBeGreaterThan(0);
      expect((await errorsFor(RecallDto, { query: 'q', limit: 1.5 })).length).toBeGreaterThan(0);
      expect(await errorsFor(RecallDto, { query: 'q', limit: 50 })).toHaveLength(0);
    });
    it('rejects an injected tenant prefix', async () => {
      expect((await errorsFor(RecallDto, { query: 'q', subjectId: 'org-b:u1' })).length).toBeGreaterThan(0);
    });
  });

  describe('ListMemoriesQueryDto', () => {
    it('accepts no subject or a valid one, and rejects a bad one', async () => {
      expect(await errorsFor(ListMemoriesQueryDto, {})).toHaveLength(0);
      expect(await errorsFor(ListMemoriesQueryDto, { subjectId: 'u1' })).toHaveLength(0);
      expect((await errorsFor(ListMemoriesQueryDto, { subjectId: 'a:b' })).length).toBeGreaterThan(0);
    });
  });
});
