/* =========================================================
   ADEGAN 1: Pixel Daisy ("LOVES ME / LOVES ME NOT")
   ========================================================= */
const daisyCanvas = document.getElementById("daisy-canvas");
const dctx = daisyCanvas.getContext("2d");

const sceneDaisy = document.getElementById("scene-daisy");
const sceneBouquet = document.getElementById("scene-bouquet");

const TOTAL_PETALS = 12;
const petals = [];
const hearts = [];
let lovesMe = true;
let daisyFinished = false;
let switchTimer = 0;

function initDaisyPetals() {
  petals.length = 0;
  const cx = 120;
  const cy = 122;
  for (let i = 0; i < TOTAL_PETALS; i++) {
    const angle = (Math.PI * 2 * i) / TOTAL_PETALS;
    petals.push({
      angle,
      cx,
      cy,
      state: "attached", // attached | falling | gone
      vx: 0,
      vy: 0,
      rot: 0,
      vRot: 0,
      alpha: 1,
    });
  }
}

function drawPixelRect(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

function drawDaisyBackground() {
  // Langit malam pixel
  const bands = ["#141b44", "#1b2458", "#232e6b", "#2d3a7e"];
  bands.forEach((col, idx) => {
    drawPixelRect(dctx, 0, idx * 45, 240, 45, col);
  });

  // Bintang kecil
  const stars = [
    [22, 24], [54, 18], [88, 30], [142, 20], [205, 28],
    [35, 62], [74, 52], [156, 68], [218, 56], [46, 98],
  ];
  stars.forEach(([sx, sy]) => {
    drawPixelRect(dctx, sx, sy, 2, 2, "#dce5ff");
  });

  // Bulan sabit kuning muda
  drawPixelRect(dctx, 186, 36, 22, 22, "#f7e89c");
  drawPixelRect(dctx, 194, 32, 18, 18, "#1b2458");

  // Bukit ungu gelap di latar belakang
  drawPixelRect(dctx, 0, 188, 240, 52, "#262254");
  drawPixelRect(dctx, 0, 204, 240, 36, "#1f1b46");

  // Rumput bawah
  drawPixelRect(dctx, 0, 238, 240, 42, "#1f5a36");
  for (let x = 0; x < 240; x += 6) {
    const h = 8 + ((x * 7) % 10);
    drawPixelRect(dctx, x, 238 - h, 4, h, x % 12 === 0 ? "#388e4c" : "#28723d");
  }

  // Batang & daun bunga daisy
  drawPixelRect(dctx, 117, 134, 6, 112, "#2f8f4e");
  drawPixelRect(dctx, 102, 186, 16, 6, "#3ca85c");
  drawPixelRect(dctx, 123, 202, 16, 6, "#3ca85c");
}

function drawPetalShape(x, y, angle, alpha) {
  dctx.save();
  dctx.translate(x, y);
  dctx.rotate(angle);
  dctx.globalAlpha = alpha;
  drawPixelRect(dctx, -4, -22, 8, 18, "#eef3ff");
  drawPixelRect(dctx, -2, -24, 4, 4, "#ffffff");
  dctx.restore();
}

function drawPixelHeart(x, y, color = "#ff6fa5") {
  const blocks = [
    [-4, -2], [-2, -2], [2, -2], [4, -2],
    [-6, 0], [-4, 0], [-2, 0], [0, 0], [2, 0], [4, 0], [6, 0],
    [-4, 2], [-2, 2], [0, 2], [2, 2], [4, 2],
    [-2, 4], [0, 4], [2, 4],
    [0, 6],
  ];
  blocks.forEach(([dx, dy]) => {
    drawPixelRect(dctx, x + dx, y + dy, 2, 2, color);
  });
}

function updateAndRenderDaisy(dt) {
  drawDaisyBackground();

  // Teks LOVES ME / LOVES ME NOT
  const label = lovesMe ? "LOVES ME" : "LOVES ME NOT";
  dctx.save();
  dctx.font = 'bold 18px "Silkscreen", monospace';
  dctx.textAlign = "center";
  dctx.fillStyle = "#f2a6c8";
  dctx.fillText(label, 120, 48);
  dctx.restore();

  // Kelopak yang masih menempel atau jatuh
  for (const p of petals) {
    if (p.state === "attached") {
      drawPetalShape(p.cx, p.cy, p.angle, 1);
    } else if (p.state === "falling") {
      p.cx += p.vx * dt;
      p.cy += p.vy * dt;
      p.vy += 28 * dt;
      p.angle += p.vRot * dt;
      p.alpha = Math.max(0, p.alpha - 0.22 * dt);
      drawPetalShape(p.cx, p.cy, p.angle, p.alpha);
      if (p.cy > 265 || p.alpha <= 0) {
        p.state = "gone";
      }
    }
  }

  // Tengah bunga (putik kuning)
  drawPixelRect(dctx, 111, 113, 18, 18, "#f5c542");
  drawPixelRect(dctx, 114, 116, 12, 12, "#ffe07d");

  // Hati kecil setelah kelopak terakhir jatuh
  for (const h of hearts) {
    h.y -= 26 * dt;
    h.x += Math.sin(h.y * 0.08 + h.phase) * 0.35;
    drawPixelHeart(h.x, h.y, "#ff7eb3");
  }
}

let lastDaisyTime = performance.now();
function daisyLoop(now) {
  const dt = Math.min(0.05, (now - lastDaisyTime) / 1000);
  lastDaisyTime = now;

  if (sceneDaisy.classList.contains("active")) {
    switchTimer += dt;
    if (!daisyFinished && switchTimer >= 1.05) {
      switchTimer = 0;
      const nextAttached = petals.find((p) => p.state === "attached");
      if (nextAttached) {
        nextAttached.state = "falling";
        nextAttached.vx = (Math.random() - 0.5) * 34;
        nextAttached.vy = 18 + Math.random() * 14;
        nextAttached.vRot = (Math.random() - 0.5) * 2.2;
        lovesMe = !lovesMe;

        // Jika ini kelopak terakhir, pastikan hasil akhir LOVES ME & munculkan hati
        const remaining = petals.filter((p) => p.state === "attached").length;
        if (remaining === 0) {
          lovesMe = true;
          daisyFinished = true;
          for (let i = 0; i < 12; i++) {
            hearts.push({
              x: 102 + (i % 4) * 12,
              y: 110 - Math.floor(i / 4) * 10,
              phase: i,
            });
          }
          // Setelah bunga terakhir jatuh, ganti ke halaman video kedua
          setTimeout(() => {
            sceneDaisy.classList.remove("active");
            sceneBouquet.classList.add("active");
          }, 2600);
        }
      }
    }
    updateAndRenderDaisy(dt);
  }

  requestAnimationFrame(daisyLoop);
}

initDaisyPetals();
requestAnimationFrame(daisyLoop);

/* =========================================================
   ADEGAN 2: Starfield + "I Have Something" + Open -> Flowers
   ========================================================= */
const bouquetCanvas = document.getElementById("bouquet-canvas");
const bctx = bouquetCanvas.getContext("2d");
const introOverlay = document.getElementById("intro-overlay");
const openBtn = document.getElementById("open-btn");
const finalCaption = document.getElementById("final-caption");

let bw = 0;
let bh = 0;
let bgStars = [];
let glowingFlowers = [];
let grassBlades = [];
let opened = false;
let bouquetStartTime = 0;

function resizeBouquet() {
  bw = window.innerWidth;
  bh = window.innerHeight;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  bouquetCanvas.width = Math.floor(bw * dpr);
  bouquetCanvas.height = Math.floor(bh * dpr);
  bctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  bgStars = Array.from({ length: 140 }, () => ({
    x: Math.random() * bw,
    y: Math.random() * bh,
    r: 0.6 + Math.random() * 1.4,
    phase: Math.random() * Math.PI * 2,
  }));

  if (opened) {
    buildBouquet();
  }
}

function buildBouquet() {
  const baseX = bw * 0.5;
  const baseY = bh * 0.92;

  glowingFlowers = [
    { x: baseX - 95, y: baseY - 220, tilt: -0.22, delay: 0.1, scale: 0.85 },
    { x: baseX - 38, y: baseY - 295, tilt: -0.07, delay: 0.25, scale: 1.0 },
    { x: baseX + 28, y: baseY - 320, tilt: 0.06, delay: 0.35, scale: 1.05 },
    { x: baseX + 92, y: baseY - 245, tilt: 0.2, delay: 0.5, scale: 0.9 },
    { x: baseX - 135, y: baseY - 145, tilt: -0.45, delay: 0.65, scale: 0.72 },
    { x: baseX + 138, y: baseY - 155, tilt: 0.42, delay: 0.75, scale: 0.75 },
  ];

  grassBlades = Array.from({ length: 44 }, (_, idx) => {
    const side = idx < 22 ? -1 : 1;
    const spread = 40 + ((idx * 37) % Math.max(120, Math.floor(bw * 0.36)));
    return {
      x: baseX + side * spread,
      baseY: bh + 6,
      height: 110 + ((idx * 29) % 150),
      curve: side * (22 + (idx % 5) * 10),
      delay: 0.2 + (idx % 10) * 0.08,
    };
  });
}

function drawGlowingFlower(flw, elapsed) {
  const t = Math.max(0, Math.min(1, (elapsed - flw.delay) / 1.4));
  if (t <= 0) return;

  const baseX = bw * 0.5;
  const baseY = bh * 0.92;

  // Batang melengkung ke atas
  bctx.save();
  bctx.beginPath();
  bctx.moveTo(baseX, baseY);
  const ctrlX = (baseX + flw.x) * 0.5 + flw.tilt * 90;
  const ctrlY = (baseY + flw.y) * 0.5;
  const curX = baseX + (flw.x - baseX) * t;
  const curY = baseY + (flw.y - baseY) * t;
  bctx.quadraticCurveTo(ctrlX, ctrlY, curX, curY);
  bctx.strokeStyle = "rgba(215, 225, 195, 0.85)";
  bctx.lineWidth = 3.2 * flw.scale;
  bctx.shadowColor = "rgba(255, 245, 200, 0.55)";
  bctx.shadowBlur = 12;
  bctx.stroke();

  // Daun di sepanjang batang
  if (t > 0.35) {
    const leafT = Math.min(1, (t - 0.35) / 0.5);
    const lx = baseX + (flw.x - baseX) * 0.55;
    const ly = baseY + (flw.y - baseY) * 0.55;
    bctx.beginPath();
    bctx.ellipse(
      lx + flw.tilt * 26,
      ly,
      18 * flw.scale * leafT,
      6 * flw.scale * leafT,
      flw.tilt + 0.5,
      0,
      Math.PI * 2
    );
    bctx.fillStyle = "rgba(218, 228, 205, 0.75)";
    bctx.fill();
  }

  // Kepala bunga bercahaya
  if (t > 0.65) {
    const bloom = Math.min(1, (t - 0.65) / 0.35);
    bctx.translate(curX, curY);
    bctx.rotate(flw.tilt);

    const petalCount = 6;
    for (let i = 0; i < petalCount; i++) {
      const a = (Math.PI * 2 * i) / petalCount;
      bctx.save();
      bctx.rotate(a);
      bctx.beginPath();
      bctx.ellipse(
        0,
        -15 * flw.scale * bloom,
        6.5 * flw.scale * bloom,
        14 * flw.scale * bloom,
        0,
        0,
        Math.PI * 2
      );
      bctx.fillStyle = "rgba(255, 250, 224, 0.92)";
      bctx.shadowColor = "rgba(255, 236, 179, 0.95)";
      bctx.shadowBlur = 18;
      bctx.fill();
      bctx.restore();
    }

    bctx.beginPath();
    bctx.arc(0, 0, 5.5 * flw.scale * bloom, 0, Math.PI * 2);
    bctx.fillStyle = "#ffe89e";
    bctx.fill();
  }

  bctx.restore();
}

function drawGrass(elapsed) {
  for (const g of grassBlades) {
    const t = Math.max(0, Math.min(1, (elapsed - g.delay) / 1.3));
    if (t <= 0) continue;
    const sway = Math.sin(elapsed * 1.4 + g.x * 0.02) * 8;
    const topX = g.x + g.curve * t + sway;
    const topY = g.baseY - g.height * t;

    bctx.save();
    bctx.beginPath();
    bctx.moveTo(g.x - 4, g.baseY);
    bctx.quadraticCurveTo(g.x + g.curve * 0.4 * t, g.baseY - g.height * 0.55 * t, topX, topY);
    bctx.quadraticCurveTo(g.x + g.curve * 0.6 * t + 3, g.baseY - g.height * 0.5 * t, g.x + 4, g.baseY);
    bctx.closePath();

    const grad = bctx.createLinearGradient(g.x, g.baseY, topX, topY);
    grad.addColorStop(0, "rgba(18, 52, 24, 0.95)");
    grad.addColorStop(1, "rgba(96, 168, 72, 0.85)");
    bctx.fillStyle = grad;
    bctx.fill();
    bctx.restore();
  }
}

function bouquetLoop(now) {
  bctx.fillStyle = "#07080d";
  bctx.fillRect(0, 0, bw, bh);

  // Latar bintang berkedip lembut
  for (const s of bgStars) {
    const alpha = 0.25 + 0.55 * Math.sin(now * 0.002 + s.phase);
    bctx.fillStyle = `rgba(235, 240, 255, ${alpha})`;
    bctx.beginPath();
    bctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    bctx.fill();
  }

  if (opened) {
    const elapsed = (now - bouquetStartTime) / 1000;
    drawGrass(elapsed);
    for (const flw of glowingFlowers) {
      drawGlowingFlower(flw, elapsed);
    }
  }

  requestAnimationFrame(bouquetLoop);
}

openBtn.addEventListener("click", () => {
  if (opened) return;
  opened = true;
  bouquetStartTime = performance.now();
  buildBouquet();
  introOverlay.classList.add("hidden");
  setTimeout(() => {
    finalCaption.classList.add("visible");
  }, 950);
});

window.addEventListener("resize", resizeBouquet);
resizeBouquet();
requestAnimationFrame(bouquetLoop);
