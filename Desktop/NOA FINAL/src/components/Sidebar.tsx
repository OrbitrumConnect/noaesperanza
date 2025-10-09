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
      {title && <h3 className="text-premium text-base font-semibold mb-3">{title}</h3>}
      
      <div className="space-y-3">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => handleItemClick(item)}
            className="sidebar-admin-card w-full p-3 rounded-lg transition-all duration-200 text-left flex items-center gap-4 group"
          >
            <i className={`fas ${item.icon} text-${item.color}-400 text-base group-hover:scale-110 transition-transform flex-shrink-0`}></i>
            <span className="sidebar-admin-text text-sm leading-relaxed">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default Sidebar