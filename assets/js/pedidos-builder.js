/**
 * MisajoCookies — pedidos-builder.js  v2
 * Depende de: catalog-data.js (MISAJO_CATALOG), barrios-data.js (BARRIOS_CALI)
 */

// ─── Constantes ───────────────────────────────────────────────────────────────
const WA_NUMBER        = '573159038449';
const SHEETS_ENDPOINT  = ''; // Pegar URL del Google Apps Script Web App aquí
const PRICE_CAJA       = 2000;
const PRICE_DIP_STD    = 2000;
const PRICE_DIP_CHOCO  = 3000;
const PRICE_CAFE_HATSU = 5000;
const PRICE_VELA       = 3000;
const DIP_UPGRADE_SURCHARGE   = 1800;
const FREE_DELIVERY_THRESHOLD = 40000;
const FREE_PACKAGE_THRESHOLD  = 60001;
const BUSINESS_HOUR_START = 13; // 1pm Colombia
const BUSINESS_HOUR_END   = 19; // 7pm Colombia

// Opciones de dip para productos premium
const DIP_OPTIONS = [
  { value: 'arequipe',         label: 'Arequipe',         surcharge: 0 },
  { value: 'chocolate-negro',  label: 'Chocolate Negro',  surcharge: 0 },
  { value: 'chocolate-blanco', label: 'Chocolate Blanco', surcharge: DIP_UPGRADE_SURCHARGE },
];

function getDipLabel(value) {
  return (DIP_OPTIONS.find(d => d.value === value) || { label: value }).label;
}
function getDipSurcharge(value) {
  return (DIP_OPTIONS.find(d => d.value === value) || { surcharge: 0 }).surcharge;
}

// ─── Estado del pedido ────────────────────────────────────────────────────────
const orderState = {
  cookiePackages:  [], // { id, name, qty, unitPrice }
  premiumProducts: [], // { id, name, qty, unitPrice, dipFlavor }
  combos:          [], // { id, name, qty, unitPrice }
  extras: {
    cafeJuanValdez: 0,
    teHatsu:        0,
    vela:           0,
    dipArequipe:    0,
    dipChocoNegro:  0,
    dipChocoBlanco: 0,
    caja:           false,
  },
  freePackageId: null,
  delivery: {
    neighborhood:   '',
    address:        '',
    distanceKm:     null,
    isOutsideCali:  false,
    isToCoordinate: false,
  },
  notes: '',
};

// ─── Formateo moneda ──────────────────────────────────────────────────────────
function formatCOP(amount) {
  return '$' + amount.toLocaleString('es-CO');
}

// ─── Cálculos ─────────────────────────────────────────────────────────────────
function calcSubtotal() {
  let s = 0;
  orderState.cookiePackages.forEach(p  => { s += p.qty * p.unitPrice; });
  orderState.premiumProducts.forEach(p => {
    s += p.qty * p.unitPrice;
    s += p.qty * getDipSurcharge(p.dipFlavor);
  });
  orderState.combos.forEach(c => { s += c.qty * c.unitPrice; });
  s += orderState.extras.cafeJuanValdez * PRICE_CAFE_HATSU;
  s += orderState.extras.teHatsu        * PRICE_CAFE_HATSU;
  s += orderState.extras.vela           * PRICE_VELA;
  s += orderState.extras.dipArequipe    * PRICE_DIP_STD;
  s += orderState.extras.dipChocoNegro  * PRICE_DIP_STD;
  s += orderState.extras.dipChocoBlanco * PRICE_DIP_CHOCO;
  if (orderState.extras.caja) s += PRICE_CAJA;
  return s;
}

function calcDelivery(subtotal) {
  const { distanceKm, isOutsideCali, isToCoordinate } = orderState.delivery;
  if (isToCoordinate)  return { cost: null, label: 'A coordinar', free: false };
  if (distanceKm === 0) return { cost: 0,    label: 'Gratis (Junín)', free: true };
  if (!isOutsideCali && subtotal >= FREE_DELIVERY_THRESHOLD)
    return { cost: 0, label: 'Gratis (compra ≥ $40.000 🎉)', free: true };
  const cost = distanceKm * 1000;
  return { cost, label: formatCOP(cost), free: false };
}

