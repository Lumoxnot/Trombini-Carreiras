import { jsPDF } from 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/+esm';

export class PDFGenerator {
    static generateResumePDF(resume) {
        const doc = new jsPDF({ unit: 'mm', format: 'a4' });
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        // === PALETA DE CORES SOFISTICADA ===
        const colors = {
            primaryDark: [25, 35, 50],     // Azul escuro quase preto para títulos e texto principal
            primaryBlue: [30, 58, 138],    // Azul médio para destaques e ícones
            accentBlue:  [59, 130, 246],   // Azul vibrante para acentos e barras de progresso
            lightBlue:   [220, 235, 255],  // Azul muito claro para tags e fundos sutis
            white:       [255, 255, 255],
            grayDark:    [70, 80, 90],     // Cinza escuro para texto secundário
            grayMedium:  [150, 160, 170],  // Cinza médio para divisores e texto discreto
            grayLight:   [245, 248, 250],  // Cinza claríssimo para fundo da sidebar e rodapé
            headerBg:    [15, 23, 42],     // Fundo do cabeçalho
        };

        // === DIMENSOES E MARGENS ===
        const marginX = 10;
        const marginY = 10;
        const leftColW = 68; // Largura da coluna lateral
        const rightColX = leftColW + marginX; // Início da coluna principal
        const rightColW = pageWidth - rightColX - marginX; // Largura da coluna principal
        const headerH = 50; // Altura do cabeçalho
        let yLeft = headerH + marginY; // Posição Y inicial da coluna esquerda
        let yRight = headerH + marginY; // Posição Y inicial da coluna direita
        let currentPage = 1;

        // === UTILITARIOS ===
        const safe = (v) => String(v || '').trim();

        const fullName   = safe(resume?.full_name)    || 'Candidato';
        const jobTitle   = safe(resume?.job_title) || 'Profissional'; // Corrigido para usar apenas job_title
        const age        = safe(resume?.age);
        const email      = safe(resume?.contact_email)  || '';
        const phone      = safe(resume?.contact_phone)  || '';
        const location   = safe(resume?.location || resume?.city) || '';
        const linkedin   = safe(resume?.linkedin)       || '';
        const objective  = safe(resume?.objective || resume?.summary) || ''; // Não mais 'Nao informado.' para permitir controle no "Sobre Mim"
        const resumo     = safe(resume?.resumo)         || ''; // Não mais 'Nao informado.' para permitir controle no "Sobre Mim"
        const education  = safe(resume?.education)      || 'Nao informado.';
        const curse      = safe(resume?.curse)          || '';
        const experience = safe(resume?.experience)     || 'Nao informado.';
        const language   = safe(resume?.language)       || 'Portugues - Nativo';
        const projects   = safe(resume?.projects)       || '';
        const skills     = safe(resume?.skills)
            .split(/[,;|\n]/)
            .map(s => s.trim())
            .filter(Boolean);

        const setColor = (color) => doc.setTextColor(...color);
        const setFill  = (color) => doc.setFillColor(...color);
        const setDraw  = (color) => doc.setDrawColor(...color);

        // ======================================================
        // FUNCOES DE DESENHO
        // ======================================================

        const drawHeader = () => {

    // Fundo escuro do header
    setFill(colors.headerBg);
    doc.rect(0, 0, pageWidth, headerH, 'F');

    // Barra lateral azul
    setFill(colors.accentBlue);
    doc.rect(0, 0, 4, headerH, 'F');

    // =========================
    // NOME
    // =========================

    setColor(colors.white);
    doc.setFont('helvetica', 'bold');

    let nameFontSize = 28;

    if (fullName.length > 22) {
        nameFontSize = 24;
    }

    if (fullName.length > 30) {
        nameFontSize = 20;
    }

    if (fullName.length > 40) {
        nameFontSize = 16;
    }

    doc.setFontSize(nameFontSize);

    const maxNameWidth = pageWidth - 65;

    const nameLines = doc.splitTextToSize(
        fullName.toUpperCase(),
        maxNameWidth
    );

    // SUBIU O NOME
    doc.text(nameLines, marginX + 5, 18);

    // =========================
    // CARGO
    // =========================

    setColor(colors.accentBlue);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);

    // SUBIU O SUBTÍTULO
    const jobTitleY =
        25 + ((nameLines.length - 1) * 6);

    doc.text(
        jobTitle,
        marginX + 5,
        jobTitleY
    );

    // =========================
    // LINHA DIVISÓRIA
    // =========================

    const dividerY = jobTitleY + 3;

    setDraw([60, 80, 120]);

    doc.line(
        marginX + 5,
        dividerY,
        pageWidth - marginX,
        dividerY
    );

    // =========================
    // CONTATOS
    // =========================

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);

