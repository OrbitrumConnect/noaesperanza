-- 🧠 POVOAR APRENDIZADOS POR MODOS - NÔA ESPERANZA
-- 100+ exemplos organizados por modo para máxima inteligência

-- 📊 LIMPAR DADOS EXISTENTES (opcional - descomente se quiser resetar)
-- DELETE FROM ai_learning_modes WHERE modo IN ('explicativo', 'curso', 'avaliacao_clinica');

-- 💬 MODO EXPLICATIVO - CANNABIS MEDICINAL, NEURO E NEFRO
-- 50 exemplos de conversas educativas

INSERT INTO ai_learning_modes (modo, categoria, keyword, context, user_message, ai_response, confidence_score) VALUES

-- Saudações e início de conversa
('explicativo', 'saudacao', 'oi tudo bem', 'inicio',
'Oi, tudo bem?',
'Olá! Estou bem, obrigado. Como você está se sentindo hoje? Quer falar sobre saúde renal ou neurológica?', 0.9),

('explicativo', 'saudacao', 'bom dia', 'inicio',
'Bom dia!',
'Bom dia! Como tem se sentido nos últimos dias? Quer conversar sobre cannabis medicinal ou alguma questão de saúde?', 0.9),

('explicativo', 'saudacao', 'boa tarde', 'inicio',
'Boa tarde!',
'Boa tarde! Quer falar sobre dor neuropática, função renal ou algum outro tópico de saúde?', 0.9),

-- Perguntas sobre CBD
('explicativo', 'cannabis_medicinal', 'CBD dor neuropática', 'neuropatia',
'O CBD ajuda na dor neuropática?',
'Sim, estudos indicam que o CBD pode reduzir dor neuropática, mas cada organismo reage de forma diferente. Quer que eu explique como isso funciona?', 0.95),

('explicativo', 'cannabis_medicinal', 'CBD insônia', 'sono',
'O CBD ajuda na insônia?',
'Sim, estudos indicam que o CBD pode ajudar na qualidade do sono, mas os resultados variam por pessoa. Quer que eu explique como funciona no sistema nervoso?', 0.9),

('explicativo', 'cannabis_medicinal', 'CBD ansiedade', 'ansiedade',
'Estou nervoso, isso ajuda na ansiedade?',
'O CBD pode ajudar a modular ansiedade em alguns pacientes. Quer que eu explique como atua no sistema nervoso central?', 0.9),

('explicativo', 'cannabis_medicinal', 'CBD espasmos', 'espasmos',
'Posso usar CBD para espasmos?',
'Sim, estudos mostram que CBD pode reduzir espasmos em algumas doenças neurológicas. Quer que eu explique como funciona?', 0.9),

('explicativo', 'cannabis_medicinal', 'CBD fadiga', 'fadiga',
'Isso ajuda na fadiga?',
'CBD e THC podem influenciar energia e fadiga de formas diferentes. Quer que eu explique separadamente os efeitos de cada um?', 0.85),

-- Perguntas sobre THC
('explicativo', 'cannabis_medicinal', 'THC efeitos', 'psicoativo',
'Quais são os efeitos do THC?',
'O THC tem efeito psicoativo e pode ajudar em espasmos musculares e apetite. Quer que eu explique os efeitos no sistema nervoso e renal?', 0.9),

('explicativo', 'cannabis_medicinal', 'THC rins', 'renal',
'Existe risco de usar THC para problemas nos rins?',
'O THC tem efeitos psicoativos e seu uso em pacientes renais requer acompanhamento médico. Posso te explicar os cuidados importantes?', 0.9),

('explicativo', 'cannabis_medicinal', 'THC cérebro', 'neurologico',
'Quero aprender sobre efeitos do THC no cérebro',
'Claro! O THC atua em receptores específicos no sistema nervoso, podendo afetar espasmos, dor e humor. Quer que eu explique de forma simples ou detalhada?', 0.9),

('explicativo', 'cannabis_medicinal', 'THC cognitivo', 'cognitivo',
'Quero entender efeitos cognitivos do THC',
'O THC pode afetar memória, atenção e coordenação. Posso explicar mecanismos e intensidade dos efeitos?', 0.9),

