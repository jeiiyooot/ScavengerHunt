const enc = new TextEncoder();
const dec = new TextDecoder('utf-8', { fatal: true });
export const ITERATIONS = 310000;
function base64(bytes) { return btoa(String.fromCharCode(...bytes)).replaceAll('+','-').replaceAll('/','_').replaceAll('=',''); }
function unbase64(value) {
  if (typeof value !== 'string' || !/^[A-Za-z0-9_-]+$/.test(value)) throw new Error('Invalid clue link');
  return Uint8Array.from(atob(value.replaceAll('-','+').replaceAll('_','/')), c => c.charCodeAt(0));
}
async function key(password, salt) {
  const raw = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:ITERATIONS,hash:'SHA-256'},raw,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);
}
export async function seal(title, text, password) {
  if (!title.trim() || title.length > 100 || !text.trim() || text.length > 1200 || password.length < 6 || password.length > 200) throw new Error('Check title, clue, and password lengths.');
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipher = await crypto.subtle.encrypt({name:'AES-GCM',iv},await key(password,salt),enc.encode(JSON.stringify({title,text})));
  return base64(enc.encode(JSON.stringify({v:1,s:base64(salt),i:base64(iv),c:base64(new Uint8Array(cipher))})));
}
export function parse(token) {
  if (typeof token !== 'string' || token.length > 20000) throw new Error('Invalid clue link');
  const data = JSON.parse(dec.decode(unbase64(token)));
  if (data.v !== 1) throw new Error('Unsupported clue version');
  const salt = unbase64(data.s), iv = unbase64(data.i), cipher = unbase64(data.c);
  if(salt.length !== 16 || iv.length !== 12 || cipher.length < 17 || cipher.length > 8000) throw new Error('Invalid clue link');
  return {salt,iv,cipher};
}
export async function open(token,password) {
  const {salt,iv,cipher} = parse(token);
  const plain = await crypto.subtle.decrypt({name:'AES-GCM',iv},await key(password,salt),cipher);
  const data = JSON.parse(dec.decode(plain));
  if(typeof data.title !== 'string' || typeof data.text !== 'string' || data.title.length > 100 || data.text.length > 1200) throw new Error('Invalid clue');
  return data;
}