    setColor([200, 215, 240]);

    const contacts = [];

    if (email) contacts.push(`Email: ${email}`);
    if (phone) contacts.push(`Tel: ${phone}`);
    if (location) contacts.push(`Local: ${location}`);
    if (linkedin) contacts.push(`LinkedIn: ${linkedin}`);

    let cx = marginX + 5;

    contacts.forEach((c, i) => {

        const w = doc.getTextWidth(c);

        if (cx + w > pageWidth - marginX) return;

        doc.text(c, cx, dividerY + 10);

        cx += w + 12;

        if (i < contacts.length - 1) {

            setColor([70, 100, 160]);

            doc.text(
                '|',
                cx - 6,
                dividerY + 10
            );

            setColor([200, 215, 240]);
        }
    });

    // =========================
    // DATA NASCIMENTO
    // =========================

    if (age) {

        let dob = age;

        try {
            dob = new Date(age).toLocaleDateString('pt-BR');
        } catch (_) {}

        setFill(colors.primaryBlue);

        doc.roundedRect(
            pageWidth - 44,
            8,
            40,
            16,
            2,
            2,
            'F'
        );

        setColor(colors.lightBlue);

        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');

        doc.text(
            'NASCIMENTO',
            pageWidth - 41,
            14
        );

        setColor(colors.white);

        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');

        doc.text(
            dob,
            pageWidth - 41,
            20
        );
    }
};

        // --- FUNDOS DAS COLUNAS ---
        const drawColumnBackgrounds = () => {
            // Barra lateral esquerda (cinza claríssimo)
            setFill(colors.grayLight);
            doc.rect(0, headerH, leftColW, pageHeight - headerH, 'F');

            // Linha divisória vertical
            setDraw(colors.grayMedium); // Cor mais suave
            doc.line(leftColW + 4, headerH + 4, leftColW + 4, pageHeight - marginY);
        };

        // --- NOVA PAGINA ---
        const addNewPage = () => {
            doc.addPage();
            currentPage++;
            drawHeader();
            drawColumnBackgrounds();
            yLeft  = headerH + marginY;
            yRight = headerH + marginY;
        };

        // --- TITULO SECAO DIREITA ---
        const drawRightSectionTitle = (title) => {
            if (yRight + 18 > pageHeight - marginY) addNewPage(); // Mais espaço para o título

            // Linha accent + texto
            setFill(colors.accentBlue);
            doc.rect(rightColX, yRight - 2, 3, 7, 'F');

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(13); // Título maior e mais impactante
            setColor(colors.primaryDark);
            doc.text(title.toUpperCase(), rightColX + 6, yRight + 3);

            // Linha divisória abaixo do título
            setDraw(colors.grayMedium); // Cor mais suave
            doc.line(rightColX, yRight + 7, rightColX + rightColW, yRight + 7);

            yRight += 14; // Aumenta o espaçamento após o título
        };

        // --- TITULO SECAO ESQUERDA ---
        const drawLeftSectionTitle = (title) => {
            if (yLeft + 16 > pageHeight - marginY) addNewPage();

            setFill(colors.primaryBlue); // Linha mais destacada
            doc.rect(marginX, yLeft - 1, leftColW - 2 * marginX, 0.8, 'F'); // Linha mais grossa

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10); // Título da sidebar
            setColor(colors.primaryDark);
            doc.text(title.toUpperCase(), marginX + 2, yLeft + 5);

            yLeft += 12;
        };

        // --- PARAGRAFO DIREITA ---
        const drawRightParagraph = (text, indent = 0) => {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10); // Tamanho de fonte padrão para legibilidade
            setColor(colors.grayDark);
            const lines = doc.splitTextToSize(text, rightColW - indent);
            const lh = 5.5; // Altura da linha

            lines.forEach((line) => {
                if (yRight + lh > pageHeight - marginY) addNewPage();
                doc.text(line, rightColX + indent, yRight);
                yRight += lh;
            });
            yRight += 4; // Espaçamento entre parágrafos
        };

        // --- PARAGRAFO ESQUERDA ---
        const drawLeftParagraph = (text) => {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9); // Tamanho de fonte para sidebar
            setColor(colors.grayDark);
            const lines = doc.splitTextToSize(text, leftColW - 2 * marginX);
            const lh = 5;

            lines.forEach((line) => {
                if (yLeft + lh > pageHeight - marginY) addNewPage();
                doc.text(line, marginX + 2, yLeft);
                yLeft += lh;
            });
            yLeft += 4;
        };

        // --- BLOCO DE EXPERIENCIA ---
        const drawExperienceBlock = (cargo, empresa, periodo, descricao) => {
            if (yRight + 30 > pageHeight - marginY) addNewPage();

            // Bolinha accent
            setFill(colors.accentBlue);
            doc.circle(rightColX + 2, yRight + 1, 1.5, 'F');

            // Cargo em destaque
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(11.5); // Cargo mais proeminente
            setColor(colors.primaryDark);
            doc.text(cargo, rightColX + 7, yRight + 2);

            // Empresa em azul médio
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            setColor(colors.primaryBlue);
            doc.text(empresa, rightColX + 7, yRight + 8);

            // Período alinhado à direita
            doc.setFont('helvetica', 'italic');
            doc.setFontSize(9);
            setColor(colors.grayDark);
            doc.text(periodo, rightColX + rightColW, yRight + 8, { align: 'right' });

            yRight += 12;

            // Descrição
            if (descricao) {
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(9.5);
                setColor(colors.grayDark);
                const lines = doc.splitTextToSize(descricao, rightColW - 10);
                const lh = 5;
                lines.forEach((line) => {
                    if (yRight + lh > pageHeight - marginY) addNewPage();
                    doc.text(line, rightColX + 7, yRight);
                    yRight += lh;
                });
            }

            // Linha separadora leve entre experiências
            setDraw(colors.grayMedium);
            doc.line(rightColX + 7, yRight + 3, rightColX + rightColW, yRight + 3);
            yRight += 9;
        };

        // --- TAGS DE HABILIDADES ---
        const drawSkillTags = () => {
            if (!skills.length) {
                drawLeftParagraph('Nao informado.');
                return;
            }

            doc.setFont('helvetica', 'normal'); // Fonte normal para tags
            doc.setFontSize(8.5);

            let currentX = marginX + 2;
            const tagHeight = 6.5;
            const tagPaddingX = 5;
            const tagSpacingX = 4;
            const tagSpacingY = 4;

            skills.forEach((skill) => {
                const label = skill; // Corrigido: Não trunca mais o texto da habilidade
                const textWidth = doc.getTextWidth(label);
                const tagWidth = textWidth + 2 * tagPaddingX;

                if (currentX + tagWidth > leftColW - marginX) { // Quebra de linha para tags
                    currentX = marginX + 2;
                    yLeft += tagHeight + tagSpacingY;
                    if (yLeft + tagHeight > pageHeight - marginY) addNewPage();
                }

                setFill(colors.lightBlue); // Fundo azul claro para tags
                doc.roundedRect(currentX, yLeft - 4.5, tagWidth, tagHeight, 2, 2, 'F'); // Cantos mais arredondados
                setColor(colors.primaryBlue); // Texto azul escuro
                doc.text(label, currentX + tagPaddingX, yLeft - 0.5);

                currentX += tagWidth + tagSpacingX;
            });

            yLeft += tagHeight + tagSpacingY;
        };

        // --- ITEM DE IDIOMA ---
        const drawLanguageItem = (lang, level) => {
            if (yLeft + 18 > pageHeight - marginY) addNewPage();

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(9.5);
            setColor(colors.primaryDark);
            doc.text(lang, marginX + 2, yLeft);

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8.5);
            setColor(colors.grayDark);
            doc.text(level, marginX + 2, yLeft + 5);

            const levelMap = {
                'nativo': 1, 'fluente': 0.9, 'avancado': 0.75, 'avançado': 0.75,
                'intermediario': 0.55, 'intermediário': 0.55, 'basico': 0.3, 'básico': 0.3,
            };
            const pct  = levelMap[level.toLowerCase()] || 0.5;
            const barW = leftColW - 2 * marginX - 4; // Largura da barra

            setFill(colors.grayMedium); // Fundo da barra mais discreto
            doc.roundedRect(marginX + 2, yLeft + 7, barW, 3, 1.5, 1.5, 'F'); // Barra mais grossa
            setFill(colors.accentBlue); // Cor da barra de progresso
            doc.roundedRect(marginX + 2, yLeft + 7, barW * pct, 3, 1.5, 1.5, 'F');

            yLeft += 18; // Espaçamento maior
        };

        // --- PARSERS ---
        const parseExperiences = (text) => {
            const blocks = text.split(/\n{2,}/).filter(Boolean);
            return blocks.map((block) => {
                const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
                if (lines.length >= 1) {
                    const firstLine = lines[0];
                    const parts = firstLine.split(/[|\-\u2013\u2014]/).map(p => p.trim());
                    return {
                        cargo:    parts[0] || firstLine,
                        empresa:  parts[1] || '',
                        periodo:  parts[2] || '',
                        descricao: lines.slice(1).join(' '),
                    };
                }
                return { cargo: lines[0] || '', empresa: '', periodo: '', descricao: '' };
            });
        };

        const parseEducation = (text) => {
            return text.split(/\n+/).filter(Boolean).map(line => {
                const parts = line.split(/[|\-\u2013\u2014]/).map(p => p.trim());
                return {
                    curso:       parts[0] || line,
                    instituicao: parts[1] || '',
                    ano:         parts[2] || '',
                };
            });
        };

        const parseLanguages = (text) => {
            return text.split(/[,;\n]/).map(l => {
                const parts = l.split(/[-\u2013\u2014:]/).map(p => p.trim());
                return { lang: parts[0], level: parts[1] || 'Nativo' };
            }).filter(l => l.lang && l.lang.length > 0);
        };

        // ======================================================
        // RENDERIZACAO PRINCIPAL
        // ======================================================

        drawHeader();
        drawColumnBackgrounds();

        // === COLUNA ESQUERDA ===

        drawLeftSectionTitle('Contato');
        if (email)    drawLeftParagraph(`Email: ${email}`);
        if (phone)    drawLeftParagraph(`Tel: ${phone}`);
        if (location) drawLeftParagraph(`Local: ${location}`);
        if (linkedin) drawLeftParagraph(`LinkedIn: ${linkedin}`);

        drawLeftSectionTitle('Habilidades');
        drawSkillTags();

        drawLeftSectionTitle('Idiomas');
        const langs = parseLanguages(language);
        if (langs.length > 0) {
            langs.forEach(({ lang, level }) => drawLanguageItem(lang, level));
        } else {
            drawLeftParagraph(language);
        }

        if (curse) {
            drawLeftSectionTitle('Cursos');
            curse.split(/\n|;/).filter(Boolean).forEach(c => {
                drawLeftParagraph(`- ${c.trim()}`);
            });
        }

        if (projects) {
            drawLeftSectionTitle('Projetos');
            drawLeftParagraph(projects);
        }

        // === COLUNA DIREITA ===

        drawRightSectionTitle('Sobre Mim');

        let contentFoundInAboutMe = false;

        // --- Resumo Profissional ---
        if (resumo) {
            if (yRight + 15 > pageHeight - marginY) addNewPage();

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10.5);
            setColor(colors.primaryDark);
            doc.text('Resumo Profissional', rightColX + 4, yRight);
            yRight += 6;

            drawRightParagraph(resumo, 4);
            contentFoundInAboutMe = true;
        }

        // --- Objetivo Profissional ---
        if (objective) {
            if (contentFoundInAboutMe) {
                yRight += 6;
            }
            if (yRight + 15 > pageHeight - marginY) addNewPage();

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10.5);
            setColor(colors.primaryDark);
            doc.text('Objetivo Profissional', rightColX + 4, yRight);
            yRight += 6;

            drawRightParagraph(objective, 4);
            contentFoundInAboutMe = true;
        }

        if (!contentFoundInAboutMe) {
            drawRightParagraph('Nao informado.');
        }


        drawRightSectionTitle('Experiencia Profissional');
        if (experience && experience !== 'Nao informado.') {
            const exps = parseExperiences(experience);
            if (exps.length > 0) { // Corrigido: Basta verificar se há alguma experiência parseada
                exps.forEach(({ cargo, empresa, periodo, descricao }) => {
                    drawExperienceBlock(
                        cargo    || 'Cargo nao especificado',
                        empresa  || '',
                        periodo  || '',
                        descricao || ''
                    );
                });
            } else {
                drawRightParagraph(experience);
            }
        } else {
            drawRightParagraph('Nao informado.');
        }

        drawRightSectionTitle('Formacao Academica');
        if (education && education !== 'Nao informado.') {
            const edus = parseEducation(education);
            edus.forEach(({ curso, instituicao, ano }) => {
                if (yRight + 18 > pageHeight - marginY) addNewPage();

                doc.setFont('helvetica', 'bold');
                doc.setFontSize(10.5);
                setColor(colors.primaryDark);
                doc.text(curso, rightColX + 4, yRight);

                if (instituicao || ano) {
                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(9.5);
                    setColor(colors.grayDark);
                    const sub = [instituicao, ano].filter(Boolean).join(' - ');
                    doc.text(sub, rightColX + 4, yRight + 6);
                    yRight += 6;
                }
                yRight += 10;
            });
        } else {
            drawRightParagraph('Nao informado.');
        }

        // ======================================================
        // RODAPE EM TODAS AS PAGINAS
        // ======================================================
        const totalPages = doc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);

            // Linha do rodapé
            setDraw(colors.grayMedium);
            doc.line(0, pageHeight - 12, pageWidth, pageHeight - 12);

            // Fundo do rodapé
            setFill(colors.grayLight);
            doc.rect(0, pageHeight - 12, pageWidth, 12, 'F');

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(7.5);
            setColor(colors.grayDark);
            doc.text(
                `Gerado em ${new Date().toLocaleDateString('pt-BR')}  •  Trombini Carreiras © 2026`,
                marginX,
                pageHeight - 5
            );
            doc.text(
                `Pagina ${i} de ${totalPages}`,
                pageWidth - marginX,
                pageHeight - 5,
                { align: 'right' }
            );

            // Barra accent no rodapé
            setFill(colors.accentBlue);
            doc.rect(0, pageHeight - 1.5, pageWidth, 1.5, 'F');
        }

        const fileName = `Curriculo_${fullName.replace(/\s+/g, '_')}.pdf`;
        doc.save(fileName);
    }
}