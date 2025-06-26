import { Column, Entity, BeforeInsert, BeforeUpdate, AfterLoad } from "typeorm";
import { BaseEntity } from "./BaseEntity";
import * as bcrypt from 'bcrypt';

export enum RoleType {
    ADMIN = 'admin',
    EDITOR = 'editor',
    VIEWER = 'viewer'
  }

const SALT_ROUNDS = 12;

@Entity('utenti')
export default class Utente extends BaseEntity {

    @Column({ name: 'NOME', length: 255 })
    nome: string;

    @Column({ name: 'COGNOME', length: 255 })
    cognome: string;

    @Column({ name: 'ATTIVO', default: true })
    attivo: boolean;

    @Column({ name: 'USERNAME', length: 255 })
    username: string;

    @Column({ name: 'EMAIL', length: 255 })
    email: string;

    @Column({ name: 'PASSWORD', length: 255, select: false })
    password: string;

    @Column({
        name: 'RUOLO',
        type: 'enum',
        enum: RoleType,
        default: RoleType.VIEWER
      })
      ruolo: RoleType;

    private tempPassword: string;

    @AfterLoad()
    loadTempPassword() {
        // Salviamo la password caricata per confrontarla in seguito
        this.tempPassword = this.password;
    }

    @BeforeInsert()
    setDefaultAttivo() {
    if (this.attivo === undefined || this.attivo === null) {
        this.attivo = true;
    }
}

    @BeforeInsert()
    @BeforeUpdate()
    async hashPassword() {
        // Se la password è stata modificata o è nuova, la cifriamo
        if (this.password && this.password !== this.tempPassword) {
            this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
        }
    }
}