// ─── Ruta de imagen ───────────────────────────────────────────────────────────
function imgSrc(src) {
  // CATALOG_BASE se calcula en catalog-data.js y funciona tanto en file:// como en http://
  return (typeof CATALOG_BASE !== 'undefined' ? CATALOG_BASE : '/') + src;
}

// ─── Imagen miniatura ─────────────────────────────────────────────────────────
function buildImageHTML(images) {
  if (!images || images.length === 0) return '';
  const img = images[0];
  return `<img src="${imgSrc(img.src)}" alt="${img.alt}" width="80" height="80" loading="lazy">`;
}

// ─── Render carrito ───────────────────────────────────────────────────────────
function cartItemRow(id, type, name, qty, lineTotal, subNote) {
  return `
    <div class="cart-item">
      <div class="cart-item__top">
        <span class="cart-item__name">${name}</span>
        <button class="cart-remove" aria-label="Quitar ${name}"
          data-remove-id="${id}" data-remove-type="${type}">×</button>
      </div>
      ${subNote ? `<span class="cart-item__note">${subNote}</span>` : ''}
      <div class="cart-item__bottom">
        <div class="cart-qty" role="group" aria-label="Cantidad">
          <button class="qty-btn qty-btn--sm" data-action="dec" data-id="${id}" data-type="${type}" aria-label="Quitar uno">−</button>
          <span class="qty-display" id="qty-${id}">${qty}</span>
          <button class="qty-btn qty-btn--sm" data-action="inc" data-id="${id}" data-type="${type}" aria-label="Agregar uno">+</button>
        </div>
        <span class="cart-item__total">${formatCOP(lineTotal)}</span>
      </div>
    </div>`;
}

function cartExtraRow(key, name, qty, unitPrice) {
  return `
    <div class="cart-item">
      <div class="cart-item__top">
        <span class="cart-item__name">${name}</span>
        <button class="cart-remove" aria-label="Quitar ${name}"
          data-remove-id="${key}" data-remove-type="extra">×</button>
      </div>
      <div class="cart-item__bottom">
        <div class="cart-qty" role="group" aria-label="Cantidad">
          <button class="qty-btn qty-btn--sm" data-action="dec" data-id="${key}" data-type="extra" aria-label="Quitar uno">−</button>
          <span class="qty-display" id="qty-extra-${key}">${qty}</span>
          <button class="qty-btn qty-btn--sm" data-action="inc" data-id="${key}" data-type="extra" aria-label="Agregar uno">+</button>
        </div>
        <span class="cart-item__total">${formatCOP(qty * unitPrice)}</span>
      </div>
    </div>`;
}

function buildCartHTML() {
  let html  = '';
  let count = 0;

  orderState.cookiePackages.forEach(p => {
    if (p.qty > 0) {
      count++;
      html += cartItemRow(p.id, 'package', p.name, p.qty, p.qty * p.unitPrice);
    }
  });

  orderState.premiumProducts.forEach(p => {
    if (p.qty > 0) {
      count++;
      const surcharge = getDipSurcharge(p.dipFlavor);
      const lineTotal = p.qty * p.unitPrice + p.qty * surcharge;
      const note = `Dip: ${getDipLabel(p.dipFlavor)}${surcharge > 0 ? ` (+${formatCOP(surcharge)}/ud)` : ''}`;
      html += cartItemRow(p.id, 'premium', p.name, p.qty, lineTotal, note);
    }
  });

  orderState.combos.forEach(c => {
    if (c.qty > 0) {
      count++;
      html += cartItemRow(c.id, 'combo', c.name, c.qty, c.qty * c.unitPrice);
    }
  });

  if (orderState.extras.cafeJuanValdez > 0) { count++; html += cartExtraRow('cafeJuanValdez', 'Café Juan Valdez',    orderState.extras.cafeJuanValdez, PRICE_CAFE_HATSU); }
  if (orderState.extras.teHatsu > 0)        { count++; html += cartExtraRow('teHatsu',        'Té Hatsu (250ml)',    orderState.extras.teHatsu,        PRICE_CAFE_HATSU); }
  if (orderState.extras.vela > 0)           { count++; html += cartExtraRow('vela',           'Vela aromática',     orderState.extras.vela,           PRICE_VELA); }
  if (orderState.extras.dipArequipe > 0)    { count++; html += cartExtraRow('dipArequipe',    'Dip Arequipe',       orderState.extras.dipArequipe,    PRICE_DIP_STD); }
  if (orderState.extras.dipChocoNegro > 0)  { count++; html += cartExtraRow('dipChocoNegro',  'Dip Chocolate Negro', orderState.extras.dipChocoNegro,  PRICE_DIP_STD); }
  if (orderState.extras.dipChocoBlanco > 0) { count++; html += cartExtraRow('dipChocoBlanco', 'Dip Choco Blanco',   orderState.extras.dipChocoBlanco, PRICE_DIP_CHOCO); }

  if (orderState.extras.caja) {
    count++;
    html += `
      <div class="cart-item">
        <div class="cart-item__top">
          <span class="cart-item__name">📦 Caja de presentación</span>
          <button class="cart-remove" aria-label="Quitar caja"
            data-remove-id="caja" data-remove-type="extra-bool">×</button>
        </div>
        <div class="cart-item__bottom">
          <span style="font-size:0.75rem;opacity:.7">1 unidad</span>
          <span class="cart-item__total">${formatCOP(PRICE_CAJA)}</span>
        </div>
      </div>`;
  }

  if (orderState.freePackageId) {
    const fp = MISAJO_CATALOG.products.find(p => p.id === orderState.freePackageId);
    if (fp) {
      html += `
        <div class="cart-item cart-item--free">
          <div class="cart-item__top">
            <span class="cart-item__name">🎁 ${fp.name}</span>
            <span class="cart-item__free-badge">GRATIS</span>
          </div>
        </div>`;
    }
  }

  return { html, count };
}

