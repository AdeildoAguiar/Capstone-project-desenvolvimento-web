import { AppEvent } from '../types';
import { getEvents, saveEvents } from './events';
import { getUsers, saveUsers, StoredUser } from './users';

/**
 * Seeds realistic sample activity so the admin dashboard has something to
 * show on a fresh install. Everything created here is tagged with the
 * `@demo.bibliojala` domain / demo flag so it can be cleared again.
 */

const DEMO_DOMAIN = '@demo.bibliojala';

const CATALOG: { title: string; author: string; genre: string }[] = [
  { title: 'Cem Anos de Solidão', author: 'Gabriel García Márquez', genre: 'Ficção' },
  { title: 'A Revolução dos Bichos', author: 'George Orwell', genre: 'Ficção' },
  { title: '1984', author: 'George Orwell', genre: 'Ficção' },
  { title: 'Dom Casmurro', author: 'Machado de Assis', genre: 'Literatura' },
  { title: 'Memórias Póstumas de Brás Cubas', author: 'Machado de Assis', genre: 'Literatura' },
  { title: 'O Cortiço', author: 'Aluísio Azevedo', genre: 'Literatura' },
  { title: 'Sapiens', author: 'Yuval Noah Harari', genre: 'História' },
  { title: 'Homo Deus', author: 'Yuval Noah Harari', genre: 'História' },
  { title: 'Breves Respostas para Grandes Questões', author: 'Stephen Hawking', genre: 'Ciência' },
  { title: 'Uma Breve História do Tempo', author: 'Stephen Hawking', genre: 'Ciência' },
  { title: 'O Gene', author: 'Siddhartha Mukherjee', genre: 'Ciência' },
  { title: 'Orgulho e Preconceito', author: 'Jane Austen', genre: 'Romance' },
  { title: 'Razão e Sensibilidade', author: 'Jane Austen', genre: 'Romance' },
  { title: 'O Senhor dos Anéis', author: 'J.R.R. Tolkien', genre: 'Fantasia' },
  { title: 'O Hobbit', author: 'J.R.R. Tolkien', genre: 'Fantasia' },
  { title: 'Harry Potter e a Pedra Filosofal', author: 'J.K. Rowling', genre: 'Fantasia' },
  { title: 'A Menina que Roubava Livros', author: 'Markus Zusak', genre: 'Ficção' },
  { title: 'O Poder do Hábito', author: 'Charles Duhigg', genre: 'Tecnologia' },
  { title: 'Rápido e Devagar', author: 'Daniel Kahneman', genre: 'Ciência' },
  { title: 'A Arte da Guerra', author: 'Sun Tzu', genre: 'Filosofia' },
];

const READERS = [
  'Ana Souza', 'Bruno Lima', 'Carla Mendes', 'Diego Ramos', 'Elena Costa',
  'Felipe Araújo', 'Gabriela Nunes', 'Henrique Dias', 'Isabela Rocha', 'João Pedro',
  'Larissa Melo', 'Marcos Vieira',
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDateWithin(monthsBack: number): Date {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1).getTime();
  return new Date(start + Math.random() * (now.getTime() - start));
}

export function seedDemoData(): number {
  // Demo readers as real (lightweight) accounts, so the user count is real.
  const readerIds = new Map<string, string>();
  const users = getUsers();
  for (const name of READERS) {
    const email = name.toLowerCase().replace(/[^a-z]/g, '.') + DEMO_DOMAIN;
    let existing = users.find((u) => u.email === email);
    if (!existing) {
      existing = {
        id: crypto.randomUUID(),
        name,
        email,
        phone: '',
        createdAt: randomDateWithin(12).toISOString(),
        passwordHash: 'demo',
      } as StoredUser;
      users.push(existing);
    }
    readerIds.set(name, existing.id);
  }
  saveUsers(users);

  // Generate ~140 borrows over 12 months; ~70% eventually returned. Recent
  // months get extra weight so "top authors this month" is populated.
  const events: AppEvent[] = [];
  const COUNT = 140;
  for (let i = 0; i < COUNT; i++) {
    const book = pick(CATALOG);
    const reader = pick(READERS);
    const recent = Math.random() < 0.45; // bias toward the last 2 months
    const borrowedAt = randomDateWithin(recent ? 2 : 12);
    events.push({
      id: crypto.randomUUID(),
      type: 'borrow',
      userId: readerIds.get(reader)!,
      userName: reader,
      bookKey: `/works/DEMO_${book.title.replace(/\W/g, '').slice(0, 12)}`,
      bookTitle: book.title,
      bookAuthor: book.author,
      subject: book.genre,
      at: borrowedAt.toISOString(),
    });
    if (Math.random() < 0.7) {
      const returnedAt = new Date(
        borrowedAt.getTime() + (2 + Math.random() * 20) * 86400000
      );
      if (returnedAt < new Date()) {
        events.push({
          id: crypto.randomUUID(),
          type: 'return',
          userId: readerIds.get(reader)!,
          userName: reader,
          bookKey: `/works/DEMO_${book.title.replace(/\W/g, '').slice(0, 12)}`,
          bookTitle: book.title,
          bookAuthor: book.author,
          subject: book.genre,
          at: returnedAt.toISOString(),
        });
      }
    }
  }

  const merged = [...getEvents(), ...events].sort((a, b) => a.at.localeCompare(b.at));
  saveEvents(merged);
  return events.length;
}

export function clearDemoData() {
  // Remove demo users…
  saveUsers(getUsers().filter((u) => !u.email.endsWith(DEMO_DOMAIN)));
  // …and every event (the log is a demo/analytics tool).
  saveEvents([]);
}

export function hasDemoData(): boolean {
  return getUsers().some((u) => u.email.endsWith(DEMO_DOMAIN));
}
