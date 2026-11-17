/* =========================================================
   ADEGAN 1: Pixel Daisy ("LOVES ME / LOVES ME NOT") - Diperbesar
   ========================================================= */
const daisyCanvas = document.getElementById("daisy-canvas");
const dctx = daisyCanvas.getContext("2d");

const sceneDaisy = document.getElementById("scene-daisy");
const sceneBouquet = document.getElementById("scene-bouquet");

const DAISY_W = 320;
const DAISY_H = 360;
const DAISY_SCALE = 1.32;

const TOTAL_PETALS = 12;
const petals = [];
const hearts = [];
let lovesMe = true;
let daisyFinished = false;
let switchTimer = 0;

function initDaisyPetals() {
  petals.length = 0;
  const cx = 160;
  const cy = 152;
  for (let i = 0; i < TOTAL_PETALS; i++) {
    const angle = (Math.PI * 2 * i) / TOTAL_PETALS;
    petals.push({
      angle,
      cx,
      cy,
      state: "attached",
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
  const bands = ["#141b44", "#1b2458", "#232e6b", "#2d3a7e"];
  bands.forEach((col, idx) => {
    drawPixelRect(dctx, 0, idx * (DAISY_H / 4), DAISY_W, DAISY_H / 4 + 2, col);
  });

  const stars = [
    [28, 30], [72, 22], [118, 38], [190, 26], [272, 36],
    [46, 80], [98, 66], [208, 86], [290, 72], [62, 126],
  ];
  stars.forEach(([sx, sy]) => {
    drawPixelRect(dctx, sx, sy, 3, 3, "#dce5ff");
  });

  // Bulan sabit
  drawPixelRect(dctx, 248, 44, 30, 30, "#f7e89c");
  drawPixelRect(dctx, 259, 38, 25, 25, "#1b2458");

  // Bukit ungu gelap
  drawPixelRect(dctx, 0, 244, DAISY_W, 68, "#262254");
  drawPixelRect(dctx, 0, 266, DAISY_W, 48, "#1f1b46");

  // Rumput bawah
  drawPixelRect(dctx, 0, 306, DAISY_W, 54, "#1f5a36");
  for (let x = 0; x < DAISY_W; x += 8) {
    const h = 11 + ((x * 7) % 14);
    drawPixelRect(dctx, x, 306 - h, 5, h, x % 16 === 0 ? "#388e4c" : "#28723d");
  }

  // Batang & daun bunga daisy yang lebih tebal
  drawPixelRect(dctx, 156, 166, 8, 146, "#2f8f4e");
  drawPixelRect(dctx, 134, 234, 22, 8, "#3ca85c");
  drawPixelRect(dctx, 164, 256, 22, 8, "#3ca85c");
}

function drawPetalShape(x, y, angle, alpha) {
  dctx.save();
  dctx.translate(x, y);
  dctx.rotate(angle);
  dctx.scale(DAISY_SCALE, DAISY_SCALE);
  dctx.globalAlpha = alpha;
  drawPixelRect(dctx, -4, -23, 8, 19, "#eef3ff");
  drawPixelRect(dctx, -2, -25, 4, 4, "#ffffff");
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
    drawPixelRect(
      dctx,
      x + dx * DAISY_SCALE,
      y + dy * DAISY_SCALE,
      3 * DAISY_SCALE,
      3 * DAISY_SCALE,
      color
    );
  });
}

function updateAndRenderDaisy(dt) {
  drawDaisyBackground();

  const label = lovesMe ? "LOVES ME" : "LOVES ME NOT";
  dctx.save();
  dctx.font = 'bold 23px "Silkscreen", monospace';
  dctx.textAlign = "center";
  dctx.fillStyle = "#f2a6c8";
  dctx.fillText(label, DAISY_W / 2, 58);
  dctx.restore();

  for (const p of petals) {
    if (p.state === "attached") {
      drawPetalShape(p.cx, p.cy, p.angle, 1);
    } else if (p.state === "falling") {
      p.cx += p.vx * dt;
      p.cy += p.vy * dt;
      p.vy += 34 * dt;
      p.angle += p.vRot * dt;
      p.alpha = Math.max(0, p.alpha - 0.2 * dt);
      drawPetalShape(p.cx, p.cy, p.angle, p.alpha);
      if (p.cy > DAISY_H - 15 || p.alpha <= 0) {
        p.state = "gone";
      }
    }
  }

  // Tengah bunga (putik kuning) diperbesar
  drawPixelRect(dctx, 148, 140, 24, 24, "#f5c542");
  drawPixelRect(dctx, 152, 144, 16, 16, "#ffe07d");

  for (const h of hearts) {
    h.y -= 32 * dt;
    h.x += Math.sin(h.y * 0.07 + h.phase) * 0.45;
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
        nextAttached.vx = (Math.random() - 0.5) * 42;
        nextAttached.vy = 22 + Math.random() * 16;
        nextAttached.vRot = (Math.random() - 0.5) * 2.2;
        lovesMe = !lovesMe;

        const remaining = petals.filter((p) => p.state === "attached").length;
        if (remaining === 0) {
          lovesMe = true;
          daisyFinished = true;
          for (let i = 0; i < 12; i++) {
            hearts.push({
              x: 136 + (i % 4) * 16,
              y: 134 - Math.floor(i / 4) * 14,
              phase: i,
            });
          }
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
   ADEGAN 2: Starfield + "I Have Something" + Open -> Flowers (Diperbesar)
   ========================================================= */
const bouquetCanvas = document.getElementById("bouquet-canvas");
const bctx = bouquetCanvas.getContext("2d");
const introOverlay = document.getElementById("intro-overlay");
const openBtn = document.getElementById("open-btn");
const finalCaption = document.getElementById("final-caption");

const BOUQUET_SCALE = 1.38;

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

  bgStars = Array.from({ length: 150 }, () => ({
    x: Math.random() * bw,
    y: Math.random() * bh,
    r: 0.7 + Math.random() * 1.6,
    phase: Math.random() * Math.PI * 2,
  }));

  if (opened) {
    buildBouquet();
  }
}

function buildBouquet() {
  const baseX = bw * 0.5;
  const baseY = bh * 0.94;

  glowingFlowers = [
    { x: baseX - 130, y: baseY - 290, tilt: -0.22, delay: 0.1, scale: 1.15 * BOUQUET_SCALE },
    { x: baseX - 52, y: baseY - 390, tilt: -0.07, delay: 0.25, scale: 1.35 * BOUQUET_SCALE },
    { x: baseX + 38, y: baseY - 420, tilt: 0.06, delay: 0.35, scale: 1.42 * BOUQUET_SCALE },
    { x: baseX + 126, y: baseY - 320, tilt: 0.2, delay: 0.5, scale: 1.22 * BOUQUET_SCALE },
    { x: baseX - 185, y: baseY - 190, tilt: -0.45, delay: 0.65, scale: 1.0 * BOUQUET_SCALE },
    { x: baseX + 188, y: baseY - 205, tilt: 0.42, delay: 0.75, scale: 1.04 * BOUQUET_SCALE },
  ];

  grassBlades = Array.from({ length: 52 }, (_, idx) => {
    const side = idx < 26 ? -1 : 1;
    const spread = 45 + ((idx * 37) % Math.max(140, Math.floor(bw * 0.4)));
    return {
      x: baseX + side * spread,
      baseY: bh + 8,
      height: (140 + ((idx * 29) % 180)) * 1.2,
      curve: side * (26 + (idx % 5) * 12),
      delay: 0.2 + (idx % 10) * 0.08,
    };
  });
}

function drawGlowingFlower(flw, elapsed) {
  const t = Math.max(0, Math.min(1, (elapsed - flw.delay) / 1.4));
  if (t <= 0) return;

  const baseX = bw * 0.5;
  const baseY = bh * 0.94;

  bctx.save();
  bctx.beginPath();
  bctx.moveTo(baseX, baseY);
  const ctrlX = (baseX + flw.x) * 0.5 + flw.tilt * 110;
  const ctrlY = (baseY + flw.y) * 0.5;
  const curX = baseX + (flw.x - baseX) * t;
  const curY = baseY + (flw.y - baseY) * t;
  bctx.quadraticCurveTo(ctrlX, ctrlY, curX, curY);
  bctx.strokeStyle = "rgba(215, 225, 195, 0.88)";
  bctx.lineWidth = 4 * flw.scale;
  bctx.shadowColor = "rgba(255, 245, 200, 0.6)";
  bctx.shadowBlur = 16;
  bctx.stroke();

  if (t > 0.35) {
    const leafT = Math.min(1, (t - 0.35) / 0.5);
    const lx = baseX + (flw.x - baseX) * 0.55;
    const ly = baseY + (flw.y - baseY) * 0.55;
    bctx.beginPath();
    bctx.ellipse(
      lx + flw.tilt * 32,
      ly,
      24 * flw.scale * leafT,
      8 * flw.scale * leafT,
      flw.tilt + 0.5,
      0,
      Math.PI * 2
    );
    bctx.fillStyle = "rgba(218, 228, 205, 0.78)";
    bctx.fill();
  }

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
        -20 * flw.scale * bloom,
        8.5 * flw.scale * bloom,
        19 * flw.scale * bloom,
        0,
        0,
        Math.PI * 2
      );
      bctx.fillStyle = "rgba(255, 250, 224, 0.94)";
      bctx.shadowColor = "rgba(255, 236, 179, 0.95)";
      bctx.shadowBlur = 22;
      bctx.fill();
      bctx.restore();
    }

    bctx.beginPath();
    bctx.arc(0, 0, 7.5 * flw.scale * bloom, 0, Math.PI * 2);
    bctx.fillStyle = "#ffe89e";
    bctx.fill();
  }

  bctx.restore();
}

