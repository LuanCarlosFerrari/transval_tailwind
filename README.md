# 🚛 Transval - Sistema de Logística Premium

> Sistema web completo para a Transval, empresa de logística, com autenticação segura, sistema de documentos na nuvem e interface moderna responsiva.

## 🌟 Visão Geral

Este projeto é um site institucional moderno para a Transval que combina apresentação da empresa com um sistema completo de gerenciamento de documentos. Inclui autenticação robusta, integração com Supabase Storage e interface responsiva construída com Tailwind CSS.

## ⚡ Tecnologias Utilizadas

### Frontend
- **HTML5** - Estrutura semântica
- **Tailwind CSS** - Framework CSS utilitário
- **JavaScript ES6+** - Lógica interativa
- **Leaflet.js** - Mapas interativos
- **Font Awesome** - Ícones

### Backend & Nuvem
- **Supabase** - Backend as a Service
  - Autenticação JWT
  - Storage na nuvem
  - Row Level Security (RLS)
- **PostgreSQL** - Banco de dados (via Supabase)

## 🚀 Funcionalidades Principais

### 🌐 Site Institucional
- **✅ Timeline Interativa** - História da empresa desde 1987
- **✅ Mapa de Cobertura** - Filiais em todo o Brasil com Leaflet.js
- **✅ Formulário de Contato** - Sistema de cotação integrado
- **✅ Galeria de Clientes** - Logos dos parceiros com animação
- **✅ Design Responsivo** - Interface adaptável para todos os dispositivos

### 🔐 Sistema de Autenticação
- **✅ Login Seguro** - Email/senha com validação
- **✅ Sessão Persistente** - JWT tokens automáticos
- **✅ Área Protegida** - Página de documentos restrita
- **✅ Logout Confirmado** - Desconexão segura
- **✅ Interface Moderna** - Modal responsivo com estados de loading
- **✅ Verificação Automática** - Checagem de sessão a cada 5 minutos

### 📁 Sistema de Documentos
- **✅ Storage em Nuvem** - Integração completa com Supabase Storage
- **✅ Modo Híbrido** - Funciona online e offline
- **✅ Upload Múltiplo** - Envio de vários arquivos simultâneos
- **✅ Download Real** - Arquivos servidos diretamente da nuvem
- **✅ Organização Departamental** - 6+ departamentos configuráveis
- **✅ Descoberta Dinâmica** - Sistema detecta buckets automaticamente
- **✅ Validação de Arquivos** - Tipos e tamanhos permitidos
- **✅ Estatísticas de Uso** - Monitoramento de storage por departamento

## 📁 Estrutura do Projeto

```
transval_tailwind/
├── 📄 index.html                    # Página principal
├── 📁 src/
│   ├── 📁 pages/
│   │   ├── documents.html           # Área restrita de documentos  
│   │   └── debug-buckets.html       # Ferramenta de debug
│   ├── 📁 config/
│   │   ├── supabase.js             # Configuração Supabase
│   │   └── storage.js              # Manager de Storage
│   └── 📁 scripts/
│       ├── auth.js                 # Sistema de autenticação (unificado)
│       ├── documents.js            # Interface de documentos
│       ├── main.js                 # Script principal
│       ├── contact.js              # Formulário de contato
│       ├── clientes.js             # Galeria de clientes
│       ├── presentation.js         # Timeline da empresa
│       ├── mapa-filiais.js         # Mapa interativo
│       └── confirm-modal.js        # Modais de confirmação
├── 📁 Assets/                      # Imagens e recursos
├── 📁 docs/                        # Documentação (backup)
└── 📄 README.md                    # Este arquivo
```

## 🛠️ Configuração e Instalação

