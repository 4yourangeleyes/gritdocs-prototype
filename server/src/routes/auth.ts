import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database';
import { User, LoginRequest, RegisterRequest, JWTPayload, AppError, Jurisdiction } from '../types';

const router = express.Router();

// Validation schemas
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const registerSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  jurisdiction: Joi.string().valid('FR', 'SA').required(),
});

// Register
router.post('/register', async (req: any, res: any, next: any): Promise<void> => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message,
      });
    }

    const { firstName, lastName, email, password, jurisdiction }: RegisterRequest = value;

    // Check if user already exists
    const existingUser = await db('users').where({ email }).first();
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User already exists with this email',
      });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const userId = uuidv4();
    await db('users').insert({
      id: userId,
      email,
      password_hash: passwordHash,
      first_name: firstName,
      last_name: lastName,
      jurisdiction,
    });

    // Get created user (without password)
    const newUser = await db('users')
      .select('id', 'email', 'first_name', 'last_name', 'jurisdiction', 'is_vat_registered', 'subscription_tier', 'created_at')
      .where({ id: userId })
      .first();

    // Generate JWT
    const tokenPayload: JWTPayload = {
      userId: newUser.id,
      email: newUser.email,
      jurisdiction: newUser.jurisdiction,
      subscriptionTier: newUser.subscription_tier,
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET!, {
      expiresIn: '7d',
    });

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.first_name,
          lastName: newUser.last_name,
          jurisdiction: newUser.jurisdiction,
          isVatRegistered: newUser.is_vat_registered,
          subscriptionTier: newUser.subscription_tier,
          createdAt: newUser.created_at,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Login
router.post('/login', async (req: any, res: any, next: any): Promise<void> => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message,
      });
    }

    const { email, password }: LoginRequest = value;

    // Find user
    const user = await db('users').where({ email }).first();
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    // Generate JWT
    const tokenPayload: JWTPayload = {
      userId: user.id,
      email: user.email,
      jurisdiction: user.jurisdiction,
      subscriptionTier: user.subscription_tier,
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET!, {
      expiresIn: '7d',
    });

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          jurisdiction: user.jurisdiction,
          isVatRegistered: user.is_vat_registered,
          subscriptionTier: user.subscription_tier,
          createdAt: user.created_at,
          updatedAt: user.updated_at,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Validate token
router.get('/validate', async (req: any, res: any, next: any): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No token provided',
      });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    
    // Get fresh user data
    const user = await db('users')
      .select('id', 'email', 'first_name', 'last_name', 'jurisdiction', 'is_vat_registered', 'subscription_tier', 'created_at', 'updated_at')
      .where({ id: decoded.userId })
      .first();

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found',
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          jurisdiction: user.jurisdiction,
          isVatRegistered: user.is_vat_registered,
          subscriptionTier: user.subscription_tier,
          createdAt: user.created_at,
          updatedAt: user.updated_at,
        },
      },
    });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token',
      });
    }
    next(error);
  }
});

export { router as authRoutes };