import {Body, JsonController, Post, BadRequestError, NotAcceptableError, HttpError} from 'routing-controllers';
import Utente, { RoleType } from '../entity/Utente';
import {BaseEntity} from '../entity/BaseEntity';
import {EntityManager} from 'typeorm';
import {appDataSource} from '../../data-source';
import { generateJwtToken } from '../util/generateJwtToken';
import { RuoliPermessi } from '../entity/RuoloPermesso';

@JsonController('/registration')
export default class RegistrationController {

    public entity: typeof BaseEntity;
    public manager: EntityManager

    constructor() {
        this.entity = Utente;
        this.manager = appDataSource.manager;
    }

    

    @Post('/register')
    public async register(@Body() body: any) {

        // Verifica che i campi obbligatori siano presenti
        if (!body.username || !body.password || !body.email){
            throw new NotAcceptableError('Username, password e email sono obbligatori');
        }

        // Verifica se l'utente esiste già (username o email)
        const utenteEsistente = await this.manager.createQueryBuilder(Utente, "utente")
            .where(`utente.username = '${body.username}'`)
            .orWhere(`utente.email = '${body.email}'`)
            .getOne();

        if (utenteEsistente) {
            if (utenteEsistente.username === body.username) {
                throw new HttpError(409, 'Username già in uso');
            } else {
                throw new HttpError(409, 'Email già in uso');
            }
        }

        try {
            // Creazione del nuovo utente
            const nuovoUtente = new Utente();
            nuovoUtente.username = body.username;
            nuovoUtente.password = body.password;  // Assegna la password in chiaro
            nuovoUtente.email = body.email;
            nuovoUtente.nome = body.nome || '';
            nuovoUtente.cognome = body.cognome || '';
            nuovoUtente.dataCreazione = new Date();
            nuovoUtente.ruolo = RoleType.VIEWER;
            
            // Salvataggio dell'utente nel database
            await this.manager.save(nuovoUtente);
            const permissions = await getPermissionsForRole(nuovoUtente.ruolo);
            console.log('Permessi da inserire nel token:', permissions);
            // Generazione del token JWT
            return generateJwtToken(nuovoUtente,nuovoUtente.ruolo,permissions);
            
        } catch (error: any) {
            throw new BadRequestError('Errore durante la registrazione: ' + error.message);
        }

        async function getPermissionsForRole(role: RoleType) {
            const ruoliPermessiRepo = appDataSource.getRepository(RuoliPermessi);
          
            const ruoliPermessi = await ruoliPermessiRepo.find({
              where: { ruolo: role },
              relations: ['permesso'],
            });
          
            console.log('RuoliPermessi trovati:', ruoliPermessi);

    return ruoliPermessi.map(rp => {
        console.log('Permesso:', rp.permesso);
        return rp.permesso ? rp.permesso.nome : null;
     });
          }
    }

    @Post('/validate-username')
    public async validateUsername(@Body() body: any) {
        if (!body.username) {
            throw new NotAcceptableError('Username mancante');
        }

        const utente = await this.manager.createQueryBuilder(Utente, "utente")
            .where(`utente.username = '${body.username}'`)
            .getOne();

        return {
            available: !utente,
            message: utente ? 'Username già in uso' : 'Username disponibile'
        };
    }

    @Post('/validate-email')
    public async validateEmail(@Body() body: any) {
        if (!body.email) {
            throw new NotAcceptableError('Email mancante');
        }

        const utente = await this.manager.createQueryBuilder(Utente, "utente")
            .where(`utente.email = '${body.email}'`)
            .getOne();

        return {
            available: !utente,
            message: utente ? 'Email già in uso' : 'Email disponibile'
        };
    }
}