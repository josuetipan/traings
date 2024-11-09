// Aqui iria la logica de tu entidad
export class TrainingEntity {
  private id_training: string;
  private date: Date;
  private hour: Date;
  private link: string;
  private duration?: string;
  private description?: string;
  private id_type_training?: string;
  private last_modified_by?: string;
  private created_at?: Date;
  private last_modified_at?: Date;

  constructor(
    id_training: string,
    date: Date,
    hour: Date,
    link: string,
    duration?: string,
    description?: string,
    id_type_training?: string,
    last_modified_by?: string,
    created_at?: Date,
    last_modified_at?: Date,
  ) {
    this.id_training = id_training;
    this.date = date;
    this.hour = hour;
    this.link = link;
    this.duration = duration;
    this.description = description;
    this.id_type_training = id_type_training;
    this.last_modified_by = last_modified_by;
    this.created_at = created_at;
    this.last_modified_at = last_modified_at;
  }
}
