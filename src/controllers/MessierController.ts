import {Body, Delete, Get, JsonController, Param, Put, UseBefore, Authorized, ForbiddenError, NotFoundError, Req} from 'routing-controllers';
import Messier from '../entity/Messier';
import {BaseEntity} from '../entity/BaseEntity';
import {EntityManager} from 'typeorm';
import {appDataSource} from '../../data-source';
import { authenticateToken } from '../middleware/authenticateToken';

@UseBefore(authenticateToken)  // Protegge tutte le rotte di questo controller
@JsonController('/entita')
export default class MessierController {

    public entity: typeof BaseEntity;
    public manager: EntityManager

    constructor() {
        this.entity = Messier;
        this.manager = appDataSource.manager;
    }

    @Get('/messier')
    @Authorized('catalogo:read')
    public async getAll() {
        
        return await this.manager.find(Messier);
    }

    @Get('/messier/:id')
    @Authorized('catalogo:read')
    public async getOne(@Param('id') id: number) {
        return await this.manager.findOneBy(Messier,{id: id});
    }

    
    @Put('/messier')
    @Authorized('catalogo:update')
    public async upsert(@Body() body: any, @Req() req: Request) {
        const user = (req as any).user;

        if (!user) {
            throw new ForbiddenError('Utente non autenticato');
        }

        // Se è update (presenza di id), controlla ownership per ruolo editor
        if (body.id) {
            const entityInDb = await this.manager.findOneBy(Messier, { id: body.id });
            if (!entityInDb) throw new NotFoundError('Elemento non trovato');
            console.log('Controllo ownership:', { creatoDa: entityInDb.creatoDa, userId: user.id, userRole: user.role });
            if (user.role === 'editor' && entityInDb.creatoDa !== user.id) {
                throw new ForbiddenError('Non puoi modificare elementi creati da altri');
            }
        } else {
            // Se è create, imposta creatoDa con userId
            body.creatoDa = user.id;
        }

        const entityToSave = Object.assign(new this.entity(), body);
        return await this.manager.save(entityToSave);
    }

    @Delete('/messier/:id')
    @Authorized('catalogo:delete')
    public async deleteById(@Param('id') id: number, @Req() req: Request) {
        const user = (req as any).user;

        if (!user) {
            throw new ForbiddenError('Utente non autenticato');
        }

        const entityInDb = await this.manager.findOneBy(Messier, { id });
        if (!entityInDb) throw new NotFoundError('Elemento non trovato');

        if (user.role === 'editor' && entityInDb.creatoDa !== user.id) {
            throw new ForbiddenError('Non puoi eliminare elementi creati da altri');
        }

        return await this.manager.delete(Messier, id);
    }


}
