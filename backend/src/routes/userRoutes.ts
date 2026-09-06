import { Router } from 'express';
import { UserModel } from '../models/userModel.js';

const router = Router();

// POST /api/users/onboard
router.post('/onboard', async (req, res) => {
  try {
    const { name, mobile } = req.body;

    // Validate name and mobile
    const validation = UserModel.validateInput(name, mobile);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        data: null,
        error: {
          code: 'VALIDATION_ERROR',
          message: validation.reason || 'Please enter a valid name and mobile number.'
        }
      });
    }

    // Save to MongoDB collection 'users' (with storage fallback)
    const user = await UserModel.onboardUser(name, mobile);

    res.json({
      success: true,
      data: {
        userId: user._id,
        name: user.name
      },
      error: null
    });
  } catch (err: any) {
    console.error('Onboarding error:', err);
    res.status(500).json({
      success: false,
      data: null,
      error: {
        code: 'ONBOARDING_FAILED',
        message: 'Something went wrong while creating your profile.'
      }
    });
  }
});

// GET /api/users/session/:userId
router.get('/session/:userId', async (req, res) => {
  try {
    const user = await UserModel.getUserById(req.params.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        data: null,
        error: { code: 'USER_NOT_FOUND', message: 'User session not found.' }
      });
    }

    // Safe response without exposing mobile number in public session
    res.json({
      success: true,
      data: {
        userId: user._id,
        name: user.name,
        createdAt: user.createdAt
      },
      error: null
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      data: null,
      error: { code: 'SESSION_ERROR', message: err.message || 'Session lookup failed' }
    });
  }
});

export default router;
