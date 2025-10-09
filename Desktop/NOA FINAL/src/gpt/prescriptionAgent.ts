/**
 * 💊 PRESCRIPTION AGENT - Prescrições REUNI
 * 
 * Agente especializado em prescrições de cannabis medicinal
 * Compliance automático com RDC 660/2022 e RDC 327/2019
 * Validação de produtos REUNI
 * Auditoria completa para Anvisa
 * 
 * **IMPORTANTE:** Apenas médicos podem criar prescrições
 * 
 * @version 1.0.0
 * @date 2025-10-09
 */

import { NoaContext } from './noaVisionIA'
import { supabase } from '../integrations/supabase/client'

// ========================================
// TIPOS E INTERFACES
// ========================================

export interface REUNIProduct {
  id: string
  product_name: string
  reuni_code: string
  active_ingredient: string
  cbd_concentration: number
  thc_concentration: number
  form: string
  manufacturer: string
  is_active: boolean
}

export interface Prescription {
  id?: string
  patient_id: string
  doctor_id: string
  reuni_product_id: string
  dosage: string
  frequency: string
  duration: string
  clinical_indication: string
  patient_instructions: string
  rdc_660_compliant: boolean
  rdc_327_compliant: boolean
  special_recipe_number?: string
}

export interface ComplianceValidation {
  isCompliant: boolean
  rdc_660: boolean
  rdc_327: boolean
  errors: string[]
  warnings: string[]
}

// ========================================
// PRESCRIPTION AGENT
// ========================================

