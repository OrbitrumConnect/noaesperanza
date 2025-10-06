#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import re

def fix_keywords():
    """Corrige e melhora as palavras-chave extraídas"""
    print("🔧 Corrigindo palavras-chave...")
    
    # Carregar dados atuais
    with open('src/data/scientificWorks.json', 'r', encoding='utf-8') as f:
        works = json.load(f)
    
    # Mapeamento de palavras-chave fragmentadas para palavras completas
    keyword_fixes = {
        "'s health": "women's health",
        "-Barre sy": "Guillain-Barre syndrome",
        "-Colo": "colorectal",
        "-D3-sy": "vitamin D3 synthesis",
        "-ce": "evidence",
        "-colo": "colonoscopy",
        "-pharmacological": "pharmacological",
        "-small cell lu": "small cell lung cancer",
        "6-Shogaol": "6-Shogaol",
        ": Primary Health Care": "Primary Health Care",
        ": Traditio": "Traditional Medicine",
        ":Pla": "plant medicine",
        "?-amylase": "alpha-amylase",
        "?-glucosidase": "alpha-glucosidase",
        "APOE": "APOE gene",
        "Academic Trai": "Academic Training",
        "Academic-Commu": "Academic Community",
        "Accessibility": "Healthcare Accessibility",
        "Achilles Te": "Achilles Tendon",
        "Actio": "Action mechanism"
    }
    
    # Dicionário de palavras-chave padrão por categoria
    default_keywords = {
        "RESEARCH": ["medicina integrativa", "pesquisa científica", "terapias complementares"],
        "CASE REPORT": ["relato de caso", "medicina integrativa", "terapias complementares"],
        "EXPERIENCE REPORT": ["relato de experiência", "medicina integrativa", "terapias complementares"]
    }
    
    fixed_count = 0
    
    for work in works:
        old_keywords = work.get('keywords', [])
        new_keywords = []
        
        for keyword in old_keywords:
            # Limpar fragmentos e corrigir
            if keyword in keyword_fixes:
                new_keywords.append(keyword_fixes[keyword])
                fixed_count += 1
            elif len(keyword) < 3:  # Muito curto
                continue
            elif keyword.startswith('-') or keyword.startswith(':'):  # Fragmento
                # Tentar corrigir removendo caracteres especiais
                clean_keyword = re.sub(r'^[-:]+', '', keyword).strip()
                if len(clean_keyword) > 3:
                    new_keywords.append(clean_keyword)
                    fixed_count += 1
            else:
                new_keywords.append(keyword)
        
        # Se não há palavras-chave válidas, usar padrão
        if not new_keywords or len(new_keywords) < 2:
            section = work.get('section', 'RESEARCH')
            new_keywords = default_keywords.get(section, default_keywords['RESEARCH'])
        
        # Limitar a 5 palavras-chave
        work['keywords'] = new_keywords[:5]
    
    # Salvar dados corrigidos
    with open('src/data/scientificWorks.json', 'w', encoding='utf-8') as f:
        json.dump(works, f, ensure_ascii=False, indent=2)
    
    print(f"✅ {fixed_count} palavras-chave corrigidas!")
    print(f"📊 Total de trabalhos: {len(works)}")
    
    # Mostrar exemplos de palavras-chave corrigidas
    print("\n🔍 Exemplos de palavras-chave corrigidas:")
    for i, work in enumerate(works[:5]):
        print(f"{i+1}. {work['id']}: {', '.join(work['keywords'])}")

if __name__ == "__main__":
    fix_keywords()
