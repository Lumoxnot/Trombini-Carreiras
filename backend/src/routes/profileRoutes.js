import express from 'express';
import { ProfileController } from '../controllers/profileController.js';
import { authenticate } from '../middleware/auth.js';
import { validate, userProfileSchema } from '../middleware/validation.js';

const router = express.Router();

// Criar perfil
router.post('/', authenticate, validate(userProfileSchema), ProfileController.createProfile);

// Buscar meu perfil
router.get('/me', authenticate, ProfileController.getProfile);

// Atualizar perfil
router.put('/me', authenticate, validate(userProfileSchema), ProfileController.updateProfile);

export default router;