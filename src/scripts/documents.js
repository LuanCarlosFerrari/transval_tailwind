document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 [INIT] DOMContentLoaded disparado - iniciando script documents.js');
    console.log('🔍 [INIT] Verificando se script já foi carregado...');

    // Proteção contra múltiplas execuções
    if (window.documentsScriptLoaded) {
        console.log('📋 [PROTECTION] Script de documentos já foi carregado, ignorando execução duplicada');
        console.log('🛑 [PROTECTION] RETORNANDO - execução bloqueada');
        return;
    }
    window.documentsScriptLoaded = true;
    console.log('✅ [INIT] Primeira execução confirmada - marcando como carregado');

    console.log('📝 [INIT] Dashboard script loaded successfully!');

    const fileBrowser = document.getElementById('file-browser');
    const folderModal = document.getElementById('folder-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalContent = document.getElementById('modal-content');
    const closeModalBtn = document.getElementById('close-folder-modal-btn');

    // Verificar se os elementos existem
    if (!fileBrowser) {
        console.error('Element with ID "file-browser" not found');
        return;
    }
    if (!folderModal) {
        console.error('Element with ID "folder-modal" not found');
        return;
    }    // Variáveis de controle
    let storageManager = null;
    let isOnlineMode = false;
    let isInitialized = false;
    let isLoading = false;
    let initAttempts = 0;
    const maxInitAttempts = 3;
    let isAppFullyLoaded = false; // Nova variável para controlar se o app já foi carregado completamente

    // Tentar conectar com Supabase Storage (com timeout)
    try {
        if (window.SupabaseAuth && window.SupabaseAuth.getStorageManager) {
            await new Promise((resolve, reject) => {
                let attempts = 0;
                const maxAttempts = 50; // máximo 5 segundos (50 * 100ms)

                const checkSupabase = () => {
                    attempts++;
                    if (window.SupabaseAuth.getStorageManager()) {
                        storageManager = window.SupabaseAuth.getStorageManager();
                        isOnlineMode = true;
                        resolve();
                    } else if (attempts >= maxAttempts) {
                        console.log('Timeout na inicialização do Supabase, usando modo offline');
                        resolve();
                    } else {
                        setTimeout(checkSupabase, 100);
                    }
                };
                checkSupabase();
            });
        }
    } catch (error) {
        console.log('Modo offline: usando dados locais');
    }    // Dados de fallback (APENAS para modo offline)
    // ⚠️ IMPORTANTE: Estes dados NÃO devem ser usados em modo online
    // Em modo online, apenas buckets que existem no Supabase devem ser renderizados
    const fallbackFileData = isOnlineMode ? {} : {
        'Diretoria': [
            { name: 'planejamento.pdf', type: 'file' },
            { name: 'resultados.docx', type: 'file' },
        ],
        'Financeiro': [
            { name: 'balanco.xlsx', type: 'file' },
            { name: 'contas-a-pagar.pdf', type: 'file' },
        ],
        'Marketing': [
            { name: 'campanha-natal.jpg', type: 'file' },
            { name: 'novo-logo.png', type: 'file' },
        ],
        'Recursos Humanos': [
            { name: 'ferias.pdf', type: 'file' },
            { name: 'vagas.docx', type: 'file' },
        ],
        'Operacional': [
            { name: 'rotas.pdf', type: 'file' },
            { name: 'manutencao.xlsx', type: 'file' },
        ],
        'Jurídico': [
            { name: 'contratos.pdf', type: 'file' },
            { name: 'licencas.docx', type: 'file' },
        ]
    };// Carregar dados dos arquivos dinamicamente
    async function loadFileData() {
        // Verificar se o sistema já foi finalizado
        if (window.documentsAppFinished) {
            console.log('🛑 Sistema finalizado, não carregando mais dados');
            return {};
        } if (isOnlineMode && storageManager) {
            console.log('📁 Carregando arquivos do Supabase Storage dinamicamente...');
            console.log('⚠️ [CRITICAL] MODO ONLINE: Apenas buckets que existem no Supabase devem ser renderizados');
            console.log('⚠️ [CRITICAL] Não devem aparecer: Documents, Files, Uploads ou outros buckets fictícios');
            console.log('⚠️ [CRITICAL] Apenas buckets reais do seu projeto Supabase devem ser mostrados');

            // Inicializar buckets apenas uma vez, ou se explicitamente solicitado
            if (!isInitialized && initAttempts < maxInitAttempts) {
                initAttempts++;
                console.log(`🔧 Inicializando descoberta de buckets (tentativa ${initAttempts}/${maxInitAttempts})...`);

                try {
                    await storageManager.initializeBuckets();

                    // Verificar se encontrou buckets
                    const discoveredBuckets = storageManager.getDiscoveredBuckets();
                    if (Object.keys(discoveredBuckets).length > 0) {
                        console.log('✅ Buckets encontrados, marcando como inicializado');
                        isInitialized = true;
                    } else if (initAttempts >= maxInitAttempts) {
                        console.log('⚠️ Máximo de tentativas atingido, parando inicializações');
                        isInitialized = true; // Para evitar mais tentativas
                    } else {
                        console.log(`⚠️ Nenhum bucket encontrado na tentativa ${initAttempts}, tentará novamente`);
                    }
                } catch (error) {
                    console.error('❌ Erro na inicialização de buckets:', error);
                    if (initAttempts >= maxInitAttempts) {
                        console.log('⚠️ Máximo de tentativas atingido devido a erro, parando');
                        isInitialized = true;
                    }
                }
            }

            const onlineData = {};

            // Obter buckets descobertos dinamicamente (apenas os que existem no Supabase)
            const discoveredBuckets = storageManager.getDiscoveredBuckets();

            console.log('🔍 Buckets descobertos:', Object.keys(discoveredBuckets));            // Se não encontrou nenhum bucket que realmente existe, retornar vazio
            if (Object.keys(discoveredBuckets).length === 0) {
                console.log('⚠️ Nenhum bucket válido encontrado no Supabase Storage');
                console.log('🔍 [SAFETY_CHECK] Retornando dados vazios para garantir que nenhum bucket fictício seja renderizado');
                return {};
            } for (const folderName of Object.keys(discoveredBuckets)) {
                console.log(`🔍 [PROCESSING] Processando bucket: ${folderName} → ${discoveredBuckets[folderName]}`);

                try {
                    const files = await storageManager.listFiles(folderName);
                    const displayName = storageManager.getDisplayName(folderName);
                    onlineData[displayName] = files;
                    console.log(`✅ Pasta "${displayName}" carregada com ${files.length} arquivo(s)`);
                    console.log(`✅ [VERIFIED] Bucket real confirmado: ${displayName}`);
                } catch (error) {
                    console.error(`❌ Erro ao carregar pasta ${folderName}:`, error);
                    console.log(`⚠️ [SKIPPED] Pulando bucket com erro: ${folderName}`);
                    // Não adicionar pasta que deu erro
                }
            } console.log('✅ Sistema carregado com buckets existentes:', Object.keys(onlineData));
            console.log('🔍 [DATA_SOURCE] Dados vindos de: SUPABASE STORAGE (modo online)');
            console.log('🔍 [DATA_SOURCE] Total de buckets descobertos:', Object.keys(onlineData).length);
            return onlineData;
        } else {
            console.log('📄 [OFFLINE] Modo offline detectado');
            console.log('📄 [OFFLINE] Retornando dados vazios (não usar fallback para evitar buckets falsos)');
            console.log('🔍 [DATA_SOURCE] Dados vindos de: VAZIO (modo offline sem fallback)');
            console.log('🔍 [DATA_SOURCE] Total de buckets retornados: 0');
            // Retornar vazio em vez de fallback para evitar mostrar buckets que não existem
            return {};
        }
    }

    function getFileIconClass(fileName) {
        const extension = fileName.split('.').pop().toLowerCase();
        switch (extension) {
            case 'pdf': return 'fas fa-file-pdf text-red-500';
            case 'docx':
            case 'doc': return 'fas fa-file-word text-blue-500';
            case 'xlsx':
            case 'xls': return 'fas fa-file-excel text-green-500';
            case 'png':
            case 'jpg':
            case 'jpeg':
            case 'gif': return 'fas fa-file-image text-purple-500';
            case 'txt': return 'fas fa-file-alt text-gray-500';
            default: return 'fas fa-file text-gray-500';
        }
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Obter ícone apropriado para cada tipo de pasta
    function getFolderIcon(folderName) {
        const iconMap = {
            'diretoria': 'fas fa-users-cog text-purple-500',
            'financeiro': 'fas fa-chart-line text-green-500',
            'marketing': 'fas fa-bullhorn text-orange-500',
            'rh': 'fas fa-user-friends text-blue-500',
            'recursos humanos': 'fas fa-user-friends text-blue-500',
            'operacional': 'fas fa-cogs text-gray-600',
            'juridico': 'fas fa-balance-scale text-indigo-500',
            'jurídico': 'fas fa-balance-scale text-indigo-500',
            'vendas': 'fas fa-handshake text-yellow-500',
            'compras': 'fas fa-shopping-cart text-pink-500',
            'ti': 'fas fa-laptop-code text-cyan-500',
            'tecnologia da informação': 'fas fa-laptop-code text-cyan-500',
            'qualidade': 'fas fa-certificate text-emerald-500',
            'logistica': 'fas fa-truck text-red-500',
            'teste': 'fas fa-flask text-lime-500',
            'teste 2': 'fas fa-vial text-teal-500',
            'default': 'fas fa-folder text-blue-500'
        };

        const key = folderName.toLowerCase();
        return iconMap[key] || iconMap['default'];
    }

    // Converter nome de exibição para nome interno da pasta
    function getFolderNameFromDisplay(displayName) {
        if (!isOnlineMode || !storageManager) return null;

        const discoveredBuckets = storageManager.getDiscoveredBuckets();

        for (const [internalName, bucketName] of Object.entries(discoveredBuckets)) {
            const display = storageManager.getDisplayName(internalName);
            if (display === displayName) {
                return internalName;
            }
        }

        // Fallback para compatibilidade
        const nameMap = {
            'Diretoria': 'diretoria',
            'Financeiro': 'financeiro',
            'Marketing': 'marketing',
            'Recursos Humanos': 'rh',
            'Operacional': 'operacional',
            'Jurídico': 'juridico'
        };

        return nameMap[displayName] || displayName.toLowerCase();
    }

    async function openModal(displayName, files) {
        modalTitle.textContent = displayName;
        modalContent.innerHTML = '';

        // Converter nome de exibição para nome interno
        const folderName = getFolderNameFromDisplay(displayName);

        // Adicionar botão de upload se estiver online
        if (isOnlineMode && storageManager && folderName) {
            const uploadSection = document.createElement('div');
            uploadSection.className = 'mb-6 p-4 bg-blue-50 rounded-lg border-2 border-dashed border-blue-300';

            const uploadTitle = document.createElement('h3');
            uploadTitle.className = 'text-lg font-semibold text-blue-700 mb-2';
            uploadTitle.textContent = 'Upload de Arquivos';

            const uploadInput = document.createElement('input');
            uploadInput.type = 'file';
            uploadInput.multiple = true;
            uploadInput.className = 'mb-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100';
            uploadInput.accept = '.pdf,.docx,.doc,.xlsx,.xls,.png,.jpg,.jpeg,.gif,.txt';

            const uploadBtn = document.createElement('button');
            uploadBtn.className = 'bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded-lg';
            uploadBtn.textContent = 'Enviar Arquivos';
            uploadBtn.onclick = () => handleFileUpload(folderName, uploadInput.files);

            uploadSection.appendChild(uploadTitle);
            uploadSection.appendChild(uploadInput);
            uploadSection.appendChild(uploadBtn);
            modalContent.appendChild(uploadSection);
        }

        const fileListContainer = document.createElement('div');
        fileListContainer.className = 'space-y-3';

        files.forEach(file => {
            const fileItem = document.createElement('div');
            fileItem.className = 'bg-white p-4 rounded-lg shadow-sm flex items-center justify-between hover:bg-blue-50 transition-colors duration-200 border border-gray-200';

            const fileInfo = document.createElement('div');
            fileInfo.className = 'flex items-center space-x-4 flex-1';

            const icon = document.createElement('i');
            icon.className = `${getFileIconClass(file.name)} fa-2x`;

            const fileDetails = document.createElement('div');
            fileDetails.className = 'flex flex-col';

            const fileName = document.createElement('span');
            fileName.className = 'text-gray-800 font-medium';
            fileName.textContent = file.name;

            const fileMetadata = document.createElement('span');
            fileMetadata.className = 'text-gray-500 text-sm';
            let metadataText = '';
            if (file.size) {
                metadataText += formatFileSize(file.size);
            }
            if (file.lastModified) {
                const date = new Date(file.lastModified);
                metadataText += ` • ${date.toLocaleDateString('pt-BR')}`;
            }
            fileMetadata.textContent = metadataText;

            const actionButtons = document.createElement('div');
            actionButtons.className = 'flex space-x-2';

            const downloadBtn = document.createElement('button');
            downloadBtn.className = 'bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200';
            downloadBtn.innerHTML = '<i class="fas fa-download"></i><span>Download</span>';
            downloadBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                handleFileDownload(folderName, file);
            });

            // Botão de deletar (apenas no modo online)
            if (isOnlineMode && storageManager && folderName) {
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'bg-red-500 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200';
                deleteBtn.innerHTML = '<i class="fas fa-trash"></i><span>Deletar</span>';
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    handleFileDelete(folderName, file);
                });
                actionButtons.appendChild(deleteBtn);
            }

            fileDetails.appendChild(fileName);
            if (metadataText) {
                fileDetails.appendChild(fileMetadata);
            }

            fileInfo.appendChild(icon);
            fileInfo.appendChild(fileDetails);
            actionButtons.appendChild(downloadBtn);
            fileItem.appendChild(fileInfo);
            fileItem.appendChild(actionButtons);
            fileListContainer.appendChild(fileItem);
        });

        if (files.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'text-center text-gray-500 py-8';
            emptyMessage.innerHTML = '<i class="fas fa-folder-open fa-3x mb-4"></i><p>Nenhum arquivo encontrado nesta pasta</p>';
            fileListContainer.appendChild(emptyMessage);
        }

        modalContent.appendChild(fileListContainer);
        folderModal.classList.remove('hidden');
        folderModal.classList.add('flex');
    }

    // Funções para manipular arquivos
    async function handleFileUpload(folderName, files) {
        if (!files || files.length === 0) {
            alert('Selecione pelo menos um arquivo para upload.');
            return;
        }

        const uploadResults = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            console.log(`Fazendo upload de ${file.name}...`);

            try {
                const result = await storageManager.uploadFile(folderName, file);
                if (result.success) {
                    uploadResults.push({ file: file.name, success: true });
                    console.log(`Upload de ${file.name} concluído!`);
                } else {
                    uploadResults.push({ file: file.name, success: false, error: result.error });
                    console.error(`Erro no upload de ${file.name}:`, result.error);
                }
            } catch (error) {
                uploadResults.push({ file: file.name, success: false, error: error.message });
                console.error(`Erro no upload de ${file.name}:`, error);
            }
        }

        // Mostrar resultados
        const successCount = uploadResults.filter(r => r.success).length;
        const failCount = uploadResults.length - successCount;

        let message = `Upload concluído!\n`;
        message += `✅ ${successCount} arquivo(s) enviado(s) com sucesso\n`;
        if (failCount > 0) {
            message += `❌ ${failCount} arquivo(s) falharam\n\n`;
            message += `Erros:\n`;
            uploadResults.filter(r => !r.success).forEach(r => {
                message += `• ${r.file}: ${r.error}\n`;
            });
        } alert(message);

        // Recarregar a lista de arquivos apenas se houve uploads bem-sucedidos
        if (successCount > 0) {
            closeModal();
            // Aguardar um pouco antes de recarregar para evitar conflitos
            setTimeout(async () => {
                console.log('🔄 Atualizando interface após upload bem-sucedido...');
                if (isAppFullyLoaded) {
                    // Se o app já está carregado, apenas recarregar o conteúdo específico
                    await refreshBrowserContent();
                } else {
                    // Se ainda não está carregado, fazer carregamento completo
                    await loadAndRenderFiles();
                }
            }, 800);
        }
    }

    async function handleFileDownload(folderName, file) {
        if (isOnlineMode && storageManager) {
            console.log(`Iniciando download de ${file.name} do Supabase...`);
            const result = await storageManager.downloadFile(folderName, file.name);
            if (!result.success) {
                alert(`Erro no download: ${result.error}`);
            }
        } else {
            // Modo offline - simular download
            console.log(`Simulando download de: ${file.name}`);
            alert(`Download simulado de ${file.name}\n(Modo offline)`);
        }
    }

    async function handleFileDelete(folderName, file) {
        if (!confirm(`Tem certeza que deseja deletar o arquivo "${file.name}"?\n\nEsta ação não pode ser desfeita.`)) {
            return;
        }

        if (isOnlineMode && storageManager) {
            console.log(`Deletando ${file.name} do Supabase...`);
            const result = await storageManager.deleteFile(folderName, file.name); if (result.success) {
                alert(`Arquivo "${file.name}" deletado com sucesso!`);
                closeModal();
                // Aguardar um pouco antes de recarregar para evitar conflitos
                setTimeout(async () => {
                    console.log('🔄 Atualizando interface após exclusão bem-sucedida...');
                    if (isAppFullyLoaded) {
                        // Se o app já está carregado, apenas recarregar o conteúdo específico
                        await refreshBrowserContent();
                    } else {
                        // Se ainda não está carregado, fazer carregamento completo
                        await loadAndRenderFiles();
                    }
                }, 800);
            } else {
                alert(`Erro ao deletar arquivo: ${result.error}`);
            }
        }
    }

    function closeModal() {
        folderModal.classList.add('hidden');
        folderModal.classList.remove('flex');
    } async function renderBrowser(data) {
        console.log('🎨 [RENDER] === INÍCIO DE RENDERIZAÇÃO ===');
        console.log('🎨 [RENDER] Dados recebidos para renderização:', data);
        console.log('🎨 [RENDER] Tipo de dados:', typeof data);
        console.log('🎨 [RENDER] Modo atual:', isOnlineMode ? 'ONLINE' : 'OFFLINE');
        console.log('🎨 [RENDER] Chaves dos dados:', Object.keys(data));
        console.log('🎨 [RENDER] Total de itens a renderizar:', Object.keys(data).length);

        // VERIFICAÇÃO DE SEGURANÇA: Em modo online, verificar se não há buckets fictícios
        if (isOnlineMode) {
            const suspiciousBuckets = Object.keys(data).filter(key =>
                ['Documents', 'Files', 'Uploads', 'documents', 'files', 'uploads'].includes(key)
            );
            if (suspiciousBuckets.length > 0) {
                console.error('🚨 [SECURITY] BUCKETS FICTÍCIOS DETECTADOS:', suspiciousBuckets);
                console.error('🚨 [SECURITY] Estes buckets não deveriam existir em modo online!');
                console.error('🚨 [SECURITY] Forçando dados vazios para evitar renderização de buckets falsos');
                data = {}; // Forçar dados vazios se buckets fictícios forem detectados
            }
        }

        // Remove o indicador de carregamento
        const loadingIndicator = document.getElementById('loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }

        fileBrowser.innerHTML = '';
        // Adicionar indicador de modo
        const modeIndicator = document.createElement('div');
        modeIndicator.className = `mb-6 p-3 rounded-lg text-center ${isOnlineMode ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`;
        modeIndicator.innerHTML = `
            <i class="fas ${isOnlineMode ? 'fa-cloud' : 'fa-wifi-slash'} mr-2"></i>
            <strong>Modo ${isOnlineMode ? 'Online' : 'Offline'}:</strong> 
            ${isOnlineMode ? 'Conectado ao Supabase Storage' : 'Usando dados locais'}
        `;
        fileBrowser.appendChild(modeIndicator);

        // Verificar se há dados para exibir
        const folderCount = Object.keys(data).length;

        if (folderCount === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'text-center py-12';
            emptyMessage.innerHTML = `
                <div class="bg-gray-50 rounded-lg p-8 max-w-md mx-auto">
                    <i class="fas fa-folder-open fa-4x text-gray-400 mb-4"></i>
                    <h3 class="text-xl font-semibold text-gray-700 mb-2">Nenhum bucket encontrado</h3>
                    <p class="text-gray-500 mb-4">
                        ${isOnlineMode
                    ? 'Não foram encontrados buckets de documentos no Supabase Storage. Crie buckets com sufixo "-docs" para começar.'
                    : 'Conecte-se à internet para acessar os documentos no Supabase Storage.'
                }
                    </p>
                    ${isOnlineMode
                    ? '<p class="text-sm text-blue-600">💡 Exemplo: "financeiro-docs", "rh-docs", "marketing-docs"</p>'
                    : ''
                }
                </div>
            `;
            fileBrowser.appendChild(emptyMessage);
            return;
        }

        // Adicionar estatísticas se estiver online
        if (isOnlineMode && storageManager) {
            try {
                const stats = await storageManager.getStorageStats();
                const statsContainer = document.createElement('div');
                statsContainer.className = 'mb-6 bg-blue-50 p-4 rounded-lg';

                let statsHtml = '<h3 class="text-lg font-semibold text-blue-800 mb-2">📊 Estatísticas de Storage</h3>';
                statsHtml += '<div class="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">';

                for (const [folder, stat] of Object.entries(stats)) {
                    statsHtml += `
                        <div class="bg-white p-2 rounded">
                            <div class="font-medium text-blue-700">${stat.displayName || folder}</div>
                            <div class="text-gray-600">${stat.fileCount} arquivo(s)</div>
                            <div class="text-gray-500">${stat.totalSizeMB} MB</div>
                        </div>
                    `;
                }

                statsHtml += '</div>';
                statsContainer.innerHTML = statsHtml;
                fileBrowser.appendChild(statsContainer);
            } catch (error) {
                console.error('Erro ao carregar estatísticas:', error);
            }
        } for (const folder in data) {
            console.log(`🎨 [RENDER] Renderizando card para: "${folder}"`);
            console.log(`🎨 [RENDER] Fonte dos dados: ${isOnlineMode ? 'Supabase Storage' : 'Fallback Local'}`);
            console.log(`🎨 [RENDER] Número de arquivos: ${data[folder].length}`);

            const folderEl = document.createElement('div');
            folderEl.className = 'bg-white p-6 rounded-lg shadow-md mb-6 flex flex-col items-center hover:shadow-lg transition-shadow duration-300';

            const folderIcon = document.createElement('i');
            folderIcon.className = getFolderIcon(folder);
            folderIcon.style.fontSize = '3rem';
            folderIcon.style.marginBottom = '0.75rem';

            const folderTitle = document.createElement('h2');
            folderTitle.className = 'text-xl font-bold text-gray-800 mb-2';
            folderTitle.textContent = folder;

            const fileCount = document.createElement('p');
            fileCount.className = 'text-gray-600 text-sm mb-4';
            fileCount.textContent = `${data[folder].length} arquivo(s)`;

            const openButton = document.createElement('button');
            openButton.className = 'bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full transition-all duration-300 flex items-center space-x-2';
            openButton.innerHTML = '<i class="fas fa-folder-open"></i><span>Abrir Pasta</span>';

            openButton.addEventListener('click', () => {
                openModal(folder, data[folder]);
            });

            folderEl.appendChild(folderIcon);
            folderEl.appendChild(folderTitle);
            folderEl.appendChild(fileCount);
            folderEl.appendChild(openButton);
            fileBrowser.appendChild(folderEl);
        }

        console.log('🎨 [RENDER] === FIM DE RENDERIZAÇÃO ===');
        console.log('🎨 [RENDER] Cards renderizados com sucesso!');
        console.log('🎨 [RENDER] Total de cards criados:', Object.keys(data).length);
    }// Função principal para carregar e renderizar arquivos
    async function loadAndRenderFiles() {
        console.log('🔄 [MAIN] loadAndRenderFiles() chamada');
        console.log('🔍 [MAIN] Verificando estado do sistema...');
        console.log(`📊 [STATE] documentsAppFinished: ${window.documentsAppFinished || 'undefined'}`);
        console.log(`📊 [STATE] isAppFullyLoaded: ${isAppFullyLoaded}`);
        console.log(`📊 [STATE] isLoading: ${isLoading}`);

        // Verificar se o sistema já foi finalizado
        if (window.documentsAppFinished) {
            console.log('🛑 [PROTECTION] Sistema já finalizado, ignorando nova tentativa de carregamento');
            console.log('🛑 [PROTECTION] RETORNANDO - execução bloqueada por finalização');
            return;
        }

        // Se o app já foi completamente carregado, não executar novamente
        if (isAppFullyLoaded) {
            console.log('📋 [PROTECTION] App já carregado, ignorando nova tentativa de carregamento');
            console.log('📋 [PROTECTION] RETORNANDO - execução bloqueada por app carregado');
            return;
        }

        // Prevenir múltiplas execuções simultâneas
        if (isLoading) {
            console.log('⚠️ [PROTECTION] Carregamento já em andamento, aguardando...');
            console.log('⚠️ [PROTECTION] RETORNANDO - execução bloqueada por carregamento ativo');
            return;
        }

        isLoading = true;
        console.log('🔄 [MAIN] Iniciando carregamento de arquivos...');
        console.log('🔄 [MAIN] Marcando isLoading = true'); try {
            console.log('📁 [MAIN] Chamando loadFileData()...');
            const fileData = await loadFileData();
            console.log('📁 [MAIN] loadFileData() retornou:', fileData);
            console.log('📁 [MAIN] Tipo dos dados retornados:', typeof fileData);
            console.log('📁 [MAIN] Chaves dos dados:', Object.keys(fileData || {}));
            console.log('📁 [MAIN] É objeto vazio?', Object.keys(fileData || {}).length === 0);

            console.log('🎨 [MAIN] Chamando renderBrowser()...');
            await renderBrowser(fileData);

            console.log('✅ [SUCCESS] Marcando sistema como inicializado');
            isInitialized = true;
            isAppFullyLoaded = true; // Marcar como completamente carregado
            console.log('✅ [SUCCESS] Carregamento concluído - App totalmente inicializado');

            // PARAR COMPLETAMENTE - não permitir mais execuções
            console.log('🛑 [FINALIZE] Marcando sistema como finalizado...');
            window.documentsAppFinished = true;
            console.log('🛑 Sistema finalizado - não haverá mais atualizações automáticas');
        } catch (error) {
            console.error('❌ Erro ao carregar arquivos:', error);
            console.log('⚠️ [ERROR] Sistema em erro - renderizando interface vazia em modo online');

            // Em modo online, sempre renderizar vazio em caso de erro (não usar fallback)
            // Em modo offline, usar fallback apenas se necessário
            if (isOnlineMode) {
                await renderBrowser({}); // Interface vazia em modo online
                console.log('🔍 [ERROR] Modo online: renderizando interface vazia devido ao erro');
            } else {
                await renderBrowser(fallbackFileData); // Fallback apenas em modo offline
                console.log('📄 [ERROR] Modo offline: usando dados de fallback devido ao erro');
            }

            isAppFullyLoaded = true; // Marcar como carregado mesmo com erro para evitar loops

            // PARAR COMPLETAMENTE mesmo com erro
            window.documentsAppFinished = true;
            console.log('🛑 Sistema finalizado com erro - não haverá mais atualizações automáticas');
        } finally {
            isLoading = false;
        }
    }    // Função leve para atualizar apenas o conteúdo do browser (sem recarregar tudo)
    async function refreshBrowserContent() {
        // Verificar se o sistema já foi finalizado
        if (window.documentsAppFinished) {
            console.log('🛑 Sistema finalizado, não atualizando mais conteúdo');
            return;
        }

        console.log('🔄 Atualizando conteúdo do browser...');

        try {
            // Apenas recarregar os dados dos arquivos
            const fileData = await loadFileData();

            // Atualizar apenas a parte do browser que mostra as pastas
            const existingIndicators = document.querySelectorAll('[id*="loading-indicator"], [class*="bg-green-100"], [class*="bg-yellow-100"]');
            existingIndicators.forEach(el => {
                if (el.parentNode === fileBrowser) {
                    // Manter indicadores existentes
                    return;
                }
            });

            // Limpar apenas os cards de pastas, mantendo indicadores
            const folderCards = fileBrowser.querySelectorAll('.bg-white.p-6.rounded-lg.shadow-md');
            folderCards.forEach(card => card.remove());

            // Re-renderizar apenas os cards de pastas
            for (const folder in fileData) {
                const folderEl = document.createElement('div');
                folderEl.className = 'bg-white p-6 rounded-lg shadow-md mb-6 flex flex-col items-center hover:shadow-lg transition-shadow duration-300';

                const folderIcon = document.createElement('i');
                folderIcon.className = getFolderIcon(folder);
                folderIcon.style.fontSize = '3rem';
                folderIcon.style.marginBottom = '0.75rem';

                const folderTitle = document.createElement('h2');
                folderTitle.className = 'text-xl font-bold text-gray-800 mb-2';
                folderTitle.textContent = folder;

                const fileCount = document.createElement('p');
                fileCount.className = 'text-gray-600 text-sm mb-4';
                fileCount.textContent = `${fileData[folder].length} arquivo(s)`;

                const openButton = document.createElement('button');
                openButton.className = 'bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full transition-all duration-300 flex items-center space-x-2';
                openButton.innerHTML = '<i class="fas fa-folder-open"></i><span>Abrir Pasta</span>';

                openButton.addEventListener('click', () => {
                    openModal(folder, fileData[folder]);
                });

                folderEl.appendChild(folderIcon);
                folderEl.appendChild(folderTitle);
                folderEl.appendChild(fileCount);
                folderEl.appendChild(openButton);
                fileBrowser.appendChild(folderEl);
            } console.log('✅ Conteúdo atualizado com sucesso');
            console.log('Conteudo atualizado com sucesso');
        } catch (error) {
            console.error('Erro ao atualizar conteudo:', error);
        }
    }

    closeModalBtn.addEventListener('click', closeModal);
    folderModal.addEventListener('click', (e) => {
        if (e.target === folderModal) {
            closeModal();
        }
    });

    // Inicializar a aplicacao
    loadAndRenderFiles();
});
