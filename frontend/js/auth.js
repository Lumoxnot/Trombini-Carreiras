import { APP_STATE, refreshApiClient } from "./config.js";
import { Router } from "./router.js";

const AUTH_BASE = "/api/v1/auth";

function getStoredToken() {
  return localStorage.getItem("token");
}

function setStoredToken(token) {
  localStorage.setItem("token", token);
  localStorage.setItem("isLougOutManual", "false");
  refreshApiClient();
}

function clearStoredToken() {
  localStorage.removeItem("token");
  localStorage.setItem("isLougOutManual", "true");
  refreshApiClient();
}

function getAuthHeaders() {
  const token = getStoredToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getFriendlyAuthError(message, fallback) {
  const original = String(message || "").trim();
  const text = original.toLowerCase();

  if (text.includes("rate limit") || text.includes("too many requests")) {
    return "Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente novamente.";
  }

  if (text.includes("email") && text.includes("invalid")) {
    return "E-mail invalido. Confira o endereco e tente novamente.";
  }

  if (text.includes("password") && text.includes("at least")) {
    return "A senha precisa ter no minimo 6 caracteres.";
  }

  if (text.includes("email not confirmed") || text.includes("confirme seu e-mail")) {
    return "Credenciais invalidas.";
  }

  return original || fallback;
}

function isRateLimitError(message) {
  const text = String(message || "").toLowerCase();
  return text.includes("rate limit") || text.includes("too many requests");
}

function isAlreadyRegisteredError(message) {
  const text = String(message || "").toLowerCase();
  return (
    text.includes("ja esta cadastrado") ||
    text.includes("already registered") ||
    text.includes("already exists")
  );
}

async function parseResponseSafely(response) {
  const rawText = await response.text();
  if (!rawText) return {};

  try {
    return JSON.parse(rawText);
  } catch {
    return { error: rawText };
  }
}

export class AuthService {
  static async login(email, password) {
    const loginEmail = normalizeEmail(email);
    const loginPassword = String(password || "");

    if (!loginEmail || !loginPassword) {
      throw new Error("Preencha e-mail e senha.");
    }

    if (!isValidEmail(loginEmail)) {
      throw new Error("Digite um e-mail valido.");
    }

    const response = await fetch(`${AUTH_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: loginEmail, password: loginPassword }),
    });

    const data = await parseResponseSafely(response);
    if (!response.ok || !data?.token) {
      throw new Error(
        getFriendlyAuthError(data?.error, "Falha no login. Tente novamente.")
      );
    }

    setStoredToken(data.token);
    APP_STATE.currentUser = data.user || null;
    APP_STATE.userProfile = data.profile || null;
    APP_STATE.isAuthenticated = true;

    if (APP_STATE.userProfile?.user_type === "candidate") {
      Router.navigateTo("/candidate-dashboard");
      return data;
    }

    if (APP_STATE.userProfile?.user_type === "company") {
      Router.navigateTo("/company-dashboard");
      return data;
    }

    Router.navigateTo("/setup-profile");
    return data;
  }

  static async register(email, password) {
    const registerEmail = normalizeEmail(email);
    const registerPassword = String(password || "");

    if (!registerEmail || !registerPassword) {
      throw new Error("Preencha e-mail e senha.");
    }

    if (String(registerPassword).length < 6) {
      throw new Error("A senha precisa ter no minimo 6 caracteres.");
    }

    if (!isValidEmail(registerEmail)) {
      throw new Error("Digite um e-mail valido.");
    }

    const response = await fetch(`${AUTH_BASE}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: registerEmail, password: registerPassword }),
    });

    const data = await parseResponseSafely(response);
    if (!response.ok) {
      if (isAlreadyRegisteredError(data?.error)) {
        throw new Error("Este e-mail ja esta cadastrado. Faca login para continuar.");
      }

      if (isRateLimitError(data?.error)) {
        throw new Error(
          "Muitas tentativas de cadastro. Aguarde alguns minutos e tente novamente."
        );
      }

      throw new Error(
        getFriendlyAuthError(data?.error, "Falha no cadastro. Tente novamente.")
      );
    }

    if (data.requires_email_confirmation) {
      throw new Error("Cadastro concluido. Faca login para continuar.");
    }

    if (data?.token) {
      setStoredToken(data.token);
      APP_STATE.currentUser = data.user || null;
      APP_STATE.userProfile = data.profile || null;
      APP_STATE.isAuthenticated = true;
      Router.navigateTo("/setup-profile");
    }

    return data;
  }

  static async checkAuth() {
    const token = getStoredToken();
    if (!token) {
      APP_STATE.currentUser = null;
      APP_STATE.userProfile = null;
      APP_STATE.isAuthenticated = false;
      return false;
    }

    try {
      const response = await fetch(`${AUTH_BASE}/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
      });

      if (!response.ok) {
        clearStoredToken();
        APP_STATE.currentUser = null;
        APP_STATE.userProfile = null;
        APP_STATE.isAuthenticated = false;
        return false;
      }

      const data = await parseResponseSafely(response);
      APP_STATE.currentUser = data.user || null;
      APP_STATE.userProfile = data.profile || null;
      APP_STATE.isAuthenticated = true;
      return true;
    } catch (err) {
      console.error("Erro ao verificar autenticacao:", err);
      return false;
    }
  }

  static async createUserProfile(userData) {
    const response = await fetch("/api/v1/profiles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(userData),
    });

    const data = await parseResponseSafely(response);
    if (!response.ok) {
      throw new Error(data?.error || "Erro ao criar perfil");
    }

    APP_STATE.userProfile = data.data || null;
    APP_STATE.isAuthenticated = true;
    if (APP_STATE.userProfile?.user_type === "candidate") {
      alert("Perfil criado: Candidato");
    } else if (APP_STATE.userProfile?.user_type === "company") {
      alert("Perfil criado: Empresa");
    }
    return data.data;
  }

  static async logout() {
    try {
      await fetch(`${AUTH_BASE}/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
      });
    } catch (err) {
      console.error("Erro no logout:", err);
    } finally {
      clearStoredToken();
      APP_STATE.currentUser = null;
      APP_STATE.userProfile = null;
      APP_STATE.isAuthenticated = false;
      window.location.href = "/";
    }
  }

  static async signOut() {
    return this.logout();
  }
}
