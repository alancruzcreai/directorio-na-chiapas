# Directorio NA Chiapas Centro

Directorio público de los grupos de Narcóticos Anónimos del Área Chiapas Centro. Horarios, direcciones y contacto de las reuniones en Tuxtla Gutiérrez, Chiapa de Corzo, Berriozábal, Villaflores y Comitán.

## Stack

Sitio **estático**, sin framework, sin build step.

- HTML semántico
- CSS con custom properties (tokens) — dark/light mode con persistencia en `localStorage`
- JavaScript vanilla — filtros, búsqueda, modal, reloj local, mensaje del día rotativo
- Tipografía: **DM Sans** + **DM Mono** (Google Fonts)
- Logo NA oficial en SVG

## Estructura

```
.
├── index.html          # Página única con los 14 grupos
├── styles.css          # Sistema de diseño completo
├── app.js              # Interactividad
├── logo-na.svg         # Logo NA (también usado como favicon)
└── imagenes/grupos/    # Fotos por grupo
    ├── buena-voluntad/        (7 imágenes)
    ├── desde-las-cenizas/     (2)
    ├── los-milagros-ocurren/  (2)
    ├── mi-gratitud/           (3)
    └── nunca-mas-solos/       (3)
```

## Cómo correrlo localmente

Es estático — sirve cualquier servidor HTTP simple:

```bash
# Python
python3 -m http.server 8080

# Node (con npx)
npx serve

# PHP
php -S localhost:8080
```

Luego abre `http://localhost:8080`.

## Grupos

14 grupos en el Área Chiapas Centro distribuidos en 5 ciudades:

- **Tuxtla Gutiérrez**: Buena Voluntad, Desde las Cenizas, Equinoccio, Los Milagros Ocurren, Mi Gratitud, Navegando Juntos, Nunca Más Solos, Resiliencia, Salto de Fe
- **Chiapa de Corzo**: Esperanza, Nueva Vida
- **Berriozábal**: Berriozábal
- **Villaflores**: Villaflores
- **Comitán de Domínguez**: Comitán

## Features

- 🔍 **Búsqueda en tiempo real** por nombre/lugar (`⌘ K` en desktop)
- 🏷️ **Filtros** por día de la semana y ciudad
- 🌓 **Dark / Light mode** con detección de preferencia del sistema + override manual con persistencia
- 🕐 **Reloj local** Chiapas en tiempo real
- 🔴 **Indicador "reunión activa ahora"** calculado contra hora local
- 📖 **Mensaje del día** rotativo (7 textos, uno por día del año)
- 🖼️ **Galería por grupo** con scroll-snap horizontal en el modal
- 📞 **Llamada directa** + WhatsApp + Cómo llegar (Google Maps)
- 📱 **Responsive** — mobile-first con tres breakpoints (480, 720, 980)
- ♿ **Accesible** — skip link, focus visible, ARIA labels, semantic HTML, `prefers-reduced-motion`, `prefers-color-scheme`
- 🖨️ **Print styles** incluidos

## Diseño

Estética editorial cálida — tipografía generosa, paleta terrosa (marfil + terracota + verde salvia), detalles técnicos en monospace, mucho espacio negativo.

El hero tiene un sistema de **orbes pastel respirando** (7 capas con `breathe`, `drift` y `hueShift` infinitas) que transmite la sensación de inclusión y calma sin distraer del mensaje.

## Información placeholder

Los siguientes datos son **ficticios** y deben actualizarse antes de publicar:
- Direcciones exactas
- Números de teléfono (formato `9XX XXX XXXX`)
- Nombres de servidores de contacto
- Años de fundación
- Coordenadas
- Línea de ayuda 24/7 (`961 123 4567`)

## Anonimato

NA tiene como base espiritual el anonimato (11ª y 12ª Tradiciones). Si las fotos cargadas muestran personas identificables, deben reemplazarse por imágenes del espacio sin rostros antes de publicación.

## Licencia

Material producido para uso interno del Área Chiapas Centro de NA. El logotipo de NA es propiedad de **NA World Services, Inc.**
