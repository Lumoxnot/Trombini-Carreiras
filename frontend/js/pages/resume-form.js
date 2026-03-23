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
                            
                            <div class="form-group">
                                <label for="age">Data de Nascimento *</label>
                                <input type="date" id="age" name="age" required
                                value="${existingResume?.age || ''}">
                            </div>

                            <div class="form-group">
                                <label for="objective">Objetivo profissional *</label>
                                <textarea style="resize: none;" id="objective" name="objective" rows="3" required
                                    placeholder="Ex: Busco uma vaga na área de atendimento ao cliente, com foco em qualidade e satisfação do público.">${existingResume?.objective || existingResume?.summary || ''}</textarea>
                            </div>
                            
                            <div class="form-group">
                                <label for="resumo">Resumo profissional *</label>
                                <textarea style="resize: none;" id="resumo" name="resumo" rows="3" required
                                    placeholder="Ex: Profissional dedicado, com facilidade de aprendizado e bom relacionamento em equipe.">${existingResume?.resumo || existingResume?.summary || ''}</textarea>
                            </div>
                            <div class="form-group">
                                <label for="education">Formação Acadêmica *</label>
                                <textarea style="resize: none;" id="education" name="education" rows="3" required 
                                    placeholder="Ex: Ensino Médio em andamento — Escola Exemplo
                                    Previsão de conclusão: 2026">${existingResume?.education || ''}</textarea>
                            </div>
                            
                            <div class="form-group">
                                <label for="curse">Cursos *</label>
                                <textarea style="resize: none;" id="curse" name="curse" rows="3"  
                                    placeholder="Curso de Vendas — Escola Profissionalizante Exemplo
2022">${existingResume?.curse || ''}</textarea>
                            </div>

                            <div class="form-group">
                                <label for="experience">Experiência Profissional *</label>
                                <textarea style="resize: none;" id="experience" name="experience" rows="6" required 
                                    placeholder="Descreva suas experiências profissionais anteriores...">${existingResume?.experience || ''}</textarea>
                            </div>
                            
                            
                            <div class="form-group">
                                <label for="skills">Habilidades *</label>
                                <textarea style="resize: none;" id="skills" name="skills" rows="3" required 
                                    placeholder="Ex: JavaScript, React, Comunicação, Trabalho em equipe">${existingResume?.skills || ''}</textarea>
                            </div>
                            
                            <div class="form-group">
                                <label for="language">Idiomas *</label>
                                <textarea style="resize: none;" id="language" name="language" rows="3"  
                                    placeholder="Ex: Inglês — básico/intermediário/avançado">${existingResume?.language || ''}</textarea>
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
    const input = document.getElementById("skills");

input.addEventListener("keydown", (e) => {
  if (e.key === " ") {
    e.preventDefault(); // impede o espaço

    let value = input.value;

    // adiciona vírgula só se não tiver já no final
    if (!value.endsWith(", ")) {
      input.value += ", ";
    }
  }
});

    const form = document.getElementById('resumeForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const resumeData = {
            full_name: formData.get('full_name'),
            age: formData.get('age'),
            objective: formData.get('objective'),
            education: formData.get('education'),
            experience: formData.get('experience'),
            skills: formData.get('skills'),
            contact_email: formData.get('contact_email'),
            contact_phone: formData.get('contact_phone'),
            curse: formData.get('curse'),
            language: formData.get('language'),
            resumo: formData.get('resumo'),
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
