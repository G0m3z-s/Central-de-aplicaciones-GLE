import { AppItem } from '../types';
import { STORAGE_KEY } from '../constants';
import { supabase, hasSupabase } from './supabaseClient';

export const getApps = (): AppItem[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error loading apps from storage", error);
    return [];
  }
};

export const saveApps = (apps: AppItem[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
  } catch (error) {
    console.error("Error saving apps to storage", error);
  }
};

export const getAppsForOwner = (owner: string): AppItem[] => {
  if (!owner) return [];
  try {
    const data = localStorage.getItem(`${STORAGE_KEY}_${owner}`);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error loading apps for owner from storage", error);
    return [];
  }
};

export const saveAppsForOwner = (owner: string, apps: AppItem[]): void => {
  if (!owner) return;
  try {
    localStorage.setItem(`${STORAGE_KEY}_${owner}`, JSON.stringify(apps));
  } catch (error) {
    console.error("Error saving apps for owner to storage", error);
  }
};

export const exportData = (apps: AppItem[]) => {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(apps, null, 2));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", `gle_apps_backup_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
};

export const importData = (file: File): Promise<AppItem[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json)) {
          resolve(json);
        } else {
          reject(new Error("Formato inválido"));
        }
      } catch (e) {
        reject(e);
      }
    };
    reader.readAsText(file);
  });
};

export const loadAppsForCurrentUser = async (): Promise<AppItem[]> => {
  const owner = localStorage.getItem('gle_auth_user') || '';
  if (hasSupabase && supabase && owner) {
    const { data, error } = await supabase
      .from('aplicaciones')
      .select('*')
      .eq('usuario_owner', owner)
      .order('created_at', { ascending: false });
    if (!error && Array.isArray(data)) {
      return (data as any[]).map(row => ({
        id: row.id,
        name: row.nombre,
        url: row.url,
        category: row.categoria,
        createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
        usuario_owner: row.usuario_owner,
      }));
    }
  }
  return getAppsForOwner(owner);
};

export const createAppForCurrentUser = async (app: AppItem): Promise<boolean> => {
  const owner = localStorage.getItem('gle_auth_user') || '';
  if (hasSupabase && supabase && owner) {
    const payload = {
      id: app.id,
      nombre: app.name,
      url: app.url,
      categoria: app.category,
      usuario_owner: owner,
    };
    const { error } = await supabase.from('aplicaciones').insert(payload);
    if (!error) return true;
    return false;
  }
  return false;
};

export const deleteAppForCurrentUser = async (id: string): Promise<boolean> => {
  const owner = localStorage.getItem('gle_auth_user') || '';
  if (hasSupabase && supabase && owner) {
    const { error } = await supabase
      .from('aplicaciones')
      .delete()
      .eq('id', id)
      .eq('usuario_owner', owner);
    if (!error) return true;
    return false;
  }
  return false;
};

export const updateAppForCurrentUser = async (
  id: string,
  data: { name: string; url: string; category: string }
): Promise<boolean> => {
  const owner = localStorage.getItem('gle_auth_user') || '';
  if (hasSupabase && supabase && owner) {
    const { error } = await supabase
      .from('aplicaciones')
      .update({
        nombre: data.name,
        url: data.url,
        categoria: data.category,
      })
      .eq('id', id)
      .eq('usuario_owner', owner);
    if (!error) return true;
    return false;
  }
  return false;
};