let ColorThief = null;

// Dynamically load ColorThief
async function loadColorThief() {
  try {
    const module = await import(
      "https://cdnjs.cloudflare.com/ajax/libs/color-thief/2.4.0/color-thief.umd.js"
    );
    ColorThief = module.default || module.ColorThief; // Handle UMD module format
    console.log("ColorThief loaded successfully");
  } catch (err) {
    console.error("Failed to load ColorThief:", err);
    ColorThief = null;
    // Fallback to Generate Mode
    currentMode = "generate";
    generatePalette();
  }
}

// Load ColorThief when the script runs
loadColorThief();

// Scroll Animations
const animateOnScroll = () => {
  const elements = document.querySelectorAll(".animate-on-scroll");
  elements.forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.top <= window.innerHeight * 0.8) {
      el.classList.add("visible");
    }
  });
};
window.addEventListener("scroll", animateOnScroll);
window.addEventListener("load", animateOnScroll);

// Sidebar Toggle with Outside Click to Close
const previewButton = document.getElementById("previewButton");
const previewSection = document.getElementById("previewSection");
const closePreview = document.getElementById("closePreview");

function toggleSidebar() {
  const isHidden = previewSection.classList.contains("sidebar-hidden");
  if (isHidden) {
    previewSection.classList.remove("sidebar-hidden");
    updatePreview();
    document.addEventListener("click", handleOutsideClick);
  } else {
    previewSection.classList.add("sidebar-hidden");
    document.removeEventListener("click", handleOutsideClick);
  }
}

function handleOutsideClick(event) {
  const isClickInsideSidebar = previewSection.contains(event.target);
  const isClickOnPreviewButton = previewButton.contains(event.target);
  if (!isClickInsideSidebar && !isClickOnPreviewButton) {
    previewSection.classList.add("sidebar-hidden");
    document.removeEventListener("click", handleOutsideClick);
  }
}

previewButton.addEventListener("click", toggleSidebar);
closePreview.addEventListener("click", toggleSidebar);

// Color Generation Logic
function generateRandomColor() {
  const hue = Math.random() * 360;
  const saturation = 60 + Math.random() * 20;
  const lightness = 50 + Math.random() * 20;
  return {
    hsl: `hsl(${Math.round(hue)}, ${Math.round(saturation)}%, ${Math.round(
      lightness
    )}%)`,
    hue,
    saturation,
    lightness,
  };
}

function generateHarmonizedPalette() {
  const base = generateRandomColor();
  const hues = [
    base.hue, // Base color
    (base.hue + 30) % 360, // Analogous
    (base.hue + 150) % 360, // Complementary
    (base.hue + 60) % 360, // Analogous
    base.hue, // Monochromatic variation
  ];
  return hues.map((h, i) => {
    const s = i === 4 ? base.saturation * 0.8 : base.saturation; // Slightly desaturate last
    const l = i === 4 ? Math.max(30, base.lightness * 0.9) : base.lightness; // Darker last
    return `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`;
  });
}

function hslToHex(h, s, l) {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

function hslToRgb(h, s, l) {
  s /= 100;
  l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) =>
    Math.round(255 * (l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1))));
  return `${f(0)}, ${f(8)}, ${f(4)}`;
}

function rgbToHsl(r, g, b) {
  (r /= 255), (g /= 255), (b /= 255);
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h,
    s,
    l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return [h * 360, s, l];
}

// Palette Management
let palette = [];
let currentMode = "generate";
const paletteViewer = document.getElementById("paletteViewer");
const swatchContainer = document.getElementById("swatchContainer");
let lockedIndices = new Set();
let currentFormat = "hex";
let isImageProcessed = false;

function updateButtonVisibility() {
  const generateButton = document.getElementById("generatePalette");
  const previewButtonContainer = document.getElementById(
    "previewButtonContainer"
  );

  if (currentMode === "image") {
    generateButton.style.display = "none";
    previewButtonContainer.style.display = isImageProcessed ? "block" : "none";
  } else {
    generateButton.style.display = "block";
    previewButtonContainer.style.display = "block";
  }
}

function generatePalette() {
  let newPalette;
  if (currentMode === "generate") {
    newPalette = generateHarmonizedPalette();
  } else if (currentMode === "image" && uploadedImage) {
    return;
  } else {
    newPalette = generateHarmonizedPalette(); // Fallback
  }

  // Always populate palette with new colors, preserving locked swatches
  if (palette.length === 0) {
    palette = newPalette; // If palette is empty, directly assign new colors
  } else {
    palette = palette.map((color, index) => {
      if (lockedIndices.has(index)) {
        return color; // Keep locked swatch unchanged
      }
      return newPalette[index];
    });
  }

  paletteViewer.style.display = "flex"; // Show palette viewer
  console.log("Generated palette:", palette); // Debug log
  renderPalette();
  savePalette();
  updatePreview();
  updateButtonVisibility(); // Update button visibility

  // Fallback visibility check
  if (palette.length > 0) {
    paletteViewer.style.display = "flex";
  } else {
    console.warn(
      "Palette is still empty after generation. Generating a default palette."
    );
    palette = generateHarmonizedPalette();
    paletteViewer.style.display = "flex";
    renderPalette();
  }
}

