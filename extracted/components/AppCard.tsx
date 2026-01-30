import React from 'react';
import { AppItem } from '../types';

interface AppCardProps {
  app: AppItem;
  onOpen: (app: AppItem) => void;
  onPreview: (app: AppItem) => void;
  onDelete: (id: string) => void;
  onEdit: (app: AppItem) => void;
}

export const AppCard: React.FC<AppCardProps> = ({ app, onOpen, onPreview, onDelete, onEdit }) => {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

  // Generate a unique robot avatar based on the app name
  // Using 'bottts' style for that "futuristic/robot" look requested
  const avatarUrl = `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${encodeURIComponent(app.name)}&radius=10`;
  const faviconUrl = `https://www.google.com/s2/favicons?sz=64&domain_url=${app.url}`;

  return (
    <div className="group relative bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full overflow-hidden border border-gray-100">
      {/* Decorative Top Border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gle-red to-red-600 z-10"></div>

      {/* Visual Header / "El Cuadro con el Muñeco" */}
      <div className="relative h-32 bg-gray-50 overflow-hidden flex items-center justify-center border-b border-gray-100">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#D81730_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        {/* The "Futuristic Character" */}
        <img 
          src={avatarUrl} 
          alt="Avatar"
          className="h-24 w-24 object-contain transition-transform duration-500 group-hover:scale-110 drop-shadow-md z-0"
        />

        {/* GLE Watermark Badge */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-bold text-gle-red tracking-widest border border-red-100 shadow-sm z-10">
          GLE
        </div>

        {/* Real App Favicon (Floating bubble) */}
        <div className="absolute bottom-[-16px] right-4 bg-white p-1.5 rounded-full shadow-md border border-gray-100 z-10 group-hover:translate-y-[-4px] transition-transform duration-300">
           <img 
             src={faviconUrl}
             alt="Logo"
             className="w-6 h-6 object-contain"
             onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
           />
        </div>

        {/* Menu Button (Top Right) */}
        <div className="absolute top-2 right-2 z-20" ref={menuRef}>
          <button 
            onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
            className="p-1.5 rounded-full bg-white/80 hover:bg-white text-gray-400 hover:text-gle-red transition-colors shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
          
          {menuOpen && (
            <div className="absolute right-0 top-8 w-32 bg-white rounded-lg shadow-xl border border-gray-100 z-30 py-1 text-xs animate-fade-in-up">
              <button 
                onClick={() => { onEdit(app); setMenuOpen(false); }}
                className="w-full text-left px-3 py-2 hover:bg-gray-50 text-gray-700 block"
              >
                Editar
              </button>
              <button 
                onClick={() => { onDelete(app.id); setMenuOpen(false); }}
                className="w-full text-left px-3 py-2 hover:bg-red-50 text-red-600 block"
              >
                Eliminar
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Content Body */}
      <div className="p-4 pt-6 flex flex-col flex-1">
        <div className="mb-4">
          <h3 className="font-bold text-gray-900 text-base leading-tight group-hover:text-gle-red transition-colors line-clamp-2">
            {app.name}
          </h3>
          <p className="text-[10px] text-gray-400 font-mono truncate mt-1">
            {getDomain(app.url)}
          </p>
          
          {app.category && (
            <div className="mt-2 flex flex-wrap gap-1">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-red-50 text-gle-red border border-red-100">
                {app.category}
              </span>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-2 mt-auto pt-2 border-t border-gray-50">
          <button 
            onClick={() => onPreview(app)}
            className="flex items-center justify-center px-3 py-2 text-xs font-semibold text-gray-600 bg-transparent hover:bg-gray-50 rounded transition-colors group/btn"
          >
            <svg className="w-4 h-4 mr-1.5 text-gray-400 group-hover/btn:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Vista
          </button>
          <button 
            onClick={() => onOpen(app)}
            className="flex items-center justify-center px-3 py-2 text-xs font-bold text-white bg-gle-red rounded shadow-sm hover:shadow-md hover:bg-[#b01327] transition-all transform active:scale-95"
          >
            ABRIR
            <svg className="w-3.5 h-3.5 ml-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
