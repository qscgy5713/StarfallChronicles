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

    faces.forEach(f => {
      this.drawQuad3D(ctx, f.pts, f.col, palette.stroke || "rgba(15, 23, 42, 0.45)", 0.9);
    });

    if (palette.top) {
      this.drawQuad3D(ctx, [p010, p110, p111, p011], palette.top, palette.stroke || "rgba(15, 23, 42, 0.5)", 0.9);
    }
  }

  getBiome3DPalette(chNum) {
    const palettes = {
      1: {
        skyTop: "#071712",
        skyHorizon: "#133b2b",
        groundA: "#163024",
        groundB: "#1c3b2c",
        groundStroke: "rgba(45, 212, 191, 0.16)",
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
        skyTop: "#040d1f",
        skyHorizon: "#0f2e59",
        groundA: "#11243d",
        groundB: "#162d4c",
        groundStroke: "rgba(56, 189, 248, 0.18)",
        wallTop: "#334155",
        wallFront: "#1e293b",
        wallSide: "#152033",
        wallSideDark: "#0c1322",
        liquid: "#0369a1",
        liquidGlow: "#2dd4bf",
        bridge: "#92400e",
        accent: "#38bdf8"
      },
      3: {
        skyTop: "#180604",
        skyHorizon: "#45140b",
        groundA: "#29120e",
        groundB: "#361812",
        groundStroke: "rgba(251, 146, 60, 0.2)",
        wallTop: "#44403c",
        wallFront: "#292524",
        wallSide: "#1c1917",
        wallSideDark: "#141210",
        liquid: "#c2410c",
        liquidGlow: "#facc15",
        bridge: "#57534e",
        accent: "#fb923c"
      },
      4: {
        skyTop: "#08061a",
        skyHorizon: "#251c5c",
        groundA: "#18143b",
        groundB: "#201b4d",
        groundStroke: "rgba(167, 139, 250, 0.22)",
        wallTop: "#cbd5e1",
        wallFront: "#64748b",
        wallSide: "#475569",
        wallSideDark: "#334155",
        liquid: "#312e81",
        liquidGlow: "#c084fc",
        bridge: "#ca8a04",
        accent: "#a78bfa"
      },
      5: {
        skyTop: "#140511",
        skyHorizon: "#420f33",
        groundA: "#240d20",
        groundB: "#2e1129",
        groundStroke: "rgba(244, 63, 94, 0.22)",
        wallTop: "#4c1d95",
        wallFront: "#2e1065",
        wallSide: "#1e0942",
        wallSideDark: "#13052b",
        liquid: "#881337",
        liquidGlow: "#f43f5e",
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
    groundBgGrad.addColorStop(0.25, "#090e18");
    groundBgGrad.addColorStop(1, "#04070d");
    ctx.fillStyle = groundBgGrad;
    ctx.fillRect(0, horizonY, w, h - horizonY);

    // 遠景 3D 狩獵山脈與古龍骨シルエット (隨 camYaw 水平視差捲動)
    const yawShift = ((this.camYaw / (Math.PI * 2)) * w * 1.5) % w;
    ctx.fillStyle = "rgba(8, 13, 24, 0.72)";
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
    let floorCol = checker ? pal.groundA : pal.groundB;
    if (!visible) floorCol = "#0a0f1a";
    this.drawQuad3D(
      ctx,
      [p00, p10, p11, p01],
      floorCol,
      isHover ? "#facc15" : pal.groundStroke,
      isHover ? 2.5 : 0.8
    );

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
        this.drawBox3D(ctx, cam, w, h, tx, 0.85, ty, 0.88, 0.55, 0.88, {
          top: "#22c55e",
          front: "#15803d",
          side: "#166534",
          sideDark: "#14532d"
        });
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

  draw3DFieldObject(ctx, cam, w, h, tx, ty, tile, chNum, pal, animFrame) {
    const ev = this.engine.resolveEventAt ? this.engine.resolveEventAt(tx, ty, tile) : this.engine.activeEvents[`${tx},${ty}`];
    const bob = Math.sin(animFrame * 0.1 + tx + ty) * 0.08;

    if (tile === "F") {
      // 魔物獵人 3D 前線獵人帳篷 + 烤肉篝火
      this.drawBox3D(ctx, cam, w, h, tx - 0.18, 0, ty - 0.15, 0.55, 0.52, 0.55, {
        top: "#b45309",
        front: "#92400e",
        side: "#78350f",
        sideDark: "#451a03",
        stroke: "#facc15"
      });
      const flameH = 0.35 + Math.sin(animFrame * 0.25) * 0.08;
      this.drawBox3D(ctx, cam, w, h, tx + 0.18, 0, ty + 0.15, 0.26, flameH, 0.26, {
        top: "#fef08a",
        front: "#f97316",
        side: "#ea580c",
        sideDark: "#c2410c",
        stroke: "#fde047"
      });
      return;
    }

    if (tile === "A") {
      // 3D 龍職人工坊鐵砧與熔爐
      this.drawBox3D(ctx, cam, w, h, tx, 0, ty, 0.62, 0.48, 0.42, {
        top: "#94a3b8",
        front: "#475569",
        side: "#334155",
        sideDark: "#1e293b",
        stroke: "#38bdf8"
      });
      return;
    }

    if (tile === "C" || tile === "U") {
      // 3D 獵人公會支給品箱 / 遠古星魂聖棺
      const isReliq = tile === "U";
      this.drawBox3D(ctx, cam, w, h, tx, 0, ty, isReliq ? 0.68 : 0.52, isReliq ? 0.48 : 0.38, 0.46, {
        top: isReliq ? "#facc15" : "#d97706",
        front: isReliq ? "#a16207" : "#92400e",
        side: "#78350f",
        sideDark: "#451a03",
        stroke: "#fef08a"
      });
      return;
    }

    if (tile === "S" || tile === "V" || tile === "R" || tile === "?") {
      // 3D 古代龍人石碑 / 機關方尖碑
      this.drawBox3D(ctx, cam, w, h, tx, 0, ty, 0.42, 0.88 + bob * 0.5, 0.42, {
        top: "#38bdf8",
        front: "#0284c7",
        side: "#0369a1",
        sideDark: "#0c4a6e",
        stroke: "#bae6fd"
      });
      return;
    }

    if (tile === "G") {
      // 3D 封印巨門
      this.drawBox3D(ctx, cam, w, h, tx, 0, ty, 0.92, 1.15, 0.28, {
        top: "#f59e0b",
        front: "#78350f",
        side: "#451a03",
        sideDark: "#290f02",
        stroke: "#facc15"
      });
      return;
    }

    if (tile === "O" || tile === "P" || tile === ">" || tile === "<") {
      // 3D 翔蟲躍遷柱 / 區域傳送門
      const col = tile === "P" ? "#c084fc" : tile === "O" ? "#38bdf8" : "#facc15";
      this.drawBox3D(ctx, cam, w, h, tx, 0.05 + bob, ty, 0.48, 0.72, 0.48, {
        top: "#ffffff",
        front: col,
        side: col,
        sideDark: "#1e293b",
        stroke: "#fef08a"
      });
      return;
    }

    if (tile === "N") {
      // 3D 公會接待員 / NPC
      this.drawBox3D(ctx, cam, w, h, tx, 0, ty, 0.36, 0.56, 0.36, {
        top: "#38bdf8",
        front: "#0284c7",
        side: "#0369a1",
        sideDark: "#0c4a6e",
        stroke: "#e0f2fe"
      });
      this.drawBox3D(ctx, cam, w, h, tx, 0.56, ty, 0.26, 0.24, 0.26, {
        top: "#fde68a",
        front: "#fcd34d",
        side: "#f59e0b",
        sideDark: "#d97706"
      });
      return;
    }

    if (tile === "E" || tile === "B") {
      // 3D 多部位巨型魔物立體模型（含頭部、軀幹、尾巴、雙翼與警戒紅眼）
      const en = ev && this.engine.data.enemies[ev.enemyId];
      const isBoss = tile === "B" || (en && en.isBoss);
      const isElite = en && en.isElite;
      const scale = isBoss ? 1.38 : isElite ? 1.15 : 0.92;
      const bodyCol = isBoss ? "#dc2626" : isElite ? "#9333ea" : "#0ea5e9";
      const darkCol = isBoss ? "#7f1d1d" : isElite ? "#581c87" : "#0369a1";
      const hornCol = "#facc15";

      // 軀幹 (Body)
      this.drawBox3D(ctx, cam, w, h, tx, 0.15, ty, 0.56 * scale, 0.46 * scale, 0.66 * scale, {
        top: bodyCol,
        front: darkCol,
        side: darkCol,
        sideDark: "#0f172a",
        stroke: isBoss ? "#facc15" : "#38bdf8"
      });
      // 頭部與龍角 (Head)
      this.drawBox3D(ctx, cam, w, h, tx, 0.38 * scale, ty + 0.36 * scale, 0.38 * scale, 0.34 * scale, 0.36 * scale, {
        top: hornCol,
        front: bodyCol,
        side: darkCol,
        sideDark: "#0f172a",
        stroke: "#fef08a"
      });
      // 尾巴 (Tail)
      const tailSwing = Math.sin(animFrame * 0.12 + tx) * 0.14;
      this.drawBox3D(ctx, cam, w, h, tx + tailSwing, 0.18 * scale, ty - 0.46 * scale, 0.22 * scale, 0.22 * scale, 0.45 * scale, {
        top: bodyCol,
        front: darkCol,
        side: darkCol,
        sideDark: "#0f172a"
      });
      // 首領巨翼
      if (isBoss || isElite) {
        const wingFlap = Math.sin(animFrame * 0.15) * 0.12;
        this.drawBox3D(ctx, cam, w, h, tx - 0.48 * scale, (0.48 + wingFlap) * scale, ty, 0.42 * scale, 0.12 * scale, 0.52 * scale, {
          top: "#f43f5e",
          front: "#881337",
          side: "#881337"
        });
        this.drawBox3D(ctx, cam, w, h, tx + 0.48 * scale, (0.48 + wingFlap) * scale, ty, 0.42 * scale, 0.12 * scale, 0.52 * scale, {
          top: "#f43f5e",
          front: "#881337",
          side: "#881337"
        });
      }
      return;
    }

    // 其他採集物 / 手札 / 星泉 / 陷阱
    this.drawBox3D(ctx, cam, w, h, tx, 0.05 + bob * 0.5, ty, 0.34, 0.34, 0.34, {
      top: "#4ade80",
      front: "#16a34a",
      side: "#15803d",
      sideDark: "#14532d",
      stroke: "#bbf7d0"
    });
  }

  draw3DHunterOnField(ctx, cam, w, h, hx, hz, animFrame) {
    const bob = Math.sin(animFrame * 0.16) * 0.04;
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

    // 獵人雙腿與重甲靴
    this.drawBox3D(ctx, cam, w, h, hx, 0, hz, 0.32, 0.28, 0.28, {
      top: "#334155",
      front: "#1e293b",
      side: "#0f172a",
      sideDark: "#090d16"
    });
    // 獵人星隕龍鎧胸甲與披風
    this.drawBox3D(ctx, cam, w, h, hx, 0.28 + bob, hz, 0.42, 0.38, 0.32, {
      top: "#38bdf8",
      front: "#0284c7",
      side: "#1d4ed8",
      sideDark: "#1e3a8a",
      stroke: "#e0f2fe"
    });
    // 獵人頭盔與紅蓮狩獵羽飾
    this.drawBox3D(ctx, cam, w, h, hx, 0.66 + bob, hz, 0.28, 0.26, 0.28, {
      top: "#facc15",
      front: "#eab308",
      side: "#ca8a04",
      sideDark: "#854d0e",
      stroke: "#fef08a"
    });
    // 背負式《魔物獵人》巨型大劍 / 太刀 (隨武器附魔散發元素光芒)
    this.drawBox3D(ctx, cam, w, h, hx + 0.24, 0.24 + bob, hz + 0.12, 0.12, 0.78, 0.16, {
      top: "#ffffff",
      front: wepCol,
      side: wepCol,
      sideDark: "#475569",
      stroke: "#ffffff"
    });

    // 隨行艾露星貓夥伴 (Palico Companion)
    const petX = hx - 0.55;
    const petZ = hz + 0.25;
    const petBob = Math.abs(Math.sin(animFrame * 0.2)) * 0.08;
    this.drawBox3D(ctx, cam, w, h, petX, petBob, petZ, 0.26, 0.34, 0.26, {
      top: "#2dd4bf",
      front: "#0d9488",
      side: "#0f766e",
      sideDark: "#115e59",
      stroke: "#99f6e4"
    });
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

    // 1. 3D 戰鬥競技場天幕與透視地坪
    const horizonY = 58;
    const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
    skyGrad.addColorStop(0, pal.skyTop);
    skyGrad.addColorStop(1, pal.skyHorizon);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, horizonY);

    const floorGrad = ctx.createLinearGradient(0, horizonY, 0, h);
    floorGrad.addColorStop(0, pal.groundB);
    floorGrad.addColorStop(1, "#060911");
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, horizonY, w, h - horizonY);

    // 3D 深度放射格線與遠景岩柱
    ctx.strokeStyle = pal.groundStroke;
    ctx.lineWidth = 1.2;
    for (let gx = -160; gx <= w + 160; gx += 56) {
      ctx.beginPath();
      ctx.moveTo(w * 0.5 + (gx - w * 0.5) * 0.35, horizonY);
      ctx.lineTo(gx, h);
      ctx.stroke();
    }
    for (let gy = horizonY + 18; gy < h; gy += 26) {
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(w, gy);
      ctx.stroke();
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

    // 繪製 3D 獵人背影/側身立體裝甲與大劍
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.beginPath();
    ctx.ellipse(hx, hy + 4, 36, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    if (this.ui.px) {
      const frame2 = Math.floor(animFrame / 18) % 2;
      this.ui.px.drawSprite(ctx, frame2 ? "hero_1" : "hero_0", hx - 38, hy - 82, 78);
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

    // 繪製 3D 魔物尾巴部件 (若未斷尾則連接於後方擺動；若已斷尾則繪製斷面與掉落地面之斷尾)
    const tailSwing = Math.sin(animFrame * 0.14) * 8;
    const tailBox = { key: "tail", x: mx + 58, y: my - 18 + tailSwing, w: 72, h: 48 };
    if (!parts.tail.broken) {
      ctx.fillStyle = c.enraged ? "#991b1b" : "#1e293b";
      ctx.strokeStyle = c.enraged ? "#f43f5e" : "#64748b";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(mx + 35, my + 8);
      ctx.lineTo(mx + 105, my - 14 + tailSwing);
      ctx.lineTo(mx + 126, my + 4 + tailSwing);
      ctx.lineTo(mx + 95, my + 24 + tailSwing);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else {
      // 已斷尾：在地面顯示可剝取的斷尾殘骸
      ctx.fillStyle = "#475569";
      ctx.fillRect(mx + 82, h - 34, 38, 14);
      ctx.fillStyle = "#facc15";
      ctx.font = "bold 10px 'PingFang TC', monospace";
      ctx.textAlign = "center";
      ctx.fillText("[已斷尾!]", mx + 101, h - 38);
    }

    // 繪製魔物本體精靈與 3D 裝甲層
    const bossSz = c.isBoss ? 116 : 98;
    if (this.ui.px) {
      this.ui.px.drawSprite(ctx, c.icon || "enemy_wolf", mx - bossSz * 0.5, my - bossSz * 0.5 + breathe, bossSz);
    }

    const headBox = { key: "head", x: mx - 76, y: my - 46 + breathe, w: 58, h: 54 };
    const bodyBox = { key: "body", x: mx - 18, y: my - 38 + breathe, w: 74, h: 68 };
    this.partHitboxes = [headBox, bodyBox, tailBox];

    // 繪製三部位鎖定準星與部位耐久條 (Monster Hunter Part Break Reticle)
    this.partHitboxes.forEach(pb => {
      const pState = parts[pb.key];
      if (!pState) return;
      const isSelected = targetPart === pb.key;
      const cx = pb.x + pb.w * 0.5;
      const cy = pb.y + pb.h * 0.5;

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
      const labelY = pb.y - 6;
      const pct = Math.max(0, Math.min(1, pState.hp / pState.maxHp));
      ctx.fillStyle = "rgba(9, 13, 22, 0.86)";
      ctx.fillRect(cx - 30, labelY - 12, 60, 16);
      ctx.strokeStyle = pState.broken ? "#ef4444" : isSelected ? "#facc15" : "#475569";
      ctx.lineWidth = isSelected ? 1.5 : 1;
      ctx.strokeRect(cx - 30, labelY - 12, 60, 16);

      ctx.fillStyle = pState.broken ? "#fca5a5" : isSelected ? "#fef08a" : "#cbd5e1";
      ctx.font = "bold 10px 'PingFang TC', monospace";
      ctx.textAlign = "center";
      ctx.fillText(pState.broken ? `${pState.name}[破]` : `${pState.name}`, cx, labelY - 4);

      if (!pState.broken) {
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(cx - 26, labelY + 5, 52, 4);
        ctx.fillStyle = isSelected ? "#facc15" : "#38bdf8";
        ctx.fillRect(cx - 26, labelY + 5, Math.round(52 * pct), 4);
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
