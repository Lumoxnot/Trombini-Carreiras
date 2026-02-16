import express from 'express';
import { NotificationController } from '../controllers/notificationController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Buscar minhas notificações
router.get('/', authenticate, NotificationController.getMyNotifications);

// Marcar notificação como lida
router.patch('/:id/read', authenticate, NotificationController.markAsRead);

// Marcar todas as notificações como lidas
router.patch('/read-all', authenticate, NotificationController.markAllAsRead);

// Deletar notificação
router.delete('/:id', authenticate, NotificationController.deleteNotification);

export default router;