function renderCartItems() {
  const { html, count } = buildCartHTML();

  // Desktop sidebar
  const desktop = document.getElementById('cart-items');
  const emptyDesk = document.getElementById('cart-empty');
  if (desktop) {
    desktop.innerHTML = html;
    if (emptyDesk) emptyDesk.hidden = count > 0;
    attachRemoveListeners(desktop);
  }

  // Mobile inline
  const mobile = document.getElementById('cart-items-mobile');
  const emptyMob = document.getElementById('cart-empty-mobile');
  if (mobile) {
    mobile.innerHTML = html;
    if (emptyMob) emptyMob.hidden = count > 0;
    attachRemoveListeners(mobile);
  }

  // Badge de ítems en barra mobile
  const badge = document.getElementById('cart-count-badge');
  if (badge) {
    badge.textContent = count > 0 ? `${count} ítem${count > 1 ? 's' : ''}` : '';
    badge.hidden = count === 0;
  }

  // Toggle del acordeón mobile
  const toggle = document.getElementById('cart-toggle');
  if (toggle) {
    toggle.querySelector('.cart-toggle-count').textContent =
      count > 0 ? `(${count} ítem${count > 1 ? 's' : ''})` : '(vacío)';
  }
}

function attachRemoveListeners(container) {
  container.querySelectorAll('.cart-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      const id   = btn.dataset.removeId;
      const type = btn.dataset.removeType;
      if (type === 'package') {
        const item = orderState.cookiePackages.find(i => i.id === id);
        if (item) item.qty = 0;
      } else if (type === 'premium') {
        const item = orderState.premiumProducts.find(i => i.id === id);
        if (item) item.qty = 0;
      } else if (type === 'combo') {
        const item = orderState.combos.find(i => i.id === id);
        if (item) item.qty = 0;
      } else if (type === 'extra') {
        orderState.extras[id] = 0;
      } else if (type === 'extra-bool') {
        orderState.extras.caja = false;
        const cajaCheck = document.getElementById('caja-check');
        if (cajaCheck) cajaCheck.checked = false;
      }
      // Sync display on main card (+/- qty shown)
      syncCardDisplay(id, type);
      renderSummary();
    });
  });
}

function syncCardDisplay(id, type) {
  // Update the qty shown in the product card after cart removal
  if (type === 'extra') {
    const el = document.getElementById(`qty-extra-${id}`);
    if (el) el.textContent = '0';
  } else {
    const el = document.getElementById(`qty-${id}`);
    if (el) el.textContent = '0';
  }
}

