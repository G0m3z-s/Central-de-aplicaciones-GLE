import React, { useState, useEffect, useMemo } from 'react';
import { AppItem } from './types';
import { getApps, saveApps, exportData, importData, loadAppsForCurrentUser, createAppForCurrentUser, deleteAppForCurrentUser, updateAppForCurrentUser, saveAppsForOwner } from './services/storageService';
import { hasSupabase } from './services/supabaseClient';
import { Modal } from './components/Modal';
import { AppCard } from './components/AppCard';
import { AppForm } from './components/AppForm';
import { Button } from './components/Button';
import { Login } from './components/Login';
import { ChangePassword } from './components/ChangePassword';
import { GLE_LOGO_URL } from './constants';

const App: React.FC = () => {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // App Data State
  // IMPORTANTE: Inicializamos el estado directamente desde localStorage.
  // Esto previene que se guarde un array vacío accidentalmente al cargar la página.
  const [apps, setApps] = useState<AppItem[]>([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentApp, setCurrentApp] = useState<AppItem | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showSplash, setShowSplash] = useState(true);
  const [isChangePwdOpen, setIsChangePwdOpen] = useState(false);

  useEffect(() => {
    const authStatus = localStorage.getItem('gle_auth_token');
    if (authStatus === 'valid') {
      setIsAuthenticated(true);
    }
    setIsLoadingAuth(false);
  }, []);

  useEffect(() => {
    const run = async () => {
      if (isAuthenticated) {
        const remoteApps = await loadAppsForCurrentUser();
        setApps(remoteApps);
      }
    };
    run();
  }, [isAuthenticated]);

  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const owner = localStorage.getItem('gle_auth_user') || '';
    if (!owner) return;
    // Guardamos por dueño para evitar mezclar departamentos.
    saveAppsForOwner(owner, apps);
  }, [apps]);

  const handleLogin = () => {
    localStorage.setItem('gle_auth_token', 'valid');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    // Cierre de sesión inmediato.
    // Solo borramos el token de sesión.
    // NO tocamos la clave 'gle_app_hub_data_v1' donde están las apps.
    localStorage.removeItem('gle_auth_token');
    setIsAuthenticated(false);
    setSearchQuery(''); // Limpiamos el buscador visualmente
  };

  const handleAddApp = async (data: { name: string; url: string; category: string }) => {
    if (editingId) {
      setApps(prev => prev.map(app => 
        app.id === editingId 
          ? { ...app, ...data } 
          : app
      ));
      await updateAppForCurrentUser(editingId, data);
      setEditingId(null);
    } else {
      const owner = localStorage.getItem('gle_auth_user');
      if (!owner) {
        alert('No hay usuario activo. Inicia sesión para guardar.');
        return;
      }
      const newApp: AppItem = {
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        usuario_owner: owner,
        ...data
      };
      setApps(prev => [newApp, ...prev]);
      await createAppForCurrentUser(newApp);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Seguro que deseas eliminar esta aplicación?')) {
      setApps(prev => prev.filter(app => app.id !== id));
      await deleteAppForCurrentUser(id);
    }
  };

  const handleEdit = (app: AppItem) => {
    setEditingId(app.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const importedApps = await importData(file);
        if (window.confirm(`Se encontraron ${importedApps.length} aplicaciones. ¿Deseas reemplazar tu lista actual?`)) {
          setApps(importedApps);
        }
      } catch (err) {
        alert("Error al importar el archivo JSON. Verifica el formato.");
      }
      e.target.value = '';
    }
  };

  const filteredApps = useMemo(() => {
    const lowerQuery = searchQuery.toLowerCase();
    return apps.filter(app => 
      app.name.toLowerCase().includes(lowerQuery) || 
      app.url.toLowerCase().includes(lowerQuery) ||
      app.category.toLowerCase().includes(lowerQuery)
    );
  }, [apps, searchQuery]);

  const editingApp = useMemo(() => 
    apps.find(a => a.id === editingId), 
  [apps, editingId]);

  // Render Logic
  if (isLoadingAuth) {
    return null; // Or a loading spinner
  }

  const content = !isAuthenticated ? (
    <Login onLogin={handleLogin} />
  ) : (
    <div className="min-h-screen bg-[#F3F4F6] pb-20 font-sans text-gray-800 animate-fade-in-up">
      
      <header className="bg-white text-gray-900 shadow-md sticky top-0 z-40 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="flex-shrink-0">
               <img src={GLE_LOGO_URL} alt="GLE Logo" className="h-10 md:h-12 w-auto object-contain" />
             </div>
             <div className="hidden md:block h-8 w-px bg-gray-300 mx-2"></div>
             <h1 className="text-lg md:text-xl font-semibold tracking-wide text-gray-800 hidden sm:block">Centro de Aplicaciones</h1>
          </div>

          <div className="flex items-center gap-4">
             <div className="relative hidden md:block w-72">
               <input 
                 type="text" 
                 placeholder="Buscar aplicación..." 
                 className="w-full bg-white text-sm text-gray-900 border border-gray-300 rounded-full px-4 py-2 shadow-sm focus:outline-none focus:ring-1 focus:ring-gle-red focus:border-gle-red placeholder-gray-400"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
               />
               <svg className="w-4 h-4 text-gray-500 absolute right-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
               </svg>
             </div>

             <button 
               onClick={() => setIsChangePwdOpen(true)}
               className="hidden md:flex items-center gap-2 text-xs text-gray-600 transition-colors border border-gray-300 rounded-full px-3 py-1.5 bg-white hover:text-gray-900 hover:border-gray-400"
               title="Cambiar contraseña"
             >
               <span className="font-medium">Cambiar contraseña</span>
               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21v-2a4 4 0 00-4-4H9a4 4 0 00-4 4v2"/></svg>
             </button>

             <button 
               onClick={handleLogout}
               className="flex items-center gap-2 text-xs text-gray-600 hover:text-gray-900 transition-colors border border-gray-300 hover:border-gray-400 rounded-full px-3 py-1.5 bg-white"
               title="Cerrar Sesión"
             >
               <span className="hidden sm:inline font-medium">Salir</span>
               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
               </svg>
             </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="md:hidden mb-6">
           <input 
             type="text" 
             placeholder="Buscar aplicación..." 
             className="w-full bg-white text-sm border border-gray-300 rounded-full px-4 py-2 shadow-sm focus:ring-gle-red focus:border-gle-red"
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
           />
        </div>

        {/* Action Bar / Stats */}
        <div className="flex justify-between items-center mb-6">
           <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
             Total: <span className="text-gray-900">{filteredApps.length}</span> Aplicaciones
           </p>
           
           <div className="flex gap-2">
             <label className="cursor-pointer inline-flex items-center justify-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50">
               <svg className="w-3.5 h-3.5 mr-1.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
               </svg>
               Importar JSON
               <input type="file" accept=".json" className="hidden" onChange={handleImport} />
             </label>
             <button 
                onClick={() => exportData(apps)}
                className="inline-flex items-center justify-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
             >
               <svg className="w-3.5 h-3.5 mr-1.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
               </svg>
               Exportar
             </button>
           </div>
        </div>

        {/* Form Section */}
        <AppForm 
          onSubmit={handleAddApp} 
          initialData={editingApp}
          isEditing={!!editingId}
          onCancel={() => setEditingId(null)}
        />

        {/* Grid */}
        {filteredApps.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredApps.map(app => (
              <AppCard 
                key={app.id} 
                app={app} 
                onOpen={(a) => window.open(a.url, '_blank', 'noopener,noreferrer')}
                onPreview={(a) => {
                  setCurrentApp(a);
                  setIsModalOpen(true);
                }}
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-lg border border-dashed border-gray-300">
            <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay aplicaciones</h3>
            <p className="mt-1 text-sm text-gray-500">Agrega una nueva aplicación usando el formulario de arriba.</p>
          </div>
        )}

      </main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <img src={GLE_LOGO_URL} alt="GLE Logo" className="h-10 w-auto mb-4" />
              <p className="text-sm text-gray-600"><a href="mailto:contacto@glecolombia.com" className="hover:text-gle-red">contacto@glecolombia.com</a></p>
              <p className="text-sm text-gray-600"><a href="tel:+576013526700" className="hover:text-gle-red">+57 (601) 352 6700</a> · <a href="tel:018000915615" className="hover:text-gle-red">01 8000 915615</a></p>
              <p className="text-xs text-gray-500 mt-2">Diagonal 26 G # 95 A - 85 Torre 3 Piso 1, Bogotá</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-3">Sedes</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>Bogotá · +601 6953631 · Av. Cra 70 No. 48 - 45</li>
                <li>Medellín · +604 4795931 · Calle 7d No. 43ª - 99 / Of. 1305</li>
                <li>Barranquilla · +57 3148159573 · Cra 55 # 100 - 51 Of. 709</li>
                <li>Cali · +57 3160185734 · Av. 6A Bis # 35N - 100 Of. 615</li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-3">Políticas y entidades</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li><a href="#" className="hover:text-gle-red">Protección de datos personales</a></li>
                <li><a href="#" className="hover:text-gle-red">Términos y condiciones</a></li>
                <li><a href="#" className="hover:text-gle-red">Política de calidad</a></li>
                <li><a href="#" className="hover:text-gle-red">Proceso PQR’S e Indemnizaciones</a></li>
                <li className="text-xs text-gray-500 mt-2">Supertransporte: +57 (601) 352 6700 · <a href="mailto:atencionciudadano@supertransporte.gov.co" className="hover:text-gle-red">atencionciudadano@supertransporte.gov.co</a></li>
                <li className="text-xs text-gray-500">MinTIC: +57 (601) 344 3460 · <a href="mailto:minticresponde@mintic.gov.co" className="hover:text-gle-red">minticresponde@mintic.gov.co</a></li>
                <li className="text-xs text-gray-500">SIC: +57 (601) 592 0400 · <a href="mailto:contactenos@sic.gov.co" className="hover:text-gle-red">contactenos@sic.gov.co</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 flex items-center justify-between text-xs text-gray-400">
            <p>&copy; {new Date().getFullYear()} GLE Colombia. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>

      {/* Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        app={currentApp}
      />

      <ChangePassword isOpen={isChangePwdOpen} onClose={() => setIsChangePwdOpen(false)} />
    </div>
  );
  
  return (
    <>
      <div className={`fixed inset-0 z-50 bg-white flex items-center justify-center transition-opacity duration-1000 ease-out ${showSplash ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <img src="/splash.png" alt="Splash" className="max-w-xs sm:max-w-md w-full h-auto object-contain" />
      </div>
      {content}
    </>
  );
};

export default App;
