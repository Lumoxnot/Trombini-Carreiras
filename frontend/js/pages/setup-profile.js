import { APP_STATE } from '../config.js';
import { AuthService } from '../auth.js';
import { Router } from '../router.js';

export async function renderSetupProfile() {
    const app = document.getElementById('app');
    
    // Se já tem perfil, redirecionar
    if (APP_STATE.userProfile) {
        if (APP_STATE.userProfile.user_type === 'candidate') {
            Router.navigateTo('/candidate-dashboard');
        } else {
            Router.navigateTo('/company-dashboard');
        }
        return;
    }
    
    app.innerHTML = `
        <div class="setup-profile-page">
            <div class="container">
                <div class="setup-card">
                    <h2>Complete seu Perfil</h2>
                    <p class="subtitle">Escolha como você deseja usar a plataforma</p>
                    
                    <form id="profileForm" class="profile-form">
                        <div class="form-group">
                            <label>Eu sou:</label>
                            <div class="radio-group">
                                <label class="radio-label">
                                    <input type="radio" name="user_type" value="candidate" required>
                                    <span>Candidato - Procurando emprego</span>
                                </label>
                                <label class="radio-label">
                                    <input type="radio" name="user_type" value="company" required>
                                    <span>Empresa - Procurando talentos</span>
                                </label>
                            </div>
                        </div>
                        
                        <div class="form-group CNPJ" style="display: none;">
                            <label>CNPJ:</label>
                            <div style="display: flex; gap: 8px; align-items: center;">
                                <input autocomplete="off" type="text" id="cnpj-group" name="cnpj" placeholder="00.000.000/0000-00" maxlength="18">
                                <button type="button" id="btn-verificar-cnpj" class="btn btn-secondary">Verificar</button>
                            </div>
                            <small id="cnpj-status" style="display:block; margin-top:6px;"></small>
                        </div>

                        <div class="form-group">
                            <label for="full_name">Nome Completo / Nome da Empresa *</label>
                            <input type="text" id="full_name" name="full_name" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="email">E-mail *</label>
                            <input type="email" id="email" name="email" required value="${APP_STATE.currentUser?.email || ''}">
                        </div>
                        
                        <div class="form-group">
                            <label for="phone">Telefone</label>
                            <input type="tel" id="phone" name="phone" placeholder="(00) 00000-0000">
                        </div>
                        
                        <button type="submit" class="btn btn-primary btn-block">Continuar</button>
                    </form>
                </div>
            </div>
        </div>
    `;

    const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://trombini-carreiras.onrender.com').replace(/\/+$/, '');
    const use = document.querySelectorAll('input[name="user_type"]');
    const cnpjInput = document.getElementById('cnpj-group');
    const cnpjContainer = document.querySelector('.CNPJ');
    const cnpjStatus = document.getElementById('cnpj-status');
    const verifyCnpjBtn = document.getElementById('btn-verificar-cnpj');
    const fullNameInput = document.getElementById('full_name');

    let cnpjVerified = false;
    let verifiedCnpjDigits = '';

    const onlyDigits = (value) => String(value || '').replace(/\D/g, '');
    const formatCnpj = (value) => {
        const digits = onlyDigits(value).slice(0, 14);
        return digits
            .replace(/^(\d{2})(\d)/, '$1.$2')
            .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
            .replace(/\.(\d{3})(\d)/, '.$1/$2')
            .replace(/(\d{4})(\d)/, '$1-$2');
    };

    const setCnpjStatus = (message, color = '#333') => {
        cnpjStatus.textContent = message;
        cnpjStatus.style.color = color;
    };

    const resetCnpjVerification = () => {
        cnpjVerified = false;
        verifiedCnpjDigits = '';
    };

    use.forEach((useitem) => {
        useitem.addEventListener('change', () => {
            if (useitem.checked && useitem.value === 'company') {
                cnpjInput.required = true;
                cnpjContainer.style.display = 'block';
                setCnpjStatus('Digite o CNPJ e clique em verificar.', '#666');
                return;
            }

            if (useitem.checked && useitem.value === 'candidate') {
                cnpjInput.required = false;
                cnpjContainer.style.display = 'none';
                cnpjInput.value = '';
                setCnpjStatus('');
                resetCnpjVerification();
            }
        });
    });

    cnpjInput.addEventListener('input', () => {
        cnpjInput.value = formatCnpj(cnpjInput.value);
        resetCnpjVerification();
        setCnpjStatus('CNPJ alterado. Verifique novamente.', '#b36b00');
    });

    verifyCnpjBtn.addEventListener('click', async () => {
        const cnpjDigits = onlyDigits(cnpjInput.value);
        if (cnpjDigits.length !== 14) {
            setCnpjStatus('CNPJ deve ter 14 digitos.', '#d32f2f');
            return;
        }

        verifyCnpjBtn.disabled = true;
        verifyCnpjBtn.textContent = 'Verificando...';
        setCnpjStatus('Consultando CNPJ...', '#666');

        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/cnpj/validar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cnpj: cnpjDigits })
            });

            const data = await response.json().catch(() => ({}));
            const unavailableExternalService =
                response.status === 503 &&
                String(data?.detalhe || data?.mensagem || '')
                    .toLowerCase()
                    .includes('servico de cnpj temporariamente indisponivel na brasilapi');

            if (unavailableExternalService) {
                cnpjVerified = true;
                verifiedCnpjDigits = cnpjDigits;
                setCnpjStatus('CNPJ valido no formato, mas a consulta externa esta indisponivel no momento.', '#b36b00');
                return;
            }

            if (!response.ok || !data?.sucesso) {
                throw new Error(data?.detalhe || data?.mensagem || 'Falha na verificacao do CNPJ.');
            }

            cnpjVerified = true;
            verifiedCnpjDigits = cnpjDigits;

            if (!fullNameInput.value && data?.empresa?.nome) {
                fullNameInput.value = data.empresa.nome;
            }

            if (data?.verificacao_parcial) {
                setCnpjStatus('CNPJ valido no formato, mas a consulta externa esta indisponivel no momento.', '#b36b00');
            } else {
                setCnpjStatus(`CNPJ verificado: ${data?.empresa?.nome || 'Empresa encontrada'}.`, '#2e7d32');
            }
        } catch (error) {
            resetCnpjVerification();
            setCnpjStatus(error.message || 'Erro ao verificar CNPJ.', '#d32f2f');
        } finally {
            verifyCnpjBtn.disabled = false;
            verifyCnpjBtn.textContent = 'Verificar';
        }
    });

    const form = document.getElementById('profileForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const userData = {
            user_type: formData.get('user_type'),
            full_name: formData.get('full_name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
        };

        if (userData.user_type === 'company') {
            const currentCnpjDigits = onlyDigits(cnpjInput.value);
            if (currentCnpjDigits.length !== 14) {
                alert('Para empresa, informe um CNPJ valido.');
                return;
            }

            if (!cnpjVerified || verifiedCnpjDigits !== currentCnpjDigits) {
                alert('Verifique o CNPJ antes de continuar.');
                return;
            }

            userData.cnpj = currentCnpjDigits;
        }

        try {
            const submitBtn = form.querySelector('button[type="submit"]');
            
            submitBtn.disabled = true;
            submitBtn.textContent = 'Salvando...';
            
            await AuthService.createUserProfile(userData);
            
            
            if (userData.user_type === 'candidate') {
                Router.navigateTo('/candidate-dashboard');
            } else {
                Router.navigateTo('/company-dashboard');
            }
        } catch (error) {
            alert('Erro ao criar perfil. Por favor, tente novamente.');
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Continuar';
        }
    });
}


     
