import {sign} from 'jsonwebtoken';


export const generateJwtToken = function(utente: any, userRole: any, permissions: any) {
    return {
        token: sign(
            {
                data: {
                    idUtente: utente.id,
                    nome: utente.nome,
                    cognome: utente.cognome,
                    role: userRole,
                    permissions: permissions
                }
            },
            'jwtsecretstring'
        )
    };
}
