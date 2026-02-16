import { ProfileService } from '../services/profileService.js';

export class ProfileController {
  static async createProfile(req, res) {
    try {
      const userId = req.user.id;
      const profileData = req.validatedData;

      const profile = await ProfileService.createProfile(userId, profileData);

      res.status(201).json({
        success: true,
        data: profile
      });
    } catch (error) {
      console.error('Erro ao criar perfil:', error);
      res.status(500).json({
        error: 'Erro ao criar perfil',
        message: error.message
      });
    }
  }

  static async getProfile(req, res) {
    try {
      const userId = req.user.id;

      const profile = await ProfileService.getProfileByUserId(userId);

      res.json({
        success: true,
        data: profile
      });
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      res.status(500).json({
        error: 'Erro ao buscar perfil',
        message: error.message
      });
    }
  }

  static async updateProfile(req, res) {
    try {
      const userId = req.user.id;
      const profileData = req.validatedData;

      const profile = await ProfileService.updateProfile(userId, profileData);

      res.json({
        success: true,
        data: profile
      });
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      res.status(500).json({
        error: 'Erro ao atualizar perfil',
        message: error.message
      });
    }
  }
}