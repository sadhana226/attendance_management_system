import express from 'express';
import { getSystemSettings, updateSystemSettings } from '../controllers/settingsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getSystemSettings)
  .put(protect, updateSystemSettings);

export default router;
