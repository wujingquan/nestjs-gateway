import { PartialType } from '@nestjs/swagger';
import { CreateFeishuDto } from './create-feishu.dto';

export class UpdateFeishuDto extends PartialType(CreateFeishuDto) {}
