import { Module } from '@nestjs/common';
import { PrismaService } from 'src/core/application/prisma/prisma.service';
import { LoggerModule } from 'src/core/application/loggger/logger.module';
import { TrainingManagementController } from '../controllers/v1/training-project-Controller/training-mangagement.controller';
import { TrainingManagementService } from 'src/core/application/services/training-service/trainingManagement.service';
import { LoggerKafkaService } from 'src/core/application/loggger/loggerKafka.service';
import { MinioService } from 'src/core/application/services/training-service/minio.service';
import { ValidationService } from 'src/core/application/services/training-service/verification.service';
import { VerificationBetwwenTables } from 'src/core/application/services/training-service/validationBetween.service';
@Module({
  imports: [LoggerModule.register(process.env.USE_KAFKA === 'true')],
  controllers: [TrainingManagementController],
  providers: [
    TrainingManagementService,
    PrismaService,
    MinioService,
    ValidationService,
    VerificationBetwwenTables,
  ],
})
export class TrainingManagementModule {}
