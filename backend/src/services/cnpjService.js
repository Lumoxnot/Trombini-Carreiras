export class CnpjApiError extends Error {
  constructor(message, status = 500, detail = "") {
    super(message);
    this.name = "CnpjApiError";
    this.status = status;
    this.detail = detail;
  }
}

async function queryBrasilApi(cleanCNPJ) {
  const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCNPJ}`);

  if (!response.ok) {
    let apiMessage = "";
    try {
      const body = await response.json();
      apiMessage = body?.message || body?.error || "";
    } catch {
      apiMessage = "";
    }

    if (response.status === 404) {
      throw new CnpjApiError("CNPJ nao encontrado.", 404, apiMessage);
    }

    if (response.status === 400 || response.status === 422) {
      throw new CnpjApiError("CNPJ invalido.", 400, apiMessage);
    }

    if (response.status === 403 || response.status === 429 || response.status >= 500) {
      throw new CnpjApiError("Servico de CNPJ temporariamente indisponivel na BrasilAPI.", response.status, apiMessage);
    }

    throw new CnpjApiError("Nao foi possivel validar o CNPJ agora. Tente novamente.", response.status, apiMessage);
  }

  return response.json();
}

async function queryReceitaWs(cleanCNPJ) {
  const response = await fetch(`https://www.receitaws.com.br/v1/cnpj/${cleanCNPJ}`);

  if (!response.ok) {
    let apiMessage = "";
    try {
      const body = await response.json();
      apiMessage = body?.message || body?.error || "";
    } catch {
      apiMessage = "";
    }
    throw new CnpjApiError("Servico alternativo de CNPJ indisponivel.", response.status, apiMessage);
  }

  const data = await response.json();
  if (String(data?.status || "").toUpperCase() !== "OK") {
    const detalhe = data?.message || "Resposta invalida do servico alternativo.";
    throw new CnpjApiError("Falha ao validar CNPJ no servico alternativo.", 502, detalhe);
  }

  return {
    razao_social: data?.nome || "",
    descricao_situacao_cadastral: data?.situacao || "",
    fonte: "receitaws",
    bruto: data,
  };
}

export async function verifyCNPJ(cnpj) {
  const cleanCNPJ = cnpj.replace(/\D/g, '');

  try {
    const brasilApiData = await queryBrasilApi(cleanCNPJ);
    return brasilApiData;
  } catch (error) {
    const shouldFallback =
      error instanceof CnpjApiError &&
      (error.status === 403 || error.status === 429 || error.status >= 500);

    if (!shouldFallback) {
      throw error;
    }

    try {
      return await queryReceitaWs(cleanCNPJ);
    } catch (fallbackError) {
      throw new CnpjApiError(
        "Nao foi possivel validar o CNPJ agora. Tente novamente em instantes.",
        503,
        `${error.detail || error.message} | ${fallbackError.detail || fallbackError.message}`
      );
    }
  }
}

export function limparCNPJ(cnpj) {
  return cnpj.replace(/\D/g, '');
}

export function validarFormatoCNPJ(cnpj) {
  if (cnpj.length !== 14) return false;
  if (/^(\d)\1+$/.test(cnpj)) return false;

  const calcDigito = (base) => {
    let fator = base.length - 7;
    let total = 0;

    for (let i = 0; i < base.length; i += 1) {
      total += Number(base[i]) * fator;
      fator -= 1;
      if (fator < 2) fator = 9;
    }

    const resto = total % 11;
    return resto < 2 ? 0 : 11 - resto;
  };

  const base12 = cnpj.slice(0, 12);
  const digito1 = calcDigito(base12);
  const digito2 = calcDigito(`${base12}${digito1}`);

  return cnpj.endsWith(`${digito1}${digito2}`);
}
