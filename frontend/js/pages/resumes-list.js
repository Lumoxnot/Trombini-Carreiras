import { client } from '../config.js';
import { PDFGenerator } from '../utils/pdf-generator.js';

function getItems(response) {
    if (Array.isArray(response?.data?.data?.items)) return response.data.data.items;
    if (Array.isArray(response?.data?.items)) return response.data.items;
    if (Array.isArray(response?.items)) return response.items;
    return [];
}

function parseDate(value) {
    if (!value) return 0;
    const timestamp = new Date(value).getTime();
    return Number.isNaN(timestamp) ? 0 : timestamp;
}

function pickLatestResumePerUser(allResumes) {
    const latestByUser = new Map();

    allResumes.forEach((resume) => {
        const userId = resume?.user_id;
        if (!userId) return;

        const current = latestByUser.get(userId);
        if (!current) {
            latestByUser.set(userId, resume);
            return;
        }

        const currentTime = parseDate(current.updated_at || current.created_at);
        const nextTime = parseDate(resume.updated_at || resume.created_at);
        if (nextTime >= currentTime) {
            latestByUser.set(userId, resume);
        }
    });

    return Array.from(latestByUser.values())
        .filter((resume) => resume.is_published)
        .sort((a, b) => parseDate(b.updated_at || b.created_at) - parseDate(a.updated_at || a.created_at));
}

export async function renderResumesList() {
    const app = document.getElementById('app');

    let resumes = [];

    try {
        // Busca todos e mantém apenas o currículo mais recente de cada candidato.
        const response = await client.entities.resumes.queryAll({
            query: {},
            limit: 500,
            sort: '-updated_at'
        });
        const allResumes = getItems(response);
        resumes = pickLatestResumePerUser(allResumes);
    } catch (error) {
        console.error('Error loading resumes:', error);
    }

    app.innerHTML = `
        <div class="list-page">
            <header class="dashboard-header">
                <div class="container">
                    <div class="header-content">
                        <h1 class="logo">Trombini Carreiras</h1>
                        <nav class="nav">
                            <a href="/company-dashboard" data-link class="nav-link">Dashboard</a>
                            <a href="/job-form" data-link class="nav-link">Criar Vaga</a>
                            <a href="/resumes-list" data-link class="nav-link active">Currículos</a>
                            <a href="/applications" data-link class="nav-link">Candidaturas</a>
                        </nav>
                    </div>
                </div>
            </header>

            <div class="list-content">
                <div class="container">
                    <div class="list-header">
                        <h2>Currículos Disponíveis</h2>
                        <div class="filters">
                            <input type="text" id="searchInput" placeholder="Buscar por nome ou habilidades..." class="search-input">
                            <input type="text" id="experienceFilter" placeholder="Filtrar por experiência..." class="search-input">
                        </div>
                    </div>

                    <div id="resumesGrid" class="resumes-grid">
                        ${resumes.length > 0 ? resumes.map((resume) => `
                            <div class="resume-card" data-name="${resume.full_name.toLowerCase()}" data-skills="${resume.skills?.toLowerCase() || ''}" data-experience="${resume.experience?.toLowerCase() || ''}">
                                <div class="resume-header">
                                    <h3>${resume.full_name}</h3>
                                    <span class="resume-age">${resume.age} anos</span>
                                </div>
                                <p class="resume-education">${resume.education}</p>
                                <div class="resume-skills">
                                    ${resume.skills ? resume.skills.split(',').slice(0, 4).map((skill) =>
                                        `<span class="skill-tag">${skill.trim()}</span>`
                                    ).join('') : ''}
                                </div>
                                <div class="resume-footer">
                                    <button class="btn btn-secondary" onclick="viewResumeDetails(${resume.id})">Ver Detalhes</button>
                                    <button class="btn btn-success" onclick="downloadResumePDF(${resume.id})">Baixar PDF</button>
                                    <button class="btn btn-primary" onclick="contactCandidate('${resume.contact_email}', '${resume.contact_phone}')">Contatar</button>
                                </div>
                            </div>
                        `).join('') : '<p class="empty-state">Nenhum currículo publicado no momento.</p>'}
                    </div>
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

    const searchInput = document.getElementById('searchInput');
    const experienceFilter = document.getElementById('experienceFilter');

    const filterResumes = () => {
        const searchTerm = searchInput.value.toLowerCase();
        const experienceTerm = experienceFilter.value.toLowerCase();
        const resumeCards = document.querySelectorAll('.resume-card');

        resumeCards.forEach((card) => {
            const name = card.dataset.name;
            const skills = card.dataset.skills;
            const experience = card.dataset.experience;

            const matchesSearch = !searchTerm || name.includes(searchTerm) || skills.includes(searchTerm);
            const matchesExperience = !experienceTerm || experience.includes(experienceTerm);

            card.style.display = matchesSearch && matchesExperience ? 'block' : 'none';
        });
    };

    searchInput.addEventListener('input', filterResumes);
    experienceFilter.addEventListener('input', filterResumes);

    window.downloadResumePDF = (resumeId) => {
        const resume = resumes.find((r) => String(r.id) === String(resumeId));
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

    window.viewResumeDetails = (resumeId) => {
        const resume = resumes.find((r) => String(r.id) === String(resumeId));
        if (!resume) return;

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
                <p>${resume.contact_email}</p>
                <p>${resume.contact_phone}</p>
            </div>

            <div class="modal-actions">
                <button class="btn btn-success" onclick="downloadResumePDF(${resume.id})">Baixar PDF</button>
                <button class="btn btn-primary" onclick="contactCandidate('${resume.contact_email}', '${resume.contact_phone}')">Entrar em Contato</button>
            </div>
        `;

        modal.style.display = 'flex';
    };

    window.closeModal = () => {
        document.getElementById('resumeModal').style.display = 'none';
    };

    window.contactCandidate = (email, phone) => {
        const modal = document.getElementById('resumeModal');
        const modalContent = document.getElementById('resumeModalContent');

        modalContent.innerHTML = `
            <h2>Entrar em Contato</h2>
            <div class="contact-options">
                <a href="mailto:${email}" class="contact-button">
                    <span class="icon">Email</span>
                    <span>Enviar E-mail</span>
                    <span class="contact-info">${email}</span>
                </a>
                <a href="https://wa.me/${phone.replace(/\D/g, '')}" target="_blank" class="contact-button">
                    <span class="icon">WhatsApp</span>
                    <span>WhatsApp</span>
                    <span class="contact-info">${phone}</span>
                </a>
            </div>
        `;

        modal.style.display = 'flex';
    };
}
