#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import re

def clean_keywords_completely():
    """Limpa completamente as palavras-chave e cria novas apropriadas"""
    print("🧹 Limpando palavras-chave completamente...")
    
    # Carregar dados atuais
    with open('src/data/scientificWorks.json', 'r', encoding='utf-8') as f:
        works = json.load(f)
    
    # Palavras-chave baseadas no título e categoria
    def generate_keywords_from_title(title, category):
        keywords = []
        title_lower = title.lower()
        
        # Palavras-chave baseadas no título
        if "chinese" in title_lower or "china" in title_lower:
            keywords.extend(["medicina tradicional chinesa", "história da medicina", "médicas chinesas"])
        elif "acupuncture" in title_lower or "acupuntura" in title_lower:
            keywords.extend(["acupuntura", "medicina tradicional chinesa", "terapias complementares"])
        elif "anxiety" in title_lower or "ansiedade" in title_lower:
            keywords.extend(["ansiedade", "saúde mental", "terapias complementares"])
        elif "auriculotherapy" in title_lower or "auriculoterapia" in title_lower:
            keywords.extend(["auriculoterapia", "acupuntura auricular", "medicina integrativa"])
        elif "pain" in title_lower or "dor" in title_lower:
            keywords.extend(["dor crônica", "manejo da dor", "medicina integrativa"])
        elif "depression" in title_lower or "depressão" in title_lower:
            keywords.extend(["depressão", "saúde mental", "homeopatia"])
        elif "homeopathy" in title_lower or "homeopatia" in title_lower:
            keywords.extend(["homeopatia", "medicina integrativa", "terapias complementares"])
        elif "music therapy" in title_lower or "musicoterapia" in title_lower:
            keywords.extend(["musicoterapia", "promoção da saúde", "artes terapêuticas"])
        elif "ayurveda" in title_lower:
            keywords.extend(["ayurveda", "medicina tradicional indiana", "cuidados perioperatórios"])
        elif "grounding" in title_lower or "earthing" in title_lower:
            keywords.extend(["aterramento", "estresse oxidativo", "medicina bioenergética"])
        elif "insomnia" in title_lower or "insônia" in title_lower:
            keywords.extend(["insônia", "distúrbios do sono", "acupuntura"])
        elif "burnout" in title_lower:
            keywords.extend(["burnout", "medicina mente-corpo", "prevenção"])
        elif "maternal health" in title_lower or "saúde materna" in title_lower:
            keywords.extend(["saúde materna", "práticas tradicionais", "comunidades nômades"])
        elif "cancer" in title_lower or "oncology" in title_lower:
            keywords.extend(["oncologia", "cuidados complementares", "medicina integrativa"])
        elif "viscum album" in title_lower or "mistletoe" in title_lower:
            keywords.extend(["viscum album", "fitoterapia", "pesquisa básica"])
        else:
            # Palavras-chave padrão baseadas na categoria
            if category == "Científico":
                keywords = ["medicina integrativa", "pesquisa científica", "terapias complementares"]
            elif category == "Estudo de Caso":
                keywords = ["estudo de caso", "medicina integrativa", "práticas clínicas"]
            else:
                keywords = ["medicina integrativa", "terapias complementares", "saúde holística"]
        
        return keywords[:5]  # Limitar a 5 palavras-chave
    
    cleaned_count = 0
    
    for work in works:
        title = work.get('title', '')
        category = work.get('category', 'Científico')
        
        # Gerar novas palavras-chave baseadas no título e categoria
        new_keywords = generate_keywords_from_title(title, category)
        
        work['keywords'] = new_keywords
        cleaned_count += 1
    
    # Salvar dados corrigidos
    with open('src/data/scientificWorks.json', 'w', encoding='utf-8') as f:
        json.dump(works, f, ensure_ascii=False, indent=2)
    
    print(f"✅ {cleaned_count} trabalhos com palavras-chave limpas!")
    print(f"📊 Total de trabalhos: {len(works)}")
    
    # Mostrar exemplos de palavras-chave limpas
    print("\n🔍 Exemplos de palavras-chave limpas:")
    for i, work in enumerate(works[:10]):
        print(f"{i+1}. {work['id']} - {work['title'][:50]}...")
        print(f"   Palavras-chave: {', '.join(work['keywords'])}")
        print()

if __name__ == "__main__":
    clean_keywords_completely()
