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

export class TrainingSectionDTO {
  idTrainingSection: string;
  titleSection: string;
  orderSection: number;
  contents: TrainingContentDTO[];
}

export class TrainingContentDTO {
  idTrainingContent: string;
  isCompleted: boolean;
  titleContent: string;
  description: string;
  link: string;
}
