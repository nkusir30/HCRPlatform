import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { JsonObject } from '../../common/json.types';

/** Ids come from Prisma (cuid) so this is strict on purpose: no ':' allowed. */
export const SUBJECT_ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;
const SUBJECT_ID_MESSAGE = 'subjectId must be 1-64 characters: letters, digits, "_" or "-"';

export class MemoryMessageDto {
  @IsIn(['user', 'assistant'])
  role: 'user' | 'assistant';

  @IsString()
  @IsNotEmpty()
  @MaxLength(4000)
  content: string;
}

export class RememberDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => MemoryMessageDto)
  messages: MemoryMessageDto[];

  @IsString()
  @IsOptional()
  @Matches(SUBJECT_ID_PATTERN, { message: SUBJECT_ID_MESSAGE })
  subjectId?: string;

  @IsObject()
  @IsOptional()
  metadata?: JsonObject;
}

export class RecallDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  query: string;

  @IsString()
  @IsOptional()
  @Matches(SUBJECT_ID_PATTERN, { message: SUBJECT_ID_MESSAGE })
  subjectId?: string;

  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(50)
  limit?: number;
}

export class ListMemoriesQueryDto {
  @IsString()
  @IsOptional()
  @Matches(SUBJECT_ID_PATTERN, { message: SUBJECT_ID_MESSAGE })
  subjectId?: string;
}
