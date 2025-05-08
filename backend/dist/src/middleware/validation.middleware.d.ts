import { Request, Response, NextFunction } from 'express';
import { ILoginRequest, IRegisterRequest } from '../interfaces/user.interface.js';
export declare const validateLogin: (req: Request<{}, {}, ILoginRequest>, _res: Response, next: NextFunction) => void;
export declare const validateRegister: (req: Request<{}, {}, IRegisterRequest>, _res: Response, next: NextFunction) => void;
export declare const validateOrderSync: (req: Request, _res: Response, next: NextFunction) => void;
