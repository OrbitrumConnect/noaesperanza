-- 🚀 ESTUDO VIVO - EXPANSÃO DA BASE DE DADOS (VERSÃO CORRIGIDA)
-- Dr. Ricardo Valença - Nôa Esperanza Platform

-- 1. EXPANDIR TABELA documentos_mestres COM METADADOS CIENTÍFICOS
ALTER TABLE documentos_mestres ADD COLUMN IF NOT EXISTS area TEXT CHECK (area IN ('nefrologia', 'neurologia', 'cannabis', 'geral', 'interdisciplinar'));
ALTER TABLE documentos_mestres ADD COLUMN IF NOT EXISTS tipo_documento TEXT CHECK (tipo_documento IN ('artigo', 'guideline', 'estudo', 'revisao', 'caso-clinico', 'conversa', 'debate'));
ALTER TABLE documentos_mestres ADD COLUMN IF NOT EXISTS nivel_evidencia TEXT CHECK (nivel_evidencia IN ('A', 'B', 'C', 'D', 'expert-opinion'));
ALTER TABLE documentos_mestres ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE documentos_mestres ADD COLUMN IF NOT EXISTS autores TEXT[];
ALTER TABLE documentos_mestres ADD COLUMN IF NOT EXISTS data_publicacao DATE;
ALTER TABLE documentos_mestres ADD COLUMN IF NOT EXISTS journal TEXT;
ALTER TABLE documentos_mestres ADD COLUMN IF NOT EXISTS doi TEXT;
ALTER TABLE documentos_mestres ADD COLUMN IF NOT EXISTS metodologia TEXT;
ALTER TABLE documentos_mestres ADD COLUMN IF NOT EXISTS resultados TEXT;
ALTER TABLE documentos_mestres ADD COLUMN IF NOT EXISTS conclusoes TEXT;
ALTER TABLE documentos_mestres ADD COLUMN IF NOT EXISTS limitacoes TEXT;
ALTER TABLE documentos_mestres ADD COLUMN IF NOT EXISTS conflitos_interesse TEXT;
ALTER TABLE documentos_mestres ADD COLUMN IF NOT EXISTS financiamento TEXT;
ALTER TABLE documentos_mestres ADD COLUMN IF NOT EXISTS keywords TEXT[];
ALTER TABLE documentos_mestres ADD COLUMN IF NOT EXISTS abstract TEXT;
ALTER TABLE documentos_mestres ADD COLUMN IF NOT EXISTS introducao TEXT;
ALTER TABLE documentos_mestres ADD COLUMN IF NOT EXISTS discussao TEXT;
ALTER TABLE documentos_mestres ADD COLUMN IF NOT EXISTS referencias TEXT[];
ALTER TABLE documentos_mestres ADD COLUMN IF NOT EXISTS citacoes INTEGER DEFAULT 0;
ALTER TABLE documentos_mestres ADD COLUMN IF NOT EXISTS impacto TEXT CHECK (impacto IN ('alto', 'medio', 'baixo'));
ALTER TABLE documentos_mestres ADD COLUMN IF NOT EXISTS relevancia_clinica TEXT CHECK (relevancia_clinica IN ('alta', 'media', 'baixa'));
ALTER TABLE documentos_mestres ADD COLUMN IF NOT EXISTS qualidade_metodologica INTEGER CHECK (qualidade_metodologica >= 1 AND qualidade_metodologica <= 10);
ALTER TABLE documentos_mestres ADD COLUMN IF NOT EXISTS confiabilidade INTEGER CHECK (confiabilidade >= 1 AND confiabilidade <= 10);
ALTER TABLE documentos_mestres ADD COLUMN IF NOT EXISTS aplicabilidade_clinica INTEGER CHECK (aplicabilidade_clinica >= 1 AND aplicabilidade_clinica <= 10);