// ─── Render resumen (sidebar + mobile bar) ────────────────────────────────────
function renderSummary() {
  const subtotal = calcSubtotal();
  const delivery = calcDelivery(subtotal);
  const total    = subtotal + (delivery.cost ?? 0);

  // Galleta gratis
  const freeEligible = subtotal >= FREE_PACKAGE_THRESHOLD;
  const freeSection  = document.getElementById('free-package-section');
  if (freeSection) {
    freeSection.hidden = !freeEligible;
    if (!freeEligible && orderState.freePackageId) {
      orderState.freePackageId = null;
      freeSection.querySelectorAll('input[type=radio]').forEach(r => r.checked = false);
    }
  }

  updateProgressBar(subtotal);
  renderCartItems();

  // Subtotal
  ['sum-subtotal'].forEach(id => setText(id, formatCOP(subtotal)));

  // Domicilio
  const deliveryText = delivery.cost === null ? 'A coordinar' : formatCOP(delivery.cost);
  setText('sum-delivery', deliveryText);
  setText('sum-delivery-note', delivery.label);

  // Total
  const totalText = delivery.cost === null
    ? `${formatCOP(subtotal)} + domicilio`
    : formatCOP(total);
  setText('sum-total', totalText);

  // Mobile bottom bar
  setText('sum-subtotal-mob', formatCOP(subtotal));
  setText('sum-delivery-mob', deliveryText);
  setText('sum-total-mob', totalText);

  // Aviso fuera de Cali
  ['out-of-cali-note', 'out-of-cali-note-sidebar'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.hidden = !orderState.delivery.isOutsideCali;
  });
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function updateProgressBar(subtotal) {
  const bar40 = document.getElementById('progress-40k');
  const bar60 = document.getElementById('progress-60k');
  const msg   = document.getElementById('progress-msg');
  if (!bar40 || !bar60 || !msg) return;

  bar40.style.width = Math.min(100, (subtotal / FREE_DELIVERY_THRESHOLD) * 100) + '%';
  bar60.style.width = Math.min(100, (subtotal / FREE_PACKAGE_THRESHOLD)  * 100) + '%';

  if (subtotal >= FREE_PACKAGE_THRESHOLD) {
    msg.textContent = '¡Tienes paquete gratis y domicilio gratis en Cali!';
    msg.className = 'progress-msg achieved';
  } else if (subtotal >= FREE_DELIVERY_THRESHOLD) {
    msg.textContent = `Te faltan ${formatCOP(FREE_PACKAGE_THRESHOLD - subtotal)} para paquete gratis`;
    msg.className = 'progress-msg mid';
  } else {
    msg.textContent = `Te faltan ${formatCOP(FREE_DELIVERY_THRESHOLD - subtotal)} para domicilio gratis`;
    msg.className = 'progress-msg';
  }
}

// ─── Actualizar cantidades ────────────────────────────────────────────────────
function setQty(arr, id, delta) {
  const item = arr.find(i => i.id === id);
  if (!item) return;
  item.qty = Math.max(0, item.qty + delta);
  const el = document.getElementById(`qty-${id}`);
  if (el) el.textContent = item.qty;
  renderSummary();
}

function setExtra(key, delta) {
  orderState.extras[key] = Math.max(0, orderState.extras[key] + delta);
  const el = document.getElementById(`qty-extra-${key}`);
  if (el) el.textContent = orderState.extras[key];
  renderSummary();
}

// ─── Construir tarjetas ───────────────────────────────────────────────────────
function buildPackageCards() {
  const container = document.getElementById('packages-grid');
  if (!container) return;

  const PACKAGE_IDS = ['galletas-mantequilla','galletas-topping','alfajores','alfajores-corazon','galletas-bigote'];
  MISAJO_CATALOG.products.filter(p => PACKAGE_IDS.includes(p.id)).forEach(p => {
    orderState.cookiePackages.push({ id: p.id, name: p.name, qty: 0, unitPrice: 4000 });
    const card = document.createElement('div');
    card.className = 'pedido-card';
    card.innerHTML = `
      ${buildImageHTML(p.images)}
      <div class="pedido-card__body">
        <h3 class="pedido-card__name">${p.name}</h3>
        <p class="pedido-card__price">${p.price} <small>/ paquete</small></p>
      </div>
      <div class="qty-control" role="group" aria-label="Cantidad ${p.name}">
        <button class="qty-btn" aria-label="Quitar" data-action="dec" data-id="${p.id}" data-type="package">−</button>
        <span class="qty-display" id="qty-${p.id}">0</span>
        <button class="qty-btn" aria-label="Agregar" data-action="inc" data-id="${p.id}" data-type="package">+</button>
      </div>`;
    container.appendChild(card);
  });
}

