/**
 * JSON-safe value types. Assignable to Prisma's InputJsonValue, unlike
 * Record<string, unknown>.
 */
export type JsonValue = string | number | boolean | null | JsonValue[] | JsonObject;

export interface JsonObject {
  [key: string]: JsonValue;
}
