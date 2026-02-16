import { client, APP_STATE } from '../config.js';
import { PDFGenerator } from '../utils/pdf-generator.js';

function getItems(response) {
    if (Array.isArray(response?.data?.data?.items)) return response.data.data.items;
    if (Array.isArray(response?.data?.items)) return response.data.items;
    if (Array.isArray(response?.items)) return response.items;
    return [];
}

function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

async function requestApi(url, { method = 'GET', body } = {}) {
    const response = await fetch(url, {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders()
        },
        body: body ? JSON.stringify(body) : undefined
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data?.message || data?.error || `Erro HTTP ${response.status}`);
    }

    return data;
}

export async function renderApplications() {
    const app = document.getElementById('app');
    
    const isCandidate = APP_STATE.userProfile?.user_type === 'candidate';
    let applications = [];
    let jobs = {};
    let resumes = {};
    
    try {
        if (isCandidate) {
            // Candidato vê suas próprias candidaturas
            const response = await client.entities.applications.query({
                query: {},
                limit: 50,
                sort: '-applied_at'
            });
            applications = getItems(response);
            
            // Buscar detalhes das vagas
            for (const app of applications) {
                if (!jobs[app.job_id]) {
                    try {
                        const jobResponse = await client.entities.job_postings.get({ id: app.job_id });
                        jobs[app.job_id] = jobResponse.data;
                    } catch (error) {
                        console.error(`Error loading job ${app.job_id}:`, error);
                    }
                }
            }
        } else {
            // Empresa vê candidaturas para suas vagas
            const jobsResponse = await client.entities.job_postings.query({ query: {}, limit: 100 });
            const companyJobs = getItems(jobsResponse);
            
            for (const job of companyJobs) {
                jobs[job.id] = job;
            }
            
            const appsResponse = await client.entities.applications.queryAll({
                query: {},
                limit: 100,
                sort: '-applied_at'
            });
            
            // Filtrar apenas candidaturas para vagas da empresa
            applications = getItems(appsResponse).filter(app => jobs[app.job_id]);
            
            // Buscar currículos dos candidatos
            for (const app of applications) {
                if (!resumes[app.resume_id]) {
                    try {
                        const resumeResponse = await requestApi(`/api/v1/resumes/${app.resume_id}`);
                        resumes[app.resume_id] = resumeResponse?.data || null;
                    } catch (error) {
                        console.error(`Error loading resume ${app.resume_id}:`, error);
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error loading applications:', error);
    }
    
    app.innerHTML = `
        <div class="list-page">
            <header class="dashboard-header">
                <div class="container">
                    <div class="header-content">
                        <h1 class="logo">Trombini Carreiras</h1>
                        <nav class="nav">
                            ${isCandidate ? `
                                <a href="/candidate-dashboard" data-link class="nav-link">Dashboard</a>
                                <a href="/resume-form" data-link class="nav-link">Meu Currículo</a>
                                <a href="/jobs-list" data-link class="nav-link">Vagas</a>
                                <a href="/applications" data-link class="nav-link active">Candidaturas</a>
                            ` : `
                                <a href="/company-dashboard" data-link class="nav-link">Dashboard</a>
                                <a href="/job-form" data-link class="nav-link">Criar Vaga</a>
                                <a href="/resumes-list" data-link class="nav-link">Currículos</a>
                                <a href="/applications" data-link class="nav-link active">Candidaturas</a>
                            `}
                        </nav>
                    </div>
                </div>
            </header>
            
            <div class="list-content">
                <div class="container">
                    <h2 class="page-title">${isCandidate ? 'Minhas Candidaturas' : 'Candidaturas Recebidas'}</h2>
                    
                    ${applications.length > 0 ? `
                        <div class="applications-list">
                            ${applications.map(app => {
                                const job = jobs[app.job_id];
                                const resume = resumes[app.resume_id];
                                
                                return `
                                    <div class="application-card">
                                        <div class="application-info">
                                            ${isCandidate ? `
                                                <h3>${job?.title || 'Vaga não encontrada'}</h3>
                                                <p class="application-detail">📍 ${job?.location || 'N/A'}</p>
                                            ` : `
                                                <h3>${resume?.full_name || 'Candidato'}</h3>
                                                <p class="application-detail">Vaga: ${job?.title || 'N/A'}</p>
                                                <p class="application-detail">📧 ${resume?.contact_email || 'N/A'}</p>
                                            `}
                                            <p class="application-date">Candidatura enviada em ${new Date(app.applied_at).toLocaleDateString('pt-BR')}</p>
                                        </div>
                                        <div class="application-actions">
                                            <span class="status-badge ${app.status}">${getStatusText(app.status)}</span>
                                            ${!isCandidate && app.status === 'pending' ? `
                                                <button class="btn btn-small btn-success" onclick="updateApplicationStatus(${app.id}, 'approved')">Aprovar</button>
                                                <button class="btn btn-small btn-danger" onclick="updateApplicationStatus(${app.id}, 'rejected')">Rejeitar</button>
                                            ` : ''}
                                            ${!isCandidate ? `
                                                <button class="btn btn-small btn-secondary" onclick="viewResumeDetails(${app.resume_id})">Ver Currículo</button>
                                                <button class="btn btn-small btn-success" onclick="downloadResumePDF(${app.resume_id})">📥 PDF</button>
                                            ` : ''}
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    ` : `
                        <p class="empty-state">${isCandidate ? 'Você ainda não se candidatou a nenhuma vaga.' : 'Nenhuma candidatura recebida ainda.'}</p>
                    `}
                </div>
            </div>
            
            <div id="resumeModal" class="modal" style="display: none;">
                <div class="modal-content">
                    <span class="modal-close" onclick="closeModal()">&times;</span>
                    <div id="resumeModalContent"></div>
                </div>
            </div>
        </div>
    `;
    
    function getStatusText(status) {
        const statusMap = {
            'pending': 'Pendente',
            'approved': 'Aprovado',
            'rejected': 'Rejeitado'
        };
        return statusMap[status] || status;
    }
    
    window.downloadResumePDF = (resumeId) => {
        const resume = resumes[resumeId];
        if (!resume) {
            alert('Currículo não encontrado.');
            return;
        }
        
        try {
            PDFGenerator.generateResumePDF(resume);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Erro ao gerar PDF. Por favor, tente novamente.');
        }
    };
    
    window.updateApplicationStatus = async (appId, newStatus) => {
        try {
            await requestApi(`/api/v1/applications/${appId}/status`, {
                method: 'PATCH',
                body: { status: newStatus }
            });

            alert(`Candidatura ${newStatus === 'approved' ? 'aprovada' : 'rejeitada'} com sucesso!`);
            location.reload();
        } catch (error) {
            console.error('Error updating application:', error);
            alert('Erro ao atualizar candidatura. Por favor, tente novamente.');
        }
    };

    window.viewResumeDetails = (resumeId) => {
        const resume = resumes[resumeId];
        if (!resume) {
            alert('Curriculo nao encontrado.');
            return;
        }
        
        const modal = document.getElementById('resumeModal');
        const modalContent = document.getElementById('resumeModalContent');
        
        modalContent.innerHTML = `
            <h2>${resume.full_name}</h2>
            <p class="resume-age">${resume.age} anos</p>
            
            <div class="resume-details">
                <h3>Resumo/Objetivo</h3>
                <p>${resume.objective || 'Nao informado'}</p>
                <h3>Formação Acadêmica</h3>
                <p>${resume.education}</p>
                
                <h3>Experiência Profissional</h3>
                <p>${resume.experience}</p>
                
                <h3>Habilidades</h3>
                <p>${resume.skills}</p>
                
                <h3>Contato</h3>
                <p>📧 ${resume.contact_email}</p>
                <p>📱 ${resume.contact_phone}</p>
            </div>
            
            <div class="modal-actions">
                <button class="btn btn-success" onclick="downloadResumePDF(${resume.id})">📥 Baixar PDF</button>
                <a href="mailto:${resume.contact_email}" class="btn btn-secondary">Enviar E-mail</a>
                <a href="https://wa.me/${resume.contact_phone.replace(/\D/g, '')}" target="_blank" class="btn btn-primary">WhatsApp</a>
            </div>
        `;
        
        modal.style.display = 'flex';
    };
    
    window.closeModal = () => {
        document.getElementById('resumeModal').style.display = 'none';
    };
}
