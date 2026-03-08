// components/LGPDBanner.js

export function setupLGPDBanner() {
    console.log("Tentando criar banner LGPD");

    if (localStorage.getItem("lgpd_consent")) {
        console.log("Usuário já aceitou LGPD");
        return;
    }

    const banner = document.createElement("div");
    banner.id = "lgpd-banner";

    banner.style = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        right: 20px;
        background: #ffffff;
        border: 1px solid #ddd;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        z-index: 9999;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 20px;
        font-family: sans-serif;
    `;

    banner.innerHTML = `
        <span>
            Utilizamos cookies essenciais.
            <a href="/privacidade">Política de Privacidade</a>.
        </span>
        <button id="accept-lgpd" style="padding:8px 16px; cursor:pointer;">
            Aceitar
        </button>
    `;

    document.body.appendChild(banner);

    document.getElementById("accept-lgpd")
        .addEventListener("click", () => {
            localStorage.setItem("lgpd_consent", "true");
            banner.remove();
        });
}