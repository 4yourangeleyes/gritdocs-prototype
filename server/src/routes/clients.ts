import express from 'express';
import Joi from 'joi';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database';
import { authenticate } from '../middleware/auth';
import { JWTPayload } from '../types';

const router = express.Router();

interface AuthRequest extends express.Request {
  user?: JWTPayload;
}

const createClientSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().optional().allow(''),
  phone: Joi.string().max(20).optional().allow(''),
  address: Joi.object({
    street: Joi.string().max(200).optional().allow(''),
    city: Joi.string().max(100).optional().allow(''),
    postalCode: Joi.string().max(20).optional().allow(''),
    country: Joi.string().max(100).optional().allow(''),
    state: Joi.string().max(100).optional().allow(''),
  }).optional(),
  taxId: Joi.string().max(50).optional().allow(''),
});

// Create client
router.post('/', authenticate, async (req: AuthRequest, res: any, next: any): Promise<void> => {
  try {
    const { error, value } = createClientSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message,
      });
    }

    const { name, email, phone, address, taxId } = value;
    const userId = req.user!.userId;

    const clientId = uuidv4();
    const [client] = await db('clients')
      .insert({
        id: clientId,
        user_id: userId,
        name,
        email: email || null,
        phone: phone || null,
        address_street: address?.street || null,
        address_city: address?.city || null,
        address_postal_code: address?.postalCode || null,
        address_country: address?.country || null,
        address_state: address?.state || null,
        tax_id: taxId || null,
      })
      .returning('*');

    res.status(201).json({
      success: true,
      data: {
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        address: {
          street: client.address_street,
          city: client.address_city,
          postalCode: client.address_postal_code,
          country: client.address_country,
          state: client.address_state,
        },
        taxId: client.tax_id,
        createdAt: client.created_at,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get clients
router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.userId;

    const clients = await db('clients')
      .where({ user_id: userId })
      .orderBy('name');

    res.json({
      success: true,
      data: clients.map((client) => ({
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        address: {
          street: client.address_street,
          city: client.address_city,
          postalCode: client.address_postal_code,
          country: client.address_country,
          state: client.address_state,
        },
        taxId: client.tax_id,
        createdAt: client.created_at,
      })),
    });
  } catch (error) {
    next(error);
  }
});

export { router as clientRoutes };