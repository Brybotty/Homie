// ============================================================
// TIPOS RELACIONADOS CON AUTENTICACIÓN
// Añadir al final de backend/src/types/index.ts
// ============================================================

export interface User {
  id: number;
  google_id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  is_admin: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface JwtPayload {
  userId: number;
  email: string;
  is_admin: boolean;
}

