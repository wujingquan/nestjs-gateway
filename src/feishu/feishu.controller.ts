import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { FeishuService } from './feishu.service';
import { CreateFeishuDto } from './dto/create-feishu.dto';
import { UpdateFeishuDto } from './dto/update-feishu.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { FeishuMessageDto, GetUserTokenDto } from './dto/feishu.dto';

@ApiTags('飞书')
@Controller('feishu')
export class FeishuController {
  constructor(private readonly feishuService: FeishuService) {}

  @Post()
  create(@Body() createFeishuDto: CreateFeishuDto) {
    return this.feishuService.create(createFeishuDto);
  }

  @Get()
  findAll() {
    return this.feishuService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.feishuService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFeishuDto: UpdateFeishuDto) {
    return this.feishuService.update(+id, updateFeishuDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.feishuService.remove(+id);
  }

  @ApiOperation({ summary: '消息推送' })
  @Post('sendMessage')
  async sendMessage(@Body() params: FeishuMessageDto) {
    const { receive_id_type, ...rest } = params;
    return this.feishuService.sendMessage(receive_id_type, rest);
  }

  @ApiOperation({ summary: '获取用户凭证' })
  @Post('getUserToken')
  getUserToken(@Body() params: GetUserTokenDto) {
    const { code } = params;
    return this.feishuService.getUserToken(code);
  }
}
