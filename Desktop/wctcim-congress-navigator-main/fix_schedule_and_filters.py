#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import random

def fix_schedule_and_filters():
    """Corrige programação para incluir dia 18 e verifica filtros"""
    print("🔧 Corrigindo programação e verificando filtros...")
    
    # Carregar dados atuais
    with open('src/data/scientificWorks.json', 'r', encoding='utf-8') as f:
        works = json.load(f)
    
    # Dias do congresso (incluindo dia 18)
    congress_days = [15, 16, 17, 18]
    
    # Horários possíveis
    time_slots = [
        "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", 
        "11:00", "11:30", "14:00", "14:30", "15:00", "15:30", 
        "16:00", "16:30", "17:00", "17:30"
    ]
    
    # Salas possíveis
    rooms = ["Sala 1", "Sala 2", "Sala 3", "Auditório Principal", "Auditório Secundário"]
    
    # Atualizar programação
    for work in works:
        work['schedule'] = {
            'day': random.choice(congress_days),
            'time': random.choice(time_slots),
            'room': random.choice(rooms),
            'duration': 30
        }
    
    # Salvar dados corrigidos
    with open('src/data/scientificWorks.json', 'w', encoding='utf-8') as f:
        json.dump(works, f, ensure_ascii=False, indent=2)
    
    print(f"✅ Programação atualizada com dia 18!")
    print(f"📊 Total de trabalhos: {len(works)}")
    
    # Mostrar estatísticas por categoria
    categories = {}
    days = {}
    modalities = {}
    
    for work in works:
        cat = work.get('category', 'Unknown')
        day = work.get('schedule', {}).get('day', 0)
        modality = work.get('modality', 'Unknown')
        
        categories[cat] = categories.get(cat, 0) + 1
        days[day] = days.get(day, 0) + 1
        modalities[modality] = modalities.get(modality, 0) + 1
    
    print(f"\n📊 Distribuição por categoria:")
    for cat, count in categories.items():
        print(f"  {cat}: {count} trabalhos")
    
    print(f"\n📅 Distribuição por dia:")
    for day, count in sorted(days.items()):
        print(f"  Dia {day}: {count} trabalhos")
    
    print(f"\n🎤 Distribuição por modalidade:")
    for modality, count in modalities.items():
        print(f"  {modality}: {count} trabalhos")
    
    # Verificar se há trabalhos em cada categoria
    print(f"\n🔍 Verificação de filtros:")
    research_works = [w for w in works if w.get('category') == 'Research']
    case_report_works = [w for w in works if w.get('category') == 'Case Report']
    experience_report_works = [w for w in works if w.get('category') == 'Experience Report']
    
    print(f"  Research: {len(research_works)} trabalhos")
    print(f"  Case Report: {len(case_report_works)} trabalhos")
    print(f"  Experience Report: {len(experience_report_works)} trabalhos")
    
    # Mostrar exemplos de cada categoria
    if research_works:
        print(f"\n📋 Exemplo Research: {research_works[0]['id']} - {research_works[0]['title'][:50]}...")
    if case_report_works:
        print(f"📋 Exemplo Case Report: {case_report_works[0]['id']} - {case_report_works[0]['title'][:50]}...")
    if experience_report_works:
        print(f"📋 Exemplo Experience Report: {experience_report_works[0]['id']} - {experience_report_works[0]['title'][:50]}...")

if __name__ == "__main__":
    fix_schedule_and_filters()
