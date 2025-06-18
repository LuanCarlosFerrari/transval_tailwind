// Módulo de Storage para Supabase
if (typeof window.SupabaseStorageManager === 'undefined') {
    class SupabaseStorageManager {
        constructor(supabaseClient) {
            this.supabase = supabaseClient;
            // Buckets descobertos dinamicamente
            this.discoveredBuckets = {};
            this.bucketDisplayNames = {};
        }        // Descobrir buckets dinamicamente
        async initializeBuckets() {
            try {
                console.log('🔍 Descobrindo buckets no Supabase Storage...');
                console.log('🔑 Cliente Supabase:', this.supabase ? 'OK' : 'NULO');

                // Resetar buckets descobertos
                this.discoveredBuckets = {};
                this.bucketDisplayNames = {};

                // Verificar se o cliente está pronto
                if (!this.supabase) {
                    console.error('❌ Cliente Supabase não inicializado');
                    return;
                }

                // Verificar se o usuário está autenticado
                const { data: { user }, error: authError } = await this.supabase.auth.getUser();
                if (authError) {
                    console.error('❌ Erro de autenticação:', authError);
                    return;
                }

                if (!user) {
                    console.log('⚠️ Usuário não autenticado, não é possível listar buckets');
                    return;
                }

                console.log('✅ Usuário autenticado:', user.email);

                // Listar buckets existentes
                console.log('📡 Fazendo requisição para listar buckets...');
                const { data: buckets, error: listError } = await this.supabase.storage.listBuckets();

                if (listError) {
                    console.error('❌ Erro ao listar buckets:', listError);
                    console.error('🔍 Detalhes do erro:', JSON.stringify(listError, null, 2));
                    return;
                } console.log('📁 Buckets disponíveis no Supabase:', buckets);
                console.log('📊 Quantidade de buckets:', buckets ? buckets.length : 0);
                console.log('🔍 Tipo de resposta:', typeof buckets);

                // Aceitar TODOS os buckets disponíveis (não apenas os com '-docs')
                const availableBuckets = buckets ? buckets.filter(bucket => bucket.name && bucket.name.length > 0) : [];

                console.log('📋 Buckets encontrados:', availableBuckets.map(b => b.name));
                if (availableBuckets.length === 0) {
                    console.log('⚠️ Nenhum bucket encontrado no Supabase Storage');
                    console.log('💡 Verifique se você tem permissões de storage ou se os buckets existem');

                    // Tentar método alternativo para descobrir buckets
                    console.log('🔄 Tentando método alternativo de descoberta...');
                    await this._tryAlternativeBucketDiscovery();
                    return;
                }

                // Mapear todos os buckets encontrados
                for (const bucket of availableBuckets) {
                    const folderName = this._bucketToFolderName(bucket.name);
                    this.discoveredBuckets[folderName] = bucket.name;
                    console.log(`✅ Mapeado: ${folderName} → ${bucket.name}`);
                }

                this._generateDisplayNames();

                console.log('🎯 Sistema dinâmico configurado com', Object.keys(this.discoveredBuckets).length, 'buckets reais');

            } catch (error) {
                console.error('❌ Erro ao descobrir buckets:', error);
                console.log('⚠️ Sistema será carregado sem buckets');
                this.discoveredBuckets = {};
                this.bucketDisplayNames = {};
            }
        }        // Converter nome do bucket para nome da pasta
        _bucketToFolderName(bucketName) {
            // Remover sufixo '-docs' se existir
            const baseName = bucketName.replace(/-docs$/, '');

            // Mapear nomes conhecidos
            const nameMap = {
                'diretoria': 'diretoria',
                'financeiro': 'financeiro',
                'marketing': 'marketing',
                'rh': 'rh',
                'operacional': 'operacional',
                'juridico': 'jurídico',
                'recursos-humanos': 'rh',
                'vendas': 'vendas',
                'compras': 'compras',
                'ti': 'ti',
                'qualidade': 'qualidade',
                'logistica': 'logistica',
                'teste': 'teste',
                'teste2': 'teste2'
            };

            // Se não está no mapa, usar o nome base limpo
            return nameMap[baseName] || baseName;
        }        // Gerar nomes de exibição amigáveis
        _generateDisplayNames() {
            const displayMap = {
                'diretoria': 'Diretoria',
                'financeiro': 'Financeiro',
                'marketing': 'Marketing',
                'rh': 'Recursos Humanos',
                'operacional': 'Operacional',
                'juridico': 'Jurídico',
                'vendas': 'Vendas',
                'compras': 'Compras',
                'ti': 'Tecnologia da Informação',
                'qualidade': 'Qualidade',
                'logistica': 'Logística',
                'teste': 'Teste',
                'teste2': 'Teste 2'
            };

            for (const folderName of Object.keys(this.discoveredBuckets)) {
                this.bucketDisplayNames[folderName] = displayMap[folderName] ||
                    folderName.charAt(0).toUpperCase() + folderName.slice(1);
            }
        }

        // Obter todos os buckets descobertos
        getDiscoveredBuckets() {
            return this.discoveredBuckets;
        }

        // Obter nome de exibição de uma pasta
        getDisplayName(folderName) {
            return this.bucketDisplayNames[folderName] || folderName;
        }        // Listar arquivos de uma pasta/bucket
        async listFiles(folderName) {
            try {
                const bucketName = this.discoveredBuckets[folderName.toLowerCase()];
                if (!bucketName) {
                    console.warn(`⚠️ Bucket não encontrado para a pasta: ${folderName}`);
                    return [];
                }

                const { data, error } = await this.supabase.storage
                    .from(bucketName)
                    .list('', {
                        limit: 100,
                        offset: 0
                    });

                if (error) {
                    console.error(`Erro ao listar arquivos do bucket ${bucketName}:`, error);
                    return [];
                }

                return data.map(file => ({
                    name: file.name,
                    type: 'file',
                    size: file.metadata?.size || 0,
                    lastModified: file.updated_at,
                    id: file.id,
                    path: file.name
                }));
            } catch (error) {
                console.error('Erro ao listar arquivos:', error);
                return [];
            }
        }        // Upload de arquivo
        async uploadFile(folderName, file, fileName = null) {
            try {
                const bucketName = this.discoveredBuckets[folderName.toLowerCase()];
                if (!bucketName) {
                    throw new Error(`Bucket não encontrado para a pasta: ${folderName}`);
                }

                const fileExtension = file.name.split('.').pop();
                const finalFileName = fileName || `${Date.now()}_${file.name}`;

                // Verificar se o arquivo já existe
                const { data: existingFiles } = await this.supabase.storage
                    .from(bucketName)
                    .list('');

                const fileExists = existingFiles?.some(f => f.name === finalFileName);

                if (fileExists) {
                    throw new Error(`Arquivo ${finalFileName} já existe no bucket.`);
                }

                const { data, error } = await this.supabase.storage
                    .from(bucketName)
                    .upload(finalFileName, file, {
                        cacheControl: '3600',
                        upsert: false
                    });

                if (error) {
                    throw error;
                }

                console.log(`Arquivo ${finalFileName} enviado com sucesso para ${bucketName}`);
                return {
                    success: true,
                    path: data.path,
                    fileName: finalFileName
                };
            } catch (error) {
                console.error('Erro no upload:', error);
                return {
                    success: false,
                    error: error.message
                };
            }
        }        // Download de arquivo
        async downloadFile(folderName, fileName) {
            try {
                const bucketName = this.discoveredBuckets[folderName.toLowerCase()];
                if (!bucketName) {
                    throw new Error(`Bucket não encontrado para a pasta: ${folderName}`);
                }

                const { data, error } = await this.supabase.storage
                    .from(bucketName)
                    .download(fileName);

                if (error) {
                    throw error;
                }

                // Criar URL para download
                const url = URL.createObjectURL(data);
                const a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                console.log(`Download de ${fileName} iniciado`);
                return { success: true };
            } catch (error) {
                console.error('Erro no download:', error);
                return {
                    success: false,
                    error: error.message
                };
            }
        }        // Obter URL pública de um arquivo (se o bucket for público)
        async getPublicUrl(folderName, fileName) {
            try {
                const bucketName = this.discoveredBuckets[folderName.toLowerCase()];
                if (!bucketName) {
                    throw new Error(`Bucket não encontrado para a pasta: ${folderName}`);
                }

                const { data } = this.supabase.storage
                    .from(bucketName)
                    .getPublicUrl(fileName);

                return data.publicUrl;
            } catch (error) {
                console.error('Erro ao obter URL pública:', error);
                return null;
            }
        }        // Deletar arquivo
        async deleteFile(folderName, fileName) {
            try {
                const bucketName = this.discoveredBuckets[folderName.toLowerCase()];
                if (!bucketName) {
                    throw new Error(`Bucket não encontrado para a pasta: ${folderName}`);
                }

                const { error } = await this.supabase.storage
                    .from(bucketName)
                    .remove([fileName]);

                if (error) {
                    throw error;
                }

                console.log(`Arquivo ${fileName} deletado com sucesso`);
                return { success: true };
            } catch (error) {
                console.error('Erro ao deletar arquivo:', error);
                return {
                    success: false,
                    error: error.message
                };
            }
        }

        // Verificar permissões do usuário
        async checkUserPermissions(folderName) {
            try {
                // Verificar se o usuário está autenticado
                const { data: { user }, error } = await this.supabase.auth.getUser();

                if (error || !user) {
                    return { canRead: false, canWrite: false, canDelete: false };
                }

                // Por enquanto, todos os usuários autenticados têm todas as permissões
                // Aqui você pode implementar lógica mais complexa baseada em roles
                return {
                    canRead: true,
                    canWrite: true,
                    canDelete: true,
                    user: user
                };
            } catch (error) {
                console.error('Erro ao verificar permissões:', error);
                return { canRead: false, canWrite: false, canDelete: false };
            }
        }        // Obter estatísticas de uso do storage
        async getStorageStats() {
            try {
                const stats = {};

                for (const [folderName, bucketName] of Object.entries(this.discoveredBuckets)) {
                    const files = await this.listFiles(folderName);
                    const totalSize = files.reduce((sum, file) => sum + (file.size || 0), 0);

                    stats[folderName] = {
                        fileCount: files.length,
                        totalSize: totalSize,
                        totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
                        displayName: this.getDisplayName(folderName)
                    };
                }

                return stats;
            } catch (error) {
                console.error('Erro ao obter estatísticas:', error);
                return {};
            }
        }

        // Método alternativo para tentar descobrir buckets
        async _tryAlternativeBucketDiscovery() {
            console.log('🔍 Tentando descobrir buckets por método alternativo...');

            // Lista de buckets comuns para testar
            const commonBucketNames = [
                'teste', 'teste2', 'test', 'documents', 'files', 'uploads',
                'diretoria-docs', 'financeiro-docs', 'marketing-docs', 'rh-docs',
                'operacional-docs', 'juridico-docs', 'vendas-docs', 'compras-docs'
            ];

            const foundBuckets = [];

            for (const bucketName of commonBucketNames) {
                try {
                    console.log(`🧪 Testando bucket: ${bucketName}`);

                    // Tentar listar arquivos do bucket para verificar se existe
                    const { data, error } = await this.supabase.storage
                        .from(bucketName)
                        .list('', { limit: 1 });

                    if (!error) {
                        console.log(`✅ Bucket encontrado: ${bucketName}`);
                        foundBuckets.push({ name: bucketName });
                    } else {
                        console.log(`❌ Bucket ${bucketName} não existe ou sem acesso:`, error.message);
                    }
                } catch (err) {
                    console.log(`❌ Erro ao testar bucket ${bucketName}:`, err.message);
                }
            }

            if (foundBuckets.length > 0) {
                console.log(`🎯 Método alternativo encontrou ${foundBuckets.length} bucket(s):`, foundBuckets.map(b => b.name));

                // Mapear buckets encontrados
                for (const bucket of foundBuckets) {
                    const folderName = this._bucketToFolderName(bucket.name);
                    this.discoveredBuckets[folderName] = bucket.name;
                    console.log(`✅ Mapeado via método alternativo: ${folderName} → ${bucket.name}`);
                }

                this._generateDisplayNames();
                console.log('🎯 Sistema configurado via método alternativo com', Object.keys(this.discoveredBuckets).length, 'buckets');
            } else {
                console.log('❌ Método alternativo também não encontrou buckets');

                // Mostrar diagnóstico detalhado
                await this._showDetailedDiagnostics();
            }
        }

        // Mostrar diagnósticos detalhados para ajudar na resolução
        async _showDetailedDiagnostics() {
            console.log('🔍 === DIAGNÓSTICO DETALHADO ===');

            try {
                // Testar se consegue acessar informações básicas do usuário
                const { data: { user }, error: userError } = await this.supabase.auth.getUser();
                console.log('👤 Usuário:', user ? user.email : 'Não encontrado');
                console.log('🔑 Token disponível:', user ? 'Sim' : 'Não');

                // Testar se consegue fazer uma chamada básica ao storage
                try {
                    const { data, error } = await this.supabase.storage.getBucket('teste');
                    console.log('🪣 Teste getBucket:', error ? `Erro: ${error.message}` : 'Sucesso');
                } catch (err) {
                    console.log('🪣 Teste getBucket: Falhou -', err.message);
                }

                // Verificar permissões
                console.log('⚠️ POSSÍVEIS CAUSAS:');
                console.log('1. RLS (Row Level Security) bloqueando acesso aos buckets');
                console.log('2. API Key sem permissões de storage');
                console.log('3. Buckets não existem realmente no projeto');
                console.log('4. Configuração de políticas de storage incorreta');
                console.log('');
                console.log('💡 SOLUÇÕES:');
                console.log('1. Verificar se os buckets existem no painel do Supabase');
                console.log('2. Configurar políticas de storage para permitir acesso');
                console.log('3. Usar service_role key em vez de anon key (apenas para desenvolvimento)');
                console.log('4. Verificar configurações de RLS na tabela buckets');

            } catch (err) {
                console.error('❌ Erro no diagnóstico:', err);
            }
        }
    }

    // Exportar para uso global
    window.SupabaseStorageManager = SupabaseStorageManager;
}
