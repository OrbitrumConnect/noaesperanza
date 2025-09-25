import React from 'react'
import { Link } from 'react-router-dom'

const HomeFooter = () => {
  return (
    <footer className="bg-gradient-to-r from-gray-900/80 via-purple-900/80 to-amber-600/80 border-t border-white/10 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Logo e Info */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 via-green-500 to-yellow-500 rounded-lg flex items-center justify-center overflow-hidden">
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

          {/* Links Rápidos */}
          <div className="flex items-center gap-6 text-xs">
            <Link to="/landing" className="text-gray-300 hover:text-white transition-colors">
              Conheça NOA
            </Link>
            <Link to="/checkout" className="text-gray-300 hover:text-white transition-colors">
              Planos
            </Link>
            <a href="mailto:contato@noaesperanza.com" className="text-gray-300 hover:text-white transition-colors">
              Contato
            </a>
          </div>

          {/* Redes Sociais */}
          <div className="flex gap-2">
            <a 
              href="https://instagram.com/noaesperanza" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-6 h-6 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform duration-300"
            >
              <i className="fab fa-instagram text-xs"></i>
            </a>
            <a 
              href="https://linkedin.com/company/noaesperanza" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-6 h-6 bg-gradient-to-r from-blue-600 to-blue-800 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform duration-300"
            >
              <i className="fab fa-linkedin text-xs"></i>
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/10 mt-3 pt-3 text-center">
          <div className="text-gray-400 text-xs">
            © 2024 NOA Esperanza. Todos os direitos reservados.
          </div>
        </div>
      </div>
    </footer>
  )
}

export default HomeFooter
