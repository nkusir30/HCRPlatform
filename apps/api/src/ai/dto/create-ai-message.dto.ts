// The `ai` feature module shares the AiMessage persistence contract with
// `ai-chat` (both expose the same AiMessage Prisma model), so the canonical
// DTO — including its AiMessageRole / AiMessageStatus enums — lives there.
export { CreateAiMessageDto, AiMessageRole, AiMessageStatus } from '../../ai-chat/dto/create-ai-message.dto';
