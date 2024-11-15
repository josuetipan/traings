import { TrainingContentDTO } from './response-content.dto';

export class TrainingSectionDTO {
  idTrainingSection: string;
  titleSection: string;
  orderSection: number;
  contents: TrainingContentDTO[];
}
