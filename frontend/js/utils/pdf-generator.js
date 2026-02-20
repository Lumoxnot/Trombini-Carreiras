import { jsPDF } from 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/+esm';

export class PDFGenerator {
    static generateResumePDF(resume) {
        const doc = new jsPDF({ unit: 'mm', format: 'a4' });
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 14;
        const contentWidth = pageWidth - margin * 2;
        const bodyColor = [31, 41, 55];
        const mutedColor = [100, 116, 139];
        const accentColor = [15, 23, 42];
        const softColor = [241, 245, 249];
        let y = 0;

        const safe = (value) => String(value || '').trim();
        const fullName = safe(resume?.full_name) || 'Candidato';
        const age = safe(resume?.age);
        const email = safe(resume?.contact_email) || 'Nao informado';
        const phone = safe(resume?.contact_phone) || 'Nao informado';
        const objective = safe(resume?.objective || resume?.summary);
        const education = safe(resume?.education) || 'Nao informado';
        const experience = safe(resume?.experience) || 'Nao informado';
        const skills = safe(resume?.skills)
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean);

        const drawHeader = () => {
            doc.setFillColor(...accentColor);
            doc.rect(0, 0, pageWidth, 46, 'F');

            doc.setTextColor(255, 255, 255);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(22);
            doc.text(fullName, margin, 20);

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(11);
            doc.text('Perfil Profissional', margin, 27);

            doc.setFontSize(10);
            doc.text(`Email: ${email}`, margin, 35);
            doc.text(`Telefone: ${phone}`, margin, 40);

            doc.setFillColor(59, 130, 246);
            doc.roundedRect(pageWidth - 52, 12, 38, 18, 3, 3, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(9);
            doc.text('IDADE', pageWidth - 45, 20);
            doc.setFontSize(14);
            doc.text(age ? `${age} anos` : '--', pageWidth - 45, 26.5);
        };

        const ensureSpace = (heightNeeded) => {
            if (y + heightNeeded <= pageHeight - 18) return;
            doc.addPage();
            drawHeader();
            y = 56;
        };

        const drawSectionTitle = (title) => {
            ensureSpace(14);
            doc.setFillColor(...softColor);
            doc.roundedRect(margin, y - 4, contentWidth, 9, 1.5, 1.5, 'F');
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(11);
            doc.setTextColor(...accentColor);
            doc.text(title.toUpperCase(), margin + 3, y + 2);
            y += 12;
        };

        const drawParagraph = (text) => {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10.5);
            doc.setTextColor(...bodyColor);
            const lines = doc.splitTextToSize(text, contentWidth - 2);
            const lineHeight = 5.4;
            ensureSpace(lines.length * lineHeight + 2);
            doc.text(lines, margin + 1, y);
            y += lines.length * lineHeight + 4;
        };

        const drawSkills = () => {
            if (!skills.length) {
                drawParagraph('Nao informado');
                return;
            }

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9.5);

            let x = margin + 1;
            const rowHeight = 8;
            ensureSpace(14);

            skills.forEach((skill) => {
                const text = skill.length > 28 ? `${skill.slice(0, 25)}...` : skill;
                const width = doc.getTextWidth(text) + 8;
                if (x + width > pageWidth - margin) {
                    x = margin + 1;
                    y += rowHeight;
                    ensureSpace(rowHeight + 4);
                }

                doc.setFillColor(219, 234, 254);
                doc.roundedRect(x, y - 5, width, 6.5, 2, 2, 'F');
                doc.setTextColor(30, 64, 175);
                doc.text(text, x + 4, y - 0.5);
                x += width + 3;
            });

            y += 7;
        };

        drawHeader();
        y = 56;

        const generatedObjective = experience === 'Nao informado'
            ? 'Nao informado'
            : `${experience.slice(0, 260)}${experience.length > 260 ? '...' : ''}`;

        drawSectionTitle('Resumo');
        drawParagraph(objective || generatedObjective);

        drawSectionTitle('Formacao Academica');
        drawParagraph(education);

        drawSectionTitle('Experiencia Profissional');
        drawParagraph(experience);

        drawSectionTitle('Habilidades');
        drawSkills();

        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setDrawColor(226, 232, 240);
            doc.line(margin, pageHeight - 14, pageWidth - margin, pageHeight - 14);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8.5);
            doc.setTextColor(...mutedColor);
            doc.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')}`, margin, pageHeight - 9);
            doc.text(`Pagina ${i} de ${pageCount}`, pageWidth - margin - 23, pageHeight - 9);
        }

        const fileName = `Curriculo_${fullName.replace(/\s+/g, '_')}.pdf`;
        doc.save(fileName);
    }
}
