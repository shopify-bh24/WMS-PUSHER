import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { User } from '../models/user.model.js';
import { ILoginRequest } from '../interfaces/user.interface.js';
import config from '../config/config.js';
import { AppError } from '../utils/error.util.js';

// Register new user
export const register = async (req: Request, res: Response) => {
    const { username, password, role } = req.body;

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            throw new AppError(400, 'Username already exists');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const user = new User({
            username,
            password: hashedPassword,
            role: role || 'USER'
        });

        await user.save();
        return res.status(201).json({
            success: true,
            message: 'User registered successfully'
        });
    } catch (error: any) {
        console.error('Registration error:', error);
        throw new AppError(500, error.message || 'Registration failed');
    }
};

// Login user
export const login = async (req: Request<{}, {}, ILoginRequest>, res: Response) => {
    const { username, password } = req.body;

    try {
        // Find user
        const user = await User.findOne({ username });
        if (!user) {
            throw new AppError(401, 'Invalid username or password');
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            throw new AppError(401, 'Invalid username or password');
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                id: user._id,
                username: user.username,
                role: user.role
            },
            config.JWT_SECRET as jwt.Secret,
            { expiresIn: config.JWT_EXPIRES_IN } as jwt.SignOptions
        );

        // Return user data and token
        return res.json({
            success: true,
            token,
            user: {
                id: user._id,
                username: user.username,
                role: user.role
            }
        });
    } catch (error: any) {
        console.error('Login error:', error);
        throw new AppError(500, error.message || 'Login failed');
    }
};

// Get current user
export const getCurrentUser = async (req: Request, res: Response) => {
    try {
        // The user data is already attached to the request by the authenticate middleware
        const user = req.user;

        if (!user) {
            throw new AppError(401, 'User not authenticated');
        }

        return res.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                role: user.role
            }
        });
    } catch (error: any) {
        console.error('Get current user error:', error);
        throw new AppError(500, error.message || 'Failed to get current user');
    }
};

// Logout user
export const logout = async (req: Request, res: Response) => {
    try {
        // Since we're using JWT, we don't need to do anything server-side
        // The client should remove the token
        return res.json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error: any) {
        console.error('Logout error:', error);
        throw new AppError(500, error.message || 'Logout failed');
    }
};