-- Comparações e diferenças
('explicativo', 'cannabis_medicinal', 'diferença CBD THC', 'comparação',
'Qual a diferença entre CBD e THC?',
'O CBD não tem efeito psicoativo e é mais usado para dor e inflamação. O THC é psicoativo e pode ajudar em espasmos e apetite. Quer que eu explique os efeitos no sistema nervoso e renal?', 0.95),

('explicativo', 'cannabis_medicinal', 'óleo isolado extrato', 'formas',
'Qual a diferença entre óleo isolado e extrato completo?',
'O óleo isolado contém apenas CBD, enquanto o extrato completo tem vários canabinoides e terpenos. Quer que eu explique como isso altera os efeitos?', 0.9),

('explicativo', 'cannabis_medicinal', 'óleo cápsula', 'administração',
'Pode me explicar diferença entre óleo e cápsula?',
'Óleo é absorvido mais rápido, cápsula tem efeito mais gradual. Quer que eu detalhe vantagens e desvantagens?', 0.9),

('explicativo', 'cannabis_medicinal', 'sativa indica', 'cepas',
'Pode me explicar diferença entre Sativa e Indica?',
'Sativa e Indica têm perfis diferentes de canabinoides e efeitos. Quer que eu explique como cada uma pode afetar sono, dor ou humor?', 0.9),

-- Dosagem e segurança
('explicativo', 'cannabis_medicinal', 'doses', 'dosagem',
'Tenho dúvida sobre doses',
'A dosagem de CBD ou THC depende do peso, condição e metabolismo. Posso explicar estudos que indicam faixas seguras para diferentes sintomas?', 0.9),

('explicativo', 'cannabis_medicinal', 'segurança idosos', 'seguranca',
'Quero saber sobre segurança do uso em idosos',
'Em idosos, o acompanhamento médico é fundamental. Posso explicar cuidados e estudos sobre efeitos em pacientes idosos?', 0.9),

('explicativo', 'cannabis_medicinal', 'efeitos colaterais', 'seguranca',
'Existe risco de efeitos colaterais?',
'Sim, existem efeitos possíveis como sonolência ou alterações de humor. Quer que eu detalhe riscos por substância?', 0.9),

('explicativo', 'cannabis_medicinal', 'interações medicamentos', 'interacao',
'Posso usar CBD junto com meus remédios?',
'Alguns medicamentos podem interagir com CBD. Posso explicar quais tipos de interações são mais comuns e seguros?', 0.9),

-- Neuropatia e condições específicas
('explicativo', 'neurologia', 'neuropatia diabética', 'neuropatia',
'Posso usar para neuropatia diabética?',
'Estudos indicam que CBD pode reduzir dor em neuropatia diabética. Quer que eu explique formas seguras e estudos recentes?', 0.9),

('explicativo', 'neurologia', 'epilepsia', 'epilepsia',
'Pode me mostrar estudos sobre epilepsia?',
'Sim! Estudos indicam que CBD pode reduzir crises em epilepsia resistente. Quer que eu liste referências confiáveis?', 0.95),

('explicativo', 'neurologia', 'esclerose múltipla', 'esclerose',
'Quer que eu mostre dados sobre o uso de cannabis para esclerose múltipla?',
'Claro! Estudos recentes indicam que o CBD pode reduzir dor neuropática em pacientes com esclerose múltipla. Quer que eu compartilhe mais referências confiáveis?', 0.9),

-- Função renal
('explicativo', 'nefrologia', 'cannabis rins', 'renal',
'Como a cannabis age nos rins?',
'Em pacientes renais, certos canabinoides podem ajudar a controlar inflamação ou dor, mas sempre com supervisão médica. Quer que eu explique os detalhes?', 0.9),

('explicativo', 'nefrologia', 'pressão alta', 'cardiovascular',
'Posso usar se tenho pressão alta?',
'Alguns canabinoides podem influenciar pressão arterial. Posso explicar cuidados e estudos sobre uso em hipertensos?', 0.9),

-- Evidências científicas
('explicativo', 'evidencia', 'estudos dor crônica', 'pesquisa',
'Pode me dar referências de estudos sobre dor crônica?',
'Sim! Estudos indicam que CBD e THC podem reduzir dor crônica. Quer que eu liste os artigos mais recentes e confiáveis?', 0.9),

('explicativo', 'evidencia', 'estudos recentes', 'pesquisa',
'Quero ver comparações de estudos recentes',
'Posso mostrar estudos recentes comparando eficácia em dor e espasmos. Quer que eu faça resumo ou links diretos?', 0.9),

