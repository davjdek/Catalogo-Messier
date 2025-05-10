import {Body, JsonController, Post, UnauthorizedError, NotAcceptableError, BadRequestError, Req, CurrentUser, HeaderParam, Patch} from 'routing-controllers';
import Utente, { RoleType } from '../entity/Utente';
import {BaseEntity} from '../entity/BaseEntity';
import {EntityManager} from 'typeorm';
import {appDataSource} from '../../data-source';
import { generateJwtToken } from '../util/generateJwtToken';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { RuoliPermessi } from '../entity/RuoloPermesso';
@JsonController('/auth')
export default class AuthenticationController {

    public entity: typeof BaseEntity;
    public manager: EntityManager

    constructor() {
        this.entity = Utente;
        this.manager = appDataSource.manager;
    }

    // @Post('/login')
    // public async login(@Body() body: any) {

    //     if (!body.username || !body.password){
    //         throw new NotAcceptableError('Username e/o password mancanti')
    //     }
    //     else {
    //         const  utente = await this.manager.createQueryBuilder(Utente, "utente")
    //             .where(`utente.username = '${body.username}'`)
    //             .andWhere(`utente.password = '${body.password}'`)
    //             .andWhere(`utente.attivo = 1`)
    //             .getOne();

    //         if (!utente) {
    //             throw new UnauthorizedError('Credenziali non valide');
    //         }
    //         return generateJwtToken(utente);
    //     }
    // }

    @Post('/login')
public async login(@Body() body: any) {

    if (!body.username || !body.password){
        throw new NotAcceptableError('Username e/o password mancanti');
    }

    // Cerca l'utente solo con lo username e attivo=1
    const utente = await this.manager.createQueryBuilder(Utente, "utente")
        .addSelect("utente.password")
        .where("utente.username = :username", { username: body.username })
        .andWhere("utente.attivo = 1")
        .getOne();

    if (!utente) {
        throw new UnauthorizedError('Credenziali non valide');
    }

    // Confronta la password in chiaro con l'hash salvato
    const passwordMatch = await bcrypt.compare(body.password, utente.password);

    if (!passwordMatch) {
        throw new UnauthorizedError('Credenziali non valide');
    }
    const userRole = utente.ruolo;
    const permissions = await this.getPermissionsForRole(userRole);

    return generateJwtToken(utente, userRole, permissions);
}

// Ottieni ruolo e permessi dal database


@Patch('/cambio-password')
  public async cambioPassword(
    @Body() body: { old_password: string; new_password: string },
    @HeaderParam('authorization') authHeader: string
  ) {
    if (!authHeader) {
      throw new UnauthorizedError('Token mancante');
    }

    const token = authHeader.split(' ')[1];
    let payload: any;
    try {
      payload = jwt.verify(token, 'jwtsecretstring');
      console.log('Payload JWT:', payload);
        console.log('Payload.data:', payload.data);
        console.log('payload.data.idUtente:', payload.data ? payload.data.idUtente : 'data undefined');
    } catch {
      throw new UnauthorizedError('Token non valido');
    }

    const userId = payload.data.idUtente;

    if (!body.old_password || !body.new_password) {
      throw new BadRequestError('Vecchia e nuova password sono obbligatorie');
    }

    console.log('Valore userId passato alla query:', userId);

const utente = await appDataSource.manager.createQueryBuilder(Utente, 'utente')
  .addSelect('utente.password')
  .where('utente.ID = :id', { id: userId })
  .getOne();

console.log('Utente trovato:', utente);

    if (!utente) {
      throw new UnauthorizedError('Utente non trovato');
    }

    const isMatch = await bcrypt.compare(body.old_password, utente.password);
    if (!isMatch) {
      throw new BadRequestError('Vecchia password errata');
    }

    utente.password = body.new_password;
    await appDataSource.manager.save(utente);

    return { message: 'Password cambiata con successo' };
  }

  public async getPermissionsForRole(role: RoleType) {
  const permessiRuoliRepo = appDataSource.getRepository(RuoliPermessi);

  const ruoliPermessi = await permessiRuoliRepo.find({
    where: { ruolo: role },
    relations: ['permesso'],
  });

  return ruoliPermessi.map(rp => rp.permesso.nome);  // <-- restituisci array di stringhe
}

}