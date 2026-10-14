import { IsString, IsNotEmpty, IsOptional, MinLength, MaxLength, IsBoolean } from 'class-validator';

export class CreateProgramDto {
  @IsString()
  @IsNotEmpty()
  companyId: string;

  @IsString()
  @IsOptional()
  houseId?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(40)
  programId: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(200)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(20)
  code: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsBoolean()
  @IsOptional()
  active?: boolean;
}

export class UpdateProgramDto {
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(200)
  name?: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(20)
  code?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsString()
  @IsOptional()
  houseId?: string;

  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
