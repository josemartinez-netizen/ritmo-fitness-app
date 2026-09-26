/**
 * Ritmo Fitness Tracker App - Interactive Controller & Router
 * Faithful integration of 13 Stitch screens with full state persistence,
 * iPhone 16 Pro simulator, and Stitch visual audit drawer.
 */

// Initial default state
const DEFAULT_STATE = {
  userName: "Laura Restrepo",
  currentStreak: 6,
  dailyGoalMinutes: 45,
  activeMinutesToday: 35,
  weeklyGoalMinutes: 150,
  selectedGoal: "salud",
  selectedActivities: ["caminar", "correr", "gimnasio"],
  selectedDays: ["L", "M", "M", "J", "V"],
  reminderTime: "07:00 a. m.",
  workouts: [
    {
      id: "w-1",
      title: "Correr por el parque",
      type: "correr",
      duration: 30,
      distance: 4.2,
      calories: 315,
      intensity: "media",
      time: "6:30 p. m.",
      dateLabel: "Hoy",
      source: "Reloj"
    },
    {
      id: "w-2",
      title: "Caminar matutino",
      type: "caminar",
      duration: 25,
      distance: 2.1,
      calories: 120,
      intensity: "baja",
      time: "7:15 a. m.",
      dateLabel: "Ayer",
      source: "Manual"
    },
    {
      id: "w-3",
      title: "Entrenamiento de fuerza",
      type: "gimnasio",
      duration: 45,
      distance: null,
      calories: 280,
      intensity: "alta",
      time: "6:00 p. m.",
      dateLabel: "Hace 2 días",
      source: "Manual"
    }
  ]
};

class RitmoAppController {
  constructor() {
    this.state = this.loadState();
    this.currentScreenSlug = "screen-bienvenida";
    this.activeModalSlug = null;
    this.currentScale = 1;
    this.isFullscreen = false;

    // Registration modal draft state
    this.draftActivity = {
      type: "correr",
      duration: 0,
      distance: "",
      intensity: "moderada",
      notes: ""
    };

    this.init();
  }

