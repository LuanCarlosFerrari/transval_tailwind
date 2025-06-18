// Configuração do Supabase
if (typeof window.SupabaseConfig === 'undefined') {
    class SupabaseConfig {
        constructor() {
            // Substitua pelas suas credenciais do Supabase
            this.SUPABASE_URL = 'https://mjsuhymbmeopzdpvspdl.supabase.co';
            this.SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qc3VoeW1ibWVvcHpkcHZzcGRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyMDUwMzcsImV4cCI6MjA2NTc4MTAzN30.m8d8hQtfrJpM-rpbSk_lzwXmZKmafUD42SzCFIU8o9I';

            // Inicializar o cliente Supabase
            this.supabase = null;
            this.storageManager = null;
            this.initSupabase();
        }

        async initSupabase() {
            try {
                // Carregar a biblioteca do Supabase
                if (typeof window !== 'undefined' && !window.supabase) {
                    await this.loadSupabaseScript();
                }            // Criar cliente Supabase
                this.supabase = window.supabase.createClient(this.SUPABASE_URL, this.SUPABASE_ANON_KEY); console.log('Supabase inicializado com sucesso');

                // Inicializar Storage Manager se estiver disponível (sem auto-inicialização para evitar conflitos)
                setTimeout(() => {
                    if (window.SupabaseStorageManager) {
                        this.storageManager = new window.SupabaseStorageManager(this.supabase);
                        console.log('Storage Manager criado (inicialização será feita sob demanda)');
                    }
                }, 100);
            } catch (error) {
                console.error('Erro ao inicializar Supabase:', error);
            }
        }

        loadSupabaseScript() {
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
        }

        getClient() {
            return this.supabase;
        }

        // Verificar se o usuário está autenticado
        async getCurrentUser() {
            try {
                const { data: { user }, error } = await this.supabase.auth.getUser();
                if (error) throw error;
                return user;
            } catch (error) {
                console.error('Erro ao obter usuário atual:', error);
                return null;
            }
        }

        // Login com email e senha
        async signIn(email, password) {
            try {
                const { data, error } = await this.supabase.auth.signInWithPassword({
                    email: email,
                    password: password
                });

                if (error) throw error;

                return {
                    success: true,
                    user: data.user,
                    session: data.session
                };
            } catch (error) {
                console.error('Erro no login:', error);
                return {
                    success: false,
                    error: error.message
                };
            }
        }

        // Logout
        async signOut() {
            try {
                const { error } = await this.supabase.auth.signOut();
                if (error) throw error;

                return { success: true };
            } catch (error) {
                console.error('Erro no logout:', error);
                return {
                    success: false,
                    error: error.message
                };
            }
        }

        // Registrar novo usuário (opcional)
        async signUp(email, password, userData = {}) {
            try {
                const { data, error } = await this.supabase.auth.signUp({
                    email: email,
                    password: password,
                    options: {
                        data: userData
                    }
                });

                if (error) throw error;

                return {
                    success: true,
                    user: data.user,
                    session: data.session
                };
            } catch (error) {
                console.error('Erro no registro:', error);
                return {
                    success: false,
                    error: error.message
                };
            }
        }

        // Escutar mudanças no estado de autenticação
        onAuthStateChange(callback) {
            return this.supabase.auth.onAuthStateChange(callback);
        }

        // Verificar se existe uma sessão ativa
        async getSession() {
            try {
                const { data: { session }, error } = await this.supabase.auth.getSession();
                if (error) throw error;
                return session;
            } catch (error) {
                console.error('Erro ao obter sessão:', error);
                return null;
            }
        }

        // Obter Storage Manager
        getStorageManager() {
            return this.storageManager;
        }
    }

    // Instância global do Supabase
    const supabaseClient = new SupabaseConfig();

    // Exportar para uso em outros módulos
    window.SupabaseAuth = supabaseClient;
}
