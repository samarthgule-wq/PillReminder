import { IsString, IsNotEmpty, IsOptional, IsIn, MaxLength, IsBoolean } from 'class-validator';

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(4000)
  message!: string;

  @IsOptional()
  @IsString()
  conversationId?: string;

  @IsOptional()
  @IsIn(['patient', 'doctor', 'pharmacy', 'guardian'])
  userRole?: 'patient' | 'doctor' | 'pharmacy' | 'guardian' = 'patient';

  @IsOptional()
  @IsString()
  userId?: string = 'pat-101';

  @IsOptional()
  @IsBoolean()
  stream?: boolean = false;
}
