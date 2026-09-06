import { Router } from 'express';
import { storage } from '../models/storage.js';

const router = Router();

// GET /api/ao-sessions
router.get('/ao-sessions', (req, res) => {
  try {
    const sessions = storage.getAllAOSessions();
    res.json({ success: true, sessions });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/ao-sessions/:id
router.get('/ao-sessions/:id', (req, res) => {
  try {
    const session = storage.getAOSessionById(req.params.id);
    if (!session) return res.status(404).json({ success: false, error: 'AO Session not found' });
    res.json({ success: true, session });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/settings
router.get('/settings', (req, res) => {
  try {
    const settings = storage.getSettings();
    // Mask API key for security
    const masked = {
      ...settings,
      geminiApiKey: settings.geminiApiKey ? `${settings.geminiApiKey.substring(0, 4)}...${settings.geminiApiKey.substring(settings.geminiApiKey.length - 4)}` : ''
    };
    res.json({ success: true, settings: masked });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/settings
router.post('/settings', (req, res) => {
  try {
    const updated = storage.updateSettings(req.body);
    res.json({ success: true, settings: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/reset
router.post('/reset', (req, res) => {
  try {
    storage.resetToSeed();
    res.json({ success: true, message: 'Database reset to demo seed state' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
