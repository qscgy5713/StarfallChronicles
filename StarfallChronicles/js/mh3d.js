/**
 * 《星隕編年史：魔物獵人 3D 狩獵紀元》 - 零依賴 3D 透視渲染與多部位狩獵引擎 (MH3DRenderer v4.0)
 * 支援：
 * 1. 3D 越肩狩獵視角 (3d_shoulder) / 3D 廣角戰術視角 (3d_orbit) / 2D 經典像素視角 (2d_pixel)
 * 2. 3D 地形岩壁、巨木、深淵熔岩、獵人帳篷營火、翠綠導蟲 (Scoutflies) 立體粒子軌跡
 * 3. 3D 多部位巨型魔物立體模型（頭部 Head / 軀幹 Body / 尾巴 Tail 獨立鎖定、破頭裂角與斷尾模型變化）
 * 4. 魔物獵人標誌性斬味計 (Sharpness Knife)、太刀氣刃槽 (Spirit Gauge) 與 QUEST CLEAR 狩獵印章
 */

class MH3DRenderer {
  constructor(ui) {
    this.ui = ui;
    this.engine = ui.engine;
    this.camX = 2;
    this.camZ = 6;
    this.camYaw = 0; // 0: 朝北(-Z), PI/2: 朝東(+X), PI: 朝南(+Z), -PI/2: 朝西(-X)
    this.targetYaw = 0;
    this.camPitch = 0.62;
    this.fov = 520;
    this.scoutflies = [];
    this.partHitboxes = [];
    this.questClearStampTicks = 0;
    this.lastClearTitle = "";
    this.initScoutflies();
  }

  initScoutflies() {
    this.scoutflies = [];
    for (let i = 0; i < 28; i++) {
      this.scoutflies.push({
        t: i / 28,
        phase: Math.random() * Math.PI * 2,
        offsetR: 0.12 + Math.random() * 0.22
      });
    }
  }

  triggerQuestClearStamp(monsterName, isBoss) {
    this.questClearStampTicks = isBoss ? 130 : 85;
    this.lastClearTitle = isBoss ? `目標討伐達成：${monsterName}` : `狩獵成功：${monsterName}`;
  }

  getViewMode() {
    return (this.engine && this.engine.state && this.engine.state.viewMode) || "3d_shoulder";
  }

  rotateCamera(deltaYaw) {
    this.targetYaw += deltaYaw;
  }

  // 跨區域/傳送門切換時，立即對齊鏡頭座標，防止相機平滑插值產生遠距滑動
  snapCamera() {
    if (this.engine && this.engine.state) {
      this.camX = this.engine.state.x;
      this.camZ = this.engine.state.y;
    }
  }

  // 將鏡頭面向角度轉為最接近的網格移動方向 (供 WASD 相對鏡頭移動或方向對齊)
  getCameraBasisVectors() {
    const sinY = Math.sin(this.camYaw);
    const cosY = Math.cos(this.camYaw);
    return {
      fwdX: Math.round(sinY),
      fwdZ: Math.round(-cosY),
      rightX: Math.round(cosY),
      rightZ: Math.round(sinY)
    };
  }

  getCameraConfig() {
    const mode = this.getViewMode();
    const hx = this.camX;
    const hz = this.camZ;
    if (mode === "3d_orbit") {
      const dist = 9.5;
      const height = 10.8;
      const pitch = 0.78;
      const eyeX = hx - Math.sin(this.camYaw) * dist;
      const eyeY = height;
      const eyeZ = hz + Math.cos(this.camYaw) * dist;
      return { eyeX, eyeY, eyeZ, yaw: this.camYaw, pitch, fov: 560, cullRadius: 15 };
    }
    // 預設 3d_shoulder (魔物獵人第三人稱越肩狩獵視角)
    const dist = 5.4;
    const height = 4.85;
    const pitch = 0.56;
    const shoulderOffset = 0.35;
    const eyeX = hx - Math.sin(this.camYaw) * dist + Math.cos(this.camYaw) * shoulderOffset;
    const eyeY = height;
    const eyeZ = hz + Math.cos(this.camYaw) * dist + Math.sin(this.camYaw) * shoulderOffset;
    return { eyeX, eyeY, eyeZ, yaw: this.camYaw, pitch, fov: 520, cullRadius: 13 };
  }

  projectPoint(wx, wy, wz, cam, w, h) {
    const dx = wx - cam.eyeX;
    const dy = wy - cam.eyeY;
    const dz = wz - cam.eyeZ;

    const cosY = Math.cos(-cam.yaw);
    const sinY = Math.sin(-cam.yaw);
    const rx = dx * cosY + dz * sinY;
    const rz = -dx * sinY + dz * cosY;

    const cosP = Math.cos(cam.pitch);
    const sinP = Math.sin(cam.pitch);
    const cy = dy * cosP - rz * sinP;
    const cz = -rz * cosP - dy * sinP;

    if (cz <= 0.25) return null;
    const scale = cam.fov / cz;
    return {
      sx: w * 0.5 + rx * scale,
      sy: h * 0.5 - cy * scale,
      depth: cz,
      scale
    };
  }

  // 將螢幕滑鼠座標反向投射至 3D 地面 (wy = 0)，回傳對應的地圖格子 (tx, ty)
  screenToWorldTile(lx, ly, w, h) {
    const cam = this.getCameraConfig();
    const ndcX = (lx - w * 0.5) / cam.fov;
    const ndcY = (h * 0.5 - ly) / cam.fov;

    const cosP = Math.cos(cam.pitch);
    const sinP = Math.sin(cam.pitch);
    const denom = sinP - ndcY * cosP;
    if (denom <= 0.002) return null;

    const cz = cam.eyeY / denom;
    if (cz <= 0.1 || cz > 50) return null;

    const rx = ndcX * cz;
    const rz = (-ndcY * sinP - cosP) * cz;

    const cosY = Math.cos(cam.yaw);
    const sinY = Math.sin(cam.yaw);
    const dx = rx * cosY - rz * sinY;
    const dz = rx * sinY + rz * cosY;

    const wx = cam.eyeX + dx;
    const wz = cam.eyeZ + dz;

    return {
      tx: Math.floor(wx + 0.5),
      ty: Math.floor(wz + 0.5)
    };
  }