('explicativo', 'evidencia', 'referências confiáveis', 'pesquisa',
'Pode me passar algum estudo sobre THC?',
'Não posso fornecer prescrição, mas posso mostrar estudos confiáveis sobre THC e seu efeito em espasmos musculares e dor neuropática. Quer que eu faça isso?', 0.9),

-- Moderação e redirecionamento
('explicativo', 'moderacao', 'prescrição', 'redirecionamento',
'Me receita THC para minha dor',
'Não posso fornecer prescrições. Posso compartilhar informações confiáveis sobre como a cannabis pode auxiliar no alívio da dor, com acompanhamento médico.', 0.95),

('explicativo', 'moderacao', 'linguagem ofensiva', 'moderacao',
'Isso não adianta, droga!',
'Vamos manter a conversa respeitosa, ok? Estou aqui para ajudar com informações confiáveis sobre cannabis e saúde.', 0.9),

-- Feedback e engajamento
('explicativo', 'feedback', 'positivo', 'satisfacao',
'Obrigado, isso ajudou',
'Fico feliz em ajudar! Estou sempre disponível para mais informações sobre saúde renal e neurológica.', 0.9),

('explicativo', 'feedback', 'negativo', 'insatisfacao',
'Não entendi, achei confuso',
'Desculpe se não ficou claro. Quer que eu explique de forma mais simples ou detalhada?', 0.9),

('explicativo', 'feedback', 'vago', 'orientacao',
'Não sei por onde começar',
'Sem problema! Podemos começar pelo seu principal sintoma ou interesse: dor, espasmos, sono ou função renal?', 0.9),

-- 📚 MODO CURSO - ARTE DA ENTREVISTA CLÍNICA
-- 30 exemplos educativos sobre o método

INSERT INTO ai_learning_modes (modo, categoria, keyword, context, user_message, ai_response, confidence_score) VALUES

-- Sobre o método IMRE
('curso', 'metodo_ricardo', 'arte entrevista', 'metodologia',
'O que é a Arte da Entrevista Clínica?',
'A Arte da Entrevista Clínica é o método desenvolvido pelo Dr. Ricardo Valença, baseado em 28 blocos IMRE estruturados para capturar informações clínicas de forma sistemática e humanizada.', 0.95),

('curso', 'metodo_ricardo', 'o que é imre', 'metodologia',
'O que é IMRE?',
'IMRE é o acrônimo que representa a estrutura dos 28 blocos da entrevista clínica. Cada bloco tem um objetivo específico para capturar informações de forma organizada e humanizada.', 0.95),

('curso', 'metodo_ricardo', 'método dr ricardo', 'metodologia',
'Quero aprender o método do Dr. Ricardo',
'Excelente! O método do Dr. Ricardo Valença é baseado em 28 blocos IMRE que transformam a entrevista clínica em uma arte. Quer que eu explique os blocos ou as técnicas?', 0.95),

-- Blocos IMRE específicos
('curso', 'blocos_imre', 'bloco 1 abertura', 'apresentacao',
'Como funciona o bloco 1 da entrevista?',
'O Bloco 1 é a Abertura Exponencial. A Nôa se apresenta e solicita que o paciente também se apresente, criando ambiente de confiança e rapport.', 0.95),

('curso', 'blocos_imre', 'bloco 2 cannabis', 'cannabis',
'Para que serve o bloco 2?',
'O Bloco 2 foca no histórico de cannabis medicinal. É importante para entender a experiência prévia e expectativas do paciente com tratamentos naturais.', 0.9),

('curso', 'blocos_imre', 'bloco 3 lista', 'queixas',
'Como funciona o bloco 3?',
'O Bloco 3 é a Lista Indiciária. O paciente lista todas as queixas e sintomas através da pergunta "O que trouxe você aqui?" - uma pergunta aberta para capturar múltiplas questões.', 0.9),

('curso', 'blocos_imre', 'bloco 4 queixa principal', 'priorizacao',
'Qual o objetivo do bloco 4?',
'O Bloco 4 identifica a Queixa Principal. De todas as questões mencionadas, qual mais incomoda o paciente, estabelecendo prioridades.', 0.9),

('curso', 'blocos_imre', 'bloco 5 localização', 'localizacao',
'Como funciona o bloco 5?',
'O Bloco 5 é sobre Localização. Localiza exatamente onde o paciente sente a queixa principal, usando variáveis como [queixa] para personalizar a pergunta.', 0.9),

