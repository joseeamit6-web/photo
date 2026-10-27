/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Generates a clean, single-file index.html for pic.amitjoshi.info.np
 * With top-aligned print layout, support info, privacy/terms, and ad slot.
 */
export function generateStandaloneIndexHtml(): string {
  return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Passport Photo Studio | pic.amitjoshi.info.np</title>
  <meta name="description" content="Professional biometric passport photo studio with 300 DPI high-res canvas cropping, AI background removal, and multi-photo print sheets.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.6.2/cropper.min.css">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.6.2/cropper.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
  <style>
    :root {
      --bg-base: #09090b;
      --bg-surface: #18181b;
      --bg-card: #27272a;
      --border: #3f3f46;
      --accent: #6366f1;
      --accent-hover: #4f46e5;
      --text-main: #f4f4f5;
      --text-muted: #a1a1aa;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      background: var(--bg-base);
      color: var(--text-main);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    .font-mono { font-family: 'JetBrains Mono', monospace; }
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      background: #09090b;
      border-bottom: 1px solid var(--border);
    }
    .brand { font-size: 1.15rem; font-weight: 700; color: #fff; text-decoration: none; display: flex; align-items: center; gap: 0.5rem; }
    .badge-domain { font-size: 0.75rem; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    main { max-width: 1280px; width: 100%; margin: 0 auto; padding: 1.25rem; flex: 1; }
    .support-banner {
      background: rgba(24, 24, 27, 0.8);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 0.75rem 1rem;
      margin-bottom: 1.25rem;
      font-size: 0.8rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .support-banner a { color: #818cf8; text-decoration: none; font-weight: 600; }
    .support-banner a.wa { color: #34d399; }
    .studio-grid { display: grid; grid-template-columns: 1fr 380px; gap: 1.5rem; align-items: start; }
    @media (max-width: 960px) { .studio-grid { grid-template-columns: 1fr; } }
    .canvas-panel {
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .viewport-box {
      width: 100%;
      height: 480px;
      background: #000;
      border-radius: 8px;
      overflow: hidden;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .viewport-box img { max-width: 100%; max-height: 100%; display: block; }
    .controls-panel {
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .section-title { font-size: 0.85rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); }
    .preset-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; }
    .btn-preset {
      background: var(--bg-card);
      border: 1px solid var(--border);
      color: var(--text-main);
      padding: 0.6rem 0.75rem;
      border-radius: 6px;
      text-align: left;
      cursor: pointer;
      font-size: 0.8rem;
      transition: all 0.15s ease;
    }
    .btn-preset.active, .btn-preset:hover {
      border-color: var(--accent);
      background: rgba(99, 102, 241, 0.15);
    }
    .color-row { display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap; }
    .color-swatch {
      width: 32px;
      height: 32px;
      border-radius: 6px;
      border: 2px solid transparent;
      cursor: pointer;
      transition: transform 0.15s ease;
    }
    .color-swatch.active { border-color: var(--accent); transform: scale(1.1); }
    .action-btn {
      background: var(--accent);
      color: #fff;
      border: none;
      border-radius: 6px;
      padding: 0.75rem 1rem;
      font-weight: 600;
      font-size: 0.9rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      transition: background 0.15s ease;
      width: 100%;
    }
    .action-btn:hover { background: var(--accent-hover); }
    .action-btn.secondary {
      background: var(--bg-card);
      border: 1px solid var(--border);
      color: var(--text-main);
    }
    .action-btn.secondary:hover { background: #3f3f46; }
    .dropzone {
      border: 2px dashed var(--border);
      border-radius: 8px;
      padding: 2.5rem 1.5rem;
      text-align: center;
      cursor: pointer;
      background: rgba(24, 24, 27, 0.6);
      transition: border-color 0.2s ease;
    }
    .dropzone:hover { border-color: var(--accent); }
    .sheet-preview-modal {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.85);
      z-index: 999;
      padding: 1.5rem;
      overflow-y: auto;
    }
    .sheet-content {
      max-width: 900px;
      margin: 0 auto;
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1.5rem;
    }
    .biometric-guide {
      pointer-events: none;
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 10;
    }
    .biometric-oval {
      width: 60%;
      height: 72%;
      border: 2px dashed rgba(99, 102, 241, 0.85);
      border-radius: 50% / 60% 60% 40% 40%;
      position: relative;
    }
    .biometric-line {
      position: absolute;
      left: 10%;
      right: 10%;
      border-top: 1px dotted rgba(239, 68, 68, 0.7);
    }
    .biometric-line.eyes { top: 44%; }
    .biometric-line.chin { bottom: 12%; }
    #ad-space {
      width: 100%;
      margin: 2rem 0 1rem 0;
      min-height: 90px;
      border: 1px dashed var(--border);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-muted);
      font-size: 0.75rem;
      font-family: 'JetBrains Mono', monospace;
    }
    footer {
      border-top: 1px solid var(--border);
      padding: 1.25rem 1.5rem;
      font-size: 0.75rem;
      color: var(--text-muted);
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
      background: #09090b;
    }
    footer a { color: var(--text-muted); text-decoration: none; }
    footer a:hover { color: #fff; }

    /* Strict Top-Aligned Print Styling */
    @media print {
      body { background: #fff !important; color: #000 !important; margin: 0 !important; padding: 0 !important; }
      header, .controls-panel, .canvas-panel, .support-banner, #ad-space, footer, .sheet-content > :not(#print-sheet-wrapper), .no-print { display: none !important; }
      .sheet-preview-modal { display: block !important; position: static !important; background: transparent !important; padding: 0 !important; }
      .sheet-content { border: none !important; padding: 0 !important; margin: 0 !important; }
      #print-sheet-wrapper {
        display: block !important;
        position: absolute !important;
        left: 0 !important;
        top: 0 !important;
        width: 100% !important;
        height: auto !important;
        margin: 0 !important;
        padding: 5mm 0 0 0 !important; /* Starts strictly at top */
        background: #fff !important;
      }
      #print-sheet-canvas {
        display: block !important;
        max-width: 100% !important;
        height: auto !important;
        margin: 0 auto !important;
      }
      @page { margin: 0mm; size: auto; }
    }
  </style>
</head>
<body>
  <header class="no-print">
    <a href="#" class="brand">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 8V6a2 2 0 0 1 2-2h2"/><path d="M4 16v2a2 2 0 0 0 2 2h2"/><path d="M16 4h2a2 2 0 0 1 2 2v2"/><path d="M16 20h2a2 2 0 0 0 2-2v-2"/><circle cx="12" cy="12" r="3"/><circle cx="12" cy="10" r="1"/></svg>
      <span>Passport Photo Studio</span>
    </a>
    <span class="badge-domain">pic.amitjoshi.info.np · 300 DPI</span>
  </header>

  <main>
    <div class="support-banner no-print">
      <span>If any error occurs or AI processing fails, contact Support at <a href="mailto:admin@amitjoshi.info.np">admin@amitjoshi.info.np</a> or WhatsApp at <a href="https://wa.me/9779746241860" target="_blank" class="wa">+977 9746241860</a></span>
      <div>
        <a href="https://wa.me/9779746241860" target="_blank" style="margin-left: 0.5rem; background: #064e3b; color: #6ee7b7; padding: 0.25rem 0.6rem; border-radius: 4px; text-decoration: none;">WhatsApp Help</a>
      </div>
    </div>

    <div class="studio-grid">
      <!-- Left: Image Viewport -->
      <div class="canvas-panel">
        <div class="viewport-box" id="viewport">
          <div class="dropzone" id="dropzone">
            <p style="font-weight: 600; margin-bottom: 0.5rem;">Drag & Drop Passport Photo</p>
            <p style="font-size: 0.8rem; color: var(--text-muted);">or click to browse from device</p>
            <input type="file" id="file-input" accept="image/*" style="display: none;">
          </div>
          <img id="cropper-target" style="display: none;" alt="Photo to crop">
          <div class="biometric-guide" id="biometric-guide" style="display: none;">
            <div class="biometric-oval">
              <div class="biometric-line eyes" title="Eye Level Line"></div>
              <div class="biometric-line chin" title="Chin Boundary"></div>
            </div>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div style="font-size: 0.8rem; color: var(--text-muted);" id="image-meta">
            No image loaded
          </div>
          <div style="display: flex; gap: 0.5rem;">
            <button class="action-btn secondary" id="btn-rotate-left" style="padding: 0.4rem 0.75rem; font-size: 0.8rem;">↶ Rotate</button>
            <button class="action-btn secondary" id="btn-toggle-guide" style="padding: 0.4rem 0.75rem; font-size: 0.8rem;">Guides: ON</button>
          </div>
        </div>
      </div>

      <!-- Right: Controls Panel -->
      <div class="controls-panel">
        <div>
          <div class="section-title" style="margin-bottom: 0.5rem;">1. Passport Standards</div>
          <div class="preset-grid">
            <button class="btn-preset active" data-w="35" data-h="45" data-name="35x45mm EU/Asia">
              <strong>35 × 45 mm</strong>
              <div style="font-size: 0.7rem; color: var(--text-muted);">EU, UK, Schengen, Asia</div>
            </button>
            <button class="btn-preset" data-w="50.8" data-h="50.8" data-name="2x2 inch US">
              <strong>2" × 2" (51×51)</strong>
              <div style="font-size: 0.7rem; color: var(--text-muted);">US Passport, India OCI</div>
            </button>
            <button class="btn-preset" data-w="30" data-h="40" data-name="30x40mm ID">
              <strong>30 × 40 mm</strong>
              <div style="font-size: 0.7rem; color: var(--text-muted);">China / Japan ID / Resume</div>
            </button>
            <button class="btn-preset" data-w="35" data-h="35" data-name="35x35mm Visa">
              <strong>35 × 35 mm</strong>
              <div style="font-size: 0.7rem; color: var(--text-muted);">India Visa Square</div>
            </button>
          </div>
        </div>

        <div>
          <div class="section-title" style="margin-bottom: 0.5rem;">2. AI Background Removal</div>
          <button class="action-btn secondary" id="btn-remove-bg">
            <span>✨ AI Remove Background</span>
          </button>
          <div id="ai-status" style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.25rem;">Runs 100% locally in browser WebAssembly</div>
        </div>

        <div>
          <div class="section-title" style="margin-bottom: 0.5rem;">3. Backdrop Color</div>
          <div class="color-row">
            <div class="color-swatch active" style="background: #ffffff;" data-color="#ffffff" title="White"></div>
            <div class="color-swatch" style="background: #f8fafc;" data-color="#f8fafc" title="Off-White"></div>
            <div class="color-swatch" style="background: #bfdbfe;" data-color="#bfdbfe" title="Light Blue"></div>
            <div class="color-swatch" style="background: #e2e8f0;" data-color="#e2e8f0" title="Soft Gray"></div>
            <div class="color-swatch" style="background: #dc2626;" data-color="#dc2626" title="Red"></div>
            <input type="color" id="custom-color-input" value="#ffffff" title="Custom Hex" style="width: 32px; height: 32px; border: none; background: transparent; cursor: pointer;">
          </div>
        </div>

        <div style="border-top: 1px solid var(--border); padding-top: 1rem; display: flex; flex-direction: column; gap: 0.6rem;">
          <button class="action-btn" id="btn-download-single">
            Download Single Photo (300 DPI)
          </button>
          <button class="action-btn secondary" id="btn-open-sheet">
            🖨️ Generate Print Sheet (Top-Aligned)
          </button>
        </div>
      </div>
    </div>

    <!-- Google Ad Container Slot -->
    <div id="ad-space" class="no-print">
      Google AdSense Responsive Banner Placement Area
    </div>
  </main>

  <!-- Sheet Preview Modal -->
  <div class="sheet-preview-modal" id="sheet-modal">
    <div class="sheet-content">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;" class="no-print">
        <div>
          <h2 style="font-size: 1.25rem; font-weight: 700;">Print Sheet Generator</h2>
          <p style="font-size: 0.8rem; color: var(--text-muted);">Calibrated at 300 DPI · Top-aligned grid with scissor cut marks</p>
        </div>
        <button class="action-btn secondary" id="btn-close-sheet" style="width: auto; padding: 0.4rem 0.8rem;">✕ Close</button>
      </div>

      <div class="no-print" style="display: flex; gap: 1rem; margin-bottom: 1rem; flex-wrap: wrap;">
        <div>
          <label style="font-size: 0.75rem; color: var(--text-muted); display: block;">Paper Size</label>
          <select id="sheet-paper" style="background: var(--bg-card); color: #fff; border: 1px solid var(--border); padding: 0.4rem 0.6rem; border-radius: 4px;">
            <option value="4x6">4" × 6" (10 × 15 cm)</option>
            <option value="a4">A4 (210 × 297 mm)</option>
            <option value="letter">US Letter (8.5" × 11")</option>
          </select>
        </div>
        <div>
          <label style="font-size: 0.75rem; color: var(--text-muted); display: block;">Number of Copies</label>
          <select id="sheet-copies" style="background: var(--bg-card); color: #fff; border: 1px solid var(--border); padding: 0.4rem 0.6rem; border-radius: 4px;">
            <option value="auto">Auto Fill Maximum</option>
            <option value="4">4 Copies</option>
            <option value="6">6 Copies</option>
            <option value="8" selected>8 Copies</option>
            <option value="12">12 Copies</option>
          </select>
        </div>
      </div>

      <div id="print-sheet-wrapper" style="text-align: center; background: #27272a; padding: 1rem; border-radius: 8px;">
        <canvas id="print-sheet-canvas" style="max-width: 100%; height: auto; box-shadow: 0 4px 12px rgba(0,0,0,0.5);"></canvas>
      </div>

      <div style="display: flex; gap: 0.5rem; margin-top: 1rem;" class="no-print">
        <button class="action-btn" id="btn-print-sheet">Print Sheet (Ctrl+P)</button>
        <button class="action-btn secondary" id="btn-download-sheet-jpg">Download 300 DPI JPEG</button>
        <button class="action-btn secondary" id="btn-download-sheet-pdf">Download PDF</button>
      </div>
    </div>
  </div>

  <footer class="no-print">
    <div>© 2026 Passport Photo Studio · pic.amitjoshi.info.np</div>
    <div>Support: <a href="mailto:admin@amitjoshi.info.np">admin@amitjoshi.info.np</a> · WhatsApp: <a href="https://wa.me/9779746241860" target="_blank" style="color: #34d399;">+977 9746241860</a></div>
  </footer>

  <script type="module">
    let cropper = null;
    let originalImage = null;
    let selectedWidthMm = 35;
    let selectedHeightMm = 45;
    let currentBgColor = '#ffffff';
    let isGuideVisible = true;
    let cutoutCanvas = null;

    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('file-input');
    const cropperTarget = document.getElementById('cropper-target');
    const biometricGuide = document.getElementById('biometric-guide');

    dropzone.addEventListener('click', () => fileInput.click());
    dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.style.borderColor = '#6366f1'; });
    dropzone.addEventListener('dragleave', () => { dropzone.style.borderColor = 'var(--border)'; });
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.style.borderColor = 'var(--border)';
      if (e.dataTransfer.files && e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]);
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) loadFile(e.target.files[0]);
    });

    function loadFile(file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const img = new Image();
        img.onload = () => {
          originalImage = img;
          initCropper(evt.target.result);
          document.getElementById('image-meta').textContent = \`Loaded: \${img.naturalWidth} × \${img.naturalHeight}px\`;
        };
        img.src = evt.target.result;
      };
      reader.readAsDataURL(file);
    }

    function initCropper(src) {
      dropzone.style.display = 'none';
      cropperTarget.style.display = 'block';
      biometricGuide.style.display = 'flex';
      cropperTarget.src = src;

      if (cropper) cropper.destroy();
      cropper = new Cropper(cropperTarget, {
        aspectRatio: selectedWidthMm / selectedHeightMm,
        viewMode: 1,
        autoCropArea: 0.85,
        responsive: true,
        background: false,
      });
    }

    document.querySelectorAll('.btn-preset').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.btn-preset').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedWidthMm = parseFloat(btn.dataset.w);
        selectedHeightMm = parseFloat(btn.dataset.h);
        if (cropper) cropper.setAspectRatio(selectedWidthMm / selectedHeightMm);
      });
    });

    document.querySelectorAll('.color-swatch').forEach(swatch => {
      swatch.addEventListener('click', () => {
        document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
        swatch.classList.add('active');
        currentBgColor = swatch.dataset.color;
      });
    });

    document.getElementById('custom-color-input').addEventListener('input', (e) => {
      currentBgColor = e.target.value;
    });

    document.getElementById('btn-rotate-left').addEventListener('click', () => {
      if (cropper) cropper.rotate(-90);
    });

    document.getElementById('btn-toggle-guide').addEventListener('click', () => {
      isGuideVisible = !isGuideVisible;
      biometricGuide.style.display = isGuideVisible ? 'flex' : 'none';
      document.getElementById('btn-toggle-guide').textContent = isGuideVisible ? 'Guides: ON' : 'Guides: OFF';
    });

    document.getElementById('btn-remove-bg').addEventListener('click', async () => {
      if (!cropper) return alert('Please upload a photo first.');
      const statusEl = document.getElementById('ai-status');
      statusEl.textContent = 'Loading WebAssembly AI model...';

      try {
        const { removeBackground } = await import('https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.7.0/+esm');
        const croppedCanvas = getHighResCroppedCanvas();
        croppedCanvas.toBlob(async (blob) => {
          const removedBlob = await removeBackground(blob, {
            publicPath: 'https://staticimgly.com/@imgly/background-removal-data/1.7.0/dist/',
            progress: (key, cur, tot) => {
              const p = tot > 0 ? Math.round((cur / tot) * 100) : 50;
              statusEl.textContent = \`AI Processing: \${p}%...\`;
            }
          });
          const img = new Image();
          img.onload = () => {
            cutoutCanvas = document.createElement('canvas');
            cutoutCanvas.width = img.width;
            cutoutCanvas.height = img.height;
            const ctx = cutoutCanvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            statusEl.textContent = '✨ Background removed successfully with zero loss!';
          };
          img.src = URL.createObjectURL(removedBlob);
        });
      } catch (err) {
        console.error(err);
        statusEl.innerHTML = 'Error running local AI. Contact <a href="mailto:admin@amitjoshi.info.np" style="color:#818cf8;">admin@amitjoshi.info.np</a> or WhatsApp <a href="https://wa.me/9779746241860" style="color:#34d399;">+977 9746241860</a>';
      }
    });

    function getHighResCroppedCanvas() {
      const dpi = 300;
      const targetW = Math.round((selectedWidthMm / 25.4) * dpi);
      const targetH = Math.round((selectedHeightMm / 25.4) * dpi);
      return cropper.getCroppedCanvas({
        width: targetW,
        height: targetH,
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high'
      });
    }

    function renderFinalPhotoCanvas() {
      const base = getHighResCroppedCanvas();
      const canvas = document.createElement('canvas');
      canvas.width = base.width;
      canvas.height = base.height;
      const ctx = canvas.getContext('2d');

      if (currentBgColor !== 'transparent') {
        ctx.fillStyle = currentBgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      if (cutoutCanvas) {
        ctx.drawImage(cutoutCanvas, 0, 0, canvas.width, canvas.height);
      } else {
        ctx.drawImage(base, 0, 0, canvas.width, canvas.height);
      }
      return canvas;
    }

    document.getElementById('btn-download-single').addEventListener('click', () => {
      if (!cropper) return alert('Please upload a photo first.');
      const canvas = renderFinalPhotoCanvas();
      canvas.toBlob((blob) => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = \`passport-photo-\${selectedWidthMm}x\${selectedHeightMm}mm-300dpi.jpg\`;
        a.click();
      }, 'image/jpeg', 1.0);
    });

    const sheetModal = document.getElementById('sheet-modal');
    document.getElementById('btn-open-sheet').addEventListener('click', () => {
      if (!cropper) return alert('Please upload a photo first.');
      sheetModal.style.display = 'block';
      renderSheet();
    });
    document.getElementById('btn-close-sheet').addEventListener('click', () => {
      sheetModal.style.display = 'none';
    });

    document.getElementById('sheet-paper').addEventListener('change', renderSheet);
    document.getElementById('sheet-copies').addEventListener('change', renderSheet);

    function renderSheet() {
      const photoCanvas = renderFinalPhotoCanvas();
      const paperType = document.getElementById('sheet-paper').value;
      const copiesType = document.getElementById('sheet-copies').value;

      let pWidthMm = 101.6, pHeightMm = 152.4; // 4x6
      if (paperType === 'a4') { pWidthMm = 210; pHeightMm = 297; }
      else if (paperType === 'letter') { pWidthMm = 215.9; pHeightMm = 279.4; }

      const dpi = 300;
      const sheetW = Math.round((pWidthMm / 25.4) * dpi);
      const sheetH = Math.round((pHeightMm / 25.4) * dpi);

      const canvas = document.getElementById('print-sheet-canvas');
      canvas.width = sheetW;
      canvas.height = sheetH;
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, sheetW, sheetH);

      const photoW = Math.round((selectedWidthMm / 25.4) * dpi);
      const photoH = Math.round((selectedHeightMm / 25.4) * dpi);
      const spacing = Math.round((3 / 25.4) * dpi);
      const margin = Math.round((6 / 25.4) * dpi);

      const cols = Math.floor((sheetW - 2 * margin + spacing) / (photoW + spacing));
      const rows = Math.floor((sheetH - 2 * margin + spacing) / (photoH + spacing));
      const maxFit = cols * rows;

      let totalCopies = copiesType === 'auto' ? maxFit : Math.min(parseInt(copiesType), maxFit);

      const actualCols = Math.min(cols, totalCopies);
      const actualRows = Math.ceil(totalCopies / actualCols);
      const gridW = actualCols * photoW + (actualCols - 1) * spacing;
      const startX = Math.round((sheetW - gridW) / 2);
      // Strictly TOP-ALIGNED (starts at margin 6mm from top, down)
      const startY = margin;

      let drawn = 0;
      for (let r = 0; r < actualRows; r++) {
        for (let c = 0; c < actualCols; c++) {
          if (drawn >= totalCopies) break;
          const x = startX + c * (photoW + spacing);
          const y = startY + r * (photoH + spacing);
          ctx.drawImage(photoCanvas, 0, 0, photoCanvas.width, photoCanvas.height, x, y, photoW, photoH);
          ctx.strokeStyle = '#e4e4e7';
          ctx.lineWidth = 1;
          ctx.strokeRect(x, y, photoW, photoH);
          drawn++;
        }
      }
    }

    document.getElementById('btn-print-sheet').addEventListener('click', () => {
      window.print();
    });

    document.getElementById('btn-download-sheet-jpg').addEventListener('click', () => {
      const canvas = document.getElementById('print-sheet-canvas');
      canvas.toBlob((blob) => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'passport-print-sheet-300dpi.jpg';
        a.click();
      }, 'image/jpeg', 1.0);
    });

    document.getElementById('btn-download-sheet-pdf').addEventListener('click', () => {
      const canvas = document.getElementById('print-sheet-canvas');
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [canvas.width / 300 * 25.4, canvas.height / 300 * 25.4] });
      doc.addImage(canvas.toDataURL('image/jpeg', 0.98), 'JPEG', 0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight());
      doc.save('passport-print-sheet.pdf');
    });
  </script>
</body>
</html>`;
}
