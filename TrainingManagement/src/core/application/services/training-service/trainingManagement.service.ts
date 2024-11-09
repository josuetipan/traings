import { ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
//import { LoggerService } from '../loggger/logger.service';
import { CreateContentProgressDto } from '../../dtos/training-dto/create-contentProgress.dto';
import { CreateTrainingProgresDto } from '../../dtos/training-dto/create-trainingProgress.dto';
import { CreateQuizResultDto } from '../../dtos/quizzz-dto/create-createquizresults.dto';
import { apiBaseEntityName } from 'src/utils/api/apiEntites';
import { LoggerKafkaService } from '../../loggger/loggerKafka.service';
import { Injectable } from '@nestjs/common';
import { MinioService as MinioClient } from 'nestjs-minio-client';
import {
  TrainingContentDTO,
  TrainingResponseDTO,
  TrainingSectionDTO,
} from '../../dtos/training-dto/response-trainingRol.dto';
import { users } from '@prisma/client';
import { connect } from 'http2';
import { MinioService } from './minio.service';
//Si quieres usar el logger de kafka
//import { LoggerKafkaService } from '../loggger/loggerKafka.service';

@Injectable()
export class TrainingManagementService {
  private minioClient: MinioClient;
  constructor(
    private prisma: PrismaService,
    private logger: LoggerKafkaService,
    private controller: MinioService,
    //Usando el logger de kafka
    //private logger: LoggerService, //Usando el logger simple (No usa kafka)
  ) {}

  async getTrainingByRoleAndUser(
    idUser: string,
    codeRole: string,
  ): Promise<TrainingResponseDTO> {
    const role = await this.prisma.roles.findFirst({
      where: { code_role: codeRole },
    });

    if (!role) throw new Error('Role not found');

    const trainingProgress = await this.prisma.training_progress.findFirst({
      where: {
        id_user: idUser,
        trainings: { id_role: role.id_role },
      },
      include: {
        trainings: {
          include: {
            training_sections: {
              include: {
                training_contents: {
                  include: {
                    user_content_progress: true,
                  },
                },
              },
              orderBy: { order_section: 'asc' },
            },
          },
        },
      },
    });

    if (!trainingProgress)
      throw new Error(
        'Training progress not found for the specified user and role',
      );

    const trainingData = trainingProgress.trainings;

    const traings = await this.images();
    // Map data to DTO
    const sections: TrainingSectionDTO[] = trainingData.training_sections.map(
      (section, index) => ({
        idTrainingSection: section.id_training_section,
        titleSection: section.title_section,
        orderSection: section.order_section,
        contents: section.training_contents
          ? [
              {
                idTrainingContent:
                  section.training_contents.id_training_content,
                isCompleted:
                  section.training_contents.user_content_progress?.some(
                    (progress) =>
                      progress.id_user === idUser && progress.is_completed,
                  ) ?? false,
                titleContent: section.training_contents.title_content,
                description: section.training_contents.description,
                link: traings[index],
              },
            ]
          : [],
      }),
    );
    const trainingResponse: TrainingResponseDTO = {
      idTraining: trainingData.id_training,
      titleTraining: trainingData.title_training,
      description: trainingData.description,
      idStatus: trainingData.id_status,
      progressPercentage: trainingProgress.progress_percentage,
      idCurrentSection: trainingProgress.id_current_section,
      idCurrentContent: trainingProgress.id_current_content,
      sections,
    };

    return trainingResponse;
  }

  async images() {
    const images = await this.prisma.training_contents.findMany({});

    const imagesResponse = images.map((pkg) => {
      return {
        imageUrl: pkg.link,
      };
    });
    const back = 'michimoney-media-images-dev';
    const imagesLinks: string[] = [];

    for (let i = 0; i < imagesResponse.length; i++) {
      const im = imagesResponse[i].imageUrl;
      const links = await this.controller.getFile(back, im);
      imagesLinks.push(links);
    }

    return imagesLinks;
  }
  //---------------------------

  async createContentProgress(
    createContentProgressDto: CreateContentProgressDto,
  ) {
    const { idContentProgress, idTrainingContent, idUser, isCompleted } =
      createContentProgressDto;

    await this.validateIdContentProgressExist(idContentProgress);
    await this.validateIdTrainingContent(idTrainingContent);
    await this.validateIdUser(idUser);

    await this.prisma.user_content_progress.create({
      data: {
        id_content_progress: idContentProgress,
        id_training_content: idTrainingContent,
        id_user: idUser,
        is_completed: isCompleted,
      },
    });

    return 'Create Content Progress';
  }

  async validateIdTrainingContent(id: string) {
    const idTrainingContent = await this.prisma.training_contents.findUnique({
      where: {
        id_training_content: id,
      },
    });

    if (!idTrainingContent) {
      throw new NotFoundException(
        `Training content with ID ${id} was not found. Please verify the ID and try again`,
      );
    }
  }

  async validateIdUser(id: string) {
    const idUser = await this.prisma.users.findUnique({
      where: {
        id_user: id,
      },
    });

    if (!idUser) {
      throw new NotFoundException(
        `User with ID ${id} was not found. Please verify the ID and try again`,
      );
    }
  }

  async validateIdContentProgressExist(id: string) {
    const idContentProgressExist =
      await this.prisma.user_content_progress.findUnique({
        where: {
          id_content_progress: id,
        },
      });

    if (idContentProgressExist) {
      throw new ConflictException(
        `Content Progress with ID ${id} already exists`,
      );
    }
  }
  //----------------------------------

  async validateIdStatus(id: string) {
    const idStatus = await this.prisma.status.findUnique({
      where: {
        id_status: id,
      },
    });

    if (!idStatus) {
      throw new ConflictException(
        `Status with ID ${id} was not found. Please verify the ID and try again`,
      );
    }
  }

  // async validateIdUserRol(id: string) {
  //   const idUserRol = await this.prisma.user_roles.findUnique({
  //     where: {
  //       id_user_role: id,
  //     },
  //   });

  //   if (!idUserRol) {
  //     throw new ConflictException(
  //       `Status with ID ${id} was not found. Please verify the ID and try again`,
  //     );
  //   }
  // }
  //--------------------------------------------------------------------
  async createTrainingProgress(
    responseTrainingProgressDto: CreateTrainingProgresDto,
  ) {
    const {
      idProgress,
      idUser,
      idTraining, //
      idStatus,
      progressPercentage,
      idTrainingSection,
      idTrainingContent,
    } = responseTrainingProgressDto;
    await this.validateIdTrainingContent(idTrainingContent);
    await this.validateIdUser(idUser);
    await this.validateIdTrainingSection(idTrainingSection);
    await this.validateIdStatus(idStatus);
    await this.validateIdTraining(idTraining);
    await this.validateIdTrainingProgress(idProgress);

    await this.prisma.training_progress.create({
      data: {
        id_training_progress: idProgress,
        id_user: idUser,
        id_training: idTraining,
        id_status: idStatus,
        progress_percentage: progressPercentage,
        id_current_section: idTrainingSection,
        id_current_content: idTrainingContent,
      },
    });
    return 'Create Training Progress';
  }

  async validateIdTrainingProgress(id: string) {
    const idResultExist = await this.prisma.training_progress.findUnique({
      where: {
        id_training_progress: id,
      },
    });

    if (idResultExist) {
      throw new ConflictException(
        `Training Progress with ID ${id} already exists`,
      );
    }
  }

  async validateIdTrainingSection(id: string) {
    const idResultExist = await this.prisma.training_sections.findUnique({
      where: {
        id_training_section: id,
      },
    });

    if (!idResultExist) {
      throw new ConflictException(
        `Training Seection with ID ${id} was not found. Please verify the ID and try again`,
      );
    }
  }
  async validateIdTraining(id: string) {
    const idResultExist = await this.prisma.trainings.findUnique({
      where: {
        id_training: id,
      },
    });

    if (!idResultExist) {
      throw new ConflictException(
        `Training with ID ${id} was not found. Please verify the ID and try again`,
      );
    }
  }
}
