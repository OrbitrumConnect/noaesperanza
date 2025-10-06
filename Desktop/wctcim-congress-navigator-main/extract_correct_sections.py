#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import PyPDF2
import json
import re
from collections import defaultdict

def extract_correct_sections():
    """Extrai dados corretamente identificando cada seção do PDF"""
    print("🚀 Extraindo dados corretos por seção...")
    
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
            
            # Processar cada trabalho único identificando a seção
            final_works = []
            
            for work_id, all_lines in works_by_id.items():
                try:
                    # Remover duplicatas das linhas mantendo ordem
                    unique_lines = list(dict.fromkeys(all_lines))
                    
                    # Identificar a seção e extrair dados corretos
                    work_data = extract_work_by_section(work_id, unique_lines)
                    if work_data:
                        final_works.append(work_data)
                        
                except Exception as e:
                    print(f"❌ Erro ao processar trabalho {work_id}: {e}")
                    continue
            
            print(f"📊 Total de trabalhos processados: {len(final_works)}")
            
            # Mostrar estatísticas por seção
            show_section_statistics(final_works)
            
            # Salvar dados finais
            with open('src/data/scientificWorks.json', 'w', encoding='utf-8') as f:
                json.dump(final_works, f, ensure_ascii=False, indent=2)
            
            print(f"\n✅ DADOS CORRETOS POR SEÇÃO SALVOS!")
            print(f"📁 Arquivo: src/data/scientificWorks.json")
            print(f"📊 Total: {len(final_works)} trabalhos")
            
            return final_works
            
    except Exception as e:
        print(f"❌ Erro ao extrair dados: {e}")
        return []

def extract_work_by_section(work_id, lines):
    """Extrai trabalho identificando a seção correta"""
    try:
        work_id_num = int(work_id)
        
        # Identificar a seção baseado no ID
        section = ""
        if 26 <= work_id_num <= 1324:
            section = "RESEARCH"
        elif 118 <= work_id_num <= 1307:
            section = "CASE REPORT"
        elif 20 <= work_id_num <= 1326:
            section = "EXPERIENCE REPORT"
        else:
            section = "UNKNOWN"
        
        # Extrair dados baseado na seção
        if section == "RESEARCH":
            return extract_research_work(work_id, lines)
        elif section == "CASE REPORT":
            return extract_case_report_work(work_id, lines)
        elif section == "EXPERIENCE REPORT":
            return extract_experience_report_work(work_id, lines)
        else:
            return extract_generic_work(work_id, lines)
            
    except Exception as e:
        print(f"❌ Erro ao extrair trabalho {work_id}: {e}")
        return None

def extract_research_work(work_id, lines):
    """Extrai trabalho da seção RESEARCH"""
    try:
        # Procurar por email
        email = ""
        for line in lines:
            if '@' in line and '.' in line:
                email = line
                break
        
        # Procurar por nome do autor (campo específico da seção RESEARCH)
        author_name = ""
        for i, line in enumerate(lines):
            if line == work_id:
                # Autor geralmente está algumas linhas depois do ID
                for j in range(i+1, min(i+10, len(lines))):
                    if lines[j] and not lines[j].isdigit() and not lines[j].startswith('Aprovado'):
                        author_name = lines[j]
                        break
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
        
        # Procurar por título (campo específico da seção RESEARCH)
        title = f"Research Work {work_id}"
        for line in lines:
            if (len(line) > 20 and 
                not any(word in line for word in ['Poster', 'Oral', 'Video', 'Aprovado', 'Não', 'Sim']) and
                not line.isdigit() and
                not line.isupper()):
                title = line
                break
        
        # Procurar por resumo (campo específico da seção RESEARCH)
        abstract = 'Resumo não disponível'
        for line in lines:
            if (len(line) > 100 and 
                not any(word in line for word in ['Poster', 'Oral', 'Video', 'University', 'Institute', 'Hospital']) and
                not line.isdigit() and
                not line.isupper()):
                abstract = line
                break
        
        # Procurar por instituição
        institution = 'Instituição não especificada'
        for line in lines:
            if any(word in line for word in ['University', 'Instituto', 'Faculdade', 'Hospital', 'Clínica', 'Health', 'Medical', 'Regulatory', 'Associação', 'Center', 'College', 'School']):
                institution = line
                break
        
        # Palavras-chave específicas para RESEARCH
        keywords = ['pesquisa', 'medicina integrativa', 'terapias complementares']
        
        return create_work_object(work_id, title, author_name, email, modality, 'Científico', institution, abstract, keywords, lines)
        
    except Exception as e:
        print(f"❌ Erro ao extrair RESEARCH {work_id}: {e}")
        return None

