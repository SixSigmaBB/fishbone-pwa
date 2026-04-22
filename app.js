// Debug logs
console.log('[Fishbone PWA] app.js loaded (v7)');

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
     Helper functions
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
    el.setAttribute('x1',x1);
    el.setAttribute('y1',y1);
    el.setAttribute('x2',x2);
    el.setAttribute('y2',y2);
    el.setAttribute('stroke', opts.stroke || '#0f172a');
    el.setAttribute('stroke-width', opts.w || 2);
    if(opts.markerEnd) el.setAttribute('marker-end', opts.markerEnd);
    svg.appendChild(el);
    return el;
  }

  function text(x,y,str, opts={}){
    const t = document.createElementNS('http://www.w3.org/2000/svg','text');
    t.setAttribute('x',x);
    t.setAttribute('y',y);
    t.setAttribute('fill', opts.fill || '#111');
    t.setAttribute('font-size', opts.size || 11);
    t.setAttribute('font-weight', opts.bold ? '700' : '400');
    t.setAttribute('font-family','system-ui, Arial, sans-serif');
    t.textContent = str;
    svg.appendChild(t);
    return t;
  }

  function wrapLines(str, maxChars){
    const words = (str||'').split(/\s+/).filter(Boolean);
    const lines = [];
    let cur = '';
    words.forEach(w => {
      const test = cur ? cur + ' ' + w : w;
      if (test.length > maxChars) {
        if (cur) lines.push(cur);
        cur = w;
      } else {
        cur = test;
      }
    });
    if (cur) lines.push(cur);
    return lines;
  }

  /* =========================
     Save / Load logic
     ========================= */
  function collectState(){
    return {
      symptom: document.getElementById('symptom').value,
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

  saveBtn?.addEventListener('click', () => {
    localStorage.setItem('fishboneState', JSON.stringify(collectState()));
    alert('Fishbone saved.');
  });

  loadBtn?.addEventListener('click', () => {
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

    const W = 1200;
    const H = 700;
    const yCenter = H / 2;

    // Shift whole diagram right so labels are always visible
    const marginLeft = 120;
    const rightMargin = 40;
    const gap = 14;

    /* ---------- Symptom box ---------- */
    const symptomText = document.getElementById('symptom').value.trim();
    const symptomLines = wrapLines(symptomText, 30); // hard wrap at ~30 chars
    const pad = 8;
    const lineH = 16;
    const boxW = 260;
    const boxH = pad*2 + lineH*Math.max(symptomLines.length,1);

    const boxX = W - rightMargin - boxW;
    const boxY = yCenter - boxH / 2;

    const xLeft = marginLeft;
    const xRight = boxX - gap;


