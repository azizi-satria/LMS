// ════════════════════════════════════════════
// WORLD — FPS Engine · Roblox-style 3D (v5)
// ════════════════════════════════════════════

const World = (() => {

  let scene, camera, renderer, composer, clock;
  let ambLight, hemiLight;

  // ── FPS ──────────────────────────────────────
  let yaw = 0, pitch = 0, pointerLocked = false;
  const keys = {};
  const SPEED = 6, EYE_H = 1.65;

  // ── Room state ────────────────────────────────
  let currentRoom  = null;
  let roomObjects  = [];
  let interactables = [];
  let animFns      = [];
  let _doorGate    = null;   // fn() → true = boleh buka, false = blokir
  let _lookTarget  = null;   // { yaw, pitch } untuk camera pan otomatis

  let onInteractCb = null;

  // ── Location themes ───────────────────────────
  const LOC_THEMES = {
    gov: {
      floorBg:'#09091a', floorLine:'rgba(80,60,220,0.32)',
      wallBg:'#0d0d22', wallLine:'rgba(120,80,255,0.2)',
      wallColor:0x0d0d22, floorColor:0x8080aa, ceilColor:0x060612,
      accentCol:0x7c3aed, baseCol:0x06b6d4, doorFrameCol:0x3a1a7a, signCol:0x00ff88,
      fogCol:0x080818,
      npcShirts:[0x1a3a7a,0x3d1a7a,0x0a4a30],
      npcPants: [0x0f1f40,0x1a0d40,0x062a1a],
      npcSkins: [0xb07040,0x8a5c30,0xb07040],
      npcHair:  [0x1a0a00,0x111111,0x331100],
      ambientCol:0xc8d8ff, hemiSky:0xddeeff, hemiGround:0x334466,
    },
    campus: {
      floorBg:'#120e04', floorLine:'rgba(120,90,20,0.38)',
      wallBg:'#0c1208', wallLine:'rgba(40,140,40,0.2)',
      wallColor:0x0c1208, floorColor:0x7a6030, ceilColor:0x080e06,
      accentCol:0x16a34a, baseCol:0xca8a04, doorFrameCol:0x14532d, signCol:0xfbbf24,
      fogCol:0x060e08,
      npcShirts:[0x14532d,0x1e4080,0x7c2800],
      npcPants: [0x0a2a14,0x0f1f40,0x3a1200],
      npcSkins: [0xb07040,0xc08850,0x8a5c30],
      npcHair:  [0x111111,0x1a0800,0x221100],
      ambientCol:0xd8f0c8, hemiSky:0xe8ffe0, hemiGround:0x1a3a1a,
    },
    corp: {
      floorBg:'#0a0a0a', floorLine:'rgba(180,100,20,0.3)',
      wallBg:'#0c0c0e', wallLine:'rgba(180,100,20,0.18)',
      wallColor:0x0c0c0e, floorColor:0x606060, ceilColor:0x080808,
      accentCol:0xd97706, baseCol:0xb91c1c, doorFrameCol:0x7c2d12, signCol:0xf59e0b,
      fogCol:0x090909,
      npcShirts:[0x1c1c2a,0x7c2d12,0x1e3a5f],
      npcPants: [0x111118,0x0c0c0c,0x0f1f40],
      npcSkins: [0xb07040,0xc08850,0x8a5c30],
      npcHair:  [0x0a0a0a,0x1a0800,0x111111],
      ambientCol:0xffeedd, hemiSky:0xfff0dd, hemiGround:0x1a1a1a,
    },
    isp: {
      floorBg:'#001208', floorLine:'rgba(0,200,80,0.32)',
      wallBg:'#001808', wallLine:'rgba(0,200,80,0.2)',
      wallColor:0x001808, floorColor:0x1a2a18, ceilColor:0x000a04,
      accentCol:0x00aa44, baseCol:0x0891b2, doorFrameCol:0x005522, signCol:0x00ff41,
      fogCol:0x001010,
      npcShirts:[0x003322,0x00334d,0x1a3a00],
      npcPants: [0x001a11,0x001a26,0x0d1a00],
      npcSkins: [0xb07040,0x8a5c30,0xc08850],
      npcHair:  [0x111111,0x0a0800,0x001a00],
      ambientCol:0xaaffee, hemiSky:0xccffee, hemiGround:0x002222,
    },
  };
  let locTheme = LOC_THEMES.gov;
  let _curLocId = 'gov';

  // ══════════════════════════════════════════════
  // INIT
  // ══════════════════════════════════════════════
  function init(cb) {
    onInteractCb = cb;
    const canvas = document.getElementById('c');

    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(innerWidth, innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
    renderer.toneMapping       = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.5;
    renderer.outputEncoding    = THREE.sRGBEncoding;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x080818);
    scene.fog = new THREE.FogExp2(0x080818, 0.018);

    camera = new THREE.PerspectiveCamera(80, innerWidth / innerHeight, 0.05, 80);
    camera.position.set(0, EYE_H, 8);
    clock = new THREE.Clock();

    ambLight  = new THREE.AmbientLight(0xc8d8ff, 2.8);
    hemiLight = new THREE.HemisphereLight(0xddeeff, 0x334466, 1.2);
    scene.add(ambLight); scene.add(hemiLight);

    // Bloom — hanya emissive LED yang bloom, karakter tidak
    const rPass = new THREE.RenderPass(scene, camera);
    const bloom = new THREE.UnrealBloomPass(
      new THREE.Vector2(innerWidth, innerHeight), 0.35, 0.4, 0.95);
    composer = new THREE.EffectComposer(renderer);
    composer.addPass(rPass);
    composer.addPass(bloom);

    setupControls(canvas);
    window.addEventListener('resize', () => {
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(innerWidth, innerHeight);
      composer.setSize(innerWidth, innerHeight);
    });

    animate();
  }

  // ══════════════════════════════════════════════
  // CONTROLS
  // ══════════════════════════════════════════════
  function setupControls(canvas) {
    let _pauseOnUnlock = false;

    document.addEventListener('click', () => {
      if (isUIOpen() || !gameActive()) return;
      canvas.requestPointerLock();
    });
    document.addEventListener('pointerlockchange', () => {
      const prev = pointerLocked;
      pointerLocked = document.pointerLockElement === canvas;
      const ch = document.getElementById('crosshair');
      if (ch) ch.classList.toggle('hidden', !pointerLocked);

      if (prev && !pointerLocked && _pauseOnUnlock && gameActive()) {
        _pauseOnUnlock = false;
        setTimeout(() => {
          if (typeof showPauseMenu === 'function') showPauseMenu();
        }, 30);
        return;
      }
      _pauseOnUnlock = false;
      refreshOverlay();
    });
    document.addEventListener('mousemove', e => {
      if (!pointerLocked) return;
      _lookTarget = null;   // player override auto-pan
      yaw   -= e.movementX * 0.0022;
      pitch  = Math.max(-1.1, Math.min(1.1, pitch - e.movementY * 0.0022));
    });
    document.addEventListener('keydown', e => {
      keys[e.code] = true;
      if (e.code === 'KeyE') tryInteract();
      if (e.code === 'KeyS') {
        const pauseEl = document.getElementById('pause-screen');
        if (pauseEl && !pauseEl.classList.contains('hidden')) {
          if (typeof saveGame === 'function') saveGame();
        }
      }
      if (e.code === 'Escape') {
        const pauseEl = document.getElementById('pause-screen');
        if (pauseEl && !pauseEl.classList.contains('hidden')) {
          // ESC while paused = resume
          if (typeof resumeGame === 'function') resumeGame();
        } else if (document.pointerLockElement) {
          _pauseOnUnlock = true;
          document.exitPointerLock();
        }
      }
    });
    document.addEventListener('keyup', e => { keys[e.code] = false; });
  }

  function refreshOverlay() {
    const el = document.getElementById('click-to-start');
    if (el) el.style.display = (!pointerLocked && gameActive() && !isUIOpen()) ? 'flex' : 'none';
  }
  function isUIOpen() {
    return ['dialog-box','inspect-box','term-overlay','pause-screen'].some(
      id => { const el = document.getElementById(id); return el && !el.classList.contains('hidden'); });
  }
  function gameActive() {
    return !document.getElementById('game-screen').classList.contains('hidden');
  }

  // ══════════════════════════════════════════════
  // INTERACT
  // ══════════════════════════════════════════════
  function tryInteract() {
    const n = getNear();
    if (!n) return;
    if (n.doorFn) { n.doorFn(); return; }
    if (onInteractCb) onInteractCb(n.itype, n.iid);
  }
  function getNear() {
    let best = null, d = 2.2;
    interactables.forEach(o => {
      const dd = camera.position.distanceTo(o.pos);
      if (dd < d) { d = dd; best = o; }
    });
    return best;
  }
  function updatePrompt() {
    const el = document.getElementById('interact-prompt');
    if (!el) return;
    const n = pointerLocked ? getNear() : null;
    if (n) { el.textContent = '[E]  ' + n.label; el.style.display = 'block'; }
    else   { el.style.display = 'none'; }
  }

  // ══════════════════════════════════════════════
  // MOVEMENT
  // ══════════════════════════════════════════════
  function updateMovement(dt) {
    if (!pointerLocked) return;
    const fwd = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw));
    const rgt = new THREE.Vector3( Math.cos(yaw), 0, -Math.sin(yaw));
    const dir = new THREE.Vector3();
    if (keys['KeyW']||keys['ArrowUp'])    dir.add(fwd);
    if (keys['KeyS']||keys['ArrowDown'])  dir.sub(fwd);
    if (keys['KeyA']||keys['ArrowLeft'])  dir.sub(rgt);
    if (keys['KeyD']||keys['ArrowRight']) dir.add(rgt);
    if (dir.lengthSq() > 0) {
      dir.normalize().multiplyScalar(SPEED * dt);
      const nx = camera.position.clone().add(dir);
      if (currentRoom) {
        const b = currentRoom.bounds;
        nx.x = Math.max(b.x0+0.3, Math.min(b.x1-0.3, nx.x));
        nx.z = Math.max(b.z0+0.3, Math.min(b.z1-0.3, nx.z));
      }
      nx.y = EYE_H;
      camera.position.copy(nx);
    }
    camera.rotation.order = 'YXZ';
    camera.rotation.y = yaw;
    camera.rotation.x = pitch;
  }

  // ══════════════════════════════════════════════
  // ANIMATE
  // ══════════════════════════════════════════════
  function animate() {
    requestAnimationFrame(animate);
    const dt = Math.min(clock.getDelta(), 0.05);
    // Smooth camera pan for guided tour
    if (_lookTarget) {
      let dy = _lookTarget.yaw - yaw;
      // shortest path wrap
      if (dy > Math.PI) dy -= Math.PI*2;
      if (dy < -Math.PI) dy += Math.PI*2;
      yaw   += dy * 0.07;
      pitch += (_lookTarget.pitch - pitch) * 0.07;
    }
    updateMovement(dt);
    updatePrompt();
    animFns.forEach(fn => fn(clock.elapsedTime, dt));
    composer.render();
  }

  // ══════════════════════════════════════════════
  // HELPERS
  // ══════════════════════════════════════════════
  function addR(o) { scene.add(o); roomObjects.push(o); return o; }

  function clearRoom() {
    roomObjects.forEach(o => scene.remove(o));
    roomObjects = []; interactables = []; animFns = [];
  }

  function mkBox(w, h, d, col, rough, metal, emCol, emInt) {
    const m = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d),
      new THREE.MeshStandardMaterial({
        color: col, roughness: rough ?? 0.85, metalness: metal ?? 0.1,
        emissive:          emCol ? new THREE.Color(emCol) : undefined,
        emissiveIntensity: emInt || 0
      })
    );
    m.castShadow = m.receiveShadow = true;
    return m;
  }

  function mkCyl(rt, rb, h, seg, col, emCol, emInt) {
    const m = new THREE.Mesh(
      new THREE.CylinderGeometry(rt, rb, h, seg),
      new THREE.MeshStandardMaterial({
        color: col, roughness: 0.7, metalness: 0.2,
        emissive:          emCol ? new THREE.Color(emCol) : undefined,
        emissiveIntensity: emInt || 0
      })
    );
    m.castShadow = true;
    return m;
  }

  function makeFloorTex() {
    const c = document.createElement('canvas'); c.width = c.height = 512;
    const x = c.getContext('2d');
    x.fillStyle = locTheme.floorBg || '#09091a'; x.fillRect(0,0,512,512);
    x.strokeStyle = locTheme.floorLine || 'rgba(80,60,200,0.28)'; x.lineWidth = 1.5;
    if (_curLocId === 'campus') {
      // wood plank style
      x.lineWidth = 2;
      for (let i = 0; i <= 512; i += 48) { x.beginPath(); x.moveTo(0,i); x.lineTo(512,i); x.stroke(); }
      x.strokeStyle = 'rgba(80,60,10,0.15)'; x.lineWidth = 0.5;
      for (let i = 0; i <= 512; i += 8) { x.beginPath(); x.moveTo(0,i); x.lineTo(512,i); x.stroke(); }
    } else {
      for (let i = 0; i <= 512; i += 64) {
        x.beginPath(); x.moveTo(i,0); x.lineTo(i,512); x.stroke();
        x.beginPath(); x.moveTo(0,i); x.lineTo(512,i); x.stroke();
      }
    }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(6,12);
    return t;
  }

  function makeWallTex() {
    const c = document.createElement('canvas'); c.width = c.height = 512;
    const x = c.getContext('2d');
    x.fillStyle = locTheme.wallBg || '#0d0d20'; x.fillRect(0,0,512,512);
    x.strokeStyle = locTheme.wallLine || 'rgba(120,80,255,0.18)'; x.lineWidth = 1.5;
    if (_curLocId === 'campus') {
      // paint stripes
      for (let i = 0; i <= 512; i += 80) { x.beginPath(); x.moveTo(0,i); x.lineTo(512,i); x.stroke(); }
      x.fillStyle = 'rgba(40,160,40,0.07)';
      for (let r = 40; r < 512; r += 80) for (let cc = 30; cc < 512; cc += 120) {
        x.beginPath(); x.arc(cc,r,3,0,Math.PI*2); x.fill();
      }
    } else if (_curLocId === 'corp') {
      // horizontal panels
      for (let i = 0; i <= 512; i += 60) { x.beginPath(); x.moveTo(0,i); x.lineTo(512,i); x.stroke(); }
      x.fillStyle = 'rgba(180,100,20,0.08)';
      for (let r = 30; r < 512; r += 60) for (let cc = 40; cc < 512; cc += 100) {
        x.fillRect(cc-4,r-1,8,2);
      }
    } else if (_curLocId === 'isp') {
      // matrix green dots
      for (let i = 0; i <= 512; i += 80) { x.beginPath(); x.moveTo(0,i); x.lineTo(512,i); x.stroke(); }
      x.fillStyle = 'rgba(0,200,80,0.12)';
      for (let r = 20; r < 512; r += 40) for (let cc = 20; cc < 512; cc += 60) {
        x.beginPath(); x.arc(cc,r,2,0,Math.PI*2); x.fill();
      }
    } else {
      for (let i = 0; i <= 512; i += 80) { x.beginPath(); x.moveTo(0,i); x.lineTo(512,i); x.stroke(); }
      x.fillStyle = 'rgba(150,100,255,0.12)';
      for (let r = 40; r < 512; r += 80) for (let cc = 30; cc < 512; cc += 120) {
        x.beginPath(); x.arc(cc,r,3,0,Math.PI*2); x.fill();
      }
    }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3,1);
    return t;
  }

  function spot(col, intens, dist, x,y,z, tx,ty,tz) {
    const l = new THREE.SpotLight(col, intens, dist, Math.PI/6, 0.3);
    l.position.set(x,y,z); l.target.position.set(tx,ty,tz);
    l.castShadow = true; l.shadow.mapSize.set(512,512);
    scene.add(l.target); return addR(l);
  }

  function ptLight(col, intens, dist, x,y,z) {
    const l = new THREE.PointLight(col, intens, dist);
    l.position.set(x,y,z); return addR(l);
  }

  // ══════════════════════════════════════════════
  // ROBLOX NPC — detail tinggi
  // ══════════════════════════════════════════════
  function makeNPC(x, y, z, shirtCol, pantCol, skinCol, name) {
    const g = new THREE.Group();
    g.position.set(x, y, z);

    skinCol = skinCol || 0xd4956a;

    // roughness tinggi supaya tidak terlalu reflektif/bloom
    const add = (w,h,d, col, emCol, emInt, px,py,pz) => {
      const mat = new THREE.MeshStandardMaterial({
        color: col, roughness: 0.95, metalness: 0.0,
        emissive: emCol ? new THREE.Color(emCol) : undefined,
        emissiveIntensity: emInt || 0
      });
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), mat);
      mesh.position.set(px||0, py||0, pz||0);
      mesh.castShadow = true;
      g.add(mesh); return mesh;
    };

    const hairCol = locTheme.npcHair ? locTheme.npcHair[0] : 0x1a0a00;
    const shoeCol = (_curLocId === 'corp') ? 0x222222 : 0x0a0a0a;
    const tieCol  = (_curLocId === 'gov' || _curLocId === 'corp') ? 0xaa2222 : null;

    // Torso
    add(0.52, 0.68, 0.32, shirtCol, null, 0,   0, 1.08, 0);
    // Belt
    add(0.54, 0.06, 0.34, 0x222222, null, 0,   0, 0.74, 0);
    // Collar
    add(0.20, 0.10, 0.34, skinCol,  null, 0,   0, 1.40, 0);
    // Tie (gov/corp only)
    if (tieCol) add(0.07, 0.36, 0.06, tieCol, null, 0, 0, 1.16, 0.16);
    // Lab coat lapels (campus)
    if (_curLocId === 'campus') {
      add(0.10, 0.50, 0.06, 0xeeeeee, null, 0, -0.14, 1.10, 0.16);
      add(0.10, 0.50, 0.06, 0xeeeeee, null, 0,  0.14, 1.10, 0.16);
    }
    // Pocket (corp/gov)
    if (_curLocId === 'gov' || _curLocId === 'corp') {
      add(0.16, 0.12, 0.06, 0xddddcc, null, 0, -0.16, 1.18, 0.16);
    }

    // Head
    add(0.48, 0.50, 0.48, skinCol,  null, 0,   0, 1.70, 0);
    // Jaw / chin area slightly wider
    add(0.46, 0.14, 0.44, skinCol,  null, 0,   0, 1.49, 0);
    // Eyes — slightly larger, more expressive
    add(0.11, 0.10, 0.05, 0x0a0a22, 0x2255cc, 0.5, -0.12, 1.72, 0.24);
    add(0.11, 0.10, 0.05, 0x0a0a22, 0x2255cc, 0.5,  0.12, 1.72, 0.24);
    // Eye whites
    add(0.13, 0.12, 0.04, 0xffffff, null, 0,  -0.12, 1.72, 0.23);
    add(0.13, 0.12, 0.04, 0xffffff, null, 0,   0.12, 1.72, 0.23);
    // Eyebrows
    add(0.13, 0.04, 0.03, hairCol,  null, 0,  -0.12, 1.82, 0.24);
    add(0.13, 0.04, 0.03, hairCol,  null, 0,   0.12, 1.82, 0.24);
    // Nose
    add(0.06, 0.05, 0.06, skinCol,  null, 0,   0,   1.63, 0.25);
    // Mouth
    add(0.16, 0.04, 0.04, 0x662211, null, 0,   0,   1.55, 0.24);
    // Ears
    add(0.04, 0.12, 0.12, skinCol,  null, 0,  -0.26, 1.70, 0);
    add(0.04, 0.12, 0.12, skinCol,  null, 0,   0.26, 1.70, 0);
    // Hair top
    add(0.52, 0.14, 0.52, hairCol,  null, 0,   0, 1.96, -0.02);
    // Hair side/back
    add(0.54, 0.30, 0.12, hairCol,  null, 0,   0, 1.82, -0.22);
    add(0.16, 0.30, 0.50, hairCol,  null, 0,  -0.25, 1.82, -0.02);
    add(0.16, 0.30, 0.50, hairCol,  null, 0,   0.25, 1.82, -0.02);

    // Neck
    add(0.20, 0.12, 0.20, skinCol,  null, 0,   0, 1.44, 0);

    // Left arm (upper)
    add(0.22, 0.38, 0.28, shirtCol, null, 0,  -0.40, 1.18, 0);
    // Left elbow
    add(0.22, 0.10, 0.28, skinCol,  null, 0,  -0.40, 0.98, 0);
    // Left forearm
    add(0.20, 0.28, 0.26, shirtCol, null, 0,  -0.40, 0.83, 0);
    // Left hand
    add(0.20, 0.20, 0.20, skinCol,  null, 0,  -0.40, 0.67, 0.02);

    // Right arm (upper)
    add(0.22, 0.38, 0.28, shirtCol, null, 0,   0.40, 1.18, 0);
    // Right elbow
    add(0.22, 0.10, 0.28, skinCol,  null, 0,   0.40, 0.98, 0);
    // Right forearm
    add(0.20, 0.28, 0.26, shirtCol, null, 0,   0.40, 0.83, 0);
    // Right hand
    add(0.20, 0.20, 0.20, skinCol,  null, 0,   0.40, 0.67, 0.02);

    // Left thigh
    add(0.24, 0.36, 0.30, pantCol,  null, 0,  -0.14, 0.50, 0);
    // Left knee
    add(0.22, 0.10, 0.28, pantCol,  null, 0,  -0.14, 0.31, 0);
    // Left shin
    add(0.22, 0.26, 0.28, pantCol,  null, 0,  -0.14, 0.17, 0);
    // Left shoe
    add(0.24, 0.11, 0.34, shoeCol,  null, 0,  -0.14, 0.01, 0.04);

    // Right thigh
    add(0.24, 0.36, 0.30, pantCol,  null, 0,   0.14, 0.50, 0);
    // Right knee
    add(0.22, 0.10, 0.28, pantCol,  null, 0,   0.14, 0.31, 0);
    // Right shin
    add(0.22, 0.26, 0.28, pantCol,  null, 0,   0.14, 0.17, 0);
    // Right shoe
    add(0.24, 0.11, 0.34, shoeCol,  null, 0,   0.14, 0.01, 0.04);

    // Name tag floating above head
    if (name) {
      const tag = mkBox(name.length * 0.09 + 0.1, 0.18, 0.04, 0x1a1a2e, 0.9, 0, 0x7c3aed, 1.2);
      tag.position.set(0, 2.08, 0);
      g.add(tag);
      ptLight(0x7c3aed, 0.6, 1.2, x, y+2.1, z);
    }

    // Idle bob animation
    const off = Math.random() * Math.PI * 2;
    animFns.push(t => {
      g.position.y = y + Math.sin(t * 1.6 + off) * 0.04;
      g.rotation.y = Math.sin(t * 0.4 + off) * 0.1;
    });

    addR(g);
    return g;
  }

  // ══════════════════════════════════════════════
  // SERVER RACK — Roblox-style detail tinggi
  // ══════════════════════════════════════════════
  function buildRack(x, z, rotY) {
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    g.rotation.y = rotY || 0;

    // Chassis utama
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.8, 3.8, 1.0),
      new THREE.MeshStandardMaterial({ color: 0x0c0c1e, roughness: 0.4, metalness: 0.8 }));
    body.position.y = 1.9; body.castShadow = true; g.add(body);

    // Frame kiri kanan
    [-0.87, 0.87].forEach(xf => {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.05, 3.8, 1.05),
        new THREE.MeshStandardMaterial({ color: 0x1a1a3a, roughness: 0.5, metalness: 0.9 }));
      rail.position.set(xf, 1.9, 0); g.add(rail);
    });

    // Server units + LEDs (tanpa PointLight per LED — hemat GPU)
    const unitCols = [0x00ff41, 0x06b6d4, 0x00ff41, 0xf59e0b, 0x10b981,
                      0xff4444, 0x06b6d4, 0x00ff41, 0xa855f7, 0x00ff41];
    const leds = [], bars = [];
    for (let i = 0; i < 8; i++) {
      const yy = 0.25 + i * 0.44;
      const lc = unitCols[i % unitCols.length];

      const unit = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.38, 0.88),
        new THREE.MeshStandardMaterial({ color: i%2===0 ? 0x111128 : 0x0d0d20, roughness: 0.7, metalness: 0.4 }));
      unit.position.set(0, yy, 0); g.add(unit);

      const led = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.07, 0.06),
        new THREE.MeshStandardMaterial({ color: lc, emissive: new THREE.Color(lc), emissiveIntensity: 4 }));
      led.position.set(-0.72, yy, 0.45); g.add(led); leds.push({ m: led, c: lc });

      const bar = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.04, 0.03),
        new THREE.MeshStandardMaterial({ color: lc, emissive: new THREE.Color(lc), emissiveIntensity: 2 }));
      bar.position.set(-0.52, yy, 0.45); g.add(bar); bars.push(bar);
    }

    // Top glow strip
    const topStrip = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.05, 0.9),
      new THREE.MeshStandardMaterial({ color: 0x5522aa, emissive: new THREE.Color(0x5522aa), emissiveIntensity: 3 }));
    topStrip.position.set(0, 3.82, 0); g.add(topStrip);

    // SATU PointLight per rack (bukan per LED) — hemat drastis
    const rackLight = new THREE.PointLight(0x3311aa, 1.0, 3.5);
    rackLight.position.set(x, 2.0, z); addR(rackLight);

    // Satu animFn per rack (bukan per LED)
    const off = Math.random() * Math.PI * 2;
    animFns.push(t => {
      leds.forEach((ld, i) => {
        const v = 2.5 + Math.sin(t * (1 + i * 0.3) + off) * 2;
        ld.m.material.emissiveIntensity = v;
        bars[i].material.emissiveIntensity = v * 0.4;
      });
    });

    addR(g);
  }

  // ══════════════════════════════════════════════
  // INTERACTIVE ITEM (PC / Monitor / Router dll)
  // ══════════════════════════════════════════════
  function buildItem(obj, x, z, itemData) {
    const id = obj.id || '';
    const isMonitor = /monitor|browser|display/i.test(id);
    const isRouter  = /router|switch|firewall/i.test(id);
    const isServer  = /server|rack|nas/i.test(id);

    const cols = [0x7c3aed,0x06b6d4,0x10b981,0xa855f7,0xf59e0b,0xef4444];
    const col  = cols[Math.abs((id.charCodeAt(0)||0) * 3) % cols.length];

    const g = new THREE.Group();
    g.position.set(x, 0, z);

    if (isMonitor) {
      // Monitor Roblox-style
      const stand = new THREE.Mesh(new THREE.BoxGeometry(0.12,0.5,0.12),
        new THREE.MeshStandardMaterial({ color: 0x222233, roughness: 0.5, metalness: 0.8 }));
      stand.position.set(0, 0.85, 0); g.add(stand);

      const base = new THREE.Mesh(new THREE.BoxGeometry(0.55,0.06,0.35),
        new THREE.MeshStandardMaterial({ color: 0x1a1a2e, roughness: 0.5, metalness: 0.7 }));
      base.position.set(0, 0.6, 0); g.add(base);

      const screen = new THREE.Mesh(new THREE.BoxGeometry(1.1,0.75,0.10),
        new THREE.MeshStandardMaterial({ color: 0x001122, roughness: 0.1, metalness: 0.4,
          emissive: new THREE.Color(col), emissiveIntensity: 0.7 }));
      screen.position.set(0, 1.35, 0); g.add(screen);

      // Screen content lines (pixel art style)
      for (let li = 0; li < 5; li++) {
        const line = new THREE.Mesh(new THREE.BoxGeometry(0.7+Math.random()*0.25, 0.04, 0.02),
          new THREE.MeshStandardMaterial({ color: col, emissive: new THREE.Color(col), emissiveIntensity: 2.5 }));
        line.position.set(-0.05+Math.random()*0.1, 1.16+li*0.12, 0.06); g.add(line);
      }

      const frame = new THREE.Mesh(new THREE.BoxGeometry(1.18,0.83,0.06),
        new THREE.MeshStandardMaterial({ color: 0x1a1a2e, roughness: 0.5, metalness: 0.7 }));
      frame.position.set(0, 1.35, -0.04); g.add(frame);

      ptLight(col, 2, 2.5, x, 1.4, z+0.3);
      animFns.push(t => { screen.material.emissiveIntensity = 0.5+Math.sin(t*0.7)*0.2; });

    } else if (isRouter) {
      // Router / Switch
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.9,0.12,0.55),
        new THREE.MeshStandardMaterial({ color: 0x111120, roughness: 0.5, metalness: 0.7 }));
      body.position.set(0, 0.8, 0); g.add(body);

      // Antena
      [-0.3,0,0.3].forEach(xo => {
        const ant = new THREE.Mesh(new THREE.BoxGeometry(0.04,0.45,0.04),
          new THREE.MeshStandardMaterial({ color: 0x222233, roughness: 0.5, metalness: 0.8 }));
        ant.position.set(xo, 1.1, 0); g.add(ant);
        const tip = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 6),
          new THREE.MeshStandardMaterial({ color: col, emissive: new THREE.Color(col), emissiveIntensity: 3 }));
        tip.position.set(xo, 1.35, 0); g.add(tip);
      });

      // LEDs on body
      for (let li = 0; li < 6; li++) {
        const led = new THREE.Mesh(new THREE.BoxGeometry(0.05,0.05,0.03),
          new THREE.MeshStandardMaterial({ color: 0x00ff41, emissive: new THREE.Color(0x00ff41), emissiveIntensity: 3 }));
        led.position.set(-0.3+li*0.12, 0.8, 0.28); g.add(led);
        const spd = 1+Math.random()*3, off = Math.random()*Math.PI*2;
        animFns.push(t => { led.material.emissiveIntensity = 1+Math.sin(t*spd+off)*2; });
      }

      // Stand
      const ped = new THREE.Mesh(new THREE.BoxGeometry(0.55,0.78,0.38),
        new THREE.MeshStandardMaterial({ color: 0x0a0a18, roughness: 0.7, metalness: 0.4 }));
      ped.position.set(0, 0.39, 0); g.add(ped);

      ptLight(col, 1.5, 2.2, x, 1.0, z);

    } else if (isServer) {
      // Mini server on pedestal
      const ped = new THREE.Mesh(new THREE.BoxGeometry(0.6,0.8,0.6),
        new THREE.MeshStandardMaterial({ color: 0x0a0a18, roughness: 0.7, metalness: 0.4 }));
      ped.position.set(0, 0.4, 0); g.add(ped);

      const srv = new THREE.Mesh(new THREE.BoxGeometry(0.85,0.38,0.6),
        new THREE.MeshStandardMaterial({ color: 0x111128, roughness: 0.4, metalness: 0.8 }));
      srv.position.set(0, 0.99, 0); g.add(srv);

      for (let li = 0; li < 4; li++) {
        const led = new THREE.Mesh(new THREE.BoxGeometry(0.06,0.06,0.04),
          new THREE.MeshStandardMaterial({ color: col, emissive: new THREE.Color(col), emissiveIntensity: 3 }));
        led.position.set(-0.3+li*0.2, 0.99, 0.31); g.add(led);
        const spd=0.5+Math.random()*3, off=Math.random()*Math.PI*2;
        animFns.push(t => { led.material.emissiveIntensity = 1+Math.sin(t*spd+off)*2.5; });
      }
      ptLight(col, 2, 2.5, x, 1.1, z);

    } else {
      // Generic PC tower
      const tower = new THREE.Mesh(new THREE.BoxGeometry(0.5,1.0,0.55),
        new THREE.MeshStandardMaterial({ color: 0x101024, roughness: 0.5, metalness: 0.7 }));
      tower.position.set(0, 0.5, 0); g.add(tower);

      // PC stripe
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.52,0.06,0.56),
        new THREE.MeshStandardMaterial({ color: col, emissive: new THREE.Color(col), emissiveIntensity: 2 }));
      stripe.position.set(0, 0.72, 0); g.add(stripe);

      // Power button
      const btn = new THREE.Mesh(new THREE.CylinderGeometry(0.04,0.04,0.03,8),
        new THREE.MeshStandardMaterial({ color: col, emissive: new THREE.Color(col), emissiveIntensity: 3 }));
      btn.position.set(0.22, 0.9, 0.28); btn.rotation.x = Math.PI/2; g.add(btn);

      // Disk drive slot
      const slot = new THREE.Mesh(new THREE.BoxGeometry(0.3,0.04,0.02),
        new THREE.MeshStandardMaterial({ color: 0x333355, roughness: 0.8 }));
      slot.position.set(0, 0.6, 0.27); g.add(slot);

      ptLight(col, 2, 2.5, x, 1.1, z+0.4);
      animFns.push(t => { stripe.material.emissiveIntensity = 1.5+Math.sin(t*1.8)*0.5; });
    }

    // Glowing base platform
    const platform = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.06, 0.8),
      new THREE.MeshStandardMaterial({ color: col, roughness: 0.4, metalness: 0.6,
        emissive: new THREE.Color(col), emissiveIntensity: 0.6 }));
    platform.position.set(0, 0.03, 0); g.add(platform);

    addR(g);

    // Register interactable
    interactables.push({
      pos: new THREE.Vector3(x, EYE_H, z),
      itype: 'item', iid: obj.id,
      label: itemData ? itemData.title : (obj.label || obj.id)
    });
  }

  // ══════════════════════════════════════════════
  // CORRIDOR (LOBBY)
  // ══════════════════════════════════════════════
  function loadCorridor(levelData, doorCb) {
    clearRoom();
    const dimMap = {gov:{W:6,H:4.5,L:22},campus:{W:9,H:3.6,L:18},corp:{W:8,H:4.5,L:20},isp:{W:6,H:4.0,L:20}};
    const {W,H,L} = dimMap[_curLocId] || {W:6,H:4.2,L:24};
    currentRoom = { bounds: { x0:-W/2, x1:W/2, z0:-L/2, z1:L/2 } };
    camera.position.set(0, EYE_H, L/2-1.5); yaw = Math.PI; pitch = 0;

    const flTex = makeFloorTex();
    const wlTex = makeWallTex();

    // Floor
    const fl = new THREE.Mesh(new THREE.BoxGeometry(W, 0.08, L),
      new THREE.MeshStandardMaterial({ map: flTex, roughness: 0.22, metalness: 0.6, color: 0x8888aa }));
    fl.position.set(0,-0.04,0); fl.receiveShadow=true; addR(fl);

    // Ceiling
    const ce = mkBox(W,0.08,L, 0x060612, 0.9,0);
    ce.position.set(0,H,0); addR(ce);

    // Walls
    const wl = new THREE.MeshStandardMaterial({ map: wlTex, roughness: 0.85, metalness: 0.1 });
    [[0.12,H,L, -W/2,H/2,0],[0.12,H,L, W/2,H/2,0],[W,H,0.12, 0,H/2,L/2]].forEach(([w,h,d,x,y,z])=>{
      const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),wl);
      m.position.set(x,y,z); m.receiveShadow=true; addR(m);
    });

    // Front wall + door hole
    const DW=1.7, DH=3.1, sw=(W-DW)/2;
    [[sw,H,0.12,-W/2+sw/2,H/2,-L/2],[sw,H,0.12,W/2-sw/2,H/2,-L/2],
     [DW,H-DH,0.12,0,DH+(H-DH)/2,-L/2]].forEach(([w,h,d,x,y,z])=>{
      const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),wl); m.position.set(x,y,z); addR(m);
    });

    // Ceiling lights — koridor terang
    [-L/3.5, 0, L/3.5].forEach(z => {
      const s=mkBox(0.2,0.05,1.1, 0xffffff,0.05,0, 0xeef5ff,4);
      s.position.set(0,H-0.03,z); addR(s);
      spot(0xffffff, 18, 18, 0, H-0.1, z, 0, 0, z);
    });
    addR(new THREE.PointLight(0xaabbff, 2.5, Math.max(28,L*1.5))).position.set(0, 2, 0);

    // Wall accent strips
    [-L/3, -L/6, 0, L/6, L/3].forEach(z => {
      [-W/2+0.08,W/2-0.08].forEach(x => {
        const s=mkBox(0.03,1.6,0.03, locTheme.accentCol,0.1,0, locTheme.accentCol,5);
        s.position.set(x,1.1,z); addR(s);
      });
    });

    // Baseboard glow
    [-W/2+0.04,W/2-0.04].forEach(x => {
      const b=mkBox(0.03,0.06,L, locTheme.baseCol,0.1,0, locTheme.baseCol,3.5);
      b.position.set(x,0.03,0); addR(b);
    });

    // NPCs
    const lobby = levelData.scenes.lobby;
    const npcColors = locTheme.npcShirts.map((s,i) => ({
      shirt: s, pant: locTheme.npcPants[i], skin: locTheme.npcSkins[i]
    }));
    if (lobby.chars) {
      lobby.chars.forEach((ch, i) => {
        const nc = npcColors[i % npcColors.length];
        const cx = (i - (lobby.chars.length-1)/2) * 2.2;
        const cz = L * 0.05 - i * 2.2;
        makeNPC(cx, 0, cz, nc.shirt, nc.pant, nc.skin, ch.name);
        interactables.push({
          pos: new THREE.Vector3(cx, EYE_H, cz),
          itype: 'char', iid: ch.id,
          label: 'Bicara dengan ' + ch.name
        });
      });
    }

    buildLobbyDeco(W, H, L);
    buildDoor(DW, DH, L, doorCb);
    showLoc(lobby.label || 'Lobby Netville');
  }

  function buildLobbyDeco(W, H, L) {
    if (_curLocId === 'campus') {
      // ── KAMPUS: wooden benches, bulletin board, plants, lockers ──
      // Wooden benches along walls
      [-2.5, 2.5].forEach(x => {
        const bench = mkBox(0.40, 0.20, 1.6, 0x5a3a10, 0.85, 0.05);
        bench.position.set(x, 0.10, 2.5); addR(bench);
        const seat = mkBox(0.44, 0.06, 1.64, 0x7a5020, 0.7, 0);
        seat.position.set(x, 0.23, 2.5); addR(seat);
        // legs
        [[-0.17,-0.8],[0.17,-0.8],[-0.17,0.8],[0.17,0.8]].forEach(([ox,oz])=>{
          const leg = mkBox(0.06,0.20,0.06,0x3a2008,0.9,0);
          leg.position.set(x+ox,0.10,2.5+oz); addR(leg);
        });
      });
      // Bulletin board on back wall
      const board = mkBox(2.4, 1.5, 0.08, 0x8b5e1a, 0.9, 0);
      board.position.set(0, 1.9, L/2-0.1); addR(board);
      const cork = mkBox(2.2, 1.3, 0.05, 0xc4862a, 0.95, 0);
      cork.position.set(0, 1.9, L/2-0.06); addR(cork);
      // Paper notices on board
      [[-.7,2.1],[.2,2.3],[-0.3,1.7],[.6,1.8],[-0.8,1.6]].forEach(([bx,by])=>{
        const paper = mkBox(0.5+Math.random()*0.4, 0.35+Math.random()*0.2, 0.03,
          [0xffeecc,0xccffcc,0xffd0d0,0xccddff][Math.floor(Math.random()*4)], 0.95, 0);
        paper.position.set(bx, by, L/2-0.03); addR(paper);
      });
      // Plants in corners
      [[W/2-0.5, L/2-1],[W/2-0.5,-1]].forEach(([px,pz])=>{
        const pot = mkBox(0.28,0.35,0.28,0x663300,0.9,0);
        pot.position.set(-px,0.17,pz); addR(pot);
        const stem = mkBox(0.08,0.6,0.08,0x225500,0.95,0);
        stem.position.set(-px,0.65,pz); addR(stem);
        const bush = mkBox(0.45,0.45,0.45,0x1a6600,0.9,0);
        bush.position.set(-px,1.0,pz); addR(bush);
        const bush2 = mkBox(0.30,0.30,0.30,0x228800,0.9,0);
        bush2.position.set(-px+0.1,1.2,pz+0.1); addR(bush2);
      });
      // School banner strip
      const banner = mkBox(W-0.5, 0.28, 0.06, 0x1a6600, 0.5, 0, 0x22aa00, 0.8);
      banner.position.set(0, H-0.5, L/2-0.08); addR(banner);
      // Lockers (row of 5 small boxes on one side)
      for (let li=0; li<5; li++) {
        const lock = mkBox(0.40,0.90,0.35,0x334466,0.7,0.1);
        lock.position.set(W/2-0.20, 0.45, -L/2+1.0+li*0.9); addR(lock);
        const hdl = mkBox(0.04,0.10,0.04,0xaaaacc,0.4,0.5);
        hdl.position.set(W/2-0.04, 0.45, -L/2+1.0+li*0.9+0.1); addR(hdl);
      }
      // Direction sign
      const sign = mkBox(0.7,0.25,0.06, 0x0a2a0a, 0.5, 0.2, 0x22cc44, 1.5);
      sign.position.set(0, 2.8, L/2-0.07); addR(sign);
      ptLight(0x22cc44, 0.8, 1.5, 0, 2.9, L/2-0.5);

    } else if (_curLocId === 'corp') {
      // ── PERUSAHAAN: sleek reception, modern chairs, glass panels ──
      // Reception counter
      const desk = mkBox(2.2, 0.82, 0.7, 0x0a0a0a, 0.3, 0.6);
      desk.position.set(0, 0.41, 4.5); addR(desk);
      const deskTop = mkBox(2.4, 0.06, 0.8, 0x1a1a1a, 0.1, 0.7);
      deskTop.position.set(0, 0.85, 4.5); addR(deskTop);
      // Orange accent stripe on desk
      const stripe = mkBox(2.2, 0.06, 0.08, 0xd97706, 0.1, 0, 0xd97706, 2.0);
      stripe.position.set(0, 0.62, 4.87); addR(stripe);
      ptLight(0xd97706, 1.5, 2.5, 0, 0.8, 4.5);
      // Modern chairs
      [-1.2, 1.2].forEach(x=>{
        const seat = mkBox(0.45,0.08,0.45,0x111111,0.3,0.4);
        seat.position.set(x,0.42,2.5); addR(seat);
        const back = mkBox(0.45,0.50,0.06,0x111111,0.3,0.4);
        back.position.set(x,0.67,2.26); addR(back);
        const base = mkBox(0.08,0.42,0.08,0x333333,0.2,0.6);
        base.position.set(x,0.21,2.5); addR(base);
      });
      // Glass partitions
      [-2.4,2.4].forEach(x=>{
        const glass = mkBox(0.04,1.8,1.6,0x88aacc,0.05,0.0);
        glass.position.set(x,0.90,3.5); addR(glass);
        const frame = mkBox(0.06,1.85,0.06,0x333333,0.3,0.5);
        frame.position.set(x,0.92,3.5); addR(frame);
      });
      // Company logo/art on back wall
      const logo = mkBox(1.2, 0.8, 0.08, 0x0a0a0a, 0.5, 0, 0xd97706, 1.5);
      logo.position.set(0, 2.4, L/2-0.1); addR(logo);
      ptLight(0xd97706, 1.5, 2.5, 0, 2.5, L/2-0.5);
      // Floor direction strip
      const strip = mkBox(0.08,0.02,4.0,0xd97706,0.1,0,0xd97706,1.5);
      strip.position.set(0,0.01,1.5); addR(strip);
      // Direction sign
      const sign = mkBox(0.7,0.25,0.06, 0x0a0808, 0.5, 0.2, 0xf59e0b, 1.5);
      sign.position.set(0, 2.8, L/2-0.07); addR(sign);
      ptLight(0xf59e0b, 0.8, 1.5, 0, 2.9, L/2-0.5);

    } else if (_curLocId === 'isp') {
      // ── ISP/NOC: monitoring screens on wall, status panels, equipment ──
      // Wall of monitoring screens (back wall)
      for (let sx=-1.8; sx<=1.8; sx+=1.2) {
        for (let sy=1.4; sy<=2.6; sy+=1.0) {
          const scr = mkBox(1.0,0.8,0.08,0x001a08,0.3,0,0x00aa44,0.6);
          scr.position.set(sx,sy,L/2-0.12); addR(scr);
          // screen content lines
          for (let li=0; li<4; li++) {
            const col = [0x00ff88,0x00aaff,0xffaa00,0xff4444][li];
            const ln = mkBox(0.6+Math.random()*0.3,0.06,0.03,col,0.1,0,col,3.0);
            ln.position.set(sx-0.1+Math.random()*0.2,sy-0.25+li*0.16,L/2-0.07); addR(ln);
          }
          ptLight(0x00aa44,0.5,2.0,sx,sy,L/2-0.5);
        }
      }
      // NOC desk (long console)
      const desk = mkBox(4.5,0.78,0.8,0x002208,0.6,0.3);
      desk.position.set(0,0.39,2.0); addR(desk);
      const deskTop = mkBox(4.7,0.05,0.85,0x001a06,0.2,0.4);
      deskTop.position.set(0,0.80,2.0); addR(deskTop);
      // Small monitors on desk
      [-1.5,0,1.5].forEach(dx=>{
        const mon = mkBox(0.8,0.6,0.06,0x001a08,0.3,0,0x00cc55,0.5);
        mon.position.set(dx,1.16,1.66); addR(mon);
        const stand = mkBox(0.06,0.3,0.08,0x111111,0.5,0.4);
        stand.position.set(dx,0.96,1.70); addR(stand);
      });
      ptLight(0x00cc55,2.0,4.0,0,1.5,2.0);
      // Status board sign
      const sign = mkBox(1.2,0.28,0.06, 0x001208, 0.5, 0.2, 0x00ff41, 2.0);
      sign.position.set(0, 2.8, L/2-0.07); addR(sign);
      ptLight(0x00ff41, 1.0, 1.5, 0, 2.9, L/2-0.5);
      // Cable runs on floor
      [-1.5,1.5].forEach(cx=>{
        const cable = mkBox(0.05,0.03,8,0x002208,0.9,0,0x00aa44,0.3);
        cable.position.set(cx,0.01,0); addR(cable);
      });

    } else {
      // ── GOV (default): formal reception, plants, government emblem ──
      // Reception desk
      const desk = mkBox(2.0,0.78,0.7,0x1a0a2a,0.7,0.1);
      desk.position.set(0,0.39,4.5); addR(desk);
      const deskTop = mkBox(2.2,0.06,0.75,0x2a1040,0.5,0.15,0x7c3aed,0.4);
      deskTop.position.set(0,0.80,4.5); addR(deskTop);
      ptLight(0x7c3aed,1.2,2.5,0,0.9,4.5);
      // Formal bench seating
      [-2,2].forEach(x=>{
        const bench = mkBox(0.42,0.22,1.5,0x1a0a2a,0.8,0.1);
        bench.position.set(x,0.11,2.0); addR(bench);
        const pad = mkBox(0.42,0.08,1.5,0x3a1060,0.7,0);
        pad.position.set(x,0.26,2.0); addR(pad);
      });
      // Tall plants
      [-2.3,2.3].forEach(x=>{
        const pot = mkBox(0.30,0.38,0.30,0x2a1040,0.8,0);
        pot.position.set(x,0.19,L/2-1.2); addR(pot);
        const stem1 = mkBox(0.06,0.9,0.06,0x114400,0.9,0);
        stem1.position.set(x,0.85,L/2-1.2); addR(stem1);
        const stem2 = mkBox(0.06,0.7,0.06,0x114400,0.9,0);
        stem2.position.set(x+0.12,0.75,L/2-1.2+0.1); addR(stem2);
        [[-0.1,1.3,0],[0.18,1.1,0.1],[0,1.5,-0.1]].forEach(([ox,oy,oz])=>{
          const lf = mkBox(0.28,0.10,0.20,0x1a6600,0.9,0);
          lf.position.set(x+ox,oy,L/2-1.2+oz); addR(lf);
          lf.rotation.z = (ox>0?-1:1)*0.5;
        });
      });
      // Government emblem on back wall
      const emblem = mkBox(1.0,1.0,0.06,0x0f0828,0.5,0,0x7c3aed,0.8);
      emblem.position.set(0,2.2,L/2-0.1); addR(emblem);
      const ring = mkBox(0.9,0.9,0.04,0x1a0a40,0.5,0,0x06b6d4,1.2);
      ring.position.set(0,2.2,L/2-0.06); addR(ring);
      ptLight(0x7c3aed,1.5,2.0,0,2.5,L/2-0.5);
      // Direction sign
      const sign = mkBox(0.7,0.25,0.06, 0x0a1122, 0.5, 0.2, 0x06b6d4, 1.5);
      sign.position.set(0, 2.8, L/2-0.07); addR(sign);
      ptLight(0x06b6d4, 1, 1.5, 0, 2.9, L/2-0.5);
    }
  }

  function buildSRDeco(W, H, L) {
    if (_curLocId === 'campus') {
      // Whiteboard on end wall
      const wb = mkBox(3.0, 1.6, 0.06, 0xf0f0f0, 0.95, 0);
      wb.position.set(0, 2.0, L/2-0.12); addR(wb);
      const frame = mkBox(3.1, 1.7, 0.04, 0x553311, 0.8, 0);
      frame.position.set(0, 2.0, L/2-0.14); addR(frame);
      // Writing on whiteboard (colored lines)
      [[0x2244cc,0.6,2.3],[0x22aa44,0.0,2.0],[0xcc4422,-0.5,1.7]].forEach(([col,bx,by])=>{
        const wr = mkBox(0.8+Math.random()*0.8,0.06,0.03,col,0.1,0,col,2.0);
        wr.position.set(bx+Math.random()*0.3,by,L/2-0.08); addR(wr);
      });
      ptLight(0xffffff,2.0,5.0,0,2.5,L/2-1.0);
      // Network diagram poster
      const poster = mkBox(1.2,0.9,0.04,0xeeeeff,0.95,0);
      poster.position.set(-W/2+0.08,2.0,3); poster.rotation.y=Math.PI/2; addR(poster);

    } else if (_curLocId === 'corp') {
      // Central workstation island (management console in middle)
      const island = mkBox(4.0,0.82,1.4,0x0c0c0c,0.3,0.5);
      island.position.set(0,0.41,0); addR(island);
      const islandTop = mkBox(4.2,0.06,1.5,0x1a1a1a,0.1,0.6);
      islandTop.position.set(0,0.85,0); addR(islandTop);
      // Monitors on island
      [-1.4,0,1.4].forEach(dx=>{
        const mon = mkBox(0.9,0.65,0.05,0x050505,0.2,0,0xd97706,0.4);
        mon.position.set(dx,1.22,-0.5); addR(mon);
        const stand = mkBox(0.06,0.3,0.08,0x222222,0.5,0.4);
        stand.position.set(dx,1.01,-0.48); addR(stand);
        // Screen content
        for (let li=0;li<3;li++) {
          const ln = mkBox(0.5+Math.random()*0.3,0.07,0.03,
            [0xd97706,0xffffff,0x22aaff][li],0.1,0,[0xd97706,0xffffff,0x22aaff][li],2.5);
          ln.position.set(dx-0.1+Math.random()*0.2,1.14+li*0.13,-0.47); addR(ln);
        }
      });
      ptLight(0xd97706,2.0,5.0,0,1.5,0);
      // Chairs around island
      [[-2.2,0,0],[2.2,0,Math.PI],[0,-0.7,Math.PI*0.5],[0,0.7,-Math.PI*0.5]].forEach(([cx,cz,ry])=>{
        const seat = mkBox(0.44,0.07,0.44,0x111111,0.3,0.4);
        seat.position.set(cx,0.44,cz); seat.rotation.y=ry; addR(seat);
        const back = mkBox(0.44,0.48,0.06,0x111111,0.3,0.4);
        back.position.set(cx,0.68,cz+(Math.abs(cz)>0.1?Math.sign(cz)*0.22:0.22*Math.cos(ry))); back.rotation.y=ry; addR(back);
      });

    } else if (_curLocId === 'isp') {
      // Big network topology display on end wall
      const disp = mkBox(W*0.7, 2.2, 0.1, 0x001a08, 0.3, 0, 0x00aa44, 0.3);
      disp.position.set(0, 1.8, L/2-0.14); addR(disp);
      // Network nodes
      [[0,1.8],[-1.2,2.2],[1.2,2.2],[-1.8,1.5],[1.8,1.5],[0,1.3]].forEach(([nx,ny])=>{
        const node = mkBox(0.18,0.18,0.06,0x00ff88,0.1,0,0x00ff88,3.0);
        node.position.set(nx,ny,L/2-0.08); addR(node);
      });
      // Connection lines (slim boxes)
      [[0,2.0,0.6,0.06],[0.6,2.0,0.6,0.06],[-0.6,1.9,0.6,0.06]].forEach(([nx,ny,nw,nh])=>{
        const line = mkBox(nw,nh,0.03,0x00cc66,0.1,0,0x00cc66,2.0);
        line.position.set(nx,ny,L/2-0.07); addR(line);
      });
      ptLight(0x00aa44,2.0,6.0,0,2.0,L/2-1.0);
      // Rows of NOC workstations (two rows)
      [-3.5,3.5].forEach(nz=>{
        const desk = mkBox(W*0.6,0.75,0.8,0x001808,0.6,0.2);
        desk.position.set(0,0.37,nz); addR(desk);
        for (let dx=-2;dx<=2;dx+=2) {
          const mon = mkBox(0.7,0.55,0.05,0x001008,0.2,0,0x00cc55,0.4);
          mon.position.set(dx,1.05,nz+(nz>0?-0.48:0.48)); addR(mon);
          ptLight(0x00cc55,0.4,1.5,dx,1.2,nz+(nz>0?-0.5:0.5));
        }
      });
    }
    // gov = standard, no extras (just the racks)
  }

  // ══════════════════════════════════════════════
  // DOOR
  // ══════════════════════════════════════════════
  function buildDoor(DW, DH, L, doorCb) {
    const wl = new THREE.MeshStandardMaterial({ color: 0x0d0d20, roughness: 0.85, metalness: 0.1 });

    // Door frame
    [[-DW/2-0.06,DH/2],[DW/2+0.06,DH/2]].forEach(([x,y]) => {
      const f=mkBox(0.12,DH,0.28, 0x1a1a3a,0.6,0.4, locTheme.doorFrameCol,0.5);
      f.position.set(x,y,-L/2); addR(f);
    });
    const ft=mkBox(DW+0.24,0.12,0.28, 0x1a1a3a,0.6,0.4, locTheme.doorFrameCol,0.5);
    ft.position.set(0,DH+0.06,-L/2); addR(ft);

    // Sign "SERVER ROOM"
    const sgn = mkBox(1.4,0.24,0.07, 0x001a08,0.5,0, locTheme.signCol,2.5);
    sgn.position.set(0,DH+0.36,-L/2+0.12); addR(sgn);
    ptLight(locTheme.signCol, 2, 2, 0, DH+0.36, -L/2+0.5);

    // Security panel beside door
    const panel = mkBox(0.22,0.45,0.07, 0x111128,0.4,0.5, 0x06b6d4,0.3);
    panel.position.set(DW/2+0.32, 1.3, -L/2+0.1); addR(panel);
    const scan = mkBox(0.14,0.06,0.03, 0x00ff88,0.2,0, 0x00ff88,4);
    scan.position.set(DW/2+0.32, 1.18, -L/2+0.13); addR(scan);
    animFns.push(t => { scan.material.emissiveIntensity = 2+Math.sin(t*3)*2; });

    // Door panel
    const door = new THREE.Mesh(new THREE.BoxGeometry(DW,DH,0.09),
      new THREE.MeshStandardMaterial({ color: 0x0e0e28, roughness: 0.4, metalness: 0.8,
        emissive: new THREE.Color(0x080820), emissiveIntensity: 0.3 }));
    door.position.set(0, DH/2, -L/2+0.05);
    scene.add(door); roomObjects.push(door);

    // Door stripe
    const dstripe = mkBox(0.05, DH-0.2, 0.04, locTheme.accentCol, 0.1,0, locTheme.accentCol, 2);
    dstripe.position.set(DW/2-0.08, DH/2, -L/2+0.09); scene.add(dstripe); roomObjects.push(dstripe);

    const handle = mkBox(0.07,0.07,0.30, 0x7070cc,0.2,0.9, 0x9090ee,0.5);
    handle.position.set(DW/2-0.20, DH/2, -L/2+0.20);
    scene.add(handle); roomObjects.push(handle);

    const dgl = new THREE.PointLight(0x0033ff, 0, 10);
    dgl.position.set(0, DH/2, -L/2-1); scene.add(dgl); roomObjects.push(dgl);

    let opened = false;
    function openDoor() {
      if (opened) return;
      if (_doorGate && !_doorGate()) return;  // gate belum terbuka
      opened = true;
      const pivot = new THREE.Group();
      pivot.position.set(-DW/2, DH/2, -L/2);
      door.position.set(DW/2, 0, 0);
      dstripe.position.set(DW-0.08, 0, 0.04);
      handle.position.set(DW/2-0.20, 0, 0.15);
      pivot.add(door); pivot.add(dstripe); pivot.add(handle);
      scene.add(pivot); roomObjects.push(pivot);
      let p = 0;
      animFns.push((_t, dt) => {
        if (p < 1) {
          p = Math.min(1, p + dt * 0.9);
          pivot.rotation.y = p * Math.PI * 0.78;
          dgl.intensity = p * 4;
          if (p >= 1 && doorCb) { const cb = doorCb; doorCb = null; setTimeout(cb, 400); }
        }
      });
    }

    interactables.push({
      pos: new THREE.Vector3(0, EYE_H, -L/2+1.5),
      itype: 'door', iid: 'door',
      label: 'Buka Pintu Server Room',
      doorFn: openDoor
    });
  }

  // ══════════════════════════════════════════════
  // SERVER ROOM
  // ══════════════════════════════════════════════
  function loadServerRoom(levelData) {
    clearRoom();
    // Realistic server room: wider aisles, 2-side rack rows, central console
    const srDimMap = {gov:{W:12,H:4.0,L:24},campus:{W:10,H:3.8,L:20},corp:{W:14,H:4.5,L:28},isp:{W:12,H:4.0,L:26}};
    const {W,H,L} = srDimMap[_curLocId] || {W:12,H:4.0,L:24};
    currentRoom = { bounds: { x0:-W/2, x1:W/2, z0:-L/2, z1:L/2 } };
    // Player starts near entrance (positive Z = back of room from racks)
    camera.position.set(0, EYE_H, L/2-2.5); yaw = Math.PI; pitch = 0;

    const flTex = makeFloorTex(), wlTex = makeWallTex();

    // ── Floor ───────────────────────────────────────
    const fl = new THREE.Mesh(new THREE.BoxGeometry(W,0.08,L),
      new THREE.MeshStandardMaterial({ map:flTex, roughness:0.12, metalness:0.85, color:locTheme.floorColor }));
    fl.position.set(0,-0.04,0); fl.receiveShadow=true; addR(fl);

    // Raised floor tiles (typical of server rooms) — just visual grid
    for (let tx=-Math.floor(W/2)+1; tx<W/2; tx+=0.6) {
      for (let tz=-Math.floor(L/2)+1; tz<L/2; tz+=0.6) {
        const tile = mkBox(0.57,0.02,0.57, 0x111122, 0.2, 0.9);
        tile.position.set(tx,0.01,tz); addR(tile);
      }
    }

    // ── Walls ───────────────────────────────────────
    const wlMat = new THREE.MeshStandardMaterial({ map:wlTex, roughness:0.85, metalness:0.1, color:locTheme.wallColor });
    [[-W/2,H/2,0, 0.12,H,L],[W/2,H/2,0, 0.12,H,L],
     [0,H/2,-L/2, W,H,0.12],[0,H/2,L/2, W,H,0.12]].forEach(([x,y,z,w,h,d])=>{
      const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),wlMat);
      m.position.set(x,y,z); m.receiveShadow=true; addR(m);
    });
    mkBox(W,0.08,L, 0x060610,0.9,0,null,0).position !== null && (() => {
      const ce=mkBox(W,0.08,L, 0x060610,0.9,0); ce.position.set(0,H,0); addR(ce);
    })();

    // ── Ceiling lighting — long fluorescent strips ───
    const ceilLightPositions = [];
    [-L/4, L/4].forEach(cz => {
      [-W/4, W/4].forEach(cx => {
        const strip = mkBox(0.14,0.03,2.2, 0xffffff,0.04,0, 0xddeeff,5);
        strip.position.set(cx, H-0.02, cz); addR(strip);
        spot(0xddeeff, 18, H*4.5, cx, H-0.04, cz, cx, 0, cz);
        ceilLightPositions.push([cx,cz]);
      });
    });
    // Ambient fill
    addR(new THREE.PointLight(0xaabbdd, 3.0, W*2.2)).position.set(0, 2.8, 0);
    addR(new THREE.PointLight(0x7799bb, 1.8, W*1.4)).position.set(-W/4, 2.0, -L/5);
    addR(new THREE.PointLight(0x7799bb, 1.8, W*1.4)).position.set( W/4, 2.0,  L/5);

    // Baseboard glow strips
    [-W/2+0.03,W/2-0.03].forEach(x=>{
      const b=mkBox(0.03,0.08,L, locTheme.baseCol,0.1,0, locTheme.baseCol,3.5);
      b.position.set(x,0.04,0); addR(b);
    });

    // ── Overhead cable trays ─────────────────────────
    [-W/3, W/3].forEach(cx=>{
      const tray = mkBox(0.30,0.12,L*0.82, 0x181828, 0.6, 0.7);
      tray.position.set(cx, H-0.22, 0); addR(tray);
      // Cables hanging down slightly from tray
      for (let cz=-L/3; cz<=L/3; cz+=L/8) {
        const c = mkBox(0.04,0.25,0.04, 0x223366,0.9,0, 0x3355aa,0.5);
        c.position.set(cx+(Math.random()-0.5)*0.15, H-0.38, cz); addR(c);
      }
    });
    // Central tray
    const cTray = mkBox(0.25,0.10,L*0.7, 0x141424, 0.7, 0.8);
    cTray.position.set(0, H-0.25, 0); addR(cTray);

    // ── Floor cable runs (colored cable channels) ────
    [[-W/3+0.05,0x334466],[-W/3-0.05,0x223355],[W/3+0.05,0x334466],[W/3-0.05,0x223355]].forEach(([x,col])=>{
      const cable = mkBox(0.05,0.04,L*0.78, col,0.9,0, col,0.6);
      cable.position.set(x, 0.02, 0); addR(cable);
    });

    // ══════════════════════════════════════════════════
    // ZONA 1: PRODUCTION SERVERS — kiri (x < -W/4)
    // 3 rack berjajar di kiri, menghadap ke tengah
    // ══════════════════════════════════════════════════
    const prodZ = [-L/4, 0, L/4].filter(z=>Math.abs(z)<L/2-3);
    prodZ.forEach(z => {
      buildRack(-W/2+1.2, z, 0);  // facing right (into aisle)
    });
    // Zone label — "PRODUCTION" sign on left wall
    const prodSign = mkBox(2.2,0.32,0.06, 0x0a0a22,0.5,0, 0x00ff88,2.0);
    prodSign.position.set(-W/2+0.07, H-0.55, 0); prodSign.rotation.y=Math.PI/2; addR(prodSign);
    ptLight(0x00ff88, 1.2, 2.0, -W/2+0.5, H-0.5, 0);

    // ══════════════════════════════════════════════════
    // ZONA 2: BACKUP / STORAGE SERVERS — kanan (x > W/4)
    // 3 rack di kanan, menghadap ke tengah
    // ══════════════════════════════════════════════════
    const backZ = [-L/4, 0, L/4].filter(z=>Math.abs(z)<L/2-3);
    backZ.forEach(z => {
      buildRack(W/2-1.2, z, Math.PI);  // facing left (into aisle)
    });
    // Zone label — "BACKUP" sign on right wall
    const backSign = mkBox(1.8,0.32,0.06, 0x0a0a22,0.5,0, 0x06b6d4,2.0);
    backSign.position.set(W/2-0.07, H-0.55, 0); backSign.rotation.y=-Math.PI/2; addR(backSign);
    ptLight(0x06b6d4, 1.2, 2.0, W/2-0.5, H-0.5, 0);

    // ══════════════════════════════════════════════════
    // ZONA 3: MANAGEMENT WORKSTATION — center-front
    // Console desk near entrance (positive Z side)
    // ══════════════════════════════════════════════════
    const wsZ = L/2 - 5.0;  // near entrance end
    // Console desk
    const desk = mkBox(2.8, 0.72, 0.75, 0x111120, 0.4, 0.5);
    desk.position.set(0, 0.36, wsZ); addR(desk);
    const deskTop = mkBox(3.0, 0.06, 0.8, 0x1a1a30, 0.2, 0.6, 0x7c3aed, 0.3);
    deskTop.position.set(0, 0.72+0.03, wsZ); addR(deskTop);
    // Monitors (3 screens)
    [-0.9, 0, 0.9].forEach((dx,mi) => {
      const mon = mkBox(0.82,0.58,0.05, 0x050510,0.2,0, [0x00ff88,0x7c3aed,0x06b6d4][mi],0.6);
      mon.position.set(dx, 0.72+0.58/2+0.12, wsZ-0.25); addR(mon);
      const stand = mkBox(0.05,0.12,0.06, 0x222233,0.5,0.4);
      stand.position.set(dx, 0.72+0.06, wsZ-0.25); addR(stand);
      // Screen glow lines (activity)
      for (let li=0;li<4;li++){
        const ln=mkBox(0.3+Math.random()*0.3,0.04,0.02,
          [0x00ff88,0x7c3aed,0x06b6d4][mi],0.1,0,[0x00ff88,0x7c3aed,0x06b6d4][mi],3.0);
        ln.position.set(dx-0.1+Math.random()*0.2, 0.72+0.58/2+0.07+li*0.1, wsZ-0.22); addR(ln);
      }
      ptLight([0x00ff88,0x7c3aed,0x06b6d4][mi], 0.8, 1.5, dx, 0.72+0.5, wsZ-0.3);
    });
    // Keyboard
    const kbd = mkBox(1.8,0.03,0.30, 0x111122,0.8,0.3);
    kbd.position.set(0, 0.75, wsZ+0.12); addR(kbd);
    // Operator chair
    const seat = mkBox(0.5,0.06,0.5, 0x111111,0.3,0.3);
    seat.position.set(0, 0.44, wsZ+0.8); addR(seat);
    const back = mkBox(0.5,0.5,0.06, 0x111111,0.3,0.3);
    back.position.set(0, 0.70, wsZ+1.03); addR(back);
    // Chair wheels
    [-0.2,0.2].forEach(dx=>{
      [-0.2,0.2].forEach(dz=>{
        const w=mkBox(0.06,0.04,0.06,0x222222,0.7,0.3);
        w.position.set(dx,0.03,wsZ+0.8+dz); addR(w);
      });
    });
    // "WORKSTATION" zone label
    const wsSign = mkBox(2.4,0.28,0.06, 0x0d0d22,0.5,0, 0xa855f7,1.8);
    wsSign.position.set(0, H-0.56, L/2-0.07); addR(wsSign);
    ptLight(0xa855f7, 1.0, 2.0, 0, H-0.5, L/2-0.5);

    // ── UPS / Power units near back wall ────────────
    const upsZ = -L/2+1.0;
    [-W/4, W/4].forEach(ux=>{
      const ups = mkBox(0.7,1.2,0.6, 0x0a0a1a,0.3,0.6);
      ups.position.set(ux, 0.6, upsZ); addR(ups);
      const upsLed = mkBox(0.5,0.06,0.52, 0x111122,0.3,0.3, 0x22ff44,2.5);
      upsLed.position.set(ux, 1.23, upsZ); addR(upsLed);
      ptLight(0x22ff44,0.6,1.2,ux,1.3,upsZ);
    });
    // UPS sign
    const upsSign = mkBox(2.0,0.25,0.06, 0x0a0a1a,0.5,0, 0x22ff44,1.5);
    upsSign.position.set(0, H-0.58, -L/2+0.07); addR(upsSign);

    // ── Network patch panel on back wall ────────────
    const patch = mkBox(W*0.55,0.28,0.08, 0x0c0c1c,0.4,0.6);
    patch.position.set(0, 1.7, -L/2+0.08); addR(patch);
    for (let pi=0;pi<12;pi++){
      const port=mkBox(0.06,0.06,0.04,0x222233,0.5,0,pi%3===0?0x00ff88:0x222244,pi%3===0?2:0);
      port.position.set(-0.45+pi*0.08,1.7,-L/2+0.11); addR(port);
    }

    // ── Location-specific SR decorations ─────────────
    buildSRDeco(W, H, L);

    // ── Interactive objects (spread across zones) ────
    const srDef = levelData.scenes.serverroom, items = levelData.items;
    // Fixed positions: rack area left, rack area right, workstation, wall areas
    const itemPos = [
      [-W/2+1.2, L/8],   // on left rack area (production)
      [ W/2-1.2, L/8],   // on right rack area (backup)
      [0,        wsZ],   // workstation/console
      [-W/2+2.0, -L/6],  // left side
      [ W/2-2.0, -L/6],  // right side
      [0,        L/4],   // mid-room
      [0,        -L/5],  // further back
    ];
    if (srDef.objects && items) {
      srDef.objects.forEach((obj, i) => {
        const [ix, iz] = itemPos[i] || [0, i*1.5 - 3];
        buildItem(obj, ix, iz, items[obj.id]);
      });
    }

    // ── NPC (Kak Sari) near workstation, easy to find ──
    const srNPCCols = locTheme.npcShirts.slice(0,2).map((s,i) => ({
      shirt: s, pant: locTheme.npcPants[i], skin: locTheme.npcSkins[i]
    }));
    if (srDef.chars) {
      srDef.chars.forEach((ch, i) => {
        const nc = srNPCCols[i % srNPCCols.length];
        // Sari stands to the right of the workstation, clearly visible
        const cx = 1.8, cz = wsZ + 0.5 + i * 2.2;
        makeNPC(cx, 0, cz, nc.shirt, nc.pant, nc.skin, ch.name);
        interactables.push({
          pos: new THREE.Vector3(cx, EYE_H, cz),
          itype: 'char', iid: ch.id,
          label: 'Bicara dengan ' + ch.name
        });
      });
    }

    showLoc(srDef.label || 'Server Room');
  }

  // ══════════════════════════════════════════════
  // LOC LABEL / LOAD
  // ══════════════════════════════════════════════
  function showLoc(text) {
    const el = document.getElementById('loc-label');
    if (!el || !text) return;
    el.textContent = text; el.style.animation = 'none';
    el.classList.remove('hidden'); void el.offsetHeight;
    el.style.animation = 'fadeLabel 3s forwards';
    setTimeout(() => el.classList.add('hidden'), 3100);
  }

  function setDoorGate(fn) { _doorGate = fn; }

  function lookAt(dir) {
    if (!dir) { _lookTarget = null; return; }
    const BASE = Math.PI;   // straight forward from entrance (facing -Z)
    const map = {
      // General directions
      forward:    { yaw: BASE,        pitch:  0.00 },
      back:       { yaw: 0,           pitch:  0.00 },
      up:         { yaw: BASE,        pitch: -0.65 },
      // Server room zones (player starts near entrance, looking forward = toward racks)
      production: { yaw: BASE + 1.35, pitch: -0.10 }, // left wall = production racks
      left:       { yaw: BASE + 1.35, pitch: -0.05 },
      backup:     { yaw: BASE - 1.35, pitch: -0.10 }, // right wall = backup racks
      right:      { yaw: BASE - 1.35, pitch: -0.05 },
      workstation:{ yaw: BASE,        pitch: -0.12 }, // center-front = console desk
      center:     { yaw: BASE,        pitch: -0.12 },
      console:    { yaw: BASE,        pitch: -0.18 },
      racks:      { yaw: BASE + 0.9,  pitch: -0.12 }, // slight left toward racks
      ups:        { yaw: BASE,        pitch: -0.05 }, // far back wall = UPS
      patch:      { yaw: BASE + 0.1,  pitch: -0.22 }, // patch panel
    };
    _lookTarget = map[dir] || null;
  }

  function setLocationTheme(locId) {
    _curLocId = locId || 'gov';
    locTheme = LOC_THEMES[_curLocId] || LOC_THEMES.gov;
    if (ambLight)  ambLight.color.setHex(locTheme.ambientCol);
    if (hemiLight) { hemiLight.color.setHex(locTheme.hemiSky); hemiLight.groundColor.setHex(locTheme.hemiGround); }
    if (scene.fog) scene.fog.color.setHex(locTheme.fogCol);
    scene.background.setHex(locTheme.fogCol);
  }

  function loadRoom(roomId, levelData, doorCb) {
    const ov = document.getElementById('fade-overlay');
    ov.style.opacity = 1;
    setTimeout(() => {
      if (roomId === 'lobby') loadCorridor(levelData, doorCb);
      else loadServerRoom(levelData);
      setTimeout(() => { ov.style.opacity = 0; }, 80);
    }, 500);
  }

  function markItemFound(id) {
    interactables = interactables.filter(o => !(o.itype === 'item' && o.iid === id));
  }

  function releasePointer() {
    document.exitPointerLock();
    setTimeout(refreshOverlay, 100);
  }

  return { init, loadRoom, markItemFound, releasePointer, showLoc, setLocationTheme, setDoorGate, lookAt };
})();