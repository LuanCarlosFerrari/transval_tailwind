// Módulo de Storage para Supabase
if (typeof window.SupabaseStorageManager === 'undefined') {
    class SupabaseStorageManager {        constructor(supabaseClient) {
            this.supabase = supabaseClient;
            
            // Mapeamento de buckets conhecidos (como fallback)
            this.knownBuckets = {
                'diretoria': 'diretoria-docs',
                'financeiro': 'financeiro-docs',
                'marketing': 'marketing-docs',
                'rh': 'rh-docs',
                'operacional': 'operacional-docs',
                'jurídico': 'juridico-docs'
            };
            
            // Buckets descobertos dinamicamente
            this.discoveredBuckets = {};
            this.bucketDisplayNames = {};
        }        // Descobrir buckets dinamicamente
        async initializeBuckets() {
            try {
                console.log('🔍 Descobrindo buckets no Supabase Storage...');
                
                // Listar buckets existentes
                const { data: buckets, error: listError } = await this.supabase.storage.listBuckets();
                
                if (listError) {
                    console.error('Erro ao listar buckets:', listError);
                    console.log('📄 Modo fallback: usando configuração local');
                    this.discoveredBuckets = this.knownBuckets;
                    this._generateDisplayNames();
                    return;
                }

                console.log('📁 Buckets encontrados:', buckets.map(b => b.name));
                
                // Filtrar apenas buckets que terminam com '-docs' ou são conhecidos
                const relevantBuckets = buckets.filter(bucket => 
                    bucket.name.endsWith('-docs') || 
                    Object.values(this.knownBuckets).includes(bucket.name)
                );
                
                // Mapear buckets descobertos
                for (const bucket of relevantBuckets) {
                    const folderName = this._bucketToFolderName(bucket.name);
                    this.discoveredBuckets[folderName] = bucket.name;
                    console.log(`✅ Mapeado: ${folderName} → ${bucket.name}`);
                }
                
                this._generateDisplayNames();
                
                console.log('🎯 Sistema dinâmico configurado com', Object.keys(this.discoveredBuckets).length, 'buckets');
                
            } catch (error) {
                console.error('Erro ao descobrir buckets:', error);
                console.log('📄 Usando configuração fallback');
                this.discoveredBuckets = this.knownBuckets;
                this._generateDisplayNames();
            }
        }

        // Converter nome do bucket para nome da pasta
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
                'logistica': 'logistica'
            };
            
            return nameMap[baseName] || baseName;
        }

        // Gerar nomes de exibição amigáveis
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
                'logistica': 'Logística'
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
    }

    // Exportar para uso global
    window.SupabaseStorageManager = SupabaseStorageManager;
}
