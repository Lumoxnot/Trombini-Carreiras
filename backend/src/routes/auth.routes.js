import express from "express";
import { supabase, supabaseAdmin } from "../config/supabase.js";

const router = express.Router();

function normalizeEmail(email) {
  return String(email || "")
    .trim()
    .replace(/^["']+|["']+$/g, "")
    .toLowerCase();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isRateLimitError(message) {
  const text = String(message || "").toLowerCase();
  return text.includes("rate limit") || text.includes("too many requests");
}

function isAlreadyRegisteredError(message) {
  const text = String(message || "").toLowerCase();
  return (
    text.includes("already registered") ||
    text.includes("already exists") ||
    text.includes("user already") ||
    text.includes("duplicate")
  );
}

router.get("/", async (req, res) => {
  return res.json({
    service: "auth",
    status: "ok",
    endpoints: {
      register: "POST /api/v1/auth/register",
      login: "POST /api/v1/auth/login",
      me: "GET /api/v1/auth/me",
      checkAuth: "GET /api/v1/auth/check-auth",
      logout: "POST /api/v1/auth/logout",
    },
  });
});

router.post("/register", async (req, res) => {
  try {
    let { email, password } = req.body || {};
    email = normalizeEmail(email);

    if (!email || !password) {
      return res.status(400).json({
        error: "E-mail e senha sao obrigatorios",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        error: "E-mail invalido",
      });
    }

    if (supabaseAdmin) {
      const { error: adminCreateError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

      if (adminCreateError) {
        if (isAlreadyRegisteredError(adminCreateError.message)) {
          return res.status(400).json({
            error: "Este e-mail ja esta cadastrado. Faca login para continuar.",
          });
        }

        return res.status(400).json({
          error: adminCreateError.message || "Erro ao cadastrar usuario",
        });
      }

      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError || !loginData?.session || !loginData?.user) {
        return res.status(400).json({
          error: "Cadastro criado, mas nao foi possivel iniciar sessao. Tente entrar.",
        });
      }

      return res.status(201).json({
        success: true,
        token: loginData.session.access_token,
        refresh_token: loginData.session.refresh_token,
        user: {
          id: loginData.user.id,
          email: loginData.user.email,
        },
        profile: null,
      });
    }

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      return res.status(400).json({
        error: signUpError.message || "Erro ao cadastrar usuario",
      });
    }

    return res.status(201).json({
      success: true,
      user: {
        id: signUpData?.user?.id || null,
        email: signUpData?.user?.email || email,
      },
      profile: null,
    });
  } catch (error) {
    console.error("Erro no cadastro:", error);
    return res.status(500).json({
      error: "Erro ao cadastrar usuario",
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body || {};
    email = normalizeEmail(email);

    if (!email || !password) {
      return res.status(400).json({
        error: "E-mail e senha sao obrigatorios",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        error: "E-mail invalido",
      });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data?.session || !data?.user) {
      return res.status(401).json({
        error: "Credenciais invalidas",
      });
    }

    const { data: profile } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", data.user.id)
      .single();

    return res.json({
      success: true,
      token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      user: {
        id: data.user.id,
        email: data.user.email,
      },
      profile: profile || null,
    });
  } catch (error) {
    console.error("Erro no login:", error);
    return res.status(500).json({
      error: "Erro ao fazer login",
    });
  }
});

router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Token nao fornecido",
      });
    }

    const token = authHeader.substring(7);
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        error: "Token invalido ou expirado",
      });
    }

    const { data: profile } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    return res.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
      },
      profile: profile || null,
      user_type: profile?.user_type || null,
      is_candidate: profile?.user_type === "candidate",
      is_company: profile?.user_type === "company",
    });
  } catch (error) {
    console.error("Erro ao buscar usuario autenticado:", error);
    return res.status(500).json({
      error: "Erro ao validar autenticacao",
    });
  }
});

router.get("/check-auth", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.json({ authenticated: false });
    }

    const token = authHeader.substring(7);
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.json({ authenticated: false });
    }

    return res.json({ authenticated: true });
  } catch (error) {
    return res.json({ authenticated: false });
  }
});

router.post("/logout", async (req, res) => {
  return res.json({
    success: true,
    message: "Logout realizado",
  });
});

export default router;
