import React, { useState } from 'react';
import { GLE_LOGO_URL } from '../constants';
import { verifyCredentials } from '../services/authService';

interface LoginProps {
  onLogin: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await verifyCredentials(username, password);
    if (result.ok) {
      localStorage.setItem('gle_auth_user', username.trim().toLowerCase());
      localStorage.setItem('gle_auth_role', result.role);
      onLogin();
    } else {
      setError(result.message || 'Usuario o contraseña incorrectos.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F3F4F6] font-sans p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 animate-fade-in-up">
        <div className="px-10 pt-10 pb-2 text-center">
          <img src={GLE_LOGO_URL} alt="GLE Colombia" className="h-16 mx-auto object-contain mb-2" />
        </div>
        
        <div className="p-8">
          <h2 className="text-xl font-semibold text-gray-800 text-center tracking-wide mb-2">Centro de Aplicaciones</h2>
          <p className="text-xs text-gray-500 text-center mb-6">Acceso interno</p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-600 uppercase">Usuario</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gle-red focus:border-transparent transition placeholder-gray-400 bg-white"
                placeholder="Ej: comercial"
                autoFocus
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-600 uppercase">Contraseña</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gle-red focus:border-transparent transition placeholder-gray-400 bg-white"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="text-red-700 text-xs bg-red-50 p-3 rounded-md border border-red-200 flex items-start">
                 <svg className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                 </svg>
                 {error}
              </div>
            )}

            <button 
              type="submit"
              className="w-full bg-gle-red text-white font-semibold py-3 rounded-lg hover:bg-[#b01327] transition-colors duration-200 text-sm shadow-lg hover:shadow-xl"
            >
              INGRESAR
            </button>
          </form>
        </div>
        
        <div className="bg-gray-50 px-8 py-4 text-center border-t border-gray-100">
           <p className="text-[10px] text-gray-400">
             &copy; {new Date().getFullYear()} GLE Colombia - Todos los derechos reservados.
           </p>
        </div>
      </div>
    </div>
  );
};