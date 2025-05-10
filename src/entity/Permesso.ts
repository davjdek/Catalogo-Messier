import { Entity } from "typeorm";
import { BaseEntity } from "./BaseEntity";
import { Column } from "typeorm";

@Entity('permessi')
export default class Permesso extends BaseEntity{

  @Column({ name: 'NOME', length: 50, unique: true })
  nome: string;

  @Column({ name: 'DESCRIZIONE', length: 200, nullable: true })
  descrizione: string;
}

