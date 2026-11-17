/* =========================================================
   ADEGAN 1: Pixel Daisy ("LOVES ME / LOVES ME NOT") - Mirip Video
   ========================================================= */
const daisyCanvas = document.getElementById("daisy-canvas");
const dctx = daisyCanvas.getContext("2d");

const sceneDaisy = document.getElementById("scene-daisy");
const sceneBouquet = document.getElementById("scene-bouquet");

const DW = 240;
const DH = 272;
const CENTER_X = 120;
const CENTER_Y = 124;

const TOTAL_PETALS = 16;
const petals = [];
const centerSeeds = [];
const hearts = [];

let lovesMe = true;
let daisyFinished = false;
let transitionStarted = false;
let textFlicker = 0;

function px(x, y, w, h, color) {
  dctx.fillStyle = color;
  dctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

function initDaisy() {
  petals.length = 0;
  centerSeeds.length = 0;

  for (let i = 0; i < TOTAL_PETALS; i++) {
    const angle = (Math.PI * 2 * i) / TOTAL_PETALS - Math.PI / 2;
    petals.push({
      angle,
      x: CENTER_X,
      y: CENTER_Y,
      state: "attached",
      vx: 0,
      vy: 0,
      vRot: 0,
      alpha: 1,
    });
  }

  // Titik biji di tengah bunga (seperti bits di video)
  for (let i = 0; i < 26; i++) {
    const a = i * 2.39996; // golden angle
    const r = Math.sqrt(i / 26) * 11;
    centerSeeds.push({
      dx: Math.cos(a) * r,
      dy: Math.sin(a) * r,
      color: i % 3 === 0 ? "#6b2f10" : i % 2 === 0 ? "#ffe58f" : "#b85d19",
    });
  }
}

function drawNightSkyAndHills() {
  // Gradasi langit malam pixel
  const skyColors = [
    "#191e4f", "#1d2359", "#222966", "#273073",
    "#2c3780", "#323e8c", "#374699", "#3d4ea6",
  ];
  const bandH = 22;
  skyColors.forEach((col, i) => {
    px(0, i * bandH, DW, bandH + 1, col);
  });

  // Bintang pixel acak deterministik
  const starCoords = [
    [14, 16], [34, 28], [52, 14], [78, 22], [104, 12], [148, 18], [174, 12],
    [22, 54], [44, 72], [68, 46], [92, 68], [156, 56], [182, 74], [218, 64],
    [18, 104], [48, 118], [178, 112], [212, 98], [30, 148], [204, 142],
  ];
  starCoords.forEach(([sx, sy], idx) => {
    const col = idx % 4 === 0 ? "#ffffff" : "#b9c7f5";
    px(sx, sy, 2, 2, col);
    if (idx % 5 === 0) {
      px(sx - 1, sy, 4, 1, "#8fa4e8");
      px(sx, sy - 1, 1, 4, "#8fa4e8");
    }
  });

  // Bulan purnama kuning lembut di kanan atas
  const mx = 192;
  const my = 42;
  px(mx - 14, my - 10, 28, 20, "rgba(255, 238, 168, 0.22)");
  px(mx - 10, my - 14, 20, 28, "rgba(255, 238, 168, 0.22)");
  px(mx - 9, my - 9, 18, 18, "#f7e58c");
  px(mx - 7, my - 10, 14, 20, "#fff4b8");
  px(mx - 10, my - 7, 20, 14, "#fff4b8");
  // Tekstur kawah halus pada bulan
  px(mx - 3, my - 3, 3, 3, "#ead06c");
  px(mx + 3, my + 2, 2, 2, "#ead06c");
  px(mx - 2, my + 4, 2, 2, "#ead06c");

  // Bukit ungu berlapis di latar belakang
  for (let x = 0; x < DW; x += 2) {
    const h1 = Math.round(16 + Math.sin(x * 0.025 + 0.6) * 8 + Math.cos(x * 0.05) * 3);
    px(x, 198 - h1, 2, h1 + 24, "#352975");

    const h2 = Math.round(10 + Math.sin(x * 0.035 + 2.1) * 6);
    px(x, 212 - h2, 2, h2 + 20, "#261d59");
  }

  // Rumput bawah berlapis warna
  px(0, 224, DW, 48, "#225930");
  for (let x = 0; x < DW; x += 2) {
    const bladeH = 6 + ((x * 13 + 5) % 11);
    const shade = x % 6 === 0 ? "#66b858" : x % 4 === 0 ? "#439447" : "#2b6e39";
    px(x, 226 - bladeH, 2, bladeH + 46, shade);
  }
  // Titik bunga liar kecil di rumput
  const flora = [
    [16, 232, "#ff9ec7"], [42, 238, "#ffe28a"], [76, 234, "#ffffff"],
    [166, 236, "#ffe28a"], [198, 231, "#ff9ec7"], [224, 240, "#ffffff"],
  ];
  flora.forEach(([fx, fy, fc]) => px(fx, fy, 2, 2, fc));
}

function drawStemAndLeaves() {
  // Batang melengkung halus dengan outline gelap
  const stemTopY = CENTER_Y + 12;
  const stemBottomY = 256;

  for (let y = stemTopY; y <= stemBottomY; y += 2) {
    const t = (y - stemTopY) / (stemBottomY - stemTopY);
    const sx = Math.round(CENTER_X + Math.sin(t * Math.PI * 0.85) * 5);
    px(sx - 4, y, 8, 2, "#174222");
    px(sx - 3, y, 6, 2, "#389c4c");
    px(sx - 1, y, 2, 2, "#66cf78");
  }

  // Daun kiri besar
  const leftLeaf = [
    [-6, 0, 6], [-12, -2, 12], [-18, -4, 18], [-24, -5, 22],
    [-28, -4, 24], [-26, -2, 20], [-20, 0, 14], [-12, 2, 8],
  ];
  leftLeaf.forEach(([dx, dy, w]) => {
    const lx = CENTER_X - 3 + dx;
    const ly = 186 + dy;
    px(lx - 1, ly, w + 2, 2, "#174222");
    px(lx, ly, w, 2, "#46b358");
    px(lx + 2, ly, Math.max(2, w - 5), 1, "#72db82");
  });

  // Daun kanan besar
  const rightLeaf = [
    [2, 0, 6], [2, -2, 12], [4, -4, 18], [6, -5, 22],
    [8, -4, 24], [10, -2, 20], [10, 0, 14], [8, 2, 8],
  ];
  rightLeaf.forEach(([dx, dy, w]) => {
    const lx = CENTER_X + 3 + dx;
    const ly = 204 + dy;
    px(lx - 1, ly, w + 2, 2, "#174222");
    px(lx, ly, w, 2, "#3da34f");
    px(lx + 2, ly, Math.max(2, w - 5), 1, "#6ad17b");
  });
}

function drawElongatedPetal(x, y, angle, alpha) {
  dctx.save();
  dctx.translate(x, y);
  dctx.rotate(angle);
  dctx.globalAlpha = alpha;

  // Kelopak daisy panjang & ramping (bukan kotak pendek)
  const layers = [
    [-3, 10, 6, 4, "#b8c7eb"],
    [-4, 14, 8, 8, "#dce6ff"],
    [-4, 22, 8, 12, "#eef3ff"],
    [-3, 34, 6, 10, "#ffffff"],
    [-2, 44, 4, 5, "#ffffff"],
  ];
  layers.forEach(([lx, ly, lw, lh, col]) => {
    dctx.fillStyle = col;
    dctx.fillRect(lx, ly, lw, lh);
  });

  // Garis bayangan tipis di sisi kanan kelopak
  dctx.fillStyle = "#9fb2de";
  dctx.fillRect(2, 15, 2, 24);

  dctx.restore();
}

function drawDaisyCenter() {
  // Lingkaran putik bertekstur biji pixel
  const r = 14;
  for (let dy = -r; dy <= r; dy += 2) {
    for (let dx = -r; dx <= r; dx += 2) {
      const dist = Math.hypot(dx, dy);
      if (dist <= r) {
        const col = dist > r - 3 ? "#6b2f10" : dist > r - 6 ? "#b85d19" : "#e39b2d";
        px(CENTER_X + dx, CENTER_Y + dy, 2, 2, col);
      }
    }
  }

  for (const seed of centerSeeds) {
    px(CENTER_X + seed.dx, CENTER_Y + seed.dy, 2, 2, seed.color);
  }
}

function drawPixelHeart(hx, hy, color = "#ff6fa5") {
  const shape = [
    [-4, -2], [-2, -2], [2, -2], [4, -2],
    [-6, 0], [-4, 0], [-2, 0], [0, 0], [2, 0], [4, 0], [6, 0],
    [-4, 2], [-2, 2], [0, 2], [2, 2], [4, 2],
    [-2, 4], [0, 4], [2, 4],
    [0, 6],
  ];
  shape.forEach(([dx, dy]) => {
    px(hx + dx, hy + dy, 2, 2, color);
  });
}

function pluckNextPetal() {
  if (!sceneDaisy.classList.contains("active") || daisyFinished) return;

  const next = petals.find((p) => p.state === "attached");
  if (!next) return;

  next.state = "falling";
  next.vx = (Math.random() - 0.5) * 34;
  next.vy = 18 + Math.random() * 14;
  next.vRot = (Math.random() - 0.5) * 1.8;

  lovesMe = !lovesMe;
  textFlicker = 6;

  const remaining = petals.filter((p) => p.state === "attached").length;
  if (remaining === 0 && !transitionStarted) {
    lovesMe = true;
    daisyFinished = true;
    transitionStarted = true;

    for (let i = 0; i < 16; i++) {
      hearts.push({
        x: CENTER_X - 26 + (i % 5) * 13,
        y: CENTER_Y - 6 - Math.floor(i / 5) * 9,
        phase: i * 0.7,
      });
    }

    setTimeout(() => {
      sceneDaisy.classList.remove("active");
      sceneBouquet.classList.add("active");
    }, 2800);
  }
}

daisyCanvas.addEventListener("pointerdown", pluckNextPetal);

function updateAndRenderDaisy(dt) {
  dctx.clearRect(0, 0, DW, DH);
  drawNightSkyAndHills();
  drawStemAndLeaves();

  // Teks LOVES ME / LOVES ME NOT di bagian atas
  if (textFlicker > 0) textFlicker -= 1;
  const label = lovesMe ? "LOVES ME" : "LOVES ME NOT";
  dctx.save();
  dctx.font = 'bold 18px "Silkscreen", monospace';
  dctx.textAlign = "center";
  dctx.fillStyle = textFlicker > 3 ? "#ffffff" : "#f49ac2";
  dctx.fillText(label, CENTER_X, 34);

  if (!daisyFinished) {
    dctx.font = '8px "Silkscreen", monospace';
    dctx.fillStyle = "rgba(235, 240, 255, 0.72)";
    dctx.fillText("CLICK THE FLOWER", CENTER_X, 50);
  }
  dctx.restore();

  // Kelopak bunga
  for (const p of petals) {
    if (p.state === "attached") {
      drawElongatedPetal(p.x, p.y, p.angle, 1);
    } else if (p.state === "falling") {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 26 * dt;
      p.angle += p.vRot * dt;
      p.alpha = Math.max(0, p.alpha - 0.18 * dt);
      drawElongatedPetal(p.x, p.y, p.angle, p.alpha);
      if (p.y > DH + 20 || p.alpha <= 0) {
        p.state = "gone";
      }
    }
  }

  // Tengah bunga
  drawDaisyCenter();

  // Hati-hati kecil yang naik setelah kelopak terakhir gugur
  for (const h of hearts) {
    h.y -= 24 * dt;
    h.x += Math.sin(h.y * 0.08 + h.phase) * 0.35;
    drawPixelHeart(h.x, h.y, h.phase % 2 > 1 ? "#ff9ec7" : "#ff6fa5");
  }
}

let lastDaisyTime = performance.now();
function daisyLoop(now) {
  const dt = Math.min(0.05, (now - lastDaisyTime) / 1000);
  lastDaisyTime = now;

  if (sceneDaisy.classList.contains("active")) {
    updateAndRenderDaisy(dt);
  }
  requestAnimationFrame(daisyLoop);
}

initDaisy();
requestAnimationFrame(daisyLoop);

/* =========================================================
   ADEGAN 2: Starfield + "I Have Something" + Open -> Flowers
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
