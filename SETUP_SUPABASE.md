# Configuração do Supabase para Autenticação

## Passos para configurar o Supabase:

### 1. Criar conta no Supabase
- Acesse https://supabase.com
- Crie uma conta gratuita
- Crie um novo projeto

### 2. Obter as credenciais
- No dashboard do seu projeto, vá para Settings > API
- Copie as seguintes informações:
  - Project URL
  - Project API Key (anon/public)

### 3. Configurar as credenciais no projeto
Edite o arquivo `src/config/supabase.js` e substitua:
```javascript
this.SUPABASE_URL = 'YOUR_SUPABASE_URL';
this.SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
```

Por suas credenciais reais:
```javascript
this.SUPABASE_URL = 'https://your-project-id.supabase.co';
this.SUPABASE_ANON_KEY = 'your-anon-key-here';
```

### 4. Configurar autenticação no Supabase
No dashboard do Supabase:
- Vá para Authentication > Settings
- Configure os provedores de login (Email/Password está habilitado por padrão)
- Opcionalmente, configure URLs de redirecionamento se necessário

### 5. Criar usuários
Você pode criar usuários de duas formas:

#### Opção A: Via Dashboard do Supabase
- Vá para Authentication > Users
- Clique em "Add user"
- Preencha email e senha
- O usuário será criado e poderá fazer login

#### Opção B: Via código (registro)
- Descomente a funcionalidade de registro no código se necessário
- Use a função `authManager.register()` para criar novos usuários

### 6. Estrutura da tabela de usuários (opcional)
Se você quiser adicionar informações extras aos usuários:
- Vá para Database > Tables
- A tabela `auth.users` já existe automaticamente
- Você pode criar uma tabela `profiles` para informações adicionais:

```sql
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    role TEXT DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (id)
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários vejam apenas seu próprio perfil
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- Política para permitir que usuários atualizem apenas seu próprio perfil
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);
```

### 7. Políticas de segurança (RLS)
O Supabase usa Row Level Security (RLS) para controlar acesso aos dados:
- As políticas já estão configuradas para a autenticação básica
- Você pode criar políticas personalizadas conforme necessário

### 8. Teste a implementação
1. Abra o projeto no navegador
2. Clique no botão "Login"
3. Use as credenciais de um usuário criado no Supabase
4. Verifique se o redirecionamento para documents.html funciona
5. Teste o logout com confirmação
6. Verifique se o email do usuário aparece no header
7. Observe a mensagem de boas-vindas

## Recursos do sistema implementado:

### Funcionalidades de Autenticação:
- ✅ Login com email e senha
- ✅ Logout com confirmação
- ✅ Verificação de sessão ativa
- ✅ Proteção de rotas (documents.html)
- ✅ Redirecionamento automático
- ✅ Mensagens de erro personalizadas
- ✅ Loading states nos botões
- ✅ Validação de formulários
- ✅ Verificação automática de sessão (5 em 5 minutos)
- ✅ Logout automático por expiração
- ✅ Lembrar último email usado

### Segurança:
- ✅ Autenticação via Supabase (servidor seguro)
- ✅ Tokens JWT automáticos
- ✅ Sessões persistentes
- ✅ Logout automático quando sessão expira
- ✅ Verificação de acesso nas páginas protegidas
- ✅ Validação de formato de email
- ✅ Verificação periódica de sessão
- ✅ Indicadores visuais de segurança

### UX/UI:
- ✅ Modal de login responsivo
- ✅ Feedback visual (loading, mensagens)
- ✅ Design consistente com o site
- ✅ Botões de logout em desktop e mobile
- ✅ Exibição do email do usuário logado
- ✅ Mensagem de boas-vindas
- ✅ Foco automático nos campos
- ✅ Confirmação antes do logout
- ✅ Indicadores de "Conexão segura"

## Próximos passos opcionais:

1. **Recuperação de senha**: Implementar "Esqueci minha senha"
2. **Perfis de usuário**: Adicionar informações extras aos usuários
3. **Níveis de acesso**: Implementar diferentes níveis de permissão
4. **Auditoria**: Log de acessos e ações dos usuários
5. **Multi-fator**: Adicionar autenticação de dois fatores
6. **Notificações**: Alertas de novo login
7. **Sessões múltiplas**: Gerenciar múltiplos dispositivos

## 🆕 Funcionalidades Recentes Adicionadas:

### Interface Avançada:
- **Header com usuário**: Email do usuário logado aparece no header
- **Mensagem de boas-vindas**: Aparece por 5 segundos após login
- **Confirmação de logout**: "Tem certeza que deseja sair?"
- **Último email lembrado**: Sistema salva o último email usado
- **Foco inteligente**: Campos recebem foco apropriado
- **Indicadores de segurança**: "Conexão segura" e "Dados protegidos"

### Segurança Avançada:
- **Verificação automática**: Sessão verificada a cada 5 minutos
- **Logout por expiração**: Automático se sessão expirar
- **Validação de email**: Formato validado antes do envio

## Troubleshooting:

### Erro: "Invalid login credentials"
- Verifique se o usuário foi criado no Supabase
- Confirme que email e senha estão corretos
- Verifique se o email foi confirmado (se necessário)

### Erro: "Failed to fetch"
- Verifique se as credenciais do Supabase estão corretas
- Confirme se o projeto Supabase está ativo
- Verifique a conexão com internet

### Redirecionamento não funciona
- Verifique se os scripts estão carregando na ordem correta
- Confirme se não há erros no console do navegador
- Teste em modo incógnito para limpar cache
