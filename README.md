# BINGO NEXUS — SISTEMA COMPLETO DE BINGO MÓVIL

> **Asistente digital premium para jugar al bingo utilizando cartones físicos reales.**
> 100% Offline, guardado local redundante (LocalStorage + IndexedDB), motor matemático de detección de patrones en tiempo real y soporte PWA instalable en móviles.

---

## 🎯 1. VISIÓN GENERAL

**BINGO NEXUS** no es un bingo virtual que genera números al azar para la computadora; es un **asistente en vivo para jugadores que tienen cartones físicos de papel**. 

Durante una partida en una sala, peña o fiesta familiar, el usuario escucha los números anunciados por el cantor y los introduce en la aplicación. La aplicación:
1. Registra y valida el número anunciado en tiempo real.
2. Comprueba automáticamente todos los cartones físicos transcritos.
3. Marca al instante las casillas coincidentes (distinguiendo marcas del sistema de marcas manuales).
4. Evalúa simultáneamente todos los patrones de victoria activos (Líneas, Columnas, Diagonales, Cuatro Esquinas, Letras L, U, O, T, X, Z, H, F, P, C, E, N, M, W, Figuras especiales y Cartón Lleno / Blackout).
5. Emite una alerta inmediata con fanfarria de audio sintetizada por Web Audio API (sin requerir archivos externos de audio), vibración táctil y confeti visual.
6. Permite corregir o deshacer números erróneos sin perder el progreso ni la configuración de los cartones.
7. Guarda automáticamente toda la información en el almacenamiento local del dispositivo (LocalStorage e IndexedDB) para que **nunca se pierdan los cartones de los amigos aunque el celular se apague o se quede sin batería**.

---

## 📱 2. CARACTERÍSTICAS PRINCIPALES

### 🎴 Sistema de Cartones Físicos
- **Bingo Americano (75 Bolas):** Cuadrícula 5×5, columnas tradicionales B (1-15), I (16-30), N (31-45), G (46-60), O (61-75), con casilla central **LIBRE** automática.
- **Bingo Tradicional / Español (90 Bolas):** 3 filas × 9 columnas, 15 números distribuidos en 5 números por fila, columnas ordenadas por decenas y orden ascendente.
- **Cartones Personalizados:** Dimensiones y rangos configurables.
- **Asistente de Transcripción Rápida:** Asistente táctil con auto-avance al escribir dos dígitos y validación en tiempo real contra números fuera de rango o duplicados en el cartón.
- **Gestión Multi-Cartón:** Soporte para múltiples cartones simultáneos (propios y de amigos). Permite duplicar, editar casillas, renombrar o eliminar con confirmación.
- **Vistas Adaptables:** Vista Individual (enfocada para jugar cómodamente en celular), Vista Múltiple (en cuadrícula) y Vista Resumen (lista compacta que indica qué cartón está más cerca de cantar victoria).

### 🔢 Introducción de Números y Cantor
- **Teclado Numérico Ergonómico:** Teclas táctiles grandes diseñadas para pulgares en pantallas móviles.
- **Soporte de Teclado Físico:** En computadoras o teclados externos, escribe con el teclado numérico, pulsa `Enter` para cantar, `Backspace` para borrar y `Ctrl+Z` para deshacer.
- **Tablero Maestro:** Vista interactiva de matriz (1-75 o 1-90) para visualizar de un vistazo todos los números que ya salieron y los que faltan.
- **Historial Interactivo con Corrección Precisa:** Retira cualquier número anunciado específico si el cantor corrigió una cantada falsa, recalculando matemáticamente el estado de todos los cartones sin borrar la partida.

### 🏆 Motor Matemático de Patrones de Victoria
- **Patrones Convencionales:** Cualquier línea horizontal, líneas específicas (Fila 1 a 5), cualquier columna vertical, columnas B, I, N, G, O, Diagonal principal, Diagonal secundaria, Patrón X (ambas diagonales), Cuatro esquinas, Perímetro exterior (Letra O), Cuadrado interior, Cruz central (+), Cartón lleno (Blackout).
- **Patrones de Letras y Figuras:** L (con 4 rotaciones), U (con 4 rotaciones), T (con 4 rotaciones), H, Z, C, E, F, P, M, W, Rombo/Diamante.
- **Constructor Visual de Patrones:** Dibuja cualquier figura personalizada tocando las casillas en una cuadrícula 5×5, con opciones para admitir rotaciones de 90°/180°/270°, reflejos y conteo de casilla libre.
- **Múltiples Victorias Simultáneas:** Si un número completa varios patrones a la vez o premia a varios cartones al mismo tiempo, el sistema informa detalladamente de cada victoria sin ocultar ninguna.

