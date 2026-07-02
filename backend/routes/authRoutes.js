import express from 'express';
import { registerUser, loginUser, studentLogin } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/student-login', studentLogin);

export default router;
