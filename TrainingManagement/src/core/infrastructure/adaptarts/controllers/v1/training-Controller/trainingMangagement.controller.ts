import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  Query,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { CheckDatabaseConnectionGuard } from 'src/core/application/decorators/checkDatabase.decorator';
import { TrainingManagementService } from 'src/core/application/services/training-service/trainingManagement.service';

import { FileInterceptor } from '@nestjs/platform-express';
import { ApiResponse } from '@nestjs/swagger';
import { apiExceptionConfig } from 'src/utils/api/apiExceptionConfig';

@Controller()
@UseGuards(CheckDatabaseConnectionGuard)
export class TrainingManagementController {
  constructor(private trainingManagementService: TrainingManagementService) {}

  @ApiResponse(apiExceptionConfig.notFound)
  @Get('/retrievetraining')
  async getTraining(
    @Query('userId', ParseUUIDPipe) userId: string,
    @Query('roleCode') roleCode: string,
  ) {
    console.log(userId, roleCode);
    return this.trainingManagementService.getTrainingByRoleAndUser(
      userId,
      roleCode,
    );
  }
}
