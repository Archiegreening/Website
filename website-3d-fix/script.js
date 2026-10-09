const visitCountElements = document.querySelectorAll("[data-visit-count]");
const themeButtons = document.querySelectorAll("[data-theme-toggle]");
const commandForms = document.querySelectorAll("[data-command-form]");
const themeStorageKey = "bengal-studios-theme";
const fontStorageKey = "bengal-studios-font";
const rainbowStorageKey = "bengal-studios-rainbow";
const availableFonts = [
  { name: "Arial", stack: "Arial, sans-serif" },
  { name: "Georgia", stack: "Georgia, serif" },
  { name: "Trebuchet MS", stack: '"Trebuchet MS", sans-serif' },
  { name: "Verdana", stack: "Verdana, sans-serif" },
  { name: "Tahoma", stack: "Tahoma, sans-serif" },
  { name: "Courier New", stack: '"Courier New", monospace' },
  { name: "Palatino Linotype", stack: '"Palatino Linotype", serif' },
  { name: "Impact", stack: "Impact, sans-serif" },
  { name: "Lucida Console", stack: '"Lucida Console", monospace' },
  { name: "Lucida Sans Unicode", stack: '"Lucida Sans Unicode", sans-serif' },
  { name: "Garamond", stack: "Garamond, serif" },
  { name: "Bookman Old Style", stack: '"Bookman Old Style", serif' },
  { name: "Arial Black", stack: '"Arial Black", sans-serif' },
  { name: "Comic Sans MS", stack: '"Comic Sans MS", sans-serif' },
  { name: "Segoe UI", stack: '"Segoe UI", sans-serif' },
  { name: "Franklin Gothic Medium", stack: '"Franklin Gothic Medium", sans-serif' },
  { name: "system-ui", stack: "system-ui, sans-serif" }
];

const applySiteFont = (font) => {
  document.documentElement.style.setProperty("--sans", font.stack);
  document.documentElement.style.setProperty("--mono", font.stack);
};

const resetSiteFont = () => {
  document.documentElement.style.removeProperty("--sans");
  document.documentElement.style.removeProperty("--mono");
};

const rainbowOverlay = document.createElement("div");
rainbowOverlay.className = "rainbow-overlay";
rainbowOverlay.setAttribute("aria-hidden", "true");
if (document.documentElement.dataset.rainbow === "true") {
  document.body.append(rainbowOverlay);
}

const setRainbowMode = (enabled) => {
  if (enabled) {
    document.documentElement.dataset.rainbow = "true";
    if (!rainbowOverlay.isConnected) document.body.append(rainbowOverlay);
    return;
  }

  delete document.documentElement.dataset.rainbow;
  rainbowOverlay.remove();
};

try {
  const savedFont = localStorage.getItem(fontStorageKey);
  const matchingFont = availableFonts.find((font) => font.stack === savedFont);
  if (matchingFont) applySiteFont(matchingFont);
  setRainbowMode(localStorage.getItem(rainbowStorageKey) === "true");
} catch (error) {
  console.error("Unable to restore the saved Bengal Studios appearance.", error);
}

const applyTheme = (theme) => {
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "light" ? "#f5f6f1" : "#111514");

  themeButtons.forEach((button) => {
    const lightTheme = theme === "light";
    button.setAttribute("aria-pressed", String(lightTheme));
    button.setAttribute("aria-label", `Switch to ${lightTheme ? "dark" : "light"} theme`);
    const icon = button.querySelector('[aria-hidden="true"]');
    const label = button.querySelector(".theme-label");
    if (icon) icon.textContent = lightTheme ? "☾" : "☼";
    if (label) label.textContent = lightTheme ? "Dark" : "Light";
  });
};

try {
  const storedTheme = localStorage.getItem(themeStorageKey);
  applyTheme(storedTheme === "light" ? "light" : "dark");
} catch (error) {
  console.error("Unable to restore the saved Bengal Studios theme.", error);
}

themeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const theme = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    applyTheme(theme);
    try {
      localStorage.setItem(themeStorageKey, theme);
      button.removeAttribute("title");
    } catch (error) {
      console.error("Unable to save the Bengal Studios theme preference.", error);
      button.title = "This theme choice will not be saved because browser storage is unavailable.";
    }
  });
});