function buildPremiumCards() {
  const container = document.getElementById('premium-grid');
  if (!container) return;

  const PREMIUM_IDS = ['cookie-dip-premium','cookie-shaker-supreme'];
  MISAJO_CATALOG.products.filter(p => PREMIUM_IDS.includes(p.id)).forEach(p => {
    const unitPrice = parseInt(p.price.replace(/\D/g,''));
    orderState.premiumProducts.push({ id: p.id, name: p.name, qty: 0, unitPrice, dipFlavor: 'arequipe' });

    const dipOptions = DIP_OPTIONS.map(d =>
      `<option value="${d.value}">${d.label}${d.surcharge > 0 ? ` (+${formatCOP(d.surcharge)}/ud)` : ' (incluido)'}</option>`
    ).join('');

    const card = document.createElement('div');
    card.className = 'pedido-card pedido-card--premium';
    card.innerHTML = `
      ${buildImageHTML(p.images)}
      <div class="pedido-card__body">
        <h3 class="pedido-card__name">${p.name}</h3>
        <p class="pedido-card__price">${p.price} <small>· incluye dip</small></p>
        <label class="dip-selector-label" for="dip-${p.id}">Dip:</label>
        <select class="dip-selector" id="dip-${p.id}" data-id="${p.id}" aria-label="Sabor del dip incluido">
          ${dipOptions}
        </select>
      </div>
      <div class="qty-control" role="group" aria-label="Cantidad ${p.name}">
        <button class="qty-btn" aria-label="Quitar" data-action="dec" data-id="${p.id}" data-type="premium">−</button>
        <span class="qty-display" id="qty-${p.id}">0</span>
        <button class="qty-btn" aria-label="Agregar" data-action="inc" data-id="${p.id}" data-type="premium">+</button>
      </div>`;
    container.appendChild(card);

    card.querySelector(`#dip-${p.id}`).addEventListener('change', e => {
      const item = orderState.premiumProducts.find(i => i.id === p.id);
      if (item) item.dipFlavor = e.target.value;
      renderSummary();
    });
  });
}

function buildComboCards() {
  const container = document.getElementById('combos-grid');
  if (!container) return;

  MISAJO_CATALOG.combos.forEach(c => {
    const unitPrice = parseInt(c.price.replace(/\D/g,''));
    orderState.combos.push({ id: c.id, name: c.name, qty: 0, unitPrice });
    const card = document.createElement('div');
    card.className = 'pedido-card pedido-card--combo';
    card.innerHTML = `
      ${buildImageHTML(c.images)}
      <div class="pedido-card__body">
        <h3 class="pedido-card__name">${c.name}</h3>
        <p class="pedido-card__price">${c.price}</p>
      </div>
      <div class="qty-control" role="group" aria-label="Cantidad ${c.name}">
        <button class="qty-btn" aria-label="Quitar" data-action="dec" data-id="${c.id}" data-type="combo">−</button>
        <span class="qty-display" id="qty-${c.id}">0</span>
        <button class="qty-btn" aria-label="Agregar" data-action="inc" data-id="${c.id}" data-type="combo">+</button>
      </div>`;
    container.appendChild(card);
  });
}

function buildFreePackageOptions() {
  const container = document.getElementById('free-package-options');
  if (!container) return;

  const PACKAGE_IDS = ['galletas-mantequilla','galletas-topping','alfajores','alfajores-corazon','galletas-bigote'];
  MISAJO_CATALOG.products.filter(p => PACKAGE_IDS.includes(p.id)).forEach(p => {
    const label = document.createElement('label');
    label.className = 'free-option';
    label.innerHTML = `<input type="radio" name="free-package" value="${p.id}"><span>${p.name}</span>`;
    label.querySelector('input').addEventListener('change', () => {
      orderState.freePackageId = p.id;
      renderSummary();
    });
    container.appendChild(label);
  });
}

function buildBarrioSelect() {
  const select = document.getElementById('barrio-select');
  if (!select) return;

  BARRIOS_CALI.forEach(b => {
    const opt = document.createElement('option');
    opt.value = b.distanceKm;
    opt.dataset.name = b.name;
    opt.textContent = b.distanceKm > 0
      ? `${b.name} (~${b.distanceKm}km · ${formatCOP(b.distanceKm * 1000)})`
      : b.distanceKm === 0 ? `${b.name} (gratis)` : b.name;
    select.appendChild(opt);
  });

  select.addEventListener('change', () => {
    const km   = parseFloat(select.value);
    const name = select.options[select.selectedIndex].dataset.name;
    orderState.delivery.neighborhood   = name;
    orderState.delivery.distanceKm     = km;
    orderState.delivery.isOutsideCali  = km === -2;
    orderState.delivery.isToCoordinate = km < 0;
    renderSummary();
  });
}

