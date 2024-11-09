import { MiddlewareConsumer, Module } from '@nestjs/common';
import { PathMethodMiddleware } from './core/application/middleware/checkroutes.middleware';
//import { ConfigModule } from '@nestjs/config';
import { TrainingManagementModule } from './core/infrastructure/adaptarts/modules/trainingManagement.module';
//import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TrainingManagementModule,
    //ConfigModule.forRoot({
    //envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    //isGlobal: true, // Hace que el ConfigModule esté disponible en toda la app sin necesidad de importarlo en cada módulo
    //}),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(PathMethodMiddleware).forRoutes('*');
  }
}
