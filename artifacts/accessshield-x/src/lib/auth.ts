const KEY = "accessshield.session";
const DEMO_EMAIL: string = import.meta.env.VITE_DEMO_EMAIL || "analyst@accessshield.x";
const DEMO_PASSWORD: string = import.meta.env.VITE_DEMO_PASSWORD || "shield-demo-2026";

export function signIn(email: string, password: string): boolean {
  if (email.trim().toLowerCase() === DEMO_EMAIL.toLowerCase() && password === DEMO_PASSWORD) {
    sessionStorage.setItem(KEY, JSON.stringify({ email: DEMO_EMAIL, at: Date.now() }));
    return true;
  }
  return false;
}

export const signOut = (): void => sessionStorage.removeItem(KEY);
export const isSignedIn = (): boolean => sessionStorage.getItem(KEY) !== null;
export const currentUserEmail = (): string | null => {
  const raw = sessionStorage.getItem(KEY);
  return raw ? (JSON.parse(raw) as { email: string }).email : null;
};