// ─── Horario de atención ──────────────────────────────────────────────────────
function checkBusinessHours() {
  const banner = document.getElementById('hours-banner');
  if (!banner) return;
  const now = new Date();
  const col = new Date(now.getTime() + now.getTimezoneOffset() * 60000 + (-5 * 3600000));
  if (col.getHours() < BUSINESS_HOUR_START || col.getHours() >= BUSINESS_HOUR_END)
    banner.hidden = false;
}

// ─── Delegación de clicks (+/−) ───────────────────────────────────────────────
function attachQtyListeners() {
  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const { action, id, type } = btn.dataset;
    const delta = action === 'inc' ? 1 : -1;
    if      (type === 'package') setQty(orderState.cookiePackages,  id, delta);
    else if (type === 'premium') setQty(orderState.premiumProducts, id, delta);
    else if (type === 'combo')   setQty(orderState.combos,          id, delta);
    else if (type === 'extra')   setExtra(id, delta);
  });

  document.getElementById('caja-check')?.addEventListener('change', e => {
    orderState.extras.caja = e.target.checked;
    renderSummary();
  });
}

// ─── Acordeón carrito mobile ──────────────────────────────────────────────────
function initMobileCartToggle() {
  const toggle  = document.getElementById('cart-toggle');
  const content = document.getElementById('cart-mobile-content');
  if (!toggle || !content) return;

  toggle.addEventListener('click', () => {
    const open = content.hidden === false;
    content.hidden = open;
    toggle.querySelector('.cart-toggle-arrow').textContent = open ? '▼' : '▲';
  });
}

