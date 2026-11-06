import { IsString, IsOptional, IsIn, MaxLength } from 'class-validator';

export class CreateConversationDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  title?: string;

  @IsOptional()
  @IsIn(['patient', 'doctor', 'pharmacy', 'guardian'])
  userRole?: 'patient' | 'doctor' | 'pharmacy' | 'guardian' = 'patient';

  @IsOptional()
  @IsString()
  userId?: string = 'pat-101';
}

export class QueryConversationsDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsIn(['patient', 'doctor', 'pharmacy', 'guardian'])
  userRole?: 'patient' | 'doctor' | 'pharmacy' | 'guardian';
}
