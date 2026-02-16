import { JobService } from '../services/jobService.js';

export class JobController {
  static async createJob(req, res) {
    try {
      const userId = req.user.id;
      const jobData = req.validatedData;

      const job = await JobService.createJob(userId, jobData);

      res.status(201).json({
        success: true,
        data: job
      });
    } catch (error) {
      console.error('Erro ao criar vaga:', error);
      res.status(500).json({
        error: 'Erro ao criar vaga',
        message: error.message
      });
    }
  }

  static async getMyJobs(req, res) {
    try {
      const userId = req.user.id;

      const jobs = await JobService.getJobsByUserId(userId);

      res.json({
        success: true,
        data: jobs
      });
    } catch (error) {
      console.error('Erro ao buscar vagas:', error);
      res.status(500).json({
        error: 'Erro ao buscar vagas',
        message: error.message
      });
    }
  }

  static async getJobById(req, res) {
    try {
      const { id } = req.params;

      const job = await JobService.getJobById(id);

      res.json({
        success: true,
        data: job
      });
    } catch (error) {
      console.error('Erro ao buscar vaga:', error);
      res.status(500).json({
        error: 'Erro ao buscar vaga',
        message: error.message
      });
    }
  }

  static async getActiveJobs(req, res) {
    try {
      const { limit } = req.query;

      const jobs = await JobService.getActiveJobs({ limit: parseInt(limit) || 50 });

      res.json({
        success: true,
        data: jobs
      });
    } catch (error) {
      console.error('Erro ao buscar vagas ativas:', error);
      res.status(500).json({
        error: 'Erro ao buscar vagas ativas',
        message: error.message
      });
    }
  }

  static async updateJob(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const jobData = req.validatedData;

      const job = await JobService.updateJob(id, userId, jobData);

      res.json({
        success: true,
        data: job
      });
    } catch (error) {
      console.error('Erro ao atualizar vaga:', error);
      res.status(500).json({
        error: 'Erro ao atualizar vaga',
        message: error.message
      });
    }
  }

  static async deleteJob(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      await JobService.deleteJob(id, userId);

      res.json({
        success: true,
        message: 'Vaga deletada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao deletar vaga:', error);
      res.status(500).json({
        error: 'Erro ao deletar vaga',
        message: error.message
      });
    }
  }
}