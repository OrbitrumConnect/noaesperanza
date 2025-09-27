import React from 'react'
import { useNavigate } from 'react-router-dom'

interface SidebarItem {
  id: string
  label: string
  icon: string
  color: string
  action?: () => void
  route?: string
}

interface SidebarProps {
  title: string
  items: SidebarItem[]
  className?: string
}

const Sidebar: React.FC<SidebarProps> = ({ title, items, className = '' }) => {
  const navigate = useNavigate()

  const handleItemClick = (item: SidebarItem) => {
    if (item.route) {
      navigate(item.route)
    } else if (item.action) {
      item.action()
    }
  }

  return (
    <div className={`premium-card p-3 ${className}`}>
      <h3 className="text-premium text-base font-semibold mb-3">{title}</h3>
      
      <div className="space-y-3">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => handleItemClick(item)}
            className="w-full p-3 bg-gray-800 bg-opacity-50 rounded-lg hover:bg-gray-700 transition-colors text-left flex items-center gap-4 group"
          >
            <i className={`fas ${item.icon} text-${item.color}-400 text-base group-hover:scale-110 transition-transform`}></i>
            <span className="text-base text-gray-300 group-hover:text-white transition-colors">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default Sidebar