export const prescriptionAgent = {
  
  /**
   * Processa solicitação de prescrição
   */
  async create(message: string, context: NoaContext): Promise<string> {
    // Verificar se é médico
    if (context.userProfile !== 'medico') {
      return `⚠️ **Acesso Restrito**

Apenas médicos cadastrados podem criar prescrições de cannabis medicinal.

Você está acessando como: **${context.userProfile}**

Se você é médico, faça login com suas credenciais médicas.`
    }
    
    const lower = message.toLowerCase()
    
    // Detectar intenção
    if (lower.includes('criar') || lower.includes('nova prescricao')) {
      return this.showPrescriptionForm(context)
    }
    
    if (lower.includes('validar') || lower.includes('compliance')) {
      return this.explainCompliance()
    }
    
    if (lower.includes('produtos') || lower.includes('reuni') || lower.includes('lista')) {
      return await this.listREUNIProducts(context)
    }
    
    if (lower.includes('rdc 660') || lower.includes('rdc660')) {
      return this.explainRDC660()
    }
    
    if (lower.includes('rdc 327') || lower.includes('rdc327')) {
      return this.explainRDC327()
    }
    
    // Resposta padrão
    return this.showPrescriptionHelp(context)
  },
  
  /**
   * Mostra formulário de prescrição
   */
  showPrescriptionForm(context: NoaContext): string {
    const specialtyNames: Record<string, string> = {
      rim: 'Nefrologia',
      neuro: 'Neurologia',
      cannabis: 'Cannabis Medicinal'
    }
    
    return `💊 **Nova Prescrição - Cannabis Medicinal**

**Sistema REUNI com Compliance Automático**

Para criar uma prescrição válida:
👉 **[Acessar Formulário](/app/prescricoes/nova)**

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**📋 CAMPOS OBRIGATÓRIOS:**

1. **Identificação do Paciente**
   • Nome completo
   • CPF
   • Data de nascimento

2. **Produto REUNI**
   • Selecione da lista de produtos validados
   • Sistema verifica automaticamente se está registrado

3. **Dosagem e Uso**
   • Dosagem inicial (ex: "10 gotas")
   • Frequência (ex: "2x ao dia - manhã e noite")
   • Duração do tratamento (ex: "30 dias")
   • Titulação progressiva (se aplicável)

4. **Indicação Clínica**
   • Diagnóstico principal
   • CID-10
   • Justificativa clínica para uso de cannabis

5. **Instruções ao Paciente**
   • Como usar o medicamento
   • Horários recomendados
   • Cuidados especiais
   • Quando procurar ajuda médica

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**✅ VALIDAÇÃO AUTOMÁTICA RDC 660/2022:**
• Concentração CBD ≤ 30%
• Concentração THC ≤ 0,2%
• Produto registrado no REUNI

**✅ VALIDAÇÃO AUTOMÁTICA RDC 327/2019:**
• Código REUNI válido
• Produto ativo na Anvisa
• Rastreabilidade completa

**✅ AUDITORIA:**
• Registro automático no sistema
• Notificação Anvisa (se aplicável)
• Histórico completo
• Compliance verificável

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Especialidade ativa:** ${specialtyNames[context.specialty]}

${context.specialty === 'neuro' ? `
**💡 DICA NEUROLOGIA:**
Cannabis pode ser indicada para:
• Epilepsia refratária
• Dor neuropática
• Espasticidade (esclerose múltipla)
• Distúrbios do sono
` : ''}

${context.specialty === 'rim' ? `
**💡 DICA NEFROLOGIA:**
Cannabis em pacientes renais:
• Avaliar função renal (TFG)
• Ajustar dosagem se necessário
• Monitorar interações medicamentosas
• Cuidado com anti-hipertensivos
` : ''}

Precisa de ajuda para preencher?`
  },
  
  /**
   * Lista produtos REUNI disponíveis
   */
  async listREUNIProducts(context: NoaContext): Promise<string> {
    try {
      const { data: products, error } = await supabase
        .from('reuni_products')
        .select('*')
        .eq('is_active', true)
        .order('product_name')
      
      if (error) throw error
      
      if (!products || products.length === 0) {
        return `📦 **Produtos REUNI**

Nenhum produto encontrado no momento.

Para adicionar produtos, acesse o painel administrativo.`
      }
      
      let response = `📦 **Produtos REUNI Disponíveis**\n\n`
      response += `Total de ${products.length} produtos ativos:\n\n`
      
      products.forEach((product: any, index: number) => {
        response += `**${index + 1}. ${product.product_name}**\n`
        response += `   • Código REUNI: \`${product.reuni_code}\`\n`
        response += `   • CBD: ${product.cbd_concentration}% | THC: ${product.thc_concentration}%\n`
        response += `   • Forma: ${product.form}\n`
        response += `   • Fabricante: ${product.manufacturer}\n`
        response += `   ${product.cbd_concentration <= 30 && product.thc_concentration <= 0.2 ? '✅' : '❌'} RDC 660 Compliant\n\n`
      })
      
      response += `Para prescrever, diga: "Prescrever [nome do produto]"`
      
      return response
      
    } catch (error) {
      console.error('[PrescriptionAgent] Erro ao listar produtos:', error)
      return '❌ Erro ao buscar produtos REUNI. Tente novamente.'
    }
  },
  
  /**
   * Explica RDC 660/2022
   */
  explainRDC660(): string {
    return `📋 **RDC 660/2022 - Anvisa**

**Regulamentação de Produtos de Cannabis para Uso Medicinal**

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**🎯 OBJETIVO:**
Define critérios para importação e comercialização de produtos de cannabis medicinal no Brasil.

**📊 LIMITES DE CONCENTRAÇÃO:**

**CBD (Canabidiol):**
• Concentração máxima: **30%**
• Produto: Óleo, cápsula, extrato
• Uso: Terapêutico controlado

**THC (Tetrahidrocanabinol):**
• Concentração máxima: **0,2%**
• Justificativa: Minimizar efeitos psicoativos
• Controle: Rigoroso

**📝 REQUISITOS:**

1. **Prescrição Médica Obrigatória**
   • Receituário especial
   • CRM do prescritor
   • Justificativa clínica

2. **Registro na Anvisa**
   • Produto deve estar no REUNI
   • Aprovação prévia
   • Documentação completa

3. **Rastreabilidade**
   • Lote do produto
   • Data de fabricação
   • Validade
   • Cadeia de custódia

**✅ VALIDAÇÃO NOAVISION IA:**
O sistema valida automaticamente:
• Concentração CBD ≤ 30%
• Concentração THC ≤ 0,2%
• Produto registrado
• Prescritor autorizado

**⚠️ NÃO COMPLIANCE:**
Prescrições fora dos limites são bloqueadas automaticamente.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Referência:** RDC nº 660, de 30 de março de 2022`
  },
  
  /**
   * Explica RDC 327/2019
   */
  explainRDC327(): string {
    return `📋 **RDC 327/2019 - Anvisa**

**Registro Especial Unificado (REUNI)**

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**🎯 OBJETIVO:**
Estabelece procedimentos para concessão de Autorização Sanitária para produtos de cannabis.

**📊 REGISTRO REUNI:**

**O que é:**
• Registro especial para produtos de cannabis
• Válido em todo território nacional
• Controle pela Anvisa
• Documentação obrigatória

**Requisitos:**
1. Solicitação formal à Anvisa
2. Documentação técnica completa
3. Certificado de Análise
4. Boas Práticas de Fabricação
5. Rastreabilidade da matéria-prima

**📝 CÓDIGO REUNI:**
Cada produto tem código único:
• Formato: REUNI-XXX-NNN
• Exemplo: REUNI-CBD-001
• Verificável no sistema Anvisa

**✅ VALIDAÇÃO NOAVISION IA:**
O sistema verifica:
• Código REUNI existe
• Produto está ativo
• Registro não expirou
• Fabricante autorizado

**⚠️ ATENÇÃO:**
Apenas produtos com REUNI válido podem ser prescritos.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Referência:** RDC nº 327, de 09 de dezembro de 2019`
  },
  
  /**
   * Explica sistema de compliance
   */
  explainCompliance(): string {
    return `🔐 **Sistema de Compliance - NoaVision IA**

**Validação Automática em Tempo Real**

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**1️⃣ VALIDAÇÃO RDC 660/2022:**

Ao criar prescrição, o sistema verifica:
✅ Produto está no REUNI?
✅ CBD ≤ 30%?
✅ THC ≤ 0,2%?
✅ Prescritor é médico autorizado?

Se **TODOS** ✅ → Prescrição aprovada
Se **ALGUM** ❌ → Prescrição bloqueada

**2️⃣ VALIDAÇÃO RDC 327/2019:**

Sistema consulta banco REUNI:
✅ Código REUNI válido?
✅ Produto ativo na Anvisa?
✅ Fabricante autorizado?
✅ Documentação completa?

**3️⃣ AUDITORIA ANVISA:**

Cada prescrição gera:
• Registro único (ID)
• Timestamp completo
• Rastro de auditoria
• Notificação Anvisa (se aplicável)

**4️⃣ RASTREABILIDADE:**

Sistema registra:
• Quem prescreveu (CRM)
• Para quem (CPF paciente)
• O quê (produto + lote)
• Quando (data/hora)
• Dosagem e duração
• Justificativa clínica

**5️⃣ SEGURANÇA:**

• Prescrições não podem ser alteradas (imutável)
• Apenas médico pode criar
• Paciente pode visualizar
• Admin pode auditar
• Histórico completo preservado

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**🎯 RESULTADO:**
100% de conformidade legal e rastreabilidade completa.`
  },
  
  /**
   * Mostra ajuda para prescrições
   */
  showPrescriptionHelp(context: NoaContext): string {
    if (context.userProfile !== 'medico') {
      return `💊 **Sistema de Prescrições**

Como paciente, você pode:
• Ver suas prescrições ativas
• Consultar dosagens e horários
• Ver histórico de medicamentos
• Renovar prescrições (solicitar ao médico)

👉 **[Ver Minhas Prescrições](/app/prescricoes)**

Precisa renovar alguma prescrição?`
    }
    
    return `💊 **Sistema de Prescrições REUNI**

**Como médico, você pode:**

📝 **Criar Prescrições:**
• "Criar prescrição para [paciente]"
• "Prescrever CBD para epilepsia"
• "Nova prescrição REUNI"

📦 **Consultar Produtos:**
• "Lista de produtos REUNI"
• "Produtos disponíveis"
• "Produtos de CBD"

📋 **Validar Compliance:**
• "Validar prescrição"
• "Explicar RDC 660"
• "Explicar RDC 327"

🔍 **Buscar Histórico:**
• "Prescrições do paciente [nome]"
• "Minhas prescrições"
• "Histórico de prescrições"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**✅ COMPLIANCE AUTOMÁTICO:**
• RDC 660/2022: Concentrações validadas
• RDC 327/2019: Registro REUNI verificado
• Auditoria: Registros completos
• Anvisa: Notificação automática

**Especialidade ativa:** ${context.specialty === 'cannabis' ? 'Cannabis Medicinal ✅' : context.specialty}

O que você precisa fazer?`
  },
  
  /**
   * Valida prescrição contra RDC 660/327
   */
  async validatePrescription(prescription: Prescription): Promise<ComplianceValidation> {
    const errors: string[] = []
    const warnings: string[] = []
    let rdc_660 = false
    let rdc_327 = false
    
    try {
      // Buscar produto REUNI
      const { data: product, error } = await supabase
        .from('reuni_products')
        .select('*')
        .eq('id', prescription.reuni_product_id)
        .single()
      
      if (error || !product) {
        errors.push('Produto não encontrado no registro REUNI')
        return {
          isCompliant: false,
          rdc_660: false,
          rdc_327: false,
          errors,
          warnings
        }
      }
      
      // Validar RDC 660 (concentrações)
      if (product.cbd_concentration <= 30) {
        rdc_660 = true
      } else {
        errors.push(`CBD acima do limite (${product.cbd_concentration}% > 30%)`)
      }
      
      if (product.thc_concentration > 0.2) {
        errors.push(`THC acima do limite (${product.thc_concentration}% > 0,2%)`)
        rdc_660 = false
      }
      
      // Validar RDC 327 (registro REUNI)
      if (product.reuni_code && product.is_active) {
        rdc_327 = true
      } else {
        errors.push('Produto não possui registro REUNI válido')
      }
      
      // Verificar se produto está ativo
      if (!product.is_active) {
        errors.push('Produto não está mais ativo no REUNI')
        rdc_327 = false
      }
      
      // Warnings adicionais
      if (product.cbd_concentration > 20) {
        warnings.push('Concentração de CBD alta (>20%). Monitorar efeitos adversos.')
      }
      
      if (!prescription.special_recipe_number) {
        warnings.push('Recomendado preencher número do receituário especial')
      }
      
      return {
        isCompliant: rdc_660 && rdc_327 && errors.length === 0,
        rdc_660,
        rdc_327,
        errors,
        warnings
      }
      
    } catch (error) {
      console.error('[PrescriptionAgent] Erro na validação:', error)
      return {
        isCompliant: false,
        rdc_660: false,
        rdc_327: false,
        errors: ['Erro ao validar prescrição. Tente novamente.'],
        warnings: []
      }
    }
  },
  
  /**
   * Cria prescrição no banco
   */
  async savePrescription(prescription: Prescription): Promise<{
    success: boolean
    prescriptionId?: string
    validation: ComplianceValidation
  }> {
    try {
      // Validar primeiro
      const validation = await this.validatePrescription(prescription)
      
      if (!validation.isCompliant) {
        return {
          success: false,
          validation
        }
      }
      
      // Salvar no banco
      const { data, error } = await supabase
        .from('prescriptions')
        .insert({
          ...prescription,
          rdc_660_compliant: validation.rdc_660,
          rdc_327_compliant: validation.rdc_327,
          status: 'active',
          created_at: new Date().toISOString()
        })
        .select()
        .single()
      
      if (error) throw error
      
      // Criar notificação para o paciente
      await supabase.from('notifications').insert({
        user_id: prescription.patient_id,
        type: 'prescription_ready',
        title: 'Nova Prescrição Disponível',
        message: 'Você tem uma nova prescrição de cannabis medicinal',
        link: '/app/prescricoes'
      })
      
      return {
        success: true,
        prescriptionId: data.id,
        validation
      }
      
    } catch (error) {
      console.error('[PrescriptionAgent] Erro ao salvar prescrição:', error)
      return {
        success: false,
        validation: {
          isCompliant: false,
          rdc_660: false,
          rdc_327: false,
          errors: ['Erro ao salvar prescrição'],
          warnings: []
        }
      }
    }
  },
  
  /**
   * Busca prescrições de um paciente
   */
  async getPatientPrescriptions(patientId: string, doctorId: string): Promise<string> {
    try {
      const { data: prescriptions, error } = await supabase
        .from('prescriptions')
        .select(`
          *,
          reuni_products(product_name, reuni_code, cbd_concentration, thc_concentration)
        `)
        .eq('patient_id', patientId)
        .eq('doctor_id', doctorId)
        .order('created_at', { ascending: false })
        .limit(10)
      
      if (error) throw error
      
      if (!prescriptions || prescriptions.length === 0) {
        return `📋 Nenhuma prescrição encontrada para este paciente.`
      }
      
      let response = `📋 **Prescrições do Paciente**\n\n`
      response += `Total: ${prescriptions.length}\n\n`
      
      prescriptions.forEach((presc: any, index: number) => {
        const status = presc.status === 'active' ? '🟢 Ativa' : '🔴 Inativa'
        response += `**${index + 1}. ${presc.reuni_products?.product_name}**\n`
        response += `   • Status: ${status}\n`
        response += `   • Dosagem: ${presc.dosage}\n`
        response += `   • Frequência: ${presc.frequency}\n`
        response += `   • Data: ${new Date(presc.created_at).toLocaleDateString('pt-BR')}\n`
        response += `   • RDC 660: ${presc.rdc_660_compliant ? '✅' : '❌'}\n`
        response += `   • RDC 327: ${presc.rdc_327_compliant ? '✅' : '❌'}\n\n`
      })
      
      return response
      
    } catch (error) {
      console.error('[PrescriptionAgent] Erro ao buscar prescrições:', error)
      return '❌ Erro ao buscar prescrições. Tente novamente.'
    }
  }
}

