import { X } from "lucide-react";

interface VenueCardProps {
  title: string;
  content: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
}

export const VenueCard = ({ title, content, isOpen, onClose }: VenueCardProps) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay to close card when clicking outside */}
      <div 
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Card */}
      <div className="fixed z-50 animate-fade-slide-in" style={{ right: 'calc(1rem + 10%)', top: 'calc(1rem + 3%)', bottom: 'calc(1rem + 3%)', width: 'calc(20rem + 4%)' }}>
        <div className="h-full p-6 overflow-y-auto rounded-xl shadow-lg" style={{ 
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)'
        }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="text-gray-700">
            {content}
          </div>
        </div>
      </div>
    </>
  );
};