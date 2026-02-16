import { supabase } from '../config/supabase.js';

/**
 * Middleware para verificar autenticação do usuário
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Token de autenticação não fornecido'
      });
    }

    const token = authHeader.substring(7);

    // Verificar token com Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        error: 'Token inválido ou expirado'
      });
    }

    // Adicionar usuário ao request
    req.user = user;
    next();
  } catch (error) {
    console.error('Erro na autenticação:', error);
    return res.status(500).json({
      error: 'Erro ao verificar autenticação'
    });
  }
};

/**
 * Middleware para verificar se usuário é candidato
 */
export const requireCandidate = async (req, res, next) => {
  try {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('user_type')
      .eq('user_id', req.user.id)
      .single();

    if (!profile || profile.user_type !== 'candidate') {
      return res.status(403).json({
        error: 'Acesso restrito a candidatos'
      });
    }

    next();
  } catch (error) {
    console.error('Erro ao verificar tipo de usuário:', error);
    return res.status(500).json({
      error: 'Erro ao verificar permissões'
    });
  }
};

/**
 * Middleware para verificar se usuário é empresa
 */
export const requireCompany = async (req, res, next) => {
  try {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('user_type')
      .eq('user_id', req.user.id)
      .single();

    if (!profile || profile.user_type !== 'company') {
      return res.status(403).json({
        error: 'Acesso restrito a empresas'
      });
    }

    next();
  } catch (error) {
    console.error('Erro ao verificar tipo de usuário:', error);
    return res.status(500).json({
      error: 'Erro ao verificar permissões'
    });
  }
};