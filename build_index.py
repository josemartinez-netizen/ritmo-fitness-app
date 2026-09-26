#!/usr/bin/env python3
"""
Build script to assemble index.html for Ritmo Fitness Tracker App
Integrating all 13 Stitch screens faithfully with full interactivity,
iPhone 16 Pro simulator, and Stitch screen audit drawer.
"""

import os
import re
import json

SCREENS = [
    {
        "num": 1,
        "id": "7c6ee910873c42c39a4c7b9358fa869e",
        "slug": "screen-bienvenida",
        "title": "Ritmo - Bienvenida",
        "category": "Onboarding",
        "type": "view",
        "desc": "Pantalla de bienvenida con hero shot, racha de 5 días y CTAs iniciales."
    },
    {
        "num": 2,
        "id": "b897d19e14064d3e91d85f0fadaa6269",
        "slug": "screen-crear-cuenta",
        "title": "Ritmo - Crear cuenta",
        "category": "Onboarding",
        "type": "view",
        "desc": "Formulario de registro con Google SSO, validaciones y requisitos de seguridad."
    },
    {
        "num": 3,
        "id": "5ccc7d8b6e86466b97b263caeb2854fe",
        "slug": "screen-onboarding-1",
        "title": "Ritmo - Onboarding (1 de 3: Metas)",
        "category": "Onboarding",
        "type": "view",
        "desc": "Selección de objetivos (Salud, Bajar peso, Constancia, Resistencia, etc.)."
    },
    {
        "num": 4,
        "id": "c8b07ec9302c4f82aff5b4f3e88a9613",
        "slug": "screen-onboarding-2",
        "title": "Ritmo - Onboarding (2 de 3: Actividades)",
        "category": "Onboarding",
        "type": "view",
        "desc": "Selección múltiple de deportes favoritos con contador dinámico."
    },
    {
        "num": 5,
        "id": "23168ad11d4247acb8d263afce104e89",
        "slug": "screen-onboarding-3",
        "title": "Ritmo - Onboarding (3 de 3: Días/Frecuencia)",
        "category": "Onboarding",
        "type": "view",
        "desc": "Configuración de días activos, minutos semanales y recordatorio diario."
    },
    {
        "num": 6,
        "id": "49108ab4b6e64d0d91b593606d424c36",
        "slug": "screen-inicio",
        "title": "Ritmo - Inicio / Dashboard",
        "category": "Principal",
        "type": "view",
        "desc": "Pantalla principal con saludo a Laura, racha de 6 días, anillo diario y registro rápido."
    },
    {
        "num": 7,
        "id": "ae74d1d2c2e9429d8e47ed18a4b3ada9",
        "slug": "screen-registrar-vacio",
        "title": "Ritmo - Registrar actividad (Vacío)",
        "category": "Registro",
        "type": "modal",
        "desc": "Modal inferior vacío con chips de deporte, stepper en blanco y selector de intensidad."
    },
    {
        "num": 8,
        "id": "2344d5b113554c54a9aabfaf96d044a8",
        "slug": "screen-registrar-lleno",
        "title": "Ritmo - Registrar actividad (Lleno)",
        "category": "Registro",
        "type": "modal",
        "desc": "Modal inferior con datos válidos completos (Correr, 35 min, 4.8 km, Moderada)."
    },
    {
        "num": 9,
        "id": "00f50381806f4723b9e1db1268110ed3",
        "slug": "screen-registrar-error",
        "title": "Ritmo - Registrar actividad (Error de validación)",
        "category": "Registro",
        "type": "modal",
        "desc": "Modal inferior mostrando error en rojo al intentar guardar con duración vacía/0."
    },
    {
        "num": 10,
        "id": "2b3abeabe9d8472d848ea8ec559e113b",
        "slug": "screen-actividad-guardada",
        "title": "Ritmo - Actividad guardada (Modal Éxito)",
        "category": "Registro",
        "type": "modal",
        "desc": "Modal de celebración con confeti animado, 100% en anillo diario y racha incrementada."
    },
    {
        "num": 11,
        "id": "0e43c81ce8f341328caefbbc9151a316",
        "slug": "screen-historial-lleno",
        "title": "Ritmo - Historial (Con entrenamientos)",
        "category": "Historial",
        "type": "view",
        "desc": "Historial completo con filtros por deporte, resumen semanal y acciones swipe."
    },
    {
        "num": 12,
        "id": "594c7d822f6945cbb6cc86ba7293ad72",
        "slug": "screen-historial-vacio",
        "title": "Ritmo - Historial (Vacío / Empty State)",
        "category": "Historial",
        "type": "view",
        "desc": "Estado vacío con ilustración de zapatilla deportiva, ondas de ritmo y CTA motivacional."
    },
    {
        "num": 13,
        "id": "a66d031400ad4fb9ac52774819c5b9f6",
        "slug": "screen-estadisticas",
        "title": "Ritmo - Estadísticas (Semana / Mes)",
        "category": "Estadísticas",
        "type": "view",
        "desc": "Panel de estadísticas con switch Semana/Mes, gráfico de barras, área y medallas."
    }
]

