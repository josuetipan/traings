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
import { CreateTrainingProgresDto } from 'src/core/application/dtos/retrive-trainig-project/create-trainingProgress.dto';
import { CreateContentProgressDto } from 'src/core/application/dtos/retrive-trainig-project/create-contentProgress.dto';

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
    return this.trainingManagementService.findTrainingByIdRoleAndIdUser(
      userId,
      roleCode,
    );
  }

  @Post('/createprogresstraining')
  async createTrainingProgress(
    @Body() responseTrainingProgressDto: CreateTrainingProgresDto,
  ) {
    return this.trainingManagementService.createTrainingProgress(
      responseTrainingProgressDto,
    );
  }

  @Post('/createcontentprogress')
  async createContentProgress(
    @Body() responseTrainingContentProgressDto: CreateContentProgressDto,
  ) {
    return this.trainingManagementService.createContentProgress(
      responseTrainingContentProgressDto,
    );
  }
}
