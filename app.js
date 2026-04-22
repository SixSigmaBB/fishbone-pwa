// Debug logs
console.log('[Fishbone PWA] app.js loaded (v6e)');

document.addEventListener('DOMContentLoaded', () => {
  console.log('[Fishbone PWA] DOM ready');

  /* =========================
     Service Worker
     ========================= */
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./service-worker.js')
        .catch(e => console.error('SW reg failed', e));
    });
  }

  /* =========================
     DOM references
     ========================= */
  const svg = document.getElementById('fishbone');
  const generateBtn = document.getElementById('generateBtn');
  const clearBtn = document.getElementById('clearBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const saveBtn = document.getElementById('saveBtn');
  const loadBtn = document.getElementById('loadBtn');
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* =========================
     Helpers
     ========================= */
  function getLines(id){
    const el = document.getElementById(id);
    if(!el) return [];
    return el.value.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  }

  function clearSVG(){
    while(svg.firstChild) svg.removeChild(svg.firstChild);
  }

  function line(x1,y1,x2,y2, opts={}){
    const el = document.createElementNS('http://www.w3.org/2000/svg','line');
    el.setAttribute('x1',x1); el.setAttribute('y1',y1);
    el.setAttribute('x2',x2); el.setAttribute('y2',y2);
    el.setAttribute('stroke', opts.stroke || '#0f172a');
    el.setAttribute('stroke-width', opts.w || 2);
    if(opts.markerEnd) el.setAttribute('marker-end', opts.markerEnd);
    svg.appendChild(el);
    return el;
  }

  function text(x,y,str, opts={}){
    const t = document.createElementNS('http://www.w3.org/2000/svg','text');
    t.setAttribute('x',x); t.setAttribute('y',y);
    t.setAttribute('fill', opts.fill || '#111');
    t.setAttribute('font-size', opts.size || 12);
    t.setAttribute('font-weight', opts.bold ? '700' : '400');
    t.setAttribute('font-family','system-ui, Arial, sans-serif');
    t.textContent = str;
    svg.appendChild(t);
    return t;
  }

  function wrapLines(str, maxChars){
    const words = (str||'').split(/\s+/).filter(Boolean);
    const lines = []; let cur='';
    words.forEach(w=>{
      const t = cur ? cur+' '+w : w;
      if(t.length > maxChars){ if(cur) lines.push(cur); cur=w; }
      else cur = t;
    });
    if(cur) lines.push(cur);
    return lines;
  }

  /* =========================
     Save / Load
     ========================= */
  function collectState(){
    return {
      symptom: document.getElementById('symptom')?.value || '',
      categories: [1,2,3,4,5,6].map(i => ({
        title: document.getElementById(`cat${i}`).value,
        items: document.getElementById(`items${i}`).value
      }))
    };
  }

  function restoreState(state){
    if(!state) return;
    document.getElementById('symptom').value = state.symptom || '';
    state.categories.forEach((c,i)=>{
      document.getElementById(`cat${i+1}`).value = c.title;
      document.getElementById(`items${i+1}`).value = c.items;
    });
  }

  saveBtn?.addEventListener('click', ()=>{
    localStorage.setItem('fishboneState', JSON.stringify(collectState()));
    alert('Fishbone saved.');
  });

  loadBtn?.addEventListener('click', ()=>{
    const raw = localStorage.getItem('fishboneState');
    if(!raw){ alert('No saved fishbone found.'); return; }
    restoreState(JSON.parse(raw));
    draw();
  });

  /* =========================
     Draw Fishbone
     ========================= */
  function draw(){
    clearSVG();

    const W = 1200, H = 700;
    const yCenter = H/2;

    // Shift diagram to the right
    const marginLeft = 120;
    const rightMargin = 40;
    const gap = 14;

    /* --- Symptom box --- */
    const symptomText = document.getElementById('symptom').value.trim();
    const symptomLines = wrapLines(symptomText, 30);
    const boxW = 260, pad=8, lineH=16;
    const boxH = pad*2 + lineH*Math.max(symptomLines.length,1);
    const boxX = W - rightMargin - boxW;
    const boxY = yCenter - boxH/2;

    const xLeft = marginLeft;
    const xRight = boxX - gap;

    /* --- Markers --- */
    const defs = document.createElementNS('http://www.w3.org/2000/svg','defs');

    // Spine arrow
    const arrow = document.createElementNS('http://www.w3.org/2000/svg','marker');
    arrow.setAttribute('id','arrow');
    arrow.setAttribute('viewBox','0 0 10 10');
    arrow.setAttribute('refX','8');
    arrow.setAttribute('refY','5');
    arrow.setAttribute('markerWidth','8');
    arrow.setAttribute('markerHeight','8');
    arrow.setAttribute('orient','auto');
    const ap = document.createElementNS('http://www.w3.org/2000/svg','path');
    ap.setAttribute('d','M 0 0 L 10 5 L 0 10 z');
    ap.setAttribute('fill','#0f172a');
    arrow.appendChild(ap);
    defs.appendChild(arrow);

    // Sub-branch arrow
    const subArrow = document.createElementNS('http://www.w3.org/2000/svg','marker');
    subArrow.setAttribute('id','subArrow');
    subArrow.setAttribute('viewBox','0 0 10 10');
    subArrow.setAttribute('refX','8');
    subArrow.setAttribute('refY','5');
    subArrow.setAttribute('markerWidth','6');
    subArrow.setAttribute('markerHeight','6');
    subArrow.setAttribute('orient','auto');
    const sap = document.createElementNS('http://www.w3.org/2000/svg','path');
    sap.setAttribute('d','M 0 0 L 10 5 L 0 10 z');
    sap.setAttribute('fill','#0f172a');
    subArrow.appendChild(sap);
    defs.appendChild(subArrow);

    svg.appendChild(defs);

    /* --- Spine --- */
    line(xLeft,yCenter,xRight,yCenter,{w:3,markerEnd:'url(#arrow)'});

    /* --- Symptom box --- */
    if(symptomText){
      const r = document.createElementNS('http://www.w3.org/2000/svg','rect');
      r.setAttribute('x',boxX); r.setAttribute('y',boxY);
      r.setAttribute('width',boxW); r.setAttribute('height',boxH);
      r.setAttribute('rx',8); r.setAttribute('ry',8);
      r.setAttribute('fill','#fff'); r.setAttribute('stroke','#0f172a');
      svg.appendChild(r);

      text(boxX, boxY-6, 'Symptom', {bold:true});
      symptomLines.forEach((ln,i)=>{
        text(boxX+pad, boxY+pad+lineH*(i+0.9), ln);
      });
      line(xRight,yCenter,boxX,boxY+boxH/2,{w:1.2});
    }

    /* --- 6M legs --- */
    const cats = [1,2,3,4,5,6].map(i=>({
      title: document.getElementById(`cat${i}`).value,
      items: getLines(`items${i}`)
    }));

    const fractions = [0.15,0.30,0.45,0.60,0.75,0.90];
    const legLen = 250;
    const subLen = 48;
    const angle = 135*Math.PI/180;

    cats.forEach((c,i)=>{
      const isUp = i%2===0;
      const bx = xLeft + (xRight-xLeft)*fractions[i];
      const by = yCenter;
      const dx = legLen*Math.cos(angle);
      const dy = legLen*Math.sin(angle)*(isUp?-1:1);

      line(bx,by,bx+dx,by+dy,{w:2});
      text(bx+dx-20, by+dy+(isUp?-16:22), c.title, {bold:true});

      c.items.forEach((s,idx)=>{
        const f = (idx+1)/(c.items.length+1);
        const px = bx+dx*f;
        const py = by+dy*f;

        let nx=-dy, ny=dx;
        if(!isUp){ nx=dy; ny=-dx; }
        const nlen=Math.hypot(nx,ny); nx/=nlen; ny/=nlen;

        const ex = px+nx*subLen;
        const ey = py+ny*subLen;

        line(px,py,ex,ey,{w:1.6,markerEnd:'url(#subArrow)'});
        text(ex+6,ey+(isUp?-6:14),s);
      });
    });
  }

  generateBtn?.addEventListener('click', draw);
  clearBtn?.addEventListener('click', clearSVG);

  /* Auto‑load saved fishbone */
  const saved = localStorage.getItem('fishboneState');
  if(saved){ restoreState(JSON.parse(saved)); draw(); }
});
``
