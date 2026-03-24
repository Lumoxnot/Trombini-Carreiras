import { client, APP_STATE } from '../config.js';
import { AuthService } from '../auth.js';
import { Router } from '../router.js';

function getItems(response) {
    if (Array.isArray(response?.data?.data?.items)) return response.data.data.items;
    if (Array.isArray(response?.data?.items)) return response.data.items;
    if (Array.isArray(response?.items)) return response.items;
    return [];
}

export async function renderCandidateDashboard() {
    const app = document.getElementById('app');
    
    // Buscar dados do candidato
    let resume = null;
    let applications = [];
    let notifications = [];
    
    try {
        const resumeResponse = await client.entities.resumes.query({ query: {}, limit: 1, sort: '-updated_at' });
        const resumeItems = getItems(resumeResponse);
        if (resumeItems.length > 0) {
            resume = resumeItems[0];
        }
        
        const appsResponse = await client.entities.applications.query({ query: {}, limit: 10, sort: '-applied_at' });
        applications = getItems(appsResponse);
        
        const notifResponse = await client.entities.notifications.query({ query: { is_read: false }, limit: 5, sort: '-created_at' });
        notifications = getItems(notifResponse);
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
    
    app.innerHTML = `
        <div class="dashboard-page">
            <header class="dashboard-header">
                <div class="container">
                    <div class="header-content">
                        <h1 class="logo">Trombini Carreiras</h1>
                        <nav class="nav">
                            <a href="/candidate-dashboard" data-link class="nav-link active">Dashboard</a>
                            <a href="/resume-form" data-link class="nav-link">Meu Currículo</a>
                            <a href="/jobs-list" data-link class="nav-link">Vagas</a>
                            <a href="/applications" data-link class="nav-link">Candidaturas</a>
                        </nav>
                        <div class="header-actions">
                            <div class="notification-badge" onclick="toggleNotifications()">
                                <span class="icon">🔔</span>
                                ${notifications.length > 0 ? `<span class="badge">${notifications.length}</span>` : ''}
                            </div>
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
                    <h2 class="page-title">Bem-vindo, ${APP_STATE.userProfile?.full_name || 'Candidato'}!</h2>
                    <p class="page-subtitle">Perfil: Candidato</p>
                    
                    <div class="dashboard-grid">
                        <div class="dashboard-card">
                            <h3>Meu Currículo</h3>
                            ${resume ? `
                                <p class="status-text success">✓ Currículo ${resume.is_published ? 'publicado' : 'salvo'}</p>
                                <p class="card-info">Última atualização: ${new Date(resume.updated_at).toLocaleDateString('pt-BR')}</p>
                                <a href="/resume-form" data-link class="btn btn-secondary">Editar Currículo</a>
                            ` : `
                                <p class="status-text warning">Você ainda não criou seu currículo</p>
                                <a href="/resume-form" data-link class="btn btn-primary">Criar Currículo</a>
                            `}
                        </div>
                        
                        <div class="dashboard-card">
                            <h3>Candidaturas</h3>
                            <p class="card-stat">${applications.length}</p>
                            <p class="card-info">candidaturas enviadas</p>
                            <a href="/applications" data-link class="btn btn-secondary">Ver Todas</a>
                        </div>
                        
                        <div class="dashboard-card">
                            <h3>Vagas Disponíveis</h3>
                            <p class="card-info">Explore novas oportunidades</p>
                            <a href="/jobs-list" data-link class="btn btn-primary">Buscar Vagas</a>
                        </div>
                    </div>
                    
                    ${applications.length > 0 ? `
                        <div class="recent-section">
                            <h3>Candidaturas Recentes</h3>
                            <div class="applications-list">
                                ${applications.slice(0, 5).map(app => `
                                    <div class="application-item">
                                        <div class="application-info">
                                            <h4>Candidatura #${app.id}</h4>
                                            <p class="application-date">${new Date(app.applied_at).toLocaleDateString('pt-BR')}</p>
                                        </div>
                                        <span class="status-badge ${app.status}">${getStatusText(app.status)}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    <div id="notificationsPanel" class="notifications-panel" style="display: none;">
                        <h3>Notificações</h3>
                        ${notifications.length > 0 ? `
                            <div class="notifications-list">
                                ${notifications.map(notif => `
                                    <div class="notification-item" data-id="${notif.id}">
                                        <p>${notif.message}</p>
                                        <span class="notification-time">${new Date(notif.created_at).toLocaleString('pt-BR')}</span>
                                    </div>
                                `).join('')}
                            </div>
                        ` : '<p class="empty-state">Nenhuma notificação nova</p>'}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    window.handleLogout = () => {
        AuthService.logout();
    };
    
    window.toggleNotifications = () => {
        const panel = document.getElementById('notificationsPanel');
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    };
    
    function getStatusText(status) {
        const statusMap = {
            'pending': 'Pendente',
            'approved': 'Aprovado',
            'rejected': 'Rejeitado'
        };
        return statusMap[status] || status;
    }
}
