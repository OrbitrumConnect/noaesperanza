import React from 'react'
import { Link } from 'react-router-dom'

const HomeFooter = () => {
  return (
    <footer className="bg-gradient-to-r from-gray-900/90 via-purple-900/90 to-amber-600/90 border-t border-white/10 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-3">
        <div className="flex flex-row justify-between items-center gap-4">
          {/* Logo e Info */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 via-green-500 to-yellow-500 rounded-lg flex items-center justify-center overflow-hidden">
              <img 
                src="/logo-noa-triangulo.gif" 
                alt="MedCanLab"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="text-sm font-bold text-white">MEDCANLAB</div>
              <div className="text-xs text-yellow-100">@ Power By Nôa Esperanza</div>
            </div>
          </div>

          {/* Links Rápidos */}
          <div className="flex items-center gap-4 text-xs">
            <Link to="/politicas" className="text-gray-300 hover:text-white transition-colors">
              Políticas e Regras
            </Link>
          </div>

          {/* Redes Sociais */}
          <div className="flex gap-2">
            <a 
              href="https://instagram.com/medcanlab" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform duration-300"
              title="Instagram"
            >
              <i className="fab fa-instagram text-sm"></i>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default HomeFooter
