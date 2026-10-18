import { seal, open, parse } from './crypto.js';
const $ = id => document.getElementById(id);
let token = '', organizer = false, latest = null, routeVersion = 0;
function view(value) {
  organizer = value; $('player').hidden = value; $('organizer').hidden = !value;
  $('organizer-toggle').textContent = value ? '← Player view' : 'Gumawa ng clue ↗';
}
function locked() {
  $('revealed').hidden = true; $('clue-title').textContent = ''; $('clue-body').textContent = '';
  $('unlock-password').value = ''; $('unlock-password').type = 'password';
  $('show-password').textContent = 'Show'; $('show-password').setAttribute('aria-pressed','false');
  $('vault-state').textContent = '● LOCKED CLUE';
}
function route() {
  routeVersion++; view(false); locked(); token = ''; $('player-status').textContent = '';
  const fragment = location.hash.slice(1);
  $('empty').hidden = false; $('unlock-form').hidden = true;
  if (!fragment) return;
  try {
    if(!fragment.startsWith('open=')) throw Error();
    token = fragment.slice(5); parse(token);
    $('empty').hidden = true; $('unlock-form').hidden = false;
  } catch { token = ''; $('player-status').textContent = 'Hindi valid ang clue link. Hingin sa organizer ang kumpletong link.'; }
}
$('organizer-toggle').addEventListener('click', () => view(!organizer));
$('show-password').addEventListener('click', () => {
  const visible = $('unlock-password').type === 'password';
  $('unlock-password').type = visible ? 'text' : 'password';
  $('show-password').textContent = visible ? 'Hide' : 'Show';
  $('show-password').setAttribute('aria-pressed', String(visible));
  $('show-password').setAttribute('aria-label',visible ? 'Itago ang password' : 'Ipakita ang password');
});
$('relock').addEventListener('click', () => { locked(); $('unlock-form').hidden = false; $('player-status').textContent = ''; $('unlock-password').focus(); });
$('unlock-form').addEventListener('submit', async e => {
  e.preventDefault(); const currentRoute = routeVersion;
  $('unlock-button').disabled = true; $('player-status').textContent = 'Binubuksan ang clue…';
  try {
    const clue = await open(token,$('unlock-password').value);
    if (currentRoute !== routeVersion) return;
    $('clue-title').textContent = clue.title; $('clue-body').textContent = clue.text;
    $('unlock-form').hidden = true; $('revealed').hidden = false;
    $('unlock-password').value = ''; $('vault-state').textContent = '✓ CLUE UNLOCKED';
    $('player-status').textContent = ''; $('clue-title').focus();
  } catch { if(currentRoute === routeVersion) $('player-status').textContent = 'Hindi nabuksan. Suriin ang password (case-sensitive) o hingin muli ang link.'; }
  finally { $('unlock-button').disabled = false; }
});
$('demo').addEventListener('click', async () => {
  $('demo').disabled = true;
  try { const demo = await seal('Clue 01 — Ang simula','Mahusay! Nabuksan mo ang unang clue.\n\nHanapin ang lugar kung saan tahimik ang lahat, pero maraming kuwento. Doon naghihintay ang susunod mong hamon.\n\nSample lang ito — palitan ng sarili mong bugtong sa Clue Builder.','simula'); location.hash = 'open=' + demo; }
  catch { $('player-status').textContent = 'Kailangan ng HTTPS o localhost at browser na may Web Crypto.'; }
  finally { $('demo').disabled = false; }
});
$('create-form').addEventListener('submit', async e => {
  e.preventDefault(); $('create-button').disabled = true; $('create-status').textContent = 'Ine-encrypt ang clue…';
  $('result').hidden = true; latest = null;
  try {
    const sealed = await seal($('title').value,$('content').value,$('create-password').value);
    const url = new URL(location.href); url.hash = 'open=' + sealed; url.search = '';
    latest = {version:1,title:$('title').value,url:url.href};
    $('share-link').value = url.href; $('preview-link').href = url.href;
    $('result').hidden = false; $('create-password').value = '';
    $('copy-link').textContent = 'Copy link'; $('create-status').textContent = 'Handa na! I-test muna bago ibahagi.';
    $('result').scrollIntoView({behavior:'smooth',block:'center'});
  } catch { $('create-status').textContent = 'Hindi nagawa ang link. Gumamit ng HTTPS o localhost at suriin ang mga field.'; }
  finally { $('create-button').disabled = false; }
});
$('copy-link').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText($('share-link').value); $('copy-link').textContent = 'Copied ✓'; }
  catch { $('share-link').focus(); $('share-link').select(); $('create-status').textContent = 'Piliin at kopyahin ang buong link sa kahon.'; }
});
$('download').addEventListener('click', () => {
  if(!latest) return;
  const blob = new Blob([JSON.stringify(latest,null,2)],{type:'application/json'});
  const url = URL.createObjectURL(blob); const anchor = document.createElement('a');
  anchor.href = url; anchor.download = 'clue-link-backup.json'; anchor.click(); setTimeout(() => URL.revokeObjectURL(url),1000);
});
window.addEventListener('hashchange',route); route();
if(!globalThis.crypto?.subtle) {
  $('player-status').textContent = 'Buksan sa HTTPS o localhost para gumana ang encryption.';
  $('create-button').disabled = true; $('demo').disabled = true;
}
