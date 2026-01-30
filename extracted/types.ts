export interface AppItem {
  id: string;
  name: string;
  url: string;
  category: string;
  createdAt: number;
  usuario_owner?: string;
}

export type AppCategory = 
  | 'Comercial' 
  | 'Operaciones' 
  | 'SAC' 
  | 'IT' 
  | 'Masivos' 
  | 'RRHH' 
  | 'GLE USA' 
  | 'Ecommerce' 
  | 'Gerencia' 
  | 'Facturación' 
  | 'Financiero' 
  | 'Tesorería';

export const CATEGORIES: AppCategory[] = [
  'Comercial', 
  'Operaciones', 
  'SAC', 
  'IT', 
  'Masivos', 
  'RRHH', 
  'GLE USA', 
  'Ecommerce', 
  'Gerencia', 
  'Facturación', 
  'Financiero', 
  'Tesorería'
];