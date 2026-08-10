import { UserRole } from '../types';

export interface Address {
  cep?: string;
  street?: string;      // logradouro
  number?: string;
  complement?: string;
  district?: string;    // bairro
  city?: string;        // localidade
  state?: string;       // UF
  country?: string;
}

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  passwordHash: string;
  address?: Address;
}

const USERS_KEY = 'biblio_users';

/** Configurable via VITE_ADMIN_EMAIL; defaults to the project owner. */
export const ADMIN_EMAIL = (
  (import.meta.env.VITE_ADMIN_EMAIL as string) ||
  'adeildo.manoel.aguiar@gmail.com'
).toLowerCase();

export function roleFor(email: string): UserRole {
  return email.toLowerCase() === ADMIN_EMAIL ? 'admin' : 'member';
}

export function getUsers(): StoredUser[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) ?? '[]') as StoredUser[];
  } catch {
    return [];
  }
}

export function saveUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function findUser(email: string): StoredUser | undefined {
  return getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function upsertUser(user: StoredUser) {
  const users = getUsers();
  const i = users.findIndex((u) => u.id === user.id);
  if (i >= 0) users[i] = user;
  else users.push(user);
  saveUsers(users);
}
