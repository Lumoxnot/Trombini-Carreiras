import { createClient } from 'https://cdn.jsdelivr.net/npm/@metagptx/web-sdk@latest/+esm';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://trombini-carreiras.onrender.com').replace(/\/+$/, '');

// Recria o client para que o SDK releia o token atual do localStorage.
export let client = createClient({ baseURL: API_BASE_URL });

export function refreshApiClient() {
    client = createClient({ baseURL: API_BASE_URL });
    return client;
}

// Configurações da aplicação
export const APP_CONFIG = {
    appName: 'Trombini Carreiras',
    version: '1.0.0'
};

// Estados da aplicação
export const APP_STATE = {
    currentUser: null,
    userProfile: null,
    isAuthenticated: false
};
