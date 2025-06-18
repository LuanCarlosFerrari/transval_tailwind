// Sistema de Modal Personalizado para Confirmações
class ConfirmModal {
    constructor() {
        this.modalId = 'custom-confirm-modal';
        this.currentResolve = null;
        this.createModal();
    }

    createModal() {
        // Verificar se o modal já existe
        if (document.getElementById(this.modalId)) {
            return;
        }

        const modalHTML = `
            <div id="${this.modalId}" class="fixed inset-0 bg-black bg-opacity-75 z-[950] hidden items-center justify-center p-4 transition-all duration-300">
                <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto border border-gray-200 transform transition-all duration-300 scale-95" id="${this.modalId}-content">
                    <div class="p-6">
                        <!-- Header do Modal -->
                        <div class="flex items-center space-x-3 mb-6">
                            <div id="${this.modalId}-icon" class="w-12 h-12 bg-gradient-to-r rounded-full flex items-center justify-center">
                                <i id="${this.modalId}-icon-class" class="text-white text-xl"></i>
                            </div>
                            <div>
                                <h3 id="${this.modalId}-title" class="text-xl font-bold text-gray-800"></h3>
                                <p id="${this.modalId}-subtitle" class="text-gray-500 text-sm"></p>
                            </div>
                        </div>
                        
                        <!-- Conteúdo -->
                        <div class="mb-6">
                            <p id="${this.modalId}-message" class="text-gray-700 mb-3"></p>
                            <div id="${this.modalId}-extra" class="hidden bg-gray-50 p-3 rounded-lg flex items-center space-x-2">
                                <i id="${this.modalId}-extra-icon" class="text-gray-500"></i>
                                <span id="${this.modalId}-extra-text" class="text-sm text-gray-600"></span>
                            </div>
                        </div>
                        
                        <!-- Botões -->
                        <div class="flex space-x-3">
                            <button id="${this.modalId}-cancel" 
                                class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-xl transition-all duration-200">
                                <i class="fas fa-times mr-2"></i>
                                <span id="${this.modalId}-cancel-text">Cancelar</span>
                            </button>
                            <button id="${this.modalId}-confirm" 
                                class="flex-1 font-semibold py-3 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                                <span id="${this.modalId}-confirm-content">
                                    <i id="${this.modalId}-confirm-icon" class="mr-2"></i>
                                    <span id="${this.modalId}-confirm-text"></span>
                                </span>
                                <span id="${this.modalId}-confirm-loading" class="hidden">
                                    <i class="fas fa-spinner fa-spin mr-2"></i>
                                    <span id="${this.modalId}-loading-text">Processando...</span>
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.setupEventListeners();
    }

    setupEventListeners() {
        const modal = document.getElementById(this.modalId);
        const cancelBtn = document.getElementById(`${this.modalId}-cancel`);
        const confirmBtn = document.getElementById(`${this.modalId}-confirm`);

        cancelBtn.addEventListener('click', () => this.close(false));
        confirmBtn.addEventListener('click', () => this.close(true));

        // Fechar modal clicando fora dele
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.close(false);
            }
        });

        // Fechar modal com tecla Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
                this.close(false);
            }
        });
    } async show(options = {}) {
        const {
            title = 'Confirmação',
            subtitle = '',
            message = 'Tem certeza?',
            confirmText = 'Confirmar',
            cancelText = 'Cancelar',
            confirmIcon = 'fas fa-check',
            type = 'info', // 'info', 'warning', 'danger', 'success'
            extra = null, // { icon: 'fas fa-user', text: 'Texto extra' }
            loadingText = 'Processando...',
            cancelStyle = 'default' // 'default', 'blue'
        } = options;

        return new Promise((resolve) => {
            this.currentResolve = resolve;

            // Configurar conteúdo do modal
            document.getElementById(`${this.modalId}-title`).textContent = title;
            document.getElementById(`${this.modalId}-subtitle`).textContent = subtitle;
            document.getElementById(`${this.modalId}-message`).textContent = message;
            document.getElementById(`${this.modalId}-confirm-text`).textContent = confirmText;
            document.getElementById(`${this.modalId}-cancel-text`).textContent = cancelText;
            document.getElementById(`${this.modalId}-confirm-icon`).className = confirmIcon;
            document.getElementById(`${this.modalId}-loading-text`).textContent = loadingText;

            // Configurar ícone e cor baseado no tipo
            const iconEl = document.getElementById(`${this.modalId}-icon`);
            const iconClass = document.getElementById(`${this.modalId}-icon-class`);
            const confirmBtn = document.getElementById(`${this.modalId}-confirm`);

            switch (type) {
                case 'danger':
                    iconEl.className = 'w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center';
                    iconClass.className = 'fas fa-exclamation-triangle text-white text-xl';
                    confirmBtn.className = 'flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
                    break;
                case 'warning':
                    iconEl.className = 'w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center';
                    iconClass.className = 'fas fa-exclamation-triangle text-white text-xl';
                    confirmBtn.className = 'flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
                    break;
                case 'success':
                    iconEl.className = 'w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center';
                    iconClass.className = 'fas fa-check text-white text-xl';
                    confirmBtn.className = 'flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
                    break;
                default:
                    iconEl.className = 'w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center';
                    iconClass.className = 'fas fa-info text-white text-xl';
                    confirmBtn.className = 'flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
            }

            // Configurar informação extra se fornecida
            const extraEl = document.getElementById(`${this.modalId}-extra`);
            if (extra) {
                document.getElementById(`${this.modalId}-extra-icon`).className = extra.icon;
                document.getElementById(`${this.modalId}-extra-text`).innerHTML = extra.text;
                extraEl.classList.remove('hidden');
            } else {
                extraEl.classList.add('hidden');
            }            // Configurar cor do botão de cancelar
            const cancelBtn = document.getElementById(`${this.modalId}-cancel`);
            if (cancelStyle === 'blue') {
                cancelBtn.className = 'flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200';
                // Atualizar ícone para cor branca
                const cancelIcon = cancelBtn.querySelector('i');
                if (cancelIcon) {
                    cancelIcon.className = 'fas fa-times mr-2 text-white';
                }
            } else {
                cancelBtn.className = 'flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-xl transition-all duration-200';
                // Manter ícone na cor padrão
                const cancelIcon = cancelBtn.querySelector('i');
                if (cancelIcon) {
                    cancelIcon.className = 'fas fa-times mr-2';
                }
            }

            // Mostrar modal
            this.open();
        });
    }

    open() {
        const modal = document.getElementById(this.modalId);
        const modalContent = document.getElementById(`${this.modalId}-content`);

        modal.classList.remove('hidden');
        modal.classList.add('flex');

        // Animação de entrada
        setTimeout(() => {
            modalContent.classList.remove('scale-95');
            modalContent.classList.add('scale-100');
        }, 10);
    }

    close(result) {
        const modal = document.getElementById(this.modalId);
        const modalContent = document.getElementById(`${this.modalId}-content`);

        // Animação de saída
        modalContent.classList.remove('scale-100');
        modalContent.classList.add('scale-95');

        setTimeout(() => {
            modal.classList.add('hidden');
            modal.classList.remove('flex');

            if (this.currentResolve) {
                this.currentResolve(result);
                this.currentResolve = null;
            }
        }, 300);
    }

    setLoading(loading = true) {
        const confirmContent = document.getElementById(`${this.modalId}-confirm-content`);
        const confirmLoading = document.getElementById(`${this.modalId}-confirm-loading`);
        const confirmBtn = document.getElementById(`${this.modalId}-confirm`);
        const cancelBtn = document.getElementById(`${this.modalId}-cancel`);

        if (loading) {
            confirmContent.classList.add('hidden');
            confirmLoading.classList.remove('hidden');
            confirmBtn.disabled = true;
            cancelBtn.disabled = true;
        } else {
            confirmContent.classList.remove('hidden');
            confirmLoading.classList.add('hidden');
            confirmBtn.disabled = false;
            cancelBtn.disabled = false;
        }
    }
}

// Instância global do modal de confirmação
const confirmModal = new ConfirmModal();

// Exportar para uso global
window.ConfirmModal = confirmModal;
