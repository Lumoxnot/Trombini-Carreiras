import { supabase, supabaseAdmin } from '../config/supabase.js';
import { NotificationService } from './notificationService.js';

export class ApplicationService {
  static getDb() {
    return supabaseAdmin || supabase;
  }

  /**
   * Criar candidatura
   */
  static async createApplication(userId, applicationData) {
    const db = this.getDb();

    // Verificar se ja existe candidatura
    const { data: existing, error: existingError } = await db
      .from('applications')
      .select('id')
      .eq('user_id', userId)
      .eq('job_id', applicationData.job_id)
      .eq('resume_id', applicationData.resume_id)
      .maybeSingle();

    if (existingError) throw existingError;

    if (existing) {
      throw new Error('Voce ja se candidatou a esta vaga');
    }

    const { data, error } = await db
      .from('applications')
      .insert({
        user_id: userId,
        ...applicationData,
        status: 'pending',
        applied_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Buscar candidaturas do usuario
   */
  static async getApplicationsByUserId(userId) {
    const db = this.getDb();

    const { data, error } = await db
      .from('applications')
      .select('*')
      .eq('user_id', userId)
      .order('applied_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Buscar candidaturas de uma vaga (para empresa)
   */
  static async getApplicationsByJobId(jobId, companyUserId) {
    const db = this.getDb();

    // Verificar se a vaga pertence a empresa
    const { data: job, error: jobError } = await db
      .from('job_postings')
      .select('user_id')
      .eq('id', jobId)
      .maybeSingle();

    if (jobError) throw jobError;

    if (!job || job.user_id !== companyUserId) {
      throw new Error('Vaga nao encontrada ou sem permissao');
    }

    const { data, error } = await db
      .from('applications')
      .select('*')
      .eq('job_id', jobId)
      .order('applied_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Atualizar status da candidatura
   */
  static async updateApplicationStatus(applicationId, companyUserId, newStatus) {
    const db = this.getDb();

    // Buscar candidatura
    const { data: application, error: applicationError } = await db
      .from('applications')
      .select('id, user_id, job_id')
      .eq('id', applicationId)
      .maybeSingle();

    if (applicationError) throw applicationError;

    if (!application) {
      throw new Error('Candidatura nao encontrada');
    }

    // Verificar se a vaga pertence a empresa logada
    const { data: job, error: jobError } = await db
      .from('job_postings')
      .select('id, user_id')
      .eq('id', application.job_id)
      .maybeSingle();

    if (jobError) throw jobError;

    if (!job || job.user_id !== companyUserId) {
      throw new Error('Candidatura nao encontrada ou sem permissao');
    }

    // Atualizar status
    const { data, error } = await db
      .from('applications')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', applicationId)
      .select()
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      throw new Error('Candidatura nao encontrada para atualizacao');
    }

    // Criar notificacao para o candidato
    const message = newStatus === 'approved'
      ? 'Parabens! Sua candidatura foi aprovada. A empresa entrara em contato em breve.'
      : 'Sua candidatura foi analisada.';

    await NotificationService.createNotification(
      application.user_id,
      message,
      'approval'
    );

    return data;
  }
}
