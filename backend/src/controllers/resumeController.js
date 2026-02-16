import { ResumeService } from '../services/resumeService.js';

export class ResumeController {
  static async createResume(req, res) {
    try {
      const userId = req.user.id;
      const resumeData = req.validatedData;

      const resume = await ResumeService.createResume(userId, resumeData);

      res.status(201).json({
        success: true,
        data: resume
      });
    } catch (error) {
      console.error('Erro ao criar currículo:', error);
      res.status(500).json({
        error: 'Erro ao criar currículo',
        message: error.message
      });
    }
  }

  static async getMyResumes(req, res) {
    try {
      const userId = req.user.id;

      const resumes = await ResumeService.getResumesByUserId(userId);

      res.json({
        success: true,
        data: resumes
      });
    } catch (error) {
      console.error('Erro ao buscar currículos:', error);
      res.status(500).json({
        error: 'Erro ao buscar currículos',
        message: error.message
      });
    }
  }

  static async getResumeById(req, res) {
    try {
      const { id } = req.params;

      const resume = await ResumeService.getResumeById(id);

      res.json({
        success: true,
        data: resume
      });
    } catch (error) {
      console.error('Erro ao buscar currículo:', error);
      res.status(500).json({
        error: 'Erro ao buscar currículo',
        message: error.message
      });
    }
  }

  static async getPublishedResumes(req, res) {
    try {
      const { limit } = req.query;

      const resumes = await ResumeService.getPublishedResumes({ limit: parseInt(limit) || 50 });

      res.json({
        success: true,
        data: resumes
      });
    } catch (error) {
      console.error('Erro ao buscar currículos publicados:', error);
      res.status(500).json({
        error: 'Erro ao buscar currículos publicados',
        message: error.message
      });
    }
  }

  static async updateResume(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const resumeData = req.validatedData;

      const resume = await ResumeService.updateResume(id, userId, resumeData);

      res.json({
        success: true,
        data: resume
      });
    } catch (error) {
      console.error('Erro ao atualizar currículo:', error);
      res.status(500).json({
        error: 'Erro ao atualizar currículo',
        message: error.message
      });
    }
  }

  static async deleteResume(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      await ResumeService.deleteResume(id, userId);

      res.json({
        success: true,
        message: 'Currículo deletado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao deletar currículo:', error);
      res.status(500).json({
        error: 'Erro ao deletar currículo',
        message: error.message
      });
    }
  }
}