commandForms.forEach((form) => {
  const input = form.querySelector("[data-command-input]");
  const status = form.querySelector("[data-command-status]");
  let statusTimer;

  const showStatus = (message, type) => {
    status.textContent = message;
    status.dataset.status = type;
    status.classList.add("is-visible");
    window.clearTimeout(statusTimer);
    statusTimer = window.setTimeout(() => {
      status.classList.remove("is-visible");
    }, 5000);
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const command = input.value.trim().toLowerCase();

    if (!["font", "colour", "reset"].includes(command)) {
      showStatus(command ? `Unknown command: ${command}. Try "font", "colour", or "reset".` : 'Enter a command, such as "font".', "error");
      input.focus();
      return;
    }

    input.value = "";

    if (command === "font") {
      const currentFont = document.documentElement.style.getPropertyValue("--sans").trim();
      const fontsToChooseFrom = availableFonts.filter((font) => font.stack !== currentFont);
      const font = fontsToChooseFrom[Math.floor(Math.random() * fontsToChooseFrom.length)];
      applySiteFont(font);

      try {
        localStorage.setItem(fontStorageKey, font.stack);
        showStatus(`Font changed to ${font.name}.`, "success");
      } catch (error) {
        console.error("Unable to save the Bengal Studios font preference.", error);
        showStatus(`Font changed to ${font.name}; the choice could not be saved.`, "error");
      }
    } else if (command === "colour") {
      setRainbowMode(true);

      try {
        localStorage.setItem(rainbowStorageKey, "true");
        showStatus("Rainbow colours activated!", "success");
      } catch (error) {
        console.error("Unable to save the Bengal Studios colour preference.", error);
        showStatus("Rainbow colours activated, but the choice could not be saved.", "error");
      }
    } else {
      resetSiteFont();
      setRainbowMode(false);

      try {
        localStorage.removeItem(fontStorageKey);
        localStorage.setItem(rainbowStorageKey, "false");
        showStatus("Font and colours reset to default. Theme and visit count are unchanged.", "success");
      } catch (error) {
        console.error("Unable to save the reset Bengal Studios appearance.", error);
        showStatus("Font and colours reset for this page, but the reset could not be saved.", "error");
      }
    }
  });
});

if (visitCountElements.length > 0) {
  try {
    const countStorageKey = "bengal-studios-visit-count";
    let visitCount = Number.parseInt(localStorage.getItem(countStorageKey) || "0", 10);

    if (!Number.isSafeInteger(visitCount) || visitCount < 0 || visitCount === Number.MAX_SAFE_INTEGER) {
      throw new Error("The saved Bengal Studios visit count is invalid.");
    }

    visitCount += 1;
    localStorage.setItem(countStorageKey, String(visitCount));

    visitCountElements.forEach((element) => {
      element.textContent = String(visitCount);
    });
  } catch (error) {
    console.error("Unable to update the Bengal Studios visit count.", error);
    visitCountElements.forEach((element) => {
      element.textContent = "Unavailable";
      const counter = element.closest(".visit-counter");
      if (counter) counter.title = "Visits cannot be counted because browser storage is unavailable.";
    });
  }
}