### 🛡️ Persistencia Offline Antiapagón & WhatsApp
- **Doble Persistencia Local:** Guarda automáticamente cada cambio en `localStorage` e `IndexedDB`. No requiere conexión a internet tras cargarse.
- **Biblioteca Permanente de Cartones:** Los cartones de tus amigos quedan almacenados para reutilizarlos en futuras partidas sin tener que volver a transcribirlos.
- **Respaldo para WhatsApp (.json):** Descarga una copia de seguridad completa con un solo clic para enviarla por WhatsApp a amigos o transferirla a otro celular.
- **Restauración con Validación:** Importa respaldos JSON verificando la integridad de los datos.

### ♿ Accesibilidad y Rendimiento
- **Diseño Luxury Carbon:** Fondo carbón profundo (`#090a0f`), detalles en naranja y ámbar eléctrico, tipografía tabular de alto impacto.
- **Modo Alto Contraste:** Conmutable desde ajustes para máxima visibilidad bajo el sol o para personas con baja visión.
- **Escala de Fuentes:** Selector de tamaño (Normal, Grande, Extra Grande).
- **Web Audio API Sintetizado:** Efectos de sonido generados por código en tiempo real. 0 KB de archivos de audio externos descargados, funciona 100% offline.
- **Vibración Táctil:** Pulsos hápticos en móviles compatibles para confirmaciones y alertas de bingo.

---

## 🚀 3. INSTRUCCIONES DE EJECUCIÓN

### Requisitos Previos
- Node.js versión 18 o superior (recomendado Node 20+).
- Navegador web moderno (Chrome, Edge, Safari, Firefox).

### 🛠️ Modo Desarrollo
Para ejecutar la aplicación localmente en tu computadora con recarga en caliente:

```bash
# 1. Ingresar a la carpeta del proyecto
cd bingo-nexus

# 2. Instalar dependencias (si no se han instalado)
npm install

# 3. Iniciar el servidor de desarrollo
npm run dev
```

Abre en tu navegador la URL que aparecerá en consola (generalmente `http://localhost:5173`).

---

### 📦 Generar Versión de Producción
Para compilar la aplicación optimizada para producción:

```bash
npm run build
```

Los archivos optimizados y minificados se generarán en la carpeta `dist/`. La configuración utiliza rutas relativas (`base: './'`), lo que permite que la carpeta `dist/` funcione:
- En cualquier servidor web estático.
- En GitHub Pages.
- Directamente abriendo el archivo `dist/index.html` en el navegador.

Para previsualizar la compilación de producción:
```bash
npm run preview
```

---

### 🧪 Ejecutar Pruebas Automatizadas
El proyecto incluye una suite exhaustiva de 32 pruebas automatizadas unitarias y de integración que verifican la integridad del motor de bingo:

```bash
npm test
```

#### Resultados Reales de las Pruebas:
```text
 ✓ src/tests/bingoEngine.test.ts (32 tests) 33ms

 Test Files  1 passed (1)
      Tests  32 passed (32)
   Duration  922ms
```

