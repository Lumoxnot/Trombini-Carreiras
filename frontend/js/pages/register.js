import { AuthService } from "../auth.js";
import { Router } from "../router.js";
import Toast from "../toast.js";
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

            <!-- NOVO: Checkbox de LGPD -->
            <div class="form-group" style="display: flex; align-items: flex-start; gap: 10px; margin-top: 15px;">
              <input type="checkbox" id="acceptLgpd" name="acceptLgpd" required style="width: auto; margin-top: 5px;" />
              <label for="acceptLgpd" style="font-size: 14px; color: #666; font-weight: normal; cursor: pointer;">
                Li e concordo com a <a href="/privacidade" target="_blank" style="color: #007bff; text-decoration: underline;">Política de Privacidade</a> e os termos de uso dos dados. *
              </label>
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

    //Verificação extra de segurança no JS
    const acceptLgpd = document.getElementById("acceptLgpd");
    if (!acceptLgpd.checked) {
      Toast.warning("Você precisa aceitar os termos de privacidade para continuar.");
      return;
    }

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
      Toast.error(error.message || "Falha no cadastro. Tente novamente.");
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
