import { supabase, supabaseAdmin } from '../config/supabase.js';

export class NotificationService {
  static getDb() {
    return supabaseAdmin || supabase;
  }

  /**
   * Criar notificacao
   */
  static async createNotification(userId, message, type = 'application') {
    const db = this.getDb();

    const { data, error } = await db
      .from('notifications')
      .insert({
        user_id: userId,
        message,
        type,
        is_read: false,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Buscar notificacoes do usuario
   */
  static async getNotificationsByUserId(userId, onlyUnread = false) {
    const db = this.getDb();

    let query = db
      .from('notifications')
      .select('*')
      .eq('user_id', userId);

    if (onlyUnread) {
      query = query.eq('is_read', false);
    }

    query = query.order('created_at', { ascending: false }).limit(50);

    const { data, error } = await query;

    if (error) throw error;
    return data;
  }

  /**
   * Marcar notificacao como lida
   */
  static async markAsRead(notificationId, userId) {
    const db = this.getDb();

    const { data, error } = await db
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Marcar todas as notificacoes como lidas
   */
  static async markAllAsRead(userId) {
    const db = this.getDb();

    const { error } = await db
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;
    return { success: true };
  }

  /**
   * Deletar notificacao
   */
  static async deleteNotification(notificationId, userId) {
    const db = this.getDb();

    const { error } = await db
      .from('notifications')
      .delete()
      .eq('id', notificationId)
      .eq('user_id', userId);

    if (error) throw error;
    return { success: true };
  }
}