-- Políticas de Segurança para Supabase Storage
-- Execute estas políticas no SQL Editor do Supabase Dashboard

-- ================================================
-- POLÍTICAS BÁSICAS PARA TODOS OS BUCKETS
-- ================================================

-- 1. Política para visualizar arquivos (SELECT)
-- Permite que usuários autenticados vejam a lista de arquivos
CREATE POLICY "Authenticated users can view files" ON storage.objects
    FOR SELECT USING (auth.role() = 'authenticated');

-- 2. Política para upload de arquivos (INSERT)
-- Permite que usuários autenticados façam upload
CREATE POLICY "Authenticated users can upload files" ON storage.objects
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 3. Política para deletar arquivos (DELETE)
-- Permite que usuários autenticados deletem arquivos
CREATE POLICY "Authenticated users can delete files" ON storage.objects
    FOR DELETE USING (auth.role() = 'authenticated');

-- 4. Política para atualizar arquivos (UPDATE)
-- Permite que usuários autenticados atualizem metadados
CREATE POLICY "Authenticated users can update files" ON storage.objects
    FOR UPDATE USING (auth.role() = 'authenticated');

-- ================================================
-- POLÍTICAS AVANÇADAS POR BUCKET (OPCIONAL)
-- ================================================

-- Exemplo: Restringir acesso à pasta Diretoria apenas para admins
-- Descomente e personalize conforme necessário

/*
-- Política específica para bucket 'diretoria-docs'
-- Apenas usuários com role 'admin' podem acessar
CREATE POLICY "Only admins can access diretoria bucket" ON storage.objects
    FOR ALL USING (
        bucket_id = 'diretoria-docs' AND 
        auth.jwt() ->> 'role' = 'admin'
    );

-- Política para bucket 'financeiro-docs'
-- Usuários com role 'admin' ou 'financeiro' podem acessar
CREATE POLICY "Admin and finance can access financeiro bucket" ON storage.objects
    FOR ALL USING (
        bucket_id = 'financeiro-docs' AND 
        (auth.jwt() ->> 'role' = 'admin' OR auth.jwt() ->> 'role' = 'financeiro')
    );

-- Política para bucket 'rh-docs'
-- Usuários com role 'admin' ou 'rh' podem acessar
CREATE POLICY "Admin and HR can access RH bucket" ON storage.objects
    FOR ALL USING (
        bucket_id = 'rh-docs' AND 
        (auth.jwt() ->> 'role' = 'admin' OR auth.jwt() ->> 'role' = 'rh')
    );
*/

-- ================================================
-- POLÍTICAS BASEADAS NO USUÁRIO (OPCIONAL)
-- ================================================

-- Exemplo: Cada usuário só pode acessar seus próprios arquivos
-- Descomente se quiser implementar esta funcionalidade

/*
-- Política para arquivos pessoais
-- Usuários só podem ver/modificar arquivos que eles próprios enviaram
CREATE POLICY "Users can only access their own files" ON storage.objects
    FOR ALL USING (auth.uid()::text = (metadata->>'uploaded_by'));

-- Para implementar esta política, você precisa modificar o upload
-- para incluir o ID do usuário nos metadados do arquivo
*/

-- ================================================
-- POLÍTICAS DE LEITURA PÚBLICA (OPCIONAL)
-- ================================================

-- Exemplo: Permitir acesso público a alguns buckets (como marketing)
-- CUIDADO: Isso torna os arquivos públicos na internet

/*
-- Política para acesso público ao bucket de marketing
CREATE POLICY "Public access to marketing files" ON storage.objects
    FOR SELECT USING (bucket_id = 'marketing-docs');

-- Lembre-se de também tornar o bucket público:
-- UPDATE storage.buckets SET public = true WHERE id = 'marketing-docs';
*/

-- ================================================
-- CRIAÇÃO AUTOMÁTICA DE BUCKETS (OPCIONAL)
-- ================================================

-- Se preferir criar os buckets manualmente em vez de via JavaScript:

/*
-- Criar buckets manualmente
INSERT INTO storage.buckets (id, name, public) VALUES 
    ('diretoria-docs', 'diretoria-docs', false),
    ('financeiro-docs', 'financeiro-docs', false),
    ('marketing-docs', 'marketing-docs', false),
    ('rh-docs', 'rh-docs', false),
    ('operacional-docs', 'operacional-docs', false),
    ('juridico-docs', 'juridico-docs', false);
*/

-- ================================================
-- CONFIGURAÇÃO DE PROFILES (RECOMENDADO)
-- ================================================

-- Tabela para estender informações do usuário
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    role TEXT DEFAULT 'user',
    department TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS na tabela profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Política para que usuários vejam apenas seu próprio perfil
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- Política para que usuários atualizem apenas seu próprio perfil
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Função para criar perfil automaticamente quando usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para executar a função quando um novo usuário é criado
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ================================================
-- AUDITORIA E LOGS (OPCIONAL)
-- ================================================

-- Tabela para registrar atividades nos arquivos
CREATE TABLE IF NOT EXISTS public.file_activity_logs (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    bucket_name TEXT NOT NULL,
    file_name TEXT NOT NULL,
    action TEXT NOT NULL, -- 'upload', 'download', 'delete'
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS na tabela de logs
ALTER TABLE public.file_activity_logs ENABLE ROW LEVEL SECURITY;

-- Política para que apenas admins vejam os logs
CREATE POLICY "Only admins can view activity logs" ON public.file_activity_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- ================================================
-- FUNÇÕES UTILITÁRIAS
-- ================================================

-- Função para verificar se usuário tem acesso a um bucket específico
CREATE OR REPLACE FUNCTION public.user_has_bucket_access(bucket_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    user_role TEXT;
BEGIN
    -- Buscar role do usuário
    SELECT role INTO user_role
    FROM public.profiles
    WHERE id = auth.uid();
    
    -- Admins têm acesso a tudo
    IF user_role = 'admin' THEN
        RETURN TRUE;
    END IF;
    
    -- Verificar acesso específico por bucket
    CASE bucket_name
        WHEN 'diretoria-docs' THEN
            RETURN user_role = 'admin';
        WHEN 'financeiro-docs' THEN
            RETURN user_role IN ('admin', 'financeiro');
        WHEN 'rh-docs' THEN
            RETURN user_role IN ('admin', 'rh');
        WHEN 'marketing-docs' THEN
            RETURN user_role IN ('admin', 'marketing');
        WHEN 'operacional-docs' THEN
            RETURN user_role IN ('admin', 'operacional');
        WHEN 'juridico-docs' THEN
            RETURN user_role IN ('admin', 'juridico');
        ELSE
            RETURN FALSE;
    END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================
-- NOTAS IMPORTANTES
-- ================================================

/*
INSTRUÇÕES DE USO:

1. COPIE E COLE no SQL Editor do seu dashboard Supabase
2. EXECUTE as políticas básicas primeiro (sempre necessárias)
3. DESCOMENTE e personalize as políticas avançadas conforme sua necessidade
4. TESTE as políticas com diferentes usuários
5. MONITORE os logs de acesso regularmente

SEGURANÇA:
- Sempre teste as políticas antes de colocar em produção
- Mantenha backup das políticas funcionais
- Revise permissões periodicamente
- Use roles específicos para diferentes tipos de usuário

PERFORMANCE:
- Políticas muito complexas podem impactar performance
- Use índices apropriados para consultas frequentes
- Monitore o desempenho das queries com políticas ativas
*/
