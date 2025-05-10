import { Column, Entity, Check, BeforeInsert } from "typeorm";
import { BaseEntity } from "./BaseEntity";
import { TipoOggetto } from '../enum/tipoOggetto';

@Entity('messier')
export default class Messier extends BaseEntity {

    @Column({ name: 'SIGLA', length: 255 })
    sigla: string;

    @Column({ name: 'URL', length: 255, nullable: true })
    url: string;

    @Column({ name: 'CATALOGO_NGC', length: 255, nullable: true })
    catalogoNgc: string;

    @Column({ name: 'NOME_COMUNE', length: 255, nullable: true })
    nomeComune: string;

    @Column({ name: 'DISTANZA', type: "int" })
    distanza: number;

    @Column({ name: 'FOTO', nullable: true })
    foto: string;

    @Column({ name: 'DESCRIZIONE', type: 'text', nullable: true })
    descrizione: string;

    @Column({
      name: 'TIPO_OGGETTO',
      type: 'enum',
      enum: TipoOggetto,
      nullable: true
    })
    tipoOggetto: TipoOggetto;

    @Column({ name: 'MAGNITUDO', type: 'decimal', precision: 5, scale: 2, nullable: true })
    magnitudo: number;

    @Column({ name: 'COSTELLAZIONE', length: 255, nullable: true })
    costellazione: string;

    @Column({ nullable: true })
    creatoDa?: number;

}