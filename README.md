# Ritmo - Fitness Tracker App 🏃‍♂️📊

Prototipo interactivo y funcional de alta fidelidad para **Ritmo Fitness Tracker App**, diseñado e integrado fielmente a partir de las 13 pantallas del proyecto Google Stitch (`2695682084981177594`) utilizando **Material Design 3**, **Tailwind CSS tokens** y arquitectura reactiva moderna en JavaScript.

---

## 📱 Características Principales

1. **Simulador Móvil Avanzado (iPhone 16 Pro):**
   - Marco de teléfono con Dynamic Island y barra de estado en vivo (reloj dinámico, señal WiFi, batería).
   - Botón para alternar instantáneamente entre **Modo Simulación de Smartphone** y **Pantalla Completa Responsiva**.
   - Controles de zoom (75%, 100%, 125%) y reinicio de datos demo.

2. **Auditoría Visual de Pantallas (Drawer Lateral):**
   - Acceso con un clic a cualquiera de las **13 pantallas originales de Stitch** para revisión de diseño y flujos.

3. **Flujo de Usuario 100% Interactivo:**
   - **Onboarding Completo:** Bienvenida ➔ Registro ➔ Definición de metas ➔ Selección de disciplinas ➔ Frecuencia semanal.
   - **Dashboard Principal (Inicio):** Visualización de rachas, anillo de progreso dinámico, métricas del día y tarjetas de actividad reciente.
   - **Registro de Actividad con Manejo de Estados:**
     - Pantalla de formulario vacío.
     - Pantalla de formulario completado (soporta botón "Autocompletar" o ingreso manual).
     - Validación en tiempo real (muestra pantalla/modal de error cuando faltan campos requeridos).
     - Modal de celebración ("¡Actividad guardada!") con incremento de racha.
   - **Historial de Entrenamientos:**
     - Modo dinámico con persistencia en `localStorage`.
     - Alternador directo entre vista con datos y vista vacía (Empty State).
     - Filtros interactivos por disciplina (Todos, Correr, Caminar, Gimnasio).
   - **Estadísticas y Analítica:**
     - Selector interactivo **Semana / Mes** con actualización de gráficas de barras y desglose de métricas.

---

## 🚀 Despliegue en Vercel

Este proyecto está configurado para desplegarse automáticamente en **Vercel** como un sitio estático de ultra-rápida carga y cero dependencias de servidor:

### Opción 1: Despliegue directo desde GitHub (Recomendado)
1. Conecta este repositorio en tu dashboard de [Vercel](https://vercel.com/new).
2. Deja la configuración por defecto (Framework Preset: *Other*, Root Directory: `./`).
3. Haz clic en **Deploy**. ¡Listo en menos de 10 segundos!

### Opción 2: Despliegue mediante Vercel CLI
```bash
npx vercel
```

---

## 💻 Ejecución Local

Para probarlo localmente en tu navegador:

```bash
# 1. Instalar dependencias locales (opcional para el servidor de desarrollo)
npm install

# 2. Iniciar servidor local
npm start
# o
npm run dev
```

Abre tu navegador en `http://localhost:3002`.

---

## 📂 Estructura del Proyecto

```text
├── index.html              # Estructura SPA con las 13 pantallas integradas
├── app.js                  # Controlador de navegación, estado, persistencia y eventos
├── app.css                 # Estilos complementarios, tokens de diseño e interactividad
├── vercel.json             # Configuración de despliegue para Vercel
├── package.json            # Metadatos del proyecto y scripts
├── public/
│   ├── assets/             # Logos y avatares
│   └── screenshots/        # Miniaturas de las 13 pantallas para el selector
└── stitch_raw/             # Diseños fuente y manifiesto de pantallas Stitch
```

---

## 🎨 Paleta de Color y Tokens (Ritmo Theme)

- **Primary:** `#006b2c` (Verde atlético)
- **Primary Container:** `#00873a`
- **Secondary:** `#9d4300` (Naranja enérgico)
- **Secondary Container:** `#fd761a`
- **Surface / Background:** `#faf8ff`
- **Surface Container High:** `#e2e7ff`
- **Error:** `#ba1a1a`
- **Tipografía:** Inter (Google Fonts) y Material Symbols Rounded
