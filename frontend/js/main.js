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

// Inicializar aplicação
document.addEventListener('DOMContentLoaded', () => {
    Router.init();
});