  loadState() {
    try {
      const saved = localStorage.getItem("ritmo_app_state");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn("Could not load from localStorage:", e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  }

  saveState() {
    try {
      localStorage.setItem("ritmo_app_state", JSON.stringify(this.state));
    } catch (e) {
      console.warn("Could not save to localStorage:", e);
    }
    this.renderDynamicState();
  }

  resetState() {
    this.state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    this.saveState();
    this.showToast("Datos demo restablecidos correctamente", "info");
    this.navigateTo("screen-inicio");
  }

  init() {
    this.initLiveClock();
    this.initEventListeners();
    this.initSimulatorControls();
    this.initDrawer();
    this.initOnboarding();
    this.initRegistrarModals();
    this.initHistorial();
    this.initEstadisticas();
    this.renderDynamicState();

    // Start on Bienvenida
    this.navigateTo("screen-bienvenida");
  }

  // --- Live Clock & Status Bar ---
  initLiveClock() {
    const clockEl = document.getElementById("live-clock");
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      let minutes = now.getMinutes();
      minutes = minutes < 10 ? "0" + minutes : minutes;
      if (clockEl) {
        clockEl.textContent = `${hours}:${minutes}`;
      }
    };
    updateTime();
    setInterval(updateTime, 1000);
  }

  // --- Dynamic State Synchronization ---
  renderDynamicState() {
    // 1. Dynamic Island
    const islandText = document.getElementById("island-text");
    if (islandText) {
      islandText.textContent = `Ritmo ${this.state.currentStreak}d`;
    }

    // 2. Inicio screen: Streak count
    const streakElements = document.querySelectorAll("#screen-inicio .font-headline-lg, #screen-inicio h2");
    streakElements.forEach(el => {
      if (el.textContent.includes("Racha de") || el.textContent.includes("días")) {
        el.textContent = `Racha de ${this.state.currentStreak} días`;
      }
    });

    // 3. Inicio screen: Daily progress minutes
    const goalMinutesDisplays = document.querySelectorAll("#screen-inicio .font-display-lg");
    goalMinutesDisplays.forEach(el => {
      if (el.textContent.includes("/") || el.textContent.includes("35")) {
        el.innerHTML = `${this.state.activeMinutesToday}<span class="font-headline-md text-headline-md text-on-surface-variant font-medium">/${this.state.dailyGoalMinutes}</span>`;
      }
    });

    // 4. Update SVG Progress ring if available
    const progressRings = document.querySelectorAll("#screen-inicio circle.text-primary");
    progressRings.forEach(circle => {
      const radius = parseFloat(circle.getAttribute("r") || 58);
      const circumference = 2 * Math.PI * radius;
      const pct = Math.min(1, this.state.activeMinutesToday / this.state.dailyGoalMinutes);
      const offset = circumference * (1 - pct);
      circle.style.strokeDasharray = `${circumference}`;
      circle.style.strokeDashoffset = `${offset}`;
    });

    // 5. User name greeting
    const greetingEl = document.querySelector("#screen-inicio h1");
    if (greetingEl && greetingEl.textContent.includes("Hola")) {
      const firstName = this.state.userName.split(" ")[0] || "Laura";
      greetingEl.textContent = `Hola, ${firstName}`;
    }

    // 6. Actividad guardada screen sync
    const celebrationStreak = document.querySelector("#screen-actividad-guardada .text-secondary-container, #screen-actividad-guardada .font-headline-md");
    if (celebrationStreak && celebrationStreak.textContent.includes("Racha")) {
      celebrationStreak.textContent = `¡Racha de ${this.state.currentStreak} días!`;
    }
  }

  // --- Navigation Router ---
  navigateTo(slug) {
    console.log(`Navigating to screen: ${slug}`);

    // If it's a modal screen
    if (slug.startsWith("screen-registrar") || slug === "screen-actividad-guardada") {
      this.openModal(slug);
      this.updateDrawerActiveState(slug);
      return;
    }

    // Otherwise, it's a regular view
    this.closeModals();

    const screens = document.querySelectorAll(".screen-view");
    screens.forEach(s => {
      s.classList.remove("active");
    });

    const target = document.getElementById(slug);
    if (target) {
      target.classList.add("active");
      this.currentScreenSlug = slug;

      // Scroll viewport and window to top
      window.scrollTo(0, 0);
      const viewport = document.getElementById("inner-viewport");
      if (viewport) {
        viewport.scrollTop = 0;
      }

      this.syncBottomNav(slug);
      this.updateDrawerActiveState(slug);
    } else {
      console.error(`Screen not found: ${slug}`);
    }
  }

  openModal(modalSlug) {
    this.closeModals();
    const modalEl = document.getElementById(modalSlug);
    if (modalEl) {
      modalEl.classList.add("open");
      this.activeModalSlug = modalSlug;
      this.updateDrawerActiveState(modalSlug);
    }
  }

  closeModals() {
    const modals = document.querySelectorAll(".modal-overlay");
    modals.forEach(m => m.classList.remove("open"));
    this.activeModalSlug = null;
    this.updateDrawerActiveState(this.currentScreenSlug);
  }

  // --- Bottom Navigation Tab Highlighting ---
  syncBottomNav(currentSlug) {
    const navLinks = document.querySelectorAll("nav[data-active-classes] a[data-path], nav a[data-path]");
    navLinks.forEach(link => {
      const path = link.getAttribute("data-path");
      let isActive = false;

      if (path === "inicio" && currentSlug === "screen-inicio") isActive = true;
      if (path === "historial" && (currentSlug === "screen-historial-lleno" || currentSlug === "screen-historial-vacio")) isActive = true;
      if (path === "estadisticas" && currentSlug === "screen-estadisticas") isActive = true;
      if (path === "metas" && currentSlug.startsWith("screen-onboarding")) isActive = true;

      if (isActive) {
        link.classList.remove("text-on-surface-variant");
        link.classList.add("text-primary", "font-bold");
        link.setAttribute("aria-current", "page");
      } else {
        link.classList.remove("text-primary", "font-bold");
        link.classList.add("text-on-surface-variant");
        link.removeAttribute("aria-current");
      }
    });
  }

  // --- Global Event Delegation ---
  initEventListeners() {
    // Click events delegation inside the inner screen
    const viewport = document.getElementById("inner-viewport");
    if (!viewport) return;

    viewport.addEventListener("click", (e) => {
      // 1. Modal close button or backdrop click
      const closeTrigger = e.target.closest('[data-action="close-modal"], [aria-label="Cerrar"], .modal-backdrop-trigger');
      if (closeTrigger) {
        e.preventDefault();
        e.stopPropagation();
        this.closeModals();
        return;
      }

      // 2. Modal switcher pill in modal header
      const modalSwitch = e.target.closest("[data-switch-modal]");
      if (modalSwitch) {
        e.preventDefault();
        const targetModal = modalSwitch.getAttribute("data-switch-modal");
        this.openModal(targetModal);
        return;
      }

      // 3. Historial view switcher pill
      const historialSwitch = e.target.closest(".btn-toggle-historial-view");
      if (historialSwitch) {
        e.preventDefault();
        const targetHistorial = historialSwitch.getAttribute("data-target");
        this.navigateTo(targetHistorial);
        return;
      }

      // 4. Bottom Nav and Header links
      const navLink = e.target.closest("a[data-path]");
      if (navLink) {
        e.preventDefault();
        const path = navLink.getAttribute("data-path");
        this.handleNavPath(path);
        return;
      }

      // 5. FAB and Quick Register buttons
      const fabBtn = e.target.closest(".bottom-fab a, [data-path='registrar-actividad']");
      if (fabBtn) {
        e.preventDefault();
        this.openModal("screen-registrar-vacio");
        return;
      }

      // 6. Quick activity pill on Inicio (Caminar, Correr, Gimnasio, Bicicleta)
      const quickChip = e.target.closest("#screen-inicio section:nth-of-type(2) button");
      if (quickChip) {
        e.preventDefault();
        const sportText = quickChip.textContent.trim().toLowerCase();
        let sport = "correr";
        if (sportText.includes("caminar")) sport = "caminar";
        if (sportText.includes("gimnasio") || sportText.includes("fuerza")) sport = "gimnasio";
        if (sportText.includes("bici") || sportText.includes("ciclismo")) sport = "bicicleta";

        this.draftActivity.type = sport;
        this.draftActivity.duration = 30;
        this.openModal("screen-registrar-lleno");
        return;
      }

      // 7. General button actions based on context
      const btn = e.target.closest("button");
      if (btn) {
        this.handleButtonClick(btn, e);
      }
    });

    // Dynamic Island interactive click
    const dynamicIsland = document.getElementById("dynamic-island");
    if (dynamicIsland) {
      dynamicIsland.addEventListener("click", () => {
        dynamicIsland.classList.toggle("expanded");
        const islandText = document.getElementById("island-text");
        if (islandText) {
          if (dynamicIsland.classList.contains("expanded")) {
            islandText.textContent = `Laura • ${this.state.activeMinutesToday}m activos • Racha 🔥 ${this.state.currentStreak}d`;
          } else {
            islandText.textContent = `Ritmo ${this.state.currentStreak}d`;
          }
        }
      });
    }
  }

  handleNavPath(path) {
    switch (path) {
      case "inicio":
        this.navigateTo("screen-inicio");
        break;
      case "historial":
        if (this.state.workouts.length > 0) {
          this.navigateTo("screen-historial-lleno");
        } else {
          this.navigateTo("screen-historial-vacio");
        }
        break;
      case "metas":
        this.navigateTo("screen-onboarding-1");
        this.showToast("Editando tus metas de movimiento", "info");
        break;
      case "estadisticas":
        this.navigateTo("screen-estadisticas");
        break;
      case "perfil":
        this.showToast(`Perfil de ${this.state.userName} • Nivel 4 Constancia`, "info");
        break;
      case "registrar-actividad":
        this.openModal("screen-registrar-vacio");
        break;
      default:
        this.navigateTo("screen-inicio");
    }
  }

  handleButtonClick(btn, e) {
    const text = btn.textContent.trim().toLowerCase();

    // Bienvenida
    if (btn.closest("#screen-bienvenida")) {
      if (text.includes("crear cuenta")) {
        e.preventDefault();
        this.navigateTo("screen-crear-cuenta");
      } else if (text.includes("ya tengo cuenta")) {
        e.preventDefault();
        this.navigateTo("screen-inicio");
      }
      return;
    }

    // Crear cuenta
    if (btn.closest("#screen-crear-cuenta")) {
      if (btn.querySelector(".material-symbols-outlined")?.textContent === "arrow_back") {
        e.preventDefault();
        this.navigateTo("screen-bienvenida");
        return;
      }
      if (text.includes("crear cuenta") || text.includes("continuar con google")) {
        e.preventDefault();
        const nameInput = document.getElementById("reg-name");
        if (nameInput && nameInput.value.trim()) {
          this.state.userName = nameInput.value.trim();
          this.saveState();
        }
        this.showToast("¡Cuenta creada! Personalicemos tu ritmo.", "success");
        this.navigateTo("screen-onboarding-1");
        return;
      }
    }

    // Onboarding 1
    if (btn.closest("#screen-onboarding-1")) {
      if (btn.querySelector(".material-symbols-outlined")?.textContent === "arrow_back") {
        e.preventDefault();
        this.navigateTo("screen-crear-cuenta");
        return;
      }
      if (text.includes("continuar")) {
        e.preventDefault();
        this.navigateTo("screen-onboarding-2");
        return;
      }
    }

    // Onboarding 2
    if (btn.closest("#screen-onboarding-2")) {
      if (btn.querySelector(".material-symbols-outlined")?.textContent === "arrow_back") {
        e.preventDefault();
        this.navigateTo("screen-onboarding-1");
        return;
      }
      if (text.includes("continuar")) {
        e.preventDefault();
        this.navigateTo("screen-onboarding-3");
        return;
      }
    }

    // Onboarding 3
    if (btn.closest("#screen-onboarding-3")) {
      if (btn.querySelector(".material-symbols-outlined")?.textContent === "arrow_back") {
        e.preventDefault();
        this.navigateTo("screen-onboarding-2");
        return;
      }
      if (text.includes("comenzar mi ritmo") || text.includes("comenzar")) {
        e.preventDefault();
        this.showToast("¡Configuración completada! A entrenar.", "success");
        this.navigateTo("screen-inicio");
        return;
      }
    }

    // Modal: Actividad guardada (Screen 10)
    if (btn.closest("#screen-actividad-guardada")) {
      if (text.includes("volver al inicio")) {
        e.preventDefault();
        this.closeModals();
        this.navigateTo("screen-inicio");
        return;
      }
      if (text.includes("compartir") || text.includes("historial")) {
        e.preventDefault();
        this.closeModals();
        this.navigateTo("screen-historial-lleno");
        return;
      }
    }

    // Modal: Empty state registrar button in Screen 12
    if (btn.closest("#screen-historial-vacio")) {
      if (text.includes("primer entrenamiento") || text.includes("registrar")) {
        e.preventDefault();
        this.openModal("screen-registrar-vacio");
        return;
      }
    }
  }

  // --- Onboarding Logic ---
  initOnboarding() {
    // Password visibility toggle
    const toggleBtn = document.getElementById("toggle-password-btn");
    const pwdInput = document.getElementById("reg-password");
    const eyeIcon = document.getElementById("eye-icon");
    if (toggleBtn && pwdInput && eyeIcon) {
      toggleBtn.addEventListener("click", () => {
        const isPassword = pwdInput.type === "password";
        pwdInput.type = isPassword ? "text" : "password";
        eyeIcon.textContent = isPassword ? "visibility_off" : "visibility";
      });
    }

    // Onboarding 1: Goal Cards
    const goalCards = document.querySelectorAll("#screen-onboarding-1 .goal-card");
    goalCards.forEach(card => {
      card.addEventListener("click", () => {
        goalCards.forEach(c => {
          c.classList.remove("bg-surface-container-low");
          c.classList.add("bg-surface-container-lowest");
          const bar = c.querySelector(".active-indicator");
          if (bar) bar.classList.add("hidden");
          const chk = c.querySelector(".check-box");
          if (chk) {
            chk.className = "check-box w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1 bg-surface-container-highest text-transparent transition-all duration-200";
          }
        });

        card.classList.remove("bg-surface-container-lowest");
        card.classList.add("bg-surface-container-low");
        const activeBar = card.querySelector(".active-indicator");
        if (activeBar) activeBar.classList.remove("hidden");
        const activeCheck = card.querySelector(".check-box");
        if (activeCheck) {
          activeCheck.className = "check-box w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1 bg-primary text-on-primary transition-all duration-200";
        }

        const goalSlug = card.dataset.goal || "salud";
        this.state.selectedGoal = goalSlug;
        this.saveState();
      });
    });

    // Onboarding 2: Activity Cards
    const activityCards = document.querySelectorAll("#screen-onboarding-2 .activity-card");
    const counter = document.getElementById("selected-counter");
    activityCards.forEach(card => {
      card.addEventListener("click", () => {
        const isSelected = card.getAttribute("aria-pressed") === "true";
        const nextState = !isSelected;
        card.setAttribute("aria-pressed", nextState ? "true" : "false");

        const indicator = card.querySelector(".status-indicator");
        const indicatorIcon = indicator?.querySelector(".material-symbols-outlined");
        const title = card.querySelector(".font-title-md");

        if (nextState) {
          card.classList.remove("bg-surface-container-low");
          card.classList.add("bg-surface-container-lowest");
          if (indicator) {
            indicator.classList.remove("bg-surface-container-high", "text-outline");
            indicator.classList.add("bg-primary", "text-on-primary");
          }
          if (indicatorIcon) indicatorIcon.textContent = "check";
          if (title) {
            title.classList.remove("text-on-surface");
            title.classList.add("text-primary");
          }
        } else {
          card.classList.remove("bg-surface-container-lowest");
          card.classList.add("bg-surface-container-low");
          if (indicator) {
            indicator.classList.remove("bg-primary", "text-on-primary");
            indicator.classList.add("bg-surface-container-high", "text-outline");
          }
          if (indicatorIcon) indicatorIcon.textContent = "add";
          if (title) {
            title.classList.remove("text-primary");
            title.classList.add("text-on-surface");
          }
        }

        const activeCount = document.querySelectorAll('#screen-onboarding-2 .activity-card[aria-pressed="true"]').length;
        if (counter) counter.textContent = activeCount;
      });
    });

    // Onboarding 3: Days & Stepper
    let minutes = this.state.weeklyGoalMinutes || 150;
    const goalDisplay = document.querySelector("#screen-onboarding-3 #goal-minutes");
    const calcCaption = document.querySelector("#screen-onboarding-3 #calc-caption");
    const btnMinus = document.querySelector("#screen-onboarding-3 #btn-minus");
    const btnPlus = document.querySelector("#screen-onboarding-3 #btn-plus");
    const dayButtons = document.querySelectorAll("#screen-onboarding-3 .day-toggle");
    const daysCountLabel = document.querySelector("#screen-onboarding-3 #selected-days-count");

    const updateCalculations = () => {
      if (goalDisplay) goalDisplay.textContent = minutes;
      const activeDays = document.querySelectorAll('#screen-onboarding-3 .day-toggle[aria-pressed="true"]').length;
      const count = activeDays > 0 ? activeDays : 1;
      const minPerDay = Math.round(minutes / count);
      if (calcCaption) {
        calcCaption.textContent = `Aprox. ${minPerDay} minutos al día, ${count} ${count === 1 ? 'día' : 'días'} a la semana`;
      }
      if (daysCountLabel) {
        daysCountLabel.textContent = `${activeDays} ${activeDays === 1 ? 'día seleccionado' : 'días seleccionados'}`;
      }
      this.state.weeklyGoalMinutes = minutes;
    };

    if (btnMinus) {
      btnMinus.addEventListener("click", () => {
        if (minutes > 30) {
          minutes -= 15;
          updateCalculations();
        }
      });
    }

    if (btnPlus) {
      btnPlus.addEventListener("click", () => {
        if (minutes < 600) {
          minutes += 15;
          updateCalculations();
        }
      });
    }

    dayButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        const isPressed = btn.getAttribute("aria-pressed") === "true";
        if (isPressed) {
          const activeDays = document.querySelectorAll('#screen-onboarding-3 .day-toggle[aria-pressed="true"]').length;
          if (activeDays > 1) {
            btn.setAttribute("aria-pressed", "false");
            btn.classList.remove("bg-primary", "text-on-primary", "shadow-sm");
            btn.classList.add("bg-surface-container", "text-on-surface-variant");
          }
        } else {
          btn.setAttribute("aria-pressed", "true");
          btn.classList.remove("bg-surface-container", "text-on-surface-variant");
          btn.classList.add("bg-primary", "text-on-primary", "shadow-sm");
        }
        updateCalculations();
      });
    });

    // Time cycler
    const timeBtn = document.querySelector("#screen-onboarding-3 #time-selector-btn");
    const timeLabel = document.querySelector("#screen-onboarding-3 #selected-time-label");
    const times = ["06:00 a. m.", "06:30 a. m.", "07:00 a. m.", "07:30 a. m.", "08:00 a. m.", "18:00 p. m.", "19:00 p. m."];
    let timeIndex = 2;

    if (timeBtn && timeLabel) {
      timeBtn.addEventListener("click", () => {
        timeIndex = (timeIndex + 1) % times.length;
        timeLabel.textContent = times[timeIndex];
        this.state.reminderTime = times[timeIndex];
      });
    }
  }

  // --- Registration Modals (Screens 7, 8, 9, 10) ---
  initRegistrarModals() {
    // Activity chip selection in Screen 7 (Vacío)
    const vacioChips = document.querySelectorAll("#screen-registrar-vacio .activity-chip, #screen-registrar-vacio button[class*='rounded-full']");
    vacioChips.forEach(chip => {
      chip.addEventListener("click", (e) => {
        vacioChips.forEach(c => {
          c.classList.remove("bg-primary", "text-on-primary", "shadow-md");
          c.classList.add("bg-surface-container-low", "text-on-surface");
        });
        chip.classList.remove("bg-surface-container-low", "text-on-surface");
        chip.classList.add("bg-primary", "text-on-primary", "shadow-md");
      });
    });

    // Stepper in Screen 7 (Vacío)
    let vacioDuration = 0;
    const durDisplay = document.querySelector("#screen-registrar-vacio #duration-val");
    const btnMinus5 = document.querySelector("#screen-registrar-vacio #btn-minus-5");
    const btnPlus5 = document.querySelector("#screen-registrar-vacio #btn-plus-5");
    const btnPlus15 = document.querySelector("#screen-registrar-vacio #btn-plus-15");

    const updateVacioDuration = (delta) => {
      vacioDuration = Math.max(0, vacioDuration + delta);
      this.draftActivity.duration = vacioDuration;

      if (durDisplay) {
        if (vacioDuration === 0) {
          durDisplay.innerHTML = '<span class="text-on-surface-variant/40">--</span> <span class="text-label-md font-medium text-on-surface-variant/50">min</span>';
          if (btnMinus5) {
            btnMinus5.disabled = true;
            btnMinus5.classList.add("opacity-40", "cursor-not-allowed");
          }
        } else {
          durDisplay.innerHTML = `${vacioDuration} <span class="text-headline-md font-medium text-on-surface-variant">min</span>`;
          if (btnMinus5) {
            btnMinus5.disabled = false;
            btnMinus5.classList.remove("opacity-40", "cursor-not-allowed");
          }
        }
      }
    };

    if (btnMinus5) btnMinus5.addEventListener("click", () => updateVacioDuration(-5));
    if (btnPlus5) btnPlus5.addEventListener("click", () => updateVacioDuration(5));
    if (btnPlus15) btnPlus15.addEventListener("click", () => updateVacioDuration(15));

    // Submit in Screen 7 (Vacío)
    const allVacioButtons = document.querySelectorAll("#screen-registrar-vacio button");
    allVacioButtons.forEach(btn => {
      if (btn.textContent.includes("Guardar actividad")) {
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          if (vacioDuration <= 0) {
            // Validation Error -> Switch to Screen 9!
            this.showToast("La duración es obligatoria (mínimo 5 min)", "error");
            this.openModal("screen-registrar-error");
            const errCard = document.querySelector("#screen-registrar-error #duration-section");
            if (errCard) {
              errCard.classList.add("shake-error");
              setTimeout(() => errCard.classList.remove("shake-error"), 500);
            }
          } else {
            this.saveWorkoutAndCelebrate({
              title: "Trote al aire libre",
              type: "correr",
              duration: vacioDuration,
              distance: 3.5,
              calories: Math.round(vacioDuration * 9.2)
            });
          }
        });
      }
    });

    // Submit in Screen 8 (Lleno)
    const llenoButtons = document.querySelectorAll("#screen-registrar-lleno button");
    llenoButtons.forEach(btn => {
      if (btn.textContent.includes("Guardar actividad")) {
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          this.saveWorkoutAndCelebrate({
            title: "Trote al aire libre",
            type: "correr",
            duration: 35,
            distance: 4.8,
            calories: 310
          });
        });
      }
    });

    // Stepper in Screen 9 (Error)
    const errorMinusBtn = document.querySelector("#screen-registrar-error #btn-minus");
    const errorInput = document.querySelector("#screen-registrar-error #duration-input");
    if (errorInput) {
      errorInput.addEventListener("input", (e) => {
        const val = parseInt(e.target.value) || 0;
        if (val > 0) {
          // If valid duration entered, user can switch to full or submit!
        }
      });
    }

    const errorButtons = document.querySelectorAll("#screen-registrar-error button");
    errorButtons.forEach(btn => {
      if (btn.textContent.includes("Guardar actividad")) {
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          const val = parseInt(errorInput?.value || 0);
          if (val <= 0) {
            this.showToast("Ingresa la duración para guardar tu entrenamiento", "error");
            const errCard = document.querySelector("#screen-registrar-error #duration-section");
            if (errCard) {
              errCard.classList.add("shake-error");
              setTimeout(() => errCard.classList.remove("shake-error"), 500);
            }
          } else {
            this.saveWorkoutAndCelebrate({
              title: "Entrenamiento completado",
              type: "correr",
              duration: val,
              distance: 3.0,
              calories: Math.round(val * 8.5)
            });
          }
        });
      }
    });
  }

  saveWorkoutAndCelebrate({ title, type, duration, distance, calories }) {
    // 1. Create workout item
    const newWorkout = {
      id: "w-" + Date.now(),
      title: title || "Actividad registrada",
      type: type || "correr",
      duration: duration || 35,
      distance: distance || 4.8,
      calories: calories || 310,
      intensity: "moderada",
      time: "Ahora mismo",
      dateLabel: "Hoy",
      source: "Manual"
    };

    // 2. Update state
    this.state.workouts.unshift(newWorkout);
    this.state.activeMinutesToday += newWorkout.duration;
    this.state.currentStreak += 1;
    this.saveState();

    // 3. Update Actividad Guardada (Screen 10) details
    const summaryCard = document.querySelector("#screen-actividad-guardada h2, #screen-actividad-guardada h3");
    if (summaryCard) {
      summaryCard.textContent = newWorkout.title;
    }

    const durationMetric = document.querySelector("#screen-actividad-guardada [class*='font-display-lg']");
    if (durationMetric) {
      durationMetric.innerHTML = `${this.state.activeMinutesToday}<span class="font-headline-md text-headline-md text-on-surface-variant font-medium">/${this.state.dailyGoalMinutes}</span>`;
    }

    // 4. Open celebration modal (Screen 10)
    this.openModal("screen-actividad-guardada");
    this.showToast("¡Actividad registrada y racha ampliada!", "success");

    // 5. Update Dynamic Island to pulse celebration
    const dynamicIsland = document.getElementById("dynamic-island");
    if (dynamicIsland) {
      dynamicIsland.classList.add("ring-2", "ring-emerald-400");
      setTimeout(() => dynamicIsland.classList.remove("ring-2", "ring-emerald-400"), 2500);
    }
  }

  // --- Historial Dynamic Filtering & Swipe Actions ---
  initHistorial() {
    // Filter chips in Screen 11
    const filterChips = document.querySelectorAll("#screen-historial-lleno button[class*='rounded-full']");
    const articles = document.querySelectorAll("#screen-historial-lleno article");

    filterChips.forEach(chip => {
      chip.addEventListener("click", () => {
        filterChips.forEach(c => {
          c.classList.remove("bg-primary", "text-on-primary");
          c.classList.add("bg-surface-container-lowest", "text-on-surface-variant");
          const checkIcon = c.querySelector(".material-symbols-outlined");
          if (checkIcon && checkIcon.textContent === "check") {
            // Restore icon if needed
          }
        });

        chip.classList.remove("bg-surface-container-lowest", "text-on-surface-variant");
        chip.classList.add("bg-primary", "text-on-primary");

        const filterName = chip.textContent.trim().toLowerCase();
        articles.forEach(art => {
          if (filterName.includes("todas")) {
            art.parentElement.style.display = "flex";
          } else if (filterName.includes("correr") && art.textContent.toLowerCase().includes("correr")) {
            art.parentElement.style.display = "flex";
          } else if (filterName.includes("caminar") && art.textContent.toLowerCase().includes("caminar")) {
            art.parentElement.style.display = "flex";
          } else {
            art.parentElement.style.display = "none";
          }
        });
      });
    });

    // Delete buttons on swipe rows
    const deleteBtns = document.querySelectorAll("#screen-historial-lleno button[aria-label='Eliminar actividad']");
    deleteBtns.forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const row = btn.closest("section");
        if (row) {
          row.style.transition = "all 0.3s ease";
          row.style.opacity = "0";
          row.style.transform = "translateX(50px)";
          setTimeout(() => {
            row.remove();
            this.showToast("Actividad eliminada", "info");
            const remaining = document.querySelectorAll("#screen-historial-lleno article").length;
            if (remaining === 0) {
              this.navigateTo("screen-historial-vacio");
            }
          }, 300);
        }
      });
    });
  }

  // --- Estadísticas Tabs (Semana vs Mes) ---
  initEstadisticas() {
    const tabSemana = document.getElementById("tab-semana");
    const tabMes = document.getElementById("tab-mes");

    const minutesCard = document.querySelector("#screen-estadisticas .grid > div:nth-child(1) .font-display-lg");
    const sessionsCard = document.querySelector("#screen-estadisticas .grid > div:nth-child(2) .font-display-lg");
    const caloriesCard = document.querySelector("#screen-estadisticas .grid > div:nth-child(3) .font-display-lg");
    const dateRangePill = document.querySelector("#screen-estadisticas .inline-flex span:nth-child(2)");

    if (tabSemana && tabMes) {
      tabSemana.addEventListener("click", () => {
        tabSemana.className = "px-5 py-2 rounded-full font-label-md text-label-md bg-surface-container-lowest text-primary shadow-sm transition-all focus:outline-none min-h-[44px] flex items-center";
        tabMes.className = "px-5 py-2 rounded-full font-label-md text-label-md text-on-surface-variant transition-all hover:text-on-surface focus:outline-none min-h-[44px] flex items-center";

        if (minutesCard) minutesCard.innerHTML = '185 <span class="font-label-md text-label-md text-on-surface-variant">min</span>';
        if (sessionsCard) sessionsCard.textContent = "6";
        if (caloriesCard) caloriesCard.innerHTML = '1.420 <span class="font-label-md text-label-md text-on-surface-variant">kcal</span>';
        if (dateRangePill) dateRangePill.textContent = "14 sep - 20 sep, 2025";
        this.showToast("Estadísticas: Vista Semanal", "info");
      });

      tabMes.addEventListener("click", () => {
        tabMes.className = "px-5 py-2 rounded-full font-label-md text-label-md bg-surface-container-lowest text-primary shadow-sm transition-all focus:outline-none min-h-[44px] flex items-center";
        tabSemana.className = "px-5 py-2 rounded-full font-label-md text-label-md text-on-surface-variant transition-all hover:text-on-surface focus:outline-none min-h-[44px] flex items-center";

        if (minutesCard) minutesCard.innerHTML = '780 <span class="font-label-md text-label-md text-on-surface-variant">min</span>';
        if (sessionsCard) sessionsCard.textContent = "24";
        if (caloriesCard) caloriesCard.innerHTML = '6.240 <span class="font-label-md text-label-md text-on-surface-variant">kcal</span>';
        if (dateRangePill) dateRangePill.textContent = "Septiembre 2025";
        this.showToast("Estadísticas: Vista Mensual", "info");
      });
    }
  }

  // --- Academic & Deliverable Navigation Controls ---
  initSimulatorControls() {
    const tabPrototipo = document.getElementById("tab-prototipo-btn");
    const tabInforme = document.getElementById("tab-informe-btn");
    const viewPrototipo = document.getElementById("view-prototipo");
    const viewInforme = document.getElementById("view-informe");
    const printBtn = document.getElementById("print-report-btn");
    const resetDemoBtn = document.getElementById("reset-demo-btn");

    const showPrototipo = () => {
      viewPrototipo?.classList.remove("hidden");
      viewInforme?.classList.add("hidden");

      tabPrototipo?.classList.remove("text-slate-300", "hover:bg-white/10");
      tabPrototipo?.classList.add("bg-primary", "text-white", "font-semibold", "shadow-sm");

      tabInforme?.classList.remove("bg-primary", "text-white", "font-semibold", "shadow-sm");
      tabInforme?.classList.add("text-slate-300", "hover:bg-white/10");
      
      if (window.location.hash !== "#prototipo") {
        history.replaceState(null, null, "#prototipo");
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const showInforme = () => {
      viewPrototipo?.classList.add("hidden");
      viewInforme?.classList.remove("hidden");

      tabInforme?.classList.remove("text-slate-300", "hover:bg-white/10");
      tabInforme?.classList.add("bg-primary", "text-white", "font-semibold", "shadow-sm");

      tabPrototipo?.classList.remove("bg-primary", "text-white", "font-semibold", "shadow-sm");
      tabPrototipo?.classList.add("text-slate-300", "hover:bg-white/10");

      if (window.location.hash !== "#informe") {
        history.replaceState(null, null, "#informe");
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    tabPrototipo?.addEventListener("click", showPrototipo);
    tabInforme?.addEventListener("click", showInforme);

    // Auto-open informe if URL has #informe
    if (window.location.hash === "#informe" || window.location.hash === "#report") {
      showInforme();
    }

    // Print or Export to PDF
    printBtn?.addEventListener("click", () => {
      showInforme();
      setTimeout(() => {
        window.print();
      }, 200);
    });

    // Reset Demo Data
    resetDemoBtn?.addEventListener("click", () => {
      if (confirm("¿Deseas restablecer todos los datos demo a su estado inicial?")) {
        this.resetState();
      }
    });
  }

  // --- Stitch Screen Audit Drawer ---
  initDrawer() {
    const drawer = document.getElementById("stitch-drawer");
    const openBtn = document.getElementById("open-drawer-btn");
    const floatingBtn = document.getElementById("floating-drawer-btn");
    const closeBtn = document.getElementById("close-drawer-btn");

    const openDrawer = () => drawer?.classList.add("open");
    const closeDrawer = () => drawer?.classList.remove("open");

    openBtn?.addEventListener("click", openDrawer);
    floatingBtn?.addEventListener("click", openDrawer);
    closeBtn?.addEventListener("click", closeDrawer);

    // Jump to screen from drawer
    const cards = document.querySelectorAll(".stitch-card[data-jump-screen]");
    cards.forEach(card => {
      card.addEventListener("click", () => {
        const slug = card.getAttribute("data-jump-screen");
        this.navigateTo(slug);
        closeDrawer();
        this.showToast(`Visualizando Stitch Screen: ${slug}`, "info");
      });
    });

    // Drawer Search Filter
    const searchInput = document.getElementById("drawer-search-input");
    searchInput?.addEventListener("input", (e) => {
      const q = e.target.value.toLowerCase().trim();
      cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(q) ? "flex" : "none";
      });
    });

    // Drawer Category Filter Chips
    const filterChips = document.querySelectorAll(".drawer-filter-chip");
    filterChips.forEach(chip => {
      chip.addEventListener("click", () => {
        filterChips.forEach(c => {
          c.classList.remove("bg-primary", "text-white");
          c.classList.add("bg-white/5", "text-slate-300");
        });
        chip.classList.remove("bg-white/5", "text-slate-300");
        chip.classList.add("bg-primary", "text-white");

        const category = chip.getAttribute("data-filter");
        cards.forEach(card => {
          if (category === "all") {
            card.style.display = "flex";
          } else {
            const cardCategory = card.querySelector("span[class*='text-[11px]']")?.textContent.trim();
            card.style.display = (cardCategory === category) ? "flex" : "none";
          }
        });
      });
    });
  }

  updateDrawerActiveState(activeSlug) {
    const cards = document.querySelectorAll(".stitch-card");
    cards.forEach(card => {
      const slug = card.getAttribute("data-jump-screen");
      if (slug === activeSlug) {
        card.classList.add("active-screen-indicator");
      } else {
        card.classList.remove("active-screen-indicator");
      }
    });
  }

  // --- Toast Notifications ---
  showToast(message, type = "info") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    let bg = "bg-slate-900 border-white/20 text-white";
    let icon = "info";

    if (type === "success") {
      bg = "bg-emerald-950 border-emerald-500/40 text-emerald-200";
      icon = "check_circle";
    } else if (type === "error") {
      bg = "bg-rose-950 border-rose-500/40 text-rose-200";
      icon = "error";
    }

    toast.className = `flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border shadow-2xl backdrop-blur-xl text-xs font-semibold pointer-events-auto transition-all duration-300 transform translate-y-[-20px] opacity-0 ${bg}`;
    toast.innerHTML = `
      <span class="material-symbols-outlined text-[18px]">${icon}</span>
      <span>${message}</span>
    `;

    container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.remove("translate-y-[-20px]", "opacity-0");
      toast.classList.add("translate-y-0", "opacity-100");
    });

    setTimeout(() => {
      toast.classList.remove("translate-y-0", "opacity-100");
      toast.classList.add("translate-y-[-20px]", "opacity-0");
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }
}

// Global initialization
window.RitmoApp = null;
document.addEventListener("DOMContentLoaded", () => {
  window.RitmoApp = new RitmoAppController();
});
