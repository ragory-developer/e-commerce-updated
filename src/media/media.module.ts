import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as path from 'path';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: path.join(
        process.cwd(),
        process.env.LOCAL_STORAGE_PATH || 'storage/media',
      ),
      serveRoot: '/uploads/media', // matches LOCAL_BASE_URL default path
    }),
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class MediaModule {}
