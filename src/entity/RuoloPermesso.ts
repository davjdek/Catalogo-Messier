import { Entity } from "typeorm";
import { BaseEntity } from "./BaseEntity";
import { Column } from "typeorm";
import { RoleType } from "./Utente";
import { ManyToOne } from "typeorm";
import { JoinColumn } from "typeorm";
import Permesso from "./Permesso";

@Entity('ruoli_permessi')
export class RuoliPermessi extends BaseEntity{
  @Column({
    name: 'RUOLO',
    type: 'enum',
    enum: RoleType
  })
  ruolo: RoleType;

  @ManyToOne(() => Permesso, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'PERMESSO_ID' })
  permesso: Permesso;
}