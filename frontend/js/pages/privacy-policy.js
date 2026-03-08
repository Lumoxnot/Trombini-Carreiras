export function renderPrivacyPolicy() {
    const app = document.getElementById("app"); // mais tarde ajustar o ID
    app.innerHTML = `
        <div style="padding: 40px; max-width: 800px; margin: 0 auto; line-height: 1.6; font-family: sans-serif; color: #333;">
            <h1>Política de Privacidade e Termos de Uso</h1>
            <p>Este site é uma plataforma para conexão entre candidatos e empresas.</p>
            
            <h3>1. Coleta de Dados</h3>
            <p>Coletamos dados pessoais (nome, e-mail, CNPJ) e profissionais para viabilizar as candidaturas e validações de conta via Supabase.</p>
            
            <h3>2. Uso dos Dados</h3>
            <p>Seus dados de currículo ficarão visíveis para empresas cadastradas quando você se candidatar a uma vaga.</p>
            
            <h3>3. Seus Direitos (LGPD)</h3>
            <p>Você pode solicitar a exclusão de seus dados a qualquer momento através do seu painel de controle.</p>
            
            <h3>4. Cookies</h3>
            <p>Utilizamos cookies essenciais para manter sua sessão ativa e garantir a segurança do seu login.</p>
            
            <a href="/" class="btn" style="display: inline-block; margin-top: 20px; text-decoration: none; color: #007bff;">← Voltar para Home</a>
        </div>
    `;
}