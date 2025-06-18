// Sistema de contato - sem exports para compatibilidade com navegador
const contactContent = {
    title: "Vamos acelerar sua logística?",
    description: "Juntos, encontramos a rota ideal para o seu sucesso. Fale com nossos especialistas!!",
    buttonTextOpen: "Solicitar Cotação",
    buttonTextClose: "Fechar Formulário",
    formHtml: `
        <form id="cotacao-form" class="mt-8 text-left max-w-xl mx-auto bg-blue-950 p-8 rounded-lg shadow-xl border border-blue-800">
            <h3 class="text-3xl font-bold mb-8 text-white text-center">Formulário de Cotação</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                    <label for="nome" class="block text-gray-300 text-sm font-semibold mb-2">Nome Completo:</label>
                    <input type="text" id="nome" name="nome" required class="w-full py-3 px-4 bg-blue-900 text-white border border-blue-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-500 transition-colors">
                </div>
                <div>
                    <label for="email" class="block text-gray-300 text-sm font-semibold mb-2">Email:</label>
                    <input type="email" id="email" name="email" required class="w-full py-3 px-4 bg-blue-900 text-white border border-blue-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-500 transition-colors">
                </div>
            </div>
            <div class="mb-6">
                <label for="telefone" class="block text-gray-300 text-sm font-semibold mb-2">Telefone:</label>
                <input type="tel" id="telefone" name="telefone" class="w-full py-3 px-4 bg-blue-900 text-white border border-blue-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-500 transition-colors">
            </div>
            <div class="mb-8">
                <label for="mensagem" class="block text-gray-300 text-sm font-semibold mb-2">Mensagem:</label>
                <textarea id="mensagem" name="mensagem" rows="5" required class="w-full py-3 px-4 bg-blue-900 text-white border border-blue-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-500 transition-colors resize-none"></textarea>
            </div>
            <div class="text-center">
                <button type="submit" class="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold px-10 py-4 rounded-full text-lg shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-950 focus:ring-orange-500">
                    Enviar Solicitação
                </button>
            </div>
        </form>
    `
};

// Função para inicializar o sistema de contato
function initContact() {
    const titleEl = document.getElementById('contact-title');
    const descriptionEl = document.getElementById('contact-description');
    const buttonEl = document.getElementById('contact-button');
    const formContainerEl = document.getElementById('contact-form-container');

    if (!titleEl || !descriptionEl || !buttonEl || !formContainerEl) {
        return;
    }

    titleEl.textContent = contactContent.title;
    descriptionEl.textContent = contactContent.description;
    buttonEl.textContent = contactContent.buttonTextOpen;

    buttonEl.addEventListener('click', () => {
        const isHidden = formContainerEl.classList.contains('hidden');
        if (isHidden) {
            formContainerEl.innerHTML = contactContent.formHtml;
            formContainerEl.classList.remove('hidden');
        } else {
            formContainerEl.innerHTML = '';
            formContainerEl.classList.add('hidden');
        }        buttonEl.textContent = isHidden ? contactContent.buttonTextClose : contactContent.buttonTextOpen;
    });
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', initContact);
