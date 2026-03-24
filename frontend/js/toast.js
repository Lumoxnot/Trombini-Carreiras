// Toast moderno, simples e compatível com Vite

let container = null;

function createContainer() {
  if (container) return container;

  container = document.createElement("div");
  container.style.position = "fixed";
  container.style.top = "20px";
  container.style.right = "20px";
  container.style.zIndex = "9999";
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.gap = "10px";

  document.body.appendChild(container);
  return container;
}

function createToast(message, type = "info") {
  const colors = {
    success: "#22c55e",
    error: "#ef4444",
    warning: "#eab308",
    info: "#3b82f6",
  };

  const toast = document.createElement("div");

  toast.textContent = message;
  toast.style.padding = "12px 16px";
  toast.style.borderRadius = "8px";
  toast.style.color = "#fff";
  toast.style.fontSize = "14px";
  toast.style.fontWeight = "500";
  toast.style.boxShadow = "0 4px 10px rgba(0,0,0,0.1)";
  toast.style.background = colors[type] || colors.info;
  toast.style.opacity = "0";
  toast.style.transform = "translateY(-10px)";
  toast.style.transition = "all 0.3s ease";

  return toast;
}

function show(message, type = "info", duration = 3000) {
  const parent = createContainer();
  const toast = createToast(message, type);

  parent.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity = "1";
    toast.style.transform = "translateY(0)";
  });

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(-10px)";
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

const Toast = {
  success: (msg, duration) => show(msg, "success", duration),
  error: (msg, duration) => show(msg, "error", duration),
  warning: (msg, duration) => show(msg, "warning", duration),
  info: (msg, duration) => show(msg, "info", duration),
};

export default Toast;