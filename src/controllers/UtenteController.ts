import {Authorized, Body, Delete, Get, JsonController, Param, Put, UseBefore} from 'routing-controllers';
import Utente from '../entity/Utente';
import {BaseEntity} from '../entity/BaseEntity';
import {EntityManager} from 'typeorm';
import {appDataSource} from '../../data-source';
import { authenticateToken } from '../middleware/authenticateToken';

@UseBefore(authenticateToken)  // Protegge tutte le rotte di questo controller
@JsonController('/entita')
export default class UtenteController {

    public entity: typeof BaseEntity;
    public manager: EntityManager

    constructor() {
        this.entity = Utente;
        this.manager = appDataSource.manager;
    }

    @Get('/utenti')
    @Authorized('utenti:read')
    public async getAll() {
        return await this.manager.find(Utente);
    }

    @Get('/utenti/:id')
    @Authorized('utenti:read')
    public async getOne(@Param('id') id: number) {
        return await this.manager.findOneBy(Utente,{id: id});
    }

    @Put('/utenti')
    @Authorized(['utenti:create', 'utenti:update'])
    public async upsert(@Body() body: any) {
        const entityToSave = Object.assign(new this.entity(), body)
        return await this.manager.save(entityToSave);
    }

    @Delete('/utenti/:id')
    @Authorized('utenti:delete')
    public async deleteById(@Param('id') id: number) {
        return await this.manager.delete(Utente,id);
    }
}
