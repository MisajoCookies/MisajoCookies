# SRS — Módulo "Haz Tu Pedido"
## MisajoCookies · Cali, Colombia

**Versión:** 1.1 (definitiva)
**Fecha:** 2026-03-09
**URL del módulo:** `/pedidos/`
**WhatsApp destino:** +573159038449
**Estándar aplicado:** IEEE 830 adaptado a proyecto estático sin backend

---

## Índice

1. [Visión General](#1-visión-general)
2. [Actores del Sistema](#2-actores-del-sistema)
3. [Catálogo de Datos (Fuente de Verdad)](#3-catálogo-de-datos)
4. [Historias de Usuario](#4-historias-de-usuario)
5. [Requerimientos Funcionales — MoSCoW](#5-requerimientos-funcionales)
6. [Requerimientos No Funcionales](#6-requerimientos-no-funcionales)
7. [Reglas de Negocio](#7-reglas-de-negocio)
8. [Casos de Borde](#8-casos-de-borde)
9. [Arquitectura Técnica](#9-arquitectura-técnica)
10. [Flujo Completo del Usuario](#10-flujo-completo-del-usuario)
11. [Formato del Mensaje WhatsApp](#11-formato-del-mensaje-whatsapp)
12. [Integración Google Sheets](#12-integración-google-sheets)
13. [Lista de Barrios](#13-lista-de-barrios)

---

## 1. Visión General

### 1.1 Descripción
**"Haz Tu Pedido"** es un configurador de pedidos interactivo en `/pedidos/` que permite al cliente construir un pedido completamente personalizado: seleccionando paquetes de galletas, combos pre-armados (expandibles con extras), productos premium y accesorios, con cálculo automático de domicilio y beneficios por monto. El pedido finaliza con un resumen estructurado enviado a WhatsApp y un registro silencioso en Google Sheets.

### 1.2 Objetivo de Negocio
- Eliminar la fricción del pedido manual por WhatsApp
- Aumentar ticket promedio mostrando upsells y umbrales de beneficio visibles
- Registrar pedidos automáticamente en Google Sheets para control de operaciones
- Funcionar 100% sin base de datos propia (compatible con GitHub Pages)

### 1.3 Restricciones Técnicas

| Restricción | Detalle |
|---|---|
| Hosting | GitHub Pages (solo archivos estáticos) |
| Backend propio | **Ninguno** |
| Registro de pedidos | Google Apps Script Web App → Google Sheets |
| Lenguajes | HTML, CSS, JavaScript vanilla (consistente con el sitio) |
| Catálogo | Lee directamente `MISAJO_CATALOG` desde `catalog-data.js` |

---

## 2. Actores del Sistema

| Actor | Descripción |
|---|---|
| **Cliente** | Persona que configura y envía su pedido desde el sitio web |
| **Operador (Misajo)** | Recibe pedido por WhatsApp y lo registra/despacha |
| **Google Sheets** | Sistema pasivo de registro; no bloquea el flujo si falla |

---

## 3. Catálogo de Datos

### 3.1 Paquetes de Galletas Base — $4.000 c/u

| ID | Nombre | Presentación |
|---|---|---|
| `galletas-mantequilla` | Galletas de Mantequilla | Paquete x 50gr |
| `galletas-topping` | Galletas Topping | Paquete x 50gr |
| `alfajores` | Alfajores | Paquete x 50gr |
| `alfajores-corazon` | Alfajor Corazón de Fresa | Paquete x 50gr |
| `galletas-bigote` | Bigote de Limón | Paquete x 50gr |

> Estos 5 son los únicos elegibles como **paquete gratis** por compra > $60.000.

### 3.2 Productos Premium

| ID | Nombre | Precio | Dip incluido |
|---|---|---|---|
| `cookie-dip-premium` | Cookie Dip Premium | $12.000 | Sí (150gr galletas + 50gr dip a elección) |
| `cookie-shaker-supreme` | Cookie Shaker Supreme | $10.000 | Sí (130gr galletas + 50gr dip a elección) |

> Los productos premium **incluyen un dip** en su precio base. Ver RN-07 para recargos de cambio de sabor.

### 3.3 Combos Pre-armados (Expandibles)

| ID | Nombre | Precio base | Contenido incluido |
|---|---|---|---|
| `combo-deleite` | Combo Deleite | $17.000 | 2 paquetes base + Café/Hatsu |
| `combo-dulce` | Combo Dulce | $15.000 | 1 paquete base + Vela |
| `combo-premium` | Combo Premium | $25.000 | 2 paquetes base + Licor (Jack/Jäger) |

> Los combos pre-armados pueden **expandirse** en el configurador agregando cualquier extra adicional.
> Los paquetes incluidos en los combos son elegibles a cambio por otras variedades de galletas.

### 3.4 Extras y Accesorios

| ID | Nombre | Precio | Notas |
|---|---|---|---|
| `cafe-hatsu` | Café Juan Valdez / Té Hatsu (250ml) | $5.000 | El cliente especifica cuál en notas |
| `vela` | Vela aromática | $3.000 | 1 unidad, disponibilidad variable |
| `dip-estandar` | Dip gourmet (ganache, arequipe, frutas) | $2.000 | El cliente especifica sabor en notas |
| `dip-chocolate-blanco` | Dip Chocolate Blanco | $3.000 | Precio diferencial por costo de insumo |
| `caja` | Caja de presentación | $2.000 | Para llevar todo dentro de una caja |

### 3.5 Recargo de Dip en Productos Premium

| Situación | Recargo |
|---|---|
| Cliente quiere cambiar el dip incluido a **Chocolate Blanco** | +$1.800 |
| Cliente quiere cualquier **otro sabor** (ganache, arequipe, frutas) | $0 (solo especificar en notas) |
| Cliente quiere un **dip adicional** aparte del incluido | Precio completo del dip según 3.4 |

---

## 4. Historias de Usuario

### HU-01 · Configurar Pedido Personalizado
> **Como** cliente,
> **quiero** seleccionar paquetes, combos, productos premium y extras en un solo lugar,
> **para que** pueda armar exactamente lo que quiero sin tener que escribirlo manualmente.

```gherkin
Escenario: Cliente agrega paquetes de galletas
  Given el cliente está en la página "Haz Tu Pedido"
  When selecciona 2 unidades de "Galletas de Mantequilla" y 1 de "Alfajores"
  Then el resumen muestra subtotal $12.000 en tiempo real

Escenario: Cliente agrega un combo pre-armado
  Given el cliente agrega 1 "Combo Deleite"
  Then el configurador lo registra como un ítem de $17.000
  And el cliente puede seguir agregando extras adicionales al combo

Escenario: Cliente selecciona producto premium con cambio de dip
  Given el cliente agrega 1 "Cookie Dip Premium"
  And selecciona "Cambiar dip a Chocolate Blanco"
  Then el sistema suma $12.000 + $1.800 = $13.800 para ese ítem

Escenario: Cliente agrega caja de presentación
  Given el cliente tiene productos en su pedido
  When activa la opción "Agregar caja de presentación"
  Then el resumen suma +$2.000 al subtotal

Escenario: Cliente intenta continuar con carrito vacío
  Given el configurador no tiene ningún ítem
  When hace clic en "Continuar"
  Then el sistema muestra: "Agrega al menos 1 producto para continuar"
```

---

### HU-02 · Calcular Domicilio con Reglas de Negocio
> **Como** cliente,
> **quiero** seleccionar mi barrio y ver el costo de domicilio y beneficios aplicados automáticamente,
> **para que** conozca el total exacto antes de confirmar.

```gherkin
Escenario: Cliente en Junín
  Given el cliente selecciona barrio "Junín"
  Then domicilio = $0 · "Gratis"

Escenario: Cliente en barrio de Cali con subtotal < $40.000
  Given subtotal = $20.000 y barrio = "El Ingenio" (8km)
  Then domicilio = $8.000
  And total = $28.000

Escenario: Cliente en Cali con subtotal >= $40.000
  Given subtotal = $40.000 y barrio = "El Ingenio"
  Then domicilio = $0 · "Gratis (compra >= $40.000)"
  And total = $40.000

Escenario: Cliente en Cali con subtotal > $60.000
  Given subtotal = $62.000 y barrio dentro de Cali
  Then domicilio = $0
  And aparece sección: "🎁 ¡Ganaste 1 paquete gratis! Elige tu galleta:"
  And el cliente debe elegir 1 de los 5 paquetes base

Escenario: Cliente fuera de Cali con subtotal > $60.000
  Given subtotal = $65.000 y cliente selecciona "Fuera de Cali"
  Then domicilio = "A coordinar"
  And SÍ aparece sección de galleta gratis (RN-04 aplica fuera de Cali)
  And se muestra aviso: "El domicilio gratis solo aplica dentro de Cali"

Escenario: Cliente fuera de Cali con subtotal >= $40.000
  Given subtotal = $45.000 y cliente selecciona "Fuera de Cali"
  Then domicilio = "A coordinar" (sin descuento por monto)
  And NO aparece beneficio de domicilio gratis
```

---

### HU-03 · Galleta Gratis por Compra > $60.000
> **Como** cliente con pedido mayor a $60.000,
> **quiero** elegir cuál paquete de galletas quiero de regalo,
> **para que** reciba el beneficio sin pedirlo por separado.

```gherkin
Escenario: Selección exitosa de galleta gratis
  Given subtotal > $60.000 (dentro o fuera de Cali)
  When el cliente selecciona "Bigote de Limón" como regalo
  Then el resumen muestra "+ 1 Bigote de Limón · GRATIS"
  And el subtotal NO aumenta
  And el mensaje WA incluye: "🎁 Paquete gratis: Bigote de Limón"

Escenario: Intento de finalizar sin elegir galleta gratis
  Given subtotal > $60.000 y la sección de galleta gratis está visible
  When el cliente hace clic en "Enviar pedido"
  Then el sistema muestra: "Elige tu paquete de galletas gratis antes de continuar"
```

---

### HU-04 · Finalizar Pedido por WhatsApp
> **Como** cliente,
> **quiero** que mi pedido llegue automáticamente a WhatsApp con todos los detalles,
> **para que** no tenga que escribir nada y no se pierda ningún ítem.

```gherkin
Escenario: Envío exitoso
  Given el cliente completó productos, barrio, dirección y galleta gratis (si aplica)
  When hace clic en "Enviar pedido por WhatsApp"
  Then se abre wa.me/573159038449?text=... con el resumen completo

Escenario: Dirección vacía
  Given el cliente no ingresó dirección
  When hace clic en "Enviar pedido"
  Then aparece: "Por favor ingresa tu dirección de entrega"

Escenario: Aviso de horario fuera de servicio
  Given la hora actual es antes de 1:00pm o después de 7:00pm
  Then se muestra banner: "Atendemos todos los días de 1:00pm a 7:00pm"
  And el botón de WhatsApp sigue activo (el pedido se responde en horario)

Escenario: Registro en Google Sheets
  Given el cliente envía el pedido
  Then en segundo plano se hace POST al Apps Script
  And si el POST falla, el flujo a WhatsApp NO se interrumpe
```

---

## 5. Requerimientos Funcionales

| ID | Requerimiento | Prioridad |
|---|---|---|
| RF-01 | Mostrar los 5 paquetes base con imagen, nombre, precio y controles +/- | **Must have** |
| RF-02 | Mostrar productos premium (Dip Premium, Shaker) con opción de cambio de dip | **Must have** |
| RF-03 | Mostrar los 3 combos pre-armados como ítems seleccionables con controles +/- | **Must have** |
| RF-04 | Mostrar sección de extras (Café/Hatsu, Vela, Dip estándar, Dip Choco Blanco, Caja) | **Must have** |
| RF-05 | Para Dip Premium y Shaker: checkbox "Cambiar dip a Chocolate Blanco (+$1.800)" | **Must have** |
| RF-06 | Resumen sticky en tiempo real: ítems, subtotal, domicilio, total | **Must have** |
| RF-07 | Selector de barrio (dropdown) con precio de domicilio pre-calculado | **Must have** |
| RF-08 | Campo de texto para dirección (validación: no vacío) | **Must have** |
| RF-09 | Aplicar domicilio gratis si subtotal ≥ $40.000 y barrio está dentro de Cali | **Must have** |
| RF-10 | Mostrar sección de galleta gratis si subtotal ≥ $60.001 (dentro Y fuera de Cali) | **Must have** |
| RF-11 | El paquete gratis ($60k) solo elegible de los 5 paquetes base | **Must have** |
| RF-12 | Validación de formulario: ≥1 producto + barrio + dirección + galleta gratis si aplica | **Must have** |
| RF-13 | Construir mensaje WhatsApp estructurado y abrir wa.me/573159038449 | **Must have** |
| RF-14 | POST silencioso a Google Apps Script para registro en Google Sheets | **Must have** |
| RF-15 | Campo de notas/comentarios opcionales (sabor de dip, tipo de café/hatsu, etc.) | **Must have** |
| RF-16 | Banner de horario de atención cuando es < 1pm o > 7pm | **Should have** |
| RF-17 | Mensaje motivador de progreso hacia umbrales ($40k, $60k) | **Should have** |
| RF-18 | Diseño responsive mobile-first | **Must have** |
| RF-19 | Opción "Mi barrio no está / Fuera de Cali" con domicilio "A coordinar" | **Must have** |
| RF-20 | Leer datos de productos directamente desde `MISAJO_CATALOG` en `catalog-data.js` | **Must have** |

---

## 6. Requerimientos No Funcionales

| ID | Categoría | Descripción | Métrica |
|---|---|---|---|
| RNF-01 | Rendimiento | Carga inicial < 2s en 4G | PageSpeed Insights |
| RNF-02 | Rendimiento | Toda interacción de cálculo < 50ms | Sin debounce innecesario |
| RNF-03 | Usabilidad | Flujo completo en ≤ 4 pasos sin recargas | SPA-like dentro de la misma página |
| RNF-04 | Usabilidad | Totales en formato COP con puntos (`$4.000`, no `$4000`) | |
| RNF-05 | Usabilidad | El resumen de pedido siempre visible (sticky) | Mobile: bottom bar / Desktop: sidebar |
| RNF-06 | Compatibilidad | Chrome, Safari iOS, Samsung Internet (últimas 2 versiones) | |
| RNF-07 | Mantenibilidad | Precios y nombres solo en `catalog-data.js` y `barrios-data.js` | Cero hardcode en HTML |
| RNF-08 | Resiliencia | Si el POST a Google Sheets falla, el WhatsApp se abre igual | Sin bloqueo por error de red |
| RNF-09 | SEO | H1, meta description, OG tags, schema `Service` | Consistente con el sitio |
| RNF-10 | Accesibilidad | aria-label en botones, controles de cantidad accesibles por teclado | WCAG 2.1 nivel A |

---

## 7. Reglas de Negocio

### RN-01 · Precio de Domicilio Dentro de Cali
- **Fórmula:** `costo_domicilio = distancia_km × $1.000`
- **Junín:** 0 km → domicilio **siempre gratis**
- **Datos:** Lista fija en `barrios-data.js` (no calculado en tiempo real)

### RN-02 · Fuera de Cali
- El domicilio queda como **"A coordinar"** (el operador lo define por WA)
- El domicilio "A coordinar" NO es afectado por el umbral de $40.000
- El beneficio de galleta gratis ($60.000) **SÍ aplica** fuera de Cali

### RN-03 · Domicilio Gratis por Monto (Solo dentro de Cali)
- **Condición:** `subtotal ≥ $40.000`
- **El umbral es inclusivo:** $40.000 exactos ya aplica
- **Resultado:** `costo_domicilio = 0`

### RN-04 · Galleta Gratis por Compra > $60.000 (Dentro Y Fuera de Cali)
- **Condición:** `subtotal ≥ $60.001`
- **Alcance:** Aplica para **todos los clientes** (dentro y fuera de Cali)
- **Resultado:** El cliente elige 1 de los 5 paquetes base ($4.000) sin costo adicional
- El paquete gratis **no suma al subtotal** ni activa umbrales adicionales
- La selección del paquete gratis es **obligatoria** para finalizar el pedido cuando aplica

### RN-05 · Definición del Subtotal para Umbrales
```
subtotal = Σ(cantidad × precio de cada paquete base)
         + Σ(cantidad × precio de cada combo)
         + Σ(cantidad × precio de cada producto premium)
         + Σ(recargo de dip chocolate blanco en premium, si aplica)
         + Σ(cantidad × precio de cada extra)
         + $2.000 si se eligió caja

# NO se incluye: paquete gratis, costo de domicilio
```

### RN-06 · Horario de Atención
- Todos los días: **1:00 pm – 7:00 pm** (hora Colombia, UTC-5)
- El configurador está disponible 24/7
- El aviso de horario es informativo; no bloquea el pedido

### RN-07 · Recargo de Dip en Productos Premium
- Aplica solo a: `cookie-dip-premium` y `cookie-shaker-supreme`
- Si el cliente activa "Cambiar a Chocolate Blanco": **+$1.800** por unidad
- Si el cliente elige cualquier otro sabor (ganache, arequipe, frutas): **$0 extra** (especificar en notas)
- Si el cliente quiere un **dip adicional** (aparte del incluido): precio normal del extra (ver 3.4)

### RN-08 · Caja de Presentación
- Precio: **$2.000** por pedido (no por ítem)
- Es un extra único: el checkbox solo puede estar activado o desactivado (no tiene cantidad)
- La caja aplica para el pedido completo, no por combo individual

### RN-09 · Combos Pre-armados en el Configurador
- Los combos se seleccionan con controles +/-
- El precio base del combo incluye todos sus ítems originales
- Se pueden agregar extras adicionales al combo (ej: Combo Deleite + Vela extra)
- Los paquetes de galletas dentro del combo pueden personalizarse vía el campo de notas

---

## 8. Casos de Borde

| # | Escenario | Riesgo | Manejo |
|---|---|---|---|
| CE-01 | Cliente en iOS sin WhatsApp instalado | `wa.me` abre App Store | `wa.me` abre WA Web si no hay app. Documentado, sin acción adicional |
| CE-02 | Cliente baja subtotal de >$60k a <$60k después de elegir galleta gratis | Galleta sigue seleccionada con umbral ya no cumplido | Re-evaluar umbrales en cada cambio de cantidad; resetear y ocultar sección automáticamente |
| CE-03 | Cliente baja subtotal de >$40k a <$40k dentro de Cali | Domicilio se mantuvo en $0 | Recalcular domicilio en cada cambio de cantidad |
| CE-04 | Subtotal exacto en $40.000 | Umbral inclusivo: sí aplica | Condición: `subtotal >= 40000` (no `> 40000`) |
| CE-05 | Fuera de Cali + subtotal $40k–$60k | Podría confundirse con domicilio gratis | Mensaje explícito: "El domicilio gratis aplica solo dentro de Cali" |
| CE-06 | Producto Premium + cambio a choco blanco + unidades > 1 | Recargo debe multiplicarse por cantidad | `recargo_total = cantidad × $1.800` |
| CE-07 | Mensaje WA > 4096 caracteres | WhatsApp trunca | Con el catálogo actual es prácticamente imposible. Si ocurre, truncar la sección de notas con aviso |
| CE-08 | WA abierto desde In-App Browser del propio WhatsApp | No puede abrir WA desde WA | Detectar user-agent y mostrar: "Abre esta página en Chrome o Safari" |
| CE-09 | POST a Google Sheets falla (sin conexión / script caído) | Pedido no se registra | Continuar con WA de todas formas. El operador puede ingresar el pedido de WA manualmente a Sheets si es necesario |
| CE-10 | Doble clic en "Enviar pedido" | Se abre WA dos veces | Deshabilitar botón 3 segundos tras primer clic |
| CE-11 | JavaScript desactivado | Configurador no funciona | `<noscript>` con texto: "Para hacer tu pedido escríbenos al WhatsApp: +573159038449" |
| CE-12 | Cliente agrega Combo Premium y también Café/Hatsu suelto | Combo ya incluye bebida — ¿doble cobro? | El sistema no sabe que el extra "duplica" lo del combo. El campo de notas aclara al operador. No bloquear. |

---

## 9. Arquitectura Técnica

### 9.1 Nueva Página
```
/pedidos/
  index.html          ← "Haz Tu Pedido"
```

### 9.2 Nuevos Archivos JS
```
assets/js/
  pedidos-builder.js  ← lógica del configurador (estado, cálculos, validaciones)
  barrios-data.js     ← lista de barrios con distancia_km (fuente única)
```

### 9.3 Reutilización del Catálogo
El configurador **lee directamente** `MISAJO_CATALOG` desde `catalog-data.js`.
Sin duplicación de precios ni nombres en ningún otro archivo.

### 9.4 Estado del Configurador (objeto en memoria)
```javascript
const orderState = {
  cookiePackages: [
    // { id, name, qty, unitPrice }
  ],
  premiumProducts: [
    // { id, name, qty, unitPrice, upgradeDipToWhiteChoco: false, upgradePrice: 1800 }
  ],
  combos: [
    // { id, name, qty, unitPrice }
  ],
  extras: {
    cafeHatsu: 0,          // cantidad
    vela: 0,
    dipEstandar: 0,
    dipChocoBlanco: 0,
    caja: false            // boolean (único)
  },
  freePackageId: null,     // ID elegido cuando subtotal > $60k (null = no aplica / no elegido)
  delivery: {
    neighborhood: '',
    address: '',
    distanceKm: 0,
    baseCost: 0,           // costo antes de aplicar umbrales
    finalCost: 0,          // costo después de reglas (puede ser 0)
    isOutsideCali: false,
    isToCoordinate: false  // true si barrio no está en lista o fuera de Cali
  },
  notes: '',
  // Calculados
  subtotal: 0,
  deliveryCost: 0,
  total: 0,
  freePackageEligible: false,   // subtotal > $60k
  freeDeliveryEligible: false   // subtotal >= $40k && !isOutsideCali
};
```

### 9.5 Integración Google Sheets — Google Apps Script
Ver Sección 12.

---

## 10. Flujo Completo del Usuario

```
[/pedidos/ — "Haz Tu Pedido"]
           │
           ▼
[SECCIÓN A] Paquetes de Galletas
  5 opciones con imagen, nombre, precio
  Controles [ - ] [ 0 ] [ + ] por cada una

[SECCIÓN B] Productos Premium
  Cookie Dip Premium ($12.000)   [ - ] [ 0 ] [ + ]
    └── ☐ Cambiar dip a Chocolate Blanco (+$1.800/ud)
  Cookie Shaker Supreme ($10.000) [ - ] [ 0 ] [ + ]
    └── ☐ Cambiar dip a Chocolate Blanco (+$1.800/ud)

[SECCIÓN C] Combos Pre-armados
  Combo Deleite ($17.000)  [ - ] [ 0 ] [ + ]
  Combo Dulce   ($15.000)  [ - ] [ 0 ] [ + ]
  Combo Premium ($25.000)  [ - ] [ 0 ] [ + ]

[SECCIÓN D] Extras y Accesorios
  ☕ Café / Hatsu (250ml)    $5.000  [ - ] [ 0 ] [ + ]
  🕯️  Vela aromática          $3.000  [ - ] [ 0 ] [ + ]
  🍫 Dip estándar             $2.000  [ - ] [ 0 ] [ + ]
  ⬜ Dip Chocolate Blanco    $3.000  [ - ] [ 0 ] [ + ]
  📦 Caja de presentación    $2.000  ☐ (único checkbox)

── RESUMEN STICKY (siempre visible) ──────────────────
  Subtotal:    $XX.000
  [Barra de progreso hacia $40k y $60k]
  Domicilio:   $XX.000
  ─────────────────────────────────────
  TOTAL:       $XX.000
──────────────────────────────────────────────────────

[SECCIÓN E — CONDICIONAL] 🎁 ¡Ganaste una galleta gratis!
  Visible solo si subtotal ≥ $60.001
  ( ) Galletas Mantequilla
  ( ) Galletas Topping
  ( ) Alfajores
  ( ) Alfajor Corazón de Fresa
  ( ) Bigote de Limón

[SECCIÓN F] Datos de Entrega
  Barrio:    [ Dropdown ▼ ]
  Dirección: [______________________________]
  Notas:     [______________________________] (opcional)
             Ej: "Hatsu de maracuyá", "Dip de arequipe"

[BOTÓN] 💬 Enviar pedido por WhatsApp
  → Validaciones → Abre wa.me/573159038449?text=...
  → POST silencioso a Google Apps Script
```

---

## 11. Formato del Mensaje WhatsApp

```
🍪 *NUEVO PEDIDO — Haz Tu Pedido*
📅 Lunes 9 de marzo · 3:42 pm

📦 *Galletas:*
• 2x Galletas de Mantequilla — $8.000
• 1x Alfajores — $4.000

⭐ *Productos Premium:*
• 1x Cookie Dip Premium — $12.000
  ↳ Dip: Chocolate Blanco (+$1.800)

🎁 *Combos:*
• 1x Combo Deleite — $17.000

🧩 *Extras:*
• 1x Café/Hatsu (250ml) — $5.000
• 1x Caja de presentación — $2.000

🎁 *Paquete gratis (compra > $60.000):*
• Bigote de Limón

📍 *Entrega:*
Barrio: El Ingenio (~8km)
Dirección: Cra 50 #12-34, Apto 201

📝 *Notas del cliente:*
Hatsu de maracuyá, dip de arequipe en el Premium

💰 *Resumen:*
Subtotal:    $49.800
Domicilio:   $0 (compra >= $40.000 🎉)
━━━━━━━━━━━━━━━
TOTAL:       $49.800

🕐 Atención: todos los días 1pm – 7pm
```

---

## 12. Integración Google Sheets

### 12.1 Arquitectura
```
[Navegador del cliente]
       │  fetch POST (JSON)
       ▼
[Google Apps Script Web App]  ← URL pública (doGet/doPost)
       │  appendRow()
       ▼
[Google Sheets — Hoja "Pedidos"]
```

### 12.2 Payload JSON enviado al Apps Script
```json
{
  "timestamp": "2026-03-09T15:42:00-05:00",
  "items": [
    { "type": "package", "name": "Galletas de Mantequilla", "qty": 2, "unitPrice": 4000, "total": 8000 },
    { "type": "premium", "name": "Cookie Dip Premium", "qty": 1, "unitPrice": 12000, "dipUpgrade": true, "upgradePrice": 1800, "total": 13800 },
    { "type": "combo",   "name": "Combo Deleite", "qty": 1, "unitPrice": 17000, "total": 17000 },
    { "type": "extra",   "name": "Café/Hatsu", "qty": 1, "unitPrice": 5000, "total": 5000 },
    { "type": "extra",   "name": "Caja", "qty": 1, "unitPrice": 2000, "total": 2000 }
  ],
  "freePackage": "galletas-bigote",
  "subtotal": 49800,
  "deliveryCost": 0,
  "total": 49800,
  "delivery": {
    "neighborhood": "El Ingenio",
    "address": "Cra 50 #12-34, Apto 201",
    "distanceKm": 8,
    "isOutsideCali": false
  },
  "notes": "Hatsu de maracuyá, dip de arequipe en el Premium"
}
```

### 12.3 Columnas en Google Sheets
| A | B | C | D | E | F | G | H | I |
|---|---|---|---|---|---|---|---|---|
| Fecha | Hora | Barrio | Dirección | Subtotal | Domicilio | Total | Paquete Gratis | Resumen ítems | Notas |

### 12.4 Comportamiento ante Fallo
- El POST se hace con `fetch()` + `catch()` silencioso
- Si falla: el flujo continúa a WhatsApp **sin interrupción**
- El operador puede registrar el pedido manualmente desde WA si el Sheets no lo captó

### 12.5 Pendiente del Negocio
> MisajoCookies debe:
> 1. Crear el Google Sheet y compartirlo con el Apps Script
> 2. Publicar el Apps Script como Web App (acceso: cualquier persona)
> 3. Pegar la URL del Web App en `pedidos-builder.js` como constante `SHEETS_ENDPOINT`

---

## 13. Lista de Barrios

> Distancias estimadas desde Junín, Cali. **Validar con el equipo antes de publicar.**
> `costo_domicilio = distanceKm × $1.000`

```javascript
// barrios-data.js — fuente única de verdad
const BARRIOS_CALI = [
  { name: 'Junín',                  distanceKm: 0  },
  { name: 'El Centro',              distanceKm: 1  },
  { name: 'San Antonio',            distanceKm: 2  },
  { name: 'Granada',                distanceKm: 2  },
  { name: 'El Peñón',               distanceKm: 3  },
  { name: 'Versalles',              distanceKm: 3  },
  { name: 'Centenario',             distanceKm: 2  },
  { name: 'Alameda',                distanceKm: 4  },
  { name: 'Tequendama',             distanceKm: 4  },
  { name: 'Chapinero',              distanceKm: 4  },
  { name: 'Santa Mónica',           distanceKm: 5  },
  { name: 'La Flora',               distanceKm: 5  },
  { name: 'Alfonso López',          distanceKm: 5  },
  { name: 'Unicentro (zona)',        distanceKm: 5  },
  { name: 'Ciudad Jardín',          distanceKm: 6  },
  { name: 'Siloé',                  distanceKm: 6  },
  { name: 'Meléndez',               distanceKm: 7  },
  { name: 'Floralia',               distanceKm: 7  },
  { name: 'El Ingenio',             distanceKm: 8  },
  { name: 'Aguablanca',             distanceKm: 9  },
  { name: 'Valle del Lili',         distanceKm: 9  },
  { name: 'Pance',                  distanceKm: 10 },
  { name: 'Mi barrio no está aquí', distanceKm: -1 }, // → "A coordinar"
  { name: 'Fuera de Cali',          distanceKm: -2 }, // → "A coordinar", sin beneficio $40k
];
// distanceKm === -1: dentro de Cali pero sin precio fijo → beneficio $40k SÍ aplica
// distanceKm === -2: fuera de Cali → beneficio $40k NO aplica, $60k SÍ aplica
```

---

*Versión 1.1 — Todos los pendientes resueltos. Documento listo para desarrollo.*
*Próximo paso: Implementar `/pedidos/index.html`, `barrios-data.js` y `pedidos-builder.js`.*
