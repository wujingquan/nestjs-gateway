import { User } from './entities/user.mongo.entity';

export const UserProvicers = [
  {
    provide: 'USER_REPOSITORY',
    useFactory: async (AppDataSource) => {
      // console.log('User', User);
      return await AppDataSource.getRepository(User);
    },
    inject: ['MONGODB_CONNECTION'],
  },
];
