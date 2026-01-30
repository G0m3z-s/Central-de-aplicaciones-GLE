import React, { useState } from 'react';
import { _supabase, hasSupabase } from '../services/supabaseClient';

interface ChangePasswordProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangePassword: React.FC<ChangePasswordProps> = ({ isOpen, onClose }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const getOverrides = () => {
    try {
      const raw = localStorage.getItem('gle_password_overrides') || '{}';
      return JSON.parse(raw);
    } catch {
      return {} as Record<string, string>;
    }
  };

  const setOverrides = (map: Record<string, string>) => {
    localStorage.setItem('gle_password_overrides', JSON.stringify(map));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const user = localStorage.getItem('gle_auth_user') || '';
    if (!user) {
      setError('No hay usuario activo.');
      return;
    }
    const overrides = getOverrides();
    const current = overrides[user] || '43255435';
    if (oldPassword !== current) {
      setError('La contraseña anterior no coincide.');
      return;
    }
    if (newPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('La confirmación no coincide con la nueva contraseña.');
      return;
    }
    if (hasSupabase && _supabase) {
      const { error: dbError } = await _supabase
        .from('perfiles')
        .update({ password: newPassword })
        .eq('usuario', user);
      if (dbError) {
        setError('No se pudo actualizar en la base de datos.');
        return;
      }
    }
    const next = { ...overrides, [user]: newPassword };
    setOverrides(next);
    setSuccess('Contraseña actualizada.');
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(onClose, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white w-full max-w-md rounded-xl shadow-2xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-800">Cambiar contraseña</h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="relative">
            <input
              type={showOld ? 'text' : 'password'}
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Contraseña anterior"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gle-red focus:border-transparent"
            />
            <button type="button" onClick={() => setShowOld((v) => !v)} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
            </button>
          </div>
          <div className="relative">
            <input
              type={showNew ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Nueva contraseña"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gle-red focus:border-transparent"
            />
            <button type="button" onClick={() => setShowNew((v) => !v)} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
            </button>
          </div>
          <div className="relative">
            <input
              type={showConfirm ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirmar nueva contraseña"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gle-red focus:border-transparent"
            />
            <button type="button" onClick={() => setShowConfirm((v) => !v)} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
            </button>
          </div>
          {error && <div className="text-red-700 text-xs bg-red-50 p-3 rounded-md border border-red-200">{error}</div>}
          {success && <div className="text-green-700 text-xs bg-green-50 p-3 rounded-md border border-green-200">{success}</div>}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-3 py-2 text-xs border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50">Cancelar</button>
            <button type="submit" className="px-3 py-2 text-xs rounded-md bg-gle-red text-white hover:bg-[#b01327]">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
};