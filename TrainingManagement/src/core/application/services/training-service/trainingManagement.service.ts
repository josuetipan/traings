import { ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
//import { LoggerService } from '../loggger/logger.service';
import { CreateContentProgressDto } from '../../dtos/retrive-trainig-project/create-contentProgress.dto';
import { CreateTrainingProgresDto } from '../../dtos/retrive-trainig-project/create-trainingProgress.dto';
import { CreateQuizResultDto } from '../../dtos/quizzz-dto/create-createquizresults.dto';
import { apiBaseEntityName } from 'src/utils/api/apiEntites';
import { LoggerKafkaService } from '../../loggger/loggerKafka.service';
import { Injectable } from '@nestjs/common';
import { MinioService as MinioClient } from 'nestjs-minio-client';
import { users } from '@prisma/client';
import { connect } from 'http2';
import { MinioService } from './minio.service';
import { time } from 'console';
import { TrainingResponseDTO } from '../../dtos/retrive-trainig-project/response-trainingRol.dto';
//Si quieres usar el logger de kafka
//import { LoggerKafkaService } from '../loggger/loggerKafka.service';

@Injectable()
export class TrainingManagementService {
  private minioClient: MinioClient;
  constructor(
    private prisma: PrismaService,
    private controller: MinioService,
    //Usando el logger de kafka
    //private logger: LoggerService, //Usando el logger simple (No usa kafka)
  ) {}

  async findTrainingByIdRoleAndIdUser(
    idRoles: string,
    IdUSer,
  ): Promise<TrainingResponseDTO[]> {
    const trainingFirstPrincipal = await this.prisma.trainings.findMany({
      include: {
        training_progress: true,
        training_sections: {
          include: {
            training_contents: {
              include: {
                user_content_progress: {
                  select: { is_completed: true },
                },
              },
            },
          },
        },
      },
    });

    if (!trainingFirstPrincipal) {
      throw new NotFoundException(
        `Training with role ${idRoles} and user ${IdUSer} was not found. Please verify the role and user and try again`,
      );
    }
    try {
      const trainingImages = await this.images();
      const trainingData = trainingFirstPrincipal.map((mapig, index) => {
        return {
          idTraining: mapig.id_training,
          titleTraining: mapig.title_training,
          description: mapig.description,
          idStatus: mapig.id_status,
          progressPercentage: mapig?.training_progress?.reduce(
            (acc, cur) => acc + cur.progress_percentage,
            0,
          ),
          idCurrentSection: mapig.training_sections?.find((s) =>
            s.training_contents.find((c) => c.user_content_progress.length > 0),
          )
            ? mapig.training_sections.find((s) =>
                s.training_contents.find(
                  (c) => c.user_content_progress.length > 0,
                ),
              ).id_training_section
            : null,

          idCurrentContent: mapig.training_sections?.find((s) =>
            s.training_contents.find((c) => c.user_content_progress.length > 0),
          )
            ? mapig.training_sections
                .find((s) =>
                  s.training_contents.find(
                    (c) => c.user_content_progress.length > 0,
                  ),
                )
                .training_contents.find(
                  (c) => c.user_content_progress.length > 0,
                ).id_training_content
            : null,
          sections: mapig.training_sections?.map((s, sectionIndex) => {
            return {
              idTrainingSection: s.id_training_section || '',
              titleSection: s.title_section,
              orderSection: s.order_section,
              contents: s.training_contents.map((c, contentIndex) => {
                const imageIndex =
                  index * mapig.training_sections.length +
                  sectionIndex * s.training_contents.length +
                  contentIndex;
                console.warn(c.user_content_progress);
                return {
                  idTrainingContent: c.id_training_content,
                  isCompleted: c.user_content_progress[0]?.is_completed || null,
                  titleContent: c.title_content,
                  description: c.description,
                  link: trainingImages[imageIndex],
                };
              }),
            };
          }),
        };
      });

      return trainingData;
    } catch (error) {
      throw new Error('Aqui esta el error ' + error);
    }
  }

  async images() {
    const images = await this.prisma.training_contents.findMany({
      select: { link: true },
    });
    const back = process.env.MINIO_BUCKET_IMAGEN;
    const imagesLinks = [];
    for await (const { link } of images) {
      const links = await this.controller.getFile(back, link);
      imagesLinks.push(links);
    }

    console.error(imagesLinks);
    return imagesLinks;
  }
  //---------------------------

  async createContentProgress(
    createContentProgressDto: CreateContentProgressDto,
  ) {
    const { idTrainingContent, idUser, isCompleted } = createContentProgressDto;

    await this.validateIdTrainingContent(idTrainingContent);
    await this.validateIdUser(idUser);
    await this.validateIdContentProgressExist(idTrainingContent, idUser);

    await this.prisma.user_content_progress.create({
      data: {
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

  async validateIdContentProgressExist(id: string, iduser: string) {
    const idContentProgressExist =
      await this.prisma.user_content_progress.findFirst({
        where: {
          id_training_content: id,
          id_user: iduser,
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
    await this.validateTrainingProgressByUser(idUser, idTraining);

    await this.prisma.training_progress.create({
      data: {
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
  async validateTrainingProgressByUser(isUser: string, idTraining: string) {
    const idResultExist = await this.prisma.training_progress.findFirst({
      where: {
        id_user: isUser,
        id_training: idTraining,
      },
    });

    if (idResultExist) {
      throw new ConflictException(
        `Training progress record with user ID ${isUser}, training ID ${idTraining}, was not found. Please verify the IDs and try again.`,
      );
    }
  }
}
