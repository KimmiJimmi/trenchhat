const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const upload = document.getElementById("upload");
const downloadBtn = document.getElementById("download");
const zoomSlider = document.getElementById("zoom");
const resetBtn = document.getElementById("reset");

const mask = new Image();
mask.src = "balaclava.png";

let userImage = null;

// Transform state
let baseScale = 1;   // auto-fit scale
let zoom = 1;        // slider multiplier
let offsetX = 0;
let offsetY = 0;

// Drag state
let isDragging = false;
let lastX = 0;
let lastY = 0;

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (userImage) {
    const scale = baseScale * zoom;

    const w = userImage.width * scale;
    const h = userImage.height * scale;

    const x = canvas.width / 2 - w / 2 + offsetX;
    const y = canvas.height / 2 - h / 2 + offsetY;

    ctx.drawImage(userImage, x, y, w, h);
  }

  ctx.drawImage(mask, 0, 0, canvas.width, canvas.height);
}

function resetTransform() {
  if (!userImage) return;

  // Fit image into canvas
  baseScale = Math.min(
    canvas.width / userImage.width,
    canvas.height / userImage.height
  );

  zoom = 1;
  zoomSlider.value = "1";

  offsetX = 0;
  offsetY = 0;

  draw();
}

upload.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    userImage = new Image();
    userImage.onload = () => {
      resetTransform();
    };
    userImage.src = reader.result;
  };
  reader.readAsDataURL(file);
});

zoomSlider.addEventListener("input", (e) => {
  zoom = parseFloat(e.target.value);
  draw();
});

resetBtn.addEventListener("click", resetTransform);

// Mouse drag
canvas.addEventListener("mousedown", (e) => {
  if (!userImage) return;
  isDragging = true;
  lastX = e.offsetX;
  lastY = e.offsetY;
});

canvas.addEventListener("mousemove", (e) => {
  if (!isDragging) return;
  offsetX += e.offsetX - lastX;
  offsetY += e.offsetY - lastY;
  lastX = e.offsetX;
  lastY = e.offsetY;
  draw();
});

window.addEventListener("mouseup", () => {
  isDragging = false;
});

// Touch support
canvas.addEventListener("touchstart", (e) => {
  if (!userImage) return;
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const t = e.touches[0];
  isDragging = true;
  lastX = t.clientX - rect.left;
  lastY = t.clientY - rect.top;
}, { passive: false });

canvas.addEventListener("touchmove", (e) => {
  if (!isDragging) return;
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const t = e.touches[0];
  const x = t.clientX - rect.left;
  const y = t.clientY - rect.top;
  offsetX += x - lastX;
  offsetY += y - lastY;
  lastX = x;
  lastY = y;
  draw();
}, { passive: false });

canvas.addEventListener("touchend", () => {
  isDragging = false;
});

downloadBtn.addEventListener("click", () => {
  if (!userImage) return;
  const link = document.createElement("a");
  link.download = "balaclava-pfp.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
});

mask.onload = draw;

// --- COPY CA TO CLIPBOARD ---
window.addEventListener("DOMContentLoaded", () => {
  const copyBtn = document.getElementById("copy-ca");
  const caTextEl = document.getElementById("ca-text");

  if (!copyBtn || !caTextEl) {
    console.error("Copy elements not found. Check IDs: copy-ca and ca-text.");
    return;
  }

  async function copyTextToClipboard(text) {
    // Clipboard API works on HTTPS or http://localhost
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }

    // Fallback for older browsers / non-secure contexts
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    ta.style.top = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
  }

  copyBtn.addEventListener("click", async () => {
    const text = caTextEl.textContent.trim();
    try {
      await copyTextToClipboard(text);
      const original = copyBtn.textContent;
      copyBtn.textContent = "Copied!";
      setTimeout(() => (copyBtn.textContent = original), 1200);
    } catch (err) {
      console.error(err);
      alert("Copy failed. Refresh the page and try again.");
    }
  });
});

// Auto-update footer year
document.getElementById("year").textContent = new Date().getFullYear();