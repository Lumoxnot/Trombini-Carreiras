import { APP_STATE } from '../config.js';
import { Router } from '../router.js';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "https://trombini-carreiras.onrender.com").replace(/\/+$/, "");

function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

async function fetchEntityById(entity, id) {
    const response = await fetch(`${API_BASE_URL}/api/v1/entities/${entity}/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders()
        }
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data?.error || 'Erro ao carregar entidade');
    }

    return data?.data || null;
}

async function createEntity(entity, payload) {
    const response = await fetch(`${API_BASE_URL}/api/v1/entities/${entity}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders()
        },
        body: JSON.stringify(payload)
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data?.error || 'Erro ao criar entidade');
    }

    return data?.data || null;
}

async function updateEntity(entity, id, payload) {
    const response = await fetch(`${API_BASE_URL}/api/v1/entities/${entity}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders()
        },
        body: JSON.stringify(payload)
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data?.error || 'Erro ao atualizar entidade');
    }

    return data?.data || null;
}

export async function renderJobForm() {
    const app = document.getElementById('app');
    
    // Verificar se está editando
    const urlParams = new URLSearchParams(window.location.search);
    const jobId = urlParams.get('id');
    let existingJob = null;
    
    if (jobId) {
        try {
            existingJob = await fetchEntityById('job_postings', parseInt(jobId, 10));
        } catch (error) {
            console.error('Error loading job:', error);
        }
    }
    
    app.innerHTML = `
        <div class="form-page">
            <header class="dashboard-header">
                <div class="container">
                    <div class="header-content">
                        <h1 class="logo">Trombini Carreiras</h1>
                        <nav class="nav">
                            <a href="/company-dashboard" data-link class="nav-link">Dashboard</a>
                            <a href="/job-form" data-link class="nav-link active">Criar Vaga</a>
                            <a href="/resumes-list" data-link class="nav-link">Currículos</a>
                            <a href="/applications" data-link class="nav-link">Candidaturas</a>
                        </nav>
                    </div>
                </div>
            </header>
            
            <div class="form-content">
                <div class="container">
                    <div class="form-card">
                        <h2>${existingJob ? 'Editar' : 'Criar'} Vaga</h2>
                        
                        <form id="jobForm" class="job-form">
                            <div class="form-group">
                                <label for="title">Título da Vaga *</label>
                                <input type="text" id="title" name="title" required
                                    placeholder="Ex: Desenvolvedor Full Stack"
                                    value="${existingJob?.title || ''}">
                            </div>
                            
                            <div class="form-group">
                                <label for="description">Descrição da Vaga *</label>
                                <textarea id="description" name="description" rows="5" required
                                    placeholder="Descreva as responsabilidades e o que a empresa oferece...">${existingJob?.description || ''}</textarea>
                            </div>
                            
                            <div class="form-group">
                                <label for="requirements">Requisitos *</label>
                                <textarea id="requirements" name="requirements" rows="4" required
                                    placeholder="Liste os requisitos necessários para a vaga...">${existingJob?.requirements || ''}</textarea>
                            </div>
                            
                            <div class="form-group">
                                <label for="skills_required">Habilidades Necessárias *</label>
                                <input type="text" id="skills_required" name="skills_required" required
                                    placeholder="Ex: JavaScript, React, Node.js (separadas por vírgula)"
                                    value="${existingJob?.skills_required || ''}">
                            </div>
                            
                            <div class="form-group">
                                <label for="location">Localização *</label>
                                <input type="text" id="location" name="location" required
                                    placeholder="Ex: São Paulo - SP / Remoto"
                                    value="${existingJob?.location || ''}">
                            </div>
                            
                            <div class="form-group">
                                <label for="contact_info">Informações de Contato *</label>
                                <input type="text" id="contact_info" name="contact_info" required
                                    placeholder="E-mail ou telefone para contato"
                                    value="${existingJob?.contact_info || APP_STATE.userProfile?.email || ''}">
                            </div>
                            
                            <div class="form-group checkbox-group">
                                <label>
                                    <input type="checkbox" id="is_active" name="is_active"
                                        ${existingJob?.is_active !== false ? 'checked' : ''}>
                                    <span>Vaga ativa (visível para candidatos)</span>
                                </label>
                            </div>
                            
                            <div class="form-actions">
                                <button type="button" class="btn btn-secondary" onclick="history.back()">Cancelar</button>
                                <button type="submit" class="btn btn-primary">${existingJob ? 'Atualizar' : 'Publicar'} Vaga</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    const form = document.getElementById('jobForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const jobData = {
            title: formData.get('title'),
            description: formData.get('description'),
            requirements: formData.get('requirements'),
            skills_required: formData.get('skills_required'),
            location: formData.get('location'),
            contact_info: formData.get('contact_info'),
            is_active: formData.get('is_active') === 'on',
            updated_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
        };
        
        try {
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Salvando...';
            
            if (existingJob) {
                await updateEntity('job_postings', existingJob.id, jobData);
            } else {
                jobData.user_id = APP_STATE.currentUser.id;
                jobData.created_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
                await createEntity('job_postings', jobData);
            }
            
            alert('Vaga salva com sucesso!');
            Router.navigateTo('/company-dashboard');
        } catch (error) {
            console.error('Error saving job:', error);
            alert('Erro ao salvar vaga. Por favor, tente novamente.');
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.disabled = false;
            submitBtn.textContent = existingJob ? 'Atualizar Vaga' : 'Publicar Vaga';
        }
    });
}
