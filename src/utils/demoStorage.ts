import { Application, CandidateProfile, Topic } from '../types';

const DB_NAME = 'usmba-doctorat-demo';
const DB_VERSION = 1;
const FILE_STORE = 'documents';

export interface DemoAccount {
  email: string;
  password: string;
  role: Exclude<import('../types').UserRole, 'visiteur'>;
  displayName: string;
  profile?: CandidateProfile;
}

const seedAccounts: DemoAccount[] = [
  { email: 'candidat.demo@example.com', password: 'DoctoratDemo2026!', role: 'candidat', displayName: 'Mehdi EL AMRANI' },
  { email: 'encadrant.demo@example.com', password: 'DoctoratDemo2026!', role: 'professeur', displayName: 'Pr. Karim BENJELLOUN' },
  { email: 'laboratoire.demo@example.com', password: 'DoctoratDemo2026!', role: 'laboratoire', displayName: 'Direction du laboratoire' },
  { email: 'agent.demo@example.com', password: 'DoctoratDemo2026!', role: 'agent_verificateur', displayName: 'Agent de scolarité' },
  { email: 'cedoc.demo@example.com', password: 'DoctoratDemo2026!', role: 'cedoc', displayName: 'Commission CEDoc' },
  { email: 'admin.demo@example.com', password: 'DoctoratDemo2026!', role: 'administrateur', displayName: 'Administration USMBA' },
];

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => request.result.createObjectStore(FILE_STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveDocumentBlob(key: string, file: Blob): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(FILE_STORE, 'readwrite');
    tx.objectStore(FILE_STORE).put(file, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function loadDocumentBlob(key: string): Promise<Blob | undefined> {
  const db = await openDb();
  const result = await new Promise<Blob | undefined>((resolve, reject) => {
    const request = db.transaction(FILE_STORE).objectStore(FILE_STORE).get(key);
    request.onsuccess = () => resolve(request.result as Blob | undefined);
    request.onerror = () => reject(request.error);
  });
  db.close();
  return result;
}

export async function restoreApplicationPreviews(apps: Application[]): Promise<Application[]> {
  return Promise.all(apps.map(async (app) => ({
    ...app,
    documents: await Promise.all(app.documents.map(async (doc) => {
      const blob = doc.fichierNom ? await loadDocumentBlob(`${app.id}:${doc.id}`) : undefined;
      return blob ? { ...doc, fichierApercuUrl: URL.createObjectURL(blob) } : doc;
    })),
  })));
}

export function readApplications(): Application[] | null {
  try { return JSON.parse(localStorage.getItem('usmba-demo-applications') || 'null') as Application[] | null; }
  catch { return null; }
}

export function writeApplications(apps: Application[]): void {
  const serializable = apps.map((app) => ({
    ...app,
    documents: app.documents.map(({ fichierApercuUrl: _preview, ...doc }) => doc),
  }));
  localStorage.setItem('usmba-demo-applications', JSON.stringify(serializable));
}

export function readCart(): string[] {
  try { return JSON.parse(localStorage.getItem('usmba-demo-cart') || '[]') as string[]; }
  catch { return []; }
}
export function writeCart(ids: string[]): void { localStorage.setItem('usmba-demo-cart', JSON.stringify(ids)); }
export function writeProfile(profile: CandidateProfile): void { localStorage.setItem('usmba-demo-profile', JSON.stringify(profile)); }
export function readProfile(): CandidateProfile | null {
  try { return JSON.parse(localStorage.getItem('usmba-demo-profile') || 'null') as CandidateProfile | null; }
  catch { return null; }
}

export function findDemoAccount(email: string, password: string): DemoAccount | undefined {
  const registered = JSON.parse(localStorage.getItem('usmba-demo-accounts') || '[]') as DemoAccount[];
  return [...seedAccounts, ...registered].find((account) => account.email.toLowerCase() === email.trim().toLowerCase() && account.password === password);
}

export function registerDemoCandidate(account: DemoAccount): void {
  const accounts = JSON.parse(localStorage.getItem('usmba-demo-accounts') || '[]') as DemoAccount[];
  if ([...seedAccounts, ...accounts].some((item) => item.email.toLowerCase() === account.email.toLowerCase())) {
    throw new Error('Un compte utilise déjà cette adresse e-mail.');
  }
  accounts.push(account);
  localStorage.setItem('usmba-demo-accounts', JSON.stringify(accounts));
}

export function saveTopics(topics: Topic[]): void { localStorage.setItem('usmba-demo-topics', JSON.stringify(topics)); }

export function resetDemoData(): Promise<void> {
  Object.keys(localStorage).filter((key) => key.startsWith('usmba-demo-')).forEach((key) => localStorage.removeItem(key));
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DB_NAME);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('Fermez les autres onglets du prototype avant de réinitialiser les données.'));
  });
}
