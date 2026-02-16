import { APP_STATE } from '../config.js';
import { AuthService } from '../auth.js';
import { Router } from '../router.js';

export async function renderSetupProfile() {
    const app = document.getElementById('app');
    
    // Se já tem perfil, redirecionar
    if (APP_STATE.userProfile) {
        if (APP_STATE.userProfile.user_type === 'candidate') {
            Router.navigateTo('/candidate-dashboard');
        } else {
            Router.navigateTo('/company-dashboard');
        }
        return;
    }
    
    app.innerHTML = `
        <div class="setup-profile-page">
            <div class="container">
                <div class="setup-card">
                    <h2>Complete seu Perfil</h2>
                    <p class="subtitle">Escolha como você deseja usar a plataforma</p>
                    
                    <form id="profileForm" class="profile-form">
                        <div class="form-group">
                            <label>Eu sou:</label>
                            <div class="radio-group">
                                <label class="radio-label">
                                    <input type="radio" name="user_type" value="candidate" required>
                                    <span>Candidato - Procurando emprego</span>
                                </label>
                                <label class="radio-label">
                                    <input type="radio" name="user_type" value="company" required>
                                    <span>Empresa - Procurando talentos</span>
                                </label>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="full_name">Nome Completo / Nome da Empresa *</label>
                            <input type="text" id="full_name" name="full_name" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="email">E-mail *</label>
                            <input type="email" id="email" name="email" required value="${APP_STATE.currentUser?.email || ''}">
                        </div>
                        
                        <div class="form-group">
                            <label for="phone">Telefone</label>
                            <input type="tel" id="phone" name="phone" placeholder="(00) 00000-0000">
                        </div>
                        
                        <button type="submit" class="btn btn-primary btn-block">Continuar</button>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    const form = document.getElementById('profileForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const userData = {
            user_type: formData.get('user_type'),
            full_name: formData.get('full_name'),
            email: formData.get('email'),
            phone: formData.get('phone')
        };
        
        try {
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Salvando...';
            
            await AuthService.createUserProfile(userData);
            
            if (userData.user_type === 'candidate') {
                Router.navigateTo('/candidate-dashboard');
            } else {
                Router.navigateTo('/company-dashboard');
            }
        } catch (error) {
            alert('Erro ao criar perfil. Por favor, tente novamente.');
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Continuar';
        }
    });
}