document.querySelectorAll("[data-model-viewer]").forEach((viewer) => {
  const glbModel = viewer.querySelector("[data-glb-viewer]");
  if (glbModel) {
    const resetOrbit = glbModel.getAttribute("camera-orbit") || "0deg 75deg 100%";
    const status = viewer.querySelector("[data-model-status]");
    let dragging = false;
    let startX = 0;
    let startY = 0;
    let startOrbit;

    const setOrbit = (theta, phi, radius) => {
      const boundedPhi = Math.max(0.15, Math.min(Math.PI - 0.15, phi));
      glbModel.cameraOrbit = `${theta}rad ${boundedPhi}rad ${radius}m`;
    };

    const stopDragging = (event) => {
      if (!dragging) return;
      dragging = false;
      viewer.classList.remove("is-dragging");
      if (viewer.hasPointerCapture(event.pointerId)) viewer.releasePointerCapture(event.pointerId);
    };

    glbModel.addEventListener("load", () => {
      // This GLB has no authored materials, so tint its default material to keep the geometry legible.
      glbModel.model.materials.forEach((material) => {
        material.pbrMetallicRoughness.setBaseColorFactor([0.38, 0.65, 0.58, 1]);
        material.pbrMetallicRoughness.setRoughnessFactor(0.82);
      });
      if (status) status.hidden = true;
    });
    const showModelError = () => {
      if (status) {
        status.textContent = "The 3D model could not be loaded. Please refresh the page to try again.";
        status.hidden = false;
      }
    };
    glbModel.addEventListener("error", showModelError);

    const modelSource = glbModel.dataset.modelSrc;
    const embeddedSource = glbModel.dataset.modelEmbed;
    if (!customElements.get("model-viewer")) {
      showModelError();
    } else if (window.location.protocol === "file:" && embeddedSource) {
      // Browsers block fetching .glb files from disk, so load the embedded copy and hand it over as a blob URL.
      const embedScript = document.createElement("script");
      embedScript.src = embeddedSource;
      embedScript.addEventListener("load", () => {
        const base64 = window.bengalEmbeddedModels?.[modelSource];
        if (!base64) {
          showModelError();
          return;
        }
        const bytes = Uint8Array.from(atob(base64), (character) => character.charCodeAt(0));
        glbModel.src = URL.createObjectURL(new Blob([bytes], { type: "model/gltf-binary" }));
      });
      embedScript.addEventListener("error", showModelError);
      document.head.append(embedScript);
    } else if (modelSource) {
      glbModel.src = modelSource;
    }

    viewer.addEventListener("pointerdown", (event) => {
      if (event.button !== 2) return;
      event.preventDefault();
      dragging = true;
      startX = event.clientX;
      startY = event.clientY;
      startOrbit = glbModel.getCameraOrbit();
      viewer.classList.add("is-dragging");
      viewer.setPointerCapture(event.pointerId);
    });

    viewer.addEventListener("pointermove", (event) => {
      if (!dragging) return;
      setOrbit(
        startOrbit.theta - (event.clientX - startX) * 0.01,
        startOrbit.phi + (event.clientY - startY) * 0.008,
        startOrbit.radius,
      );
    });

    viewer.addEventListener("pointerup", stopDragging);
    viewer.addEventListener("pointercancel", stopDragging);
    viewer.addEventListener("lostpointercapture", stopDragging);
    viewer.addEventListener("contextmenu", (event) => event.preventDefault());

    viewer.addEventListener("keydown", (event) => {
      if (event.key === "Home") {
        event.preventDefault();
        glbModel.cameraOrbit = resetOrbit;
        return;
      }
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      const orbit = glbModel.getCameraOrbit();
      setOrbit(orbit.theta + (event.key === "ArrowLeft" ? -1 : 1) * Math.PI / 12, orbit.phi, orbit.radius);
    });

    viewer.closest("section").querySelectorAll("[data-rotate]").forEach((button) => {
      button.addEventListener("click", () => {
        const orbit = glbModel.getCameraOrbit();
        setOrbit(orbit.theta + Number(button.dataset.rotate) * Math.PI / 12, orbit.phi, orbit.radius);
      });
    });

    viewer.closest("section").querySelector("[data-reset-viewer]")?.addEventListener("click", () => {
      glbModel.cameraOrbit = resetOrbit;
    });

    return;
  }

  const image = viewer.querySelector(".model-image");
  let rotation = 0;
  let startX = 0;
  let startY = 0;
  let dragRotation = 0;
  let dragTilt = 0;
  let dragging = false;

  const render = () => {
    image.style.setProperty("--turn", `${rotation + dragRotation}deg`);
    image.style.setProperty("--tilt-x", `${dragTilt}deg`);
  };

  const stopDragging = (event) => {
    if (!dragging) return;
    dragging = false;
    rotation += dragRotation;
    dragRotation = 0;
    dragTilt = 0;
    viewer.classList.remove("is-dragging");
    if (viewer.hasPointerCapture(event.pointerId)) viewer.releasePointerCapture(event.pointerId);
    render();
  };

  viewer.addEventListener("pointerdown", (event) => {
    if (event.button !== 2) return;
    event.preventDefault();
    dragging = true;
    startX = event.clientX;
    startY = event.clientY;
    dragRotation = 0;
    viewer.classList.add("is-dragging");
    viewer.setPointerCapture(event.pointerId);
  });

  viewer.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    dragRotation = (event.clientX - startX) * 0.45;
    dragTilt = Math.max(-8, Math.min(8, (event.clientY - startY) * -0.08));
    render();
  });

  viewer.addEventListener("pointerup", stopDragging);
  viewer.addEventListener("pointercancel", stopDragging);
  viewer.addEventListener("lostpointercapture", stopDragging);
  viewer.addEventListener("contextmenu", (event) => event.preventDefault());

  viewer.addEventListener("keydown", (event) => {
    if (event.key === "Home") {
      event.preventDefault();
      rotation = 0;
      dragRotation = 0;
      dragTilt = 0;
      render();
      return;
    }
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    rotation += event.key === "ArrowLeft" ? -15 : 15;
    render();
  });

  viewer.closest("section").querySelectorAll("[data-rotate]").forEach((button) => {
    button.addEventListener("click", () => {
      rotation += Number(button.dataset.rotate) * 15;
      render();
    });
  });

  viewer.closest("section").querySelector("[data-reset-viewer]")?.addEventListener("click", () => {
    rotation = 0;
    dragRotation = 0;
    dragTilt = 0;
    render();
  });
});

const projectSections = document.querySelectorAll("[data-project]");
const projectLinks = document.querySelectorAll(".project-pagination a");

if ("IntersectionObserver" in window && projectSections.length > 0 && projectLinks.length > 0) {
  const updateActiveProject = () => {
    const viewportMiddle = window.innerHeight / 2;
    const hasVisibleProject = [...projectSections].some((section) => {
      const rectangle = section.getBoundingClientRect();
      return rectangle.top < window.innerHeight && rectangle.bottom > 0;
    });
    document.querySelector(".project-pagination").classList.toggle("is-visible", hasVisibleProject);
    const currentProject = [...projectSections].reduce((nearest, section) => {
      const rectangle = section.getBoundingClientRect();
      const distance = Math.abs(rectangle.top + rectangle.height / 2 - viewportMiddle);
      if (!nearest || distance < nearest.distance) return { section, distance };
      return nearest;
    }, null)?.section;

    if (!currentProject) return;
    projectLinks.forEach((link) => {
      if (link.hash === `#${currentProject.id}`) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  const projectObserver = new IntersectionObserver(updateActiveProject, { threshold: [0, 0.5, 1] });
  projectSections.forEach((section) => projectObserver.observe(section));
  window.addEventListener("scroll", updateActiveProject, { passive: true });
  window.addEventListener("hashchange", updateActiveProject);
  updateActiveProject();
}
