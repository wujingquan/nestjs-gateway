import { DataSource, DataSourceOptions } from 'typeorm';
// import { Page } from '@/page/entities/page.mongo.entity';
// import { PageConfig } from '@/page/entites/page-config.mongo.entity';

// 设置数据库类型
const databaseType: DataSourceOptions['type'] = 'mongodb';
import { getConfig } from 'src/utils/index';
import { join } from 'path';
import { User } from '@/user/entities/user.mongo.entity';
const { MONGODB_CONFIG } = getConfig();
const e = join(__dirname, `../../**/*.${MONGODB_CONFIG.entities}.entity.{ts,js}}`);
console.log('e', e);
const MONOGDB_DATABASE_CONFIG = {
  ...MONGODB_CONFIG,
  type: databaseType,
  // entities: [
  //   path.join(
  //     __dirname,
  //     `../../**/*.${MONGODB_CONFIG.entities}.entity{.ts,.js}`,
  //   ),
  // ],
  entities: [User],
};

const MONGODB_CONNECTION = new DataSource(MONOGDB_DATABASE_CONFIG);

// 数据库注入
export const DatabaseProviders = [
  {
    provide: 'MONGODB_CONNECTION',
    useFactory: async () => {
      await MONGODB_CONNECTION.initialize();
      return MONGODB_CONNECTION;
    },
  },
];
