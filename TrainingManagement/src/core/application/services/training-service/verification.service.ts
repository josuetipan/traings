import { ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export class ValidationService {
  constructor(private prisma: PrismaService) {}

  async validateTrainingExist(idTraining: string) {
    const idResultExist = await this.prisma.trainings.findUnique({
      where: {
        id_training: idTraining,
      },
    });

    if (!idResultExist) {
      throw new ConflictException(
        `Training with ID ${idTraining} was not found. Please verify the ID and try again`,
      );
    }
  }

  async validateTrainingSectionExist(idTrainingSection: string) {
    const idResultExist = await this.prisma.training_sections.findUnique({
      where: {
        id_training_section: idTrainingSection,
      },
    });

    if (!idResultExist) {
      throw new ConflictException(
        `Training Seection with ID ${idTrainingSection} was not found. Please verify the ID and try again`,
      );
    }
  }

  async validateStatusExist(idStatus: string) {
    const idResultExist = await this.prisma.status.findUnique({
      where: {
        id_status: idStatus,
      },
    });

    if (!idStatus) {
      throw new ConflictException(
        `Status with ID ${idStatus} was not found. Please verify the ID and try again`,
      );
    }
  }

  async validateUserExist(idUser: string) {
    const idUserExist = await this.prisma.users.findUnique({
      where: {
        id_user: idUser,
      },
    });

    if (!idUserExist) {
      throw new NotFoundException(
        `User with ID ${idUser} was not found. Please verify the ID and try again`,
      );
    }
  }

  async validateTrainingContentExist(idTrainingContent: string) {
    const idTrainingContentExist =
      await this.prisma.training_contents.findUnique({
        where: {
          id_training_content: idTrainingContent,
        },
      });

    if (!idTrainingContentExist) {
      throw new NotFoundException(
        `Training content with ID ${idTrainingContent} was not found. Please verify the ID and try again`,
      );
    }
  }
}