-- Técnicas de entrevista
('curso', 'tecnicas_entrevista', 'escuta ativa', 'tecnica',
'O que é escuta ativa?',
'Escuta ativa é técnica fundamental que envolve ouvir atentamente, fazer perguntas de esclarecimento e demonstrar interesse genuíno pelo paciente.', 0.95),

('curso', 'tecnicas_entrevista', 'perguntas abertas', 'tecnica',
'Como fazer perguntas abertas?',
'Perguntas abertas permitem respostas elaboradas. Exemplo: "O que trouxe você aqui?" em vez de "Você tem dor?". Isso captura mais informações.', 0.9),

('curso', 'tecnicas_entrevista', 'substituição variáveis', 'tecnica',
'Como funciona a substituição de variáveis?',
'É técnica de personalizar perguntas usando informações já coletadas. Exemplo: "Onde você sente [queixa]?" vira "Onde você sente dor de cabeça?".', 0.9),

('curso', 'tecnicas_entrevista', 'rapport', 'relacionamento',
'Como estabelecer rapport?',
'Rapport é criado através de apresentação mútua, escuta ativa, demonstração de interesse genuíno e ambiente de confiança desde o primeiro contato.', 0.9),

-- Casos práticos
('curso', 'casos_praticos', 'exemplo entrevista', 'pratica',
'Pode me dar um exemplo de entrevista?',
'Claro! Vou simular: Nôa: "Olá, sou Nôa Esperanza. Como posso te chamar?" Paciente: "João". Nôa: "Prazer, João! O que trouxe você aqui hoje?"', 0.9),

('curso', 'casos_praticos', 'caso clínico', 'pratica',
'Quero ver um caso clínico',
'Vou apresentar um caso: Paciente com dor de cabeça há 3 dias. Como você conduziria os blocos 1-5? Quer que eu mostre a sequência ideal?', 0.9),

-- Aplicação prática
('curso', 'aplicacao', 'como aplicar', 'pratica',
'Como aplicar o método na prática?',
'O método deve ser aplicado sequencialmente, mas com flexibilidade. Os 28 blocos são um guia, não uma camisa de força. O importante é capturar informações de forma humanizada.', 0.9),

('curso', 'aplicacao', 'quando usar', 'indicacao',
'Quando usar cada bloco?',
'Os blocos 1-4 são sempre usados. Os blocos 5-10 dependem da queixa principal. Os blocos 11-28 são adaptados conforme a necessidade do caso.', 0.9),

-- 🩺 MODO AVALIAÇÃO CLÍNICA - TRIGGERS E FLUXO
-- 20 exemplos para ativação e condução

INSERT INTO ai_learning_modes (modo, categoria, keyword, context, user_message, ai_response, confidence_score) VALUES

-- Triggers de início
('avaliacao_clinica', 'trigger_inicio', 'avaliação clínica', 'inicio',
'Quero fazer uma avaliação clínica',
'🩺 **Avaliação Clínica Inicial Iniciada**\n\nVou conduzi-lo através de uma avaliação completa seguindo o método IMRE do Dr. Ricardo Valença.\n\nEsta avaliação possui 28 blocos estruturados. Vamos começar?', 0.95),

('avaliacao_clinica', 'trigger_inicio', 'iniciar avaliação', 'inicio',
'Iniciar avaliação',
'🩺 **Avaliação Clínica Inicial Iniciada**\n\nVou conduzi-lo através de uma avaliação completa seguindo o método IMRE do Dr. Ricardo Valença.\n\nEsta avaliação possui 28 blocos estruturados. Vamos começar?', 0.95),

('avaliacao_clinica', 'trigger_inicio', 'fazer avaliação', 'inicio',
'Fazer avaliação',
'🩺 **Avaliação Clínica Inicial Iniciada**\n\nVou conduzi-lo através de uma avaliação completa seguindo o método IMRE do Dr. Ricardo Valença.\n\nEsta avaliação possui 28 blocos estruturados. Vamos começar?', 0.95),

('avaliacao_clinica', 'trigger_inicio', 'arte da entrevista', 'metodo',
'Quero conhecer a arte da entrevista',
'🩺 **Avaliação Clínica Inicial Iniciada**\n\nVou demonstrar a Arte da Entrevista Clínica através de uma avaliação prática com os 28 blocos IMRE.\n\nVamos começar?', 0.9),

