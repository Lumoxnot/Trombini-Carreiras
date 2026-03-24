import { Router } from './router.js';
import { renderHomePage } from './pages/home.js';
import { renderAuthCallback } from './pages/auth-callback.js';
import { renderLoginPage } from './pages/login.js';
import { renderRegisterPage } from './pages/register.js';
import { renderSetupProfile } from './pages/setup-profile.js';
import { renderCandidateDashboard } from './pages/candidate-dashboard.js';
import { renderCompanyDashboard } from './pages/company-dashboard.js';
import { renderResumeForm } from './pages/resume-form.js';
import { renderJobsList } from './pages/jobs-list.js';
import { renderJobForm } from './pages/job-form.js';
import { renderResumesList } from './pages/resumes-list.js';
import { renderApplications } from './pages/applications.js';
import { renderPrivacyPolicy } from './pages/privacy-policy.js';
import Toast from "./toast.js";


// Registrar rotas
Router.register('/', renderHomePage);
Router.register('/auth/callback', renderAuthCallback);
Router.register('/login', renderLoginPage);
Router.register('/register', renderRegisterPage);
Router.register('/setup-profile', renderSetupProfile);
Router.register('/candidate-dashboard', renderCandidateDashboard);
Router.register('/company-dashboard', renderCompanyDashboard);
Router.register('/resume-form', renderResumeForm);
Router.register('/jobs-list', renderJobsList);
Router.register('/job-form', renderJobForm);
Router.register('/resumes-list', renderResumesList);
Router.register('/applications', renderApplications);
Router.register('/privacidade', renderPrivacyPolicy);
window.Toast = Toast;
function initLGPDBanner() {
    if (localStorage.getItem('lgpd_consent')) return;

    const banner = document.createElement('div');
    banner.id = 'cookie-banner';
    banner.style = "position: fixed; bottom: 20px; left: 20px; right: 20px; background: #fff; border: 1px solid #ddd; padding: 20px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); z-index: 10000; display: flex; align-items: center; justify-content: space-between; gap: 20px;";
    
    banner.innerHTML = `
        <span style="font-size: 14px; color: #555;">
            Usamos cookies para melhorar sua experiência. Ao continuar, você aceita nossa 
            <a href="/privacidade" style="color: #007bff; text-decoration: underline;">Política de Privacidade</a>.
        </span>
        <button id="btn-accept-lgpd" style="background: #28a745; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-weight: bold; white-space: nowrap;">
            Aceitar Cookies
        </button>
    `;

    document.body.appendChild(banner);

    document.getElementById('btn-accept-lgpd').addEventListener('click', () => {
        localStorage.setItem('lgpd_consent', 'true');
        banner.remove();
    });
}

// Inicializar aplicação
document.addEventListener('DOMContentLoaded', () => {
    Router.init();
    initLGPDBanner()
});
