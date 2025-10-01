-- ========================================
-- 🔧 CRIAR FUNÇÃO GET_IMRE_BLOCK
-- ========================================

DROP FUNCTION IF EXISTS get_imre_block(INTEGER);

CREATE OR REPLACE FUNCTION get_imre_block(ordem_param INTEGER)
RETURNS TABLE (
    id INTEGER,
    ordem INTEGER,
    etapa TEXT,
    texto TEXT,
    variavel TEXT,
    tipo TEXT,
    ativo BOOLEAN,
    block_prompt TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        bi.id,
        bi.ordem,
        bi.etapa,
        bi.texto as block_prompt,
        bi.variavel,
        bi.tipo,
        bi.ativo,
        bi.texto
    FROM blocos_imre bi
    WHERE bi.ordem = ordem_param
      AND bi.ativo = true
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- TESTE
SELECT * FROM get_imre_block(1);
SELECT * FROM get_imre_block(2);
SELECT * FROM get_imre_block(28);

-- ========================================
-- ✅ Execute no Supabase SQL Editor
-- ========================================

