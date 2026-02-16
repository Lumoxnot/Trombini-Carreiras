import express from 'express';
import { ResumeController } from '../controllers/resumeController.js';
import { authenticate, requireCandidate, requireCompany } from '../middleware/auth.js';
import { validate, resumeSchema } from '../middleware/validation.js';

const router = express.Router();

// Criar currículo (apenas candidatos)
router.post('/', authenticate, requireCandidate, validate(resumeSchema), ResumeController.createResume);

// Buscar meus currículos (apenas candidatos)
router.get('/my', authenticate, requireCandidate, ResumeController.getMyResumes);

// Buscar currículos publicados (apenas empresas)
router.get('/published', authenticate, requireCompany, ResumeController.getPublishedResumes);

// Buscar currículo por ID
router.get('/:id', authenticate, ResumeController.getResumeById);

// Atualizar currículo (apenas candidatos)
router.put('/:id', authenticate, requireCandidate, validate(resumeSchema), ResumeController.updateResume);

// Deletar currículo (apenas candidatos)
router.delete('/:id', authenticate, requireCandidate, ResumeController.deleteResume);

export default router;