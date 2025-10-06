-- Criar políticas para admins acessarem recursos educacionais
CREATE POLICY "Admins can manage educational_resources" 
ON educational_resources 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Adicionar função para carregar e-books e vídeos para admins do localStorage
-- Este é um approach temporário para admins verem os dados fictícios enquanto desenvolvemos o sistema completo
COMMENT ON POLICY "Admins can manage educational_resources" ON educational_resources IS 
'Permite que administradores gerenciem recursos educacionais. Para produção, e-books e vídeos devem ser carregados via admin dashboard.';

-- Criar trigger para limpar registros duplicados em educational_plans
-- Isso resolve o problema de múltiplos registros que causava o erro 406
CREATE OR REPLACE FUNCTION clean_duplicate_educational_plans()
RETURNS trigger AS $$
BEGIN
    -- Remove planos anteriores do mesmo usuário com mesmo status para evitar duplicatas
    DELETE FROM educational_plans 
    WHERE user_id = NEW.user_id 
    AND status = NEW.status 
    AND id != NEW.id
    AND created_at < NEW.created_at;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_clean_duplicate_plans
    AFTER INSERT ON educational_plans
    FOR EACH ROW
    EXECUTE FUNCTION clean_duplicate_educational_plans();