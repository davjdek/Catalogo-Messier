import {Body, Delete, Get, JsonController, Param, Post, Put, UseBefore} from 'routing-controllers';
import {TipoOggetto} from '../enum/tipoOggetto';
import { authenticateToken } from '../middleware/authenticateToken';

@UseBefore(authenticateToken)  // Protegge tutte le rotte di questo controller
@JsonController()
export default class TipoStatusController {


    @Get('/tipo_status')
    public async get() {
        return TipoOggetto;
    }
}

