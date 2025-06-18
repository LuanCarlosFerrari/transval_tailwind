// Sistema Unificado de Autenticação e Login - Transval
class AuthManager {
    constructor() {
        this.isInitialized = false;
        this.currentUser = null;
        this.loginModal = null;
        this.init();
    }

    async init() {
        try {
            // Aguardar o Supabase ser inicializado
            await this.waitForSupabase();

            // Verificar se há uma sessão ativa
            await this.checkSession();

            // Configurar listener para mudanças de autenticação
            this.setupAuthListener();

            // Configurar verificação periódica de sessão
            this.setupSessionCheck();

            // Criar interface de login
            this.createLoginModal();
            this.setupLoginEvents();

            this.isInitialized = true;
            console.log('AuthManager inicializado com sucesso');
        } catch (error) {
            console.error('Erro ao inicializar AuthManager:', error);
        }
    }

    async waitForSupabase() {
        return new Promise((resolve) => {
            const checkSupabase = () => {
                if (window.SupabaseAuth && window.SupabaseAuth.supabase) {
                    resolve();
                } else {
                    setTimeout(checkSupabase, 100);
                }
            };
            checkSupabase();
        });
    }

    async checkSession() {
        try {
            const session = await window.SupabaseAuth.getSession();
            if (session) {
                this.currentUser = session.user;
                console.log('Usuário autenticado:', this.currentUser.email);
            } else {
                this.currentUser = null;
                console.log('Nenhuma sessão ativa encontrada');
            }
        } catch (error) {
            console.error('Erro ao verificar sessão:', error);
            this.currentUser = null;
        }
    }

    setupAuthListener() {
        console.log('🔐 [AUTH] Configurando listener de autenticação...');
        window.SupabaseAuth.onAuthStateChange((event, session) => {
            console.log('🔐 [AUTH] Estado de autenticação mudou:', event);
            console.log('🔐 [AUTH] Sessão:', session ? 'presente' : 'null');
            console.log('🔐 [AUTH] Página atual:', window.location.pathname);

            if (event === 'SIGNED_IN') {
                console.log('🔐 [AUTH] Evento SIGNED_IN processando...');
                this.currentUser = session.user;
                // Reset welcome flag para novos logins
                sessionStorage.removeItem('transval_welcome_shown');
                this.onSignIn(session.user);
            } else if (event === 'SIGNED_OUT') {
                console.log('🔐 [AUTH] Evento SIGNED_OUT processando...');
                this.currentUser = null;
                this.onSignOut();
            } else {
                console.log('🔐 [AUTH] Evento ignorado:', event);
            }
        });
    }

    // ==========================================
    // MÉTODOS DE AUTENTICAÇÃO
    // ==========================================

    async login(email, password) {
        try {
            const result = await window.SupabaseAuth.signIn(email, password);

            if (result.success) {
                this.showMessage('Login realizado com sucesso!', 'success');
                return true;
            } else {
                this.showMessage(this.getErrorMessage(result.error), 'error');
                return false;
            }
        } catch (error) {
            console.error('Erro no login:', error);
            this.showMessage('Erro interno. Tente novamente.', 'error');
            return false;
        }
    }

    async logout() {
        try {
            const result = await window.SupabaseAuth.signOut();

            if (result.success) {
                this.showMessage('Logout realizado com sucesso!', 'success');
                return true;
            } else {
                this.showMessage('Erro ao fazer logout', 'error');
                return false;
            }
        } catch (error) {
            console.error('Erro no logout:', error);
            this.showMessage('Erro interno ao fazer logout', 'error');
            return false;
        }
    }

