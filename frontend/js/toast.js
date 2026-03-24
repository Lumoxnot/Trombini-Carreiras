// Toast PRO (compatível com Vite + Vercel)

const DEFAULTS = {
  duration: 4000,
  position: "top-right",
  animationDuration: 400,
  showProgress: true,
};

const ICONS = {
  success: "✔",
  error: "✖",
  warning: "⚠",
  info: "ℹ",
};

const THEMES = {
  success: {
    bg: "#f0fdf4",
    border: "#22c55e",
    text: "#166534",
    progress: "#22c55e",
  },
  error: {
    bg: "#fef2f2",
    border: "#ef4444",
    text: "#991b1b",
    progress: "#ef4444",
  },
  warning: {
    bg: "#fefce8",
    border: "#eab308",
    text: "#854d0e",
    progress: "#eab308",
  },
  info: {
    bg: "#eff6ff",
    border: "#3b82f6",
    text: "#1e40af",
    progress: "#3b82f6",
  },
};

let containers = {};
let stylesInjected = false;

function injectStyles() {
  if (stylesInjected) return;
  stylesInjected = true;

  const style = document.createElement("style");
  style.textContent = `
.toast-container{position:fixed;z-index:9999;display:flex;flex-direction:column;gap:10px}
.toast-container.top-right{top:20px;right:20px}
.toast-container.top-left{top:20px;left:20px}
.toast-notification{display:flex;align-items:center;gap:10px;padding:12px 14px;border-radius:10px;border:1px solid;font-size:14px;opacity:0;transform:translateY(-10px);transition:.3s}
.toast-visible{opacity:1;transform:translateY(0)}
.toast-progress{position:absolute;bottom:0;left:0;height:3px;width:100%;transition:width linear}
.toast-close{margin-left:auto;cursor:pointer;opacity:.6}
.toast-close:hover{opacity:1}
  `;
  document.head.appendChild(style);
}

function getContainer(position) {
  if (containers[position]) return containers[position];
  const el = document.createElement("div");
  el.className = `toast-container ${position}`;
  document.body.appendChild(el);
  containers[position] = el;
  return el;
}

function showToast(type, message, options = {}) {
  injectStyles();

  const config = { ...DEFAULTS, ...options };
  const theme = THEMES[type];
  const container = getContainer(config.position);

  const toast = document.createElement("div");
  toast.className = "toast-notification";
  toast.style.background = theme.bg;
  toast.style.borderColor = theme.border;
  toast.style.color = theme.text;
  toast.style.position = "relative";

  toast.innerHTML = `
    <span>${ICONS[type]}</span>
    <span>${message}</span>
    <span class="toast-close">✖</span>
    ${
      config.showProgress
        ? `<div class="toast-progress" style="background:${theme.progress};transition-duration:${config.duration}ms"></div>`
        : ""
    }
  `;

  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add("toast-visible");
    const pb = toast.querySelector(".toast-progress");
    if (pb) pb.style.width = "0%";
  });

  const remove = () => {
    toast.classList.remove("toast-visible");
    setTimeout(() => toast.remove(), 300);
  };

  toast.querySelector(".toast-close").onclick = remove;

  let timeout = setTimeout(remove, config.duration);

  toast.onmouseenter = () => clearTimeout(timeout);
  toast.onmouseleave = () => {
    timeout = setTimeout(remove, 1000);
  };

  return toast;
}

const Toast = {
  success: (msg, opt) => showToast("success", msg, opt),
  error: (msg, opt) => showToast("error", msg, opt),
  warning: (msg, opt) => showToast("warning", msg, opt),
  info: (msg, opt) => showToast("info", msg, opt),
};

export default Toast;