def clean_body_html(html_str, slug):
    bm = re.search(r'<body[^>]*>(.*?)</body>', html_str, re.DOTALL)
    if not bm:
        return html_str
    body = bm.group(1).strip()
    
    # Remove inline script tags as app.js orchestrates full interactivity
    body = re.sub(r'<script[^>]*>.*?</script>', '', body, flags=re.DOTALL)
    
    # Replace history.back() with data-action="close-modal"
    body = re.sub(r'onclick=[\"\']history\.back\(\)[\"\']', 'data-action="close-modal"', body)
    
    # Replace profile image links with local fallback if desired
    body = re.sub(
        r'src="https://lh3\.googleusercontent\.com/aida-public/AB6AXuDweCFkfciscuocRq2s-ve5B91hY2[^"]*"',
        'src="public/assets/avatar.png" onerror="this.src=\'https://lh3.googleusercontent.com/aida-public/AB6AXuDweCFkfciscuocRq2s-ve5B91hY2hW18Si9GkGaEvU2Mzj3-Pdn87zQ4wtJdVAxu9V9zMaZUkZ4BGk1oMvm0RZk9PtDCfY-bSCA-o99_I9t-hJRqhruAMQs6iR4hFwRRy8RWF8o7WNW1bHyteBecyO62dtyNL_vY1SCwwoHeIXnGEk4JqeecTH9I3zIbvXtS3VR5xua2MmifGd5CB8FB-YDOQ6D0b9Vm6SW-k_XJskZkj9U62uNOD8\'"',
        body
    )
    
    # In Historial screens, inject an audit toggle bar right below header
    if slug == "screen-historial-lleno":
        historial_audit_bar = """
        <div class="stitch-audit-pill flex items-center justify-between px-3 py-1.5 bg-surface-container/80 rounded-xl mb-3 border border-outline-variant/30 text-xs">
          <span class="font-medium text-on-surface-variant flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Auditoría Stitch:
          </span>
          <div class="flex items-center gap-1 bg-surface-container-high/60 p-0.5 rounded-lg">
            <button class="btn-toggle-historial-view px-2.5 py-1 rounded-md bg-primary text-on-primary font-semibold text-[11px] shadow-sm" data-target="screen-historial-lleno">#11 Con datos</button>
            <button class="btn-toggle-historial-view px-2.5 py-1 rounded-md text-on-surface-variant hover:text-on-surface text-[11px]" data-target="screen-historial-vacio">#12 Vacío</button>
          </div>
        </div>
        """
        body = body.replace('<div class="flex flex-col gap-space-lg">', historial_audit_bar + '<div class="flex flex-col gap-space-lg">')
        
    elif slug == "screen-historial-vacio":
        historial_audit_bar = """
        <div class="stitch-audit-pill flex items-center justify-between px-3 py-1.5 bg-surface-container/80 rounded-xl mb-3 border border-outline-variant/30 text-xs">
          <span class="font-medium text-on-surface-variant flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Auditoría Stitch:
          </span>
          <div class="flex items-center gap-1 bg-surface-container-high/60 p-0.5 rounded-lg">
            <button class="btn-toggle-historial-view px-2.5 py-1 rounded-md text-on-surface-variant hover:text-on-surface text-[11px]" data-target="screen-historial-lleno">#11 Con datos</button>
            <button class="btn-toggle-historial-view px-2.5 py-1 rounded-md bg-primary text-on-primary font-semibold text-[11px] shadow-sm" data-target="screen-historial-vacio">#12 Vacío</button>
          </div>
        </div>
        """
        body = body.replace('<div class="flex flex-col items-center justify-center text-center mt-6', historial_audit_bar + '<div class="flex flex-col items-center justify-center text-center mt-6')

    # In modal registration screens, inject a quick state switch pill bar
    if slug in ["screen-registrar-vacio", "screen-registrar-lleno", "screen-registrar-error"]:
        active_7 = "bg-primary text-white font-semibold" if slug == "screen-registrar-vacio" else "text-on-surface-variant hover:bg-surface-container-high"
        active_8 = "bg-primary text-white font-semibold" if slug == "screen-registrar-lleno" else "text-on-surface-variant hover:bg-surface-container-high"
        active_9 = "bg-error text-white font-semibold" if slug == "screen-registrar-error" else "text-error hover:bg-error-container/40"
        
        modal_audit_bar = f"""
        <div class="w-full flex items-center justify-center pb-2 px-gutter">
          <div class="inline-flex items-center gap-1 bg-surface-container/80 backdrop-blur-sm p-1 rounded-full border border-outline-variant/30 text-[11px]">
            <span class="px-2 text-on-surface-variant font-medium">Stitch:</span>
            <button class="modal-switch-btn px-2.5 py-1 rounded-full transition-all {active_7}" data-switch-modal="screen-registrar-vacio">#7 Vacío</button>
            <button class="modal-switch-btn px-2.5 py-1 rounded-full transition-all {active_8}" data-switch-modal="screen-registrar-lleno">#8 Lleno</button>
            <button class="modal-switch-btn px-2.5 py-1 rounded-full transition-all {active_9}" data-switch-modal="screen-registrar-error">#9 Error</button>
          </div>
        </div>
        """
        # Insert right after the title row
        body = re.sub(r'(<h2[^>]*>Registrar actividad</h2>.*?</div>)', r'\1' + modal_audit_bar, body, count=1, flags=re.DOTALL)

    return body