  // ---- 光影與大氣霧輔助 ----
  parseColor(col) {
    if (typeof col !== "string") return null;
    if (col[0] === "#") {
      let h = col.slice(1);
      if (h.length === 3) h = h.split("").map(c => c + c).join("");
      if (h.length < 6) return null;
      return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
    }
    const m = col.match(/rgba?\(([^)]+)\)/);
    if (m) {
      const a = m[1].split(",").map(v => parseFloat(v));
      return [a[0], a[1], a[2]];
    }
    return null;
  }

  // 亮度縮放 (light) 後再與霧色混合 (fog 0~1)
  shade(col, light = 1, fog = 0) {
    const c = this.parseColor(col);
    if (!c) return col;
    const f = this.fogRGB || [10, 16, 28];
    const out = c.map((v, i) => {
      const lit = Math.min(255, v * light);
      return Math.round(lit + (f[i] - lit) * fog);
    });
    return `rgb(${out[0]},${out[1]},${out[2]})`;
  }

  fogAt(depth) {
    const r = (this.fogRadius || 12);
    return Math.max(0, Math.min(0.82, (depth - r * 0.28) / (r * 0.95)));
  }

  drawQuad3D(ctx, pts, fillCol, strokeCol = null, lineWidth = 1) {
    if (pts.some(p => !p)) return;
    ctx.beginPath();
    ctx.moveTo(pts[0].sx, pts[0].sy);
    for (let i = 1; i < pts.length; i++) {
      ctx.lineTo(pts[i].sx, pts[i].sy);
    }
    ctx.closePath();
    if (fillCol) {
      ctx.fillStyle = fillCol;
      ctx.fill();
    }
    if (strokeCol) {
      ctx.strokeStyle = strokeCol;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    }
  }

  drawBox3D(ctx, cam, w, h, cx, y0, cz, sx, sy, sz, palette) {
    const hx = sx * 0.5;
    const hz = sz * 0.5;
    const y1 = y0 + sy;

    const p000 = this.projectPoint(cx - hx, y0, cz - hz, cam, w, h);
    const p100 = this.projectPoint(cx + hx, y0, cz - hz, cam, w, h);
    const p101 = this.projectPoint(cx + hx, y0, cz + hz, cam, w, h);
    const p001 = this.projectPoint(cx - hx, y0, cz + hz, cam, w, h);

    const p010 = this.projectPoint(cx - hx, y1, cz - hz, cam, w, h);
    const p110 = this.projectPoint(cx + hx, y1, cz - hz, cam, w, h);
    const p111 = this.projectPoint(cx + hx, y1, cz + hz, cam, w, h);
    const p011 = this.projectPoint(cx - hx, y1, cz + hz, cam, w, h);

    if (!p000 && !p111) return;

    const faces = [
      { pts: [p000, p100, p110, p010], col: palette.north || palette.side, z: cz - hz },
      { pts: [p001, p101, p111, p011], col: palette.south || palette.front, z: cz + hz },
      { pts: [p000, p001, p011, p010], col: palette.west || palette.sideDark, z: cx - hx },
      { pts: [p100, p101, p111, p110], col: palette.east || palette.side, z: cx + hx }
    ];

    faces.sort((a, b) => {
      const da = a.pts.reduce((acc, p) => acc + (p ? p.depth : 99), 0);
      const db = b.pts.reduce((acc, p) => acc + (p ? p.depth : 99), 0);
      return db - da;
    });

    const centerDepth = (p000 || p111) ? ((p000 ? p000.depth : p111.depth) + (p111 ? p111.depth : p000.depth)) / 2 : 0;
    const fog = this.fogAt(centerDepth);
    const edge = palette.stroke || "rgba(0, 0, 0, 0.28)";

    faces.forEach(f => {
      if (f.pts.some(pt => !pt)) return;
      // 側面由下往上漸亮，模擬環境光遮蔽
      const yTop = Math.min(...f.pts.map(pt => pt.sy));
      const yBot = Math.max(...f.pts.map(pt => pt.sy));
      const g = ctx.createLinearGradient(0, yTop, 0, yBot);
      g.addColorStop(0, this.shade(f.col, 1.18, fog));
      g.addColorStop(1, this.shade(f.col, 0.62, fog));
      this.drawQuad3D(ctx, f.pts, g, edge, 0.7);
    });

    if (palette.top && p010 && p110 && p111 && p011) {
      this.drawQuad3D(ctx, [p010, p110, p111, p011], this.shade(palette.top, 1.12, fog), "rgba(255,255,255,0.10)", 0.8);
    }
  }

  getBiome3DPalette(chNum) {
    const palettes = {
      1: {
        day: true,
        skyTop: "#3f8fe0",
        skyHorizon: "#bfe3f2",
        bgMid: "#4d8a3c",
        bgBottom: "#2f5f2a",
        mountain: "rgba(88, 128, 150, 0.6)",
        groundA: "#5a9a3e",
        groundB: "#5d9d41",
        groundStroke: "rgba(20, 60, 20, 0.10)",
        wallTop: "#1f5138",
        wallFront: "#143325",
        wallSide: "#0f261c",
        wallSideDark: "#091912",
        liquid: "#0284c7",
        liquidGlow: "#38bdf8",
        bridge: "#78350f",
        accent: "#4ade80"
      },
      2: {
        day: true,
        skyTop: "#2f86d6",
        skyHorizon: "#c9ecf5",
        bgMid: "#3f8f95",
        bgBottom: "#215a66",
        mountain: "rgba(96, 140, 170, 0.55)",
        sun: "255, 250, 230",
        detailA: "#7dd3fc",
        detailB: "#fef9c3",
        groundA: "#8aa7a0",
        groundB: "#94b2aa",
        groundStroke: "rgba(20, 60, 70, 0.12)",
        wallTop: "#cbd5e1",
        wallFront: "#7f93a8",
        wallSide: "#64788f",
        wallSideDark: "#4b5d73",
        liquid: "#0ea5c6",
        liquidGlow: "#a5f3fc",
        bridge: "#a16207",
        accent: "#38bdf8"
      },
      3: {
        day: true,
        skyTop: "#d9531e",
        skyHorizon: "#fcd9a0",
        bgMid: "#a4552a",
        bgBottom: "#5e2a14",
        mountain: "rgba(130, 60, 40, 0.6)",
        sun: "255, 236, 190",
        detailA: "#fb923c",
        detailB: "#fde68a",
        groundA: "#a8633a",
        groundB: "#b3703f",
        groundStroke: "rgba(70, 30, 10, 0.14)",
        wallTop: "#8a5a40",
        wallFront: "#6b3f2a",
        wallSide: "#522f1f",
        wallSideDark: "#3b2015",
        liquid: "#ea580c",
        liquidGlow: "#fde047",
        bridge: "#57534e",
        accent: "#fb923c"
      },
      4: {
        day: true,
        skyTop: "#6fb1ee",
        skyHorizon: "#eef6fc",
        bgMid: "#9db9d3",
        bgBottom: "#6f8fb0",
        mountain: "rgba(190, 210, 232, 0.75)",
        sun: "255, 255, 245",
        detailA: "#ffffff",
        detailB: "#bae6fd",
        groundA: "#e6eff7",
        groundB: "#d6e4f0",
        groundStroke: "rgba(80, 110, 150, 0.14)",
        wallTop: "#ffffff",
        wallFront: "#9fb6cf",
        wallSide: "#7c97b5",
        wallSideDark: "#5f7b9b",
        liquid: "#60a5fa",
        liquidGlow: "#e0f2fe",
        bridge: "#a16207",
        accent: "#7dd3fc"
      },
      5: {
        day: true,
        skyTop: "#5b2a86",
        skyHorizon: "#ffb784",
        bgMid: "#7a3b55",
        bgBottom: "#35162f",
        mountain: "rgba(70, 30, 70, 0.65)",
        sun: "255, 190, 120",
        detailA: "#f472b6",
        detailB: "#fcd34d",
        groundA: "#5b3a4d",
        groundB: "#664358",
        groundStroke: "rgba(20, 5, 20, 0.2)",
        wallTop: "#7c3aed",
        wallFront: "#4c1d95",
        wallSide: "#3b0f73",
        wallSideDark: "#240a45",
        liquid: "#be123c",
        liquidGlow: "#fb7185",
        bridge: "#a16207",
        accent: "#f43f5e"
      }
    };
    return palettes[chNum] || palettes[1];
  }

  // ==================== 3D 魔物獵人探索世界主渲染 ====================
  draw3DWorld(ctx, w, h, animFrame) {
    const s = this.engine.state;
    const map = this.engine.activeMap;
    if (!map || !map.length) return;

    // 平滑追蹤主角座標與視角旋轉
    this.camX += (s.x - this.camX) * 0.26;
    this.camZ += (s.y - this.camZ) * 0.26;
    this.camYaw += (this.targetYaw - this.camYaw) * 0.22;

    const cam = this.getCameraConfig();
    const chNum = s.chapter || 1;
    const pal = this.getBiome3DPalette(chNum);
    this.fogRGB = this.parseColor(pal.skyHorizon) || [10, 16, 28];
    this.fogRadius = cam.cullRadius;
    const expMap = this.engine.getCurrentExploredMap();
    const comp = this.engine.getComputedStats();
    const obj = this.engine.getCurrentObjective();

    // 1. 繪製 3D 狩獵天幕、遠山稜線與星雲大氣
    const horizonY = Math.round(h * 0.34);
    const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY + 60);
    skyGrad.addColorStop(0, pal.skyTop);
    skyGrad.addColorStop(1, pal.skyHorizon);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, horizonY + 60);

    const groundBgGrad = ctx.createLinearGradient(0, horizonY, 0, h);
    groundBgGrad.addColorStop(0, pal.skyHorizon);
    groundBgGrad.addColorStop(0.25, pal.bgMid || "#090e18");
    groundBgGrad.addColorStop(1, pal.bgBottom || "#04070d");
    ctx.fillStyle = groundBgGrad;
    ctx.fillRect(0, horizonY, w, h - horizonY);

    // 星點與天光
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    for (let i = 0; i < (pal.day ? 0 : 60); i++) {
      const sx = ((i * 97.13 + this.camYaw * 60) % w + w) % w;
      const sy = (i * 53.7) % (horizonY * 0.9);
      ctx.globalAlpha = 0.25 + 0.5 * ((Math.sin(animFrame * 0.03 + i) + 1) / 2);
      ctx.fillRect(sx, sy, i % 5 === 0 ? 2 : 1, i % 5 === 0 ? 2 : 1);
    }
    ctx.globalAlpha = 1;
    const sunX = (((w * 0.72 - this.camYaw * 120) % w) + w) % w;
    const sunG = ctx.createRadialGradient(sunX, horizonY, 4, sunX, horizonY, w * 0.32);
    sunG.addColorStop(0, pal.day ? `rgba(${pal.sun || "255, 252, 225"}, 0.95)` : "rgba(255, 236, 170, 0.55)");
    sunG.addColorStop(0.4, pal.day ? `rgba(${pal.sun || "255, 240, 190"}, 0.28)` : "rgba(255, 190, 110, 0.14)");
    sunG.addColorStop(1, "rgba(255, 190, 110, 0)");
    ctx.fillStyle = sunG;
    ctx.fillRect(0, 0, w, horizonY + 60);

    if (pal.day) {
      ctx.fillStyle = chNum === 3 ? "rgba(90,40,30,0.45)" : chNum === 5 ? "rgba(255,170,150,0.5)" : "rgba(255,255,255,0.75)";
      for (let i = 0; i < 6; i++) {
        const cx = (((i * 263 + this.camYaw * 90 + animFrame * 0.12) % (w + 240)) + w + 240) % (w + 240) - 120;
        const cy = 24 + (i * 37) % Math.max(40, horizonY - 50);
        [[0, 0, 46, 14], [-34, 5, 32, 11], [36, 6, 36, 12], [8, -9, 30, 12]].forEach(([ox, oy, rx, ry]) => {
          ctx.beginPath(); ctx.ellipse(cx + ox, cy + oy, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
        });
      }
    }

    // 遠景 3D 狩獵山脈與古龍骨シルエット (隨 camYaw 水平視差捲動)
    const yawShift = ((this.camYaw / (Math.PI * 2)) * w * 1.5) % w;
    ctx.fillStyle = pal.mountain || "rgba(8, 13, 24, 0.72)";
    ctx.beginPath();
    ctx.moveTo(0, horizonY + 22);
    for (let sx = 0; sx <= w + 60; sx += 48) {
      const ridgeH = 26 + Math.sin((sx + yawShift) * 0.018 + chNum) * 18 + Math.cos((sx + yawShift) * 0.045) * 10;
      ctx.lineTo(sx, horizonY + 12 - ridgeH);
    }
    ctx.lineTo(w, horizonY + 22);
    ctx.closePath();
    ctx.fill();

    // 2. 收集視野範圍內的 3D 地塊與立體物件並依 Z 深度排序 (Painter's Algorithm)
    const rows = map.length;
    const cols = map[0].length;
    const r = cam.cullRadius;
    const minX = Math.max(0, Math.floor(s.x - r));
    const maxX = Math.min(cols - 1, Math.ceil(s.x + r));
    const minY = Math.max(0, Math.floor(s.y - r));
    const maxY = Math.min(rows - 1, Math.ceil(s.y + r));

    const renderQueue = [];

    for (let ty = minY; ty <= maxY; ty++) {
      for (let tx = minX; tx <= maxX; tx++) {
        const coord = `${tx},${ty}`;
        const explored = !!expMap[coord];
        if (!explored) continue;

        const centerP = this.projectPoint(tx, 0, ty, cam, w, h);
        if (!centerP || centerP.depth > r + 4) continue;

        const tile = map[ty][tx];
        const distToHero = Math.hypot(tx - s.x, ty - s.y);
        const visible = distToHero <= comp.vision + 1.2;

        renderQueue.push({
          kind: "tile",
          tx,
          ty,
          tile,
          visible,
          depth: centerP.depth
        });

        if (tile !== "." && tile !== "#" && tile !== "~" && tile !== "=") {
          renderQueue.push({
            kind: "object",
            tx,
            ty,
            tile,
            visible,
            depth: centerP.depth - 0.15
          });
        }
      }
    }

    // 加入主角獵人與隨行艾露貓 3D 模型
    const heroCenterP = this.projectPoint(this.camX, 0, this.camZ, cam, w, h);
    if (heroCenterP) {
      renderQueue.push({
        kind: "hunter",
        tx: this.camX,
        ty: this.camZ,
        depth: heroCenterP.depth - 0.2
      });
    }

    // 由遠到近排序 (depth 越大越先畫)
    renderQueue.sort((a, b) => b.depth - a.depth);

    // 3. 逐一渲染 3D 地塊、牆體、魔物與獵人
    for (const item of renderQueue) {
      if (item.kind === "tile") {
        this.draw3DTile(ctx, cam, w, h, item.tx, item.ty, item.tile, chNum, pal, item.visible, animFrame);
      } else if (item.kind === "object") {
        this.draw3DFieldObject(ctx, cam, w, h, item.tx, item.ty, item.tile, chNum, pal, animFrame);
      } else if (item.kind === "hunter") {
        this.draw3DHunterOnField(ctx, cam, w, h, item.tx, item.ty, animFrame);
      }
    }

    // 4. 繪製《魔物獵人》翠綠導蟲 (Scoutflies) 3D 立體引導軌跡
    if (obj) {
      this.draw3DScoutflies(ctx, cam, w, h, obj, animFrame);
    }

    // 5. 繪製 [Q] 星輝脈衝 / 音爆彈 3D 地面擴散波紋
    if (this.engine.lastPulseAnim && this.engine.lastPulseAnim.ticks > 0) {
      const pa = this.engine.lastPulseAnim;
      const prog = (pa.maxTicks - pa.ticks) / pa.maxTicks;
      const rad = prog * 3.5;
      ctx.save();
      ctx.strokeStyle = `rgba(74, 222, 128, ${(1 - prog) * 0.9})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let a = 0; a <= Math.PI * 2 + 0.2; a += 0.25) {
        const pt = this.projectPoint(pa.x + Math.cos(a) * rad, 0.08, pa.y + Math.sin(a) * rad, cam, w, h);
        if (pt) {
          if (a === 0) ctx.moveTo(pt.sx, pt.sy);
          else ctx.lineTo(pt.sx, pt.sy);
        }
      }
      ctx.stroke();
      ctx.restore();
      pa.ticks--;
    }

    // 5.5 後製：地平線霧氣、主角光暈、飄浮微粒、暗角
    this.drawAtmosphere(ctx, w, h, animFrame, pal, cam);

    // 6. 繪製 3D 物件頭頂獵人公會名牌與浮動跳字
    this.draw3DWorldLabelsAndFloats(ctx, cam, w, h, expMap, obj, animFrame);

    // 7. 繪製魔物獵人 3D 專屬左上角 HUD（斬味刀刃計、太刀氣刃槽、貓飯狀態、3D 方位羅盤）
    this.drawMonsterHunterFieldHUD(ctx, w, h, animFrame);

    // 8. 若剛完成大型狩獵，繪製魔物獵人經典【QUEST CLEAR! 狩獵達成】黃金火漆印章動畫
    if (this.questClearStampTicks > 0) {
      this.drawQuestClearOverlay(ctx, w, h);
      this.questClearStampTicks--;
    }
  }

  drawAtmosphere(ctx, w, h, animFrame, pal, cam) {
    ctx.save();
    // 遠方霧牆
    const horizonY = Math.round(h * 0.34);
    const fogCol = this.parseColor(pal.skyHorizon) || [10, 16, 28];
    const fg = ctx.createLinearGradient(0, horizonY - 20, 0, horizonY + h * 0.22);
    fg.addColorStop(0, `rgba(${fogCol.join(",")},0.0)`);
    fg.addColorStop(0.35, `rgba(${fogCol.join(",")},${pal.day ? 0.55 : 0.42})`);
    fg.addColorStop(1, `rgba(${fogCol.join(",")},0.0)`);
    ctx.fillStyle = fg;
    ctx.fillRect(0, horizonY - 20, w, h * 0.22 + 20);

    // 主角周圍暖色光暈
    const hp = this.projectPoint(this.camX, 0.6, this.camZ, cam, w, h);
    if (hp) {
      const rad = Math.max(90, w * 0.22);
      const lg = ctx.createRadialGradient(hp.sx, hp.sy, 4, hp.sx, hp.sy, rad);
      lg.addColorStop(0, pal.day ? "rgba(255, 240, 190, 0.10)" : "rgba(255, 226, 150, 0.20)");
      lg.addColorStop(1, "rgba(255, 226, 150, 0)");
      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = lg;
      ctx.fillRect(hp.sx - rad, hp.sy - rad, rad * 2, rad * 2);
      ctx.globalCompositeOperation = "source-over";
    }

    // 飄浮微粒 (螢火 / 塵 / 餘燼)
    ctx.fillStyle = pal.accent;
    for (let i = 0; i < 26; i++) {
      const t = animFrame * 0.004 + i * 12.9898;
      const px = ((Math.sin(t * 1.7 + i) * 0.5 + 0.5) * w + animFrame * 0.15 * (1 + (i % 3))) % w;
      const py = (Math.cos(t * 1.3 + i * 2.1) * 0.5 + 0.5) * h * 0.85 + h * 0.1;
      ctx.globalAlpha = 0.18 + 0.32 * (Math.sin(animFrame * 0.05 + i) * 0.5 + 0.5);
      ctx.fillRect(px, py, 2, 2);
    }
    ctx.globalAlpha = 1;

    // 白天：斜射陽光光束
    if (pal.day) {
      ctx.globalCompositeOperation = "lighter";
      for (let i = 0; i < 5; i++) {
        const x0 = w * (0.45 + i * 0.12) + Math.sin(animFrame * 0.01 + i) * 12;
        const g2 = ctx.createLinearGradient(x0, 0, x0 - w * 0.25, h * 0.8);
        g2.addColorStop(0, "rgba(255,244,200,0.10)");
        g2.addColorStop(1, "rgba(255,244,200,0)");
        ctx.fillStyle = g2;
        ctx.beginPath();
        ctx.moveTo(x0, 0); ctx.lineTo(x0 + w * 0.05, 0);
        ctx.lineTo(x0 - w * 0.2, h * 0.8); ctx.lineTo(x0 - w * 0.3, h * 0.8);
        ctx.closePath(); ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
    }

    // 暗角
    const vg = ctx.createRadialGradient(w / 2, h / 2, h * 0.38, w / 2, h / 2, h * 0.95);
    vg.addColorStop(0, "rgba(0,0,0,0)");
    vg.addColorStop(1, pal.day ? "rgba(10,30,10,0.28)" : "rgba(0,0,0,0.55)");
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  // 第 2~5 章專屬地形：礁石棕櫚 / 熔岩尖岩 / 雪松冰晶 / 紫晶柱
  drawBiomeWall(ctx, cam, w, h, tx, ty, chNum, af) {
    const hs = ((tx * 7 + ty * 13) % 5);
    const tall = 1 + hs * 0.12;
    this.withSprite(ctx, cam, w, h, tx, ty, (u, fog) => {
      if (chNum === 2) {
        if (hs % 2 === 0) {
          // 棕櫚樹
          const sway = Math.sin(af * 0.04 + tx) * u * 0.05;
          ctx.strokeStyle = this.shade("#92400e", 1, fog); ctx.lineWidth = u * 0.13; ctx.lineCap = "round";
          ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(u * 0.12, -u * 0.6, u * 0.05 + sway, -u * 1.25 * tall); ctx.stroke();
          const cx = u * 0.05 + sway, cy = -u * 1.25 * tall;
          for (let i = 0; i < 7; i++) {
            const a = -Math.PI + (i / 6) * Math.PI;
            ctx.fillStyle = this.shade(i % 2 ? "#16a34a" : "#4ade80", 1, fog);
            ctx.beginPath(); ctx.moveTo(cx, cy);
            ctx.quadraticCurveTo(cx + Math.cos(a) * u * 0.4, cy + Math.sin(a) * u * 0.5 - u * 0.15, cx + Math.cos(a) * u * 0.78, cy + Math.sin(a) * u * 0.2 + u * 0.3);
            ctx.quadraticCurveTo(cx + Math.cos(a) * u * 0.4, cy + Math.sin(a) * u * 0.3, cx, cy); ctx.fill();
          }
          ctx.fillStyle = this.shade("#78350f", 1, fog);
          ctx.beginPath(); ctx.arc(cx - u * 0.05, cy + u * 0.06, u * 0.05, 0, 7); ctx.arc(cx + u * 0.06, cy + u * 0.08, u * 0.05, 0, 7); ctx.fill();
        } else {
          // 海岸礁石群
          [[-0.25, 0.5, 0.3], [0.2, 0.62, 0.34], [0, 0.85 * tall, 0.3]].forEach(([ox, hh, rr], i) => {
            const g = ctx.createLinearGradient(0, -u * hh, 0, 0);
            g.addColorStop(0, this.shade("#e2e8f0", 1, fog)); g.addColorStop(1, this.shade("#64748b", 1, fog));
            ctx.fillStyle = g;
            ctx.beginPath(); ctx.moveTo(u * (ox - rr), 0); ctx.quadraticCurveTo(u * (ox - rr * 0.8), -u * hh, u * ox, -u * hh); ctx.quadraticCurveTo(u * (ox + rr * 0.9), -u * hh * 0.8, u * (ox + rr), 0); ctx.closePath(); ctx.fill(); ctx.stroke();
          });
          ctx.fillStyle = this.shade("#bbf7d0", 1, fog);
          ctx.fillRect(-u * 0.3, -u * 0.04, u * 0.6, u * 0.04);
        }
      } else if (chNum === 3) {
        // 熔岩尖岩
        const hh = u * 1.25 * tall;
        const g = ctx.createLinearGradient(-u * 0.4, 0, u * 0.4, 0);
        g.addColorStop(0, this.shade("#a8714a", 1.1, fog)); g.addColorStop(0.55, this.shade("#6b3f2a", 1, fog)); g.addColorStop(1, this.shade("#2f1a10", 1, fog));
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.moveTo(-u * 0.42, 0); ctx.lineTo(-u * 0.3, -hh * 0.55); ctx.lineTo(-u * 0.1, -hh * 0.78); ctx.lineTo(u * 0.02, -hh);
        ctx.lineTo(u * 0.16, -hh * 0.7); ctx.lineTo(u * 0.34, -hh * 0.38); ctx.lineTo(u * 0.44, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.strokeStyle = `rgba(251,146,60,${0.55 + Math.sin(af * 0.1 + tx) * 0.25})`; ctx.lineWidth = Math.max(1.5, u * 0.035);
        ctx.beginPath(); ctx.moveTo(-u * 0.05, -hh * 0.2); ctx.lineTo(u * 0.04, -hh * 0.45); ctx.lineTo(-u * 0.04, -hh * 0.65); ctx.stroke();
        this.glow(ctx, 0, -hh * 0.4, u * 0.7, "rgba(255,120,40,A)", 0.16);
      } else if (chNum === 4) {
        if (hs % 2 === 0) {
          // 雪松
          const hh = u * 1.35 * tall;
          ctx.fillStyle = this.shade("#78350f", 1, fog); ctx.fillRect(-u * 0.05, -u * 0.2, u * 0.1, u * 0.2);
          for (let i = 0; i < 4; i++) {
            const y1 = -u * 0.15 - (hh - u * 0.15) * (i / 4), wd = u * (0.46 - i * 0.09), y0 = y1 - (hh / 3.2);
            ctx.fillStyle = this.vGrad(ctx, y0, y1, "#2f6f4f", "#14532d", fog);
            ctx.beginPath(); ctx.moveTo(-wd, y1); ctx.lineTo(0, y0); ctx.lineTo(wd, y1); ctx.closePath(); ctx.fill(); ctx.stroke();
            ctx.fillStyle = this.shade("#ffffff", 1, fog);
            ctx.beginPath(); ctx.moveTo(-wd * 0.7, y1 - (y1 - y0) * 0.35); ctx.lineTo(0, y0); ctx.lineTo(wd * 0.7, y1 - (y1 - y0) * 0.35); ctx.quadraticCurveTo(0, y1 - (y1 - y0) * 0.1, -wd * 0.7, y1 - (y1 - y0) * 0.35); ctx.fill();
          }
        } else {
          // 冰晶
          [[-0.18, 0.7, 0.16], [0.16, 0.95 * tall, 0.18], [0, 0.55, 0.14]].forEach(([ox, hh, rr]) => {
            const g = ctx.createLinearGradient(0, -u * hh, 0, 0);
            g.addColorStop(0, this.shade("#f0f9ff", 1, fog)); g.addColorStop(1, this.shade("#38bdf8", 1, fog));
            ctx.fillStyle = g; ctx.globalAlpha = 0.92;
            ctx.beginPath(); ctx.moveTo(u * (ox - rr), 0); ctx.lineTo(u * (ox - rr * 0.7), -u * hh * 0.75); ctx.lineTo(u * ox, -u * hh); ctx.lineTo(u * (ox + rr * 0.7), -u * hh * 0.75); ctx.lineTo(u * (ox + rr), 0); ctx.closePath(); ctx.fill(); ctx.stroke();
            ctx.globalAlpha = 1;
          });
        }
      } else {
        // 紫晶結晶柱
        [[-0.26, 0.65, 0.12, 0.25], [0.24, 0.8, 0.13, -0.2], [0, 1.1 * tall, 0.17, 0], [0.04, 0.5, 0.1, 0.4]].forEach(([ox, hh, rr, rot], i) => {
          ctx.save(); ctx.translate(u * ox, 0); ctx.rotate(rot * 0.5);
          const g = ctx.createLinearGradient(-u * rr, 0, u * rr, 0);
          g.addColorStop(0, this.shade("#e9d5ff", 1, fog)); g.addColorStop(0.5, this.shade("#a855f7", 1, fog)); g.addColorStop(1, this.shade("#4c1d95", 1, fog));
          ctx.fillStyle = g;
          ctx.beginPath(); ctx.moveTo(-u * rr, 0); ctx.lineTo(-u * rr, -u * hh * 0.8); ctx.lineTo(0, -u * hh); ctx.lineTo(u * rr, -u * hh * 0.8); ctx.lineTo(u * rr, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
          ctx.strokeStyle = "rgba(255,255,255,0.45)"; ctx.beginPath(); ctx.moveTo(0, -u * hh); ctx.lineTo(0, 0); ctx.stroke();
          ctx.strokeStyle = "rgba(8,12,20,0.85)";
          ctx.restore();
        });
        this.glow(ctx, 0, -u * 0.55, u * 0.9, "rgba(192,132,252,A)", 0.22 + Math.sin(af * 0.07 + tx) * 0.07);
      }
    });
  }

  draw3DTile(ctx, cam, w, h, tx, ty, tile, chNum, pal, visible, animFrame) {
    const p00 = this.projectPoint(tx - 0.5, 0, ty - 0.5, cam, w, h);
    const p10 = this.projectPoint(tx + 0.5, 0, ty - 0.5, cam, w, h);
    const p11 = this.projectPoint(tx + 0.5, 0, ty + 0.5, cam, w, h);
    const p01 = this.projectPoint(tx - 0.5, 0, ty + 0.5, cam, w, h);
    if (!p00 || !p10 || !p11 || !p01) return;

    const isHover = this.ui.hoverTile && this.ui.hoverTile.x === tx && this.ui.hoverTile.y === ty;
    const checker = (tx + ty) % 2 === 0;

    if (tile === "~") {
      // 深水 / 熔岩 3D 低窪河道
      const wave = Math.sin(animFrame * 0.08 + tx * 0.7 + ty * 0.5) * 0.06;
      const w00 = this.projectPoint(tx - 0.5, -0.18 + wave, ty - 0.5, cam, w, h);
      const w10 = this.projectPoint(tx + 0.5, -0.18 + wave, ty - 0.5, cam, w, h);
      const w11 = this.projectPoint(tx + 0.5, -0.18 + wave, ty + 0.5, cam, w, h);
      const w01 = this.projectPoint(tx - 0.5, -0.18 + wave, ty + 0.5, cam, w, h);
      this.drawQuad3D(ctx, [w00, w10, w11, w01], pal.liquid, pal.liquidGlow, 1);
      return;
    }

    if (tile === "=") {
      // 3D 立體古橋與木欄杆
      this.drawBox3D(ctx, cam, w, h, tx, -0.05, ty, 0.96, 0.16, 0.96, {
        top: pal.bridge,
        front: "#451a03",
        side: "#3b1502",
        sideDark: "#290f02",
        stroke: "#facc15"
      });
      return;
    }

    // 繪製地面石板
    const noise = (((tx * 73856093) ^ (ty * 19349663)) >>> 0) % 100 / 100;
    const floorBase = checker ? pal.groundA : pal.groundB;
    const tileFog = this.fogAt((p00.depth + p11.depth) / 2);
    let floorCol = visible ? this.shade(floorBase, 0.82 + noise * 0.4, tileFog) : (pal.day ? (pal.bgBottom || "#3c6a30") : "#0a0f1a");
    this.drawQuad3D(
      ctx,
      [p00, p10, p11, p01],
      floorCol,
      isHover ? "#facc15" : (visible ? "rgba(0,0,0,0.12)" : pal.groundStroke),
      isHover ? 2.5 : 0.6
    );
    // 地表細節：草簇 / 碎石斑點
    if (visible && tile !== "#" && tile !== "W" && noise > 0.35) {
      const cx = (p00.sx + p11.sx) / 2;
      const cy = (p00.sy + p11.sy) / 2;
      const sc = Math.max(1, (p10.sx - p00.sx) * 0.07);
      ctx.fillStyle = pal.day ? this.shade(noise > 0.7 ? (pal.detailB || "#fde047") : (pal.detailA || "#86efac"), 0.9, Math.min(0.9, tileFog + 0.1)) : this.shade(pal.accent, 0.5 + noise * 0.5, Math.min(0.9, tileFog + 0.35));
      for (let k = 0; k < 3; k++) {
        const ox = (((tx * 31 + ty * 17 + k * 11) % 9) - 4) * sc * 2.2;
        const oy = (((tx * 13 + ty * 29 + k * 7) % 5) - 2) * sc * 0.9;
        ctx.fillRect(cx + ox, cy + oy, sc * 1.4, sc * 0.9);
      }
    }

    // 3D 立體牆體 / 巨木 / 黑曜石柱 (# 或隱藏裂隙牆 W)
    if (tile === "#" || tile === "W") {
      const wallH = tile === "W" ? 0.95 : 1.15 + ((tx * 7 + ty * 13) % 3) * 0.18;
      if (chNum === 1 && tile === "#") {
        // 第一章古代樹森林：立體岩基 + 巨木樹幹 + 3D 樹冠
        this.drawBox3D(ctx, cam, w, h, tx, 0, ty, 0.92, 0.45, 0.92, {
          top: "#1e3a2a",
          front: "#13261b",
          side: "#0f1f16",
          sideDark: "#09140e"
        });
        this.drawBox3D(ctx, cam, w, h, tx, 0.45, ty, 0.42, 0.55, 0.42, {
          top: "#5c4033",
          front: "#4a3328",
          side: "#3b2820",
          sideDark: "#2b1d17"
        });
        // 圓潤多層樹冠 (漸層球體疊加)
        const base = this.projectPoint(tx, 0.95, ty, cam, w, h);
        const edgeP = this.projectPoint(tx + 0.5, 0.95, ty, cam, w, h);
        if (base && edgeP) {
          const R = Math.max(6, Math.abs(edgeP.sx - base.sx) * 1.15);
          const fog = this.fogAt(base.depth);
          const blobs = [[-0.45, 0.15, 0.8], [0.45, 0.2, 0.75], [0, -0.35, 0.95], [0, 0.35, 0.7]];
          blobs.forEach(([ox, oy, k], i) => {
            const bx = base.sx + ox * R;
            const by = base.sy + oy * R * 0.8 - R * 0.35;
            const rr = R * k;
            const g = ctx.createRadialGradient(bx - rr * 0.3, by - rr * 0.35, rr * 0.1, bx, by, rr);
            g.addColorStop(0, this.shade("#4ade80", 0.95 - i * 0.05, fog));
            g.addColorStop(0.55, this.shade("#15803d", 1, fog));
            g.addColorStop(1, this.shade("#052e16", 1, fog));
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(bx, by, rr, 0, Math.PI * 2);
            ctx.fill();
          });
        }
      } else if (tile === "#" && chNum >= 2 && visible) {
        this.drawBiomeWall(ctx, cam, w, h, tx, ty, chNum, animFrame);
      } else {
        this.drawBox3D(ctx, cam, w, h, tx, 0, ty, 0.96, wallH, 0.96, {
          top: tile === "W" ? "#1e3a5f" : pal.wallTop,
          front: tile === "W" ? "#0f2942" : pal.wallFront,
          side: pal.wallSide,
          sideDark: pal.wallSideDark,
          stroke: tile === "W" ? "rgba(56, 189, 248, 0.65)" : "rgba(15, 23, 42, 0.55)"
        });
      }
    }
  }

  // ==================== 場景物件與魔物立體精靈 ====================
  withSprite(ctx, cam, w, h, x, z, fn, flip = false) {
    const p = typeof x === "object" ? { sx: x.sx, sy: x.sy, scale: x.u, depth: 0 } : this.projectPoint(x, 0, z, cam, w, h);
    if (!p) return;
    const u = p.scale;
    const fog = this.fogAt(p.depth) * 0.6;
    ctx.save();
    ctx.translate(p.sx, p.sy);
    if (flip) ctx.scale(-1, 1);
    ctx.lineJoin = "round";
    ctx.lineWidth = Math.max(1, u * 0.025);
    ctx.strokeStyle = "rgba(8,12,20,0.85)";
    // 地面落影
    ctx.fillStyle = "rgba(0,0,0,0.38)";
    ctx.beginPath(); ctx.ellipse(0, 0, u * 0.42, u * 0.14, 0, 0, Math.PI * 2); ctx.fill();
    fn(u, fog);
    ctx.restore();
  }

  glow(ctx, x, y, r, col, a) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, col.replace("A", a));
    g.addColorStop(1, col.replace("A", 0));
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
    ctx.restore();
  }

  drawTentAndCampfire(ctx, cam, w, h, tx, ty, af) {
    this.withSprite(ctx, cam, w, h, tx - 0.15, ty - 0.1, (u, fog) => {
      // 帳篷
      ctx.fillStyle = this.vGrad(ctx, -u * 0.8, 0, "#d97706", "#78350f", fog);
      ctx.beginPath(); ctx.moveTo(0, -u * 0.8); ctx.lineTo(u * 0.5, 0); ctx.lineTo(-u * 0.5, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = this.shade("#451a03", 1, fog);
      ctx.beginPath(); ctx.moveTo(0, -u * 0.42); ctx.lineTo(u * 0.14, 0); ctx.lineTo(-u * 0.14, 0); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = this.shade("#fde68a", 1, fog);
      ctx.beginPath(); ctx.moveTo(0, -u * 0.8); ctx.lineTo(0, -u * 0.95); ctx.stroke();
      ctx.fillStyle = "#ef4444"; ctx.fillRect(0, -u * 0.95, u * 0.2, u * 0.1);
    });
    this.withSprite(ctx, cam, w, h, tx + 0.22, ty + 0.2, (u, fog) => {
      // 柴堆
      ctx.fillStyle = this.shade("#78350f", 1, fog);
      ctx.save(); ctx.rotate(0.35); ctx.fillRect(-u * 0.2, -u * 0.06, u * 0.4, u * 0.07); ctx.restore();
      ctx.save(); ctx.rotate(-0.35); ctx.fillRect(-u * 0.2, -u * 0.06, u * 0.4, u * 0.07); ctx.restore();
      // 火焰
      const fl = Math.sin(af * 0.3) * 0.1;
      [["#ef4444", 0.34], ["#f97316", 0.26], ["#fde047", 0.16]].forEach(([c, k], i) => {
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.moveTo(-u * 0.13 * (1 - i * 0.2), -u * 0.04);
        ctx.quadraticCurveTo(-u * 0.1, -u * k * 0.7, u * fl * 0.5, -u * (k + fl));
        ctx.quadraticCurveTo(u * 0.12, -u * k * 0.6, u * 0.13 * (1 - i * 0.2), -u * 0.04);
        ctx.fill();
      });
      this.glow(ctx, 0, -u * 0.2, u * 1.3, "rgba(255,160,60,A)", 0.32 + fl);
    });
  }

  drawForgeSprite(ctx, cam, w, h, tx, ty, af) {
    this.withSprite(ctx, cam, w, h, tx, ty, (u, fog) => {
      ctx.fillStyle = this.vGrad(ctx, -u * 0.5, 0, "#64748b", "#1e293b", fog);
      this.rrect(ctx, -u * 0.38, -u * 0.5, u * 0.76, u * 0.5, u * 0.05); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#0f172a"; this.rrect(ctx, -u * 0.22, -u * 0.34, u * 0.44, u * 0.22, u * 0.04); ctx.fill();
      const pulse = 0.6 + Math.sin(af * 0.12) * 0.25;
      ctx.fillStyle = `rgba(251,146,60,${pulse})`; this.rrect(ctx, -u * 0.18, -u * 0.3, u * 0.36, u * 0.14, u * 0.03); ctx.fill();
      // 鐵砧
      ctx.fillStyle = this.vGrad(ctx, -u * 0.72, -u * 0.5, "#cbd5e1", "#475569", fog);
      ctx.beginPath(); ctx.moveTo(-u * 0.3, -u * 0.72); ctx.lineTo(u * 0.3, -u * 0.72); ctx.lineTo(u * 0.18, -u * 0.58); ctx.lineTo(u * 0.1, -u * 0.5); ctx.lineTo(-u * 0.1, -u * 0.5); ctx.lineTo(-u * 0.18, -u * 0.58); ctx.closePath(); ctx.fill(); ctx.stroke();
      this.glow(ctx, 0, -u * 0.25, u * 0.9, "rgba(251,146,60,A)", 0.3 * pulse);
    });
  }

  drawChestSprite(ctx, cam, w, h, tx, ty, relic, af) {
    this.withSprite(ctx, cam, w, h, tx, ty, (u, fog) => {
      const base = relic ? "#facc15" : "#b45309";
      const dark = relic ? "#854d0e" : "#451a03";
      const wd = relic ? 0.64 : 0.5;
      ctx.fillStyle = this.vGrad(ctx, -u * 0.4, 0, base, dark, fog);
      this.rrect(ctx, -u * wd / 2, -u * 0.26, u * wd, u * 0.26, u * 0.04); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-u * wd / 2, -u * 0.26);
      ctx.quadraticCurveTo(0, -u * 0.5, u * wd / 2, -u * 0.26); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = this.shade("#fde68a", 1, fog);
      ctx.fillRect(-u * wd / 2, -u * 0.2, u * wd, u * 0.04);
      ctx.fillRect(-u * 0.04, -u * 0.3, u * 0.08, u * 0.14);
      if (relic) this.glow(ctx, 0, -u * 0.3, u * 1.0, "rgba(250,204,21,A)", 0.25 + Math.sin(af * 0.1) * 0.1);
    });
  }

  drawSteleSprite(ctx, cam, w, h, tx, ty, af) {
    const lit = 0.5 + Math.sin(af * 0.08 + tx) * 0.2;
    this.withSprite(ctx, cam, w, h, tx, ty, (u, fog) => {
      ctx.fillStyle = this.vGrad(ctx, -u * 1.0, 0, "#94a3b8", "#334155", fog);
      ctx.beginPath(); ctx.moveTo(-u * 0.24, 0); ctx.lineTo(-u * 0.2, -u * 0.85); ctx.lineTo(0, -u * 1.0); ctx.lineTo(u * 0.2, -u * 0.85); ctx.lineTo(u * 0.24, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = `rgba(56,189,248,${lit + 0.3})`; ctx.lineWidth = Math.max(1.5, u * 0.035);
      ctx.beginPath();
      ctx.moveTo(0, -u * 0.8); ctx.lineTo(0, -u * 0.3);
      ctx.moveTo(-u * 0.1, -u * 0.62); ctx.lineTo(u * 0.1, -u * 0.62);
      ctx.moveTo(-u * 0.1, -u * 0.42); ctx.lineTo(u * 0.1, -u * 0.5);
      ctx.stroke();
      this.glow(ctx, 0, -u * 0.55, u * 0.9, "rgba(56,189,248,A)", lit * 0.45);
    });
  }

  drawGateSprite(ctx, cam, w, h, tx, ty, af) {
    this.withSprite(ctx, cam, w, h, tx, ty, (u, fog) => {
      ctx.fillStyle = this.vGrad(ctx, -u * 1.2, 0, "#78716c", "#292524", fog);
      ctx.beginPath(); ctx.moveTo(-u * 0.48, 0); ctx.lineTo(-u * 0.48, -u * 0.85); ctx.quadraticCurveTo(0, -u * 1.5, u * 0.48, -u * 0.85); ctx.lineTo(u * 0.48, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = this.shade("#451a03", 1, fog);
      ctx.beginPath(); ctx.moveTo(-u * 0.32, 0); ctx.lineTo(-u * 0.32, -u * 0.8); ctx.quadraticCurveTo(0, -u * 1.2, u * 0.32, -u * 0.8); ctx.lineTo(u * 0.32, 0); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = "#facc15"; ctx.lineWidth = Math.max(1.5, u * 0.03);
      ctx.beginPath(); ctx.arc(0, -u * 0.55, u * 0.14, 0, Math.PI * 2); ctx.moveTo(0, -u * 0.69); ctx.lineTo(0, -u * 0.41); ctx.moveTo(-u * 0.14, -u * 0.55); ctx.lineTo(u * 0.14, -u * 0.55); ctx.stroke();
      this.glow(ctx, 0, -u * 0.55, u * 0.8, "rgba(250,204,21,A)", 0.25 + Math.sin(af * 0.1) * 0.08);
    });
  }

  drawPortalSprite(ctx, cam, w, h, tx, ty, col, af) {
    this.withSprite(ctx, cam, w, h, tx, ty, (u, fog) => {
      const cy = -u * 0.55 - Math.sin(af * 0.08 + tx) * u * 0.04;
      this.glow(ctx, 0, cy, u * 1.1, "rgba(255,255,255,A)", 0.12);
      ctx.strokeStyle = col; ctx.shadowColor = col; ctx.shadowBlur = u * 0.25;
      for (let i = 0; i < 3; i++) {
        ctx.lineWidth = Math.max(1.5, u * (0.06 - i * 0.015));
        ctx.globalAlpha = 0.9 - i * 0.25;
        ctx.beginPath(); ctx.ellipse(0, cy, u * (0.34 - i * 0.07), u * (0.5 - i * 0.1), af * 0.04 * (i % 2 ? -1 : 1), 0, Math.PI * 2); ctx.stroke();
      }
      ctx.globalAlpha = 1; ctx.shadowBlur = 0;
      ctx.fillStyle = "#e2e8f0";
      for (let i = 0; i < 5; i++) {
        const a = af * 0.05 + i * 1.26;
        ctx.fillRect(Math.cos(a) * u * 0.3, cy + Math.sin(a) * u * 0.42, 2, 2);
      }
    });
  }

  drawPickupSprite(ctx, cam, w, h, tx, ty, af) {
    this.withSprite(ctx, cam, w, h, tx, ty, (u, fog) => {
      const fy = -u * 0.3 - Math.sin(af * 0.1 + tx * 2) * u * 0.05;
      this.glow(ctx, 0, fy, u * 0.7, "rgba(74,222,128,A)", 0.4);
      ctx.fillStyle = this.vGrad(ctx, fy - u * 0.2, fy + u * 0.2, "#bbf7d0", "#16a34a", fog);
      ctx.beginPath(); ctx.moveTo(0, fy - u * 0.2); ctx.lineTo(u * 0.14, fy); ctx.lineTo(0, fy + u * 0.2); ctx.lineTo(-u * 0.14, fy); ctx.closePath(); ctx.fill(); ctx.stroke();
    });
  }

  drawMonsterSprite(ctx, cam, w, h, tx, ty, o, af) {
    const k = o.scale;
    const seed = typeof tx === "object" ? 0 : tx;
    this.withSprite(ctx, cam, w, h, tx, ty, (u0, fog) => {
      const u = u0 * k;
      const breathe = Math.sin(af * 0.08 + seed) * u * 0.015;
      const tail = Math.sin(af * 0.12 + seed) * u * 0.18;
      if (o.aura) this.glow(ctx, 0, -u * 0.5, u * 1.8, o.aura, 0.22 + Math.sin(af * 0.1) * 0.06);
      // 尾巴 (斷尾後只剩斷面)
      ctx.strokeStyle = this.shade(o.dark, 1, fog); ctx.lineCap = "round";
      ctx.lineWidth = u * 0.14;
      if (!o.noTail) {
        ctx.beginPath(); ctx.moveTo(-u * 0.3, -u * 0.35); ctx.quadraticCurveTo(-u * 0.7, -u * 0.3 + tail, -u * 0.62 + tail * 0.5, -u * 0.7); ctx.stroke();
      } else {
        ctx.fillStyle = "#b91c1c"; ctx.beginPath(); ctx.arc(-u * 0.44, -u * 0.38, u * 0.06, 0, 7); ctx.fill();
      }
      ctx.strokeStyle = "rgba(8,12,20,0.85)"; ctx.lineWidth = Math.max(1, u * 0.025);
      // 翼
      if (o.wings) {
        const fl = Math.sin(af * 0.15) * u * 0.12;
        ctx.fillStyle = this.vGrad(ctx, -u * 1.2, -u * 0.4, o.wing, "#450a0a", fog);
        [-1, 1].forEach(d => {
          ctx.beginPath(); ctx.moveTo(d * u * 0.2, -u * 0.55);
          ctx.quadraticCurveTo(d * u * 0.7, -u * 1.15 - fl, d * u * 0.95, -u * 0.8 - fl);
          ctx.quadraticCurveTo(d * u * 0.75, -u * 0.7, d * u * 0.78, -u * 0.55 - fl * 0.3);
          ctx.quadraticCurveTo(d * u * 0.5, -u * 0.52, d * u * 0.3, -u * 0.35); ctx.closePath(); ctx.fill(); ctx.stroke();
        });
      }
      // 後腿與前腿
      ctx.fillStyle = this.shade(o.dark, 0.85, fog);
      [[-0.24, 0.12], [0.2, 0.12], [-0.08, 0.1], [0.34, 0.1]].forEach(([lx, lw]) => {
        this.rrect(ctx, u * (lx - lw / 2), -u * 0.3, u * lw, u * 0.3, u * 0.04); ctx.fill(); ctx.stroke();
      });
      // 軀幹
      ctx.fillStyle = this.vGrad(ctx, -u * 0.8, -u * 0.15, o.body, o.dark, fog);
      ctx.beginPath(); ctx.ellipse(0, -u * 0.45 + breathe, u * 0.48, u * 0.3, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      // 背脊
      ctx.fillStyle = this.shade(o.spike, 1, fog);
      for (let i = -3; i <= 3; i++) {
        const sx = i * u * 0.12;
        ctx.beginPath(); ctx.moveTo(sx - u * 0.05, -u * 0.7 + Math.abs(i) * u * 0.03); ctx.lineTo(sx, -u * 0.88 + Math.abs(i) * u * 0.05); ctx.lineTo(sx + u * 0.05, -u * 0.7 + Math.abs(i) * u * 0.03); ctx.closePath(); ctx.fill(); ctx.stroke();
      }
      // 腹部亮色
      ctx.fillStyle = "rgba(255,255,255,0.10)";
      ctx.beginPath(); ctx.ellipse(u * 0.05, -u * 0.38, u * 0.3, u * 0.14, 0, 0, Math.PI * 2); ctx.fill();
      // 頭
      const hx = u * 0.32, hy = -u * 0.62 + breathe;
      ctx.fillStyle = this.vGrad(ctx, hy - u * 0.25, hy + u * 0.25, o.body, o.dark, fog);
      ctx.beginPath(); ctx.ellipse(hx, hy, u * 0.26, u * 0.2, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      // 吻部與牙
      ctx.fillStyle = this.shade(o.dark, 1, fog);
      ctx.beginPath(); ctx.ellipse(hx + u * 0.18, hy + u * 0.06, u * 0.16, u * 0.09, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#f8fafc";
      ctx.beginPath(); ctx.moveTo(hx + u * 0.12, hy + u * 0.13); ctx.lineTo(hx + u * 0.15, hy + u * 0.21); ctx.lineTo(hx + u * 0.19, hy + u * 0.13); ctx.fill();
      // 角
      ctx.fillStyle = this.shade(o.horn, 1, fog);
      [[-0.1, -1], [0.08, 1]].forEach(([ox, d]) => {
        ctx.beginPath(); ctx.moveTo(hx + u * ox - u * 0.05, hy - u * 0.14);
        ctx.quadraticCurveTo(hx + u * ox - u * 0.1, hy - u * 0.4, hx + u * ox + u * 0.1 * d - u * 0.02, hy - u * 0.52);
        ctx.lineTo(hx + u * ox + u * 0.06, hy - u * 0.14); ctx.closePath(); ctx.fill(); ctx.stroke();
      });
      // 紅眼
      ctx.fillStyle = "#ef4444"; ctx.shadowColor = "#ef4444"; ctx.shadowBlur = u * 0.15;
      ctx.beginPath(); ctx.ellipse(hx + u * 0.1, hy - u * 0.04, u * 0.05, u * 0.035, -0.3, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      // 破頭裂痕
      if (o.headBroken) {
        ctx.strokeStyle = "#facc15"; ctx.lineWidth = Math.max(1.5, u * 0.03);
        ctx.beginPath(); ctx.moveTo(hx - u * 0.05, hy - u * 0.2); ctx.lineTo(hx + u * 0.02, hy - u * 0.05); ctx.lineTo(hx - u * 0.04, hy + u * 0.05); ctx.stroke();
      }
      // 受擊閃白 / 憤怒紅光
      if (o.hurt) {
        ctx.globalCompositeOperation = "lighter"; ctx.fillStyle = "rgba(255,255,255,0.35)";
        ctx.beginPath(); ctx.ellipse(0, -u * 0.45, u * 0.5, u * 0.32, 0, 0, 7); ctx.fill(); ctx.globalCompositeOperation = "source-over";
      }
      if (o.enraged) {
        ctx.globalCompositeOperation = "lighter"; ctx.fillStyle = `rgba(239,68,68,${0.16 + Math.sin(af * 0.2) * 0.06})`;
        ctx.beginPath(); ctx.ellipse(0, -u * 0.45, u * 0.52, u * 0.34, 0, 0, 7); ctx.fill(); ctx.globalCompositeOperation = "source-over";
      }
    }, !!o.flip);
  }

  draw3DFieldObject(ctx, cam, w, h, tx, ty, tile, chNum, pal, animFrame) {
    const ev = this.engine.resolveEventAt ? this.engine.resolveEventAt(tx, ty, tile) : this.engine.activeEvents[`${tx},${ty}`];
    const bob = Math.sin(animFrame * 0.1 + tx + ty) * 0.08;

    if (tile === "F") {
      this.drawTentAndCampfire(ctx, cam, w, h, tx, ty, animFrame);
      return;
    }

    if (tile === "A") {
      this.drawForgeSprite(ctx, cam, w, h, tx, ty, animFrame);
      return;
    }

    if (tile === "C" || tile === "U") {
      this.drawChestSprite(ctx, cam, w, h, tx, ty, tile === "U", animFrame);
      return;
    }

    if (tile === "S" || tile === "V" || tile === "R" || tile === "?") {
      this.drawSteleSprite(ctx, cam, w, h, tx, ty, animFrame);
      return;
    }

    if (tile === "G") {
      this.drawGateSprite(ctx, cam, w, h, tx, ty, animFrame);
      return;
    }

    if (tile === "O" || tile === "P" || tile === ">" || tile === "<") {
      const col = tile === "P" ? "#c084fc" : tile === "O" ? "#38bdf8" : "#facc15";
      this.drawPortalSprite(ctx, cam, w, h, tx, ty, col, animFrame);
      return;
    }

    if (tile === "N") {
      // 3D 立體 NPC：依名稱與座標雜湊決定服飾配色
      const nm = (ev && (ev.name || ev.npc || ev.title)) || "";
      const hsh = (tx * 7 + ty * 13) % 4;
      const styles = [
        { armor: "#a78bfa", armorDark: "#5b21b6", trim: "#fde68a", hat: "hat", hatCol: "#4c1d95", cape: null },
        { armor: "#4ade80", armorDark: "#166534", trim: "#fef08a", hat: "hair", hair: "#92400e", cape: null },
        { armor: "#fb923c", armorDark: "#9a3412", trim: "#ffffff", hat: "hood", cape: "#9a3412", capeDark: "#431407" },
        { armor: "#f472b6", armorDark: "#9d174d", trim: "#fde68a", hat: "hair", hair: "#1e293b", cape: null }
      ];
      const st = Object.assign({}, styles[hsh]);
      if (/長|老|奧爾森/.test(nm)) {
        Object.assign(st, { hat: "hair", hair: "#e2e8f0", armor: "#94a3b8", armorDark: "#475569", cape: "#7c2d12", capeDark: "#431407" });
      }
      this.drawCharacterSprite(ctx, cam, w, h, tx, ty, Object.assign(st, {
        skin: "#f1c9a5", legs: "#475569", bob: bob * 0.5, walk: animFrame * 0.05 + tx, scale: 1.1
      }));
      return;
    }

    if (tile === "E" || tile === "B") {
      // 立體魔物：依強度改變體型、配色、光環與雙翼
      const en = ev && this.engine.data.enemies[ev.enemyId];
      const isBoss = tile === "B" || (en && en.isBoss);
      const isElite = en && en.isElite;
      this.drawMonsterSprite(ctx, cam, w, h, tx, ty, {
        scale: isBoss ? 1.5 : isElite ? 1.2 : 0.95,
        body: isBoss ? "#dc2626" : isElite ? "#9333ea" : "#0ea5e9",
        dark: isBoss ? "#450a0a" : isElite ? "#3b0764" : "#082f49",
        spike: isBoss ? "#fca5a5" : isElite ? "#e9d5ff" : "#bae6fd",
        horn: "#fde68a",
        wing: isBoss ? "#f43f5e" : "#c084fc",
        wings: !!(isBoss || isElite),
        aura: isBoss ? "rgba(239,68,68,A)" : isElite ? "rgba(168,85,247,A)" : null
      }, animFrame);
      return;
    }

    // 其他採集物 / 手札 / 星泉 / 陷阱
    this.drawPickupSprite(ctx, cam, w, h, tx, ty, animFrame);
  }

  // ==================== 角色立體精靈繪製 (面向鏡頭的漸層人物) ====================
  rrect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  vGrad(ctx, y0, y1, c0, c1, fog) {
    const g = ctx.createLinearGradient(0, y0, 0, y1);
    g.addColorStop(0, this.shade(c0, 1, fog));
    g.addColorStop(1, this.shade(c1, 1, fog));
    return g;
  }

  // o: { cape, armor, armorDark, trim, skin, hair, hat('helm'|'hood'|'hat'|'none'), plume, weapon, weaponCol, bob, walk, scale }
  drawCharacterSprite(ctx, cam, w, h, x, z, o) {
    const p = typeof x === "object" ? { sx: x.sx, sy: x.sy, scale: x.u, depth: 0 } : this.projectPoint(x, 0, z, cam, w, h);
    if (!p) return;
    const u = p.scale * (o.scale || 1);
    const fog = this.fogAt(p.depth) * 0.6;
    const bob = (o.bob || 0) * u;
    const sway = Math.sin((o.walk || 0)) * u * 0.05;
    const ol = "rgba(8,12,20,0.85)";
    ctx.save();
    ctx.translate(p.sx, p.sy);
    ctx.lineWidth = Math.max(1, u * 0.025);
    ctx.strokeStyle = ol;

    // 披風 (身後)
    if (o.cape) {
      ctx.fillStyle = this.vGrad(ctx, -u * 0.85, -u * 0.1, o.cape, o.capeDark || "#1e293b", fog);
      ctx.beginPath();
      ctx.moveTo(-u * 0.2, -u * 0.78 - bob);
      ctx.lineTo(u * 0.2, -u * 0.78 - bob);
      ctx.lineTo(u * 0.3 + sway, -u * 0.08);
      ctx.lineTo(-u * 0.3 + sway, -u * 0.08);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    // 背負武器
    if (o.weapon) {
      ctx.save();
      ctx.translate(u * 0.2, -u * 0.55 - bob);
      ctx.rotate(0.28);
      const glow = ctx.createLinearGradient(0, -u * 0.55, 0, u * 0.35);
      glow.addColorStop(0, "#ffffff");
      glow.addColorStop(0.5, o.weaponCol || "#facc15");
      glow.addColorStop(1, "#475569");
      ctx.shadowColor = o.weaponCol || "#facc15";
      ctx.shadowBlur = u * 0.18;
      ctx.fillStyle = glow;
      this.rrect(ctx, -u * 0.045, -u * 0.62, u * 0.09, u * 0.95, u * 0.03);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.stroke();
      ctx.fillStyle = "#78350f";
      ctx.fillRect(-u * 0.11, u * 0.12, u * 0.22, u * 0.05);
      ctx.restore();
    }

    // 雙腿與靴
    const legCol = o.legs || "#334155";
    ctx.fillStyle = this.shade(legCol, 0.9, fog);
    this.rrect(ctx, -u * 0.15, -u * 0.32, u * 0.12, u * 0.32 + Math.max(0, -sway) * 0.4, u * 0.03);
    ctx.fill(); ctx.stroke();
    this.rrect(ctx, u * 0.03, -u * 0.32, u * 0.12, u * 0.32 + Math.max(0, sway) * 0.4, u * 0.03);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = this.shade("#1c1917", 1, fog);
    ctx.fillRect(-u * 0.17, -u * 0.05, u * 0.16, u * 0.05);
    ctx.fillRect(u * 0.01, -u * 0.05, u * 0.16, u * 0.05);

    // 軀幹
    const ty0 = -u * 0.72 - bob;
    const ty1 = -u * 0.28 - bob;
    ctx.fillStyle = this.vGrad(ctx, ty0, ty1, o.armor, o.armorDark || o.armor, fog);
    this.rrect(ctx, -u * 0.22, ty0, u * 0.44, ty1 - ty0, u * 0.07);
    ctx.fill(); ctx.stroke();
    // 肩甲
    ctx.fillStyle = this.shade(o.trim || "#facc15", 0.95, fog);
    ctx.beginPath(); ctx.ellipse(-u * 0.24, ty0 + u * 0.04, u * 0.1, u * 0.08, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(u * 0.24, ty0 + u * 0.04, u * 0.1, u * 0.08, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    // 腰帶與胸徽
    ctx.fillStyle = this.shade("#451a03", 1, fog);
    ctx.fillRect(-u * 0.22, ty1 - u * 0.07, u * 0.44, u * 0.06);
    ctx.fillStyle = this.shade(o.trim || "#facc15", 1, fog);
    ctx.fillRect(-u * 0.025, ty1 - u * 0.075, u * 0.05, u * 0.07);
    ctx.beginPath();
    ctx.moveTo(0, ty0 + u * 0.07); ctx.lineTo(u * 0.06, ty0 + u * 0.15); ctx.lineTo(0, ty0 + u * 0.23); ctx.lineTo(-u * 0.06, ty0 + u * 0.15);
    ctx.closePath(); ctx.fill();

    // 手臂與手
    ctx.fillStyle = this.shade(o.armorDark || o.armor, 1, fog);
    this.rrect(ctx, -u * 0.3, ty0 + u * 0.08, u * 0.08, u * 0.3, u * 0.03); ctx.fill(); ctx.stroke();
    this.rrect(ctx, u * 0.22, ty0 + u * 0.08, u * 0.08, u * 0.3, u * 0.03); ctx.fill(); ctx.stroke();
    ctx.fillStyle = this.shade(o.skin || "#f5d0a9", 1, fog);
    ctx.beginPath(); ctx.arc(-u * 0.26, ty0 + u * 0.4, u * 0.045, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(u * 0.26, ty0 + u * 0.4, u * 0.045, 0, Math.PI * 2); ctx.fill();

    // 頭部
    const hy = ty0 - u * 0.15;
    const hr = u * 0.17;
    const skinG = ctx.createRadialGradient(-hr * 0.3, hy - hr * 0.3, hr * 0.1, 0, hy, hr);
    skinG.addColorStop(0, this.shade(o.skin || "#f5d0a9", 1.08, fog));
    skinG.addColorStop(1, this.shade(o.skin || "#f5d0a9", 0.78, fog));
    ctx.fillStyle = skinG;
    ctx.beginPath(); ctx.arc(0, hy, hr, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    // 臉
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(-hr * 0.5, hy - hr * 0.05, hr * 0.28, hr * 0.28);
    ctx.fillRect(hr * 0.22, hy - hr * 0.05, hr * 0.28, hr * 0.28);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(-hr * 0.42, hy, hr * 0.1, hr * 0.1);
    ctx.fillRect(hr * 0.3, hy, hr * 0.1, hr * 0.1);
    ctx.fillStyle = "rgba(244,63,94,0.35)";
    ctx.fillRect(-hr * 0.7, hy + hr * 0.3, hr * 0.3, hr * 0.15);
    ctx.fillRect(hr * 0.4, hy + hr * 0.3, hr * 0.3, hr * 0.15);

    // 頭髮 / 頭盔 / 兜帽 / 帽
    const hat = o.hat || "hair";
    if (hat === "helm") {
      ctx.fillStyle = this.vGrad(ctx, hy - hr * 1.2, hy, "#fde68a", "#ca8a04", fog);
      ctx.beginPath(); ctx.arc(0, hy - hr * 0.1, hr * 1.12, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = this.shade(o.plume || "#ef4444", 1, fog);
      ctx.beginPath();
      ctx.moveTo(-hr * 0.15, hy - hr * 1.05);
      ctx.quadraticCurveTo(hr * 0.2 + sway * 2, hy - hr * 2.1, hr * 1.1, hy - hr * 1.4);
      ctx.quadraticCurveTo(hr * 0.5, hy - hr * 1.3, hr * 0.2, hy - hr * 1.0);
      ctx.closePath(); ctx.fill(); ctx.stroke();
    } else if (hat === "hood") {
      ctx.fillStyle = this.vGrad(ctx, hy - hr * 1.3, hy + hr, o.armor, o.armorDark || o.armor, fog);
      ctx.beginPath(); ctx.arc(0, hy - hr * 0.05, hr * 1.2, Math.PI * 0.95, Math.PI * 0.05, false); ctx.lineTo(hr * 0.8, hy + hr * 0.2); ctx.lineTo(-hr * 0.8, hy + hr * 0.2); ctx.closePath(); ctx.fill(); ctx.stroke();
    } else if (hat === "hat") {
      ctx.fillStyle = this.shade(o.hatCol || "#78350f", 1, fog);
      ctx.beginPath(); ctx.ellipse(0, hy - hr * 0.7, hr * 1.55, hr * 0.38, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, hy - hr * 0.75, hr * 0.85, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
    } else {
      ctx.fillStyle = this.shade(o.hair || "#7c2d12", 1, fog);
      ctx.beginPath(); ctx.arc(0, hy - hr * 0.1, hr * 1.1, Math.PI * 1.02, Math.PI * 1.98); ctx.lineTo(hr * 1.0, hy - hr * 0.1); ctx.lineTo(hr * 0.5, hy - hr * 0.55); ctx.lineTo(-hr * 0.2, hy - hr * 0.45); ctx.lineTo(-hr * 0.7, hy - hr * 0.25); ctx.closePath(); ctx.fill(); ctx.stroke();
    }
    ctx.restore();
  }

  drawPalicoSprite(ctx, cam, w, h, x, z, animFrame) {
    const p = this.projectPoint(x, 0, z, cam, w, h);
    if (!p) return;
    const u = p.scale * 0.8;
    const hop = Math.abs(Math.sin(animFrame * 0.2)) * u * 0.08;
    ctx.save();
    ctx.translate(p.sx, p.sy - hop);
    ctx.lineWidth = Math.max(1, u * 0.03);
    ctx.strokeStyle = "rgba(8,12,20,0.85)";
    // 影子
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.beginPath(); ctx.ellipse(0, hop, u * 0.22, u * 0.07, 0, 0, Math.PI * 2); ctx.fill();
    // 尾巴
    ctx.strokeStyle = "#0d9488"; ctx.lineWidth = u * 0.07; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(u * 0.15, -u * 0.12);
    ctx.quadraticCurveTo(u * 0.4, -u * 0.2 + Math.sin(animFrame * 0.15) * u * 0.08, u * 0.3, -u * 0.5); ctx.stroke();
    ctx.strokeStyle = "rgba(8,12,20,0.85)"; ctx.lineWidth = Math.max(1, u * 0.03);
    // 身體
    const bg = ctx.createLinearGradient(0, -u * 0.4, 0, 0);
    bg.addColorStop(0, "#5eead4"); bg.addColorStop(1, "#0f766e");
    ctx.fillStyle = bg;
    ctx.beginPath(); ctx.ellipse(0, -u * 0.17, u * 0.2, u * 0.17, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    // 頭
    ctx.beginPath(); ctx.arc(0, -u * 0.42, u * 0.17, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    // 耳
    ctx.beginPath(); ctx.moveTo(-u * 0.16, -u * 0.5); ctx.lineTo(-u * 0.14, -u * 0.72); ctx.lineTo(-u * 0.03, -u * 0.58); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(u * 0.16, -u * 0.5); ctx.lineTo(u * 0.14, -u * 0.72); ctx.lineTo(u * 0.03, -u * 0.58); ctx.closePath(); ctx.fill(); ctx.stroke();
    // 臉
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(-u * 0.09, -u * 0.46, u * 0.055, u * 0.07);
    ctx.fillRect(u * 0.035, -u * 0.46, u * 0.055, u * 0.07);
    ctx.fillStyle = "#fda4af";
    ctx.fillRect(-u * 0.02, -u * 0.38, u * 0.04, u * 0.03);
    ctx.restore();
  }

  draw3DHunterOnField(ctx, cam, w, h, hx, hz, animFrame) {
    const bob = Math.sin(animFrame * 0.16) * 0.04;
    // 地面落影
    const shP = this.projectPoint(hx, 0.01, hz, cam, w, h);
    if (shP) {
      const sr = Math.max(8, (this.projectPoint(hx + 0.45, 0.01, hz, cam, w, h) || shP).sx - shP.sx);
      ctx.fillStyle = "rgba(0,0,0,0.42)";
      ctx.beginPath();
      ctx.ellipse(shP.sx, shP.sy, sr, sr * 0.38, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    const elemColors = {
      physical: "#facc15",
      star: "#38bdf8",
      fire: "#f97316",
      frost: "#7dd3fc",
      void: "#c084fc"
    };
    const wepCol = elemColors[this.engine.state.weaponElement || "physical"] || "#facc15";

    // 獵人腳底方位光環
    const pRing = this.projectPoint(hx, 0.02, hz, cam, w, h);
    if (pRing) {
      ctx.save();
      ctx.strokeStyle = wepCol;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(pRing.sx, pRing.sy, Math.max(8, 0.42 * pRing.scale), Math.max(4, 0.22 * pRing.scale), 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 獵人立體角色 (星隕龍鎧、金色羽飾頭盔、藍色披風、背負武器)
    this.drawCharacterSprite(ctx, cam, w, h, hx, hz, {
      cape: "#1d4ed8", capeDark: "#172554",
      armor: "#38bdf8", armorDark: "#0369a1", trim: "#facc15",
      legs: "#334155", skin: "#f5d0a9", hat: "helm", plume: "#ef4444",
      weapon: true, weaponCol: wepCol, bob: bob + 0.02, walk: animFrame * 0.2, scale: 1.25
    });

    // 隨行艾露星貓夥伴 (Palico Companion)
    this.drawPalicoSprite(ctx, cam, w, h, hx - 0.55, hz + 0.25, animFrame);
  }

  // 《魔物獵人》經典翠綠導蟲 (Scoutflies) 3D 粒子流
  draw3DScoutflies(ctx, cam, w, h, obj, animFrame) {
    const hx = this.camX;
    const hz = this.camZ;
    const dx = obj.x - hx;
    const dz = obj.y - hz;
    const dist = Math.hypot(dx, dz);
    if (dist < 0.5) return;

    const maxTrailDist = Math.min(dist, 7.5);
    const dirX = dx / dist;
    const dirZ = dz / dist;
    const perpX = -dirZ;
    const perpZ = dirX;

    ctx.save();
    for (let i = 0; i < this.scoutflies.length; i++) {
      const sf = this.scoutflies[i];
      const prog = (sf.t + animFrame * 0.011) % 1;
      const d = prog * maxTrailDist;
      const wave = Math.sin(prog * Math.PI * 4 + animFrame * 0.12 + sf.phase) * sf.offsetR;
      const wx = hx + dirX * d + perpX * wave;
      const wz = hz + dirZ * d + perpZ * wave;
      const wy = 0.32 + Math.sin(prog * Math.PI * 3 + sf.phase) * 0.18;

      const pt = this.projectPoint(wx, wy, wz, cam, w, h);
      if (!pt) continue;

      const sz = Math.max(2.5, Math.min(7, (1.2 - prog * 0.5) * (pt.scale * 0.06)));
      ctx.fillStyle = i % 3 === 0 ? "#bef264" : "#4ade80";
      ctx.fillRect(pt.sx - sz * 0.5, pt.sy - sz * 0.5, sz, sz);
    }
    ctx.restore();
  }

  draw3DWorldLabelsAndFloats(ctx, cam, w, h, expMap, obj, animFrame) {
    const map = this.engine.activeMap;
    const labels = this.engine.activeLabels || {};
    ctx.font = "bold 11.5px 'PingFang TC', 'Microsoft JhengHei', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    Object.entries(labels).forEach(([coord, labelText]) => {
      if (!expMap[coord] && !this.engine.state.compassEnabled) return;
      const [lx, ly] = coord.split(",").map(Number);
      if (!map[ly] || map[ly][lx] === ".") return;
      const dist = Math.hypot(lx - this.camX, ly - this.camZ);
      if (dist > 11) return;

      const pt = this.projectPoint(lx, 1.15, ly, cam, w, h);
      if (!pt || pt.sx < 20 || pt.sx > w - 20 || pt.sy < 20 || pt.sy > h - 20) return;

      const isTarget = obj && obj.x === lx && obj.y === ly;
      const isMonster = map[ly][lx] === "E" || map[ly][lx] === "B";
      const textW = ctx.measureText(labelText).width + 14;

      ctx.fillStyle = isTarget ? "rgba(133, 77, 14, 0.92)" : isMonster ? "rgba(127, 29, 29, 0.9)" : "rgba(9, 13, 22, 0.88)";
      ctx.fillRect(pt.sx - textW / 2, pt.sy - 9, textW, 18);
      ctx.strokeStyle = isTarget ? "#facc15" : isMonster ? "#f43f5e" : "#64748b";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(pt.sx - textW / 2, pt.sy - 9, textW, 18);
      ctx.fillStyle = isTarget ? "#fef08a" : "#f8fafc";
      ctx.fillText(labelText, pt.sx, pt.sy);
    });

    // 任務目標頭頂金色狩獵標記
    if (obj && (expMap[`${obj.x},${obj.y}`] || this.engine.state.compassEnabled)) {
      const bounce = Math.sin(animFrame * 0.16) * 0.12;
      const pt = this.projectPoint(obj.x, 1.55 + bounce, obj.y, cam, w, h);
      if (pt && this.ui.px) {
        this.ui.px.drawSprite(ctx, "quest_marker", pt.sx - 12, pt.sy - 12, 24);
      }
    }

    // 3D 浮動跳字
    for (let i = this.ui.mapFloats.length - 1; i >= 0; i--) {
      const ft = this.ui.mapFloats[i];
      const rise = (ft.maxTicks - ft.ticks) * 0.03;
      const pt = this.projectPoint(ft.tx, 1.1 + rise, ft.ty, cam, w, h);
      if (pt) {
        ctx.font = "bold 13px 'PingFang TC', monospace";
        ctx.fillStyle = "#090d16";
        ctx.fillText(ft.text, pt.sx + 1, pt.sy + 1);
        ctx.fillStyle = ft.color;
        ctx.fillText(ft.text, pt.sx, pt.sy);
      }
      ft.ticks--;
      if (ft.ticks <= 0) this.ui.mapFloats.splice(i, 1);
    }
  }

  // ==================== 魔物獵人風格 HUD：斬味刀刃計、太刀氣刃槽、貓飯與 3D 羅盤 ====================
  drawMonsterHunterFieldHUD(ctx, w, h, animFrame) {
    ctx.save();
    ctx.translate(Math.round(w * 0.1), 0); // 避開左上浮動狀態 HUD
    this.drawMonsterHunterFieldHUDInner(ctx, w, h, animFrame);
    ctx.restore();
  }

  drawMonsterHunterFieldHUDInner(ctx, w, h, animFrame) {
    const s = this.engine.state;
    const sharpInfo = this.engine.getSharpnessTierInfo ? this.engine.getSharpnessTierInfo() : { label: "紫斬", color: "#c084fc", mult: 1.38 };
    const sharpVal = typeof s.sharpness === "number" ? s.sharpness : 100;
    const spiritLv = s.spiritLevel || 0;
    const spiritColors = ["#64748b", "#f8fafc", "#facc15", "#f43f5e"];
    const spiritNames = ["無色刃", "白刃 (+8%攻)", "黃刃 (+16%攻)", "紅刃極意 (+25%攻)"];

    // 左上角《魔物獵人》斬味計與太刀氣刃計量面板
    ctx.save();
    ctx.fillStyle = "rgba(9, 13, 22, 0.9)";
    ctx.fillRect(12, 12, 290, 68);
    ctx.strokeStyle = "#ca8a04";
    ctx.lineWidth = 2;
    ctx.strokeRect(12, 12, 290, 68);

    // 繪製斬味大劍刀身造型計量條
    ctx.fillStyle = "#1e293b";
    ctx.beginPath();
    ctx.moveTo(22, 34);
    ctx.lineTo(185, 34);
    ctx.lineTo(198, 27);
    ctx.lineTo(185, 20);
    ctx.lineTo(22, 20);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 1.2;
    ctx.stroke();

    const fillW = Math.max(6, Math.round((sharpVal / 100) * 165));
    ctx.fillStyle = sharpInfo.color;
    ctx.fillRect(24, 22, fillW, 10);

    ctx.font = "bold 11.5px 'PingFang TC', monospace";
    ctx.textAlign = "left";
    ctx.fillStyle = "#fef08a";
    ctx.fillText(`斬味【${sharpInfo.label} x${sharpInfo.mult}】(${sharpVal}/100) [R磨刀]`, 22, 48);

    // 太刀氣刃等級與貓飯狀態
    ctx.fillStyle = spiritColors[spiritLv] || "#94a3b8";
    ctx.fillText(`氣刃：${spiritNames[spiritLv]}`, 22, 66);

    if (s.canteenMeal && s.canteenMeal.battlesLeft > 0) {
      ctx.fillStyle = "#4ade80";
      ctx.fillText(`｜貓飯：${s.canteenMeal.name}(${s.canteenMeal.battlesLeft}戰)`, 148, 66);
    } else {
      ctx.fillStyle = "#94a3b8";
      ctx.fillText(`｜[G] 獵人貓飯料理`, 158, 66);
    }

    // 底部 3D 鏡頭控制提示列
    const modeLabel = this.getViewMode() === "3d_shoulder" ? "3D 越肩狩獵視角" : "3D 廣角戰術視角";
    ctx.fillStyle = "rgba(9, 13, 22, 0.86)";
    ctx.fillRect(12, h - 34, 520, 24);
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 1;
    ctx.strokeRect(12, h - 34, 520, 24);
    ctx.fillStyle = "#cbd5e1";
    ctx.font = "bold 11px 'PingFang TC', monospace";
    ctx.fillText(
      `[${modeLabel}] 綠光導蟲引路 ｜ [V] 切換3D/2D ｜ [J/L] 或右鍵拖曳旋轉3D鏡頭 ｜ [R] 砥石磨刀 ｜ [G] 貓飯`,
      20,
      h - 21
    );
    ctx.restore();
  }

  drawQuestClearOverlay(ctx, w, h) {
    ctx.save();
    const cx = w * 0.5;
    const cy = h * 0.42;
    ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
    ctx.fillRect(cx - 210, cy - 58, 420, 116);
    ctx.strokeStyle = "#facc15";
    ctx.lineWidth = 3;
    ctx.strokeRect(cx - 210, cy - 58, 420, 116);
    ctx.strokeStyle = "#ca8a04";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(cx - 202, cy - 50, 404, 100);

    ctx.textAlign = "center";
    ctx.fillStyle = "#facc15";
    ctx.font = "bold 28px 'Georgia', serif";
    ctx.fillText("QUEST CLEAR!", cx, cy - 16);

    ctx.fillStyle = "#fef08a";
    ctx.font = "bold 15px 'PingFang TC', sans-serif";
    ctx.fillText(`【狩獵達成】${this.lastClearTitle}`, cx, cy + 14);

    ctx.fillStyle = "#4ade80";
    ctx.font = "bold 12px 'PingFang TC', sans-serif";
    ctx.fillText("已自動剝取魔物素材與發放公會討伐報酬！", cx, cy + 36);
    ctx.restore();
  }

  // ==================== 3D 魔物獵人狩獵戰鬥舞台 (含三部位點擊鎖定、部位破壞與斷尾視覺) ====================
  draw3DBattleScene(ctx, w, h, animFrame) {
    const c = this.engine.combat;
    if (!c) return;
    const s = this.engine.state;
    const chNum = s.chapter || 1;
    const pal = this.getBiome3DPalette(chNum);

    ctx.clearRect(0, 0, w, h);

    // 1. 戰鬥競技場：與探索場景一致的天空、遠山與草地
    const horizonY = 62;
    const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
    skyGrad.addColorStop(0, pal.skyTop);
    skyGrad.addColorStop(1, pal.skyHorizon);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, horizonY);
    const bsx = w * 0.7;
    const bsun = ctx.createRadialGradient(bsx, horizonY, 3, bsx, horizonY, 150);
    bsun.addColorStop(0, `rgba(${pal.sun || "255, 240, 190"}, 0.8)`);
    bsun.addColorStop(1, `rgba(${pal.sun || "255, 240, 190"}, 0)`);
    ctx.fillStyle = bsun;
    ctx.fillRect(0, 0, w, horizonY + 20);
    ctx.fillStyle = pal.mountain || "rgba(8, 13, 24, 0.72)";
    ctx.beginPath();
    ctx.moveTo(0, horizonY + 2);
    for (let mxp = 0; mxp <= w + 40; mxp += 40) {
      ctx.lineTo(mxp, horizonY - 14 - Math.abs(Math.sin(mxp * 0.013 + chNum)) * 26);
    }
    ctx.lineTo(w, horizonY + 2);
    ctx.closePath();
    ctx.fill();

    const floorGrad = ctx.createLinearGradient(0, horizonY, 0, h);
    floorGrad.addColorStop(0, pal.bgMid || pal.groundB);
    floorGrad.addColorStop(1, pal.bgBottom || "#060911");
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, horizonY, w, h - horizonY);

    // 地面透視紋理（淡）
    ctx.strokeStyle = pal.groundStroke;
    ctx.lineWidth = 1;
    for (let gx = -160; gx <= w + 160; gx += 70) {
      ctx.beginPath();
      ctx.moveTo(w * 0.5 + (gx - w * 0.5) * 0.35, horizonY);
      ctx.lineTo(gx, h);
      ctx.stroke();
    }
    ctx.fillStyle = pal.day ? this.shade(pal.detailA || "#86efac", 0.9, 0.1) : pal.accent;
    for (let i = 0; i < 40; i++) {
      ctx.fillRect((i * 97) % w, horizonY + 14 + ((i * 53) % (h - horizonY - 16)), 2, 2);
    }

    // 2. 左側：3D 尋星獵人艾爾文與隨行艾露貓 (含揮砍衝刺與太刀見切殘影)
    const lunge = c.slashAnim > 0 ? Math.sin(((16 - c.slashAnim) / 16) * Math.PI) * 145 : 0;
    const hx = 148 + lunge;
    const hy = h - 42;
    const spiritLv = s.spiritLevel || 0;
    const spiritAuraCols = ["rgba(0,0,0,0)", "rgba(248,250,252,0.28)", "rgba(250,204,21,0.34)", "rgba(244,63,94,0.42)"];

    // 獵人腳底氣刃光環
    if (spiritLv > 0 || c.foresightStance) {
      ctx.save();
      ctx.strokeStyle = c.foresightStance ? "#38bdf8" : spiritAuraCols[spiritLv];
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(hx, hy, 44, 14, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    const bElemCols = { physical: "#facc15", star: "#38bdf8", fire: "#f97316", frost: "#7dd3fc", void: "#c084fc" };
    this.drawCharacterSprite(ctx, null, w, h, { sx: hx, sy: hy + 8, u: 62 }, 0, {
      cape: "#1d4ed8", capeDark: "#172554", armor: "#38bdf8", armorDark: "#0369a1", trim: "#facc15",
      legs: "#334155", skin: "#f5d0a9", hat: "helm", plume: "#ef4444", weapon: true,
      weaponCol: bElemCols[s.weaponElement || "physical"] || "#facc15",
      bob: Math.sin(animFrame * 0.1) * 0.02, walk: lunge > 0 ? animFrame * 0.5 : 0, scale: 1.25
    });

    if (this.ui.px) {
      const petObj = this.engine.data.companions[s.companion || "lumi"];
      if (petObj) {
        const petBob = Math.sin(animFrame * 0.16) * 4;
        this.ui.px.drawSprite(ctx, petObj.icon, 56, hy - 62 + petBob, 46);
      }
    }

    // 3. 右側：3D 多部位巨型魔物（頭部 Head、軀幹 Body、尾巴 Tail 獨立繪製與點擊鎖定）
    const shakeX = c.shake > 0 ? (Math.random() - 0.5) * 16 : 0;
    const shakeY = c.shake > 0 ? (Math.random() - 0.5) * 10 : 0;
    if (c.shake > 0) c.shake--;

    const mx = w - 255 + shakeX;
    const my = h - 92 + shakeY;
    const breathe = Math.sin(animFrame * 0.1) * 4;
    const parts = c.parts || {
      head: { name: "頭部", hp: 100, maxHp: 100, broken: false },
      body: { name: "軀幹", hp: 100, maxHp: 100, broken: false },
      tail: { name: "尾巴", hp: 100, maxHp: 100, broken: false }
    };
    const targetPart = c.targetPart || "body";

    // 魔物憤怒紅蓮氣場 (Enraged Aura)
    if (c.enraged) {
      const rageGrad = ctx.createRadialGradient(mx, my, 15, mx, my, 125);
      rageGrad.addColorStop(0, "rgba(244, 63, 94, 0.42)");
      rageGrad.addColorStop(0.6, "rgba(234, 88, 12, 0.18)");
      rageGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = rageGrad;
      ctx.fillRect(mx - 130, my - 90, 260, 180);
    }

    // 魔物腳底巨型立體陰影
    ctx.fillStyle = "rgba(0, 0, 0, 0.62)";
    ctx.beginPath();
    ctx.ellipse(mx + 10, h - 22, 95, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    // 立體魔物（面向獵人，部位破壞與斷尾同步反映在模型上）
    const bk = c.isBoss ? 1.3 : 1.0;
    const bu = 105;
    const feetY = h - 22;
    const isElite = !!(c.isElite);
    this.drawMonsterSprite(ctx, null, w, h, { sx: mx, sy: feetY + breathe * 0.3, u: bu }, 0, {
      scale: bk,
      body: c.isBoss ? "#dc2626" : isElite ? "#9333ea" : "#0ea5e9",
      dark: c.isBoss ? "#450a0a" : isElite ? "#3b0764" : "#082f49",
      spike: c.isBoss ? "#fca5a5" : isElite ? "#e9d5ff" : "#bae6fd",
      horn: "#fde68a", wing: c.isBoss ? "#f43f5e" : "#c084fc",
      wings: !!(c.isBoss || isElite),
      aura: c.isBoss ? "rgba(239,68,68,A)" : null,
      flip: true, noTail: !!parts.tail.broken, headBroken: !!parts.head.broken,
      hurt: c.shake > 0, enraged: !!c.enraged
    }, animFrame);
    if (parts.tail.broken) {
      ctx.fillStyle = "#facc15";
      ctx.font = "bold 10px 'PingFang TC', monospace";
      ctx.textAlign = "center";
      ctx.fillText("[已斷尾!]", mx + 50 * bk, h - 8);
    }

    // 部位命中框（對應立體魔物：頭在左前、軀幹居中、尾在右後）
    const uu = bu * bk;
    const headBox = { key: "head", x: mx - 0.58 * uu, y: feetY - 0.85 * uu + breathe, w: 0.52 * uu, h: 0.45 * uu };
    const bodyBox = { key: "body", x: mx - 0.4 * uu, y: feetY - 0.78 * uu + breathe, w: 0.8 * uu, h: 0.6 * uu };
    const tailBox = { key: "tail", x: mx + 0.32 * uu, y: feetY - 0.8 * uu, w: 0.45 * uu, h: 0.5 * uu };
    // 頭優先於軀幹判定
    this.partHitboxes = [headBox, tailBox, bodyBox];

    // 繪製三部位鎖定準星與部位耐久條 (Monster Hunter Part Break Reticle)
    this.partHitboxes.forEach(pb => {
      const pState = parts[pb.key];
      if (!pState) return;
      const isSelected = targetPart === pb.key;
      const cx = pb.x + pb.w * 0.5;
      const cy = pb.y + pb.h * 0.5;
      const lblDX = pb.key === "head" ? -26 : pb.key === "tail" ? 30 : 0;

      if (isSelected) {
        ctx.save();
        ctx.strokeStyle = "#facc15";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, 22 + Math.sin(animFrame * 0.2) * 3, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx - 28, cy);
        ctx.lineTo(cx - 14, cy);
        ctx.moveTo(cx + 14, cy);
        ctx.lineTo(cx + 28, cy);
        ctx.moveTo(cx, cy - 28);
        ctx.lineTo(cx, cy - 14);
        ctx.moveTo(cx, cy + 14);
        ctx.lineTo(cx, cy + 28);
        ctx.stroke();
        ctx.restore();
      }

      // 部位標籤與迷你耐久條
      const labelY = pb.key === "body" ? pb.y + pb.h + 4 : pb.y - 6;
      const pct = Math.max(0, Math.min(1, pState.hp / pState.maxHp));
      ctx.fillStyle = "rgba(9, 13, 22, 0.86)";
      ctx.fillRect(cx + lblDX - 30, labelY - 12, 60, 16);
      ctx.strokeStyle = pState.broken ? "#ef4444" : isSelected ? "#facc15" : "#475569";
      ctx.lineWidth = isSelected ? 1.5 : 1;
      ctx.strokeRect(cx + lblDX - 30, labelY - 12, 60, 16);

      ctx.fillStyle = pState.broken ? "#fca5a5" : isSelected ? "#fef08a" : "#cbd5e1";
      ctx.font = "bold 10px 'PingFang TC', monospace";
      ctx.textAlign = "center";
      ctx.fillText(pState.broken ? `${pState.name}[破]` : `${pState.name}`, cx + lblDX, labelY - 4);

      if (!pState.broken) {
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(cx + lblDX - 26, labelY + 5, 52, 4);
        ctx.fillStyle = isSelected ? "#facc15" : "#38bdf8";
        ctx.fillRect(cx + lblDX - 26, labelY + 5, Math.round(52 * pct), 4);
      }
    });

    // 4. 戰鬥畫布左上角：斬味刀刃計 + 太刀氣刃槽 + 鎖定部位提示
    const sharpInfo = this.engine.getSharpnessTierInfo ? this.engine.getSharpnessTierInfo() : { label: "紫斬", color: "#c084fc", mult: 1.38 };
    const sharpVal = typeof s.sharpness === "number" ? s.sharpness : 100;
    ctx.fillStyle = "rgba(9, 13, 22, 0.88)";
    ctx.fillRect(10, 8, 315, 42);
    ctx.strokeStyle = sharpInfo.color;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(10, 8, 315, 42);

    ctx.fillStyle = "#1e293b";
    ctx.fillRect(18, 15, 130, 8);
    ctx.fillStyle = sharpInfo.color;
    ctx.fillRect(18, 15, Math.round((sharpVal / 100) * 130), 8);

    ctx.textAlign = "left";
    ctx.font = "bold 11px 'PingFang TC', monospace";
    ctx.fillStyle = "#fef08a";
    ctx.fillText(`斬味:${sharpInfo.label}(x${sharpInfo.mult}) [R磨刀]`, 156, 20);

    const partLabelMap = { head: "頭部 (累積氣絕KO)", body: "軀幹 (弱點肉質+15%)", tail: "尾巴 (可斷尾剝取)" };
    ctx.fillStyle = "#38bdf8";
    ctx.fillText(`[鎖定部位] ${partLabelMap[targetPart] || "軀幹"} (可直接點擊魔物部位切換)`, 18, 38);

    // 5. 繪製 3D 武器斬擊光弧與彈道特效
    if (c.slashAnim > 0) {
      const targetBox = this.partHitboxes.find(b => b.key === targetPart) || bodyBox;
      const tx = targetBox.x + targetBox.w * 0.5;
      const ty = targetBox.y + targetBox.h * 0.5;
      const pType = c.projAnim && c.projAnim.type ? c.projAnim.type : "physical";
      const beamColors = {
        physical: ["#facc15", "#fef08a"],
        star: ["#38bdf8", "#e0f2fe"],
        fire: ["#ea580c", "#fde047"],
        frost: ["#0284c7", "#bae6fd"],
        void: ["#9333ea", "#f3e8ff"],
        ultimate: ["#f43f5e", "#fef08a"]
      };
      const [mainCol, coreCol] = beamColors[pType] || beamColors.physical;

      ctx.save();
      ctx.strokeStyle = mainCol;
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(tx - 42, ty - 36);
      ctx.lineTo(tx + 42, ty + 36);
      ctx.moveTo(tx + 42, ty - 32);
      ctx.lineTo(tx - 42, ty + 32);
      ctx.stroke();

      ctx.strokeStyle = coreCol;
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.restore();
      c.slashAnim--;
    }

    // 6. 傷害跳字與 PART BREAK! / TAIL SEVERED! 特效字
    if (c.fx && c.fx.ticks > 0) {
      ctx.font = "bold 20px 'Courier New', 'PingFang TC', monospace";
      ctx.textAlign = "center";
      ctx.fillStyle = "#090d16";
      ctx.fillText(c.fx.text, mx + 2, my - 56 - (30 - c.fx.ticks) + 2);
      ctx.fillStyle = c.fx.color || "#facc15";
      ctx.fillText(c.fx.text, mx, my - 56 - (30 - c.fx.ticks));
      c.fx.ticks--;
    }
  }

  handleBattleCanvasClick(lx, ly) {
    if (!this.engine.combat || !this.partHitboxes.length) return false;
    for (const pb of this.partHitboxes) {
      if (lx >= pb.x && lx <= pb.x + pb.w && ly >= pb.y && ly <= pb.y + pb.h) {
        if (this.engine.selectMonsterPart) {
          this.engine.selectMonsterPart(pb.key);
          this.ui.renderAll();
          return true;
        }
      }
    }
    return false;
  }
}

if (typeof window !== "undefined") {
  window.MH3DRenderer = MH3DRenderer;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = { MH3DRenderer };
}
