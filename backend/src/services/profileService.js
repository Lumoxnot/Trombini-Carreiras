import { supabase, supabaseAdmin } from '../config/supabase.js';

const dbClient = supabaseAdmin || supabase;

function onlyDigits(value) {
  return String(value || '').replace(/\D/g, '');
}

function normalizeProfileData(profileData) {
  const normalized = { ...profileData };

  if (normalized.user_type !== 'company') {
    normalized.cnpj = null;
    return normalized;
  }

  const cnpjDigits = onlyDigits(normalized.cnpj);
  normalized.cnpj = cnpjDigits || null;
  return normalized;
}

function extractMissingColumn(error) {
  const message = String(error?.message || '');
  const match = message.match(/Could not find the '([^']+)' column/i);
  return match?.[1] || null;
}

async function insertWithSchemaFallback(table, payload) {
  const dataToInsert = { ...payload };
  let lastError = null;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const { data, error } = await dbClient
      .from(table)
      .insert(dataToInsert)
      .select()
      .single();

    if (!error) return { data, error: null };

    lastError = error;
    const missingColumn = extractMissingColumn(error);
    if (missingColumn === 'cnpj') break;
    if (!missingColumn || !(missingColumn in dataToInsert)) break;
    delete dataToInsert[missingColumn];
  }

  return { data: null, error: lastError };
}

async function updateWithSchemaFallback(table, userId, payload) {
  const dataToUpdate = { ...payload };
  let lastError = null;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const { data, error } = await dbClient
      .from(table)
      .update(dataToUpdate)
      .eq('user_id', userId)
      .select()
      .single();

    if (!error) return { data, error: null };

    lastError = error;
    const missingColumn = extractMissingColumn(error);
    if (missingColumn === 'cnpj') break;
    if (!missingColumn || !(missingColumn in dataToUpdate)) break;
    delete dataToUpdate[missingColumn];
  }

  return { data: null, error: lastError };
}

export class ProfileService {
  static async createProfile(userId, profileData) {
    const normalizedData = normalizeProfileData(profileData);

    const { data: existingProfile, error: existingError } = await dbClient
      .from('user_profiles')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (existingError) throw existingError;

    if (existingProfile?.id) {
      const { data, error } = await updateWithSchemaFallback('user_profiles', userId, {
        ...normalizedData,
        updated_at: new Date().toISOString()
      });

      if (error) throw error;
      return data;
    }

    const { data, error } = await insertWithSchemaFallback('user_profiles', {
      user_id: userId,
      ...normalizedData,
      created_at: new Date().toISOString()
    });

    if (error) throw error;
    return data;
  }

  static async getProfileByUserId(userId) {
    const { data, error } = await dbClient
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  static async updateProfile(userId, profileData) {
    const normalizedData = normalizeProfileData(profileData);
    const { data, error } = await updateWithSchemaFallback('user_profiles', userId, {
      ...normalizedData,
      updated_at: new Date().toISOString()
    });

    if (error) throw error;
    return data;
  }
}