function renderPalette() {
  swatchContainer.innerHTML = "";
  palette.forEach((color, index) => {
    try {
      const hslMatch = color.match(/hsl\((\d+), (\d+)%, (\d+)%\)/);
      if (!hslMatch) {
        console.warn(
          `Invalid color format at index ${index}: ${color}. Using fallback color.`
        );
        color = "hsl(0, 50%, 50%)"; // Fallback to a default red color
      }
      const h = parseInt(hslMatch[1]);
      const s = parseInt(hslMatch[2]);
      const l = parseInt(hslMatch[3]);
      const hex = hslToHex(h, s, l);
      const rgb = hslToRgb(h, s, l);
      const value =
        currentFormat === "hex"
          ? hex
          : currentFormat === "rgb"
          ? `rgb(${rgb})`
          : color;
      const swatch = document.createElement("div");
      swatch.className =
        "swatch glass flex flex-col items-center w-1/5 p-2 sm:p-3 rounded-lg";
      swatch.innerHTML = `
            <div class="w-full h-32 sm:h-36 rounded" style="background-color: ${color}"></div>
            <p id="colorValue${index}" class="mt-2 font-mono text-xs">${value}</p>
            <div class="flex gap-1 mt-2">
                <button class="copyBtn glass bg-gray-200/20 hover:bg-gray-200/40 p-1 rounded" data-value="${value}">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                </button>
                <div class="group relative">
                    <button class="lockBtn glass p-1 rounded ${
                      lockedIndices.has(index)
                        ? "bg-blue-500/80 text-white"
                        : "bg-gray-200/20 hover:bg-gray-200/40"
                    }" data-index="${index}">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            ${
                              lockedIndices.has(index)
                                ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0-1.1-.9-2-2-2s-2 .9-2 2v3h4v-3zm7 3v7H5v-7h14zm0-2H5c-1.1 0-2 .9-2 2v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7c0-1.1-.9-2-2-2zm-7-7V4c0-1.1-.9-2-2-2s-2 .9-2 2v2h4z" />'
                                : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0-1.1-.9-2-2-2s-2 .9-2 2v3h4v-3zm7 3v7H5v-7h14zm0-2H5c-1.1 0-2 .9-2 2v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7c0-1.1-.9-2-2-2zm-7-7V4c0-1.1-.9-2-2-2s-2 .9-2 2v2h4z" />'
                            }
                        </svg>
                    </button>
                    <span class="tooltip">${
                      lockedIndices.has(index) ? "Unlock Color" : "Lock Color"
                    }</span>
                </div>
            </div>
            <input type="range" min="20" max="80" value="${l}" class="brightnessSlider w-full mt-2" data-index="${index}">
        `;
      swatchContainer.appendChild(swatch);
    } catch (err) {
      console.error(`Error rendering swatch at index ${index}:`, err);
    }
  });
  // Copy Value
  document.querySelectorAll(".copyBtn").forEach((btn) => {
    btn.removeEventListener("click", btn._copyHandler);
    btn._copyHandler = () => {
      copyToClipboard(
        btn.dataset.value,
        `Copied ${btn.dataset.value} to clipboard!`,
        "Failed to copy. Please copy manually."
      );
    };
    btn.addEventListener("click", btn._copyHandler);
  });

  // Lock Toggle (Multiple swatches can be locked)
  document.querySelectorAll(".lockBtn").forEach((btn) => {
    btn.removeEventListener("click", btn._lockHandler);
    btn._lockHandler = () => {
      const index = parseInt(btn.dataset.index);
      if (lockedIndices.has(index)) {
        lockedIndices.delete(index); // Unlock
      } else {
        lockedIndices.add(index); // Lock
      }
      renderPalette();
      savePalette();
    };
    btn.addEventListener("click", btn._lockHandler);
  });

  // Brightness Slider
  document.querySelectorAll(".brightnessSlider").forEach((slider) => {
    slider.removeEventListener("input", slider._brightnessHandler);
    slider._brightnessHandler = () => {
      const index = parseInt(slider.dataset.index);
      const hsl = palette[index].match(/hsl\((\d+), (\d+)%, (\d+)%\)/);
      palette[index] = `hsl(${hsl[1]}, ${hsl[2]}%, ${slider.value}%)`;
      renderPalette();
      updatePreview();
    };
    slider.addEventListener("input", slider._brightnessHandler);
  });
}

