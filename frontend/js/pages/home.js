import { APP_STATE } from "../config.js";
import { AuthService } from "../auth.js";
import { Router } from "../router.js";

export async function renderHomePage() {
  const app = document.getElementById("app");

  const isAuth = await AuthService.checkAuth();

  if (isAuth && APP_STATE.userProfile) {
    if (APP_STATE.userProfile.user_type === "candidate") {
      Router.navigateTo("/candidate-dashboard");
    } else {
      Router.navigateTo("/company-dashboard");
    }
    return;
  }

  app.innerHTML = `
        <div class="home-page">
            <header class="header">
                <div class="container">
                    <div class="header-content">
                        <h1 class="logo">Trombini Carreiras</h1>
                        <div class="header-auth-actions">
                            <button class="btn btn-secondary" onclick="handleRegister()">Criar Conta</button> 
                            <button class="btn btn-primary" onclick="handleLogin()">Entrar</button>
                        </div>
                    </div>
                </div>
            </header>
            
            <section class="hero">
                <div class="container">
                    <div class="hero-content">
                        <h2 class="hero-title">Conectando Talentos com Oportunidades</h2>
                        <p class="hero-subtitle">A plataforma completa para candidatos encontrarem empregos e empresas descobrirem os melhores profissionais</p>
                        <div class="hero-actions">
                            <button class="btn btn-large btn-secondary" onclick="handleRegister()">Criar Conta</button>
                            <button class="btn btn-large btn-primary" onclick="handleLogin()">Entrar</button>
                        </div>
                    </div>
                    <div class="hero-image">
                        <img src="/img/MTEmprega.jpeg" alt="Profissionais trabalhando">
                    </div>
                </div>
            </section>
            
            <section class="features">
                <div class="container">
                    <h2 class="section-title">Como Funciona</h2>
                    <div class="features-grid">
                        <div class="feature-card">
                            <img src="/img/MT(1).jpeg" alt="Dashboard do Candidato">
                            <h3>Para Candidatos</h3>
                            <p>Crie seu curriculo profissional, candidate-se a vagas e receba notificacoes de oportunidades compativeis com seu perfil</p>
                        </div>
                        <div class="feature-card">
                            <img src="/img/MT(2).jpeg" alt="Recrutamento">
                            <h3>Para Empresas</h3>
                            <p>Publique vagas, acesse curriculos qualificados e gerencie todo o processo de recrutamento em um so lugar</p>
                        </div>
                        <div class="feature-card">
                            <img src="/img/MT(1).jpeg" alt="Entrevista">
                            <h3>Conexao Direta</h3>
                            <p>Facilite o contato entre candidatos e empresas com integracao de WhatsApp e e-mail</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    `;

  window.handleLogin = () => {
    Router.navigateTo("/login");
  };

  window.handleRegister = () => {
    Router.navigateTo("/register");
  };
}
