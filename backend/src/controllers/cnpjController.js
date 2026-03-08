import { CnpjApiError, verifyCNPJ, limparCNPJ, validarFormatoCNPJ } from "../services/cnpjService.js";

export async function checkCnpjEMPRESA(req, res) {
  try {
    const { documento, cnpj } = req.body || {};
    const entrada = documento || cnpj;

    if (!entrada) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Documento nao enviado.",
      });
    }

    const cnpjLimpo = limparCNPJ(entrada);
    const cnpjValido = validarFormatoCNPJ(cnpjLimpo);
    if (!cnpjValido) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Formato do CNPJ invalido.",
      });
    }

    const dadosCnpj = await verifyCNPJ(cnpjLimpo);

    return res.status(200).json({
      sucesso: true,
      empresa: {
        nome: dadosCnpj.razao_social,
        situacao: dadosCnpj.descricao_situacao_cadastral,
      },
    });
  } catch (erro) {
    const detalhe = erro?.message || "Erro desconhecido.";
    const apiDetail = erro?.detail || detalhe;
    const status = erro instanceof CnpjApiError ? erro.status : 500;
    const isTransientExternalError =
      erro instanceof CnpjApiError && (status === 403 || status === 429 || status >= 500);

    // Se a validacao externa cair, mantemos o fluxo com validacao matematica local.
    // Isso evita bloquear cadastro por indisponibilidade temporaria de terceiros.
    if (isTransientExternalError) {
      return res.status(200).json({
        sucesso: true,
        verificacao_parcial: true,
        mensagem: "CNPJ valido no formato, mas sem confirmacao externa no momento.",
        detalhe: apiDetail,
        empresa: {
          nome: "",
          situacao: "NAO_VERIFICADO_EXTERNAMENTE",
        },
      });
    }

    return res.status(status).json({
      sucesso: false,
      mensagem: detalhe,
      detalhe: apiDetail,
    });
  }
}


