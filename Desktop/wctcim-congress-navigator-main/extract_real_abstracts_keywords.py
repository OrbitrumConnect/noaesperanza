#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import PyPDF2
import json
import re
from collections import defaultdict

def extract_real_abstracts_keywords():
    """Extrai resumos e palavras-chave reais da estrutura da tabela"""
    print("🚀 Extraindo resumos e palavras-chave reais...")
    
    try:
        with open('public/tabela congresso.pdf', 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            
            # Dicionário para agrupar dados por ID
            works_by_id = defaultdict(list)
            
            for page_num in range(len(pdf_reader.pages)):
                page = pdf_reader.pages[page_num]
                text = page.extract_text()
                
                # Dividir em linhas
                lines = text.split('\n')
                
                # Procurar por linhas que começam com número
                for i, line in enumerate(lines):
                    line = line.strip()
                    if not line:
                        continue
                    
                    # Procurar por padrão: número seguido de "Aprovado" (pode estar na próxima linha)
                    if re.match(r'^\d+$', line):
                        # Verificar se a próxima linha é "Aprovado"
                        if i + 1 < len(lines) and lines[i + 1].strip() == 'Aprovado':
                            work_id = line
                            
                            # Coletar TODAS as linhas relacionadas a este trabalho (até 100 linhas)
                            work_lines = []
                            for j in range(i, min(i + 100, len(lines))):
                                work_line = lines[j].strip()
                                if work_line:
                                    work_lines.append(work_line)
                                else:
                                    break
                            
                            # Agrupar por ID
                            works_by_id[work_id].extend(work_lines)
            
            print(f"📊 Total de IDs encontrados: {len(works_by_id)}")
            
            # Processar cada trabalho único
            final_works = []
            
            for work_id, all_lines in works_by_id.items():
                try:
                    # Remover duplicatas das linhas mantendo ordem
                    unique_lines = list(dict.fromkeys(all_lines))
                    
                    # Extrair informações do trabalho
                    work_data = extract_work_with_real_content(work_id, unique_lines)
                    if work_data:
                        final_works.append(work_data)
                        
                except Exception as e:
                    print(f"❌ Erro ao processar trabalho {work_id}: {e}")
                    continue
            
            print(f"📊 Total de trabalhos processados: {len(final_works)}")
            
            # Mostrar estatísticas
            show_real_content_statistics(final_works)
            
            # Salvar dados finais
            with open('src/data/scientificWorks.json', 'w', encoding='utf-8') as f:
                json.dump(final_works, f, ensure_ascii=False, indent=2)
            
            print(f"\n✅ DADOS REAIS COM RESUMOS SALVOS!")
            print(f"📁 Arquivo: src/data/scientificWorks.json")
            print(f"📊 Total: {len(final_works)} trabalhos")
            
            return final_works
            
    except Exception as e:
        print(f"❌ Erro ao extrair dados: {e}")
        return []

def extract_work_with_real_content(work_id, lines):
    """Extrai trabalho com conteúdo real (resumos, palavras-chave)"""
    try:
        # Procurar por email
        email = ""
        for line in lines:
            if '@' in line and '.' in line:
                email = line
                break
        
        # Procurar por nome do autor
        author_name = ""
        for line in lines:
            if (line.isupper() and len(line) > 2 and 
                not line.isdigit() and 
                not any(word in line for word in ['UNIVERSITY', 'INSTITUTE', 'HOSPITAL', 'CENTER', 'COLLEGE', 'SCHOOL'])):
                author_name = line
                break
        
        # Procurar por modalidade
        modality = 'oral'
        for line in lines:
            if 'Poster' in line:
                modality = 'pôster'
                break
            elif 'Video' in line:
                modality = 'vídeo'
                break
            elif 'Oral' in line:
                modality = 'oral'
                break
        
        # Procurar por categoria
        category = 'Científico'
        for line in lines:
            if 'Research' in line:
                category = 'Científico'
                break
            elif 'Experience' in line:
                category = 'Estudo de Caso'
                break
            elif 'Case Report' in line:
                category = 'Estudo de Caso'
                break
            elif 'Clinical Trial' in line:
                category = 'Evidências'
                break
        
        # Procurar por título REAL
        title = f"Trabalho {work_id}"
        for line in reversed(lines):
            if (line and len(line) > 15 and 
                not any(word in line for word in ['Poster', 'Oral', 'Video', 'Research', 'Experience', 'Case Report', 'Clinical Trial', 'Aprovado', 'Não', 'Sim', 'University', 'Institute', 'Hospital']) and
                not line.isdigit() and
                not line.isupper()):
                title = line
                break
        
        # Procurar por resumo REAL (baseado na estrutura da tabela)
        abstract = 'Resumo não disponível'
        
        # Procurar por padrões de resumo na estrutura da tabela
        for i, line in enumerate(lines):
            # Procurar por linhas que podem ser resumos
            if (len(line) > 50 and 
                not any(word in line for word in ['Poster', 'Oral', 'Video', 'Research', 'Experience', 'Case Report', 'Clinical Trial', 'University', 'Institute', 'Hospital', 'Aprovado', 'Não', 'Sim']) and
                not line.isdigit() and
                not line.isupper() and
                any(word in line.lower() for word in ['this', 'study', 'research', 'method', 'result', 'conclusion', 'objective', 'background', 'introduction', 'abstract', 'resumo', 'estudo', 'pesquisa', 'método', 'resultado', 'conclusão', 'objetivo'])):
                abstract = line
                break
        
        # Se não encontrou resumo específico, procurar por linhas longas com conteúdo
        if abstract == 'Resumo não disponível':
            for line in lines:
                if (len(line) > 80 and 
                    not any(word in line for word in ['Poster', 'Oral', 'Video', 'Research', 'Experience', 'Case Report', 'Clinical Trial', 'University', 'Institute', 'Hospital', 'Aprovado', 'Não', 'Sim']) and
                    not line.isdigit() and
                    not line.isupper()):
                    abstract = line
                    break
        
        # Procurar por instituição REAL
        institution = 'Instituição não especificada'
        for line in lines:
            if any(word in line for word in ['University', 'Instituto', 'Faculdade', 'Hospital', 'Clínica', 'Health', 'Medical', 'Regulatory', 'Associação', 'Center', 'College', 'School']):
                institution = line
                break
        
        # Procurar por palavras-chave REAIS
        keywords = ['medicina integrativa', 'terapias complementares']
        
        # Procurar por palavras-chave específicas no conteúdo
        content_keywords = []
        for line in lines:
            line_lower = line.lower()
            if 'acupuntura' in line_lower or 'acupuncture' in line_lower:
                content_keywords.append('acupuntura')
            if 'yoga' in line_lower:
                content_keywords.append('yoga')
            if 'meditação' in line_lower or 'meditation' in line_lower:
                content_keywords.append('meditação')
            if 'fitoterapia' in line_lower or 'herbal' in line_lower:
                content_keywords.append('fitoterapia')
            if 'homeopatia' in line_lower or 'homeopathy' in line_lower:
                content_keywords.append('homeopatia')
            if 'reiki' in line_lower:
                content_keywords.append('reiki')
            if 'auriculoterapia' in line_lower or 'auricular' in line_lower:
                content_keywords.append('auriculoterapia')
            if 'massagem' in line_lower or 'massage' in line_lower:
                content_keywords.append('massagem')
            if 'aromaterapia' in line_lower or 'aromatherapy' in line_lower:
                content_keywords.append('aromaterapia')
            if 'tai chi' in line_lower or 'taichi' in line_lower:
                content_keywords.append('tai chi')
            if 'medicina tradicional' in line_lower or 'traditional medicine' in line_lower:
                content_keywords.append('medicina tradicional')
            if 'terapias complementares' in line_lower or 'complementary therapies' in line_lower:
                content_keywords.append('terapias complementares')
            if 'medicina integrativa' in line_lower or 'integrative medicine' in line_lower:
                content_keywords.append('medicina integrativa')
        
        if content_keywords:
            keywords = list(set(content_keywords))
        
        # Criar trabalho final
        final_work = {
            'id': f"WCTCIM-{work_id}",
            'title': title,
            'authors': [{
                'name': author_name,
                'institution': institution,
                'email': email,
                'country': 'Brasil'
            }],
            'abstract': abstract,
            'category': category,
            'modality': modality,
            'institution': institution,
            'email': email,
            'keywords': keywords,
            'status': 'Aprovado',
            'schedule': {
                'day': 15,
                'time': '09:00',
                'room': 'Sala 1',
                'duration': 30
            },
            'location': {
                'type': 'auditorium',
                'name': 'Auditório Principal',
                'coordinates': {'x': 25, 'y': 50}
            },
            'media': {
                'pdf': f"/works/WCTCIM-{work_id}.pdf",
                'video': None,
                'podcast': None
            },
            'region': 'Brasil',
            'language': 'português',
            'raw_data': lines
        }
        
        return final_work
        
    except Exception as e:
        print(f"❌ Erro ao extrair informações do trabalho {work_id}: {e}")
        return None

def show_real_content_statistics(works):
    """Mostra estatísticas dos dados reais"""
    print(f"\n📊 ESTATÍSTICAS DOS {len(works)} TRABALHOS:")
    
    # Verificar qualidade dos dados
    print(f"\n🔍 QUALIDADE DOS DADOS:")
    
    # Títulos reais
    real_titles = [w for w in works if w['title'] and w['title'] != f"Trabalho {w['id'].split('-')[1]}"]
    print(f"  Títulos reais: {len(real_titles)}/{len(works)} ({len(real_titles)/len(works)*100:.1f}%)")
    
    # Resumos reais
    real_abstracts = [w for w in works if w['abstract'] and w['abstract'] != 'Resumo não disponível']
    print(f"  Resumos reais: {len(real_abstracts)}/{len(works)} ({len(real_abstracts)/len(works)*100:.1f}%)")
    
    # Emails válidos
    valid_emails = [w for w in works if w['email'] and '@' in w['email']]
    print(f"  Emails válidos: {len(valid_emails)}/{len(works)} ({len(valid_emails)/len(works)*100:.1f}%)")
    
    # Instituições reais
    real_institutions = [w for w in works if w['institution'] and w['institution'] != 'Instituição não especificada']
    print(f"  Instituições reais: {len(real_institutions)}/{len(works)} ({len(real_institutions)/len(works)*100:.1f}%)")
    
    # Palavras-chave específicas
    specific_keywords = [w for w in works if w['keywords'] and w['keywords'] != ['medicina integrativa', 'terapias complementares']]
    print(f"  Palavras-chave específicas: {len(specific_keywords)}/{len(works)} ({len(specific_keywords)/len(works)*100:.1f}%)")
    
    # Mostrar exemplos de trabalhos com dados reais
    print(f"\n✅ EXEMPLOS DE TRABALHOS COM DADOS REAIS:")
    for i, work in enumerate(works[:5]):
        print(f"{i+1}. {work['id']} - {work['title']}")
        print(f"   Autor: {work['authors'][0]['name']}")
        print(f"   Modalidade: {work['modality']} | Categoria: {work['category']}")
        print(f"   Email: {work['email']}")
        print(f"   Instituição: {work['institution']}")
        print(f"   Resumo: {work['abstract'][:150]}...")
        print(f"   Palavras-chave: {work['keywords']}")
        print()

def main():
    print("🚀 EXTRAÇÃO DE RESUMOS E PALAVRAS-CHAVE REAIS")
    print("=" * 50)
    
    works = extract_real_abstracts_keywords()
    
    print(f"\n✅ EXTRAÇÃO COMPLETA!")
    print(f"📊 Total de trabalhos: {len(works)}")

if __name__ == "__main__":
    main()
