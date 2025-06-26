import Express from 'express';
const path = require('path');
const bodyParser = require('body-parser');
import {Action, useExpressServer} from 'routing-controllers';
import MessierController from './controllers/MessierController';
const params = require('../config/parametri_comuni');
import * as cors from 'cors';
import TipoStatusController from './controllers/TipoStatusController';
import {appDataSource} from '../data-source'
import UtenteController from './controllers/UtenteController';
import AuthenticationController from './controllers/AuthenticationController';
import RegistrationController from './controllers/RegistrationController';
import { authenticateToken } from './middleware/authenticateToken';

const port: Number = params.PORT;
const projectName: String = params.PROJECT_NAME;
const options:cors.CorsOptions = {
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'X-Access-Token', 'Authorization', 'Content-Length', 'Upgrade-Insecure-Requests'],
    credentials: true,
    methods: 'GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE',
    origin: ['http://localhost:8080',
        'http://localhost:4200',
        'http://localhost',
        'https://catalogo-messier-angular.onrender.com'
    ],
    preflightContinue: false,
    optionsSuccessStatus: 200
};


class App {
    private app: Express.Application;

    constructor() {
        this.app = Express();
        this.app.use(bodyParser.json());
        this.app.use(Express.static(path.join(__dirname, '/public')));
        //this.app.use('/utenti', routerUtenti);

        // un'api localhost:port/ che mi restituisce una pagina html
        this.app.get("/", (req:Express.Request, res:Express.Response) => {
            return res.status(200).sendFile(path.join(__dirname, '/index.html'));
        });

        this.app.get('/ping', (req:Express.Request, res:Express.Response) => {
            return res.status(200).send(projectName)
        });

        this.app.use(bodyParser.urlencoded({ extended: true }));

        this.app.post('/welcome', function(req:Express.Request, res:Express.Response) {
            const name:string = req.body.uname;
            return res.status(200).send(`Welcome ${name}!`)
            // ...
        });

        //this.app.all('*', (req:Express.Request, res:Express.Response) => {
        //    return res.redirect('/');
        //});
        const authorizationChecker = async (action: Action, roles: string[]) => {
            const user = action.request.user;
          
            console.log('authorizationChecker chiamato');
            console.log('Utente:', user);
            console.log('Ruoli richiesti:', roles);
            console.log('Ruolo utente:', user?.role);
            console.log('Permessi utente:', user?.permissions);
          
            if (!user) {
              console.log('Nessun utente autenticato');
              return false;
            }
          
            if (roles.length === 0) {
              console.log('Nessun ruolo richiesto, accesso consentito');
              return true;
            }
          
            // Controllo ruolo
            if (user.role && roles.includes(user.role)) {
              console.log('Ruolo utente autorizzato');
              return true;
            }
          
            // Controllo permessi
            if (user.permissions) {
              const hasPermission = roles.some(role => user.permissions.includes(role));
              console.log('Permessi sufficienti?', hasPermission);
              return hasPermission;
            }
          
            console.log('Accesso negato: ruolo o permessi insufficienti');
            return false;
          };
        useExpressServer(this.app,{
            routePrefix: '/api',
            cors: options,
            controllers: [
                MessierController,
                TipoStatusController,
                UtenteController,
                AuthenticationController,
                RegistrationController
            ],middlewares: [authenticateToken], // middleware globale o usa @UseBefore nei controller
            authorizationChecker,
            currentUserChecker: action => action.request.user, // opzionale, per @CurrentUser decorator
        });

        /*               createConnection()
                           .then(_ => {
                               this.app.listen(port,() => console.log (`Server started on port ${port}`));
                           })
                           .catch( err => console.log(err));
       */

                       appDataSource.initialize()

                          .then(() => {
                              this.app.listen(port,() => console.log (`Server started on port ${port}`));
                          })
                          .catch((err) => {
                              console.error("Error during Data Source initialization", err)
                          })

// Funzione authorizationChecker

   }



}

new App();