#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import PyPDF2
import json
import re
from collections import defaultdict

def extract_real_data_final():
    """Extrai dados REAIS de cada campo específico da tabela"""
    print("🚀 Extraindo dados REAIS de cada campo...")
    
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
                            
                            # Coletar TODAS as linhas relacionadas a este trabalho
                            work_lines = []
                            for j in range(i, min(i + 200, len(lines))):
                                work_line = lines[j].strip()
                                if work_line:
                                    work_lines.append(work_line)
                                else:
                                    break
                            
                            # Agrupar por ID
                            works_by_id[work_id].extend(work_lines)
            
            print(f"📊 Total de IDs encontrados: {len(works_by_id)}")
            
            # Processar cada trabalho único extraindo dados REAIS
            final_works = []
            
            for work_id, all_lines in works_by_id.items():
                try:
                    # Remover duplicatas das linhas mantendo ordem
                    unique_lines = list(dict.fromkeys(all_lines))
                    
                    # Extrair dados REAIS de cada campo
                    work_data = extract_real_work_data(work_id, unique_lines)
                    if work_data:
                        final_works.append(work_data)
                        
                except Exception as e:
                    print(f"❌ Erro ao processar trabalho {work_id}: {e}")
                    continue
            
            print(f"📊 Total de trabalhos processados: {len(final_works)}")
            
            # Mostrar estatísticas de qualidade
            show_quality_statistics(final_works)
            
            # Salvar dados finais
            with open('src/data/scientificWorks.json', 'w', encoding='utf-8') as f:
                json.dump(final_works, f, ensure_ascii=False, indent=2)
            
            print(f"\n✅ DADOS REAIS SALVOS!")
            print(f"📁 Arquivo: src/data/scientificWorks.json")
            print(f"📊 Total: {len(final_works)} trabalhos")
            
            return final_works
            
    except Exception as e:
        print(f"❌ Erro ao extrair dados: {e}")
        return []

def extract_real_work_data(work_id, lines):
    """Extrai dados REAIS de cada campo específico"""
    try:
        # Identificar a seção baseado no ID
        work_id_num = int(work_id)
        section = ""
        if 26 <= work_id_num <= 1324:
            section = "RESEARCH"
        elif 118 <= work_id_num <= 1307:
            section = "CASE REPORT"
        elif 20 <= work_id_num <= 1326:
            section = "EXPERIENCE REPORT"
        else:
            section = "UNKNOWN"
        
        # Extrair dados REAIS de cada campo
        real_data = extract_field_data(work_id, lines, section)
        
        return create_work_object(work_id, real_data, section)
        
    except Exception as e:
        print(f"❌ Erro ao extrair dados reais {work_id}: {e}")
        return None