// Notification Function
function showNotification(message) {
  const notification = document.getElementById("notification");
  notification.textContent = message;
  notification.classList.add("show");
  setTimeout(() => {
    notification.classList.remove("show");
  }, 2000);
}

// Copy to Clipboard with Fallback
function copyToClipboard(text, successMessage, errorMessage) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        showNotification(successMessage);
      })
      .catch((err) => {
        console.error("Clipboard API failed: ", err);
        fallbackCopy(text, successMessage, errorMessage);
      });
  } else {
    fallbackCopy(text, successMessage, errorMessage);
  }
}

function fallbackCopy(text, successMessage, errorMessage) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  textArea.style.opacity = "0";
  document.body.appendChild(textArea);
  textArea.select();
  try {
    const successful = document.execCommand("copy");
    if (successful) {
      showNotification(successMessage);
    } else {
      throw new Error("execCommand failed");
    }
  } catch (err) {
    console.error("Fallback copy failed: ", err);
    showNotification(errorMessage);
  } finally {
    document.body.removeChild(textArea);
  }
}

// Color Format Toggle
const colorFormatSelect = document.getElementById("colorFormat");
const copyPaletteBtn = document.getElementById("copyPalette");
colorFormatSelect.addEventListener("change", () => {
  currentFormat = colorFormatSelect.value;
  copyPaletteBtn.textContent = `Copy All ${currentFormat.toUpperCase()}`;
  renderPalette();
});

// Image Color Extraction with ColorThief
let uploadedImage = null;
const toggleGenerateBtn = document.getElementById("toggleGenerate");
const toggleImageUploadBtn = document.getElementById("toggleImageUpload");
const imageUploadSection = document.getElementById("imageUploadSection");

toggleImageUploadBtn.addEventListener("click", () => {
  imageUploadSection.classList.toggle("hidden");
  currentMode = "image";
  isImageProcessed = false; // Reset image processed state
  toggleGenerateBtn.classList.remove("mode-active");
  toggleGenerateBtn.classList.add("mode-inactive");
  toggleImageUploadBtn.classList.add("mode-active");
  toggleImageUploadBtn.classList.remove("mode-inactive");
  paletteViewer.style.display = "none"; // Hide swatches until image is processed
  updateButtonVisibility(); // Update button visibility
});

toggleGenerateBtn.addEventListener("click", () => {
  currentMode = "generate";
  isImageProcessed = false; // Reset image processed state
  imageUploadSection.classList.add("hidden");
  toggleImageUploadBtn.classList.remove("mode-active");
  toggleImageUploadBtn.classList.add("mode-inactive");
  toggleGenerateBtn.classList.add("mode-active");
  toggleGenerateBtn.classList.remove("mode-inactive");
  paletteViewer.style.display = "flex"; // Show swatches when switching to generate mode
  updateButtonVisibility(); // Update button visibility
});

document.getElementById("imageUpload").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    uploadedImage = event.target.result;
    document.getElementById(
      "imagePreview"
    ).innerHTML = `<img id="uploadedImage" src="${uploadedImage}" class="w-full h-full object-contain rounded-lg">`;
  };
  reader.readAsDataURL(file);
});

document
  .getElementById("extractPalette")
  .addEventListener("click", async () => {
    if (!uploadedImage) {
      showNotification("Please upload an image first!");
      return;
    }

    // Wait for ColorThief to load
    await loadColorThief();

    if (!ColorThief) {
      showNotification(
        "Image processing library not available. Switching to Generate Mode."
      );
      currentMode = "generate";
      generatePalette();
      return;
    }

    const imgElement = document.getElementById("uploadedImage");
    // Ensure image is loaded before extracting colors
    if (imgElement.complete) {
      await extractColors(imgElement);
    } else {
      imgElement.onload = async () => {
        await extractColors(imgElement);
      };
    }
  });

