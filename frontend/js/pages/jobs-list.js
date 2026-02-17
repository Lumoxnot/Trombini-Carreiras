import { client, APP_STATE } from '../config.js';
import { Router } from '../router.js';

function getItems(response) {
    if (Array.isArray(response?.data?.data?.items)) return response.data.data.items;
    if (Array.isArray(response?.data?.items)) return response.data.items;
    if (Array.isArray(response?.items)) return response.items;
    return [];
}

export async function renderJobsList() {
    const app = document.getElementById('app');
    
    let jobs = [];
    let userResume = null;
    
    try {
        // Buscar vagas ativas de todas as empresas
        const response = await client.entities.job_postings.queryAll({
            query: { is_active: true },
            limit: 50,
            sort: '-created_at'
        });
        jobs = getItems(response);
        
        // Buscar currículo do usuário
        const resumeResponse = await client.entities.resumes.query({ query: {}, limit: 1, sort: '-updated_at' });
        const resumeItems = getItems(resumeResponse);
        if (resumeItems.length > 0) {
            userResume = resumeItems[0];
        }
    } catch (error) {
        console.error('Error loading jobs:', error);
    }
    
    app.innerHTML = `
        <div class="list-page">
            <header class="dashboard-header">
                <div class="container">
                    <div class="header-content">
                        <h1 class="logo">Trombini Carreiras</h1>
                        <nav class="nav">
                            <a href="/candidate-dashboard" data-link class="nav-link">Dashboard</a>
                            <a href="/resume-form" data-link class="nav-link">Meu Currículo</a>
                            <a href="/jobs-list" data-link class="nav-link active">Vagas</a>
                            <a href="/applications" data-link class="nav-link">Candidaturas</a>
                        </nav>
                    </div>
                </div>
            </header>
            
            <div class="list-content">
                <div class="container">
                    <div class="list-header">
                        <h2>Vagas Disponíveis</h2>
                        <div class="filters">
                            <input type="text" id="searchInput" placeholder="Buscar por título ou habilidades..." class="search-input">
                            <input type="text" id="locationFilter" placeholder="Localização..." class="search-input">
                        </div>
                    </div>
                    
                    ${!userResume ? `
                        <div class="alert alert-warning">
                            <p>⚠️ Você precisa criar seu currículo antes de se candidatar a vagas.</p>
                            <a href="/resume-form" data-link class="btn btn-primary">Criar Currículo</a>
                        </div>
                    ` : ''}
                    
                    <div id="jobsGrid" class="jobs-grid">
                        ${jobs.length > 0 ? jobs.map(job => `
                            <div class="job-card" data-title="${job.title.toLowerCase()}" data-skills="${job.skills_required?.toLowerCase() || ''}" data-location="${job.location?.toLowerCase() || ''}">
                                <h3>${job.title}</h3>
                                <p class="job-location">📍 ${job.location || 'Não especificado'}</p>
                                <p class="job-description">${job.description.substring(0, 150)}...</p>
                                <div class="job-skills">
                                    ${job.skills_required ? job.skills_required.split(',').slice(0, 3).map(skill => 
                                        `<span class="skill-tag">${skill.trim()}</span>`
                                    ).join('') : ''}
                                </div>
                                <div class="job-footer">
                                    <button class="btn btn-secondary" onclick="viewJobDetails(${job.id})">Ver Detalhes</button>
                                    ${userResume ? `<button class="btn btn-primary" onclick="applyToJob(${job.id})">Candidatar-se</button>` : ''}
                                </div>
                            </div>
                        `).join('') : '<p class="empty-state">Nenhuma vaga disponível no momento.</p>'}
                    </div>
                </div>
            </div>
            
            <div id="jobModal" class="modal" style="display: none;">
                <div class="modal-content">
                    <span class="modal-close" onclick="closeModal()">&times;</span>
                    <div id="jobModalContent"></div>
                </div>
            </div>
        </div>
    `;
    
    // Filtros
    const searchInput = document.getElementById('searchInput');
    const locationFilter = document.getElementById('locationFilter');
    
    const filterJobs = () => {
        const searchTerm = searchInput.value.toLowerCase();
        const locationTerm = locationFilter.value.toLowerCase();
        const jobCards = document.querySelectorAll('.job-card');
        
        jobCards.forEach(card => {
            const title = card.dataset.title;
            const skills = card.dataset.skills;
            const location = card.dataset.location;
            
            const matchesSearch = !searchTerm || title.includes(searchTerm) || skills.includes(searchTerm);
            const matchesLocation = !locationTerm || location.includes(locationTerm);
            
            card.style.display = matchesSearch && matchesLocation ? 'block' : 'none';
        });
    };
    
    searchInput.addEventListener('input', filterJobs);
    locationFilter.addEventListener('input', filterJobs);
    
    window.viewJobDetails = (jobId) => {
        const job = jobs.find(j => j.id === jobId);
        if (!job) return;
        
        const modal = document.getElementById('jobModal');
        const modalContent = document.getElementById('jobModalContent');
        
        modalContent.innerHTML = `
            <h2>${job.title}</h2>
            <p class="job-location">📍 ${job.location || 'Não especificado'}</p>
            <div class="job-details">
                <h3>Descrição</h3>
                <p>${job.description}</p>
                
                <h3>Requisitos</h3>
                <p>${job.requirements || 'Não especificado'}</p>
                
                <h3>Habilidades Necessárias</h3>
                <p>${job.skills_required || 'Não especificado'}</p>
                
                <h3>Contato</h3>
                <p>${job.contact_info || 'Não especificado'}</p>
            </div>
            ${userResume ? `<button class="btn btn-primary btn-block" onclick="applyToJob(${job.id})">Candidatar-se a esta Vaga</button>` : ''}
        `;
        
        modal.style.display = 'flex';
    };
    
    window.closeModal = () => {
        document.getElementById('jobModal').style.display = 'none';
    };
    
    window.applyToJob = async (jobId) => {
        if (!userResume) {
            alert('Você precisa criar seu currículo antes de se candidatar.');
            return;
        }
        
        try {
            // Verificar se já se candidatou
            const existingApp = await client.entities.applications.query({
                query: { job_id: jobId, resume_id: userResume.id },
                limit: 1
            });
            
            if (getItems(existingApp).length > 0) {
                alert('Você já se candidatou a esta vaga!');
                return;
            }
            
            await client.entities.applications.create({
                data: {
                    user_id: APP_STATE.currentUser.id,
                    job_id: jobId,
                    resume_id: userResume.id,
                    status: 'pending',
                    applied_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
                    updated_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
                }
            });
            
            alert('Candidatura enviada com sucesso!');
            window.closeModal();
        } catch (error) {
            console.error('Error applying to job:', error);
            alert('Erro ao enviar candidatura. Por favor, tente novamente.');
        }
    };
}
