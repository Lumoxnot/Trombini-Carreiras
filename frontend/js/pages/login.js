import { AuthService } from "../auth.js";
import { Router } from "../router.js";

export async function renderLoginPage() {
  const app = document.getElementById("app");

  app.innerHTML = `
    <div class="setup-profile-page">
      <div class="container">
        <div class="setup-card">
          <h2>Entrar</h2>
          <p class="subtitle">Acesse sua conta para continuar</p>

          <form id="loginForm" class="profile-form">
            <div class="form-group">
              <label for="email">E-mail *</label>
              <input type="email" id="email" name="email" required />
            </div>

            <div class="form-group">
              <label for="password">Senha *</label>
              <input type="password" id="password" name="password" required />
            </div>

            <button type="submit" class="btn btn-primary btn-block">Entrar</button>
            <button type="button" id="goRegister" class="btn btn-secondary btn-block">Criar conta</button>
          </form>
        </div>
      </div>
    </div>
  `;

  const form = document.getElementById("loginForm");
  const goRegister = document.getElementById("goRegister");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = "Entrando...";

    const formData = new FormData(form);
    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");

    try {
      await AuthService.login(email, password);
    } catch (error) {
      alert(error.message || "Falha no login. Tente novamente.");
      submitButton.disabled = false;
      submitButton.textContent = "Entrar";
    }
  });

  goRegister.addEventListener("click", () => {
    Router.navigateTo("/register");
  });
}
