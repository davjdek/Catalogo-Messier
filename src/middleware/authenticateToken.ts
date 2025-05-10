import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

const secretKey = 'jwtsecretstring';

export function authenticateToken(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    res.status(401).json({ message: 'Accesso negato: token mancante' });
    return;
  }

  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      res.status(403).json({ message: 'Token non valido o scaduto' });
      return;
    }
    // req.user non è definito di default, quindi fai un cast a any oppure estendi Request
    console.log('Payload token:', user);
    (req as any).user = {
      id: (user as any).data.idUtente,  // mappo idUtente in id
      nome: (user as any).data.nome,
      cognome: (user as any).data.cognome,
      role: (user as any).data.role,
      permissions: (user as any).data.permissions || []
    };
    next();
  });
}

export function hasRole(roles: string | any[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!(req as any).user) return res.status(401).json({ message: 'Non autenticato' });
    
    if (roles.includes((req as any).user.role)) {
      next();
    } else {
      res.status(403).json({ message: 'Accesso negato: ruolo non autorizzato' });
    }
  };
};

export function hasPermission(requiredPermission: any) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!(req as any).user) return res.status(401).json({ message: 'Non autenticato' });
    
    if ((req as any).user.permissions.includes(requiredPermission)) {
      next();
    } else {
      res.status(403).json({ message: 'Accesso negato: permesso mancante' });
    }
  };
};
