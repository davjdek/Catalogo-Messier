import {CreateDateColumn, PrimaryGeneratedColumn} from "typeorm";

export class BaseEntity {
    @PrimaryGeneratedColumn('increment',{name: 'ID'})
    id:number;

    @CreateDateColumn({name:'DATA_CREAZIONE'})
    dataCreazione: Date;

    public static getCheckConstraintEnum(nomeColonna: string, enumDaConcatenare: any): string {
        return ` ${nomeColonna} in (${Object.values(enumDaConcatenare).map(elemento =>`'${elemento}'`).join(', ')}) `
    }

    public static getCheckConstraintPositiveNumber(nomeColonna: string): string {
        return ` ${nomeColonna} >= 0 `
    }
}