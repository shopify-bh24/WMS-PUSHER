import { Request, Response } from 'express';
import { ILoginRequest } from '../interfaces/user.interface.js';
export declare const register: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const login: (req: Request<{}, {}, ILoginRequest>, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getCurrentUser: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const logout: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
