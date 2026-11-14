/* GeoCartera · mapa simulado (SVG) con rutas, geocercas y rastreo */
(function (GC) {
  const U = GC.U;
  const M = (GC.Map = {});
  const COL = { pagado: '#16a34a', nopago: '#dc2626', pendiente: '#f59e0b', espera: '#2563eb', inactivo: '#94a3b8' };
  let BG = null;

  function bg() {
    if (BG) return BG;
    let s = '<rect width="1000" height="600" fill="#f8fafc"/>', i = 0;
    for (let y = 0; y < 600; y += 60) for (let x = 0; x < 1000; x += 72) {
      i++;
      const park = (i * 7) % 23 === 0;
      s += `<rect x="${x + 5}" y="${y + 5}" width="62" height="50" rx="5" fill="${park ? '#d9f2dd' : '#e8edf2'}"/>`;
    }
    s += '<path d="M-10 470 C 180 420, 300 520, 480 455 S 760 380, 1010 430" fill="none" stroke="#cfe3fb" stroke-width="26" stroke-linecap="round"/>';
    s += '<path d="M0 300 H1000" stroke="#fde68a" stroke-width="9"/><path d="M500 0 V600" stroke="#fde68a" stroke-width="9"/><path d="M0 30 L1000 590" stroke="#fef3c7" stroke-width="7"/>';
    s += '<text class="zone-lbl" x="150" y="34">ZONA NORTE</text><text class="zone-lbl" x="560" y="200">ZONA CENTRO</text><text class="zone-lbl" x="800" y="370">ZONA SUR</text>';
    BG = s;
    return s;
  }

  function pin(it) {
    const { cl, estado, atraso } = it;
    const c = COL[estado] || COL.pendiente;
    return `<g class="pin" data-action="open-cliente" data-id="${cl.id}" transform="translate(${cl.x} ${cl.y})"><title>${U.esc(cl.nombre)}</title>${atraso > 7 ? '<circle r="20" fill="none" stroke="#dc2626" stroke-width="3" stroke-dasharray="4 3"/>' : ''}<circle r="14" fill="${c}" stroke="#fff" stroke-width="3.5"/><text y="5" text-anchor="middle">${cl.orden}</text></g>`;
  }

  M.svg = function ({ items = [], cobradores = [], route = null, trails = [] }) {
    const pts = arr => arr.map(p => `${p.x},${p.y}`).join(' ');
    return `<svg class="map" viewBox="0 0 1000 600" role="img" aria-label="Mapa de clientes y rutas">${bg()}
      ${route ? `<polyline class="route-line" points="${pts([route.cob.base].concat(route.list))}" stroke="${route.cob.color}"/><rect x="${route.cob.base.x - 9}" y="${route.cob.base.y - 9}" width="18" height="18" rx="4" fill="#0f172a"/><text class="base-lbl" x="${route.cob.base.x}" y="${route.cob.base.y - 15}" text-anchor="middle">Base</text>` : ''}
      ${trails.filter(t => t.pts.length > 1).map(t => `<polyline class="trail" points="${pts(t.pts)}" stroke="${t.color}"/>`).join('')}
      ${items.map(pin).join('')}
      ${cobradores.map(c => `<g class="cob-marker" transform="translate(${c.pos.x} ${c.pos.y})"><circle class="pulse" r="24" fill="${c.color}"/><circle r="10" fill="${c.color}" stroke="#fff" stroke-width="4"/><text class="cob-label" y="-20" text-anchor="middle">${U.esc(c.nombre.split(' ')[0])}</text></g>`).join('')}
    </svg>`;
  };

  M.legend = () => `<div class="legend-row">
    <span><i style="background:${COL.pagado}"></i>Pagó</span><span><i style="background:${COL.pendiente}"></i>Pendiente</span>
    <span><i style="background:${COL.nopago}"></i>No pagó</span><span><i style="background:${COL.espera}"></i>Esperando llave</span>
    <span><i class="ring"></i>Atraso &gt; 7 días</span><span><i class="dot-cob"></i>Cobrador (GPS)</span></div>`;
})(window.GC);

