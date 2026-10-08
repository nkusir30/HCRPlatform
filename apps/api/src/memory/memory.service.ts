import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { JsonObject } from '../common/json.types';
import { Mem0Client, Mem0Memory, Mem0Message, Mem0Results } from './mem0.client';

export interface MemoryActor {
  id: string;
  orgId: string;
  role: string;
}

const ADMIN_ROLES = new Set(['admin', 'manager']);
const DEFAULT_RECALL_LIMIT = 5;

/**
 * Long-term memory for HCR, backed by mem0.
 *
 * Tenant isolation: the mem0 user_id is always `${orgId}:${subjectId}`.
 * orgId comes from the verified JWT (never from the request), and subject ids
 * cannot contain ':' (validated in the DTOs), so one org can never address
 * another org's memories. A non-admin can only touch their own subject.
 */
@Injectable()
export class MemoryService {
  constructor(private readonly mem0: Mem0Client) {}

  isEnabled(): boolean {
    return this.mem0.isConfigured();
  }

  async remember(
    actor: MemoryActor,
    messages: Mem0Message[],
    subjectId: string | undefined,
    metadata: JsonObject = {},
  ): Promise<Mem0Results> {
    const scope = this.scopeFor(actor, subjectId);
    // Provenance is stamped server-side so a caller cannot forge it.
    const stamped: JsonObject = { ...metadata, orgId: actor.orgId, recordedBy: actor.id };
    return this.mem0.add(scope, messages, stamped);
  }

  async recall(
    actor: MemoryActor,
    query: string,
    subjectId: string | undefined,
    limit: number = DEFAULT_RECALL_LIMIT,
  ): Promise<Mem0Results> {
    const scope = this.scopeFor(actor, subjectId);
    const found = await this.mem0.search(scope, query, limit);
    return { results: this.onlyInScope(found.results ?? [], scope) };
  }

  async list(actor: MemoryActor, subjectId: string | undefined): Promise<Mem0Results> {
    const scope = this.scopeFor(actor, subjectId);
    const found = await this.mem0.list(scope);
    return { results: this.onlyInScope(found.results ?? [], scope) };
  }

  async getOne(actor: MemoryActor, memoryId: string): Promise<Mem0Memory> {
    return this.loadAuthorized(actor, memoryId);
  }

  async forget(actor: MemoryActor, memoryId: string): Promise<{ message: string }> {
    await this.loadAuthorized(actor, memoryId);
    await this.mem0.remove(memoryId);
    return { message: 'Memory deleted' };
  }

  /** Builds the mem0 user_id and enforces who may address which subject. */
  scopeFor(actor: MemoryActor, subjectId: string | undefined): string {
    const subject = subjectId ?? actor.id;
    if (subject !== actor.id && !ADMIN_ROLES.has(actor.role)) {
      throw new ForbiddenException('You can only access your own memories');
    }
    return `${actor.orgId}:${subject}`;
  }

  /** Fetches a memory by id and proves it belongs to this actor's org (and subject, for non-admins). */
  private async loadAuthorized(actor: MemoryActor, memoryId: string): Promise<Mem0Memory> {
    const memory = await this.mem0.get(memoryId);
    const owner = memory.user_id ?? '';
    const orgPrefix = `${actor.orgId}:`;
    const inOrg = owner.startsWith(orgPrefix);
    const ownsIt = owner === `${orgPrefix}${actor.id}`;
    if (!inOrg || (!ownsIt && !ADMIN_ROLES.has(actor.role))) {
      // Same error as a missing memory so ids in other tenants are not revealed.
      throw new NotFoundException('Memory not found');
    }
    return memory;
  }

  /** Defence in depth: drop anything the backend returned outside the requested scope. */
  private onlyInScope(memories: Mem0Memory[], scope: string): Mem0Memory[] {
    return memories.filter((m) => m.user_id === scope);
  }
}
