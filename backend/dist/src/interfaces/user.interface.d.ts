import { Document } from 'mongoose';
export declare enum UserRole {
    ADMIN = "ADMIN",
    USER = "USER"
}
export interface IUser extends Document {
    username: string;
    password: string;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
}
export interface IUserResponse {
    id: string;
    username: string;
    role: UserRole;
}
export interface ILoginRequest {
    username: string;
    password: string;
}
export interface IRegisterRequest {
    username: string;
    password: string;
    role?: UserRole;
}
export interface IAuthResponse {
    token: string;
    user: IUserResponse;
}
