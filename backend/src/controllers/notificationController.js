import { NotificationService } from '../services/notificationService.js';

export class NotificationController {
  static async getMyNotifications(req, res) {
    try {
      const userId = req.user.id;
      const { unread } = req.query;

      const notifications = await NotificationService.getNotificationsByUserId(
        userId,
        unread === 'true'
      );

      res.json({
        success: true,
        data: notifications
      });
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
      res.status(500).json({
        error: 'Erro ao buscar notificações',
        message: error.message
      });
    }
  }

  static async markAsRead(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const notification = await NotificationService.markAsRead(id, userId);

      res.json({
        success: true,
        data: notification
      });
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
      res.status(500).json({
        error: 'Erro ao marcar notificação como lida',
        message: error.message
      });
    }
  }

  static async markAllAsRead(req, res) {
    try {
      const userId = req.user.id;

      await NotificationService.markAllAsRead(userId);

      res.json({
        success: true,
        message: 'Todas as notificações foram marcadas como lidas'
      });
    } catch (error) {
      console.error('Erro ao marcar todas as notificações como lidas:', error);
      res.status(500).json({
        error: 'Erro ao marcar todas as notificações como lidas',
        message: error.message
      });
    }
  }

  static async deleteNotification(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      await NotificationService.deleteNotification(id, userId);

      res.json({
        success: true,
        message: 'Notificação deletada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao deletar notificação:', error);
      res.status(500).json({
        error: 'Erro ao deletar notificação',
        message: error.message
      });
    }
  }
}