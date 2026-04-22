import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

type Action =
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'REGISTER'; payload: User };

const STORAGE_KEY = 'biblio_auth';
const USERS_KEY   = 'biblio_users';

function reducer(state: AuthState, action: Action): AuthState {
  switch (action.type) {
    case 'LOGIN':
    case 'REGISTER':
      return { user: action.payload, isAuthenticated: true };
    case 'LOGOUT':
      return { user: null, isAuthenticated: false };
    default:
      return state;
  }
}

interface AuthContextType {
  state: AuthState;
  login: (email: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
  register: (data: RegisterData) => { ok: boolean; error?: string };
  sendVerificationCode: (email: string) => string;
}

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
}

interface StoredUser extends User {
  password: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { user: null, isAuthenticated: false }, () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : { user: null, isAuthenticated: false };
    } catch {
      return { user: null, isAuthenticated: false };
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  function getUsers(): StoredUser[] {
    try {
      return JSON.parse(localStorage.getItem(USERS_KEY) ?? '[]');
    } catch { return []; }
  }

  function saveUsers(users: StoredUser[]) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  function sendVerificationCode(email: string): string {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    sessionStorage.setItem(`verify_${email}`, code);
    console.log(`[DEV] Verification code for ${email}: ${code}`);
    return code;
  }

  function login(email: string, password: string) {
    const users = getUsers();
    const found = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!found) return { ok: false, error: 'E-mail ou senha incorretos.' };
    const { password: _pw, ...user } = found;
    dispatch({ type: 'LOGIN', payload: user });
    return { ok: true };
  }

  function logout() {
    dispatch({ type: 'LOGOUT' });
  }

  function register(data: RegisterData) {
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
      password: data.password,
    };
    saveUsers([...users, newUser]);
    const { password: _pw, ...user } = newUser;
    dispatch({ type: 'REGISTER', payload: user });
    return { ok: true };
  }

  return (
    <AuthContext.Provider value={{ state, login, logout, register, sendVerificationCode }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
