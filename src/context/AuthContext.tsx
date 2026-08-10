import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { UserRole } from '../types';
import { hashPassword, verifyPassword, isLegacyPlaintext } from '../lib/crypto';
import {
  StoredUser,
  Address,
  getUsers,
  saveUsers,
  findUser,
  upsertUser,
  roleFor,
} from '../lib/users';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  role: UserRole;
  address?: Address;
}

/** Fields a user is allowed to edit on their own profile. */
export interface ProfileUpdate {
  name?: string;
  phone?: string;
  address?: Address;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

type Action =
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User };

const STORAGE_KEY = 'biblio_auth';

function toPublic(u: StoredUser): User {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    createdAt: u.createdAt,
    role: roleFor(u.email),
    address: u.address,
  };
}

function reducer(state: AuthState, action: Action): AuthState {
  switch (action.type) {
    case 'LOGIN':
      return { user: action.payload, isAuthenticated: true };
    case 'UPDATE_USER':
      return { ...state, user: action.payload };
    case 'LOGOUT':
      return { user: null, isAuthenticated: false };
    default:
      return state;
  }
}

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
}

interface AuthContextType {
  state: AuthState;
  /** Step 1 of login: validate credentials before the e-mail code is sent. */
  checkCredentials: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  /** Step 2 of login: called after the e-mail code is verified. */
  finishLogin: (email: string) => { ok: boolean; error?: string };
  /** Creates the account (call only after the e-mail code is verified). */
  register: (data: RegisterData) => Promise<{ ok: boolean; error?: string }>;
  emailExists: (email: string) => boolean;
  updateProfile: (data: ProfileUpdate) => { ok: boolean; error?: string };
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(
    reducer,
    { user: null, isAuthenticated: false },
    () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : { user: null, isAuthenticated: false };
      } catch {
        return { user: null, isAuthenticated: false };
      }
    }
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  async function checkCredentials(email: string, password: string) {
    const found = findUser(email);
    if (!found) return { ok: false, error: 'E-mail não cadastrado.' };

    // Transparently upgrade any legacy plaintext password on first login.
    if (isLegacyPlaintext(found.passwordHash)) {
      if (found.passwordHash !== password) {
        return { ok: false, error: 'E-mail ou senha incorretos.' };
      }
      upsertUser({ ...found, passwordHash: await hashPassword(password) });
      return { ok: true };
    }

    const ok = await verifyPassword(password, found.passwordHash);
    return ok
      ? { ok: true }
      : { ok: false, error: 'E-mail ou senha incorretos.' };
  }

  function finishLogin(email: string) {
    const found = findUser(email);
    if (!found) return { ok: false, error: 'Conta não encontrada.' };
    dispatch({ type: 'LOGIN', payload: toPublic(found) });
    return { ok: true };
  }

  function emailExists(email: string) {
    return Boolean(findUser(email));
  }

  async function register(data: RegisterData) {
    const users = getUsers();
    if (users.find((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
      return { ok: false, error: 'Este e-mail já está cadastrado.' };
    }
    const newUser: StoredUser = {
      id: crypto.randomUUID(),
      name: data.name,
      email: data.email,
      phone: data.phone,
      createdAt: new Date().toISOString(),
      passwordHash: await hashPassword(data.password),
    };
    saveUsers([...users, newUser]);
    dispatch({ type: 'LOGIN', payload: toPublic(newUser) });
    return { ok: true };
  }

  function updateProfile(data: ProfileUpdate) {
    const current = state.user;
    if (!current) return { ok: false, error: 'Não autenticado.' };
    const stored = findUser(current.email);
    if (!stored) return { ok: false, error: 'Conta não encontrada.' };

    const updated: StoredUser = {
      ...stored,
      name: data.name?.trim() || stored.name,
      phone: data.phone ?? stored.phone,
      address: data.address ? { ...stored.address, ...data.address } : stored.address,
    };
    upsertUser(updated);
    dispatch({ type: 'UPDATE_USER', payload: toPublic(updated) });
    return { ok: true };
  }

  function logout() {
    dispatch({ type: 'LOGOUT' });
  }

  return (
    <AuthContext.Provider
      value={{ state, checkCredentials, finishLogin, register, emailExists, updateProfile, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