async function extractColors(imgElement) {
  try {
    if (!ColorThief) {
      showNotification(
        "Image processing library not available. Switching to Generate Mode."
      );
      currentMode = "generate";
      generatePalette();
      return;
    }

    const colorThief = new ColorThief();
    // Extract 5 dominant colors
    const paletteArray = colorThief.getPalette(imgElement, 5);
    const centroids = paletteArray.map((rgb) => {
      const [r, g, b] = rgb;
      const hsl = rgbToHsl(r, g, b);
      return `hsl(${Math.round(hsl[0])}, ${Math.round(
        hsl[1] * 100
      )}%, ${Math.round(hsl[2] * 100)}%)`;
    });

    palette = palette.map((color, index) => {
      if (lockedIndices.has(index)) {
        return color; // Keep locked swatch unchanged
      }
      return centroids[index];
    });

    isImageProcessed = true;
    paletteViewer.style.display = "flex"; // Show swatches after extraction
    console.log("Extracted palette:", palette); // Debug log
    renderPalette();
    savePalette();
    updatePreview();
    updateButtonVisibility(); // Show Preview button after palette generation

    // Fallback visibility check
    if (palette.length > 0) {
      paletteViewer.style.display = "flex";
    } else {
      console.warn(
        "Palette is empty after extraction. Generating a default palette."
      );
      palette = generateHarmonizedPalette();
      paletteViewer.style.display = "flex";
      renderPalette();
    }
  } catch (err) {
    console.error("Color extraction failed: ", err);
    showNotification("Failed to process image. Switching to Generate Mode.");
    currentMode = "generate";
    generatePalette();
  }
}

// Live Preview
function updatePreview() {
  const elements = document.querySelectorAll(".preview-element");
  elements.forEach((el, i) => {
    if (i === 0) el.style.backgroundColor = palette[0]; // Header
    if (i === 1) el.style.backgroundColor = palette[1]; // Hero
    if (i === 2) el.style.backgroundColor = palette[2]; // Button
    if (i === 3) el.style.backgroundColor = palette[3]; // Card 1
    if (i === 4) el.style.backgroundColor = palette[4]; // Card 2
    if (i === 5) el.style.backgroundColor = palette[0]; // Footer
  });
}

// Copy Palette
document.getElementById("copyPalette").addEventListener("click", () => {
  const values = palette
    .map((color) => {
      const [h, s, l] = color
        .match(/hsl\((\d+), (\d+)%, (\d+)%\)/)
        .slice(1)
        .map(Number);
      return currentFormat === "hex"
        ? hslToHex(h, s, l)
        : currentFormat === "rgb"
        ? `rgb(${hslToRgb(h, s, l)})`
        : color;
    })
    .join(", ");
  copyToClipboard(
    values,
    `Copied all ${currentFormat.toUpperCase()} values to clipboard!`,
    "Failed to copy. Please copy manually."
  );
});

// Export Functions
document.getElementById("downloadPNG").addEventListener("click", () => {
  const canvas = document.createElement("canvas");
  canvas.width = 500;
  canvas.height = 100;
  const ctx = canvas.getContext("2d");
  ctx.font = "12px monospace";
  palette.forEach((color, i) => {
    ctx.fillStyle = color;
    ctx.fillRect(i * 100, 0, 100, 80);
    ctx.fillStyle = "#fff";
    const hex = hslToHex(
      ...color
        .match(/hsl\((\d+), (\d+)%, (\d+)%\)/)
        .slice(1)
        .map(Number)
    );
    ctx.fillText(hex, i * 100 + 10, 90);
  });
  const link = document.createElement("a");
  link.download = "hueforge-palette.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
});

document.getElementById("downloadJSON").addEventListener("click", () => {
  const hexPalette = palette.map((color) =>
    hslToHex(
      ...color
        .match(/hsl\((\d+), (\d+)%, (\d+)%\)/)
        .slice(1)
        .map(Number)
    )
  );
  const json = JSON.stringify(hexPalette);
  const blob = new Blob([json], { type: "application/json" });
  const link = document.createElement("a");
  link.download = "hueforge-palette.json";
  link.href = URL.createObjectURL(blob);
  link.click();
});

document.getElementById("generatePalette").addEventListener("click", () => {
  if (currentMode === "image" && uploadedImage) {
    document.getElementById("extractPalette").click();
  } else {
    generatePalette();
  }
});

// Save Palette to localStorage
function savePalette() {
  localStorage.setItem("hueforgePalette", JSON.stringify(palette));
  localStorage.setItem(
    "lockedIndices",
    JSON.stringify(Array.from(lockedIndices))
  );
}

// Load Palette
console.log("Checking localStorage for saved palette...");
if (localStorage.getItem("hueforgePalette")) {
  console.log("Found saved palette in localStorage");
  palette = JSON.parse(localStorage.getItem("hueforgePalette"));
  const savedLockedIndices = JSON.parse(
    localStorage.getItem("lockedIndices") || "[]"
  );
  lockedIndices = new Set(savedLockedIndices);
  paletteViewer.style.display = "flex"; // Show swatches if palette exists
  renderPalette();
  updatePreview();
} else {
  console.log("No saved palette found. Generating new palette...");
  generatePalette();
}
