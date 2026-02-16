import { AuthService } from "../auth.js";
import { Router } from "../router.js";

export async function renderRegisterPage() {
  const app = document.getElementById("app");

  app.innerHTML = `
    <div class="setup-profile-page">
      <div class="container">
        <div class="setup-card">
          <h2>Criar Conta</h2>
          <p class="subtitle">Cadastre-se para acessar a plataforma</p>

          <form id="registerForm" class="profile-form">
            <div class="form-group">
              <label for="email">E-mail *</label>
              <input type="email" id="email" name="email" required />
            </div>

            <div class="form-group">
              <label for="password">Senha *</label>
              <input type="password" id="password" name="password" minlength="6" required />
            </div>

            <button type="submit" class="btn btn-primary btn-block">Cadastrar</button>
            <button type="button" id="goLogin" class="btn btn-secondary btn-block">Ja tenho conta</button>
          </form>
        </div>
      </div>
    </div>
  `;

  const form = document.getElementById("registerForm");
  const goLogin = document.getElementById("goLogin");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = "Cadastrando...";

    const formData = new FormData(form);
    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");

    try {
      const result = await AuthService.register(email, password);
      if (result?.requires_email_confirmation) {
        submitButton.disabled = false;
        submitButton.textContent = "Cadastrar";
      }
    } catch (error) {
      alert(error.message || "Falha no cadastro. Tente novamente.");
      if (String(error.message || "").toLowerCase().includes("faca login")) {
        Router.navigateTo("/login");
        return;
      }
      submitButton.disabled = false;
      submitButton.textContent = "Cadastrar";
    }
  });

  goLogin.addEventListener("click", () => {
    Router.navigateTo("/login");
  });
}
