import { ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export class VerificationBetwwenTables {
  constructor(private prisma: PrismaService) {}
  async validateTrainingProgressByUserAndTraining(
    isUser: string,
    idTraining: string,
  ) {
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

  async checkContentProgressExistenceByUserAndContent(
    idTrainingContent: string,
    iduser: string,
  ) {
    const idContentProgressExist =
      await this.prisma.user_content_progress.findFirst({
        where: {
          id_training_content: idTrainingContent,
          id_user: iduser,
        },
      });

    if (idContentProgressExist) {
      throw new ConflictException(
        `Content Progress with ID ${idTrainingContent} already exists`,
      );
    }
  }
}
