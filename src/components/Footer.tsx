import React from 'react'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-gray-900 via-purple-900 to-amber-600 border-t border-white/20">
      <div className="max-w-7xl mx-auto px-3 py-1">
        <div className="grid md:grid-cols-3 gap-1.5">
          {/* Logo e Descrição */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-1.5 mb-0">
              <div className="w-7 h-7 bg-gradient-to-r from-blue-500 via-green-500 to-yellow-500 rounded-lg flex items-center justify-center overflow-hidden">
                <img 
                  src="/logo-noa-triangulo.gif" 
                  alt="NOA Esperanza" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="text-sm font-bold text-white">NOA ESPERANZA</div>
                <div className="text-xs text-yellow-100">Medicina Digital Inteligente</div>
              </div>
            </div>
            <p className="text-gray-300 mb-0.5 max-w-md text-xs">
              Revolucionando a medicina com inteligência artificial especializada em Nefrologia, 
              Neurologia e Cannabis Medicinal.
            </p>
            
            {/* Redes Sociais */}
            <div className="flex gap-0.5">
              <a 
                href="https://instagram.com/noaesperanza" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-5 h-5 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform duration-300"
              >
                <i className="fab fa-instagram text-xs"></i>
              </a>
              <a 
                href="https://linkedin.com/company/noaesperanza" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-5 h-5 bg-gradient-to-r from-blue-600 to-blue-800 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform duration-300"
              >
                <i className="fab fa-linkedin text-xs"></i>
              </a>
              <a 
                href="https://twitter.com/noaesperanza" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-5 h-5 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform duration-300"
              >
                <i className="fab fa-twitter text-xs"></i>
              </a>
            </div>
          </div>


          {/* Contato */}
          <div>
            <h3 className="text-white font-semibold mb-0 text-xs">Contato</h3>
            <div className="space-y-0">
              <div className="flex items-center gap-2 text-gray-300 text-sm">
                <i className="fas fa-envelope text-blue-400"></i>
                <span>contato@noaesperanza.com</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300 text-sm">
                <i className="fas fa-phone text-green-400"></i>
                <span>+55 (11) 99999-9999</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300 text-sm">
                <i className="fas fa-map-marker-alt text-yellow-400"></i>
                <span>São Paulo, SP - Brasil</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300 text-sm">
                <i className="fas fa-certificate text-purple-400"></i>
                <span>Certificado ANVISA</span>
              </div>
            </div>
          </div>
        </div>

        {/* Linha de Separação */}
        <div className="border-t border-white/20 mt-1.5 pt-1">
          <div className="flex flex-col md:flex-row justify-between items-center gap-0.5">
            <div className="text-gray-400 text-xs">
              © 2024 NOA Esperanza. Todos os direitos reservados.
            </div>
            <div className="flex gap-1.5 text-xs">
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