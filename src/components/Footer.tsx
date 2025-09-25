import React from 'react'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-gray-900 via-purple-900 to-amber-600 border-t border-white/20">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid md:grid-cols-4 gap-6">
          {/* Logo e Descrição */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 via-green-500 to-yellow-500 rounded-lg flex items-center justify-center overflow-hidden">
                <img 
                  src="/logo-noa-triangulo.gif" 
                  alt="NOA Esperanza" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="text-lg font-bold text-white">NOA ESPERANZA</div>
                <div className="text-xs text-yellow-100">Medicina Digital Inteligente</div>
              </div>
            </div>
            <p className="text-gray-300 mb-4 max-w-md text-sm">
              Revolucionando a medicina com inteligência artificial especializada em Nefrologia, 
              Neurologia e Cannabis Medicinal.
            </p>
            
            {/* Redes Sociais */}
            <div className="flex gap-3">
              <a 
                href="https://instagram.com/noaesperanza" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform duration-300"
              >
                <i className="fab fa-instagram text-sm"></i>
              </a>
              <a 
                href="https://linkedin.com/company/noaesperanza" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform duration-300"
              >
                <i className="fab fa-linkedin text-sm"></i>
              </a>
              <a 
                href="https://twitter.com/noaesperanza" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-8 h-8 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform duration-300"
              >
                <i className="fab fa-twitter text-sm"></i>
              </a>
              <a 
                href="https://youtube.com/@noaesperanza" 
              target="_blank"
              rel="noopener noreferrer"
                className="w-8 h-8 bg-gradient-to-r from-red-500 to-red-700 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform duration-300"
              >
                <i className="fab fa-youtube text-sm"></i>
              </a>
            </div>
          </div>

          {/* Links Rápidos */}
          <div>
            <h3 className="text-base font-semibold text-white mb-3">Links Rápidos</h3>
            <ul className="space-y-1">
              <li>
                <Link to="/landing" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Conheça NOA
                </Link>
              </li>
              <li>
                <Link to="/chat" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Chat com NOA
                </Link>
              </li>
              <li>
                <Link to="/medico" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Dashboard Médico
                </Link>
              </li>
              <li>
                <Link to="/paciente" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Dashboard Paciente
                </Link>
              </li>
              <li>
                <Link to="/checkout" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Planos e Preços
                </Link>
              </li>
            </ul>
          </div>

          {/* Contato e CRM */}
          <div>
            <h3 className="text-base font-semibold text-white mb-3">Contato</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <i className="fas fa-envelope text-green-400 text-sm"></i>
                <span className="text-gray-300 text-sm">contato@noaesperanza.com</span>
              </div>
              <div className="flex items-center gap-2">
                <i className="fas fa-phone text-green-400 text-sm"></i>
                <span className="text-gray-300 text-sm">(11) 99999-9999</span>
              </div>
              <div className="flex items-center gap-2">
                <i className="fas fa-map-marker-alt text-green-400 text-sm"></i>
                <span className="text-gray-300 text-sm">São Paulo, SP</span>
              </div>
              
              {/* CRM */}
              <div className="mt-3 p-2 bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <i className="fas fa-certificate text-yellow-400 text-sm"></i>
                  <span className="text-xs font-semibold text-white">CRM</span>
                </div>
                <p className="text-xs text-gray-400">
                  Médicos credenciados com CRM ativo
                </p>
                <p className="text-xs text-green-400">
                  Verificação em tempo real
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Linha de Separação */}
        <div className="border-t border-white/20 mt-6 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2024 NOA Esperanza. Todos os direitos reservados.
            </div>
            <div className="flex gap-6 text-sm">
              <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">
                Política de Privacidade
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-white transition-colors">
                Termos de Uso
              </Link>
              <Link to="/cookies" className="text-gray-400 hover:text-white transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer