import { ApplicationService } from '../services/applicationService.js';

function getErrorStatus(error) {
  const message = String(error?.message || '').toLowerCase();

  if (message.includes('sem permissao')) return 403;
  if (message.includes('nao encontrada')) return 404;
  if (message.includes('ja se candidatou')) return 409;
  return 500;
}

export class ApplicationController {
  static async createApplication(req, res) {
    try {
      const userId = req.user.id;
      const applicationData = req.validatedData;

      const application = await ApplicationService.createApplication(userId, applicationData);

      res.status(201).json({
        success: true,
        data: application
      });
    } catch (error) {
      console.error('Erro ao criar candidatura:', error);
      res.status(getErrorStatus(error)).json({
        error: 'Erro ao criar candidatura',
        message: error.message
      });
    }
  }

  static async getMyApplications(req, res) {
    try {
      const userId = req.user.id;

      const applications = await ApplicationService.getApplicationsByUserId(userId);

      res.json({
        success: true,
        data: applications
      });
    } catch (error) {
      console.error('Erro ao buscar candidaturas:', error);
      res.status(500).json({
        error: 'Erro ao buscar candidaturas',
        message: error.message
      });
    }
  }

  static async getJobApplications(req, res) {
    try {
      const { jobId } = req.params;
      const userId = req.user.id;

      const applications = await ApplicationService.getApplicationsByJobId(jobId, userId);

      res.json({
        success: true,
        data: applications
      });
    } catch (error) {
      console.error('Erro ao buscar candidaturas da vaga:', error);
      res.status(getErrorStatus(error)).json({
        error: 'Erro ao buscar candidaturas da vaga',
        message: error.message
      });
    }
  }

  static async updateApplicationStatus(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { status } = req.validatedData;

      const application = await ApplicationService.updateApplicationStatus(id, userId, status);

      res.json({
        success: true,
        data: application
      });
    } catch (error) {
      console.error('Erro ao atualizar status da candidatura:', error);
      res.status(getErrorStatus(error)).json({
        error: 'Erro ao atualizar status da candidatura',
        message: error.message
      });
    }
  }
}