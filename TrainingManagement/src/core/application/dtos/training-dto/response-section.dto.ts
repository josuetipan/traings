import { ContentDTO } from './response-content.dto';

export class SectionDTO {
  idTrainingSection: string;
  titleSection: string;
  isCompleted: boolean;
  orderSection: number;
  contents: ContentDTO[];
}
