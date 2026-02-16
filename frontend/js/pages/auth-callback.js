import { client } from '../config.js';
import { Router } from '../router.js';

export async function renderAuthCallback() {
    const app = document.getElementById('app');
    
    app.innerHTML = `
        <div class="auth-callback">
            <div class="loading-container">
                <div class="spinner"></div>
                <p>Autenticando...</p>
            </div>
        </div>
    `;
    
    try {
        await client.auth.login();
        Router.navigateTo('/setup-profile');
    } catch (error) {
        console.error('Authentication failed:', error);
        app.innerHTML = `
            <div class="auth-callback">
                <div class="error-container">
                    <h2>Erro na Autenticação</h2>
                    <p>Não foi possível completar o login. Por favor, tente novamente.</p>
                    <button class="btn btn-primary" onclick="window.location.href='/'">Voltar</button>
                </div>
            </div>
        `;
    }
}