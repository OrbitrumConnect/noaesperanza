-- =====================================================
-- EXECUTAR HIPÓTESES SINDROMICAS NO SUPABASE
-- Sistema de análise médica automática
-- Dr. Ricardo Valença - Nôa Esperanza
-- =====================================================

-- IMPORTANTE: Execute este script no Supabase SQL Editor
-- Este script cria todas as tabelas e funções necessárias
-- para o sistema de hipóteses sindrômicas

-- 1. CRIAR TABELA DE ANÁLISES MÉDICAS
CREATE TABLE IF NOT EXISTS analises_medicas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT,
  session_id TEXT NOT NULL,
  analise_data JSONB NOT NULL,
  hipoteses_principais TEXT[],
  nivel_urgencia TEXT CHECK (nivel_urgencia IN ('baixa', 'media', 'alta', 'emergencia')),
  exames_recomendados TEXT[],
  recomendacao_medica TEXT,
  validada_por_medico BOOLEAN DEFAULT false,
  medico_id TEXT,
  observacoes_medico TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CRIAR TABELA DE BASE DE CONHECIMENTO MÉDICO
CREATE TABLE IF NOT EXISTS base_conhecimento_medico (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  categoria TEXT NOT NULL CHECK (categoria IN ('neurologia', 'nefrologia', 'cannabis', 'geral')),
  sintoma_principal TEXT NOT NULL,
  sintomas_relacionados TEXT[] NOT NULL,
  hipotese_nome TEXT NOT NULL,
  probabilidade_base INTEGER NOT NULL CHECK (probabilidade_base >= 0 AND probabilidade_base <= 100),
  sintomas_necessarios TEXT[],
  exames_sugeridos TEXT[],
  observacoes TEXT,
  urgencia TEXT CHECK (urgencia IN ('baixa', 'media', 'alta', 'emergencia')),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CRIAR TABELA DE CORRELAÇÕES DE SINTOMAS
CREATE TABLE IF NOT EXISTS correlacoes_sintomas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sintoma_1 TEXT NOT NULL,
  sintoma_2 TEXT NOT NULL,
  forca_correlacao DECIMAL(3,2) NOT NULL CHECK (forca_correlacao >= 0 AND forca_correlacao <= 1),
  categoria TEXT NOT NULL,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CRIAR TABELA DE EXAMES MÉDICOS
CREATE TABLE IF NOT EXISTS exames_medicos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  categoria TEXT NOT NULL,
  descricao TEXT,
  indicacoes TEXT[],
  contraindicacoes TEXT[],
  urgencia TEXT CHECK (urgencia IN ('rotina', 'urgente', 'emergencia')),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_analises_medicas_user_id ON analises_medicas(user_id);
CREATE INDEX IF NOT EXISTS idx_analises_medicas_session_id ON analises_medicas(session_id);
CREATE INDEX IF NOT EXISTS idx_analises_medicas_urgencia ON analises_medicas(nivel_urgencia);
CREATE INDEX IF NOT EXISTS idx_analises_medicas_created_at ON analises_medicas(created_at);

CREATE INDEX IF NOT EXISTS idx_base_conhecimento_categoria ON base_conhecimento_medico(categoria);
CREATE INDEX IF NOT EXISTS idx_base_conhecimento_sintoma ON base_conhecimento_medico(sintoma_principal);
CREATE INDEX IF NOT EXISTS idx_base_conhecimento_hipotese ON base_conhecimento_medico(hipotese_nome);

CREATE INDEX IF NOT EXISTS idx_correlacoes_sintoma1 ON correlacoes_sintomas(sintoma_1);
CREATE INDEX IF NOT EXISTS idx_correlacoes_sintoma2 ON correlacoes_sintomas(sintoma_2);
CREATE INDEX IF NOT EXISTS idx_correlacoes_categoria ON correlacoes_sintomas(categoria);

CREATE INDEX IF NOT EXISTS idx_exames_categoria ON exames_medicos(categoria);
CREATE INDEX IF NOT EXISTS idx_exames_urgencia ON exames_medicos(urgencia);

-- 6. HABILITAR RLS
ALTER TABLE analises_medicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE base_conhecimento_medico ENABLE ROW LEVEL SECURITY;
ALTER TABLE correlacoes_sintomas ENABLE ROW LEVEL SECURITY;
ALTER TABLE exames_medicos ENABLE ROW LEVEL SECURITY;

-- 7. CRIAR POLÍTICAS RLS
CREATE POLICY "Users can manage their own medical analyses" ON analises_medicas
  FOR ALL USING (user_id::uuid = auth.uid() OR user_id IS NULL);

CREATE POLICY "Allow public read access to medical knowledge base" ON base_conhecimento_medico
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access to symptom correlations" ON correlacoes_sintomas
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access to medical exams" ON exames_medicos
  FOR SELECT USING (true);

-- 8. CRIAR FUNÇÃO PARA ATUALIZAR TIMESTAMP
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 9. CRIAR TRIGGERS
CREATE TRIGGER update_analises_medicas_updated_at
    BEFORE UPDATE ON analises_medicas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_base_conhecimento_updated_at
    BEFORE UPDATE ON base_conhecimento_medico
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10. INSERIR DADOS INICIAIS - BASE DE CONHECIMENTO MÉDICO

-- NEUROLOGIA
INSERT INTO base_conhecimento_medico (categoria, sintoma_principal, sintomas_relacionados, hipotese_nome, probabilidade_base, sintomas_necessarios, exames_sugeridos, observacoes, urgencia) VALUES
('neurologia', 'dor de cabeça', ARRAY['cefaleia', 'enxaqueca', 'migrânea'], 'Cefaleia Tensional', 70, ARRAY['dor de cabeça'], ARRAY['Exame neurológico', 'Pressão arterial'], 'Dor bilateral, em faixa, sem náusea', 'baixa'),
('neurologia', 'dor de cabeça', ARRAY['cefaleia', 'enxaqueca', 'migrânea'], 'Enxaqueca', 60, ARRAY['dor de cabeça', 'náusea'], ARRAY['Exame neurológico', 'TC ou RM'], 'Dor unilateral, pulsátil, com sintomas associados', 'media'),
('neurologia', 'dor de cabeça', ARRAY['cefaleia', 'enxaqueca', 'migrânea'], 'Cefaleia Secundária', 30, ARRAY['dor de cabeça', 'febre'], ARRAY['TC urgente', 'Punção lombar'], 'Dor súbita, intensa, com sinais de alarme', 'alta'),
('neurologia', 'convulsão', ARRAY['crise convulsiva', 'epilepsia', 'perda de consciência'], 'Epilepsia', 80, ARRAY['convulsão'], ARRAY['EEG', 'RM cerebral', 'Exame neurológico'], 'Crises recorrentes, sem causa identificável', 'alta'),
('neurologia', 'convulsão', ARRAY['crise convulsiva', 'epilepsia', 'perda de consciência'], 'Convulsão Febril', 60, ARRAY['convulsão', 'febre'], ARRAY['Exame neurológico', 'Hemograma'], 'Convulsão associada à febre em criança', 'media'),
('neurologia', 'tontura', ARRAY['vertigem', 'desequilíbrio', 'labirintite'], 'Vertigem Posicional Paroxística Benigna', 70, ARRAY['tontura'], ARRAY['Exame neurológico', 'Maniobra de Dix-Hallpike'], 'Tontura posicional, episódica', 'baixa'),
('neurologia', 'tontura', ARRAY['vertigem', 'desequilíbrio', 'labirintite'], 'Labirintite', 60, ARRAY['tontura', 'náusea'], ARRAY['Exame neurológico', 'Audiometria'], 'Tontura rotatória com náusea', 'media');

-- NEFROLOGIA
INSERT INTO base_conhecimento_medico (categoria, sintoma_principal, sintomas_relacionados, hipotese_nome, probabilidade_base, sintomas_necessarios, exames_sugeridos, observacoes, urgencia) VALUES
('nefrologia', 'dor no rim', ARRAY['dor lombar', 'cólica renal', 'dor no flanco'], 'Cólica Renal', 85, ARRAY['dor lombar'], ARRAY['USG renal', 'Urografia', 'Urina tipo I'], 'Dor em cólica, unilateral, irradiando para virilha', 'alta'),
('nefrologia', 'dor no rim', ARRAY['dor lombar', 'cólica renal', 'dor no flanco'], 'Infecção Urinária', 70, ARRAY['dor ao urinar'], ARRAY['Urina tipo I', 'Urocultura', 'USG renal'], 'Disúria, polaciúria, febre', 'media'),
('nefrologia', 'inchaço', ARRAY['edema', 'retenção de líquido', 'pernas inchadas'], 'Insuficiência Cardíaca', 60, ARRAY['edema', 'dispneia'], ARRAY['Ecocardiograma', 'BNP', 'RX tórax'], 'Edema bilateral, dispneia aos esforços', 'alta'),
('nefrologia', 'inchaço', ARRAY['edema', 'retenção de líquido', 'pernas inchadas'], 'Síndrome Nefrótica', 50, ARRAY['edema', 'proteinúria'], ARRAY['Urina 24h', 'Dosagem de proteínas', 'USG renal'], 'Edema periorbital, proteinúria maciça', 'media'),
('nefrologia', 'pressão alta', ARRAY['hipertensão', 'pressão arterial elevada'], 'Hipertensão Arterial', 80, ARRAY['pressão alta'], ARRAY['MAPA', 'Ecocardiograma', 'Fundoscopia'], 'Pressão arterial > 140/90 mmHg', 'media'),
('nefrologia', 'pressão alta', ARRAY['hipertensão', 'pressão arterial elevada'], 'Hipertensão Secundária', 30, ARRAY['pressão alta', 'dor lombar'], ARRAY['USG renal', 'Dosagem de renina', 'Cortisol'], 'Hipertensão com causa identificável', 'alta');

-- CANNABIS MEDICINAL
INSERT INTO base_conhecimento_medico (categoria, sintoma_principal, sintomas_relacionados, hipotese_nome, probabilidade_base, sintomas_necessarios, exames_sugeridos, observacoes, urgencia) VALUES
('cannabis', 'ansiedade', ARRAY['nervosismo', 'preocupação excessiva', 'pânico'], 'Transtorno de Ansiedade Generalizada', 75, ARRAY['ansiedade'], ARRAY['Avaliação psicológica', 'Escalas de ansiedade'], 'Ansiedade persistente, interferindo na vida diária', 'media'),
('cannabis', 'ansiedade', ARRAY['nervosismo', 'preocupação excessiva', 'pânico'], 'Síndrome do Pânico', 60, ARRAY['crise de pânico'], ARRAY['Avaliação psicológica', 'ECG', 'Exame cardiológico'], 'Crises súbitas de pânico com sintomas físicos', 'media'),
('cannabis', 'dor crônica', ARRAY['dor persistente', 'dor neuropática'], 'Dor Neuropática', 70, ARRAY['dor em queimação'], ARRAY['EMG', 'Exame neurológico', 'Avaliação da dor'], 'Dor em queimação, formigamento, alteração da sensibilidade', 'media'),
('cannabis', 'dor crônica', ARRAY['dor persistente', 'dor neuropática'], 'Fibromialgia', 60, ARRAY['dor generalizada'], ARRAY['Exame reumatológico', 'Avaliação da dor'], 'Dor em múltiplos pontos, fadiga, distúrbios do sono', 'baixa'),
('cannabis', 'insônia', ARRAY['dificuldade para dormir', 'distúrbios do sono'], 'Insônia Primária', 70, ARRAY['insônia'], ARRAY['Polissonografia', 'Avaliação do sono'], 'Dificuldade para iniciar ou manter o sono', 'baixa'),
('cannabis', 'insônia', ARRAY['dificuldade para dormir', 'distúrbios do sono'], 'Insônia Secundária', 60, ARRAY['insônia', 'ansiedade'], ARRAY['Avaliação psicológica', 'Polissonografia'], 'Insônia associada a transtorno mental', 'media');

-- 11. INSERIR CORRELAÇÕES DE SINTOMAS
INSERT INTO correlacoes_sintomas (sintoma_1, sintoma_2, forca_correlacao, categoria, observacoes) VALUES
('dor de cabeça', 'náusea', 0.8, 'neurologia', 'Forte correlação em enxaqueca'),
('dor de cabeça', 'fotofobia', 0.7, 'neurologia', 'Correlação moderada em enxaqueca'),
('dor no rim', 'náusea', 0.9, 'nefrologia', 'Muito forte correlação em cólica renal'),
('dor no rim', 'vômito', 0.8, 'nefrologia', 'Forte correlação em cólica renal'),
('inchaço', 'dispneia', 0.7, 'nefrologia', 'Correlação moderada em insuficiência cardíaca'),
('ansiedade', 'insônia', 0.8, 'cannabis', 'Forte correlação em transtornos de ansiedade'),
('dor crônica', 'depressão', 0.6, 'cannabis', 'Correlação moderada em dor crônica'),
('convulsão', 'perda de consciência', 0.9, 'neurologia', 'Muito forte correlação em epilepsia');

-- 12. INSERIR EXAMES MÉDICOS
INSERT INTO exames_medicos (nome, categoria, descricao, indicacoes, contraindicacoes, urgencia) VALUES
('Exame Neurológico', 'neurologia', 'Avaliação completa do sistema nervoso', ARRAY['dor de cabeça', 'convulsão', 'tontura'], ARRAY[]::TEXT[], 'rotina'),
('EEG', 'neurologia', 'Eletroencefalograma', ARRAY['convulsão', 'epilepsia', 'perda de consciência'], ARRAY[]::TEXT[], 'urgente'),
('RM Cerebral', 'neurologia', 'Ressonância magnética do cérebro', ARRAY['dor de cabeça', 'convulsão', 'tontura'], ARRAY['marcapasso', 'claustrofobia'], 'urgente'),
('TC Cerebral', 'neurologia', 'Tomografia computadorizada do cérebro', ARRAY['dor de cabeça súbita', 'trauma craniano'], ARRAY['gravidez'], 'emergencia'),
('USG Renal', 'nefrologia', 'Ultrassonografia dos rins', ARRAY['dor no rim', 'cólica renal'], ARRAY[]::TEXT[], 'urgente'),
('Urina Tipo I', 'nefrologia', 'Exame de urina completo', ARRAY['dor ao urinar', 'infecção urinária'], ARRAY[]::TEXT[], 'rotina'),
('Urocultura', 'nefrologia', 'Cultura de urina', ARRAY['infecção urinária'], ARRAY[]::TEXT[], 'urgente'),
('Ecocardiograma', 'nefrologia', 'Ultrassonografia do coração', ARRAY['inchaço', 'dispneia'], ARRAY[]::TEXT[], 'urgente'),
('Avaliação Psicológica', 'cannabis', 'Avaliação por psicólogo', ARRAY['ansiedade', 'depressão'], ARRAY[]::TEXT[], 'rotina'),
('EMG', 'cannabis', 'Eletromiografia', ARRAY['dor neuropática'], ARRAY[]::TEXT[], 'rotina');

-- 13. CRIAR FUNÇÃO PARA GERAR HIPÓTESES SINDROMICAS
CREATE OR REPLACE FUNCTION gerar_hipoteses_sindromicas(
  sintomas_input TEXT[],
  categoria_input TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  resultado JSONB := '{}';
  hipoteses JSONB := '[]';
  hipotese RECORD;
  sintoma TEXT;
  probabilidade_total INTEGER := 0;
BEGIN
  -- Buscar hipóteses relacionadas aos sintomas
  FOR sintoma IN SELECT unnest(sintomas_input)
  LOOP
    FOR hipotese IN 
      SELECT bcm.*, 
             CASE 
               WHEN bcm.categoria = categoria_input THEN 1.2
               ELSE 1.0
             END as multiplicador
      FROM base_conhecimento_medico bcm
      WHERE bcm.ativo = true
        AND (categoria_input IS NULL OR bcm.categoria = categoria_input)
        AND (
          bcm.sintoma_principal ILIKE '%' || sintoma || '%'
          OR EXISTS (
            SELECT 1 FROM unnest(bcm.sintomas_relacionados) AS sr
            WHERE sr ILIKE '%' || sintoma || '%'
          )
        )
    LOOP
      -- Calcular probabilidade ajustada
      hipotese.probabilidade_base := LEAST(100, 
        ROUND(hipotese.probabilidade_base * hipotese.multiplicador)
      );
      
      -- Adicionar à lista de hipóteses
      hipoteses := hipoteses || jsonb_build_object(
        'nome', hipotese.hipotese_nome,
        'categoria', hipotese.categoria,
        'probabilidade', hipotese.probabilidade_base,
        'exames_sugeridos', hipotese.exames_sugeridos,
        'observacoes', hipotese.observacoes,
        'urgencia', hipotese.urgencia
      );
    END LOOP;
  END LOOP;
  
  -- Ordenar por probabilidade e urgencia
  SELECT jsonb_agg(value ORDER BY 
    CASE (value->>'urgencia')
      WHEN 'emergencia' THEN 4
      WHEN 'alta' THEN 3
      WHEN 'media' THEN 2
      WHEN 'baixa' THEN 1
    END DESC,
    (value->>'probabilidade')::INTEGER DESC
  )
  INTO hipoteses
  FROM jsonb_array_elements(hipoteses);
  
  -- Construir resultado
  resultado := jsonb_build_object(
    'sintomas_analisados', sintomas_input,
    'categoria_filtro', categoria_input,
    'hipoteses', hipoteses,
    'total_hipoteses', jsonb_array_length(hipoteses),
    'timestamp', NOW()
  );
  
  RETURN resultado;
END;
$$ LANGUAGE plpgsql;

-- 14. CRIAR FUNÇÃO PARA BUSCAR EXAMES RECOMENDADOS
CREATE OR REPLACE FUNCTION buscar_exames_recomendados(
  hipoteses_input TEXT[]
)
RETURNS JSONB AS $$
DECLARE
  resultado JSONB := '{}';
  exames JSONB := '[]';
  exame RECORD;
BEGIN
  -- Buscar exames relacionados às hipóteses
  FOR exame IN
    SELECT DISTINCT em.*
    FROM exames_medicos em
    WHERE em.ativo = true
      AND EXISTS (
        SELECT 1 FROM unnest(hipoteses_input) AS h
        WHERE em.indicacoes && ARRAY[h]
      )
    ORDER BY 
      CASE em.urgencia
        WHEN 'emergencia' THEN 4
        WHEN 'urgente' THEN 3
        WHEN 'rotina' THEN 2
      END DESC,
      em.nome
  LOOP
    exames := exames || jsonb_build_object(
      'nome', exame.nome,
      'categoria', exame.categoria,
      'descricao', exame.descricao,
      'urgencia', exame.urgencia,
      'indicacoes', exame.indicacoes
    );
  END LOOP;
  
  resultado := jsonb_build_object(
    'hipoteses', hipoteses_input,
    'exames_recomendados', exames,
    'total_exames', jsonb_array_length(exames),
    'timestamp', NOW()
  );
  
  RETURN resultado;
END;
$$ LANGUAGE plpgsql;

-- 15. COMENTÁRIOS PARA DOCUMENTAÇÃO
COMMENT ON TABLE analises_medicas IS 'Análises médicas automáticas geradas pelo sistema de hipóteses sindrômicas';
COMMENT ON TABLE base_conhecimento_medico IS 'Base de conhecimento médico para correlação de sintomas e hipóteses diagnósticas';
COMMENT ON TABLE correlacoes_sintomas IS 'Correlações entre sintomas para análise mais precisa';
COMMENT ON TABLE exames_medicos IS 'Catálogo de exames médicos com indicações e contraindicações';

COMMENT ON FUNCTION gerar_hipoteses_sindromicas(TEXT[], TEXT) IS 'Gera hipóteses sindrômicas baseadas nos sintomas fornecidos';
COMMENT ON FUNCTION buscar_exames_recomendados(TEXT[]) IS 'Busca exames recomendados baseados nas hipóteses diagnósticas';

-- =====================================================
-- SCRIPT CONCLUÍDO - HIPÓTESES SINDROMICAS
-- Sistema de análise médica automática
-- Dr. Ricardo Valença - Nôa Esperanza
-- =====================================================

-- VERIFICAÇÃO FINAL
SELECT 'HIPÓTESES SINDROMICAS INSTALADAS COM SUCESSO!' as status;
SELECT COUNT(*) as total_hipoteses FROM base_conhecimento_medico;
SELECT COUNT(*) as total_exames FROM exames_medicos;
SELECT COUNT(*) as total_correlacoes FROM correlacoes_sintomas;
