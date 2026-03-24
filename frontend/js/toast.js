/**
 * 🔔 Toast Notification Library (Tema Claro)
 * Uma biblioteca leve e independente para notificações toast.
 * Substitui alert() com notificações bonitas de sucesso, erro e aviso.
 *
 * USO:
 *   Toast.success("Operação realizada com sucesso!");
 *   Toast.error("Ocorreu um erro. Tente novamente.");
 *   Toast.warning("Atenção! Verifique os dados.");
 *   Toast.info("Informação importante.");
 *
 * OPÇÕES (opcional):
 *   Toast.success("Mensagem", { duration: 5000, position: "top-right" });
 *
 * POSIÇÕES DISPONÍVEIS:
 *   "top-right" (padrão), "top-left", "top-center",
 *   "bottom-right", "bottom-left", "bottom-center"
 */

(function (global) {
  "use strict";

  /* ── Configuração padrão ── */
  var DEFAULTS = {
    duration: 4000,
    position: "top-right",
    animationDuration: 400,
    showProgress: true,
  };

  /* ── Ícones SVG ── */
  var ICONS = {
    success: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    error: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
    warning: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    info: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
    close: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
  };

  /* ── Cores por tipo (Tema Claro) ── */
  var THEMES = {
    success: {
      bg: "#f0fdf4",
      border: "#22c55e",
      text: "#166534",
      icon: "#22c55e",
      progress: "#22c55e",
      glow: "rgba(34,197,94,0.12)",
    },
    error: {
      bg: "#fef2f2",
      border: "#ef4444",
      text: "#991b1b",
      icon: "#ef4444",
      progress: "#ef4444",
      glow: "rgba(239,68,68,0.12)",
    },
    warning: {
      bg: "#fefce8",
      border: "#eab308",
      text: "#854d0e",
      icon: "#eab308",
      progress: "#eab308",
      glow: "rgba(234,179,8,0.12)",
    },
    info: {
      bg: "#eff6ff",
      border: "#3b82f6",
      text: "#1e40af",
      icon: "#3b82f6",
      progress: "#3b82f6",
      glow: "rgba(59,130,246,0.12)",
    },
  };

  /* ── Injetar CSS (uma vez) ── */
  var stylesInjected = false;

  function injectStyles() {
    if (stylesInjected) return;
    stylesInjected = true;

    var css =
      ".toast-container{position:fixed;z-index:999999;display:flex;flex-direction:column;gap:12px;pointer-events:none;max-width:420px;width:calc(100% - 32px)}" +
      ".toast-container.top-right{top:20px;right:20px;align-items:flex-end}" +
      ".toast-container.top-left{top:20px;left:20px;align-items:flex-start}" +
      ".toast-container.top-center{top:20px;left:50%;transform:translateX(-50%);align-items:center}" +
      ".toast-container.bottom-right{bottom:20px;right:20px;align-items:flex-end}" +
      ".toast-container.bottom-left{bottom:20px;left:20px;align-items:flex-start}" +
      ".toast-container.bottom-center{bottom:20px;left:50%;transform:translateX(-50%);align-items:center}" +
      ".toast-notification{pointer-events:all;display:flex;align-items:flex-start;gap:12px;padding:14px 16px;border-radius:12px;border:1px solid;backdrop-filter:blur(12px);box-shadow:0 4px 16px rgba(0,0,0,0.08),0 0 0 1px rgba(0,0,0,0.04);width:100%;max-width:400px;position:relative;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;cursor:default;opacity:0;transform:translateX(30px) scale(0.95);transition:opacity 0.4s cubic-bezier(0.16,1,0.3,1),transform 0.4s cubic-bezier(0.16,1,0.3,1)}" +
      ".toast-container.top-left .toast-notification,.toast-container.bottom-left .toast-notification{transform:translateX(-30px) scale(0.95)}" +
      ".toast-container.top-center .toast-notification,.toast-container.bottom-center .toast-notification{transform:translateY(-20px) scale(0.95)}" +
      ".toast-notification.toast-visible{opacity:1;transform:translateX(0) scale(1)}" +
      ".toast-notification.toast-exit{opacity:0;transform:translateX(30px) scale(0.9);transition:opacity 0.3s ease,transform 0.3s ease}" +
      ".toast-container.top-left .toast-notification.toast-exit,.toast-container.bottom-left .toast-notification.toast-exit{transform:translateX(-30px) scale(0.9)}" +
      ".toast-container.top-center .toast-notification.toast-exit,.toast-container.bottom-center .toast-notification.toast-exit{transform:translateY(-20px) scale(0.9)}" +
      ".toast-icon{flex-shrink:0;display:flex;align-items:center;justify-content:center;margin-top:1px}" +
      ".toast-body{flex:1;min-width:0}" +
      ".toast-message{font-size:14px;font-weight:500;line-height:1.5;word-wrap:break-word}" +
      ".toast-close{flex-shrink:0;background:none;border:none;cursor:pointer;padding:4px;border-radius:6px;display:flex;align-items:center;justify-content:center;opacity:0.5;transition:opacity 0.2s,background 0.2s;margin-top:-2px}" +
      ".toast-close:hover{opacity:1;background:rgba(0,0,0,0.06)}" +
      ".toast-progress{position:absolute;bottom:0;left:0;height:3px;border-radius:0 0 12px 12px;transition:width linear}" +
      "@media(max-width:480px){.toast-container{max-width:100%;width:calc(100% - 16px);left:8px!important;right:8px!important;transform:none!important}.toast-notification{max-width:100%}}";

    var style = document.createElement("style");
    style.id = "toast-notification-styles";
    style.textContent = css;
    document.head.appendChild(style);
  }

  /* ── Gerenciar containers por posição ── */
  var containers = {};

  function getContainer(position) {
    if (containers[position]) return containers[position];
    var container = document.createElement("div");
    container.className = "toast-container " + position;
    document.body.appendChild(container);
    containers[position] = container;
    return container;
  }

  /* ── Criar e mostrar toast ── */
  function showToast(type, message, options) {
    injectStyles();

    var config = Object.assign({}, DEFAULTS, options || {});
    var theme = THEMES[type] || THEMES.info;
    var container = getContainer(config.position);

    var toast = document.createElement("div");
    toast.className = "toast-notification";
    toast.style.backgroundColor = theme.bg;
    toast.style.borderColor = theme.border;
    toast.style.color = theme.text;
    toast.style.boxShadow =
      "0 4px 16px rgba(0,0,0,0.08), 0 0 30px " + theme.glow;

    toast.innerHTML =
      '<div class="toast-icon" style="color:' +
      theme.icon +
      '">' +
      (ICONS[type] || ICONS.info) +
      '</div><div class="toast-body"><div class="toast-message">' +
      escapeHtml(message) +
      '</div></div><button class="toast-close" style="color:' +
      theme.text +
      '" aria-label="Fechar">' +
      ICONS.close +
      "</button>" +
      (config.showProgress
        ? '<div class="toast-progress" style="background:' +
          theme.progress +
          ";width:100%;transition-duration:" +
          config.duration +
          'ms"></div>'
        : "");

    if (config.position.startsWith("bottom")) {
      container.insertBefore(toast, container.firstChild);
    } else {
      container.appendChild(toast);
    }

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        toast.classList.add("toast-visible");
        var pb = toast.querySelector(".toast-progress");
        if (pb) pb.style.width = "0%";
      });
    });

    var closeBtn = toast.querySelector(".toast-close");
    closeBtn.addEventListener("click", function () {
      removeToast(toast);
    });

    var timeout = setTimeout(function () {
      removeToast(toast);
    }, config.duration);

    toast.addEventListener("mouseenter", function () {
      clearTimeout(timeout);
      var pb = toast.querySelector(".toast-progress");
      if (pb) {
        var w = getComputedStyle(pb).width;
        pb.style.transitionDuration = "0ms";
        pb.style.width = w;
      }
    });

    toast.addEventListener("mouseleave", function () {
      var pb = toast.querySelector(".toast-progress");
      if (pb) {
        var remaining =
          (parseFloat(pb.style.width) /
            parseFloat(getComputedStyle(toast).width)) *
          config.duration;
        pb.style.transitionDuration = remaining + "ms";
        pb.style.width = "0%";
        timeout = setTimeout(function () {
          removeToast(toast);
        }, remaining);
      } else {
        timeout = setTimeout(function () {
          removeToast(toast);
        }, 1000);
      }
    });

    return toast;
  }

  function removeToast(toast) {
    if (toast.classList.contains("toast-exit")) return;
    toast.classList.remove("toast-visible");
    toast.classList.add("toast-exit");
    setTimeout(function () {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 350);
  }

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  /* ── API Pública ── */
  var Toast = {
    success: function (message, options) {
      return showToast("success", message, options);
    },
    error: function (message, options) {
      return showToast("error", message, options);
    },
    warning: function (message, options) {
      return showToast("warning", message, options);
    },
    info: function (message, options) {
      return showToast("info", message, options);
    },
  };

  // Exportar
  if (typeof module !== "undefined" && module.exports) {
    module.exports = Toast;
  } else {
    global.Toast = Toast;
  }
})(typeof window !== "undefined" ? window : this);