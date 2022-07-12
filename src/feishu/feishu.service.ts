import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateFeishuDto } from './dto/create-feishu.dto';
import { UpdateFeishuDto } from './dto/update-feishu.dto';
import { Cache } from 'cache-manager';
import { BusinessException } from 'src/common/exceptions/business.exception';
import {
  getAppToken,
  getUserToken,
  refreshUserToken,
} from 'src/helper/feishu/auth';
import { messages } from 'src/helper/feishu/message';
import { GetUserTokenDto } from './dto/feishu.dto';
import { BUSINESS_ERROR_CODE } from '@/common/exceptions/business.error.codes';

@Injectable()
export class FeishuService {
  private APP_TOKEN_CACHE_KEY;
  private USER_TOKEN_CACHE_KEY;
  private REFRESH_TOKEN_CACHE_KEY;
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly configService: ConfigService,
  ) {
    this.APP_TOKEN_CACHE_KEY = this.configService.get('APP_TOKEN_CACHE_KEY');
    this.USER_TOKEN_CACHE_KEY = this.configService.get('USER_TOKEN_CACHE_KEY');
    this.REFRESH_TOKEN_CACHE_KEY = this.configService.get(
      'REFRESH_TOKEN_CACHE_KEY',
    );
  }

  create(createFeishuDto: CreateFeishuDto) {
    return 'This action adds a new feishu';
  }

  findAll() {
    return `This action returns all feishu`;
  }

  findOne(id: number) {
    return `This action returns a #${id} feishu`;
  }

  update(id: number, updateFeishuDto: UpdateFeishuDto) {
    return `This action updates a #${id} feishu`;
  }

  remove(id: number) {
    return `This action removes a #${id} feishu`;
  }

  async getAppToken() {
    let appToken: string = await this.cacheManager.get(
      this.APP_TOKEN_CACHE_KEY,
    );
    if (!appToken) {
      const response = await getAppToken();
      if (response.code === 0) {
        // token 有效期为 2 小时，在此期间调用该接口 token 不会改变。当 token 有效期小于 30 分的时候,再次请求获取 token 的时候，会生成一个新的 token，与此同时老的 token 依然有效。
        appToken = response.app_access_token;
        this.cacheManager.set(this.APP_TOKEN_CACHE_KEY, appToken, {
          ttl: response.expire - 60,
        });
      } else {
        console.log(response);
        throw new BusinessException('飞书调用异常');
      }
    }
    return appToken;
  }

  async getUserToken(code: string) {
    const app_token = await this.getAppToken();
    const dto: GetUserTokenDto = {
      code,
      app_token,
    };
    const res: any = await getUserToken(dto);
    if (res.code !== 0) {
      throw new BusinessException(res.msg);
    }
    return res.data;
  }

  async setUserCacheToken(tokenInfo: any) {
    const {
      refresh_token,
      access_token,
      user_id,
      expires_in,
      refresh_expires_in,
    } = tokenInfo;

    // 缓存用户的token
    await this.cacheManager.set(
      `${this.USER_TOKEN_CACHE_KEY}_${user_id}`,
      access_token,
      {
        ttl: expires_in - 60,
      },
    );

    // 缓存用户的 refresh_token
    await this.cacheManager.set(
      `${this.REFRESH_TOKEN_CACHE_KEY}_${user_id}`,
      refresh_token,
      {
        ttl: refresh_expires_in - 60,
      },
    );
  }

  async getCachedUserToken(user_id: string) {
    let userToken: string = await this.cacheManager.get(
      `${this.USER_TOKEN_CACHE_KEY}_${user_id}`,
    );

    // 如果 token 无效
    if (!userToken) {
      const refreshToken: string = await this.cacheManager.get(
        `${this.REFRESH_TOKEN_CACHE_KEY}_${user_id}`,
      );
      // 如果 refresh token 无效
      if (!refreshToken) {
        throw new BusinessException({
          code: BUSINESS_ERROR_CODE.TOKEN_INVALID,
          message: 'token已失效',
        });
      }

      // 获取新的用户 token
      const userTokenInfo = await this.getUserTokenByRefreshToken(refreshToken);
      // 更新缓存的用户 token
      await this.setUserCacheToken(userTokenInfo);
      userToken = userTokenInfo.access_token;
    }

    return userToken;
  }

  async getUserTokenByRefreshToken(refreshToken: string) {
    return await refreshUserToken({
      refreshToken,
      app_token: await this.getAppToken(),
    });
  }

  async sendMessage(receive_id_type, params) {
    const app_token = await this.getAppToken();
    console.log(receive_id_type, params, app_token);
    return messages(receive_id_type, params, app_token as string);
  }
}
