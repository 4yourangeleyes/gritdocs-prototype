import express from 'express';
import { authenticate } from '../middleware/auth';
import { JWTPayload } from '../types';

const router = express.Router();

interface AuthRequest extends express.Request {
  user?: JWTPayload;
}

// Get user profile
router.get('/profile', authenticate, async (req: AuthRequest, res, next) => {
  try {
    // User data is already available from the JWT
    res.json({
      success: true,
      data: {
        user: req.user,
      },
    });
  } catch (error) {
    next(error);
  }
});

export { router as userRoutes };