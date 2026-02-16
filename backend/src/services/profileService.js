import { supabase } from '../config/supabase.js';

export class ProfileService {
  /**
   * Criar perfil de usuário
   */
  static async createProfile(userId, profileData) {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert({
        user_id: userId,
        ...profileData,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Buscar perfil por user_id
   */
  static async getProfileByUserId(userId) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Atualizar perfil
   */
  static async updateProfile(userId, profileData) {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(profileData)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}