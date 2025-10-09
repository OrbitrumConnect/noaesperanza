// Hook para validação de entrada de dados
export const useValidation = () => {
  
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePassword = (password: string): { isValid: boolean; message: string } => {
    if (password.length < 6) {
      return { isValid: false, message: 'Senha deve ter pelo menos 6 caracteres' }
    }
    return { isValid: true, message: '' }
  }

  const validateCPF = (cpf: string): boolean => {
    const cleanCPF = cpf.replace(/\D/g, '')
    if (cleanCPF.length !== 11) return false
    
    // Validação básica de CPF
    if (/^(\d)\1{10}$/.test(cleanCPF)) return false
    
    let sum = 0
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (10 - i)
    }
    let remainder = 11 - (sum % 11)
    if (remainder === 10 || remainder === 11) remainder = 0
    if (remainder !== parseInt(cleanCPF.charAt(9))) return false
    
    sum = 0
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (11 - i)
    }
    remainder = 11 - (sum % 11)
    if (remainder === 10 || remainder === 11) remainder = 0
    if (remainder !== parseInt(cleanCPF.charAt(10))) return false
    
    return true
  }

  const validatePhone = (phone: string): boolean => {
    const cleanPhone = phone.replace(/\D/g, '')
    return cleanPhone.length >= 10 && cleanPhone.length <= 11
  }

  const sanitizeInput = (input: string): string => {
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove caracteres potencialmente perigosos
      .substring(0, 1000) // Limita tamanho
  }

  const validateMedicalData = (data: any): { isValid: boolean; errors: string[] } => {
    const errors: string[] = []
    
    if (data.name && data.name.length < 2) {
      errors.push('Nome deve ter pelo menos 2 caracteres')
    }
    
    if (data.age && (data.age < 0 || data.age > 120)) {
      errors.push('Idade deve estar entre 0 e 120 anos')
    }
    
    if (data.email && !validateEmail(data.email)) {
      errors.push('Email inválido')
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }

  return {
    validateEmail,
    validatePassword,
    validateCPF,
    validatePhone,
    sanitizeInput,
    validateMedicalData
  }
}
