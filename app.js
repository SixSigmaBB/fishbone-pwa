// Debug log to confirm script loaded
console.log('[Fishbone PWA] app.js loaded');

document.addEventListener('DOMContentLoaded', () => {
  console.log('[Fishbone PWA] DOM ready');

  // Register Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./service-worker.js').catch(e=>console.error('SW reg failed', e));
    });
  }

  let deferredPrompt; const installBtn = document.getElementById('installBtn');
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredPrompt = e; if (installBtn) installBtn.hidden = false; });
  installBtn?.addEventListener('click', async ()=>{ try{ await deferredPrompt?.prompt(); await deferredPrompt?.userChoice; }catch(_){} deferredPrompt=null; if (installBtn) installBtn.hidden = true; });

  const svg = document.getElementById('fishbone');
  const generateBtn = document.getElementById('generateBtn');
  const clearBtn = document.getElementById('clearBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const yearEl = document.getElementById('year'); if (yearEl) yearEl.textContent = new Date().getFullYear();

  function getLines(id){ const el = document.getElementById(id); if(!el) return []; return el.value.split(/\r?\n/).map(s=>s.trim()).filter(Boolean); }
  function clearSVG(){ if(!svg) return; while(svg.firstChild) svg.removeChild(svg.firstChild); }
  function line(x1,y1,x2,y2, opts={}){ const el = document.createElementNS('http://www.w3.org/2000/svg','line'); el.setAttribute('x1',x1); el.setAttribute('y1',y1); el.setAttribute('x2',x2); el.setAttribute('y2',y2); el.setAttribute('stroke',opts.stroke||'#0f172a'); el.setAttribute('stroke-width',opts.w||2); if(opts.markerEnd){ el.setAttribute('marker-end',opts.markerEnd); } svg.appendChild(el); return el; }
  function text(x,y, str, opts={}){ const t = document.createElementNS('http://www.w3.org/2000/svg','text'); t.setAttribute('x',x); t.setAttribute('y',y); t.setAttribute('fill',opts.fill||'#111'); t.setAttribute('font-size',opts.size||12); t.setAttribute('font-weight',opts.bold? '700':'400'); t.setAttribute('font-family','system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif'); t.textContent = str; svg.appendChild(t); return t; }
  function wrapText(t, max){ const words = t.textContent.split(/\s+/); let lineTxt = '', dy = 0, x = +t.getAttribute('x'); t.textContent = ''; const tspans=[]; for(const w of words){ const test = lineTxt? lineTxt+ ' ' + w : w; if(test.length > max){ const span = document.createElementNS('http://www.w3.org/2000/svg','tspan'); span.setAttribute('x', x); span.setAttribute('dy', dy? 14:0); span.textContent = lineTxt || w; t.appendChild(span); tspans.push(span); lineTxt = (test.length>max)? w : ''; dy += 14; } else { lineTxt = test; } } if(lineTxt){ const span = document.createElementNS('http://www.w3.org/2000/svg','tspan'); span.setAttribute('x', x); span.setAttribute('dy', tspans.length? 14:0); span.textContent = lineTxt; t.appendChild(span); } }

  function draw(){
    if(!svg) { console.error('SVG element not found'); return; }
    console.log('[Fishbone PWA] draw() called');
    clearSVG();
    const defs = document.createElementNS('http://www.w3.org/2000/svg','defs');
    const marker = document.createElementNS('http://www.w3.org/2000/svg','marker');
    marker.setAttribute('id','arrow'); marker.setAttribute('viewBox','0 0 10 10');
    marker.setAttribute('refX','8'); marker.setAttribute('refY','5');
    marker.setAttribute('markerWidth','8'); marker.setAttribute('markerHeight','8');
    marker.setAttribute('orient','auto-start-reverse');
    const p = document.createElementNS('http://www.w3.org/2000/svg','path'); p.setAttribute('d','M 0 0 L 10 5 L 0 10 z'); p.setAttribute('fill','#0f172a');
    marker.appendChild(p); defs.appendChild(marker); svg.appendChild(defs);

    const W = 1200, H = 700; const xLeft = 80, xRight = W - 80; const yCenter = H/2;
    const spine = document.createElementNS('http://www.w3.org/2000/svg','line');
    spine.setAttribute('x1',xLeft); spine.setAttribute('y1',yCenter);
    spine.setAttribute('x2',xRight); spine.setAttribute('y2',yCenter);
    spine.setAttribute('stroke','#0f172a'); spine.setAttribute('stroke-width','3');
    spine.setAttribute('marker-end','url(#arrow)'); svg.appendChild(spine);

    const cats = [
      {title: document.getElementById('cat1')?.value || 'Man',           items: getLines('items1')},
      {title: document.getElementById('cat2')?.value || 'Method',        items: getLines('items2')},
      {title: document.getElementById('cat3')?.value || 'Material',      items: getLines('items3')},
      {title: document.getElementById('cat4')?.value || 'Measurement',   items: getLines('items4')},
      {title: document.getElementById('cat5')?.value || 'Mother Nature', items: getLines('items5')},
      {title: document.getElementById('cat6')?.value || 'Machine',       items: getLines('items6')},
    ];

    const fractions = [0.15,0.30,0.45,0.60,0.75,0.90];
    const legLen = 190; const angle = 45 * Math.PI/180;

    cats.forEach((c,i)=>{
      const isUp = (i%2===0);
      const baseX = xLeft + (xRight - xLeft) * fractions[i];
      const baseY = yCenter;
      const dx = legLen * Math.cos(angle);
      const dy = legLen * Math.sin(angle) * (isUp? -1 : 1);

      line(baseX, baseY, baseX+dx, baseY+dy, {w:2});
      const title = (c.title||'').trim() || ['Man','Method','Material','Measurement','Mother Nature','Machine'][i];
      const tt = text(baseX+dx-30, baseY+dy + (isUp? -16: 22), title, {bold:true, size:14});
      wrapText(tt, 16);

      const items = c.items; if(!items.length) return;
      const tStart=0.25, tEnd=0.92; const step = (tEnd - tStart) / (items.length + 1);
      items.forEach((s, idx)=>{
        const f = tStart + step*(idx+1);
        const px = baseX + dx*f; const py = baseY + dy*f;
        let nx = -dy, ny = dx; if(!isUp){ nx = dy; ny = -dx; }
        const nlen = Math.hypot(nx, ny) || 1; nx/=nlen; ny/=nlen;
        const subLen = 95; const ex = px + nx*subLen; const ey = py + ny*subLen;
        line(px, py, ex, ey, {w:1.6});
        const label = text(ex + 6, ey + (isUp? -6: 14), s, {size:12});
        wrapText(label, 24);
      });
    });
  }

  // Bind events safely
  generateBtn?.addEventListener('click', draw);
  clearBtn?.addEventListener('click', ()=> clearSVG());
  downloadBtn?.addEventListener('click', ()=>{
    if(!svg) return;
    const serializer = new XMLSerializer();
    const src = serializer.serializeToString(svg);
    const blob = new Blob([src], {type:'image/svg+xml;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1600; canvas.height = 900;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff'; ctx.fillRect(0,0,canvas.width,canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((png)=>{
        const a = document.createElement('a');
        a.href = URL.createObjectURL(png);
        a.download = 'fishbone.png'; a.click();
        URL.revokeObjectURL(a.href);
      }, 'image/png');
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });
});
