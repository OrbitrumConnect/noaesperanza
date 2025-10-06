import React from 'react'

interface SidebarProps {
  currentSpecialty: any
  isVoiceListening: boolean
  setIsVoiceListening: (listening: boolean) => void
  addNotification: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void
}

const Sidebar = ({ currentSpecialty, isVoiceListening, setIsVoiceListening, addNotification }: SidebarProps) => {
  return (
    <div className="space-y-6">
      {/* Sidebar completamente limpo */}
    </div>
  )
}

export default Sidebar