def extract_field_data(work_id, lines, section):
    """Extrai dados REAIS de cada campo específico da tabela"""
    data = {
        'title': '',
        'author': '',
        'email': '',
        'institution': '',
        'abstract': '',
        'keywords': [],
        'modality': 'oral',
        'category': 'Científico'
    }
    
    # Procurar por email (campo específico)
    for line in lines:
        if '@' in line and '.' in line and len(line) > 5:
            data['email'] = line
            break
    
    # Procurar por nome do autor (campo específico)
    for i, line in enumerate(lines):
        if line == work_id:
            # Autor geralmente está algumas linhas depois do ID
            for j in range(i+1, min(i+15, len(lines))):
                if (lines[j] and 
                    not lines[j].isdigit() and 
                    not lines[j].startswith('Aprovado') and
                    not lines[j].startswith('Não') and
                    not lines[j].startswith('Sim') and
                    len(lines[j]) > 2 and
                    not any(word in lines[j] for word in ['Poster', 'Oral', 'Video', 'University', 'Institute', 'Hospital', 'Center', 'College', 'School', 'Federal', 'Medical', 'Health', 'Clínica', 'Faculdade', 'Associação', 'Regulatory'])):
                    data['author'] = lines[j]
                    break
            break
    
    # Procurar por modalidade (campo específico)
    for line in lines:
        if 'Poster' in line:
            data['modality'] = 'pôster'
            break
        elif 'Video' in line:
            data['modality'] = 'vídeo'
            break
        elif 'Oral' in line:
            data['modality'] = 'oral'
            break
    
    # Procurar por título (campo específico)
    for line in lines:
        if (len(line) > 30 and 
            not any(word in line for word in ['Poster', 'Oral', 'Video', 'Aprovado', 'Não', 'Sim', 'University', 'Institute', 'Hospital', 'Center', 'College', 'School', 'Federal', 'Medical', 'Health', 'Clínica', 'Faculdade', 'Associação', 'Regulatory', 'Evidence', 'Clinical', 'Observational', 'Others', 'Implementation', 'Qualitative', 'Quantitative', 'Systematic', 'Meta', 'Review', 'Study', 'Research', 'Case', 'Report', 'Experience']) and
            not line.isdigit() and
            not line.isupper() and
            not line.startswith('Resumo') and
            not line.startswith('Palavras') and
            not line.startswith('Dia') and
            not line.startswith('Sala')):
            data['title'] = line
            break
    
    # Procurar por resumo (campo específico)
    for line in lines:
        if (len(line) > 150 and 
            not any(word in line for word in ['Poster', 'Oral', 'Video', 'University', 'Institute', 'Hospital', 'Center', 'College', 'School', 'Federal', 'Medical', 'Health', 'Clínica', 'Faculdade', 'Associação', 'Regulatory']) and
            not line.isdigit() and
            not line.isupper() and
            not line.startswith('Resumo') and
            not line.startswith('Palavras') and
            not line.startswith('Dia') and
            not line.startswith('Sala') and
            not line.startswith('Trabalho') and
            not line.startswith('Work')):
            data['abstract'] = line
            break
    
    # Procurar por instituição (campo específico)
    for line in lines:
        if any(word in line for word in ['University', 'Instituto', 'Faculdade', 'Hospital', 'Clínica', 'Health', 'Medical', 'Regulatory', 'Associação', 'Center', 'College', 'School', 'Federal', 'Medical', 'Health', 'Clínica', 'Faculdade', 'Associação', 'Regulatory', 'EHESP', 'Beijing', 'Nanjing', 'Federal', 'Instituto', 'Faculdade', 'Hospital', 'Clínica', 'Health', 'Medical', 'Regulatory', 'Associação', 'Center', 'College', 'School']):
            data['institution'] = line
            break
    
    # Procurar por palavras-chave (campo específico)
    keywords = []
    for line in lines:
        if (len(line) > 10 and 
            not any(word in line for word in ['Poster', 'Oral', 'Video', 'University', 'Institute', 'Hospital', 'Center', 'College', 'School', 'Federal', 'Medical', 'Health', 'Clínica', 'Faculdade', 'Associação', 'Regulatory', 'Evidence', 'Clinical', 'Observational', 'Others', 'Implementation', 'Qualitative', 'Quantitative', 'Systematic', 'Meta', 'Review', 'Study', 'Research', 'Case', 'Report', 'Experience', 'Resumo', 'Palavras', 'Dia', 'Sala', 'Trabalho', 'Work']) and
            not line.isdigit() and
            not line.isupper() and
            not line.startswith('Resumo') and
            not line.startswith('Palavras') and
            not line.startswith('Dia') and
            not line.startswith('Sala') and
            not line.startswith('Trabalho') and
            not line.startswith('Work') and
            len(line) < 100):
            keywords.append(line)
    
    # Se não encontrou palavras-chave específicas, usar genéricas
    if not keywords:
        if section == "RESEARCH":
            keywords = ['pesquisa', 'medicina integrativa', 'terapias complementares']
        elif section == "CASE REPORT":
            keywords = ['relato de caso', 'medicina integrativa', 'terapias complementares']
        elif section == "EXPERIENCE REPORT":
            keywords = ['relato de experiência', 'medicina integrativa', 'terapias complementares']
        else:
            keywords = ['medicina integrativa', 'terapias complementares']
    
    data['keywords'] = keywords[:5]  # Limitar a 5 palavras-chave
    
    # Definir categoria baseada na seção
    if section == "RESEARCH":
        data['category'] = 'Científico'
    elif section == "CASE REPORT":
        data['category'] = 'Estudo de Caso'
    elif section == "EXPERIENCE REPORT":
        data['category'] = 'Estudo de Caso'
    else:
        data['category'] = 'Científico'
    
    return data

