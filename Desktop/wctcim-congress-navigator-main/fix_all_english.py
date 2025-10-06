#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import re

def fix_all_english():
    """Deixa tudo em inglês correto, sem misturas"""
    print("🔧 Corrigindo tudo para inglês...")
    
    # Carregar dados atuais
    with open('src/data/scientificWorks.json', 'r', encoding='utf-8') as f:
        works = json.load(f)
    
    # Dicionário para reverter traduções malfeitas
    portuguese_to_english = {
        "Medicina Tradicional Chinesa": "Traditional Chinese Medicine",
        "MTC": "TCM",
        "práticas": "practices",
        "sistemas médicos": "medical systems", 
        "desenvolvidos": "developed",
        "incluindo": "including",
        "contribuições": "contributions",
        "não-chineses": "non-Chinese",
        "minorias": "minorities",
        "Objetivo": "Objective",
        "pesquisa": "research",
        "pesquisaers": "researchers",
        "Contexto": "Background",
        "Métodos": "Methods",
        "Resultados": "Results",
        "Discussão": "Discussion",
        "Conclusão": "Conclusion",
        "Introdução": "Introduction",
        "estudo": "study",
        "medicina integrativa": "integrative medicine",
        "terapias complementares": "complementary therapies",
        "atenção à saúde": "healthcare",
        "evidências": "evidence",
        "traduzidas": "translated",
        "disseminadas": "disseminated",
        "maximizar": "maximize",
        "impacto": "impact",
        "amplamente reconhecido": "widely acknowledged"
    }
    
    fixed_count = 0
    
    for work in works:
        # Corrigir resumo
        abstract = work.get('abstract', '')
        if abstract:
            # Reverter traduções malfeitas
            for pt, en in portuguese_to_english.items():
                abstract = abstract.replace(pt, en)
            
            # Limpar caracteres especiais malformados
            abstract = re.sub(r'[?]+', '', abstract)  # Remove ? repetidos
            abstract = re.sub(r'\s+', ' ', abstract)  # Normaliza espaços
            abstract = abstract.strip()
            
            work['abstract'] = abstract
            fixed_count += 1
        
        # Corrigir palavras-chave para inglês
        keywords = []
        title_lower = work.get('title', '').lower()
        
        if "chinese" in title_lower or "china" in title_lower:
            keywords = ["Traditional Chinese Medicine", "History of Medicine", "Female Physicians"]
        elif "acupuncture" in title_lower:
            keywords = ["Acupuncture", "Traditional Chinese Medicine", "Complementary Therapies"]
        elif "anxiety" in title_lower:
            keywords = ["Anxiety", "Mental Health", "Complementary Therapies"]
        elif "auriculotherapy" in title_lower:
            keywords = ["Auriculotherapy", "Auricular Acupuncture", "Integrative Medicine"]
        elif "pain" in title_lower:
            keywords = ["Chronic Pain", "Pain Management", "Integrative Medicine"]
        elif "depression" in title_lower:
            keywords = ["Depression", "Mental Health", "Homeopathy"]
        elif "homeopathy" in title_lower:
            keywords = ["Homeopathy", "Integrative Medicine", "Complementary Therapies"]
        elif "music therapy" in title_lower:
            keywords = ["Music Therapy", "Health Promotion", "Therapeutic Arts"]
        elif "ayurveda" in title_lower:
            keywords = ["Ayurveda", "Traditional Indian Medicine", "Perioperative Care"]
        elif "grounding" in title_lower or "earthing" in title_lower:
            keywords = ["Grounding", "Oxidative Stress", "Bioenergetic Medicine"]
        elif "insomnia" in title_lower:
            keywords = ["Insomnia", "Sleep Disorders", "Acupuncture"]
        elif "burnout" in title_lower:
            keywords = ["Burnout", "Mind-Body Medicine", "Prevention"]
        elif "maternal health" in title_lower:
            keywords = ["Maternal Health", "Traditional Practices", "Nomadic Communities"]
        elif "cancer" in title_lower or "oncology" in title_lower:
            keywords = ["Oncology", "Complementary Care", "Integrative Medicine"]
        elif "viscum album" in title_lower or "mistletoe" in title_lower:
            keywords = ["Viscum Album", "Phytotherapy", "Basic Research"]
        else:
            # Palavras-chave padrão baseadas na categoria
            category = work.get('category', '')
            if "Científico" in category:
                keywords = ["Integrative Medicine", "Scientific Research", "Complementary Therapies"]
            elif "Caso" in category:
                keywords = ["Case Study", "Integrative Medicine", "Clinical Practice"]
            else:
                keywords = ["Integrative Medicine", "Complementary Therapies", "Holistic Health"]
        
        work['keywords'] = keywords[:5]
    
    # Salvar dados corrigidos
    with open('src/data/scientificWorks.json', 'w', encoding='utf-8') as f:
        json.dump(works, f, ensure_ascii=False, indent=2)
    
    print(f"✅ {fixed_count} trabalhos corrigidos para inglês!")
    print(f"📊 Total de trabalhos: {len(works)}")
    
    # Mostrar exemplos corrigidos
    print("\n🔍 Exemplos corrigidos:")
    for i, work in enumerate(works[:3]):
        print(f"{i+1}. {work['id']} - {work['title'][:50]}...")
        print(f"   Keywords: {', '.join(work['keywords'])}")
        print(f"   Abstract: {work['abstract'][:100]}...")
        print()

if __name__ == "__main__":
    fix_all_english()
