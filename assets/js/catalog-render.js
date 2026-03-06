/**
 * MisajoCookies — Renderizador de catálogo.
 *
 * Lee los datos de catalog-data.js y genera las tarjetas HTML de productos y combos.
 * Los sliders son inicializados por main.js (ImageSlider), que se carga después.
 *
 * Uso en HTML:
 *   <div class="products-grid"
 *        data-catalog="products|combos"
 *        data-action="order|detail"   (default: order)
 *        data-heading="h2|h3"         (default: h3)
 *        data-limit="3"               (opcional: limitar cantidad)
 *        data-ids="id1,id2,id3">      (opcional: IDs específicos en orden)
 *   </div>
 */
(function () {

  var BASE = (typeof CATALOG_BASE !== 'undefined') ? CATALOG_BASE : '/';
  var WA_BASE = 'https://wa.me/573159038449?text=';
  var SVG_PREV = '<svg viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg>';
  var SVG_NEXT = '<svg viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg>';

  function buildSlider(images) {
    var slides = images.map(function (img, i) {
      return '<div class="slide' + (i === 0 ? ' active' : '') + '">' +
        '<img class="slide-image" src="' + BASE + img.src + '" alt="' + img.alt +
        '" width="' + img.width + '" height="' + img.height + '" loading="lazy">' +
        '<div class="overlay"></div>' +
        '</div>';
    }).join('');

    return '<div class="slider-container">' +
      slides +
      '<button class="nav-btn prev" aria-label="Anterior">' + SVG_PREV + '</button>' +
      '<button class="nav-btn next" aria-label="Siguiente">' + SVG_NEXT + '</button>' +
      '<div class="dots-container"></div>' +
      '</div>';
  }

  function buildImage(img) {
    return '<img src="' + BASE + img.src + '" alt="' + img.alt +
      '" class="product-image" width="' + img.width + '" height="' + img.height +
      '" loading="lazy">';
  }

  function buildProductCard(product, action, heading) {
    var imgBlock = product.images.length > 1
      ? buildSlider(product.images)
      : buildImage(product.images[0]);

    var btn = action === 'detail'
      ? '<a href="' + BASE + product.url + '" class="btn btn-primary btn-small">Ver Detalles</a>'
      : '<a href="' + WA_BASE + product.whatsapp + '" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-small">Pedir Ahora</a>';

    var priceDetail = product.presentation
      ? '<div class="price-detail">' + product.presentation + '</div>'
      : '';

    return '<div class="product-card">' +
      imgBlock +
      '<div class="product-info">' +
        '<' + heading + ' class="product-name">' + product.name + '</' + heading + '>' +
        '<p class="product-description">' + product.description + '</p>' +
        '<div class="product-price">' +
          '<div>' +
            '<div class="price-tag">' + product.price + '</div>' +
            priceDetail +
          '</div>' +
          btn +
        '</div>' +
      '</div>' +
      '</div>';
  }

  function buildComboCard(combo, heading) {
    var imgBlock = combo.images.length > 1
      ? buildSlider(combo.images)
      : buildImage(combo.images[0]);

    var btn = '<a href="' + WA_BASE + combo.whatsapp +
      '" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-small">Pedir Ahora</a>';

    return '<div class="product-card combo-card" id="' + combo.id + '">' +
      imgBlock +
      '<div class="product-info">' +
        '<' + heading + ' class="product-name">' + combo.name + '</' + heading + '>' +
        '<p class="product-description">' + combo.description + '</p>' +
        '<div class="product-price">' +
          '<div class="price-tag">' + combo.price + '</div>' +
          btn +
        '</div>' +
      '</div>' +
      '</div>';
  }

  function resolveItems(allItems, idsAttr, limitAttr) {
    if (idsAttr) {
      var ids = idsAttr.split(',').map(function (s) { return s.trim(); });
      return ids.map(function (id) {
        return allItems.find(function (item) { return item.id === id; });
      }).filter(Boolean);
    }
    var limit = limitAttr ? parseInt(limitAttr, 10) : null;
    return limit ? allItems.slice(0, limit) : allItems.slice();
  }

  function renderCatalog() {
    var containers = document.querySelectorAll('[data-catalog]');
    for (var i = 0; i < containers.length; i++) {
      var container = containers[i];
      var type    = container.getAttribute('data-catalog');
      var action  = container.getAttribute('data-action')  || 'order';
      var heading = container.getAttribute('data-heading') || 'h3';
      var idsAttr = container.getAttribute('data-ids');
      var limitAttr = container.getAttribute('data-limit');

      var allItems = type === 'combos' ? MISAJO_CATALOG.combos : MISAJO_CATALOG.products;
      var items = resolveItems(allItems, idsAttr, limitAttr);

      var html = items.map(function (item) {
        return type === 'combos'
          ? buildComboCard(item, heading)
          : buildProductCard(item, action, heading);
      }).join('');

      container.innerHTML = html;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderCatalog);
  } else {
    renderCatalog();
  }

})();
