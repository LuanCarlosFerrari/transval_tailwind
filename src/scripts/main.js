// Main script - inicialização das funcionalidades do site
document.addEventListener('DOMContentLoaded', () => {
    // Aguardar que todas as dependências estejam carregadas
    setTimeout(() => {
        // Verificar se o usuário já está logado ao carregar a página inicial
        if (window.AuthManager && window.AuthManager.isAuthenticated()) {
            console.log('Usuário já está logado');
            // Opcional: mostrar indicação visual de que o usuário está logado
        }

        // Inicializar outras funcionalidades do site
        console.log('Site inicializado com sucesso');
    }, 100);
});

// Função para verificar se estamos na página de documentos sem autenticação
function checkPageAccess() {
    if (window.location.pathname.includes('documents.html')) {
        // Esta verificação será feita pelo script da própria página documents.html
        console.log('Página de documentos detectada');
    }
}
