# Sistema de Storage - Supabase Integration

## 📁 Visão Geral

O sistema de storage integra o Supabase Storage com as pastas de documentos do projeto, permitindo upload, download, e gerenciamento de arquivos na nuvem com fallback para dados locais.

## 🏗️ Estrutura do Sistema

### 1. Arquivos Principais

```
src/
├── config/
│   ├── supabase.js          # Configuração principal do Supabase
│   └── storage.js           # Manager do Supabase Storage
└── scripts/
    └── documents.js         # Interface de documentos integrada
```

### 2. Mapeamento de Pastas → Buckets

O sistema mapeia pastas locais para buckets do Supabase:

| Pasta Local | Bucket Supabase | Finalidade |
|-------------|-----------------|-------------|
| `Diretoria` | `diretoria-docs` | Documentos da diretoria |
| `Financeiro` | `financeiro-docs` | Relatórios financeiros |
| `Marketing` | `marketing-docs` | Materiais de marketing |
| `RH` | `rh-docs` | Documentos de recursos humanos |
| `Operacional` | `operacional-docs` | Documentos operacionais |
| `Jurídico` | `juridico-docs` | Documentos jurídicos |

## ⚙️ Configuração no Supabase

### 1. Criação Automática de Buckets

Os buckets são criados automaticamente quando o sistema é inicializado. Cada bucket é configurado com:

- **Privacidade**: Privado (requer autenticação)
- **Tipos de arquivo permitidos**:
  - PDFs (`application/pdf`)
  - Word (`.docx`, `.doc`)
  - Excel (`.xlsx`, `.xls`)
  - Imagens (`.png`, `.jpg`, `.jpeg`, `.gif`)
  - Texto (`.txt`)
- **Limite de tamanho**: 50MB por arquivo

### 2. Políticas de Segurança (RLS)

Para configurar as políticas no Supabase Dashboard:

```sql
-- Política para visualizar arquivos (aplicar em cada bucket)
CREATE POLICY "Authenticated users can view files" ON storage.objects
    FOR SELECT USING (auth.role() = 'authenticated');

-- Política para upload de arquivos
CREATE POLICY "Authenticated users can upload files" ON storage.objects
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Política para deletar arquivos
CREATE POLICY "Authenticated users can delete files" ON storage.objects
    FOR DELETE USING (auth.role() = 'authenticated');
```

### 3. Configuração de CORS (se necessário)

No painel do Supabase, adicione as configurações de CORS:

```json
{
  "allowed_origins": ["http://localhost:3000", "https://seu-dominio.com"],
  "allowed_methods": ["GET", "POST", "PUT", "DELETE"],
  "allowed_headers": ["*"]
}
```

## 🎯 Funcionalidades

### 1. Modo Online vs Offline

**Modo Online** (conectado ao Supabase):
- ✅ Upload de arquivos
- ✅ Download real
- ✅ Exclusão de arquivos
- ✅ Sincronização automática
- ✅ Estatísticas de uso
- ✅ Metadados (tamanho, data)

**Modo Offline** (fallback):
- ✅ Visualização de dados locais
- ✅ Download simulado
- ❌ Upload desabilitado
- ❌ Exclusão desabilitada

### 2. Interface do Usuário

#### Indicadores Visuais:
- **Badge de Status**: Mostra se está online/offline
- **Estatísticas**: Contagem de arquivos e uso de espaço
- **Ícones por Tipo**: PDFs, Word, Excel, Imagens, etc.
- **Metadados**: Tamanho do arquivo e data de modificação

#### Funcionalidades por Pasta:
- **Botão "Abrir Pasta"**: Visualizar conteúdo
- **Upload de Múltiplos Arquivos**: Arrastar e soltar ou selecionar
- **Download Individual**: Por arquivo
- **Exclusão com Confirmação**: Somente no modo online

### 3. Gerenciamento de Arquivos

#### Upload:
```javascript
// Exemplo de uso do upload
const result = await storageManager.uploadFile('Diretoria', file);
if (result.success) {
    console.log(`Arquivo enviado: ${result.fileName}`);
}
```

