import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  Req,
  BadRequestException,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ListMemoriesQueryDto, RecallDto, RememberDto, SUBJECT_ID_PATTERN } from './dto/memory.dto';
import { MemoryActor, MemoryService } from './memory.service';

type AuthedRequest = Request & { user?: MemoryActor };

/**
 * Memory endpoints. The org is always taken from the verified JWT, so there is
 * deliberately no :orgId in the path.
 */
@UseGuards(JwtAuthGuard)
@Controller('memory')
export class MemoryController {
  constructor(private readonly memory: MemoryService) {}

  @Get('status')
  status() {
    return { enabled: this.memory.isEnabled() };
  }

  @Post('remember')
  remember(@Req() req: AuthedRequest, @Body() dto: RememberDto) {
    return this.memory.remember(this.actor(req), dto.messages, dto.subjectId, dto.metadata);
  }

  @Post('recall')
  @HttpCode(200)
  recall(@Req() req: AuthedRequest, @Body() dto: RecallDto) {
    return this.memory.recall(this.actor(req), dto.query, dto.subjectId, dto.limit);
  }

  @Get()
  list(@Req() req: AuthedRequest, @Query() query: ListMemoriesQueryDto) {
    return this.memory.list(this.actor(req), query.subjectId);
  }

  @Get(':memoryId')
  getOne(@Req() req: AuthedRequest, @Param('memoryId') memoryId: string) {
    return this.memory.getOne(this.actor(req), this.checkId(memoryId));
  }

  @Delete(':memoryId')
  forget(@Req() req: AuthedRequest, @Param('memoryId') memoryId: string) {
    return this.memory.forget(this.actor(req), this.checkId(memoryId));
  }

  private actor(req: AuthedRequest): MemoryActor {
    const user = req.user;
    if (!user?.id || !user.orgId) {
      throw new UnauthorizedException('Authenticated user context is missing');
    }
    return { id: user.id, orgId: user.orgId, role: user.role };
  }

  /** mem0 ids are UUIDs; reject anything that could alter the upstream path. */
  private checkId(memoryId: string): string {
    if (!SUBJECT_ID_PATTERN.test(memoryId)) {
      throw new BadRequestException('Invalid memory id');
    }
    return memoryId;
  }
}