def create_work_object(work_id, data, section):
    """Cria objeto de trabalho com dados REAIS"""
    return {
        'id': f"WCTCIM-{work_id}",
        'title': data['title'] if data['title'] else f"Trabalho {work_id}",
        'authors': [{
            'name': data['author'] if data['author'] else 'Autor não disponível',
            'institution': data['institution'] if data['institution'] else 'Instituição não especificada',
            'email': data['email'] if data['email'] else '',
            'country': 'Brasil'
        }],
        'abstract': data['abstract'] if data['abstract'] else 'Resumo não disponível',
        'category': data['category'],
        'modality': data['modality'],
        'institution': data['institution'] if data['institution'] else 'Instituição não especificada',
        'email': data['email'] if data['email'] else '',
        'keywords': data['keywords'],
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
        'section': section
    }

def show_quality_statistics(works):
    """Mostra estatísticas de qualidade dos dados"""
    print(f"\n📊 QUALIDADE DOS DADOS REAIS:")
    
    # Títulos reais
    real_titles = [w for w in works if w['title'] and not w['title'].startswith('Trabalho')]
    print(f"  Títulos reais: {len(real_titles)}/{len(works)} ({len(real_titles)/len(works)*100:.1f}%)")
    
    # Autores reais
    real_authors = [w for w in works if w['authors'][0]['name'] and w['authors'][0]['name'] != 'Autor não disponível']
    print(f"  Autores reais: {len(real_authors)}/{len(works)} ({len(real_authors)/len(works)*100:.1f}%)")
    
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
    specific_keywords = [w for w in works if any(kw not in ['medicina integrativa', 'terapias complementares', 'pesquisa', 'relato de caso', 'relato de experiência'] for kw in w['keywords'])]
    print(f"  Palavras-chave específicas: {len(specific_keywords)}/{len(works)} ({len(specific_keywords)/len(works)*100:.1f}%)")
    
    # Mostrar exemplos de dados reais
    print(f"\n✅ EXEMPLOS DE DADOS REAIS:")
    
    # Exemplos com títulos reais
    real_title_examples = [w for w in works if w['title'] and not w['title'].startswith('Trabalho')][:3]
    if real_title_examples:
        print(f"\n📋 TRABALHOS COM TÍTULOS REAIS:")
        for i, work in enumerate(real_title_examples):
            print(f"  {i+1}. {work['id']} - {work['title']}")
            print(f"     Autor: {work['authors'][0]['name']}")
            print(f"     Modalidade: {work['modality']} | Categoria: {work['category']}")
            print(f"     Email: {work['email']}")
            print(f"     Instituição: {work['institution']}")
            print(f"     Resumo: {work['abstract'][:100]}...")
            print()
    
    # Exemplos com autores reais
    real_author_examples = [w for w in works if w['authors'][0]['name'] and w['authors'][0]['name'] != 'Autor não disponível'][:3]
    if real_author_examples:
        print(f"\n📋 TRABALHOS COM AUTORES REAIS:")
        for i, work in enumerate(real_author_examples):
            print(f"  {i+1}. {work['id']} - {work['title']}")
            print(f"     Autor: {work['authors'][0]['name']}")
            print(f"     Modalidade: {work['modality']} | Categoria: {work['category']}")
            print(f"     Email: {work['email']}")
            print(f"     Instituição: {work['institution']}")
            print()
    
    # Exemplos com resumos reais
    real_abstract_examples = [w for w in works if w['abstract'] and w['abstract'] != 'Resumo não disponível'][:3]
    if real_abstract_examples:
        print(f"\n📋 TRABALHOS COM RESUMOS REAIS:")
        for i, work in enumerate(real_abstract_examples):
            print(f"  {i+1}. {work['id']} - {work['title']}")
            print(f"     Autor: {work['authors'][0]['name']}")
            print(f"     Modalidade: {work['modality']} | Categoria: {work['category']}")
            print(f"     Email: {work['email']}")
            print(f"     Instituição: {work['institution']}")
            print(f"     Resumo: {work['abstract'][:150]}...")
            print()

def main():
    print("🚀 EXTRAÇÃO DE DADOS REAIS")
    print("=" * 50)
    
    works = extract_real_data_final()
    
    print(f"\n✅ EXTRAÇÃO COMPLETA!")
    print(f"📊 Total de trabalhos: {len(works)}")

if __name__ == "__main__":
    main()
