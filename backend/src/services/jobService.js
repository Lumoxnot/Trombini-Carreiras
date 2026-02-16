import { supabase } from '../config/supabase.js';

export class JobService {
  /**
   * Criar vaga
   */
  static async createJob(userId, jobData) {
    const { data, error } = await supabase
      .from('job_postings')
      .insert({
        user_id: userId,
        ...jobData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Buscar vagas da empresa
   */
  static async getJobsByUserId(userId) {
    const { data, error } = await supabase
      .from('job_postings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Buscar vaga por ID
   */
  static async getJobById(jobId) {
    const { data, error } = await supabase
      .from('job_postings')
      .select('*')
      .eq('id', jobId)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Buscar vagas ativas (para candidatos)
   */
  static async getActiveJobs(filters = {}) {
    let query = supabase
      .from('job_postings')
      .select('*')
      .eq('is_active', true);

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;
    return data;
  }

  /**
   * Atualizar vaga
   */
  static async updateJob(jobId, userId, jobData) {
    const { data, error } = await supabase
      .from('job_postings')
      .update({
        ...jobData,
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Deletar vaga
   */
  static async deleteJob(jobId, userId) {
    const { error } = await supabase
      .from('job_postings')
      .delete()
      .eq('id', jobId)
      .eq('user_id', userId);

    if (error) throw error;
    return { success: true };
  }
}