-- 2. CRIAR TABELA PARA DEBATES CIENTÍFICOS
CREATE TABLE IF NOT EXISTS debates_cientificos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    documento_id UUID REFERENCES documentos_mestres(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    area TEXT NOT NULL,
    participantes TEXT[] DEFAULT ARRAY['Dr. Ricardo', 'Nôa Esperanza'],
    pontos_debatidos JSONB,
    argumentos JSONB,
    contra_argumentos JSONB,
    conclusoes TEXT,
    sugestoes_melhoria TEXT[],
    proposta_pesquisa TEXT,
    nivel_evidencia_debate TEXT CHECK (nivel_evidencia_debate IN ('A', 'B', 'C', 'D', 'expert-opinion')),
    relevancia INTEGER CHECK (relevancia >= 1 AND relevancia <= 10),
    tags TEXT[],
    data_debate TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CRIAR TABELA PARA ANÁLISES DE QUALIDADE
CREATE TABLE IF NOT EXISTS analises_qualidade (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    documento_id UUID REFERENCES documentos_mestres(id) ON DELETE CASCADE,
    analista TEXT DEFAULT 'Nôa Esperanza',
    pontos_fortes TEXT[],
    limitacoes TEXT[],
    qualidade_metodologica INTEGER CHECK (qualidade_metodologica >= 1 AND qualidade_metodologica <= 10),
    confiabilidade INTEGER CHECK (confiabilidade >= 1 AND confiabilidade <= 10),
    aplicabilidade_clinica INTEGER CHECK (aplicabilidade_clinica >= 1 AND aplicabilidade_clinica <= 10),
    vieses_identificados TEXT[],
    recomendacoes TEXT[],
    comparacao_literatura TEXT,
    gaps_identificados TEXT[],
    nivel_evidencia_final TEXT CHECK (nivel_evidencia_final IN ('A', 'B', 'C', 'D', 'expert-opinion')),
    data_analise TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CRIAR TABELA PARA SÍNTESES E ESTUDOS VIVOS
CREATE TABLE IF NOT EXISTS estudos_vivos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pergunta_original TEXT NOT NULL,
    area TEXT NOT NULL,
    documentos_analisados UUID[],
    resumo_executivo JSONB,
    comparacao_metodologica JSONB,
    analise_qualidade JSONB,
    gaps_identificados TEXT[],
    implicacoes_clinicas TEXT[],
    recomendacoes TEXT[],
    referencias UUID[],
    contexto_historico JSONB,
    nivel_confianca INTEGER CHECK (nivel_confianca >= 1 AND nivel_confianca <= 10),
    tags TEXT[],
    data_estudo TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. CRIAR TABELA PARA MEMÓRIA VIVA (CONVERSAS COMO DADOS)
CREATE TABLE IF NOT EXISTS memoria_viva_cientifica (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tipo_conteudo TEXT CHECK (tipo_conteudo IN ('debate-cientifico', 'analise-trabalho', 'discussao-metodologia', 'proposta-pesquisa', 'revisao-literatura')),
    area TEXT NOT NULL,
    topico TEXT NOT NULL,
    participantes TEXT[],
    conteudo_principal TEXT NOT NULL,
    pontos_chave TEXT[],
    conclusoes TEXT[],
    sugestoes TEXT[],
    referencias_relacionadas UUID[],
    relevancia INTEGER CHECK (relevancia >= 1 AND relevancia <= 10),
    tags TEXT[],
    data_conversa TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_documentos_mestres_area ON documentos_mestres(area);
CREATE INDEX IF NOT EXISTS idx_documentos_mestres_tipo ON documentos_mestres(tipo_documento);
CREATE INDEX IF NOT EXISTS idx_documentos_mestres_nivel_evidencia ON documentos_mestres(nivel_evidencia);
CREATE INDEX IF NOT EXISTS idx_documentos_mestres_tags ON documentos_mestres USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_documentos_mestres_keywords ON documentos_mestres USING GIN(keywords);
CREATE INDEX IF NOT EXISTS idx_documentos_mestres_qualidade ON documentos_mestres(qualidade_metodologica);
CREATE INDEX IF NOT EXISTS idx_documentos_mestres_impacto ON documentos_mestres(impacto);

CREATE INDEX IF NOT EXISTS idx_debates_cientificos_documento ON debates_cientificos(documento_id);
CREATE INDEX IF NOT EXISTS idx_debates_cientificos_area ON debates_cientificos(area);
CREATE INDEX IF NOT EXISTS idx_debates_cientificos_data ON debates_cientificos(data_debate);
CREATE INDEX IF NOT EXISTS idx_debates_cientificos_tags ON debates_cientificos USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_analises_qualidade_documento ON analises_qualidade(documento_id);
CREATE INDEX IF NOT EXISTS idx_analises_qualidade_data ON analises_qualidade(data_analise);

CREATE INDEX IF NOT EXISTS idx_estudos_vivos_area ON estudos_vivos(area);
CREATE INDEX IF NOT EXISTS idx_estudos_vivos_data ON estudos_vivos(data_estudo);
CREATE INDEX IF NOT EXISTS idx_estudos_vivos_tags ON estudos_vivos USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_memoria_viva_tipo ON memoria_viva_cientifica(tipo_conteudo);
CREATE INDEX IF NOT EXISTS idx_memoria_viva_area ON memoria_viva_cientifica(area);
CREATE INDEX IF NOT EXISTS idx_memoria_viva_data ON memoria_viva_cientifica(data_conversa);
CREATE INDEX IF NOT EXISTS idx_memoria_viva_tags ON memoria_viva_cientifica USING GIN(tags);

-- 7. HABILITAR RLS PARA NOVAS TABELAS
ALTER TABLE debates_cientificos ENABLE ROW LEVEL SECURITY;
ALTER TABLE analises_qualidade ENABLE ROW LEVEL SECURITY;
ALTER TABLE estudos_vivos ENABLE ROW LEVEL SECURITY;
ALTER TABLE memoria_viva_cientifica ENABLE ROW LEVEL SECURITY;

-- 8. CRIAR POLÍTICAS RLS
DROP POLICY IF EXISTS "Users can view debates" ON debates_cientificos;
CREATE POLICY "Users can view debates"
ON debates_cientificos FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Users can insert debates" ON debates_cientificos;
CREATE POLICY "Users can insert debates"
ON debates_cientificos FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update debates" ON debates_cientificos;
CREATE POLICY "Users can update debates"
ON debates_cientificos FOR UPDATE
USING (true);

DROP POLICY IF EXISTS "Users can view quality analyses" ON analises_qualidade;
CREATE POLICY "Users can view quality analyses"
ON analises_qualidade FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Users can insert quality analyses" ON analises_qualidade;
CREATE POLICY "Users can insert quality analyses"
ON analises_qualidade FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view live studies" ON estudos_vivos;
CREATE POLICY "Users can view live studies"
ON estudos_vivos FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Users can insert live studies" ON estudos_vivos;
CREATE POLICY "Users can insert live studies"
ON estudos_vivos FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view scientific memory" ON memoria_viva_cientifica;
CREATE POLICY "Users can view scientific memory"
ON memoria_viva_cientifica FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Users can insert scientific memory" ON memoria_viva_cientifica;
CREATE POLICY "Users can insert scientific memory"
ON memoria_viva_cientifica FOR INSERT
WITH CHECK (true);

-- 9. CRIAR TRIGGERS PARA updated_at
DROP TRIGGER IF EXISTS update_debates_cientificos_updated_at ON debates_cientificos;
CREATE TRIGGER update_debates_cientificos_updated_at
  BEFORE UPDATE ON debates_cientificos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_analises_qualidade_updated_at ON analises_qualidade;
CREATE TRIGGER update_analises_qualidade_updated_at
  BEFORE UPDATE ON analises_qualidade
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_estudos_vivos_updated_at ON estudos_vivos;
CREATE TRIGGER update_estudos_vivos_updated_at
  BEFORE UPDATE ON estudos_vivos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_memoria_viva_cientifica_updated_at ON memoria_viva_cientifica;
CREATE TRIGGER update_memoria_viva_cientifica_updated_at
  BEFORE UPDATE ON memoria_viva_cientifica
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 10. FUNÇÕES SQL PARA ESTUDO VIVO
CREATE OR REPLACE FUNCTION buscar_documentos_cientificos(
    area_param TEXT DEFAULT NULL,
    tipo_param TEXT DEFAULT NULL,
    nivel_evidencia_param TEXT DEFAULT NULL,
    tags_param TEXT[] DEFAULT NULL,
    limite_param INTEGER DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    content TEXT,
    area TEXT,
    tipo_documento TEXT,
    nivel_evidencia TEXT,
    tags TEXT[],
    qualidade_metodologica INTEGER,
    impacto TEXT,
    relevancia_clinica TEXT,
    created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        dm.id,
        dm.title,
        dm.content,
        dm.area,
        dm.tipo_documento,
        dm.nivel_evidencia,
        dm.tags,
        dm.qualidade_metodologica,
        dm.impacto,
        dm.relevancia_clinica,
        dm.created_at
    FROM documentos_mestres dm
    WHERE dm.is_active = true
    AND (area_param IS NULL OR dm.area = area_param)
    AND (tipo_param IS NULL OR dm.tipo_documento = tipo_param)
    AND (nivel_evidencia_param IS NULL OR dm.nivel_evidencia = nivel_evidencia_param)
    AND (tags_param IS NULL OR dm.tags && tags_param)
    ORDER BY dm.qualidade_metodologica DESC, dm.created_at DESC
    LIMIT limite_param;
END;
$$;

CREATE OR REPLACE FUNCTION gerar_estudo_vivo(
    pergunta_param TEXT,
    area_param TEXT DEFAULT NULL,
    limite_docs_param INTEGER DEFAULT 5
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    docs_encontrados UUID[];
    resultado JSON;
BEGIN
    -- Buscar documentos relevantes
    SELECT ARRAY_AGG(id) INTO docs_encontrados
    FROM buscar_documentos_cientificos(area_param, NULL, NULL, NULL, limite_docs_param);
    
    -- Estruturar resultado
    resultado := json_build_object(
        'pergunta', pergunta_param,
        'area', area_param,
        'documentos_analisados', docs_encontrados,
        'total_documentos', COALESCE(array_length(docs_encontrados, 1), 0),
        'data_analise', NOW(),
        'status', 'sucesso'
    );
    
    RETURN resultado;
END;
$$;

CREATE OR REPLACE FUNCTION salvar_debate_cientifico(
    documento_id_param UUID,
    titulo_param TEXT,
    area_param TEXT,
    pontos_debatidos_param JSONB,
    argumentos_param JSONB,
    conclusoes_param TEXT,
    sugestoes_param TEXT[]
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    debate_id UUID;
BEGIN
    INSERT INTO debates_cientificos (
        documento_id,
        titulo,
        area,
        pontos_debatidos,
        argumentos,
        conclusoes,
        sugestoes_melhoria
    ) VALUES (
        documento_id_param,
        titulo_param,
        area_param,
        pontos_debatidos_param,
        argumentos_param,
        conclusoes_param,
        sugestoes_param
    ) RETURNING id INTO debate_id;
    
    RETURN json_build_object(
        'status', 'sucesso',
        'debate_id', debate_id,
        'message', 'Debate científico salvo com sucesso!'
    );
END;
$$;

-- 11. COMENTÁRIOS
COMMENT ON TABLE debates_cientificos IS 'Armazena debates científicos sobre trabalhos e pesquisas';
COMMENT ON TABLE analises_qualidade IS 'Armazena análises de qualidade metodológica de documentos';
COMMENT ON TABLE estudos_vivos IS 'Armazena sínteses e estudos vivos gerados pelo sistema';
COMMENT ON TABLE memoria_viva_cientifica IS 'Armazena conversas como dados científicos para aprendizado contínuo';

COMMENT ON FUNCTION buscar_documentos_cientificos IS 'Busca documentos científicos com filtros avançados';
COMMENT ON FUNCTION gerar_estudo_vivo IS 'Gera estrutura para estudo vivo baseado em pergunta';
COMMENT ON FUNCTION salvar_debate_cientifico IS 'Salva debate científico sobre documento específico';

-- 12. DADOS INICIAIS DE EXEMPLO (CORRIGIDO)
INSERT INTO documentos_mestres (
    title,
    content,
    type,
    category,
    area,
    tipo_documento,
    nivel_evidencia,
    tags,
    autores,
    impacto,
    relevancia_clinica,
    qualidade_metodologica,
    confiabilidade,
    aplicabilidade_clinica,
    is_active
) 
SELECT 
    'Documento Mestre Institucional – Nôa Esperanza (v.2.0)',
    'Sistema de IA médica especializada em neurologia, nefrologia e cannabis medicinal. Desenvolvido pelo Dr. Ricardo Valença para revolucionar a prática médica através de inteligência artificial avançada.',
    'knowledge',
    'institutional',
    'interdisciplinar',
    'guideline',
    'expert-opinion',
    ARRAY['sistema', 'ia', 'medicina', 'especializada'],
    ARRAY['Dr. Ricardo Valença'],
    'alto',
    'alta',
    9,
    9,
    9,
    true
WHERE NOT EXISTS (
    SELECT 1 FROM documentos_mestres 
    WHERE title = 'Documento Mestre Institucional – Nôa Esperanza (v.2.0)'
);

-- 13. MENSAGEM DE SUCESSO
SELECT json_build_object(
    'status', 'sucesso',
    'message', 'Sistema Estudo Vivo implementado com sucesso!',
    'tabelas_criadas', ARRAY['debates_cientificos', 'analises_qualidade', 'estudos_vivos', 'memoria_viva_cientifica'],
    'funcoes_criadas', ARRAY['buscar_documentos_cientificos', 'gerar_estudo_vivo', 'salvar_debate_cientifico'],
    'documentos_mestres_expandida', true,
    'versao', '2.0-corrigida'
);
