-- Criar tabelas para armazenamento persistente de e-books e vídeos

-- Tabela de E-books
CREATE TABLE public.ebooks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('nutrition', 'orthomolecular', 'physiotherapy', 'mev')),
  file_url TEXT NOT NULL,
  cover_image TEXT,
  read_time TEXT DEFAULT '15 min',
  downloads INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de Vídeos
CREATE TABLE public.videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('nutrition', 'orthomolecular', 'physiotherapy', 'mev')),
  type TEXT NOT NULL CHECK (type IN ('youtube', 'vimeo', 'local')),
  url TEXT NOT NULL,
  thumbnail TEXT,
  duration TEXT DEFAULT '10:00',
  views INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ebooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- Políticas para todos poderem ver (conteúdo público)
CREATE POLICY "E-books são visíveis para todos" 
ON public.ebooks 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Vídeos são visíveis para todos" 
ON public.videos 
FOR SELECT 
USING (is_active = true);

-- Políticas para admins gerenciarem
CREATE POLICY "Admins podem gerenciar e-books" 
ON public.ebooks 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins podem gerenciar vídeos" 
ON public.videos 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Triggers para updated_at
CREATE TRIGGER update_ebooks_updated_at
BEFORE UPDATE ON public.ebooks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_videos_updated_at
BEFORE UPDATE ON public.videos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir dados de exemplo
INSERT INTO public.ebooks (title, description, category, file_url, cover_image, read_time) VALUES
('Guia Completo de Nutrição Funcional', 'Descubra como os alimentos podem ser seus melhores medicamentos', 'nutrition', '/ebooks/nutricao-funcional.pdf', '/covers/nutricao.jpg', '45 min'),
('Medicina Ortomolecular na Prática', 'Aplicações práticas da medicina ortomolecular no dia a dia', 'orthomolecular', '/ebooks/ortomolecular-pratica.pdf', '/covers/ortomolecular.jpg', '35 min'),
('Fisioterapia Integrativa', 'Abordagens integradas em fisioterapia e reabilitação', 'physiotherapy', '/ebooks/fisioterapia-integrativa.pdf', '/covers/fisioterapia.jpg', '40 min');

INSERT INTO public.videos (title, description, category, type, url, thumbnail, duration) VALUES
('Introdução à Medicina do Estilo de Vida', 'Entenda os fundamentos da MEV', 'mev', 'youtube', 'https://youtube.com/watch?v=demo1', '/thumbnails/mev-intro.jpg', '18:30'),
('Nutrição Funcional: Primeiros Passos', 'Como começar na nutrição funcional', 'nutrition', 'youtube', 'https://youtube.com/watch?v=demo2', '/thumbnails/nutricao-intro.jpg', '22:45'),
('Suplementação Ortomolecular', 'Bases da suplementação ortomolecular', 'orthomolecular', 'youtube', 'https://youtube.com/watch?v=demo3', '/thumbnails/suplementacao.jpg', '25:15');