### 1. 📋 Pré-requisitos
- Conta no [Supabase](https://supabase.com) (gratuita)
- Navegador moderno (Chrome, Firefox, Safari, Edge)
- Servidor web local (opcional para desenvolvimento)

### 2. ⚙️ Configuração do Supabase

#### Passo 1: Criar Projeto
1. Acesse https://supabase.com e crie uma conta
2. Crie um novo projeto
3. Anote a **Project URL** e **API Key** (anon/public)

#### Passo 2: Configurar Credenciais
Edite `src/config/supabase.js`:
```javascript
this.SUPABASE_URL = 'https://seu-projeto.supabase.co';
this.SUPABASE_ANON_KEY = 'sua-chave-anon-aqui';
```

#### Passo 3: Criar Buckets de Storage
No dashboard Supabase → Storage, crie os buckets:
- `diretoria-docs` (Private)
- `financeiro-docs` (Private) 
- `marketing-docs` (Private)
- `rh-docs` (Private)
- `operacional-docs` (Private)
- `juridico-docs` (Private)

#### Passo 4: Aplicar Políticas de Segurança
No SQL Editor, execute:
```sql
-- Política para usuários autenticados
CREATE POLICY "Authenticated users can manage files" ON storage.objects
    FOR ALL USING (auth.role() = 'authenticated');
```

#### Passo 5: Criar Usuários
No dashboard → Authentication → Users:
- Clique "Add user"
- Adicione email e senha
- Usuário pode fazer login imediatamente

### 3. 🚀 Executar o Projeto

#### Desenvolvimento Local:
```bash
# Servir arquivos localmente (Python)
python -m http.server 8000

# Ou com Node.js
npx serve .

# Ou simplesmente abrir index.html no navegador
```

#### Produção:
- Faça upload dos arquivos para qualquer servidor web
- Configure HTTPS (recomendado para Supabase)
- Ajuste URLs se necessário

## 📖 Guias de Uso

### 👤 Para Usuários Finais

#### Login e Acesso:
1. **Página Principal**: Navegue pelo site normalmente
2. **Login**: Clique no botão "Login" no header
3. **Credenciais**: Use email/senha fornecidos pelo administrador
4. **Documentos**: Após login, acesse automaticamente a área restrita
5. **Upload**: Na área de documentos, clique "Abrir Pasta" → selecione arquivos
6. **Download**: Clique no ícone de download ao lado de cada arquivo
7. **Logout**: Use o botão "Sair" quando terminar

#### Recursos Disponíveis:
- **📊 Dashboard**: Estatísticas de uso por departamento
- **🔍 Busca**: Localize arquivos rapidamente
- **📱 Mobile**: Interface responsiva para smartphones
- **🔄 Sincronização**: Arquivos sempre atualizados
- **💾 Cache**: Funcionamento offline com dados locais

### 👨‍💻 Para Desenvolvedores

#### Estrutura do Sistema:
```javascript
// Sistema de Autenticação Unificado
window.AuthManager {
  // Métodos principais
  .login(email, password)
  .logout()
  .isAuthenticated()
  .getCurrentUser()
  
  // Interface
  .showLoginModal()
  .hideLoginModal()
}

// Manager de Storage
window.SupabaseAuth.getStorageManager() {
  // Operações de arquivo
  .uploadFiles(folderName, files)
  .listFiles(folderName)
  .downloadFile(folderName, fileName)
  .deleteFile(folderName, fileName)
  
  // Descoberta dinâmica
  .initializeBuckets()
  .getDiscoveredBuckets()
}
```

#### Personalização:
1. **Departamentos**: Adicione novos buckets no Supabase
2. **Temas**: Modifique classes Tailwind CSS
3. **Funcionalidades**: Estenda classes em `auth.js` e `documents.js`
4. **Validações**: Ajuste tipos de arquivo e tamanhos em `storage.js`

## 🔧 Sistema de Buckets Dinâmico

### 🎯 Descoberta Automática
O sistema detecta automaticamente buckets existentes no Supabase:

| Bucket Supabase | Nome Exibido | Ícone | Cor |
|----------------|---------------|-------|-----|
| `diretoria-docs` | Diretoria | 👥 | Roxo |
| `financeiro-docs` | Financeiro | 📈 | Verde |
| `marketing-docs` | Marketing | 📢 | Laranja |
| `rh-docs` | Recursos Humanos | 👫 | Azul |
| `operacional-docs` | Operacional | ⚙️ | Cinza |
| `juridico-docs` | Jurídico | ⚖️ | Índigo |

### ✨ Vantagens:
- **Zero Configuração**: Adicione buckets sem modificar código
- **Flexibilidade Total**: Suporte a qualquer estrutura organizacional
- **Modo Híbrido**: Online (Supabase) + Offline (fallback local)

## 🛡️ Segurança e Políticas

### 🔐 Autenticação
- **JWT Tokens**: Gerenciados automaticamente pelo Supabase
- **Sessão Segura**: Verificação automática de expiração
- **Logout Limpo**: Remove tokens e redireciona adequadamente

### 🗄️ Storage
- **Buckets Privados**: Acesso apenas para usuários autenticados
- **RLS Habilitado**: Row Level Security em todas as operações
- **Validação Dupla**: Frontend + backend verificam tipos/tamanhos
- **Auditoria**: Logs de todas as operações

### 📄 Tipos de Arquivo Suportados
- **📄 Documentos**: PDF, DOC, DOCX
- **📊 Planilhas**: XLS, XLSX
- **🖼️ Imagens**: PNG, JPG, JPEG, GIF
- **📝 Texto**: TXT
- **🗜️ Limite**: 50MB por arquivo

## 🐛 Solução de Problemas

### ❌ Login não funciona
1. **Verificar credenciais** no `supabase.js`
2. **Confirmar usuário** existe no dashboard
3. **Abrir console** (F12) para ver erros
4. **Testar** com `debug-buckets.html`

### ❌ Buckets não encontrados
```
⚠️ Bucket diretoria-docs não encontrado
```
**Solução**: Criar buckets manualmente no dashboard Supabase

### ❌ Erro de RLS
```
StorageApiError: new row violates row-level security policy
```
**Solução**: Executar políticas SQL no dashboard

### ❌ Modo offline inesperado
1. **Verificar conexão** com internet
2. **Conferir credenciais** do Supabase
3. **Recarregar página** para tentar reconectar

## 📊 Monitoramento e Estatísticas

### 📈 Métricas Disponíveis
- **Arquivos por departamento**: Contagem em tempo real
- **Uso de storage**: Espaço ocupado por pasta
- **Status de conexão**: Online/offline com indicador visual
- **Atividade de usuários**: Logs de upload/download

### 🔍 Debug e Logs
- **Console detalhado**: Logs de todas as operações
- **Página de debug**: `debug-buckets.html` para testes
- **Fallback gracioso**: Sistema continua funcionando offline

## 📋 Changelog Resumido

### Versão 3.0.0 (Atual)
- ✅ **Scripts Unificados**: `auth.js` combina autenticação + login
- ✅ **Páginas Organizadas**: Movidas para `src/pages/`
- ✅ **Sistema Dinâmico**: Descoberta automática de buckets
- ✅ **Storage Híbrido**: Online/offline seamless

### Versão 2.0.0
- ✅ **Supabase Storage**: Integração completa
- ✅ **Upload Múltiplo**: Interface drag & drop
- ✅ **Departamentos**: 6 pastas organizacionais

### Versão 1.0.0
- ✅ **Site Institucional**: Timeline, mapa, contato
- ✅ **Autenticação**: Sistema completo com Supabase
- ✅ **Design Responsivo**: Tailwind CSS

## 🤝 Contribuição

Para contribuir com o projeto:

1. **Fork** este repositório
2. **Crie uma branch** para sua feature
3. **Commit** suas mudanças
4. **Push** para a branch
5. **Abra um Pull Request**

## 📄 Licença

Este projeto é proprietário da **Transval Logística**. Todos os direitos reservados.

## 📞 Suporte

Para suporte técnico:
- **📧 Email**: Contato através do formulário no site
- **🐛 Issues**: Use o sistema de issues do repositório
- **📖 Docs**: Documentação completa neste README

---

**🎯 O projeto está pronto para produção com sistema completo de autenticação e storage!** 🚀
