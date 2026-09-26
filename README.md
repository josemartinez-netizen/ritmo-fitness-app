# Ritmo - Fitness Tracker App 🏃‍♂️📊
### Actividad Final: Diseño y Desarrollo de una Aplicación de Registro de Ejercicio Diario

**Institución:** Institución Universitaria Compensar (UCompensar)  
**Asignatura:** Diseño de Software  
**Criterio de Realización:** **CR3** (*Crea un diseño de solución de acuerdo con las metodologías vistas, que debe ser sustentado y evaluado*)  
**Despliegue en Producción (Vercel):** [https://ritmo-fitness-app.vercel.app](https://ritmo-fitness-app.vercel.app)  
**Repositorio GitHub:** [https://github.com/josemartinez-netizen/ritmo-fitness-app](https://github.com/josemartinez-netizen/ritmo-fitness-app)

---

## 🎯 Entregables de la Actividad

El proyecto integra de manera unificada los dos componentes obligatorios solicitados en la guía de la actividad:

1. **📄 Entregable 1: Informe Detallado (Sustentación Teórica y Metodológica)**
   - Documento completo disponible en [`INFORME_DISENO_UIUX_CR3.md`](./INFORME_DISENO_UIUX_CR3.md) y renderizado directamente en la aplicación web mediante la pestaña **"Informe Detallado (CR3)"**.
   - Incluye botón **"Imprimir / PDF"** con estilos `@media print` optimizados para exportación directa.
   - Contenido desarrollado con rigor académico:
     - Descripción del proyecto y objetivos (general y específicos).
     - Aplicación de los 5 principios de diseño UI (Simplicidad, Consistencia, Feedback, Jerarquía visual, Accesibilidad).
     - Estrategias para captura de datos efectiva y validación (cliente, servidor, prevención de fricción y manejo de errores).
     - Herramientas y técnicas de UI/UX (User Research, Wireframing, Prototipado interactivo, SUS).
     - Análisis de principios de usabilidad (ISO/IEC 25010 y Díaz et al., 2013).
     - Evaluación de usabilidad empírica con usuarios reales (**SUS: 89.5/100, Grado A+**).
     - Sustentación del criterio CR3 y referencias bibliográficas en formato **APA 7** (incluyendo Díaz et al., 2013 y Mejía Trejo, 2024 de la biblioteca UCompensar).

2. **📱 Entregable 2: Prototipo Funcional Interactivo**
   - Interfaz limpia, ágil y moderna, sin marcos plásticos artificiales ni simulaciones toscas:
     - **En pantallas móviles:** se ajusta de forma nativa al 100% de la pantalla del smartphone.
     - **En computadores de escritorio:** se visualiza en una tarjeta centrada con diseño responsive de alta calidad.
   - Demostración del flujo completo de punta a punta:
     - **Bienvenida y Registro** con validación interactiva.
     - **Onboarding de 3 pasos** (Metas ➔ Actividades ➔ Frecuencia).
     - **Dashboard Principal** con anillo SVG dinámico sincronizado con minutos activos y racha actual.
     - **Registro de actividad con triple estado:** formulario vacío, autocompletado rápido, estado de error guiado y modal de celebración con incremento de racha.
     - **Historial de entrenamientos** con persistencia en `localStorage`, filtros por disciplina y botón de alternancia a estado vacío (*Empty State*).
     - **Estadísticas analíticas** con switch interactivo Semana / Mes.

---

## 🚀 Despliegue en Vercel

La solución se encuentra desplegada y configurada para despliegues continuos (CI/CD):

* **URL Activa:** [https://ritmo-fitness-app.vercel.app](https://ritmo-fitness-app.vercel.app)
* **Configuración ([`vercel.json`](./vercel.json)):**
  ```json
  {
    "$schema": "https://openapi.vercel.sh/vercel.json",
    "cleanUrls": true,
    "outputDirectory": "."
  }
  ```

---

## 💻 Ejecución Local

Para probar o sustentar localmente:

```bash
# 1. Iniciar servidor local
npm start
# o
npm run dev
```

Abre en tu navegador `http://localhost:3002`.

---

## 📚 Referencias Bibliográficas Obligatorias

* **Díaz, J., Harari, I., & Amadeo, A. P. (2013).** *Guía de recomendaciones para diseño de software centrado en el usuario* (1.ª ed.). Editorial de la Universidad Nacional de La Plata.
* **Mejía Trejo, J. (2024).** *Principios de aseguramiento de calidad para el diseño de software: innovación de procesos en las tecnologías de información* (1.ª ed.). Academia Mexicana de Investigación y Docencia en Innovación (AMIDI).
