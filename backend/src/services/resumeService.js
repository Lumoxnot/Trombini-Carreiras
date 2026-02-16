import { supabase } from '../config/supabase.js';

export class ResumeService {
  /**
   * Criar currículo
   */
  static async createResume(userId, resumeData) {
    const { data, error } = await supabase
      .from('resumes')
      .insert({
        user_id: userId,
        ...resumeData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Buscar currículos do usuário
   */
  static async getResumesByUserId(userId) {
    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Buscar currículo por ID
   */
  static async getResumeById(resumeId) {
    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('id', resumeId)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Buscar currículos publicados (para empresas)
   */
  static async getPublishedResumes(filters = {}) {
    let query = supabase
      .from('resumes')
      .select('*')
      .eq('is_published', true);

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    query = query.order('updated_at', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;
    return data;
  }

  /**
   * Atualizar currículo
   */
  static async updateResume(resumeId, userId, resumeData) {
    const { data, error } = await supabase
      .from('resumes')
      .update({
        ...resumeData,
        updated_at: new Date().toISOString()
      })
      .eq('id', resumeId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Deletar currículo
   */
  static async deleteResume(resumeId, userId) {
    const { error } = await supabase
      .from('resumes')
      .delete()
      .eq('id', resumeId)
      .eq('user_id', userId);

    if (error) throw error;
    return { success: true };
  }
}