function drawGrass(elapsed) {
  for (const g of grassBlades) {
    const t = Math.max(0, Math.min(1, (elapsed - g.delay) / 1.3));
    if (t <= 0) continue;
    const sway = Math.sin(elapsed * 1.4 + g.x * 0.02) * 10;
    const topX = g.x + g.curve * t + sway;
    const topY = g.baseY - g.height * t;

    bctx.save();
    bctx.beginPath();
    bctx.moveTo(g.x - 5, g.baseY);
    bctx.quadraticCurveTo(g.x + g.curve * 0.4 * t, g.baseY - g.height * 0.55 * t, topX, topY);
    bctx.quadraticCurveTo(g.x + g.curve * 0.6 * t + 4, g.baseY - g.height * 0.5 * t, g.x + 5, g.baseY);
    bctx.closePath();

    const grad = bctx.createLinearGradient(g.x, g.baseY, topX, topY);
    grad.addColorStop(0, "rgba(18, 52, 24, 0.95)");
    grad.addColorStop(1, "rgba(96, 168, 72, 0.88)");
    bctx.fillStyle = grad;
    bctx.fill();
    bctx.restore();
  }
}

function bouquetLoop(now) {
  bctx.fillStyle = "#07080d";
  bctx.fillRect(0, 0, bw, bh);

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
