import React, { useState, useEffect } from 'react';
import { AppCategory, CATEGORIES } from '../types';
import { Button } from './Button';

interface AppFormProps {
  onSubmit: (data: { name: string; url: string; category: string }) => void;
  initialData?: { name: string; url: string; category: string } | null;
  isEditing: boolean;
  onCancel: () => void;
}

export const AppForm: React.FC<AppFormProps> = ({ onSubmit, initialData, isEditing, onCancel }) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState<AppCategory | ''>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setUrl(initialData.url);
      setCategory(initialData.category as AppCategory);
    } else {
      resetForm();
    }
  }, [initialData]);

  const resetForm = () => {
    setName('');
    setUrl('');
    setCategory('');
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic Validation
    if (!name.trim()) {
      setError("El nombre es obligatorio");
      return;
    }
    if (!url.trim()) {
      setError("La URL es obligatoria");
      return;
    }
    
    // URL Validation
    let formattedUrl = url.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }

    try {
      new URL(formattedUrl);
    } catch {
      setError("La URL no es válida (ej: google.com)");
      return;
    }

    onSubmit({ name, url: formattedUrl, category });
    if (!isEditing) resetForm();
  };

  return (
    <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 mb-8 transition-all">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide flex items-center gap-2">
          {isEditing ? (
            <>
              <svg className="w-4 h-4 text-gle-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Editar Aplicación
            </>
          ) : (
             <>
              <svg className="w-4 h-4 text-gle-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Agregar Aplicación
             </>
          )}
        </h2>
        {isEditing && (
          <button onClick={onCancel} className="text-xs text-gray-500 hover:text-gle-red underline">
            Cancelar edición
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
        <div className="md:col-span-3">
          <label className="block text-xs font-semibold text-gray-600 mb-1">Nombre</label>
          <input
            type="text"
            className="w-full text-sm border-gray-300 rounded-md focus:border-gle-red focus:ring-gle-red"
            placeholder="Ej: Portal Clientes"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        
        <div className="md:col-span-4">
          <label className="block text-xs font-semibold text-gray-600 mb-1">URL</label>
          <input
            type="text"
            className="w-full text-sm border-gray-300 rounded-md focus:border-gle-red focus:ring-gle-red"
            placeholder="Ej: app.gle.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>

        <div className="md:col-span-3">
          <label className="block text-xs font-semibold text-gray-600 mb-1">Categoría</label>
          <select
            className="w-full text-sm border-gray-300 rounded-md focus:border-gle-red focus:ring-gle-red"
            value={category}
            onChange={(e) => setCategory(e.target.value as AppCategory)}
          >
            <option value="">Seleccionar...</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
           <Button type="submit" className="w-full justify-center">
             {isEditing ? 'Guardar' : 'Agregar'}
           </Button>
        </div>
      </form>
      
      {error && (
        <div className="mt-3 p-2 bg-red-50 border border-red-100 rounded text-xs text-red-600 flex items-center">
          <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}
    </div>
  );
};