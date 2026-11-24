// Gamas UCO sin conexión. Con señal, la página se baja siempre de nuevo (así llegan las actualizaciones);
// sin señal, abre la última copia guardada. Las fuentes se guardan la primera vez que se usan.
const V='gamas-v47'; // subir junto con APP_BUILD de index.html (v44)
const CORE=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('gamas-')&&k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
  if(u.origin===location.origin&&u.pathname.indexOf('/rcp/')>=0)return; // la app de RCP tiene su propio service worker
  if(u.origin===location.origin){
    if(r.mode==='navigate'){e.respondWith((()=>{const ac=new AbortController(),to=setTimeout(()=>ac.abort(),3000);
      return fetch(r,{signal:ac.signal}).then(res=>{clearTimeout(to);if(res&&res.ok){const cp=res.clone();caches.open(V).then(c=>c.put('./index.html',cp))}return res.ok?res:caches.match('./index.html').then(m=>m||res)}).catch(()=>{clearTimeout(to);return caches.match('./index.html').then(m=>m||caches.match('./'))})})());return}
    e.respondWith(caches.match(r).then(m=>m||fetch(r)));return}
  if(/(^|\.)fonts\.(googleapis|gstatic)\.com$/.test(u.hostname))
    e.respondWith(caches.open(V).then(c=>c.match(r).then(m=>m||fetch(r).then(res=>{if(res&&(res.ok||res.type==='opaque'))c.put(r,res.clone());return res}))))});
