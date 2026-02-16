import express from 'express';
import { ApplicationController } from '../controllers/applicationController.js';
import { authenticate, requireCandidate, requireCompany } from '../middleware/auth.js';
import { validate, applicationSchema, updateApplicationStatusSchema } from '../middleware/validation.js';

const router = express.Router();

// Criar candidatura (apenas candidatos)
router.post('/', authenticate, requireCandidate, validate(applicationSchema), ApplicationController.createApplication);

// Buscar minhas candidaturas (apenas candidatos)
router.get('/my', authenticate, requireCandidate, ApplicationController.getMyApplications);

// Buscar candidaturas de uma vaga (apenas empresas)
router.get('/job/:jobId', authenticate, requireCompany, ApplicationController.getJobApplications);

// Atualizar status da candidatura (apenas empresas)
router.patch('/:id/status', authenticate, requireCompany, validate(updateApplicationStatusSchema), ApplicationController.updateApplicationStatus);

export default router;