# Transval Tailwind

Este é um projeto de site para a Transval, uma empresa de logística. O site foi construído com HTML, Tailwind CSS e JavaScript, incluindo um sistema completo de autenticação com Supabase.

## Tecnologias Utilizadas

* HTML
* Tailwind CSS
* JavaScript
* Leaflet.js
* Supabase (Autenticação)

## Funcionalidades

### 🌐 Site Principal:
* **Timeline:** Uma linha do tempo interativa que mostra a história da empresa.
* **Mapa de Cobertura:** Um mapa interativo que mostra as filiais da empresa em todo o Brasil.
* **Formulário de Contato:** Um formulário de contato que permite aos usuários enviar uma mensagem para a empresa.
* **Clientes:** Uma seção que exibe os logotipos dos clientes da empresa.

### 🔐 Sistema de Autenticação:
* **Login Seguro:** Autenticação via Supabase com email e senha
* **Área Restrita:** Página de documentos protegida por login
* **Sessão Persistente:** Mantém o usuário logado entre sessões
* **UX Avançada:** Interface moderna com feedback visual
* **Segurança:** Verificação automática de sessão e logout por expiração

### 📁 Sistema de Storage:
* **Supabase Storage:** Integração com storage na nuvem
* **Modo Híbrido:** Funciona online (Supabase) e offline (local)
* **Upload Múltiplo:** Envio de vários arquivos simultaneamente
* **Organização:** 6 departamentos (Diretoria, Financeiro, Marketing, RH, Operacional, Jurídico)
* **Segurança:** Buckets privados com autenticação obrigatória
* **Monitoramento:** Estatísticas de uso e logs detalhados

## Como Executar o Projeto

### 1. Configuração Básica:
1. Clone este repositório.
2. Abra o arquivo `index.html` em seu navegador.

### 2. Configuração da Autenticação (Opcional):
1. Siga as instruções em `SETUP_SUPABASE.md`
2. Configure suas credenciais do Supabase
3. Crie usuários no dashboard do Supabase
4. Teste o sistema com `test-config.html`

### 3. Configuração do Storage (Obrigatório para área de documentos):
1. **Configure os Buckets**: Siga as instruções em `CRIACAO_BUCKETS.md`
2. **Aplique Políticas**: Execute `supabase_storage_policies.sql` no SQL Editor
3. **Teste o Sistema**: Acesse a página de documentos e verifique os logs

⚠️ **IMPORTANTE**: Os buckets devem ser criados manualmente no Dashboard do Supabase antes de usar o sistema de documentos.

## 📁 Estrutura do Projeto

```
├── index.html              # Página principal
├── documents.html          # Área restrita (requer login)
├── test-config.html        # Teste de configuração do Supabase
├── src/
│   ├── config/
│   │   └── supabase.js     # Configuração do Supabase
│   └── scripts/
│       ├── auth.js         # Gerenciador de autenticação
│       ├── login.js        # Modal de login
│       ├── main.js         # Script principal
│       ├── contact.js      # Formulário de contato
│       ├── clientes.js     # Seção de clientes
│       ├── documents.js    # Área de documentos
│       ├── mapa-filiais.js # Mapa de filiais
│       └── presentation.js # Apresentação/timeline
├── Assets/                 # Imagens e recursos
├── README_AUTENTICACAO.md  # Documentação da autenticação
└── SETUP_SUPABASE.md      # Guia de configuração
```

## 🚀 Funcionalidades de Autenticação

### Para Usuários:
- ✅ Login com email e senha
- ✅ Logout com confirmação
- ✅ Acesso à área restrita de documentos
- ✅ Interface responsiva (desktop/mobile)
- ✅ Feedback visual de todas as ações

### Para Desenvolvedores:
- ✅ Sistema modular e extensível
- ✅ Integração completa com Supabase
- ✅ Verificação automática de sessão
- ✅ Tratamento robusto de erros
- ✅ Documentação completa

## 📖 Documentação

- **README_AUTENTICACAO.md** - Resumo completo do sistema de autenticação
- **SETUP_SUPABASE.md** - Guia passo a passo para configurar o Supabase
- **test-config.html** - Ferramenta para testar e debugar a configuração

---

**🎯 O projeto está pronto para produção com sistema de autenticação completo!**
