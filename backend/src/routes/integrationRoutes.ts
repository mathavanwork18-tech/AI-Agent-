import { Router } from 'express';
import { DifyService } from '../services/difyService.js';

const router = Router();

// GET /api/integrations/dify/health
router.get('/dify/health', async (req, res) => {
  try {
    const health = await DifyService.healthCheck();

    if (!health.connected) {
      return res.json({
        success: false,
        data: {
          provider: 'dify',
          connected: false,
          configured: health.configured,
          apiUrl: health.apiUrl
        },
        error: health.error || {
          code: 'DIFY_CONNECTION_ERROR',
          message: 'Unable to connect to Dify.'
        }
      });
    }

    return res.json({
      success: true,
      data: {
        provider: 'dify',
        connected: true,
        configured: true,
        apiUrl: health.apiUrl
      },
      error: null
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      data: {
        provider: 'dify',
        connected: false
      },
      error: {
        code: 'DIFY_INTERNAL_ERROR',
        message: err.message || 'Error checking Dify health'
      }
    });
  }
});

export default router;
