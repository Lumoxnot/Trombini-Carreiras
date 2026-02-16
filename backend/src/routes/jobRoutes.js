import express from 'express';
import { JobController } from '../controllers/jobController.js';
import { authenticate, requireCandidate, requireCompany } from '../middleware/auth.js';
import { validate, jobPostingSchema } from '../middleware/validation.js';

const router = express.Router();

// Criar vaga (apenas empresas)
router.post('/', authenticate, requireCompany, validate(jobPostingSchema), JobController.createJob);

// Buscar minhas vagas (apenas empresas)
router.get('/my', authenticate, requireCompany, JobController.getMyJobs);

// Buscar vagas ativas (apenas candidatos)
router.get('/active', authenticate, requireCandidate, JobController.getActiveJobs);

// Buscar vaga por ID
router.get('/:id', authenticate, JobController.getJobById);

// Atualizar vaga (apenas empresas)
router.put('/:id', authenticate, requireCompany, validate(jobPostingSchema), JobController.updateJob);

// Deletar vaga (apenas empresas)
router.delete('/:id', authenticate, requireCompany, JobController.deleteJob);

export default router;