def extract_case_report_work(work_id, lines):
    """Extrai trabalho da seção CASE REPORT"""
    try:
        # Procurar por email
        email = ""
        for line in lines:
            if '@' in line and '.' in line:
                email = line
                break
        
        # Procurar por nome do autor (campo específico da seção CASE REPORT)
        author_name = ""
        for i, line in enumerate(lines):
            if line == work_id:
                # Autor geralmente está algumas linhas depois do ID
                for j in range(i+1, min(i+10, len(lines))):
                    if lines[j] and not lines[j].isdigit() and not lines[j].startswith('Aprovado'):
                        author_name = lines[j]
                        break
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
        
        # Procurar por título (campo específico da seção CASE REPORT)
        title = f"Case Report {work_id}"
        for line in lines:
            if (len(line) > 20 and 
                not any(word in line for word in ['Poster', 'Oral', 'Video', 'Aprovado', 'Não', 'Sim']) and
                not line.isdigit() and
                not line.isupper()):
                title = line
                break
        
        # Procurar por resumo (campo específico da seção CASE REPORT)
        abstract = 'Resumo não disponível'
        for line in lines:
            if (len(line) > 100 and 
                not any(word in line for word in ['Poster', 'Oral', 'Video', 'University', 'Institute', 'Hospital']) and
                not line.isdigit() and
                not line.isupper()):
                abstract = line
                break
        
        # Procurar por instituição
        institution = 'Instituição não especificada'
        for line in lines:
            if any(word in line for word in ['University', 'Instituto', 'Faculdade', 'Hospital', 'Clínica', 'Health', 'Medical', 'Regulatory', 'Associação', 'Center', 'College', 'School']):
                institution = line
                break
        
        # Palavras-chave específicas para CASE REPORT
        keywords = ['relato de caso', 'medicina integrativa', 'terapias complementares']
        
        return create_work_object(work_id, title, author_name, email, modality, 'Estudo de Caso', institution, abstract, keywords, lines)
        
    except Exception as e:
        print(f"❌ Erro ao extrair CASE REPORT {work_id}: {e}")
        return None

def extract_experience_report_work(work_id, lines):
    """Extrai trabalho da seção EXPERIENCE REPORT"""
    try:
        # Procurar por email
        email = ""
        for line in lines:
            if '@' in line and '.' in line:
                email = line
                break
        
        # Procurar por nome do autor (campo específico da seção EXPERIENCE REPORT)
        author_name = ""
        for i, line in enumerate(lines):
            if line == work_id:
                # Autor geralmente está algumas linhas depois do ID
                for j in range(i+1, min(i+10, len(lines))):
                    if lines[j] and not lines[j].isdigit() and not lines[j].startswith('Aprovado'):
                        author_name = lines[j]
                        break
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
        
        # Procurar por título (campo específico da seção EXPERIENCE REPORT)
        title = f"Experience Report {work_id}"
        for line in lines:
            if (len(line) > 20 and 
                not any(word in line for word in ['Poster', 'Oral', 'Video', 'Aprovado', 'Não', 'Sim']) and
                not line.isdigit() and
                not line.isupper()):
                title = line
                break
        
        # Procurar por resumo (campo específico da seção EXPERIENCE REPORT)
        abstract = 'Resumo não disponível'
        for line in lines:
            if (len(line) > 100 and 
                not any(word in line for word in ['Poster', 'Oral', 'Video', 'University', 'Institute', 'Hospital']) and
                not line.isdigit() and
                not line.isupper()):
                abstract = line
                break
        
        # Procurar por instituição
        institution = 'Instituição não especificada'
        for line in lines:
            if any(word in line for word in ['University', 'Instituto', 'Faculdade', 'Hospital', 'Clínica', 'Health', 'Medical', 'Regulatory', 'Associação', 'Center', 'College', 'School']):
                institution = line
                break
        
        # Palavras-chave específicas para EXPERIENCE REPORT
        keywords = ['relato de experiência', 'medicina integrativa', 'terapias complementares']
        
        return create_work_object(work_id, title, author_name, email, modality, 'Estudo de Caso', institution, abstract, keywords, lines)
        
    except Exception as e:
        print(f"❌ Erro ao extrair EXPERIENCE REPORT {work_id}: {e}")
        return None

