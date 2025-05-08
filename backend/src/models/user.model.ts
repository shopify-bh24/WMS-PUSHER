import mongoose from 'mongoose';
import { UserRole } from '../interfaces/user.interface.js';

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'user'], default: 'user' }
}, { timestamps: true });

export const User = mongoose.model('User', userSchema); 