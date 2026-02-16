import { createClient } from 'https://cdn.jsdelivr.net/npm/@metagptx/web-sdk@latest/+esm';

// Recria o client para que o SDK releia o token atual do localStorage.
export let client = createClient();

export function refreshApiClient() {
    client = createClient();
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