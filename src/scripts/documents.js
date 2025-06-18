document.addEventListener('DOMContentLoaded', async () => {
    console.log('Dashboard script loaded successfully!');

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
    }

    // Aguardar inicialização do Supabase
    let storageManager = null;
    let isOnlineMode = false;

    // Tentar conectar com Supabase Storage
    try {
        if (window.SupabaseAuth && window.SupabaseAuth.getStorageManager) {
            await new Promise(resolve => {
                const checkSupabase = () => {
                    if (window.SupabaseAuth.getStorageManager()) {
                        storageManager = window.SupabaseAuth.getStorageManager();
                        isOnlineMode = true;
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
    }

    // Dados de fallback (modo offline ou quando Supabase não está disponível)
    const fallbackFileData = {
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
        'RH': [
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
    };    // Carregar dados dos arquivos
    async function loadFileData() {
        if (isOnlineMode && storageManager) {
            console.log('Carregando arquivos do Supabase Storage...');
            const onlineData = {};

            for (const folderName of Object.keys(fallbackFileData)) {
                try {
                    const files = await storageManager.listFiles(folderName);
                    onlineData[folderName] = files;
                } catch (error) {
                    console.error(`Erro ao carregar pasta ${folderName}:`, error);
                    onlineData[folderName] = fallbackFileData[folderName] || [];
                }
            }

            return onlineData;
        } else {
            console.log('Usando dados locais (modo offline)');
            return fallbackFileData;
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

    async function openModal(folderName, files) {
        modalTitle.textContent = folderName;
        modalContent.innerHTML = ''; // Limpa o conteúdo anterior

        // Adicionar botão de upload se estiver online
        if (isOnlineMode && storageManager) {
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
            if (isOnlineMode && storageManager) {
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
    }    // Funções para manipular arquivos
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
        }

        alert(message);

        // Recarregar a lista de arquivos
        if (successCount > 0) {
            closeModal();
            setTimeout(() => {
                loadAndRenderFiles();
            }, 500);
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
            const result = await storageManager.deleteFile(folderName, file.name);

            if (result.success) {
                alert(`Arquivo "${file.name}" deletado com sucesso!`);
                closeModal();
                setTimeout(() => {
                    loadAndRenderFiles();
                }, 500);
            } else {
                alert(`Erro ao deletar arquivo: ${result.error}`);
            }
        }
    }

    function closeModal() {
        folderModal.classList.add('hidden');
        folderModal.classList.remove('flex');
    }

    async function renderBrowser(data) {
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
                            <div class="font-medium text-blue-700">${folder}</div>
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
        }

        for (const folder in data) {
            const folderEl = document.createElement('div');
            folderEl.className = 'bg-white p-6 rounded-lg shadow-md mb-6 flex flex-col items-center hover:shadow-lg transition-shadow duration-300';

            const folderIcon = document.createElement('i');
            folderIcon.className = 'fas fa-folder text-blue-500 text-4xl mb-3';

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

        console.log('Cards rendered successfully!');
    }

    // Função principal para carregar e renderizar arquivos
    async function loadAndRenderFiles() {
        try {
            const fileData = await loadFileData();
            await renderBrowser(fileData);
        } catch (error) {
            console.error('Erro ao carregar arquivos:', error);
            renderBrowser(fallbackFileData);
        }
    }

    closeModalBtn.addEventListener('click', closeModal);
    folderModal.addEventListener('click', (e) => {
        if (e.target === folderModal) {
            closeModal();
        }
    });

    // Inicializar a aplicação
    loadAndRenderFiles();
});
