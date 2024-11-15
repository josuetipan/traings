import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Get,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MinioService } from 'src/core/application/services/training-service/minio.service';

@Controller()
export class MinioController {
  constructor(private readonly minioService: MinioService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    const bucketName = 'michimoney-media-images-dev'; // Asegúrate de que el bucket existe
    const contentType = file.mimetype || 'image/png';
    const filePath = await this.minioService.uploadFile(
      bucketName,
      file,
      contentType,
    );
    return { filePath }; // Devuelve la ruta del archivo subido
  }

  @Get(':filePath')
  async getFile(@Param('filePath') filePath: string) {
    //console.log(filePath);

    const bucketName = 'michimoney-media-images-dev'; // Asegúrate de que el bucket existe
    const url = await this.minioService.getFile(bucketName, filePath);
    //console.log('es link de controller' + url);
    return { url }; // Devuelve la URL para acceder al archivo
  }
}
