#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import csv
import json
import re

def extract_from_csv_sections():
    """Extrai dados dos arquivos CSV separados por seção"""
    print("🚀 Extraindo dados dos arquivos CSV por seção...")
    
    all_works = []
    
    # Processar cada seção
    sections = [
        ('RESEARCH.csv', 'RESEARCH', 'Científico'),
        ('CASE REPORT.csv', 'CASE REPORT', 'Estudo de Caso'),
        ('EXPERIENCE REPORT.csv', 'EXPERIENCE REPORT', 'Estudo de Caso')
    ]
    
    for csv_file, section_name, category in sections:
        print(f"\n📋 Processando {section_name}...")
        works = process_csv_section(csv_file, section_name, category)
        all_works.extend(works)
        print(f"✅ {len(works)} trabalhos extraídos de {section_name}")
    
    print(f"\n📊 Total de trabalhos: {len(all_works)}")
    
    # Mostrar estatísticas de qualidade
    show_quality_statistics(all_works)
    
    # Salvar dados finais
    with open('src/data/scientificWorks.json', 'w', encoding='utf-8') as f:
        json.dump(all_works, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ DADOS EXTRAÍDOS DOS CSV SALVOS!")
    print(f"📁 Arquivo: src/data/scientificWorks.json")
    print(f"📊 Total: {len(all_works)} trabalhos")
    
    return all_works

def process_csv_section(csv_file, section_name, category):
    """Processa um arquivo CSV específico"""
    works = []
    
    # Tentar diferentes codificações
    encodings = ['utf-8', 'latin-1', 'cp1252', 'iso-8859-1']
    
    for encoding in encodings:
        try:
            with open(f'public/{csv_file}', 'r', encoding=encoding) as file:
                # Detectar o delimitador
                sample = file.read(1024)
                file.seek(0)
                
                # Tentar diferentes delimitadores
                delimiter = ','
                if ';' in sample:
                    delimiter = ';'
                elif '\t' in sample:
                    delimiter = '\t'
                
                reader = csv.DictReader(file, delimiter=delimiter)
                
                # Mostrar cabeçalhos para debug
                print(f"📋 Cabeçalhos encontrados: {reader.fieldnames}")
                
                for row_num, row in enumerate(reader, 1):
                    try:
                        work = extract_work_from_row(row, section_name, category, row_num)
                        if work:
                            works.append(work)
                    except Exception as e:
                        print(f"❌ Erro na linha {row_num}: {e}")
                        continue
                
                print(f"✅ Arquivo {csv_file} processado com codificação {encoding}")
                break
                
        except UnicodeDecodeError:
            print(f"⚠️ Codificação {encoding} falhou para {csv_file}")
            continue
        except Exception as e:
            print(f"❌ Erro ao processar {csv_file} com {encoding}: {e}")
            continue
    
    return works

def extract_work_from_row(row, section_name, category, row_num):
    """Extrai dados de uma linha do CSV"""
    try:
        # Procurar por ID
        work_id = None
        for key, value in row.items():
            if value and str(value).strip().isdigit():
                work_id = str(value).strip()
                break
        
        if not work_id:
            print(f"⚠️ Linha {row_num}: ID não encontrado")
            return None
        
        # Extrair dados de cada campo baseado na seção
        title = extract_field_value(row, ['Title'])
        author = extract_field_value(row, ['Autor correspondente', 'Autor apresentador'])
        email = extract_field_value(row, ['E-mail autor correspondente', 'E-mail apresentador'])
        institution = extract_field_value(row, ['Instituições dos Autores', 'Instituições do Trabalho'])
        
        # Extrair resumo baseado na seção e traduzir para português
        if section_name == 'RESEARCH':
            abstract = extract_and_translate_abstract(row, ['Introduction', 'Methods', 'Results and Discussion', 'Conclusions'], 'pesquisa')
        elif section_name == 'CASE REPORT':
            abstract = extract_and_translate_abstract(row, ['Introduction', 'Patient Information', 'Timeline', 'Diagnostic Assessment', 'Therapeutic Intervention', 'Follow-up and Outcomes', 'Discussion'], 'relato de caso')
        elif section_name == 'EXPERIENCE REPORT':
            abstract = extract_and_translate_abstract(row, ['Description', 'Problems Addressed', 'Results (if applicable - optional)', 'Recommendations (or Challenges)'], 'relato de experiência')
        else:
            abstract = extract_and_translate_abstract(row, ['Introduction', 'Methods', 'Results', 'Conclusions'], 'estudo')
        
        keywords = extract_keywords(row)
        modality = extract_modality(row)
        
        # Criar objeto do trabalho
        work = {
            'id': f"WCTCIM-{work_id}",
            'title': title if title else f"Trabalho {work_id}",
            'authors': [{
                'name': author if author else 'Autor não disponível',
                'institution': institution if institution else 'Instituição não especificada',
                'email': email if email else '',
                'country': 'Brasil'
            }],
            'abstract': abstract if abstract else 'Resumo não disponível',
            'category': category,
            'modality': modality,
            'institution': institution if institution else 'Instituição não especificada',
            'email': email if email else '',
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
            'section': section_name
        }
        
        return work
        
    except Exception as e:
        print(f"❌ Erro ao extrair trabalho da linha {row_num}: {e}")
        return None

def extract_field_value(row, possible_keys):
    """Extrai valor de um campo procurando por diferentes nomes de coluna"""
    for key in possible_keys:
        if key in row and row[key] and str(row[key]).strip():
            value = str(row[key]).strip()
            if value and value != 'nan' and value != 'None':
                return value
    return ''

def extract_and_translate_abstract(row, fields, work_type):
    """Extrai e traduz resumo para português"""
    abstract_parts = []
    
    for field in fields:
        value = extract_field_value(row, [field])
        if value:
            abstract_parts.append(value)
    
    if abstract_parts:
        # Combinar todas as partes do resumo
        full_abstract = ' '.join(abstract_parts)
        
        # Traduzir termos comuns para português
        translations = {
            'Background': 'Contexto',
            'Objective': 'Objetivo',
            'Methods': 'Métodos',
            'Results': 'Resultados',
            'Discussion': 'Discussão',
            'Conclusion': 'Conclusão',
            'Conclusions': 'Conclusões',
            'Introduction': 'Introdução',
            'Patient Information': 'Informações do Paciente',
            'Timeline': 'Cronologia',
            'Diagnostic Assessment': 'Avaliação Diagnóstica',
            'Therapeutic Intervention': 'Intervenção Terapêutica',
            'Follow-up and Outcomes': 'Acompanhamento e Resultados',
            'Patient Perspective': 'Perspectiva do Paciente',
            'Informed Consent': 'Consentimento Informado',
            'Description': 'Descrição',
            'Problems Addressed': 'Problemas Abordados',
            'Recommendations': 'Recomendações',
            'Challenges': 'Desafios',
            'study': 'estudo',
            'research': 'pesquisa',
            'case report': 'relato de caso',
            'experience report': 'relato de experiência',
            'Traditional Chinese Medicine': 'Medicina Tradicional Chinesa',
            'TCM': 'MTC',
            'integrative medicine': 'medicina integrativa',
            'complementary therapies': 'terapias complementares',
            'acupuncture': 'acupuntura',
            'herbal medicine': 'fitoterapia',
            'homeopathy': 'homeopatia',
            'yoga': 'yoga',
            'meditation': 'meditação',
            'mindfulness': 'atenção plena',
            'chronic pain': 'dor crônica',
            'anxiety': 'ansiedade',
            'depression': 'depressão',
            'quality of life': 'qualidade de vida',
            'clinical trial': 'ensaio clínico',
            'systematic review': 'revisão sistemática',
            'meta-analysis': 'metanálise',
            'evidence-based': 'baseado em evidências',
            'health promotion': 'promoção da saúde',
            'prevention': 'prevenção',
            'treatment': 'tratamento',
            'therapy': 'terapia',
            'intervention': 'intervenção',
            'outcome': 'resultado',
            'effectiveness': 'efetividade',
            'safety': 'segurança',
            'adverse effects': 'efeitos adversos',
            'patient satisfaction': 'satisfação do paciente',
            'healthcare': 'atenção à saúde',
            'primary care': 'atenção primária',
            'public health': 'saúde pública',
            'health policy': 'política de saúde',
            'disseminating': 'disseminação',
            'academic': 'acadêmico',
            'qualitative': 'qualitativo',
            'in-depth interview': 'entrevista em profundidade',
            'widely acknowledged': 'amplamente reconhecido',
            'evidence needs': 'evidências precisam',
            'translated': 'traduzidas',
            'disseminated': 'disseminadas',
            'health care': 'atenção à saúde',
            'maximise': 'maximizar',
            'impact': 'impacto',
            'practices': 'práticas',
            'medical systems': 'sistemas médicos',
            'developed': 'desenvolvidos',
            'China': 'China',
            'including': 'incluindo',
            'contributions': 'contribuições',
            'non-Chinese': 'não-chineses',
            'minority': 'minorias'
        }
        
        # Aplicar traduções
        for eng, pt in translations.items():
            full_abstract = full_abstract.replace(eng, pt)
        
        return full_abstract
    
    return f'Resumo não disponível para este {work_type}'

def extract_keywords(row):
    """Extrai palavras-chave"""
    keywords = []
    
    # Procurar por campo de palavras-chave
    keyword_field = extract_field_value(row, ['Palavras Chave'])
    
    if keyword_field:
        # Dividir por vírgula, ponto e vírgula ou quebra de linha
        keyword_list = re.split(r'[,;\\n]', keyword_field)
        for kw in keyword_list:
            kw = kw.strip()
            if kw and len(kw) > 2:
                # Traduzir palavras-chave comuns
                kw_translated = translate_keyword(kw)
                keywords.append(kw_translated)
    
    # Se não encontrou palavras-chave específicas, usar genéricas
    if not keywords:
        keywords = ['medicina integrativa', 'terapias complementares']
    
    return keywords[:5]  # Limitar a 5 palavras-chave

def translate_keyword(keyword):
    """Traduz palavra-chave para português"""
    translations = {
        'integrative medicine': 'medicina integrativa',
        'complementary therapies': 'terapias complementares',
        'traditional chinese medicine': 'medicina tradicional chinesa',
        'acupuncture': 'acupuntura',
        'herbal medicine': 'fitoterapia',
        'homeopathy': 'homeopatia',
        'yoga': 'yoga',
        'meditation': 'meditação',
        'mindfulness': 'atenção plena',
        'chronic pain': 'dor crônica',
        'anxiety': 'ansiedade',
        'depression': 'depressão',
        'quality of life': 'qualidade de vida',
        'clinical trial': 'ensaio clínico',
        'systematic review': 'revisão sistemática',
        'meta-analysis': 'metanálise',
        'evidence-based': 'baseado em evidências',
        'health promotion': 'promoção da saúde',
        'prevention': 'prevenção',
        'treatment': 'tratamento',
        'therapy': 'terapia',
        'intervention': 'intervenção',
        'outcome': 'resultado',
        'effectiveness': 'efetividade',
        'safety': 'segurança',
        'adverse effects': 'efeitos adversos',
        'patient satisfaction': 'satisfação do paciente',
        'healthcare': 'atenção à saúde',
        'primary care': 'atenção primária',
        'public health': 'saúde pública',
        'health policy': 'política de saúde'
    }
    
    keyword_lower = keyword.lower()
    for eng, pt in translations.items():
        if eng in keyword_lower:
            return keyword.replace(eng, pt)
    
    return keyword  # Retorna original se não encontrar tradução

def extract_modality(row):
    """Extrai modalidade de apresentação"""
    modality_field = extract_field_value(row, ['Forma de apresentação', 'Forma de apresentação final'])
    
    if modality_field:
        modality_lower = modality_field.lower()
        if 'poster' in modality_lower or 'pôster' in modality_lower:
            return 'pôster'
        elif 'video' in modality_lower or 'vídeo' in modality_lower:
            return 'vídeo'
        elif 'oral' in modality_lower:
            return 'oral'
    
    return 'oral'  # Padrão

def show_quality_statistics(works):
    """Mostra estatísticas de qualidade dos dados"""
    print(f"\n📊 QUALIDADE DOS DADOS EXTRAÍDOS:")
    
    if not works:
        print("  Nenhum trabalho encontrado!")
        return
    
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
    specific_keywords = [w for w in works if any(kw not in ['medicina integrativa', 'terapias complementares'] for kw in w['keywords'])]
    print(f"  Palavras-chave específicas: {len(specific_keywords)}/{len(works)} ({len(specific_keywords)/len(works)*100:.1f}%)")
    
    # Estatísticas por seção
    print(f"\n📊 ESTATÍSTICAS POR SEÇÃO:")
    sections = {}
    for work in works:
        section = work.get('section', 'UNKNOWN')
        if section not in sections:
            sections[section] = 0
        sections[section] += 1
    
    for section, count in sections.items():
        print(f"  {section}: {count} trabalhos")
    
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
    print("🚀 EXTRAÇÃO DE DADOS DOS CSV POR SEÇÃO")
    print("=" * 50)
    
    works = extract_from_csv_sections()
    
    print(f"\n✅ EXTRAÇÃO COMPLETA!")
    print(f"📊 Total de trabalhos: {len(works)}")

if __name__ == "__main__":
    main()
