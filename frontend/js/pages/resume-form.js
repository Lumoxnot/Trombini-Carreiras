import { client, APP_STATE } from '../config.js';
import { Router } from '../router.js';

function getItems(response) {
    if (Array.isArray(response?.data?.data?.items)) return response.data.data.items;
    if (Array.isArray(response?.data?.items)) return response.data.items;
    if (Array.isArray(response?.items)) return response.items;
    return [];
}

function getErrorMessage(error) {
    return (
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        'Erro inesperado'
    );
}

async function fetchLatestResume() {
    try {
        const response = await client.entities.resumes.query({
            query: {},
            limit: 50,
            sort: '-updated_at'
        });
        const resumeItems = getItems(response);
        return resumeItems.length > 0 ? resumeItems[0] : null;
    } catch (error) {
        // Fallback para ambientes sem a coluna updated_at.
        const response = await client.entities.resumes.query({
            query: {},
            limit: 50
        });
        const resumeItems = getItems(response);
        return resumeItems.length > 0 ? resumeItems[0] : null;
    }
}

export async function renderResumeForm() {
    const app = document.getElementById('app');
    
    // Verificar se já existe currículo
    let existingResume = null;
    try {
        existingResume = await fetchLatestResume();
    } catch (error) {
        console.error('Error loading resume:', error);
    }
    
    app.innerHTML = `
        <div class="form-page">
            <header class="dashboard-header">
                <div class="container">
                    <div class="header-content">
                        <h1 class="logo">Trombini Carreiras</h1>
                        <nav class="nav">
                            <a href="/candidate-dashboard" data-link class="nav-link">Dashboard</a>
                            <a href="/resume-form" data-link class="nav-link active">Meu Currículo</a>
                            <a href="/jobs-list" data-link class="nav-link">Vagas</a>
                            <a href="/applications" data-link class="nav-link">Candidaturas</a>
                        </nav>
                    </div>
                </div>
            </header>
            
            <div class="form-content">
                <div class="container">
                    <div class="form-card">
                        <h2>${existingResume ? 'Editar' : 'Criar'} Currículo</h2>
                        
                        <form id="resumeForm" class="resume-form">
                            <div class="form-group">
                                <label for="full_name">Nome Completo *</label>
                                <input type="text" id="full_name" name="full_name" required 
                                    value="${existingResume?.full_name || APP_STATE.userProfile?.full_name || ''}">
                            </div>
                            
                            <div class="form-group">
                                <label for="age">Idade *</label>
                                <input type="number" id="age" name="age" required min="16" max="100"
                                    value="${existingResume?.age || ''}">
                            </div>

                            <div class="form-group">
                                <label for="objective">Resumo/Objetivo *</label>
                                <textarea id="objective" name="objective" rows="3" required
                                    placeholder="Ex: Profissional com foco em desenvolvimento web, buscando atuar em projetos escalaveis e de alto impacto.">${existingResume?.objective || ''}</textarea>
                            </div>
                            
                            <div class="form-group">
                                <label for="education">Formação Acadêmica *</label>
                                <textarea id="education" name="education" rows="3" required 
                                    placeholder="Ex: Bacharelado em Administração - Universidade XYZ (2018-2022)">${existingResume?.education || ''}</textarea>
                            </div>
                            
                            <div class="form-group">
                                <label for="experience">Experiência Profissional *</label>
                                <textarea id="experience" name="experience" rows="5" required 
                                    placeholder="Descreva suas experiências profissionais anteriores...">${existingResume?.experience || ''}</textarea>
                            </div>
                            
                            <div class="form-group">
                                <label for="skills">Habilidades *</label>
                                <textarea id="skills" name="skills" rows="3" required 
                                    placeholder="Ex: JavaScript, React, Comunicação, Trabalho em equipe">${existingResume?.skills || ''}</textarea>
                            </div>
                            
                            <div class="form-group">
                                <label for="contact_email">E-mail de Contato *</label>
                                <input type="email" id="contact_email" name="contact_email" required
                                    value="${existingResume?.contact_email || APP_STATE.userProfile?.email || ''}">
                            </div>
                            
                            <div class="form-group">
                                <label for="contact_phone">Telefone de Contato *</label>
                                <input type="tel" id="contact_phone" name="contact_phone" required
                                    placeholder="(00) 00000-0000"
                                    value="${existingResume?.contact_phone || APP_STATE.userProfile?.phone || ''}">
                            </div>
                            
                            <div class="form-group checkbox-group">
                                <label>
                                    <input type="checkbox" id="is_published" name="is_published" 
                                        ${existingResume?.is_published ? 'checked' : ''}>
                                    <span>Publicar currículo (empresas poderão visualizar)</span>
                                </label>
                            </div>
                            
                            <div class="form-actions">
                                <button type="button" class="btn btn-secondary" onclick="history.back()">Cancelar</button>
                                <button type="submit" class="btn btn-primary">Salvar Currículo</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    const form = document.getElementById('resumeForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const resumeData = {
            full_name: formData.get('full_name'),
            age: parseInt(formData.get('age')),
            objective: formData.get('objective'),
            education: formData.get('education'),
            experience: formData.get('experience'),
            skills: formData.get('skills'),
            contact_email: formData.get('contact_email'),
            contact_phone: formData.get('contact_phone'),
            is_published: formData.get('is_published') === 'on'
        };
        
        try {
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Salvando...';

            // Revalida antes de salvar para evitar criar currículo duplicado.
            const latestResume = await fetchLatestResume();
            const resumeToUpdate = latestResume || existingResume;
            
            if (resumeToUpdate) {
                await client.entities.resumes.update({
                    id: resumeToUpdate.id,
                    data: resumeData
                });
            } else {
                try {
                    await client.entities.resumes.create({ data: resumeData });
                } catch (createError) {
                    // Fallback para produção: alguns ambientes retornam 500 no insert quando já existe registro.
                    const existingAfterCreateFailure = await fetchLatestResume();
                    if (!existingAfterCreateFailure?.id) {
                        throw createError;
                    }

                    await client.entities.resumes.update({
                        id: existingAfterCreateFailure.id,
                        data: resumeData
                    });
                }
            }
            
            alert('Currículo salvo com sucesso!');
            Router.navigateTo('/candidate-dashboard');
        } catch (error) {
            console.error('Error saving resume:', error);
            alert(`Erro ao salvar currículo. ${getErrorMessage(error)}`);
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Salvar Currículo';
        }
    });
}