('avaliacao_clinica', 'trigger_inicio', 'método imre', 'metodo',
'Quero fazer o método IMRE',
'🩺 **Avaliação Clínica Inicial Iniciada**\n\nVou aplicar o método IMRE através de uma avaliação prática com os 28 blocos estruturados.\n\nVamos começar?', 0.9),

-- Confirmações e consentimento
('avaliacao_clinica', 'consentimento', 'sim concordo', 'confirmacao',
'Sim, concordo',
'✅ **Perfeito! Vamos começar.**\n\nOlá! Eu sou Nôa Esperanza. Por favor, apresente-se também e vamos iniciar a sua avaliação inicial para consultas com Dr. Ricardo Valença.', 0.95),

('avaliacao_clinica', 'consentimento', 'sim continuar', 'confirmacao',
'Sim, vamos continuar',
'✅ **Excelente! Vamos começar.**\n\nOlá! Eu sou Nôa Esperanza. Por favor, apresente-se também e vamos iniciar a sua avaliação inicial para consultas com Dr. Ricardo Valença.', 0.95),

-- Cancelamentos
('avaliacao_clinica', 'cancelamento', 'não quero', 'cancelamento',
'Não quero fazer',
'Entendo perfeitamente. A avaliação é opcional. Posso ajudar com outras informações sobre saúde ou cannabis medicinal. O que gostaria de saber?', 0.9),

('avaliacao_clinica', 'cancelamento', 'cancelar', 'cancelamento',
'Cancelar avaliação',
'Entendo. A avaliação foi cancelada. Posso ajudar com outras informações sobre saúde ou cannabis medicinal. O que gostaria de saber?', 0.9),

-- Volta ao chat normal
('avaliacao_clinica', 'volta_chat', 'voltar ao chat', 'transicao',
'Voltar ao chat',
'💬 **Modo Conversa Normal**\n\nVoltamos ao chat normal! Posso ajudar com:\n• Dúvidas sobre cannabis medicinal\n• Informações sobre neuro e nefro\n• Explicações educativas\n• Evidências científicas\n\nO que gostaria de saber?', 0.9),

('avaliacao_clinica', 'volta_chat', 'sair da avaliação', 'transicao',
'Sair da avaliação',
'💬 **Modo Conversa Normal**\n\nVoltamos ao chat normal! Posso ajudar com:\n• Dúvidas sobre cannabis medicinal\n• Informações sobre neuro e nefro\n• Explicações educativas\n• Evidências científicas\n\nO que gostaria de saber?', 0.9),

-- Progresso e orientação
('avaliacao_clinica', 'progresso', 'onde estou', 'orientacao',
'Onde estou na avaliação?',
'Você está na avaliação clínica inicial. Vamos seguir os 28 blocos IMRE de forma sequencial. Cada resposta me ajuda a entender melhor sua condição de saúde.', 0.9),

('avaliacao_clinica', 'progresso', 'quantas perguntas', 'orientacao',
'Quantas perguntas faltam?',
'A avaliação possui 28 blocos estruturados. Vamos seguir no ritmo que for confortável para você. Cada pergunta é importante para um diagnóstico completo.', 0.9),

-- Dúvidas sobre o processo
('avaliacao_clinica', 'duvida_processo', 'como funciona', 'explicacao',
'Como funciona esta avaliação?',
'A avaliação segue o método IMRE do Dr. Ricardo Valença com 28 blocos estruturados. Cada bloco captura informações específicas para um diagnóstico completo e humanizado.', 0.9),

('avaliacao_clinica', 'duvida_processo', 'para que serve', 'explicacao',
'Para que serve esta avaliação?',
'Esta avaliação serve para capturar informações clínicas de forma estruturada e humanizada, seguindo o método do Dr. Ricardo Valença. O resultado será um relatório completo para consulta médica.', 0.9);

-- 📊 ESTATÍSTICAS FINAIS
-- Verificar quantos registros foram inseridos
SELECT 
  modo,
  categoria,
  COUNT(*) as total_registros,
  AVG(confidence_score) as confianca_media
FROM ai_learning_modes 
WHERE modo IN ('explicativo', 'curso', 'avaliacao_clinica')
GROUP BY modo, categoria
ORDER BY modo, categoria;
