#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import random

def fix_categories_and_schedule():
    """Corrige categorias e adiciona dias variados"""
    print("🔧 Corrigindo categorias e programação...")
    
    # Carregar dados atuais
    with open('src/data/scientificWorks.json', 'r', encoding='utf-8') as f:
        works = json.load(f)
    
    # Dias do congresso (assumindo 3 dias)
    congress_days = [15, 16, 17]
    
    # Horários possíveis
    time_slots = [
        "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", 
        "11:00", "11:30", "14:00", "14:30", "15:00", "15:30", 
        "16:00", "16:30", "17:00", "17:30"
    ]
    
    # Salas possíveis
    rooms = ["Sala 1", "Sala 2", "Sala 3", "Auditório Principal", "Auditório Secundário"]
    
    # Mapear categorias corretas baseadas na seção
    category_mapping = {
        "RESEARCH": "Research",
        "CASE REPORT": "Case Report", 
        "EXPERIENCE REPORT": "Experience Report"
    }
    
    fixed_count = 0
    
    for i, work in enumerate(works):
        # Corrigir categoria baseada na seção
        section = work.get('section', 'RESEARCH')
        if section in category_mapping:
            work['category'] = category_mapping[section]
            fixed_count += 1
        
        # Adicionar programação variada
        work['schedule'] = {
            'day': random.choice(congress_days),
            'time': random.choice(time_slots),
            'room': random.choice(rooms),
            'duration': 30
        }
    
    # Salvar dados corrigidos
    with open('src/data/scientificWorks.json', 'w', encoding='utf-8') as f:
        json.dump(works, f, ensure_ascii=False, indent=2)
    
    print(f"✅ {fixed_count} trabalhos com categorias e programação corrigidas!")
    print(f"📊 Total de trabalhos: {len(works)}")
    
    # Mostrar estatísticas por categoria
    categories = {}
    days = {}
    for work in works:
        cat = work.get('category', 'Unknown')
        day = work.get('schedule', {}).get('day', 0)
        
        categories[cat] = categories.get(cat, 0) + 1
        days[day] = days.get(day, 0) + 1
    
    print(f"\n📊 Distribuição por categoria:")
    for cat, count in categories.items():
        print(f"  {cat}: {count} trabalhos")
    
    print(f"\n📅 Distribuição por dia:")
    for day, count in days.items():
        print(f"  Dia {day}: {count} trabalhos")
    
    # Mostrar exemplos
    print(f"\n🔍 Exemplos de programação:")
    for i, work in enumerate(works[:5]):
        schedule = work.get('schedule', {})
        print(f"{i+1}. {work['id']} - {work['category']}")
        print(f"   Dia {schedule.get('day')} - {schedule.get('time')} - {schedule.get('room')}")

if __name__ == "__main__":
    fix_categories_and_schedule()
