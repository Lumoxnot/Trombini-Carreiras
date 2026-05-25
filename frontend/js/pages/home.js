// home.js
import { APP_STATE } from "../config.js";
import { AuthService } from "../auth.js";
import { Router } from "../router.js";

export async function renderHomePage() {
  const app = document.getElementById("app");

  const isAuth = await AuthService.checkAuth();
  if (isAuth && APP_STATE.userProfile) {
    Router.navigateTo(
      APP_STATE.userProfile.user_type === "candidate"
        ? "/candidate-dashboard"
        : "/company-dashboard"
    );
    return;
  }

  app.innerHTML = `
    <div class="hp">

      <!-- ═══════════════════ NAVBAR ═══════════════════ -->
      <header class="hp-nav" id="hpNav">
        <div class="hp-nav__inner">
          <a class="hp-nav__brand" href="/">
            <div class="hp-brand-icon"><img src="/img/MT(1).jpeg" alt="Conexão" class="hp-card__img"></div>
            <span class="hp-brand-name">Trombini Carreiras</span>
          </a>

          <nav class="hp-nav__links">
            <a href="#features" class="hp-nav__link">Como Funciona</a>
            <a href="#empresas"  class="hp-nav__link">Para Empresas</a>
          </nav>

          <div class="hp-nav__actions">
            <button class="hp-btn hp-btn--ghost" onclick="handleRegister()">Criar Conta</button>
            <button class="hp-btn hp-btn--primary" onclick="handleLogin()">
              Entrar
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>

          <button class="hp-nav__burger" id="hpBurger" aria-label="Menu">
            <span></span><span></span><span></span>
          </button>
        </div>

        <div class="hp-nav__mobile" id="hpMobile">
          <a href="#features" class="hp-nav__mlink" id="mlink1">Como Funciona</a>
          <a href="#empresas"  class="hp-nav__mlink" id="mlink2">Para Empresas</a>
          <div class="hp-nav__msep"></div>
          <button class="hp-btn hp-btn--ghost hp-btn--full" onclick="handleRegister()">Criar Conta</button>
          <button class="hp-btn hp-btn--primary hp-btn--full" onclick="handleLogin()">Entrar</button>
        </div>
      </header>

      <!-- ═══════════════════ HERO ═══════════════════ -->
      <section class="hp-hero">
        <div class="hp-hero__orb hp-hero__orb--a"></div>
        <div class="hp-hero__orb hp-hero__orb--b"></div>
        <div class="hp-hero__orb hp-hero__orb--c"></div>
        <div class="hp-hero__grid"></div>

        <div class="hp-wrap hp-hero__body">

          <!-- Texto -->
          <div class="hp-hero__text rv">
            <div class="hp-tag">
              <span class="hp-tag__dot"></span>
              Plataforma de Empregos Regional
            </div>

            <h1 class="hp-hero__h1">
              Encontre sua próxima<br>
              <span class="hp-hero__grad">oportunidade</span>
            </h1>

            <p class="hp-hero__sub">
              Conectamos candidatos talentosos às melhores empresas da região. Crie seu currículo, candidate-se a vagas e acelere sua carreira.
            </p>

            <div class="hp-hero__ctas">
              <button class="hp-cta hp-cta--main" onclick="handleRegister()">
                Começar de graça
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
              <button class="hp-cta hp-cta--outline" onclick="handleLogin()">
                Já tenho conta
              </button>
            </div>

            <div class="hp-hero__proof">
              <div class="hp-avatars">
                <div class="hp-av" style="--c:#3b82f6">A</div>
                <div class="hp-av" style="--c:#8b5cf6">B</div>
                <div class="hp-av" style="--c:#06b6d4">C</div>
                <div class="hp-av" style="--c:#10b981">D</div>
              </div>
              <span class="hp-hero__proof-text"><strong>+2.400</strong> profissionais cadastrados</span>
            </div>
          </div>

          <!-- Imagem -->
          <div class="hp-hero__visual rv rv--d1">
            <div class="hp-hero__glow"></div>
            <div class="hp-hero__imgcard">
              <img src="/img/MTEmprega.jpeg" alt="Profissionais" class="hp-hero__img">
              <div class="hp-hero__imgovl"></div>
            </div>
            <div class="hp-floatbadge hp-floatbadge--tl">
              <span class="hp-floatbadge__ico">🚀</span>
              <div>
                <b class="hp-floatbadge__t">Novas vagas</b>
                <span class="hp-floatbadge__s">47 hoje</span>
              </div>
            </div>
            <div class="hp-floatbadge hp-floatbadge--br">
              <span class="hp-floatbadge__ico">✅</span>
              <div>
                <b class="hp-floatbadge__t">Contratações</b>
                <span class="hp-floatbadge__s">+120 esse mês</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Métricas -->
        <div class="hp-wrap">
          <div class="hp-metrics rv rv--d2">
            <div class="hp-metric">
              <span class="hp-metric__n">500<em>+</em></span>
              <span class="hp-metric__l">Vagas ativas</span>
            </div>
            <div class="hp-metric__sep"></div>
            <div class="hp-metric">
              <span class="hp-metric__n">2.4k<em>+</em></span>
              <span class="hp-metric__l">Candidatos</span>
            </div>
            <div class="hp-metric__sep"></div>
            <div class="hp-metric">
              <span class="hp-metric__n">150<em>+</em></span>
              <span class="hp-metric__l">Empresas</span>
            </div>
            <div class="hp-metric__sep"></div>
            <div class="hp-metric">
              <span class="hp-metric__n">98<em>%</em></span>
              <span class="hp-metric__l">Satisfação</span>
            </div>
          </div>
        </div>
      </section>

      <!-- ═══════════════════ FEATURES ═══════════════════ -->
      <section class="hp-sec hp-sec--light" id="features">
        <div class="hp-wrap">

          <div class="hp-sec__head rv">
            <span class="hp-eyebrow">Como funciona</span>
            <h2 class="hp-sec__h2">Tudo que você precisa,<br class="hp-br-d">em um só lugar</h2>
            <p class="hp-sec__sub">Simples para candidatos, poderoso para empresas.</p>
          </div>

          <div class="hp-cards" id="empresas">

            <div class="hp-card rv">
              <div class="hp-card__img-wrap">
                <img src="/img/MT(1).jpeg" alt="Candidatos" class="hp-card__img">
                <div class="hp-card__shade hp-card__shade--blue"></div>
                <span class="hp-chip hp-chip--blue">Candidatos</span>
              </div>
              <div class="hp-card__body">
                <div class="hp-card__ico">👤</div>
                <h3 class="hp-card__h3">Para Candidatos</h3>
                <p class="hp-card__p">Monte seu currículo profissional e candidate-se às vagas certas em poucos cliques.</p>
                <ul class="hp-card__list">
                  <li>Currículo com download PDF</li>
                  <li>Candidatura em 1 clique</li>
                  <li>Perfil visível às empresas</li>
                </ul>
                <button class="hp-card__btn" onclick="handleRegister()">
                  Criar currículo grátis
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
              </div>
            </div>

            <div class="hp-card hp-card--feat rv rv--d1">
              <div class="hp-card__featbadge">Mais popular</div>
              <div class="hp-card__img-wrap">
                <img src="/img/MT(2).jpeg" alt="Empresas" class="hp-card__img">
                <div class="hp-card__shade hp-card__shade--purple"></div>
                <span class="hp-chip hp-chip--purple">Empresas</span>
              </div>
              <div class="hp-card__body">
                <div class="hp-card__ico">🏢</div>
                <h3 class="hp-card__h3">Para Empresas</h3>
                <p class="hp-card__p">Publique vagas e encontre os candidatos ideais com gestão completa do recrutamento.</p>
                <ul class="hp-card__list">
                  <li>Publicação de vagas</li>
                  <li>Acesso a currículos</li>
                  <li>Painel de gestão</li>
                </ul>
                <button class="hp-card__btn hp-card__btn--feat" onclick="handleRegister()">
                  Publicar vagas
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
              </div>
            </div>

            <div class="hp-card rv rv--d2">
              <div class="hp-card__img-wrap">
                <img src="/img/MT(1).jpeg" alt="Conexão" class="hp-card__img">
                <div class="hp-card__shade hp-card__shade--emerald"></div>
                <span class="hp-chip hp-chip--emerald">Conexão</span>
              </div>
              <div class="hp-card__body">
                <div class="hp-card__ico">🤝</div>
                <h3 class="hp-card__h3">Conexão Direta</h3>
                <p class="hp-card__p">Facilite o contato entre candidatos e empresas por WhatsApp e e-mail direto.</p>
                <ul class="hp-card__list">
                  <li>Integração WhatsApp</li>
                  <li>Contato por e-mail</li>
                  <li>Respostas rápidas</li>
                </ul>
                <button class="hp-card__btn" onclick="handleRegister()">
                  Saiba mais
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      <!-- ═══════════════════ CTA BANNER ═══════════════════ -->
      <section class="hp-sec hp-sec--dark">
        <div class="hp-wrap">
          <div class="hp-cta-banner rv">
            <div class="hp-cta-banner__orb hp-cta-banner__orb--a"></div>
            <div class="hp-cta-banner__orb hp-cta-banner__orb--b"></div>
            <div class="hp-cta-banner__content">
              <div class="hp-cta-banner__ico">⚡</div>
              <h2 class="hp-cta-banner__h2">Pronto para o próximo passo?</h2>
              <p class="hp-cta-banner__p">Junte-se a mais de 2.400 profissionais que já aceleraram suas carreiras.</p>
              <div class="hp-cta-banner__btns">
                <button class="hp-cta hp-cta--main" onclick="handleRegister()">
                  Criar conta grátis
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
                <button class="hp-cta hp-cta--outline-dark" onclick="handleLogin()">Já tenho conta</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ═══════════════════ FOOTER ═══════════════════ -->
      <footer class="hp-footer">
        <div class="hp-wrap">
          <div class="hp-footer__top">

            <div class="hp-footer__brand-col">
              <div class="hp-footer__brand">
                <div class="hp-brand-icon hp-brand-icon--sm">TC</div>
                <span class="hp-footer__brandname">Trombini Carreiras</span>
              </div>
              <p class="hp-footer__desc">A plataforma de empregos mais moderna da região, conectando talentos e oportunidades.</p>
              <div class="hp-footer__social">
                <a href="#" class="hp-social-btn" aria-label="LinkedIn">in</a>
                <a href="#" class="hp-social-btn" aria-label="Instagram">ig</a>
                <a href="#" class="hp-social-btn" aria-label="WhatsApp">wp</a>
              </div>
            </div>

            <div class="hp-footer__col">
              <h4 class="hp-footer__col-title">Plataforma</h4>
              <ul class="hp-footer__links">
                <li><button class="hp-footer__link" onclick="handleRegister()">Para Candidatos</button></li>
                <li><button class="hp-footer__link" onclick="handleRegister()">Para Empresas</button></li>
                <li><a href="#features" class="hp-footer__link">Como Funciona</a></li>
                <li><button class="hp-footer__link" onclick="handleRegister()">Criar Conta</button></li>
              </ul>
            </div>

            <div class="hp-footer__col">
              <h4 class="hp-footer__col-title">Suporte</h4>
              <ul class="hp-footer__links">
                <li><a href="#" class="hp-footer__link">Central de Ajuda</a></li>
                <li><a href="#" class="hp-footer__link">Contato</a></li>
                <li><a href="#" class="hp-footer__link">Feedback</a></li>
              </ul>
            </div>

            <div class="hp-footer__col">
              <h4 class="hp-footer__col-title">Legal</h4>
              <ul class="hp-footer__links">
                <li><a href="#" class="hp-footer__link">Política de Privacidade</a></li>
                <li><a href="#" class="hp-footer__link">Termos de Uso</a></li>
                <li><a href="#" class="hp-footer__link">Cookies</a></li>
              </ul>
            </div>

          </div>
          <div class="hp-footer__bottom">
            <span class="hp-footer__copy">© 2026 Trombini Carreiras. Todos os direitos reservados.</span>
            <span class="hp-footer__made">Feito com 💙 para a região</span>
          </div>
        </div>
      </footer>

    </div>
  `;

  window.handleLogin    = () => Router.navigateTo("/login");
  window.handleRegister = () => Router.navigateTo("/register");

  // --- Navbar scroll ---
  const nav = document.getElementById("hpNav");
  const onScroll = () => nav.classList.toggle("hp-nav--scrolled", window.scrollY > 10);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // --- Mobile menu ---
  const burger = document.getElementById("hpBurger");
  const mobile = document.getElementById("hpMobile");
  burger?.addEventListener("click", () => {
    const open = mobile.classList.toggle("open");
    burger.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", open);
  });

  // Fechar ao clicar em link mobile
  ["mlink1","mlink2"].forEach(id => {
    document.getElementById(id)?.addEventListener("click", () => {
      mobile.classList.remove("open");
      burger.classList.remove("open");
    });
  });

  // --- Scroll reveal ---
  const observer = new IntersectionObserver(
    (entries) => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("rv--in"); observer.unobserve(e.target); } }),
    { threshold: 0.08, rootMargin: "0px 0px -30px 0px" }
  );
  document.querySelectorAll(".rv").forEach(el => observer.observe(el));
}