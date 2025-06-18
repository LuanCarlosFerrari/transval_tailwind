// Utilitários para gerenciar autenticação
class AuthManager {
    constructor() {
        this.isInitialized = false;
        this.currentUser = null;
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
    } setupAuthListener() {
        window.SupabaseAuth.onAuthStateChange((event, session) => {
            console.log('Estado de autenticação mudou:', event);

            if (event === 'SIGNED_IN') {
                this.currentUser = session.user;
                // Reset welcome flag para novos logins
                sessionStorage.removeItem('transval_welcome_shown');
                this.onSignIn(session.user);
            } else if (event === 'SIGNED_OUT') {
                this.currentUser = null;
                this.onSignOut();
            }
        });
    }

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
    } onSignIn(user) {
        console.log('Usuário logado:', user.email);
        // Limpar flag de boas-vindas para que apareça na próxima vez que acessar documents.html
        sessionStorage.removeItem('transval_welcome_shown');
        // Redirecionar para a página de documentos com parâmetro indicando login recente
        setTimeout(() => {
            window.location.href = 'documents.html?login=success';
        }, 1000);
    }

    onSignOut() {
        console.log('Usuário deslogado');
        // Limpar dados de sessão
        sessionStorage.removeItem('transval_welcome_shown');
        // Redirecionar para a página inicial
        if (window.location.pathname.includes('documents.html')) {
            window.location.href = 'index.html';
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
        messageDiv.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-[900] transition-all duration-300 ${type === 'success' ? 'bg-green-500 text-white' :
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
