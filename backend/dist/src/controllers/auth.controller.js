import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { User } from '../models/user.model.js';
import config from '../config/config.js';
import { AppError } from '../utils/error.util.js';
export const register = async (req, res) => {
    const { username, password, role } = req.body;
    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            throw new AppError(400, 'Username already exists');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
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
    }
    catch (error) {
        console.error('Registration error:', error);
        throw new AppError(500, error.message || 'Registration failed');
    }
};
export const login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) {
            throw new AppError(401, 'Invalid username or password');
        }
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            throw new AppError(401, 'Invalid username or password');
        }
        const token = jwt.sign({
            id: user._id,
            username: user.username,
            role: user.role
        }, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES_IN });
        return res.json({
            success: true,
            token,
            user: {
                id: user._id,
                username: user.username,
                role: user.role
            }
        });
    }
    catch (error) {
        console.error('Login error:', error);
        throw new AppError(500, error.message || 'Login failed');
    }
};
export const getCurrentUser = async (req, res) => {
    try {
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
    }
    catch (error) {
        console.error('Get current user error:', error);
        throw new AppError(500, error.message || 'Failed to get current user');
    }
};
export const logout = async (req, res) => {
    try {
        return res.json({
            success: true,
            message: 'Logged out successfully'
        });
    }
    catch (error) {
        console.error('Logout error:', error);
        throw new AppError(500, error.message || 'Logout failed');
    }
};
//# sourceMappingURL=auth.controller.js.map