Las 32 pruebas cubren:
1. Entrada válida de números.
2. Rechazo de números fuera de rango.
3. Detección y prevención de números duplicados.
4. Marcado automático en cartones coincidentes.
5. Inmutabilidad de casillas ante números ausentes.
6. Casilla central libre en 75 bolas.
7. Detección de líneas horizontales.
8. Detección de columnas verticales.
9. Diagonales principales y secundarias.
10. Cuatro esquinas.
11. Letra L y rotaciones.
12. Letra U y rotaciones.
13. Marco completo / Letra O.
14. Letra T.
15. Creación y evaluación de patrones personalizados.
16. Cartón lleno (Blackout).
17. Múltiples patrones completados simultáneamente.
18. Victorias simultáneas en múltiples cartones.
19. Función de deshacer última cantada.
20. Retirar número específico del historial.
21. Reconstrucción matemática de estados tras recargas.
22. Cambio dinámico de configuración de patrones.
23. Validación estricta de cartones de 75 bolas (rangos B-I-N-G-O y duplicados).
24. Validación estricta de cartones de 90 bolas (3x9, 15 números, orden ascendente).
25. Manejo seguro de archivos JSON de respaldo inválidos o corruptos.
26. Estructura y exportación de respaldos.
27. Reglas de casillas libres automáticas.
28. Prevención matemática de falsas victorias.
29. Invalidación inmediata de victorias tras deshacer una cantada errónea.
30. Reinicio de partida conservando cartones físicos de amigos.
31. Marcado manual independiente del historial del cantor.
32. Edición fluida de casillas durante la transcripción.

---

## 📲 4. INSTALACIÓN COMO PWA EN CELULARES

BINGO NEXUS cuenta con un archivo `manifest.json` y un Service Worker (`sw.js`) configurados para funcionar como una aplicación nativa en tu celular.

### En Android (Google Chrome)
1. Abre el enlace de la aplicación en Chrome.
2. Toca el menú de tres puntos (⋮) en la esquina superior derecha.
3. Selecciona **"Agregar a la pantalla principal"** o **"Instalar aplicación"**.
4. ¡Listo! Aparecerá el ícono de **Bingo Nexus** en tu menú de aplicaciones y funcionará a pantalla completa sin barra de navegación e incluso en modo avión.

### En iPhone / iPad (Safari)
1. Abre el enlace de la aplicación en Safari.
2. Toca el botón de **Compartir** (el ícono del cuadrado con la flecha hacia arriba).
3. Desplázate hacia abajo y selecciona **"Agregar al inicio"** (Add to Home Screen).
4. Asigna el nombre "Bingo Nexus" y pulsa **Agregar**.

---

## 💬 5. ENVÍO POR WHATSAPP Y DISTRIBUCIÓN OFFLINE

Para enviar la aplicación o una partida con los cartones de tus amigos por WhatsApp:
1. **Compartir Respaldo de Cartones:**
   - En la aplicación, toca el botón verde con el ícono de compartir (**Respaldo y WhatsApp**).
   - Pulsa **"Descargar Copia de Seguridad (.json)"**.
   - Envía ese archivo `.json` por cualquier chat de WhatsApp.
   - Tus amigos abren la aplicación en su celular, van al mismo botón y seleccionan **"Cargar Copia de Seguridad"** para tener exactamente los mismos cartones.
2. **Carpeta Offline Completa (.zip):**
   - El proyecto incluye la carpeta `bingo-nexus-offline/` y el archivo comprimido `bingo-nexus-offline.zip`.
   - Puedes compartir este archivo ZIP por WhatsApp o Google Drive; al descomprimirlo en cualquier computadora o celular Android, basta con abrir `index.html` para jugar sin internet.

---

## 🌐 6. DESPLIEGUE EN GITHUB Y GITHUB PAGES

El repositorio de código fuente se encuentra sincronizado con GitHub en:
- **Repositorio:** `https://github.com/thedragon8592/bingo-nexus`

Para desplegarlo en GitHub Pages de forma gratuita y que cualquiera pueda acceder desde su celular:
1. En GitHub, ingresa al repositorio `bingo-nexus`.
2. Ve a la pestaña **Settings** (Configuración) > **Pages**.
3. En la sección **Build and deployment** > **Source**, selecciona **Deploy from a branch**.
4. Elige la rama `main` y la carpeta `/dist` (o configura el workflow de GitHub Actions para Vite).
5. Tu aplicación estará disponible en: `https://thedragon8592.github.io/bingo-nexus/`.

---

## 📄 7. LICENCIA Y CRÉDITOS

- **Proyecto:** BINGO NEXUS — Asistente Móvil de Bingo Físico.
- **Autor:** thedragon8592
- **Arquitectura:** React 19 + TypeScript + Vite + Tailwind CSS + Web Audio API.
- **Licencia:** MIT. Libre para uso personal o comercial.
