# 🚀 Guia Rápido - Criação de Buckets no Supabase

## ⚠️ IMPORTANTE: Criação Manual de Buckets

Devido às políticas de segurança (RLS), os buckets precisam ser criados manualmente no Dashboard do Supabase. Siga os passos abaixo:

## 📋 Passos para Criar Buckets

### 1. Acesse o Dashboard do Supabase
- Vá para https://supabase.com
- Faça login na sua conta
- Selecione seu projeto

### 2. Navegue até Storage
- No menu lateral, clique em **"Storage"**
- Clique em **"Create a new bucket"**

### 3. Crie os Buckets Necessários

Crie os seguintes buckets (um por vez):

| Nome do Bucket | Visibilidade | Descrição |
|----------------|--------------|-----------|
| `diretoria-docs` | Private | Documentos da diretoria |
| `financeiro-docs` | Private | Relatórios financeiros |
| `marketing-docs` | Private | Materiais de marketing |
| `rh-docs` | Private | Documentos de RH |
| `operacional-docs` | Private | Documentos operacionais |
| `juridico-docs` | Private | Documentos jurídicos |

### 4. Configurações por Bucket

Para cada bucket:
- **Public bucket**: ❌ Deixe DESMARCADO (privado)
- **File size limit**: 52428800 (50MB em bytes)
- **Allowed MIME types**: Deixe vazio (permitir todos os tipos)

### 5. Aplicar Políticas de Segurança

Após criar os buckets, vá para **SQL Editor** e execute:

```sql
-- Política básica para usuários autenticados
CREATE POLICY "Authenticated users can manage files" ON storage.objects
    FOR ALL USING (auth.role() = 'authenticated');
```

## ✅ Verificação

Após criar os buckets:

1. **Recarregue a página** de documentos do sistema
2. **Verifique o console** do navegador (F12)
3. **Procure por mensagens**:
   - ✅ `Bucket [nome] encontrado`
   - ⚠️ `Bucket [nome] não encontrado`

## 🔧 Solução de Problemas

### Bucket não encontrado
```
⚠️ Bucket diretoria-docs não encontrado - será criado manualmente no dashboard
```
**Solução**: Crie o bucket manualmente conforme instruções acima.

### Erro de RLS (Row Level Security)
```
StorageApiError: new row violates row-level security policy
```
**Solução**: Execute as políticas SQL no dashboard.

### Erro de permissão
```
Erro ao listar arquivos do bucket: permission denied
```
**Solução**: Verifique se as políticas estão aplicadas corretamente.

## 🎯 Resultado Esperado

Após configurar corretamente, você deve ver no console:

```
Verificando buckets do Supabase Storage...
Buckets encontrados: ['diretoria-docs', 'financeiro-docs', ...]
✅ Bucket diretoria-docs encontrado
✅ Bucket financeiro-docs encontrado
✅ Bucket marketing-docs encontrado
✅ Bucket rh-docs encontrado
✅ Bucket operacional-docs encontrado
✅ Bucket juridico-docs encontrado
Storage Manager inicializado com sucesso
```

## 📞 Suporte

Se ainda tiver problemas:
1. Verifique se está logado no sistema
2. Confirme que os buckets foram criados com os nomes exatos
3. Verifique o console do navegador para mensagens de erro
4. Teste em modo incógnito para limpar cache
