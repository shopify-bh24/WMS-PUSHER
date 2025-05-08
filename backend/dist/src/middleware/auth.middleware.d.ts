import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../interfaces/user.interface.js';
interface JwtPayload {
    id: string;
    username: string;
    role: UserRole;
}
declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}
export declare const authenticate: (req: Request, _res: Response, next: NextFunction) => Promise<void>;
export declare const authorize: (...roles: UserRole[]) => (req: Request, _res: Response, next: NextFunction) => void;
export {};
