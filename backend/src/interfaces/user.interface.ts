import { Document } from 'mongoose';

export type UserRole = 'admin' | 'user';

export interface IUser extends Document {
  username: string;
  password: string;
  role: UserRole;
  email?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserResponse {
  id: string;
  username: string;
  role: UserRole;
  email?: string;
}

export interface ILoginRequest {
  username: string;
  password: string;
}

export interface IRegisterRequest extends ILoginRequest {
  email?: string;
  role?: UserRole;
}

export interface IAuthResponse {
  token: string;
  user: IUserResponse;
} 