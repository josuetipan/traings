import { TrainingSectionDTO } from './response-section.dto';

export class TrainingResponseDTO {
  idTraining: string;
  titleTraining: string;
  description: string;
  idStatus: string;
  progressPercentage: number;
  idCurrentSection: string;
  idCurrentContent: string;
  sections: TrainingSectionDTO[];
}
