/**
 * MisajoCookies — Catálogo centralizado de productos y combos.
 * Fuente única de verdad. Actualiza aquí y los cambios se reflejan en toda la web.
 *
 * Campos por producto/combo:
 *   id          → identificador único (usado en data-ids y como id HTML en combos)
 *   name        → nombre a mostrar en tarjetas y páginas
 *   description → texto oficial (tomado de Galletas-Descripcion.txt)
 *   price       → precio formateado con puntos: '$4.000'
 *   presentation→ texto bajo el precio (null si no aplica)
 *   images      → array de { src, alt, width, height }
 *   whatsapp    → mensaje pre-codificado para wa.me (solo el texto después de ?text=)
 *   url         → ruta de la página de detalle (relativa a la raíz del sitio)
 */

/* Base URL calculada del propio script para funcionar tanto en file:// como en http:// */
var CATALOG_BASE = (function () {
  var el = document.currentScript;
  if (!el) return '/';
  return el.src.replace(/assets\/js\/catalog-data\.js(\?.*)?$/, '');
})();

const MISAJO_CATALOG = {

  products: [
    {
      id: 'galletas-mantequilla',
      name: 'Galletas de Mantequilla',
      description: 'Simplicidad, herencia y sabor. Delicadas piezas artesanales con el aroma inconfundible de la mantequilla de alta calidad, acentuadas con un punto de glaseado de frutas. El equilibrio perfecto entre lo crujiente y lo suave en una presentación exclusiva.',
      price: '$4.000',
      presentation: 'Paquete x 50gr',
      images: [
        { src: 'assets/images/galletas-mantequilla.webp', alt: 'Galletas de Mantequilla artesanales MisajoCookies Cali', width: 1200, height: 900 }
      ],
      whatsapp: 'Hola!%20Quiero%20pedir%20las%20Galletas%20de%20Mantequilla',
      url: 'productos/galletas-mantequilla.html'
    },
    {
      id: 'galletas-topping',
      name: 'Galletas Topping',
      description: 'Pureza artesanal y destellos de color. Desde la profundidad del chocolate negro y la suavidad del blanco, hasta el toque vibrante de nuestras gemas de cacao o la alegría festiva de las grajeas de temporada. Cada variedad se elabora artesanalmente sobre una base crocante de vainilla o chocolate intenso, ofreciendo una experiencia premium única y personalizada.',
      price: '$4.000',
      presentation: 'Paquete x 50gr',
      images: [
        { src: 'assets/images/galletas-toping1.webp', alt: 'Galletas Topping artesanales chocolate MisajoCookies Cali', width: 1200, height: 583 },
        { src: 'assets/images/galletas-toping2.webp', alt: 'Galletas Topping variedad de sabores MisajoCookies Cali', width: 1200, height: 583 }
      ],
      whatsapp: 'Hola!%20Me%20interesan%20las%20Galletas%20Topping',
      url: 'productos/galletas-chocochips.html'
    },
    {
      id: 'alfajores',
      name: 'Alfajores',
      description: 'La esencia de la repostería fina. Alfajores artesanales de suavidad inigualable, rellenos de arequipe artesanal y terminados con una sutil lluvia de azúcar glass. Pequeños tesoros gastronómicos que transforman un café en una experiencia de lujo.',
      price: '$4.000',
      presentation: 'Paquete x 50gr',
      images: [
        { src: 'assets/images/alfajores.webp', alt: 'Alfajores de arequipe artesanales MisajoCookies Cali', width: 1200, height: 900 }
      ],
      whatsapp: 'Hola!%20Me%20interesan%20los%20Alfajores',
      url: 'productos/alfajores.html'
    },
    {
      id: 'alfajores-corazon',
      name: 'Alfajor Corazón de Fresa',
      description: 'Corazón de Fresa: Distinción Frutal. La elegancia del detalle artesanal. Finas galletas con un corazón vibrante de mermelada de fresa premium y un sutil velo de azúcar glass. El equilibrio perfecto entre suavidad y frescura en un bocado de alta repostería.',
      price: '$4.000',
      presentation: 'Paquete x 50gr',
      images: [
        { src: 'assets/images/alfajores-corazon.webp', alt: 'Alfajor Corazón de Fresa artesanal MisajoCookies Cali', width: 1200, height: 900 }
      ],
      whatsapp: 'Hola!%20Me%20interesa%20el%20Alfajor%20Coraz%C3%B3n%20de%20Fresa',
      url: 'productos/alfajores-corazon.html'
    },
    {
      id: 'galletas-bigote',
      name: 'Bigote de Limón',
      description: 'Bigote de Limón: Esencia Cítrica. Diseño icónico y sabor vibrante. Delicada galleta artesanal de vainilla con una textura suave que se funde en el paladar, realzada por un glaseado premium de limón. Una pieza de repostería fina que combina estilo y frescura.',
      price: '$4.000',
      presentation: 'Paquete x 50gr',
      images: [
        { src: 'assets/images/galletas-bigote.webp', alt: 'Bigote de Limón galleta artesanal de vainilla MisajoCookies Cali', width: 1200, height: 900 }
      ],
      whatsapp: 'Hola!%20Me%20interesa%20el%20Bigote%20de%20Lim%C3%B3n',
      url: 'productos/galletas-bigote.html'
    },
    {
      id: 'cookie-dip-premium',
      name: 'Cookie Dip Premium',
      description: 'La experiencia definitiva para los amantes del detalle. Disfruta de 150g de nuestras exclusivas galletas artesanales, horneadas con una receta secreta diseñada para el "crunch" perfecto, acompañadas de 50g de salsa gourmet a tu elección: Ganache de chocolate intenso, Arequipe o Ganache de frutas de temporada. El equilibrio ideal entre lo crocante y lo cremoso, listo para disfrutar donde sea.',
      price: '$12.000',
      presentation: null,
      images: [
        { src: 'assets/images/cookie-dip-premium.webp', alt: 'Cookie Dip Premium galletas artesanales con salsa gourmet MisajoCookies Cali', width: 1200, height: 900 }
      ],
      whatsapp: 'Hola!%20Quiero%20pedir%20el%20Cookie%20Dip%20Premium',
      url: 'productos/cookie-dip-premium.html'
    },
    {
      id: 'cookie-shaker-supreme',
      name: 'Cookie Shaker Supreme',
      description: 'El snack perfecto para llevar tu antojo al siguiente nivel. Un práctico vaso tipo cúpula cargado con 130g de nuestras galletas artesanales de receta especial, coronado con 50g de un suave y sedoso ganache de chocolate o frutas de temporada. Destapa, unta y disfruta la combinación ideal de sabor en un formato dinámico.',
      price: '$10.000',
      presentation: null,
      images: [
        { src: 'assets/images/cookie-shaker-supreme.webp', alt: 'Cookie Shaker Supreme vaso cúpula galletas artesanales MisajoCookies Cali', width: 1200, height: 900 }
      ],
      whatsapp: 'Hola!%20Quiero%20pedir%20el%20Cookie%20Shaker%20Supreme',
      url: 'productos/cookie-shaker-supreme.html'
    }
  ],

  combos: [
    {
      id: 'combo-deleite',
      name: 'Combo Deleite',
      description: 'La combinación perfecta para una pausa de lujo. Incluye dos paquetes de nuestras galletas artesanales de libre elección (50gr c/u), acompañados por la distinción de un Café Juan Valdez o la frescura de un Té Hatsu (250ml). Tú eliges tus favoritos; nosotros ponemos la excelencia.',
      price: '$17.000',
      images: [
        { src: 'assets/images/combo-deleite1.webp',  alt: 'Combo Deleite galletas artesanales con café Juan Valdez o Té Hatsu MisajoCookies Cali', width: 1184, height: 864 },
        { src: 'assets/images/combo-deleite2.webp', alt: 'Combo Deleite MisajoCookies Cali vista detalle', width: 1184, height: 864 }
      ],
      whatsapp: 'Hola!%20Quiero%20el%20Combo%20Deleite'
    },
    {
      id: 'combo-dulce',
      name: 'Combo Dulce',
      description: 'Una experiencia para los cinco sentidos. Incluye un paquete de nuestras galletas artesanales de libre elección (50gr) y una exclusiva vela aromática con esencia de galleta recién horneada. El detalle perfecto para crear un ambiente cálido y sofisticado. Personalización: Variedad de galletas y formas de vela según disponibilidad.',
      price: '$15.000',
      images: [
        { src: 'assets/images/combo-dulce.webp', alt: 'Combo Dulce galletas artesanales con vela aromática MisajoCookies Cali', width: 1044, height: 900 }
      ],
      whatsapp: 'Hola!%20Quiero%20el%20Combo%20Dulce'
    },
    {
      id: 'combo-premium',
      name: 'Combo Premium',
      description: "La máxima expresión de un detalle gourmet. Una selección de dos paquetes de nuestras galletas artesanales (50gr c/u) maridadas con licor de prestigio. Elige entre la fuerza de un Jack Daniel's (50ml) o la intensidad de dos botellas de Jägermeister (20ml c/u). Diseñado para celebraciones memorables.",
      price: '$25.000',
      images: [
        { src: 'assets/images/combo-premium1.webp', alt: 'Combo Premium galletas artesanales con licor Jack Daniels MisajoCookies Cali', width: 1044, height: 900 },
        { src: 'assets/images/combo-premium2.webp', alt: 'Combo Premium MisajoCookies Cali celebraciones especiales', width: 1200, height: 874 }
      ],
      whatsapp: 'Hola!%20Quiero%20pedir%20el%20Combo%20Premium'
    }
  ]

};