    isAuthenticated() {
        return this.currentUser !== null;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    onSignIn(user) {
        console.log('🔐 [AUTH] Usuário logado:', user.email);

        // Verificar se já estamos na página de documentos para evitar redirecionamento desnecessário
        if (window.location.pathname.includes('documents.html')) {
            console.log('🔐 [AUTH] Já na página de documentos, evitando redirecionamento');
            return;
        }

        console.log('🔐 [AUTH] Redirecionando para documents.html...');
        // Limpar flag de boas-vindas para que apareça na próxima vez que acessar documents.html
        sessionStorage.removeItem('transval_welcome_shown');
        // Redirecionar para a página de documentos com parâmetro indicando login recente
        setTimeout(() => {
            window.location.href = 'src/pages/documents.html?login=success';
        }, 1000);
    }

    onSignOut() {
        console.log('Usuário deslogado');
        // Limpar dados de sessão
        sessionStorage.removeItem('transval_welcome_shown');
        // Redirecionar para a página inicial
        if (window.location.pathname.includes('documents.html')) {
            window.location.href = '../../index.html';
        }
    }

    // Verificar se o usuário tem acesso à página de documentos
    async checkDocumentAccess() {
        if (!this.isAuthenticated()) {
            this.showMessage('Acesso negado. Faça login para continuar.', 'error');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
            return false;
        }
        return true;
    }

    // ==========================================
    // INTERFACE DE LOGIN (MODAL)
    // ==========================================

    createLoginModal() {
        // Verificar se o modal já existe
        if (document.getElementById('login-modal')) {
            return;
        }

        const modalHTML = `
            <div id="login-modal" class="fixed inset-0 bg-black bg-opacity-75 z-[800] hidden items-center justify-center p-4">
                <div class="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl shadow-2xl w-full max-w-md mx-auto border border-gray-200">
                    <div class="flex justify-between items-center mb-8">
                        <div class="flex items-center space-x-3">
                            <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                                <i class="fas fa-lock text-white text-sm"></i>
                            </div>
                            <h2 class="text-2xl font-bold text-gray-800">Acesso Restrito</h2>
                        </div>
                        <button id="close-modal-btn" class="w-8 h-8 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center transition-colors duration-200">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                    <form id="login-form" class="space-y-6">
                        <div>
                            <label for="email" class="block text-gray-700 text-sm font-semibold mb-2">Email</label>
                            <div class="relative">
                                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <i class="fas fa-envelope text-gray-400"></i>
                                </div>
                                <input type="email" id="email" name="email" required
                                    class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                                    placeholder="Digite seu email">
                            </div>
                        </div>
                        <div>
                            <label for="password" class="block text-gray-700 text-sm font-semibold mb-2">Senha</label>
                            <div class="relative">
                                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <i class="fas fa-lock text-gray-400"></i>
                                </div>
                                <input type="password" id="password" name="password" required
                                    class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                                    placeholder="Digite sua senha">
                            </div>
                        </div>
                        <button type="submit" id="login-submit-btn"
                            class="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed">
                            <span class="login-text">
                                <i class="fas fa-sign-in-alt mr-2"></i>
                                Entrar
                            </span>
                            <span class="loading-text hidden">
                                <i class="fas fa-spinner fa-spin mr-2"></i>
                                Entrando...
                            </span>
                        </button>
                    </form>
                    <div class="mt-6 text-center">
                        <p class="text-xs text-gray-500">Acesso exclusivo para funcionários autorizados</p>
                        <div class="mt-2 flex items-center justify-center space-x-4">
                            <div class="flex items-center text-xs text-gray-400">
                                <i class="fas fa-shield-alt mr-1"></i>
                                <span>Conexão segura</span>
                            </div>
                            <div class="flex items-center text-xs text-gray-400">
                                <i class="fas fa-lock mr-1"></i>
                                <span>Dados protegidos</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.loginModal = document.getElementById('login-modal');
    }

    setupLoginEvents() {
        // Aguardar o DOM estar pronto se necessário
        const setupEvents = () => {
            const loginBtnDesktop = document.getElementById('login-btn-desktop');
            const loginBtnMobile = document.getElementById('login-btn-mobile');
            const closeModalBtn = document.getElementById('close-modal-btn');
            const loginForm = document.getElementById('login-form');

            if (!loginBtnDesktop || !this.loginModal) {
                // Se os elementos ainda não existem, aguardar um pouco
                setTimeout(setupEvents, 100);
                return;
            }

            // Eventos para abrir modal
            loginBtnDesktop?.addEventListener('click', (e) => {
                e.preventDefault();
                this.showLoginModal();
            });

            loginBtnMobile?.addEventListener('click', (e) => {
                e.preventDefault();
                this.showLoginModal();
            });

            // Evento para fechar modal
            closeModalBtn?.addEventListener('click', () => {
                this.hideLoginModal();
            });

            // Fechar modal clicando fora
            this.loginModal?.addEventListener('click', (e) => {
                if (e.target === this.loginModal) {
                    this.hideLoginModal();
                }
            });

            // Evento do formulário de login
            loginForm?.addEventListener('submit', (e) => {
                this.handleLoginSubmit(e);
            });
        };

        // Executar setup imediatamente ou quando DOM carregar
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', setupEvents);
        } else {
            setupEvents();
        }
    }

    showLoginModal() {
        if (!this.loginModal) return;

        this.loginModal.classList.remove('hidden');
        this.loginModal.classList.add('flex');

        // Carregar último email usado
        const lastEmail = localStorage.getItem('transval_last_email');
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');

        if (lastEmail && emailInput) {
            emailInput.value = lastEmail;
            // Focar no campo de senha se email já estiver preenchido
            if (passwordInput) {
                setTimeout(() => passwordInput.focus(), 100);
            }
        } else if (emailInput) {
            // Focar no campo de email se estiver vazio
            setTimeout(() => emailInput.focus(), 100);
        }
    }

    hideLoginModal() {
        if (!this.loginModal) return;

        this.loginModal.classList.add('hidden');
        this.loginModal.classList.remove('flex');
    }

    async handleLoginSubmit(e) {
        e.preventDefault();

        const email = document.getElementById('email')?.value;
        const password = document.getElementById('password')?.value;
        const submitBtn = document.getElementById('login-submit-btn');
        const loginText = submitBtn?.querySelector('.login-text');
        const loadingText = submitBtn?.querySelector('.loading-text');

        // Validação básica
        if (!email || !password) {
            this.showMessage('Por favor, preencha todos os campos.', 'error');
            return;
        }

        // Validar formato do email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            this.showMessage('Por favor, insira um email válido.', 'error');
            return;
        }

        // Mostrar loading
        if (submitBtn) {
            submitBtn.disabled = true;
            loginText?.classList.add('hidden');
            loadingText?.classList.remove('hidden');
        }

        try {
            // Aguardar AuthManager estar pronto
            while (!this.isInitialized) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            // Tentar fazer login
            const success = await this.login(email, password);

            if (success) {
                // Login bem-sucedido - salvar email para próximo login
                localStorage.setItem('transval_last_email', email);
                // Fechar modal
                this.hideLoginModal();
            }
        } catch (error) {
            console.error('Erro no login:', error);
            this.showMessage('Erro interno. Tente novamente.', 'error');
        } finally {
            // Restaurar botão
            if (submitBtn) {
                submitBtn.disabled = false;
                loginText?.classList.remove('hidden');
                loadingText?.classList.add('hidden');
            }
        }
    }

    // ==========================================
    // UTILITÁRIOS
    // ==========================================

    getErrorMessage(error) {
        const errorMessages = {
            'Invalid login credentials': 'Email ou senha incorretos',
            'Email not confirmed': 'Email não confirmado',
            'Too many requests': 'Muitas tentativas. Tente novamente mais tarde',
            'User not found': 'Usuário não encontrado',
            'Invalid email': 'Email inválido',
            'Password should be at least 6 characters': 'A senha deve ter pelo menos 6 caracteres'
        };

        return errorMessages[error] || 'Erro de autenticação. Verifique suas credenciais.';
    }

    showMessage(message, type = 'info') {
        // Remover mensagem anterior se existir
        const existingMessage = document.getElementById('auth-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // Criar nova mensagem
        const messageDiv = document.createElement('div');
        messageDiv.id = 'auth-message';
        messageDiv.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-[900] transition-all duration-300 ${
            type === 'success' ? 'bg-green-500 text-white' :
            type === 'error' ? 'bg-red-500 text-white' :
            'bg-blue-500 text-white'
        }`;
        messageDiv.textContent = message;

        document.body.appendChild(messageDiv);

        // Remover mensagem após 5 segundos
        setTimeout(() => {
            if (messageDiv) {
                messageDiv.style.opacity = '0';
                setTimeout(() => {
                    if (messageDiv.parentNode) {
                        messageDiv.parentNode.removeChild(messageDiv);
                    }
                }, 300);
            }
        }, 5000);
    }

    // Método para registrar novos usuários (caso necessário)
    async register(email, password, userData = {}) {
        try {
            const result = await window.SupabaseAuth.signUp(email, password, userData);

            if (result.success) {
                this.showMessage('Usuário registrado com sucesso! Verifique seu email.', 'success');
                return true;
            } else {
                this.showMessage(this.getErrorMessage(result.error), 'error');
                return false;
            }
        } catch (error) {
            console.error('Erro no registro:', error);
            this.showMessage('Erro interno no registro.', 'error');
            return false;
        }
    }

    setupSessionCheck() {
        // Verificar sessão a cada 5 minutos
        setInterval(async () => {
            try {
                const session = await window.SupabaseAuth.getSession();
                if (!session && this.currentUser) {
                    // Sessão expirada
                    console.log('Sessão expirada, fazendo logout automático');
                    this.currentUser = null;
                    this.onSignOut();
                }
            } catch (error) {
                console.error('Erro ao verificar sessão:', error);
            }
        }, 5 * 60 * 1000); // 5 minutos
    }
}

// Instância global do AuthManager
const authManager = new AuthManager();

// Exportar para uso global
window.AuthManager = authManager;
