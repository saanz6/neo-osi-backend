// src\data-import\dto\import-options.dto.ts
import { IsEnum, IsOptional } from 'class-validator';

export class ImportOptionsDto {
  @IsOptional()
  @IsEnum(['append', 'replace'])
  mode: 'append' | 'replace' = 'append';
}