def extract_generic_work(work_id, lines):
    """Extrai trabalho genérico para IDs não identificados"""
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
        
        # Procurar por título
        title = f"Trabalho {work_id}"
        for line in lines:
            if (len(line) > 20 and 
                not any(word in line for word in ['Poster', 'Oral', 'Video', 'Aprovado', 'Não', 'Sim']) and
                not line.isdigit() and
                not line.isupper()):
                title = line
                break
        
        # Procurar por resumo
        abstract = 'Resumo não disponível'
        for line in lines:
            if (len(line) > 100 and 
                not any(word in line for word in ['Poster', 'Oral', 'Video', 'University', 'Institute', 'Hospital']) and
                not line.isdigit() and
                not line.isupper()):
                abstract = line
                break
        
        # Procurar por instituição
        institution = 'Instituição não especificada'
        for line in lines:
            if any(word in line for word in ['University', 'Instituto', 'Faculdade', 'Hospital', 'Clínica', 'Health', 'Medical', 'Regulatory', 'Associação', 'Center', 'College', 'School']):
                institution = line
                break
        
        # Palavras-chave genéricas
        keywords = ['medicina integrativa', 'terapias complementares']
        
        return create_work_object(work_id, title, author_name, email, modality, 'Científico', institution, abstract, keywords, lines)
        
    except Exception as e:
        print(f"❌ Erro ao extrair trabalho genérico {work_id}: {e}")
        return None

def create_work_object(work_id, title, author_name, email, modality, category, institution, abstract, keywords, lines):
    """Cria objeto de trabalho padronizado"""
    return {
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

def show_section_statistics(works):
    """Mostra estatísticas por seção"""
    print(f"\n📊 ESTATÍSTICAS DOS {len(works)} TRABALHOS POR SEÇÃO:")
    
    # Contar por seção
    research_count = 0
    case_report_count = 0
    experience_report_count = 0
    unknown_count = 0
    
    for work in works:
        work_id_num = int(work['id'].split('-')[1])
        if 26 <= work_id_num <= 1324:
            research_count += 1
        elif 118 <= work_id_num <= 1307:
            case_report_count += 1
        elif 20 <= work_id_num <= 1326:
            experience_report_count += 1
        else:
            unknown_count += 1
    
    print(f"  RESEARCH (26-1324): {research_count} trabalhos")
    print(f"  CASE REPORT (118-1307): {case_report_count} trabalhos")
    print(f"  EXPERIENCE REPORT (20-1326): {experience_report_count} trabalhos")
    print(f"  UNKNOWN: {unknown_count} trabalhos")
    
    # Verificar qualidade dos dados
    print(f"\n🔍 QUALIDADE DOS DADOS:")
    
    # Títulos reais
    real_titles = [w for w in works if w['title'] and not w['title'].startswith('Trabalho') and not w['title'].startswith('Research Work') and not w['title'].startswith('Case Report') and not w['title'].startswith('Experience Report')]
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
    
    # Mostrar exemplos por seção
    print(f"\n✅ EXEMPLOS POR SEÇÃO:")
    
    # RESEARCH
    research_works = [w for w in works if 26 <= int(w['id'].split('-')[1]) <= 1324]
    if research_works:
        print(f"\n📋 RESEARCH ({len(research_works)} trabalhos):")
        for i, work in enumerate(research_works[:3]):
            print(f"  {i+1}. {work['id']} - {work['title']}")
            print(f"     Autor: {work['authors'][0]['name']}")
            print(f"     Modalidade: {work['modality']} | Categoria: {work['category']}")
            print(f"     Email: {work['email']}")
            print(f"     Instituição: {work['institution']}")
            print()
    
    # CASE REPORT
    case_report_works = [w for w in works if 118 <= int(w['id'].split('-')[1]) <= 1307]
    if case_report_works:
        print(f"\n📋 CASE REPORT ({len(case_report_works)} trabalhos):")
        for i, work in enumerate(case_report_works[:3]):
            print(f"  {i+1}. {work['id']} - {work['title']}")
            print(f"     Autor: {work['authors'][0]['name']}")
            print(f"     Modalidade: {work['modality']} | Categoria: {work['category']}")
            print(f"     Email: {work['email']}")
            print(f"     Instituição: {work['institution']}")
            print()
    
    # EXPERIENCE REPORT
    experience_report_works = [w for w in works if 20 <= int(w['id'].split('-')[1]) <= 1326]
    if experience_report_works:
        print(f"\n📋 EXPERIENCE REPORT ({len(experience_report_works)} trabalhos):")
        for i, work in enumerate(experience_report_works[:3]):
            print(f"  {i+1}. {work['id']} - {work['title']}")
            print(f"     Autor: {work['authors'][0]['name']}")
            print(f"     Modalidade: {work['modality']} | Categoria: {work['category']}")
            print(f"     Email: {work['email']}")
            print(f"     Instituição: {work['institution']}")
            print()

def main():
    print("🚀 EXTRAÇÃO CORRETA POR SEÇÃO")
    print("=" * 50)
    
    works = extract_correct_sections()
    
    print(f"\n✅ EXTRAÇÃO COMPLETA!")
    print(f"📊 Total de trabalhos: {len(works)}")

if __name__ == "__main__":
    main()
