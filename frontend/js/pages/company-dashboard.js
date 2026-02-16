import { APP_STATE } from '../config.js';
import { AuthService } from '../auth.js';
import { Router } from '../router.js';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "https://trombini-carreiras.onrender.com").replace(/\/+$/, "");

function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

async function fetchEntityList(entity, { query = {}, limit = 10, sort = '-created_at' } = {}) {
    const params = new URLSearchParams({
        query: JSON.stringify(query),
        limit: String(limit),
        sort
    });

    const response = await fetch(`${API_BASE_URL}/api/v1/entities/${entity}?${params.toString()}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders()
        }
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data?.error || 'Erro ao carregar dados');
    }

    return data?.data?.items || [];
}

export async function renderCompanyDashboard() {
    const app = document.getElementById('app');
    
    // Buscar dados da empresa
    let jobs = [];
    let applications = [];
    
    try {
        jobs = await fetchEntityList('job_postings', { query: {}, limit: 10, sort: '-created_at' });
        applications = await fetchEntityList('applications', { query: {}, limit: 10, sort: '-applied_at' });
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
    
    const activeJobs = jobs.filter(j => j.is_active).length;
    const pendingApps = applications.filter(a => a.status === 'pending').length;
    
    app.innerHTML = `
        <div class="dashboard-page">
            <header class="dashboard-header">
                <div class="container">
                    <div class="header-content">
                        <h1 class="logo">Trombini Carreiras</h1>
                        <nav class="nav">
                            <a href="/company-dashboard" data-link class="nav-link active">Dashboard</a>
                            <a href="/job-form" data-link class="nav-link">Criar Vaga</a>
                            <a href="/resumes-list" data-link class="nav-link">Currículos</a>
                            <a href="/applications" data-link class="nav-link">Candidaturas</a>
                        </nav>
                        <div class="header-actions">
                            <div class="user-menu">
                                <span class="user-icon">👤</span>
                                <button class="btn btn-text" onclick="handleLogout()">Sair</button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
            
            <div class="dashboard-content">
                <div class="container">
                    <h2 class="page-title">Bem-vindo, ${APP_STATE.userProfile?.full_name || 'Empresa'}!</h2>
                    <p class="page-subtitle">Perfil: Empresa</p>
                    
                    <div class="dashboard-grid">
                        <div class="dashboard-card">
                            <h3>Vagas Ativas</h3>
                            <p class="card-stat">${activeJobs}</p>
                            <p class="card-info">de ${jobs.length} vagas totais</p>
                            <a href="/job-form" data-link class="btn btn-primary">Criar Nova Vaga</a>
                        </div>
                        
                        <div class="dashboard-card">
                            <h3>Candidaturas Pendentes</h3>
                            <p class="card-stat">${pendingApps}</p>
                            <p class="card-info">aguardando análise</p>
                            <a href="/applications" data-link class="btn btn-secondary">Ver Candidaturas</a>
                        </div>
                        
                        <div class="dashboard-card">
                            <h3>Buscar Talentos</h3>
                            <p class="card-info">Explore currículos publicados</p>
                            <a href="/resumes-list" data-link class="btn btn-primary">Ver Currículos</a>
                        </div>
                    </div>
                    
                    ${jobs.length > 0 ? `
                        <div class="recent-section">
                            <h3>Vagas Recentes</h3>
                            <div class="jobs-list">
                                ${jobs.slice(0, 5).map(job => `
                                    <div class="job-item">
                                        <div class="job-info">
                                            <h4>${job.title}</h4>
                                            <p class="job-location">${job.location || 'Não especificado'}</p>
                                            <p class="job-date">Publicada em ${new Date(job.created_at).toLocaleDateString('pt-BR')}</p>
                                        </div>
                                        <div class="job-actions">
                                            <span class="status-badge ${job.is_active ? 'active' : 'inactive'}">
                                                ${job.is_active ? 'Ativa' : 'Inativa'}
                                            </span>
                                            <button class="btn btn-small btn-secondary" onclick="editJob(${job.id})">Editar</button>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
    
    window.handleLogout = () => {
        AuthService.logout();
    };
    
    window.editJob = (jobId) => {
        Router.navigateTo(`/job-form?id=${jobId}`);
    };
}