#### Download:
```javascript
// Download automático
await storageManager.downloadFile('Financeiro', 'relatorio.pdf');
```

#### Listagem:
```javascript
// Listar arquivos de uma pasta
const files = await storageManager.listFiles('Marketing');
```

## 🚀 Como Usar

### 1. Para Usuários Finais

1. **Acesso**: Faça login no sistema
2. **Navegação**: Na página de documentos, veja as pastas disponíveis
3. **Upload**: Clique em "Abrir Pasta" → selecione arquivos → "Enviar Arquivos"
4. **Download**: Clique no botão "Download" ao lado do arquivo
5. **Exclusão**: Clique em "Deletar" (confirmação necessária)

### 2. Para Desenvolvedores

#### Adicionando Nova Pasta:

1. **No storage.js**, adicione ao objeto `buckets`:
```javascript
this.buckets = {
    // ...buckets existentes...
    'nova-pasta': 'novo-bucket-name'
};
```

2. **No documents.js**, adicione aos dados de fallback:
```javascript
const fallbackFileData = {
    // ...dados existentes...
    'Nova Pasta': [
        { name: 'exemplo.pdf', type: 'file' }
    ]
};
```

#### Customizando Permissões:

Modifique o método `checkUserPermissions` em `storage.js`:

```javascript
async checkUserPermissions(folderName) {
    const { data: { user } } = await this.supabase.auth.getUser();
    
    // Lógica customizada por pasta/usuário
    if (folderName === 'Diretoria' && user.role !== 'admin') {
        return { canRead: true, canWrite: false, canDelete: false };
    }
    
    return { canRead: true, canWrite: true, canDelete: true };
}
```

## 🔧 Troubleshooting

### Problemas Comuns:

1. **Buckets não são criados**:
   - Verifique as credenciais do Supabase
   - Confirme que o usuário tem permissões de administrador

2. **Upload falha**:
   - Verifique o tamanho do arquivo (máx. 50MB)
   - Confirme o tipo de arquivo permitido
   - Verifique a conexão com internet

3. **Download não funciona**:
   - Verifique as políticas RLS no Supabase
   - Confirme que o arquivo existe no bucket

4. **Modo offline inesperado**:
   - Verifique a inicialização do Supabase
   - Confirme que `SupabaseAuth` está disponível globalmente

### Logs e Debug:

O sistema produz logs detalhados no console:
- `Supabase inicializado com sucesso`
- `Bucket [nome] criado com sucesso`
- `Carregando arquivos do Supabase Storage...`
- `Modo offline: usando dados locais`

## 📊 Monitoramento

### Estatísticas Disponíveis:
- Número de arquivos por pasta
- Tamanho total usado por pasta
- Espaço total utilizado

### Métricas no Dashboard:
Acesse as estatísticas através do método:
```javascript
const stats = await storageManager.getStorageStats();
console.log(stats);
```

## 🔐 Segurança

### Características de Segurança:
- ✅ Autenticação obrigatória
- ✅ Buckets privados por padrão
- ✅ Validação de tipos de arquivo
- ✅ Limite de tamanho de arquivo
- ✅ Row Level Security (RLS)

### Recomendações:
1. Configure políticas RLS específicas por necessidade
2. Implemente roles de usuário para controle granular
3. Monitore o uso de storage regularmente
4. Faça backup dos dados críticos

## 🆕 Próximas Melhorias

### Em Desenvolvimento:
- [ ] Drag & Drop para upload
- [ ] Preview de arquivos no modal
- [ ] Versionamento de arquivos
- [ ] Compartilhamento de links temporários
- [ ] Sincronização offline/online

### Futuras Funcionalidades:
- [ ] Integração com Google Drive/OneDrive
- [ ] Compressão automática de imagens
- [ ] OCR para documentos escaneados
- [ ] Busca por conteúdo de arquivo
- [ ] Histórico de atividades

## 📞 Suporte

Para problemas ou dúvidas:
1. Verifique os logs do console do navegador
2. Consulte a documentação do Supabase Storage
3. Teste em modo incógnito para problemas de cache
4. Verifique as configurações de rede/firewall
