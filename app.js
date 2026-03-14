// Debug logs
console.log('[Fishbone PWA] app.js loaded (v6d)');

document.addEventListener('DOMContentLoaded', () => {
  console.log('[Fishbone PWA] DOM ready');

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

  function wrapLines(str, maxChars){
    const words = (str||'').split(/\s+/).filter(Boolean);
    const lines = []; let cur='';
    for(const w of words){ const t = cur? cur+' '+w : w; if(t.length>maxChars){ if(cur) lines.push(cur); cur=w; } else cur=t; }
    if(cur) lines.push(cur); return lines;
  }

  function draw(){
    if(!svg) { console.error('SVG element not found'); return; }
    clearSVG();

    // Canvas geometry
    const W = 1200, H = 700; const marginLeft = 80; const yCenter = H/2;

    // Read Symptom and compute box size/position anchored near right edge
    const symptomText = document.getElementById('symptom')?.value.trim() || '';
    const lines = symptomText ? wrapLines(symptomText, 30) : [];
    const pad=8, lineH=16, boxW=260; // could auto-fit later
    const boxH = pad*2 + lineH * Math.max(lines.length, 1);

    // --- Anchor box by the red area (near right boundary) ---
    const rightMargin = 80;    // distance from SVG right edge to outer box edge
    const gap = 14;            // spacing between arrow tip and box

    const boxX = W - rightMargin - boxW;  // FIXED absolute position
    const boxY = yCenter - boxH/2;        // centered vertically

    // Place spine end so that the arrow tip sits 'gap' left of the box
    const xRight = boxX - gap;            // arrow tip
    const xLeft  = marginLeft;            // left end stays the same

    // Marker for spine arrow
    const defs = document.createElementNS('http://www.w3.org/2000/svg','defs');
    const marker = document.createElementNS('http://www.w3.org/2000/svg','marker');
    marker.setAttribute('id','arrow'); marker.setAttribute('viewBox','0 0 10 10');
    marker.setAttribute('refX','8'); marker.setAttribute('refY','5');
    marker.setAttribute('markerWidth','8'); marker.setAttribute('markerHeight','8');
    marker.setAttribute('orient','auto-start-reverse');
    const p = document.createElementNS('http://www.w3.org/2000/svg','path'); p.setAttribute('d','M 0 0 L 10 5 L 0 10 z'); p.setAttribute('fill','#0f172a');
    marker.appendChild(p); defs.appendChild(marker); svg.appendChild(defs);

    // Draw spine
    line(xLeft, yCenter, xRight, yCenter, {w:3, markerEnd:'url(#arrow)'});

    // Draw fixed-position Symptom box if text provided
    if(symptomText){
      const rect = document.createElementNS('http://www.w3.org/2000/svg','rect');
      rect.setAttribute('x', boxX); rect.setAttribute('y', boxY);
      rect.setAttribute('width', boxW); rect.setAttribute('height', boxH);
      rect.setAttribute('rx', 8); rect.setAttribute('ry', 8);
      rect.setAttribute('fill', '#ffffff'); rect.setAttribute('stroke', '#0f172a');
      svg.appendChild(rect);

      text(boxX, boxY - 6, 'Symptom', {size:12, bold:true});
      lines.forEach((ln,i)=>{ text(boxX + pad, boxY + pad + lineH*(i+0.85), ln, {size:12}); });

      // connector line from arrow tip to box
      line(xRight, yCenter, boxX, boxY + boxH/2, {w:1.2});
    }

    // 6M categories & items
    const cats = [
      {title: document.getElementById('cat1')?.value || 'Man',           items: getLines('items1')},
      {title: document.getElementById('cat2')?.value || 'Method',        items: getLines('items2')},
      {title: document.getElementById('cat3')?.value || 'Material',      items: getLines('items3')},
      {title: document.getElementById('cat4')?.value || 'Measurement',   items: getLines('items4')},
      {title: document.getElementById('cat5')?.value || 'Mother Nature', items: getLines('items5')},
      {title: document.getElementById('cat6')?.value || 'Machine',       items: getLines('items6')},
    ];

    const fractions = [0.15,0.30,0.45,0.60,0.75,0.90];

    // LEFT-pointing legs
    const legLen = 190; const angle = 135 * Math.PI/180;

    cats.forEach((c,i)=>{
      const isUp = (i%2===0);
      const baseX = xLeft + (xRight - xLeft) * fractions[i];
      const baseY = yCenter;
      const dx = legLen * Math.cos(angle);
      const dy = legLen * Math.sin(angle) * (isUp? -1 : 1);

      line(baseX, baseY, baseX+dx, baseY+dy, {w:2});
      const title = (c.title||'').trim() || ['Man','Method','Material','Measurement','Mother Nature','Machine'][i];
      text(baseX+dx-30, baseY+dy + (isUp? -16: 22), title, {bold:true, size:14});

      const items = c.items; if(!items.length) return;
      const tStart=0.25, tEnd=0.92; const step = (tEnd - tStart) / (items.length + 1);
      items.forEach((s, idx)=>{
        const f = tStart + step*(idx+1);
        const px = baseX + dx*f; const py = baseY + dy*f;
        let nx = -dy, ny = dx; if(!isUp){ nx = dy; ny = -dx; }
        const nlen = Math.hypot(nx, ny) || 1; nx/=nlen; ny/=nlen;
        const subLen = 95; const ex = px + nx*subLen; const ey = py + ny*subLen;
        line(px, py, ex, ey, {w:1.6});
        text(ex + 6, ey + (isUp? -6: 14), s, {size:12});
      });
    });
  }

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