// ─── Validación ───────────────────────────────────────────────────────────────
function validate() {
  const subtotal = calcSubtotal();
  if (subtotal === 0) { showError('Agrega al menos 1 producto para continuar.'); return false; }

  const barrio = document.getElementById('barrio-select')?.value;
  if (!barrio) { showError('Selecciona tu barrio o zona de entrega.'); return false; }

  const address = document.getElementById('address-input')?.value.trim();
  if (!address) { showError('Por favor ingresa tu dirección de entrega.'); return false; }

  orderState.delivery.address = address;
  orderState.notes = document.getElementById('notes-input')?.value.trim() || '';

  if (subtotal >= FREE_PACKAGE_THRESHOLD && !orderState.freePackageId) {
    showError('Elige tu paquete de galletas gratis antes de continuar.');
    document.getElementById('free-package-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return false;
  }
  return true;
}

function showError(msg) {
  const el = document.getElementById('form-error');
  if (!el) { alert(msg); return; }
  el.textContent = msg;
  el.hidden = false;
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  setTimeout(() => { el.hidden = true; }, 5000);
}

// ─── Mensaje WhatsApp ─────────────────────────────────────────────────────────
function buildWAMessage() {
  const subtotal = calcSubtotal();
  const delivery = calcDelivery(subtotal);
  const total    = subtotal + (delivery.cost ?? 0);

  const now  = new Date();
  const col  = new Date(now.getTime() + now.getTimezoneOffset() * 60000 + (-5 * 3600000));
  const dias  = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
  const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const h = col.getHours(), m = String(col.getMinutes()).padStart(2,'0');
  const fechaStr = `${dias[col.getDay()]} ${col.getDate()} de ${meses[col.getMonth()]} · ${h % 12 || 12}:${m} ${h >= 12 ? 'pm' : 'am'}`;

  const lines = ['🍪 *NUEVO PEDIDO — Haz Tu Pedido*', `📅 ${fechaStr}`, ''];

  const pkgs = orderState.cookiePackages.filter(p => p.qty > 0);
  if (pkgs.length) {
    lines.push('📦 *Galletas:*');
    pkgs.forEach(p => lines.push(`• ${p.qty}x ${p.name} — ${formatCOP(p.qty * p.unitPrice)}`));
    lines.push('');
  }

  const prems = orderState.premiumProducts.filter(p => p.qty > 0);
  if (prems.length) {
    lines.push('⭐ *Productos Premium:*');
    prems.forEach(p => {
      const surcharge = getDipSurcharge(p.dipFlavor);
      const lineTotal = p.qty * p.unitPrice + p.qty * surcharge;
      lines.push(`• ${p.qty}x ${p.name} — ${formatCOP(lineTotal)}`);
      lines.push(`  ↳ Dip: ${getDipLabel(p.dipFlavor)}${surcharge > 0 ? ` (+${formatCOP(surcharge)}/ud)` : ''}`);
    });
    lines.push('');
  }

  const combos = orderState.combos.filter(c => c.qty > 0);
  if (combos.length) {
    lines.push('🎁 *Combos:*');
    combos.forEach(c => lines.push(`• ${c.qty}x ${c.name} — ${formatCOP(c.qty * c.unitPrice)}`));
    lines.push('');
  }

  const extras = [];
  if (orderState.extras.cafeJuanValdez > 0) extras.push(`• ${orderState.extras.cafeJuanValdez}x Café Juan Valdez — ${formatCOP(orderState.extras.cafeJuanValdez * PRICE_CAFE_HATSU)}`);
  if (orderState.extras.teHatsu > 0)        extras.push(`• ${orderState.extras.teHatsu}x Té Hatsu (250ml) — ${formatCOP(orderState.extras.teHatsu * PRICE_CAFE_HATSU)}`);
  if (orderState.extras.vela > 0)           extras.push(`• ${orderState.extras.vela}x Vela aromática — ${formatCOP(orderState.extras.vela * PRICE_VELA)}`);
  if (orderState.extras.dipArequipe > 0)    extras.push(`• ${orderState.extras.dipArequipe}x Dip Arequipe — ${formatCOP(orderState.extras.dipArequipe * PRICE_DIP_STD)}`);
  if (orderState.extras.dipChocoNegro > 0)  extras.push(`• ${orderState.extras.dipChocoNegro}x Dip Chocolate Negro — ${formatCOP(orderState.extras.dipChocoNegro * PRICE_DIP_STD)}`);
  if (orderState.extras.dipChocoBlanco > 0) extras.push(`• ${orderState.extras.dipChocoBlanco}x Dip Choco Blanco — ${formatCOP(orderState.extras.dipChocoBlanco * PRICE_DIP_CHOCO)}`);
  if (orderState.extras.caja)                extras.push(`• Caja de presentación — ${formatCOP(PRICE_CAJA)}`);
  if (extras.length) { lines.push('🧩 *Extras:*'); extras.forEach(l => lines.push(l)); lines.push(''); }

  if (orderState.freePackageId) {
    const fp = MISAJO_CATALOG.products.find(p => p.id === orderState.freePackageId);
    lines.push('🎁 *Paquete gratis (compra > $60.000):*');
    lines.push(`• ${fp ? fp.name : orderState.freePackageId}`);
    lines.push('');
  }

  lines.push('📍 *Entrega:*');
  const km = orderState.delivery.distanceKm;
  lines.push(`Barrio: ${orderState.delivery.neighborhood}${km > 0 ? ` (~${km}km)` : ''}`);
  lines.push(`Dirección: ${orderState.delivery.address}`);
  lines.push('');

  if (orderState.notes) {
    lines.push('📝 *Notas del cliente:*');
    lines.push(orderState.notes);
    lines.push('');
  }

  lines.push('💰 *Resumen:*');
  lines.push(`Subtotal:    ${formatCOP(subtotal)}`);
  lines.push(`Domicilio:   ${delivery.cost === null ? 'A coordinar' : delivery.label}`);
  lines.push('━━━━━━━━━━━━━━━');
  lines.push(`TOTAL:       ${delivery.cost === null ? `${formatCOP(subtotal)} + domicilio` : formatCOP(total)}`);
  lines.push('');
  lines.push('🕐 Atención: todos los días 1pm – 7pm');

  return lines.join('\n');
}

// ─── Google Sheets (fire-and-forget) ─────────────────────────────────────────
function postToSheets(subtotal, delivery) {
  if (!SHEETS_ENDPOINT) return;
  const payload = {
    timestamp: new Date().toISOString(),
    items: [
      ...orderState.cookiePackages.filter(p => p.qty > 0).map(p =>
        ({ type: 'package', name: p.name, qty: p.qty, unitPrice: p.unitPrice, total: p.qty * p.unitPrice })),
      ...orderState.premiumProducts.filter(p => p.qty > 0).map(p => {
        const s = getDipSurcharge(p.dipFlavor);
        return { type: 'premium', name: p.name, qty: p.qty, unitPrice: p.unitPrice, dipFlavor: p.dipFlavor, upgradePrice: s, total: p.qty * p.unitPrice + p.qty * s };
      }),
      ...orderState.combos.filter(c => c.qty > 0).map(c =>
        ({ type: 'combo', name: c.name, qty: c.qty, unitPrice: c.unitPrice, total: c.qty * c.unitPrice })),
      ...(orderState.extras.cafeJuanValdez > 0 ? [{ type:'extra', name:'Café Juan Valdez',   qty: orderState.extras.cafeJuanValdez, unitPrice: PRICE_CAFE_HATSU, total: orderState.extras.cafeJuanValdez * PRICE_CAFE_HATSU }] : []),
      ...(orderState.extras.teHatsu > 0        ? [{ type:'extra', name:'Té Hatsu (250ml)',   qty: orderState.extras.teHatsu,        unitPrice: PRICE_CAFE_HATSU, total: orderState.extras.teHatsu        * PRICE_CAFE_HATSU }] : []),
      ...(orderState.extras.vela > 0           ? [{ type:'extra', name:'Vela aromática',     qty: orderState.extras.vela,           unitPrice: PRICE_VELA,       total: orderState.extras.vela           * PRICE_VELA }] : []),
      ...(orderState.extras.dipArequipe > 0    ? [{ type:'extra', name:'Dip Arequipe',       qty: orderState.extras.dipArequipe,    unitPrice: PRICE_DIP_STD,    total: orderState.extras.dipArequipe    * PRICE_DIP_STD }] : []),
      ...(orderState.extras.dipChocoNegro > 0  ? [{ type:'extra', name:'Dip Chocolate Negro',qty: orderState.extras.dipChocoNegro,  unitPrice: PRICE_DIP_STD,    total: orderState.extras.dipChocoNegro  * PRICE_DIP_STD }] : []),
      ...(orderState.extras.dipChocoBlanco > 0 ? [{ type:'extra', name:'Dip Choco Blanco',   qty: orderState.extras.dipChocoBlanco, unitPrice: PRICE_DIP_CHOCO,  total: orderState.extras.dipChocoBlanco * PRICE_DIP_CHOCO }] : []),
      ...(orderState.extras.caja              ? [{ type:'extra', name:'Caja',          qty: 1,                               unitPrice: PRICE_CAJA,       total: PRICE_CAJA }] : []),
    ],
    freePackage:  orderState.freePackageId,
    subtotal,
    deliveryCost: delivery.cost,
    total:        subtotal + (delivery.cost ?? 0),
    delivery: {
      neighborhood: orderState.delivery.neighborhood,
      address:      orderState.delivery.address,
      distanceKm:   orderState.delivery.distanceKm,
      isOutsideCali:orderState.delivery.isOutsideCali,
    },
    notes: orderState.notes,
  };
  fetch(SHEETS_ENDPOINT, {
    method: 'POST', mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch(() => {});
}

// ─── Enviar pedido ────────────────────────────────────────────────────────────
function submitOrder() {
  if (!validate()) return;
  const btn = document.getElementById('submit-btn');
  if (btn) { btn.disabled = true; setTimeout(() => { btn.disabled = false; }, 3000); }
  const subtotal = calcSubtotal();
  const delivery = calcDelivery(subtotal);
  postToSheets(subtotal, delivery);
  window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(buildWAMessage())}`, '_blank');
}

// ─── WA In-App Browser ────────────────────────────────────────────────────────
function detectWABrowser() {
  if ((navigator.userAgent || '').includes('WhatsApp')) {
    const warn = document.getElementById('wa-browser-warning');
    if (warn) warn.hidden = false;
  }
}

// ─── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  buildPackageCards();
  buildPremiumCards();
  buildComboCards();
  buildFreePackageOptions();
  buildBarrioSelect();
  attachQtyListeners();
  initMobileCartToggle();
  checkBusinessHours();
  detectWABrowser();
  renderSummary();

  document.getElementById('submit-btn')?.addEventListener('click', submitOrder);
});