def build_index():
    screens_html_list = []
    
    for s in SCREENS:
        filepath = f"stitch_raw/html/{s['id']}.html"
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
        
        cleaned = clean_body_html(content, s["slug"])
        
        if s["type"] == "modal":
            # Wrap as a bottom sheet modal overlay
            screen_markup = f"""
    <!-- SCREEN {s['num']}: {s['title']} ({s['id']}) -->
    <div id="{s['slug']}" class="modal-overlay screen-modal" data-screen-id="{s['id']}" data-screen-num="{s['num']}">
      <div class="modal-backdrop-trigger absolute inset-0 z-0 cursor-pointer" data-action="close-modal" title="Cerrar modal"></div>
      <div class="relative z-10 w-full flex flex-col justify-end min-h-full pointer-events-none">
        <div class="pointer-events-auto w-full bottom-sheet-content">
          {cleaned}
        </div>
      </div>
    </div>
"""
        else:
            # Wrap as a view
            active_class = "active" if s["num"] == 1 else ""
            screen_markup = f"""
    <!-- SCREEN {s['num']}: {s['title']} ({s['id']}) -->
    <section id="{s['slug']}" class="screen-view {active_class}" data-screen-id="{s['id']}" data-screen-num="{s['num']}">
      {cleaned}
    </section>
"""
        screens_html_list.append(screen_markup)

    screens_combined = "\n".join(screens_html_list)

    # Build drawer screen items
    drawer_items = []
    for s in SCREENS:
        drawer_items.append(f"""
        <div class="stitch-card p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/50 cursor-pointer flex gap-3 transition-all duration-200" data-jump-screen="{s['slug']}">
          <div class="w-16 h-24 rounded-xl overflow-hidden bg-black/40 border border-white/10 shrink-0 relative group">
            <img src="public/screenshots/{s['id']}.png" alt="{s['title']}" class="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105" loading="lazy" />
            <span class="absolute top-1 left-1 bg-black/80 text-white font-mono text-[10px] px-1.5 py-0.5 rounded">#{s['num']}</span>
          </div>
          <div class="flex flex-col justify-between flex-1 min-w-0">
            <div>
              <div class="flex items-center justify-between gap-1 mb-1">
                <span class="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/20 text-primary-fixed">{s['category']}</span>
                <span class="text-[10px] text-slate-400 font-mono" title="{s['id']}">{s['id'][:8]}...</span>
              </div>
              <h4 class="text-sm font-semibold text-white leading-tight truncate">{s['title'].replace('Ritmo - ', '')}</h4>
              <p class="text-[12px] text-slate-400 line-clamp-2 mt-1 leading-snug">{s['desc']}</p>
            </div>
            <button class="mt-2 text-xs font-medium text-primary hover:text-primary-fixed flex items-center gap-1">
              <span>Abrir pantalla</span>
              <span class="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </div>
        </div>
""")
    drawer_html = "\n".join(drawer_items)

    html_template = f"""<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
  <title>Ritmo Fitness Tracker - Prototipo Funcional (13 Pantallas Stitch)</title>
  
  <!-- Fonts & Material Symbols -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap" rel="stylesheet" />
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0" rel="stylesheet" />
  
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script id="tailwind-config">
    tailwind.config = {{
      darkMode: "class",
      theme: {{
        extend: {{
          colors: {{
            "primary": "#006b2c",
            "primary-container": "#00873a",
            "on-primary": "#ffffff",
            "on-primary-container": "#f7fff2",
            "primary-fixed": "#7ffc97",
            "primary-fixed-dim": "#62df7d",
            "on-primary-fixed": "#002109",
            "on-primary-fixed-variant": "#005320",
            "inverse-primary": "#62df7d",
            
            "secondary": "#9d4300",
            "secondary-container": "#fd761a",
            "on-secondary": "#ffffff",
            "on-secondary-container": "#5c2400",
            "secondary-fixed": "#ffdbca",
            "secondary-fixed-dim": "#ffb690",
            "on-secondary-fixed": "#341100",
            "on-secondary-fixed-variant": "#783200",
            
            "tertiary": "#4f5d71",
            "tertiary-container": "#67758b",
            "on-tertiary": "#ffffff",
            "on-tertiary-container": "#fdfcff",
            "tertiary-fixed": "#d5e3fc",
            "tertiary-fixed-dim": "#b9c7df",
            "on-tertiary-fixed": "#0d1c2e",
            "on-tertiary-fixed-variant": "#3a485b",
            
            "surface": "#faf8ff",
            "surface-bright": "#faf8ff",
            "surface-dim": "#d2d9f4",
            "surface-variant": "#dae2fd",
            "surface-tint": "#006e2d",
            "surface-container-lowest": "#ffffff",
            "surface-container-low": "#f2f3ff",
            "surface-container": "#eaedff",
            "surface-container-high": "#e2e7ff",
            "surface-container-highest": "#dae2fd",
            "inverse-surface": "#283044",
            "inverse-on-surface": "#eef0ff",
            
            "background": "#faf8ff",
            "on-background": "#131b2e",
            "on-surface": "#131b2e",
            "on-surface-variant": "#3e4a3d",
            
            "outline": "#6e7b6c",
            "outline-variant": "#bdcaba",
            
            "error": "#ba1a1a",
            "error-container": "#ffdad6",
            "on-error": "#ffffff",
            "on-error-container": "#93000a"
          }},
          borderRadius: {{
            "DEFAULT": "0.25rem",
            "lg": "0.5rem",
            "xl": "0.75rem",
            "full": "9999px"
          }},
          spacing: {{
            "margin": "1rem",
            "gutter": "1rem",
            "space-xs": "0.25rem",
            "space-sm": "0.5rem",
            "space-md": "1rem",
            "space-lg": "1.5rem",
            "space-xl": "2rem"
          }},
          fontFamily: {{
            "headline-lg": ["Inter", "sans-serif"],
            "headline-md": ["Inter", "sans-serif"],
            "title-md": ["Inter", "sans-serif"],
            "body-lg": ["Inter", "sans-serif"],
            "body-md": ["Inter", "sans-serif"],
            "label-md": ["Inter", "sans-serif"],
            "label-sm": ["Inter", "sans-serif"],
            "caption": ["Inter", "sans-serif"],
            "display-lg": ["Inter", "sans-serif"]
          }},
          fontSize: {{
            "display-lg": ["32px", {{ "lineHeight": "40px", "letterSpacing": "-0.02em", "fontWeight": "700" }}],
            "headline-lg": ["24px", {{ "lineHeight": "32px", "letterSpacing": "-0.015em", "fontWeight": "600" }}],
            "headline-md": ["20px", {{ "lineHeight": "28px", "letterSpacing": "-0.01em", "fontWeight": "600" }}],
            "title-md": ["18px", {{ "lineHeight": "24px", "fontWeight": "600" }}],
            "body-lg": ["16px", {{ "lineHeight": "24px", "fontWeight": "500" }}],
            "body-md": ["16px", {{ "lineHeight": "24px", "fontWeight": "400" }}],
            "label-md": ["14px", {{ "lineHeight": "20px", "letterSpacing": "0.01em", "fontWeight": "500" }}],
            "label-sm": ["14px", {{ "lineHeight": "20px", "fontWeight": "400" }}],
            "caption": ["12px", {{ "lineHeight": "16px", "letterSpacing": "0.02em", "fontWeight": "500" }}]
          }}
        }}
      }}
    }};
  </script>

  <!-- Custom Stylesheet -->
  <link rel="stylesheet" href="app.css" />
</head>

<body class="bg-slate-950 text-slate-100 flex flex-col items-center justify-start min-h-screen relative p-2 sm:p-6 overflow-x-hidden">

  <!-- Desktop Top Control Bar -->
  <header class="simulator-header-bar w-full max-w-5xl mx-auto mb-4 flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 backdrop-blur-xl border border-white/10 px-4 py-3 rounded-2xl shadow-xl z-30">
    <div class="flex items-center gap-3">
      <div class="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/30">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" class="w-6 h-6">
          <circle cx="50" cy="50" r="46" fill="#16A34A" />
          <path d="M26 52 L38 52 L44 32 L54 68 L62 46 L68 52 L74 52" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none" />
        </svg>
      </div>
      <div>
        <div class="flex items-center gap-2">
          <h1 class="text-base font-bold text-white tracking-tight">Ritmo Fitness App</h1>
          <span class="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">13 Pantallas Stitch</span>
        </div>
        <p class="text-xs text-slate-400 hidden sm:block">Simulador iPhone 16 Pro • Material Design 3 / Tailwind</p>
      </div>
    </div>

    <!-- Simulator Quick Actions -->
    <div class="flex items-center gap-2">
      <!-- Zoom selector -->
      <div class="flex items-center bg-slate-800/80 rounded-xl p-1 border border-white/10 text-xs">
        <button id="zoom-80" class="px-2.5 py-1 rounded-lg hover:bg-white/10 transition-colors text-slate-300" title="Escala 80%">80%</button>
        <button id="zoom-90" class="px-2.5 py-1 rounded-lg hover:bg-white/10 transition-colors text-slate-300" title="Escala 90%">90%</button>
        <button id="zoom-100" class="px-2.5 py-1 rounded-lg bg-primary text-white font-semibold shadow-sm" title="Escala 100%">100%</button>
      </div>

      <!-- Fullscreen Toggle -->
      <button id="toggle-fullscreen-btn" class="h-9 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 text-xs font-semibold flex items-center gap-1.5 text-slate-200 transition-all active:scale-95" title="Alternar entre simulación móvil y pantalla completa">
        <span class="material-symbols-outlined text-[16px]">fullscreen</span>
        <span class="hidden md:inline">Pantalla Completa</span>
      </button>

      <!-- Reset Demo Data -->
      <button id="reset-demo-btn" class="h-9 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 text-xs font-semibold flex items-center gap-1.5 text-slate-200 transition-all active:scale-95" title="Restablecer datos demo en localStorage">
        <span class="material-symbols-outlined text-[16px]">restart_alt</span>
        <span class="hidden md:inline">Reiniciar</span>
      </button>

      <!-- Stitch Screen Selector Drawer Button -->
      <button id="open-drawer-btn" class="h-9 px-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-emerald-900/30 transition-all active:scale-95">
        <span class="material-symbols-outlined text-[18px]">layers</span>
        <span>Auditoría Stitch (13)</span>
      </button>
    </div>
  </header>

  <!-- iPhone 16 Pro Device Frame Wrapper -->
  <main class="device-wrapper my-auto flex justify-center items-center">
    <div id="phone-container" class="phone-mockup">
      
      <!-- Phone Bezel & Reflection Highlights -->
      <div class="phone-bezel-layer pointer-events-none absolute inset-0 rounded-[50px] border border-white/10 z-50"></div>

      <!-- Dynamic Island (Hardware sensor + Camera + Interactive Pill) -->
      <div id="dynamic-island" class="dynamic-island" title="Dynamic Island - Toca para expandir">
        <div class="sensor-dot"></div>
        <div id="island-content" class="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 opacity-90 truncate px-1">
          <span class="material-symbols-outlined text-[14px] text-emerald-400">ecg_heart</span>
          <span id="island-text" class="tracking-tight">Ritmo 6d</span>
        </div>
        <div class="camera-lens"></div>
      </div>

      <!-- Live Mobile Status Bar -->
      <div class="phone-status-bar text-slate-900 dark:text-slate-900">
        <span id="live-clock" class="font-bold">9:41</span>
        <div class="flex items-center gap-1.5">
          <span class="material-symbols-outlined text-[15px]">signal_cellular_4_bar</span>
          <span class="material-symbols-outlined text-[15px]">wifi</span>
          <div class="flex items-center gap-0.5">
            <span class="text-[11px] font-bold">98%</span>
            <span class="material-symbols-outlined text-[16px] text-primary">battery_full</span>
          </div>
        </div>
      </div>

      <!-- Inner Mobile Screen Viewport (Scrollable container for all 13 screens) -->
      <div id="inner-viewport" class="phone-inner-screen no-scrollbar">
        
{screens_combined}

      </div>

      <!-- iOS Home Indicator Pill -->
      <div class="home-indicator"></div>
    </div>
  </main>

  <!-- Floating Button to Open Stitch Audit Drawer (Always visible on mobile/desktop) -->
  <aside class="fixed bottom-5 right-5 z-40">
    <button id="floating-drawer-btn" class="h-12 px-4 rounded-full bg-slate-900/90 hover:bg-slate-800 text-white border border-white/20 shadow-2xl backdrop-blur-xl flex items-center gap-2.5 active:scale-95 transition-all" title="Ver catálogo de las 13 pantallas Stitch">
      <span class="relative flex h-3 w-3">
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span class="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
      </span>
      <span class="font-semibold text-xs tracking-tight">13 Pantallas Stitch</span>
      <span class="material-symbols-outlined text-[18px]">menu_open</span>
    </button>
  </aside>

  <!-- Stitch Screens Visual Audit Drawer -->
  <div id="stitch-drawer" class="stitch-drawer">
    <!-- Drawer Header -->
    <div class="p-4 border-b border-white/10 flex items-center justify-between bg-slate-900/60">
      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-lg bg-primary/20 text-primary-fixed flex items-center justify-center">
          <span class="material-symbols-outlined text-[20px]">layers</span>
        </div>
        <div>
          <h3 class="text-sm font-bold text-white">Explorador de Pantallas</h3>
          <p class="text-[11px] text-slate-400">13 pantallas de Stitch integradas</p>
        </div>
      </div>
      <button id="close-drawer-btn" class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 transition-colors">
        <span class="material-symbols-outlined text-[18px]">close</span>
      </button>
    </div>

    <!-- Filter chips in Drawer -->
    <div class="p-3 border-b border-white/10 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
      <button class="drawer-filter-chip px-3 py-1.5 rounded-full bg-primary text-white font-medium" data-filter="all">Todas (13)</button>
      <button class="drawer-filter-chip px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 font-medium" data-filter="Onboarding">Onboarding (5)</button>
      <button class="drawer-filter-chip px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 font-medium" data-filter="Principal">Principal (1)</button>
      <button class="drawer-filter-chip px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 font-medium" data-filter="Registro">Registro (4)</button>
      <button class="drawer-filter-chip px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 font-medium" data-filter="Historial">Historial (2)</button>
      <button class="drawer-filter-chip px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 font-medium" data-filter="Estadísticas">Estadísticas (1)</button>
    </div>

    <!-- Search Input in Drawer -->
    <div class="p-3 border-b border-white/10">
      <div class="relative flex items-center">
        <span class="material-symbols-outlined absolute left-3 text-[18px] text-slate-400 pointer-events-none">search</span>
        <input id="drawer-search-input" type="text" placeholder="Filtrar por nombre o ID..." class="w-full h-9 pl-9 pr-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-primary transition-colors" />
      </div>
    </div>

    <!-- Drawer Screen List -->
    <div id="drawer-screen-list" class="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
{drawer_html}
    </div>

    <!-- Drawer Footer -->
    <div class="p-3 border-t border-white/10 bg-slate-900/60 text-center">
      <p class="text-[11px] text-slate-400">
        Proyecto Stitch: <span class="font-mono text-emerald-400">2695682084981177594</span>
      </p>
    </div>
  </div>

  <!-- Toast Notification Container -->
  <div id="toast-container" class="fixed top-6 left-1/2 -translate-x-1/2 z-[2000] pointer-events-none flex flex-col gap-2"></div>

  <!-- Main JavaScript Application Logic -->
  <script src="app.js"></script>
</body>
</html>
"""

    with open("index.html", "w", encoding="utf-8") as f:
        f.write(html_template)
    
    print(f"Successfully re-built index.html ({len(html_template)} characters, 13 screens integrated).")

if __name__ == "__main__":
    build_index()
