/* Procedural Three.js volcano landscape. No external models or textures are used. */
(function (root) {
  "use strict";
  const T = root.THREE;
  const TAU = Math.PI * 2;
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const smooth = t => t * t * (3 - 2 * t);
  const fract = n => n - Math.floor(n);
  const hash = n => fract(Math.sin(n * 127.1) * 43758.5453);
  const noise2 = (x, z) => Math.sin(x * .73 + Math.sin(z * .41)) * .48 + Math.sin(z * 1.17 - x * .29) * .27 + Math.sin((x + z) * 2.31) * .11;

  function proceduralTexture(kind, repeat = 8) {
    const canvas = document.createElement("canvas"); canvas.width = canvas.height = 256;
    const context = canvas.getContext("2d"), image = context.createImageData(256, 256);
    for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) {
      const index = (y * 256 + x) * 4, fine = hash(x * 17.13 + y * 91.7), broad = noise2(x * .035, y * .035), strata = kind === "rock" ? Math.sin(y * .34 + broad * 5) * .09 : 0;
        const value = kind === "crust" ? (Math.abs(Math.sin(x * .075 + broad * 3) * Math.cos(y * .043 + broad)) < .22 ? 0 : 245) : clamp(188 + broad * 28 + (fine - .5) * 34 + strata * 255, 105, 242);
      image.data[index] = value; image.data[index + 1] = value * (kind === "sand" ? .91 : .94); image.data[index + 2] = value * (kind === "sand" ? .77 : .88); image.data[index + 3] = 255;
    }
    context.putImageData(image, 0, 0);
    context.globalAlpha = .18; context.strokeStyle = kind === "wall" ? "#5f3924" : "#2b211b";
    for (let i = 0; i < 90; i++) { const x = hash(i * 7) * 256, y = hash(i * 11) * 256, r = 1 + hash(i * 19) * 5; context.beginPath(); context.arc(x, y, r, 0, TAU); context.stroke(); }
    const texture = new T.CanvasTexture(canvas); texture.wrapS = texture.wrapT = T.RepeatWrapping; texture.repeat.set(repeat, repeat); texture.colorSpace = T.SRGBColorSpace; texture.anisotropy = 4; return texture;
  }

  function terrainHeight(x, z) {
    const ex = x * .92, ez = z * 1.06;
    const r = Math.hypot(ex, ez), a = Math.atan2(z, x);
    const cone = r < 15 ? 8.7 * Math.pow(1 - r / 15, 1.46) : 0;
    const asymmetry = cone * (.08 * Math.sin(a * 3 + .7) + .045 * Math.sin(a * 7 - 1.4));
    const crater = 4.75 * Math.exp(-r * r / 2.2);
    const gullies = r > 2 && r < 14 ? -.52 * Math.pow(Math.abs(Math.sin(a * 6 + r * .18)), 7) * (1 - r / 18) : 0;
    const strata = r < 15 ? .14 * Math.sin(r * 4.2 + a * 2) : 0;
    const ground = .18 * noise2(x * .33, z * .33) + .035 * noise2(x * 1.4, z * 1.4);
    return cone + asymmetry - crater + gullies + strata + ground - .18;
  }

  function setShadow(object, cast = true, receive = true) {
    object.castShadow = cast; object.receiveShadow = receive; return object;
  }

  function disposeTree(group) {
    while (group.children.length) {
      const child = group.children.pop();
      child.traverse?.(node => {
        node.geometry?.dispose?.();
        if (Array.isArray(node.material)) node.material.forEach(m => m.dispose?.());
        else node.material?.dispose?.();
      });
    }
  }

  class VolcanoGL {
    constructor(canvas) {
      if (!T) throw new Error("Three.js unavailable");
      this.canvas = canvas;
      this.renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
      this.renderer.setPixelRatio(Math.min(root.devicePixelRatio || 1, 1.5));
      this.renderer.outputColorSpace = T.SRGBColorSpace;
      this.renderer.toneMapping = T.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.05;
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = T.PCFSoftShadowMap;
      this.scene = new T.Scene();
      this.scene.background = new T.Color(0xc88d62);
      this.scene.fog = new T.FogExp2(0xb97e58, .014);
      this.camera = new T.PerspectiveCamera(42, 1, .1, 150);
      this.camera.position.set(22, 12, 27);
      this.cameraTarget = new T.Vector3(0, 3.2, 0);
      this.result = null; this.progress = 0; this.view = "front"; this.part = null;
      this.clock = new T.Clock(); this.cameraTween = null; this.dragOrbit = { yaw: .69, pitch: .34, distance: 35 };
      this.eruptionGroup = new T.Group(); this.scene.add(this.eruptionGroup);
      this.lavaMeshes = []; this.bombData = []; this.disposed = false;
      this.buildLighting(); this.buildTerrain(); this.buildCrater(); this.buildVillage(); this.buildAtmosphere(); this.buildParticles();
      this.setView("front", 0); this.animate();
    }

    buildLighting() {
      this.scene.add(new T.HemisphereLight(0xffdfad, 0x4d3022, 2.15));
      const sun = new T.DirectionalLight(0xffc986, 3.1);
      sun.position.set(-24, 35, 18); sun.castShadow = true;
      sun.shadow.mapSize.set(1024, 1024); sun.shadow.camera.left = -30; sun.shadow.camera.right = 30;
      sun.shadow.camera.top = 30; sun.shadow.camera.bottom = -30; sun.shadow.camera.near = 1; sun.shadow.camera.far = 90;
      sun.shadow.bias = -.0008; this.scene.add(sun); this.sunLight = sun;
      const fill = new T.DirectionalLight(0xffa56a, .72); fill.position.set(25, 15, 30); this.scene.add(fill);
      const glow = new T.PointLight(0xff5a20, 2.4, 18, 2); glow.position.set(0, 5.1, 0); this.scene.add(glow); this.craterGlow = glow;
      this.lavaBounce = new T.PointLight(0xff3514, 0, 13, 2); this.lavaBounce.position.set(4, 2.1, 2.8); this.scene.add(this.lavaBounce);
    }

    buildTerrain() {
      const geometry = new T.PlaneGeometry(72, 72, 160, 160); geometry.rotateX(-Math.PI / 2);
      const positions = geometry.attributes.position, colors = [];
      const sand = new T.Color(0xa8784f), rock = new T.Color(0x74513d), high = new T.Color(0x514039), ochre = new T.Color(0xc08a58);
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i), z = positions.getZ(i), y = terrainHeight(x, z); positions.setY(i, y);
        const r = Math.hypot(x, z), n = clamp(noise2(x * .7, z * .7) * .22 + .5, 0, 1);
        const c = (r < 15 ? rock.clone().lerp(high, clamp(y / 8, 0, 1)) : sand.clone().lerp(ochre, n * .35));
        c.offsetHSL(noise2(x * 1.7, z * 1.7) * .012, 0, noise2(x, z) * .025); colors.push(c.r, c.g, c.b);
      }
      geometry.setAttribute("color", new T.Float32BufferAttribute(colors, 3)); geometry.computeVertexNormals();
      const material = new T.MeshStandardMaterial({ vertexColors: true, map: proceduralTexture("sand", 12), roughness: .98, metalness: 0 });
      this.terrain = setShadow(new T.Mesh(geometry, material), false, true); this.terrain.userData.part = "crater"; this.scene.add(this.terrain);

      const farMaterial = new T.MeshStandardMaterial({ color: 0x665044, map: proceduralTexture("rock", 4), roughness: 1, flatShading: false });
      [[-27, -23, 10, 9], [25, -27, 13, 8], [-31, 12, 9, 7], [31, 18, 12, 7]].forEach((d, index) => {
        const g = new T.ConeGeometry(d[2], d[3], 64, 12, true), p = g.attributes.position;
        for (let i = 0; i < p.count; i++) {
          const y = p.getY(i), f = 1 - (y + d[3] / 2) / d[3], wobble = 1 + .12 * noise2(p.getX(i) * .4 + index, p.getZ(i) * .4) * f;
          p.setX(i, p.getX(i) * wobble + Math.sin(y * .7 + index) * 1.1); p.setZ(i, p.getZ(i) * wobble);
        }
        g.computeVertexNormals(); const m = setShadow(new T.Mesh(g, farMaterial), false, true); m.position.set(d[0], d[3] / 2 - .6, d[1]); this.scene.add(m);
      });
    }

    buildCrater() {
      this.craterGroup = new T.Group(); this.craterGroup.userData.part = "crater"; this.scene.add(this.craterGroup);
      const rimGeo = new T.TorusGeometry(1.96, .24, 24, 128); rimGeo.rotateX(Math.PI / 2);
      const p = rimGeo.attributes.position;
      for (let i = 0; i < p.count; i++) { const n = noise2(p.getX(i) * 2, p.getZ(i) * 2); p.setXYZ(i, p.getX(i) * (1 + n * .035), p.getY(i) + n * .18, p.getZ(i) * (1 + n * .045)); }
      rimGeo.computeVertexNormals();
      this.rimMaterial = new T.MeshStandardMaterial({ color: 0x302923, map: proceduralTexture("rock", 3), roughness: 1, emissive: 0x160402, emissiveIntensity: .2 });
      const rim = setShadow(new T.Mesh(rimGeo, this.rimMaterial)); rim.position.y = 5.78; rim.userData.part = "crater"; this.craterGroup.add(rim);
      const inner = new T.Mesh(new T.CylinderGeometry(1.72, .72, 2.5, 64, 10, true), new T.MeshStandardMaterial({ color: 0x171412, roughness: 1, side: T.DoubleSide })); inner.position.y = 5.02; inner.userData.part = "crater"; this.craterGroup.add(inner);
      this.lavaLakeMaterial = new T.MeshStandardMaterial({ color: 0xff8a20, emissive: 0xff3a00, emissiveIntensity: 3.8, roughness: .48 });
      const lake = new T.Mesh(new T.CircleGeometry(1.08, 64), this.lavaLakeMaterial); lake.rotation.x = -Math.PI / 2; lake.position.y = 4.38; lake.userData.part = "crater"; this.craterGroup.add(lake);
      const crackMat = new T.MeshStandardMaterial({ color: 0x241713, emissive: 0x6d1609, emissiveIntensity: .28, roughness: 1 });
      [-2.3, -1.1, .45, 2.1].forEach((angle, i) => {
        const pts = [];
        for (let s = 0; s < 9; s++) { const r = 2 + s * .33, a = angle + Math.sin(s * 1.7 + i) * .08, x = Math.cos(a) * r, z = Math.sin(a) * r; pts.push(new T.Vector3(x, terrainHeight(x, z) + .06, z)); }
        const crack = new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts), 40, .022, 5, false), crackMat); crack.userData.part = "crater"; this.craterGroup.add(crack);
      });
    }

    road(points, width = .52, color = 0xb78b5c) {
      const vertices = [], indices = [];
      points.forEach((point, i) => {
        const previous = points[Math.max(0, i - 1)], next = points[Math.min(points.length - 1, i + 1)];
        const dx = next.x - previous.x, dz = next.z - previous.z, length = Math.hypot(dx, dz) || 1, nx = -dz / length, nz = dx / length;
        const y = terrainHeight(point.x, point.z) + .035;
        vertices.push(point.x + nx * width, y, point.z + nz * width, point.x - nx * width, y, point.z - nz * width);
        if (i) { const k = i * 2; indices.push(k - 2, k, k - 1, k - 1, k, k + 1); }
      });
      const geometry = new T.BufferGeometry(); geometry.setAttribute("position", new T.Float32BufferAttribute(vertices, 3)); geometry.setIndex(indices); geometry.computeVertexNormals();
      const mesh = new T.Mesh(geometry, new T.MeshStandardMaterial({ color, roughness: 1, polygonOffset: true, polygonOffsetFactor: -2 })); mesh.receiveShadow = true; this.scene.add(mesh); return mesh;
    }

    buildVillage() {
      this.villageGroup = new T.Group(); this.villageGroup.userData.part = "village"; this.scene.add(this.villageGroup);
      this.road([new T.Vector3(3, 0, -6), new T.Vector3(8, 0, -7), new T.Vector3(13, 0, -6), new T.Vector3(20, 0, -8), new T.Vector3(29, 0, -5)], .72);
      this.road([new T.Vector3(8, 0, -11), new T.Vector3(12, 0, -6), new T.Vector3(15, 0, 0), new T.Vector3(20, 0, 6)], .43, 0xa87851);
      const housePositions = [];
      for (let row = 0; row < 5; row++) for (let col = 0; col < 8; col++) {
        if ((row * 3 + col * 5) % 7 === 0) continue;
        const x = 9.2 + col * 1.75 + (row % 2) * .6, z = -10.8 + row * 3.05 + Math.sin(col * 1.7) * .4;
        if (Math.hypot(x, z) < 9) continue;
        housePositions.push({ x, z, sx: .8 + hash(row * 20 + col) * .75, sy: .75 + hash(row * 27 + col) * 1.25, sz: .75 + hash(row * 31 + col) * .65, rot: (hash(row * 41 + col) - .5) * .22 });
      }
      const wallMat = new T.MeshStandardMaterial({ color: 0xb8956b, map: proceduralTexture("wall", 2), roughness: .98, emissive: 0x2b0803, emissiveIntensity: 0 });
      const roofMat = new T.MeshStandardMaterial({ color: 0x755643, map: proceduralTexture("rock", 2), roughness: 1, emissive: 0x210600, emissiveIntensity: 0 });
      const wallMesh = new T.InstancedMesh(new T.BoxGeometry(1, 1, 1), wallMat, housePositions.length);
      const roofMesh = new T.InstancedMesh(new T.BoxGeometry(1.08, .13, 1.08), roofMat, housePositions.length);
      const matrix = new T.Matrix4(), q = new T.Quaternion(), scale = new T.Vector3(), pos = new T.Vector3();
      housePositions.forEach((h, i) => {
        const y = terrainHeight(h.x, h.z); q.setFromAxisAngle(new T.Vector3(0, 1, 0), h.rot);
        matrix.compose(pos.set(h.x, y + h.sy / 2, h.z), q, scale.set(h.sx, h.sy, h.sz)); wallMesh.setMatrixAt(i, matrix);
        matrix.compose(pos.set(h.x, y + h.sy + .05, h.z), q, scale.set(h.sx, 1, h.sz)); roofMesh.setMatrixAt(i, matrix);
        const tint = new T.Color().setHSL(.075 + hash(i * 3) * .035, .25 + hash(i * 5) * .18, .48 + hash(i * 9) * .15); wallMesh.setColorAt(i, tint);
      });
      wallMesh.instanceColor.needsUpdate = true;
      [wallMesh, roofMesh].forEach(m => { setShadow(m); m.userData.part = "village"; this.villageGroup.add(m); });
      this.villageMaterials = [wallMat, roofMat];

      const doorHomes = housePositions.filter((_, i) => i % 3 !== 0), doors = new T.InstancedMesh(new T.PlaneGeometry(.3, .54), new T.MeshStandardMaterial({ color: 0x2c211a, roughness: 1, side: T.DoubleSide }), doorHomes.length);
      doorHomes.forEach((h, i) => { const y = terrainHeight(h.x, h.z); q.setFromEuler(new T.Euler(0, h.rot, 0)); matrix.compose(pos.set(h.x, y + .28, h.z + h.sz * .505), q, scale.set(Math.min(1, h.sx), Math.min(1, h.sy), 1)); doors.setMatrixAt(i, matrix); });
      doors.userData.part = "village"; this.villageGroup.add(doors);

      const domeHomes = housePositions.filter((_, i) => i % 5 === 1);
      const domes = new T.InstancedMesh(new T.SphereGeometry(.52, 20, 10, 0, TAU, 0, Math.PI / 2), new T.MeshStandardMaterial({ color: 0xa97e59, roughness: 1 }), domeHomes.length);
      domeHomes.forEach((h, i) => { const y = terrainHeight(h.x, h.z) + h.sy; matrix.compose(pos.set(h.x, y, h.z), q.identity(), scale.set(h.sx * .72, h.sy * .38, h.sz * .72)); domes.setMatrixAt(i, matrix); });
      setShadow(domes); domes.userData.part = "village"; this.villageGroup.add(domes);

      const courtyard = new T.InstancedMesh(new T.BoxGeometry(1, 1, 1), new T.MeshStandardMaterial({ color: 0x9b7757, roughness: 1 }), 28);
      for (let i = 0; i < 28; i++) {
        const block = Math.floor(i / 7), side = i % 7, x = 10 + block * 3.2 + (side < 4 ? side * .7 : 2.1), z = -12 + block * 5.6 + (side < 4 ? 0 : (side - 4) * .8);
        const y = terrainHeight(x, z); matrix.compose(pos.set(x, y + .3, z), q.identity(), scale.set(.68, .6, .18)); courtyard.setMatrixAt(i, matrix);
      }
      setShadow(courtyard); courtyard.userData.part = "village"; this.villageGroup.add(courtyard);

      const tower = setShadow(new T.Mesh(new T.CylinderGeometry(1.05, 1.25, 4.4, 12), new T.MeshStandardMaterial({ color: 0x8e6b50, roughness: 1 })));
      tower.position.set(20.2, terrainHeight(20.2, 5.2) + 2.2, 5.2); tower.userData.part = "village"; this.villageGroup.add(tower);
      const crown = setShadow(new T.Mesh(new T.CylinderGeometry(1.35, 1.15, .6, 12), roofMat)); crown.position.set(20.2, tower.position.y + 2.45, 5.2); this.villageGroup.add(crown);

      const fieldMat = new T.MeshStandardMaterial({ color: 0x8f743c, roughness: 1, side: T.DoubleSide });
      for (let i = 0; i < 5; i++) { const f = new T.Mesh(new T.PlaneGeometry(3.2, 2.1, 1, 1), fieldMat); f.rotation.x = -Math.PI / 2; f.rotation.z = -.12; f.position.set(15 + i * 3.4, terrainHeight(15 + i * 3.4, 10.2) + .04, 10.2); f.userData.part = "village"; this.villageGroup.add(f); }
      const canalPts = []; for (let i = 0; i < 18; i++) canalPts.push(new T.Vector3(8 + i * 1.15, 0, 12 + Math.sin(i * .35) * .8)); this.road(canalPts, .18, 0x527a72);

      const palmPositions = Array.from({ length: 22 }, (_, i) => ({ x: 8 + hash(i * 4) * 20, z: -14 + hash(i * 7 + 3) * 29, h: 2 + hash(i * 9) * 1.9 }));
      const trunks = new T.InstancedMesh(new T.CylinderGeometry(.09, .17, 1, 7), new T.MeshStandardMaterial({ color: 0x6b4a31, roughness: 1 }), palmPositions.length);
      const fronds = new T.InstancedMesh(new T.BoxGeometry(1, .025, .22, 5, 1, 1), new T.MeshStandardMaterial({ color: 0x53623a, roughness: .95 }), palmPositions.length * 9);
      palmPositions.forEach((palm, i) => {
        const y = terrainHeight(palm.x, palm.z); matrix.compose(pos.set(palm.x, y + palm.h / 2, palm.z), q.identity(), scale.set(1, palm.h, 1)); trunks.setMatrixAt(i, matrix);
        for (let leaf = 0; leaf < 9; leaf++) { const angle = leaf / 9 * TAU + hash(i * 4) * .4, length = 1.25 + hash(i * 17 + leaf) * .65; q.setFromEuler(new T.Euler(0, -angle, .18 + hash(i + leaf) * .18)); matrix.compose(pos.set(palm.x + Math.cos(angle) * length * .38, y + palm.h + .03, palm.z + Math.sin(angle) * length * .38), q, scale.set(length, 1, 1)); fronds.setMatrixAt(i * 9 + leaf, matrix); }
      });
      [trunks, fronds].forEach(m => { setShadow(m); m.userData.part = "village"; this.villageGroup.add(m); });

      const rockCount = 120, rocks = new T.InstancedMesh(new T.DodecahedronGeometry(.35, 1), new T.MeshStandardMaterial({ color: 0x55443a, roughness: 1 }), rockCount);
      for (let i = 0; i < rockCount; i++) { const angle = hash(i * 9) * TAU, radius = 3 + hash(i * 13) * 23, x = Math.cos(angle) * radius, z = Math.sin(angle) * radius, s = .25 + hash(i * 17) * .8; matrix.compose(pos.set(x, terrainHeight(x, z) + s * .22, z), q.setFromEuler(new T.Euler(hash(i) * 2, hash(i + 3) * 2, hash(i + 8))), scale.set(s * 1.4, s * .7, s)); rocks.setMatrixAt(i, matrix); }
      setShadow(rocks); this.scene.add(rocks);
    }

    buildAtmosphere() {
      const sky = new T.Mesh(new T.SphereGeometry(86, 40, 20), new T.ShaderMaterial({ side: T.BackSide, depthWrite: false, fog: false,
        vertexShader: "varying vec3 vWorld;void main(){vec4 world=modelMatrix*vec4(position,1.0);vWorld=world.xyz;gl_Position=projectionMatrix*viewMatrix*world;}",
        fragmentShader: "varying vec3 vWorld;void main(){float h=normalize(vWorld).y;vec3 horizon=vec3(.72,.43,.27);vec3 zenith=vec3(.19,.27,.34);vec3 glow=vec3(.96,.63,.34);vec3 c=mix(horizon,zenith,smoothstep(-.05,.65,h));c=mix(c,glow,pow(max(0.0,1.0-abs(h-.08)),8.0)*.24);gl_FragColor=vec4(c,1.0);}" }));
      this.scene.add(sky);
      const sun = new T.Mesh(new T.SphereGeometry(3.5, 24, 12), new T.MeshBasicMaterial({ color: 0xffd19a, fog: false })); sun.position.set(-43, 28, -58); this.scene.add(sun);
    }

    makePointCloud(count, fragmentColor) {
      const geometry = new T.BufferGeometry();
      geometry.setAttribute("position", new T.Float32BufferAttribute(new Float32Array(count * 3), 3));
      geometry.setAttribute("aSize", new T.Float32BufferAttribute(new Float32Array(count), 1));
      geometry.setAttribute("aAlpha", new T.Float32BufferAttribute(new Float32Array(count), 1));
      geometry.setAttribute("aShade", new T.Float32BufferAttribute(new Float32Array(count), 1));
      const material = new T.ShaderMaterial({ transparent: true, depthWrite: false, vertexColors: false, blending: T.NormalBlending,
        vertexShader: `attribute float aSize;attribute float aAlpha;attribute float aShade;varying float vAlpha;varying float vShade;void main(){vec4 mv=modelViewMatrix*vec4(position,1.0);gl_Position=projectionMatrix*mv;gl_PointSize=aSize*(260.0/max(1.0,-mv.z));vAlpha=aAlpha;vShade=aShade;}`,
        fragmentShader: `varying float vAlpha;varying float vShade;void main(){vec2 p=gl_PointCoord-.5;float angle=vShade*6.28;mat2 turn=mat2(cos(angle),-sin(angle),sin(angle),cos(angle));p=turn*p;float d=length(p);float edge=1.0-smoothstep(.12,.5,d);float grain=.72+.28*sin(p.x*23.0+sin(p.y*17.0));vec3 dark=vec3(${fragmentColor[0]});vec3 light=vec3(${fragmentColor[1]});gl_FragColor=vec4(mix(dark,light,vShade),edge*vAlpha*grain);}` });
      const cloud = new T.Points(geometry, material); cloud.frustumCulled = false; return cloud;
    }

    buildParticles() {
      this.smokeCount = 360; this.smoke = this.makePointCloud(this.smokeCount, [".18,.15,.14", ".64,.61,.57"]); this.smoke.visible = false; this.smoke.userData.part = "ash"; this.scene.add(this.smoke);
      this.sparkCount = 140; this.sparks = this.makePointCloud(this.sparkCount, ["1.0,.16,.01", "1.0,.84,.25"]); this.sparks.material.blending = T.AdditiveBlending; this.sparks.visible = false; this.sparks.userData.part = "lava"; this.scene.add(this.sparks);
      this.bombMesh = new T.InstancedMesh(new T.IcosahedronGeometry(.11, 1), new T.MeshStandardMaterial({ color: 0x241714, emissive: 0xff3b08, emissiveIntensity: 2.2, roughness: .9 }), 54); this.bombMesh.visible = false; this.bombMesh.userData.part = "ash"; this.scene.add(this.bombMesh);
      this.dust = this.makePointCloud(120, [".32,.22,.16", ".72,.55,.39"]); this.dust.visible = false; this.scene.add(this.dust);
      this.shockwave = new T.Mesh(new T.RingGeometry(1, 1.08, 96), new T.MeshBasicMaterial({ color: 0xffb36c, transparent: true, opacity: 0, side: T.DoubleSide, depthWrite: false })); this.shockwave.rotation.x = -Math.PI / 2; this.shockwave.position.y = 6.15; this.scene.add(this.shockwave);
    }

    lavaRibbon(points, width, yOffset = .12) {
      const vertices = [], uvs = [], indices = [];
      points.forEach((point, i) => {
        const previous = points[Math.max(0, i - 1)], next = points[Math.min(points.length - 1, i + 1)], dx = next.x - previous.x, dz = next.z - previous.z, length = Math.hypot(dx, dz) || 1;
        const nx = -dz / length, nz = dx / length, t = i / (points.length - 1), variedWidth = width * (.72 + .22 * Math.sin(t * 13 + width * 9) + .28 * t);
        const lx = point.x + nx * variedWidth, lz = point.z + nz * variedWidth, rx = point.x - nx * variedWidth, rz = point.z - nz * variedWidth;
        vertices.push(lx, terrainHeight(lx, lz) + yOffset, lz, rx, terrainHeight(rx, rz) + yOffset, rz); uvs.push(0, t, 1, t);
        if (i) { const k = i * 2; indices.push(k - 2, k, k - 1, k - 1, k, k + 1); }
      });
      const geometry = new T.BufferGeometry(); geometry.setAttribute("position", new T.Float32BufferAttribute(vertices, 3)); geometry.setAttribute("uv", new T.Float32BufferAttribute(uvs, 2)); geometry.setIndex(indices); geometry.computeVertexNormals(); return geometry;
    }

    buildLava(result) {
      disposeTree(this.eruptionGroup); this.lavaMeshes = [];
      const v = result.viscosity / 100, g = result.gas / 100;
      const reach = 3.6 + result.flow * .125, width = .18 + (1 - v) * .25, branches = v < .34 ? (g > .6 ? 5 : 4) : v > .66 ? 1 : 2;
      const outerMat = new T.MeshStandardMaterial({ color: 0x6e140b, emissive: 0xff2700, emissiveIntensity: 1.8, roughness: .76 });
      const coreMat = new T.MeshStandardMaterial({ color: 0xff9b18, emissive: 0xff4200, emissiveIntensity: 2.2, roughness: .38 });
      const crustMat = new T.MeshStandardMaterial({ color: 0x211b18, roughness: 1, alphaMap: proceduralTexture("crust", 4), alphaTest: .12, transparent: true, opacity: 0, depthWrite: false });
      for (let branch = 0; branch < branches; branch++) {
        const baseAngle = .62 + (branch - (branches - 1) / 2) * .21, branchReach = reach * (1 - branch * .095), points = [];
        for (let i = 0; i <= 34; i++) {
          const t = i / 34, r = 1.55 + branchReach * t, angle = baseAngle + Math.sin(t * 8 + branch * 1.9) * (.08 + t * .07) + Math.sin(t * 19 + branch) * .018;
          const x = Math.cos(angle) * r, z = Math.sin(angle) * r, y = Math.max(terrainHeight(x, z) + .12 + width * .2, 0);
          points.push(new T.Vector3(x, y, z));
        }
        const segments = points.length - 1;
        const outer = new T.Mesh(this.lavaRibbon(points, width * (1 - branch * .09), .115), outerMat);
        const core = new T.Mesh(this.lavaRibbon(points, width * .58, .145), coreMat);
        const crust = new T.Mesh(this.lavaRibbon(points, width * 1.02, .17), crustMat.clone());
        [outer, core, crust].forEach(m => { m.castShadow = true; m.userData.part = "lava"; this.eruptionGroup.add(m); });
        this.lavaMeshes.push({ outer, core, crust, branch, segments });
      }
      this.dome = new T.Mesh(new T.SphereGeometry(1.15 + v * .45, 48, 24), outerMat.clone()); this.dome.scale.y = .55 + v * .35; this.dome.position.set(0, 5.15, 0); this.dome.visible = false; this.dome.userData.part = "lava"; this.eruptionGroup.add(this.dome);
    }

    updateLava(p, time) {
      if (!this.result) return;
      const v = this.result.viscosity / 100, g = this.result.gas / 100;
      const eruption = clamp((p - .2) / .56, 0, 1), flowSpeed = .55 + (1 - v) * .9, reveal = clamp(eruption * flowSpeed, 0, 1);
      this.lavaMeshes.forEach(item => {
        const total = item.outer.geometry.index?.count || item.outer.geometry.attributes.position.count;
        const amount = Math.floor(total * clamp(reveal - item.branch * .06, 0, 1) / 6) * 6;
        item.outer.geometry.setDrawRange(0, amount); item.core.geometry.setDrawRange(0, amount); item.crust.geometry.setDrawRange(0, amount);
        item.crust.material.opacity = clamp((p - .67) * 2.2, 0, .82) * (.55 + v * .45);
        item.core.material.emissiveIntensity = (this.part === "lava" ? 3.2 : 1.9) + Math.sin(time * 4 + item.branch) * .45;
      });
      this.dome.visible = v > .6 && eruption > .03; if (this.dome.visible) { const s = smooth(clamp(eruption * 1.35, 0, 1)); this.dome.scale.set(s, s * (.55 + v * .35), s); this.dome.material.emissiveIntensity = 1.3 + Math.sin(time * 3) * .25; }
      this.lavaLakeMaterial.emissiveIntensity = 3.5 + Math.sin(time * (3 + g * 6)) * (p < .2 ? 1.3 : .45);
      this.craterGlow.intensity = 2.3 + p * (3 + g * 7);
      this.lavaBounce.intensity = eruption * (1.2 + this.result.flow * .045);
    }

    updateCloud(points, count, p, time, kind) {
      const pos = points.geometry.attributes.position.array, sizes = points.geometry.attributes.aSize.array, alpha = points.geometry.attributes.aAlpha.array, shade = points.geometry.attributes.aShade.array;
      const result = this.result, v = result ? result.viscosity / 100 : 0, g = result ? result.gas / 100 : 0, eruption = clamp((p - .18) / .82, 0, 1);
      const active = kind === "smoke" ? Math.round(28 + (result?.ash || 0) * 3.25) : Math.round(10 + (result?.intensity || 0) * 1.25);
      for (let i = 0; i < count; i++) {
        const seed = hash(i * 11 + (kind === "smoke" ? 1 : 7)), birth = (i % 73) / 92;
        const age = fract(eruption * 1.9 + seed + (p >= .999 ? time * .035 : 0));
        const on = i < active && eruption > birth * .32;
        if (kind === "smoke") {
          const height = 2.2 + (result?.ash || 0) * .105, umbrella = result && result.ash > 62 ? smooth(clamp((age - .63) / .37, 0, 1)) : 0;
          const spread = (.18 + age * (1.1 + result?.ash * .018)) * (1 + umbrella * 2.9), angle = seed * TAU * 8 + age * 3.5 + time * .08;
          pos[i * 3] = Math.cos(angle) * spread + age * age * (1.2 + g * 2.2); pos[i * 3 + 1] = 6.25 + age * height; pos[i * 3 + 2] = Math.sin(angle) * spread * .72;
          sizes[i] = 1.2 + age * 4.8 + seed * 1.5; alpha[i] = on ? Math.sin(age * Math.PI) * (.19 + g * .12) : 0; shade[i] = clamp(age * 1.15, 0, 1);
        } else {
          const fountain = g > .55 && v < .45 ? 1.6 : .75, angle = seed * TAU * 6, radius = age * (1.3 + result?.intensity * .025);
          pos[i * 3] = Math.cos(angle) * radius; pos[i * 3 + 1] = 6.05 + Math.sin(age * Math.PI) * (2 + result?.intensity * .035) * fountain - age * 1.2; pos[i * 3 + 2] = Math.sin(angle) * radius;
          sizes[i] = .22 + seed * .55; alpha[i] = on ? (1 - age) * .95 : 0; shade[i] = seed;
        }
      }
      ["position", "aSize", "aAlpha", "aShade"].forEach(name => points.geometry.attributes[name].needsUpdate = true);
      points.visible = !!result && eruption > 0;
    }

    updateBombs(p, time) {
      if (!this.result) { this.bombMesh.visible = false; return; }
      const v = this.result.viscosity / 100, g = this.result.gas / 100, eruption = clamp((p - .2) / .8, 0, 1), count = Math.round(this.result.intensity * .48);
      this.bombMesh.visible = count > 2 && eruption > 0;
      const matrix = new T.Matrix4(), pos = new T.Vector3(), q = new T.Quaternion(), scale = new T.Vector3();
      for (let i = 0; i < 54; i++) {
        const seed = hash(i * 17), age = p >= .999 ? fract(seed * 4 + i * .19) : eruption * 2 - (i % 19) / 24, on = i < count && age > 0 && age < 1;
        const angle = hash(i * 9 + 2) * TAU, speed = 2.4 + hash(i * 13) * (3.2 + g * 4), x = Math.cos(angle) * speed * age, z = Math.sin(angle) * speed * age, y = 6.2 + (4.5 + g * 6) * age - 7.4 * age * age;
        const s = on ? .5 + hash(i) * 1.2 : 0; matrix.compose(pos.set(x, y, z), q.setFromEuler(new T.Euler(age * 8, age * 11, 0)), scale.setScalar(s)); this.bombMesh.setMatrixAt(i, matrix);
      }
      this.bombMesh.instanceMatrix.needsUpdate = true;
      const blast = clamp((p - .24) / .12, 0, 1); this.shockwave.visible = this.result.intensity > 55 && blast < 1; this.shockwave.scale.setScalar(1 + blast * 7); this.shockwave.material.opacity = (1 - blast) * .65;
    }

    updateDust(p, time) {
      if (!this.result) { this.dust.visible = false; return; }
      const pos = this.dust.geometry.attributes.position.array, sizes = this.dust.geometry.attributes.aSize.array, alpha = this.dust.geometry.attributes.aAlpha.array, shade = this.dust.geometry.attributes.aShade.array;
      const burst = clamp((p - .24) / .35, 0, 1), strong = this.result.intensity / 100;
      for (let i = 0; i < 120; i++) { const seed = hash(i * 21), a = seed * TAU * 7, r = burst * (2 + strong * 9) * (.3 + hash(i * 7)); pos[i * 3] = Math.cos(a) * r; pos[i * 3 + 1] = terrainHeight(pos[i * 3], Math.sin(a) * r) + .2 + seed * .8; pos[i * 3 + 2] = Math.sin(a) * r; sizes[i] = 1.2 + seed * 2; alpha[i] = p > .2 && p < .72 ? strong * (1 - burst * .65) * .32 : 0; shade[i] = seed; }
      ["position", "aSize", "aAlpha", "aShade"].forEach(name => this.dust.geometry.attributes[name].needsUpdate = true); this.dust.visible = strong > .35 && p > .2;
    }

    setResult(result) {
      const changed = !this.result || !result || this.result.viscosity !== result.viscosity || this.result.gas !== result.gas;
      this.result = result;
      if (result && changed) this.buildLava(result);
      if (!result) { disposeTree(this.eruptionGroup); this.lavaMeshes = []; this.smoke.visible = this.sparks.visible = this.bombMesh.visible = this.dust.visible = this.shockwave.visible = false; this.craterGlow.intensity = 2.4; this.lavaBounce.intensity = 0; }
    }

    draw(result = null, progress = 0) { this.setResult(result); this.progress = progress; }

    cameraTo(position, target, duration = 1100, label = "") {
      const now = performance.now();
      this.cameraTween = { fromPos: this.camera.position.clone(), toPos: new T.Vector3(...position), fromTarget: this.cameraTarget.clone(), toTarget: new T.Vector3(...target), start: now, duration: Math.max(0, duration), label };
      if (!duration) { this.camera.position.copy(this.cameraTween.toPos); this.cameraTarget.copy(this.cameraTween.toTarget); this.cameraTween = null; }
    }

    setView(view, duration = 1050) {
      const shots = { front: [[21, 12, 26], [0, 3.3, 0]], side: [[29, 11, 2], [0, 3.8, 0]], top: [[1, 34, 8], [0, 2.2, 0]] };
      if (!shots[view]) return; this.view = view; this.cameraTo(shots[view][0], shots[view][1], duration, view);
    }

    focusPart(part, duration = 1050) {
      const shots = { crater: [[8.5, 10.7, 10.5], [0, 5.7, 0]], ash: [[14, 17, 19], [1.5, 10.5, 0]], lava: [[12, 7.3, 13], [3.6, 2.8, 2.2]], village: [[23, 6.8, -13], [15.5, 1.1, -2.5]] };
      if (!shots[part]) return; this.part = part; this.cameraTo(shots[part][0], shots[part][1], duration, part); this.highlightPart(part);
    }

    tourShot(name, duration = 1700) {
      const shots = { wide: [[29, 16, 34], [2, 3.2, 0]], village: [[24, 6.2, -15], [15, 1.1, -3]], slope: [[17, 9, 17], [1.8, 3.8, -1]], crater: [[7.5, 9.4, 9.2], [0, 5.6, 0]], observe: [[21, 12, 26], [0, 3.3, 0]] };
      if (shots[name]) this.cameraTo(shots[name][0], shots[name][1], duration, name);
    }

    highlightPart(part) {
      this.part = part;
      this.rimMaterial.emissiveIntensity = part === "crater" ? 1.6 : .2;
      this.villageMaterials.forEach(m => { m.emissiveIntensity = part === "village" ? .75 : 0; });
      this.smoke.material.opacity = part === "ash" ? 1 : .82;
      this.lavaMeshes.forEach(item => item.core.material.emissiveIntensity = part === "lava" ? 6 : 4.2);
    }

    orbitBy(dx, dy) {
      this.cameraTween = null; const offset = this.camera.position.clone().sub(this.cameraTarget), spherical = new T.Spherical().setFromVector3(offset);
      spherical.theta += dx; spherical.phi = clamp(spherical.phi + dy, .18, 1.45); spherical.makeSafe(); offset.setFromSpherical(spherical); this.camera.position.copy(this.cameraTarget).add(offset);
    }
    zoomBy(amount) { this.cameraTween = null; const offset = this.camera.position.clone().sub(this.cameraTarget); offset.multiplyScalar(amount); offset.clampLength(8, 55); this.camera.position.copy(this.cameraTarget).add(offset); }

    updateCamera(now) {
      if (this.cameraTween) {
        const t = clamp((now - this.cameraTween.start) / this.cameraTween.duration, 0, 1), e = t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        this.camera.position.lerpVectors(this.cameraTween.fromPos, this.cameraTween.toPos, e); this.cameraTarget.lerpVectors(this.cameraTween.fromTarget, this.cameraTween.toTarget, e); if (t >= 1) this.cameraTween = null;
      }
      const shakeWindow = this.result && this.result.intensity > 50 && this.progress > .24 && this.progress < .48;
      const strength = shakeWindow ? (this.result.intensity / 100) * .055 * (1 - (this.progress - .24) / .24) : 0;
      this.camera.lookAt(this.cameraTarget.x + Math.sin(now * .08) * strength, this.cameraTarget.y + Math.sin(now * .11) * strength, this.cameraTarget.z);
    }

    animate() {
      if (this.disposed) return;
      this.raf = requestAnimationFrame(() => this.animate());
      const width = Math.max(1, this.canvas.clientWidth), height = Math.max(1, this.canvas.clientHeight);
      if (this.canvas.width !== Math.floor(width * this.renderer.getPixelRatio()) || this.canvas.height !== Math.floor(height * this.renderer.getPixelRatio())) { this.renderer.setSize(width, height, false); this.camera.aspect = width / height; this.camera.updateProjectionMatrix(); }
      const time = this.clock.getElapsedTime(), now = performance.now();
      this.updateLava(this.progress, time); if (this.result) { this.updateCloud(this.smoke, this.smokeCount, this.progress, time, "smoke"); this.updateCloud(this.sparks, this.sparkCount, this.progress, time, "sparks"); this.updateBombs(this.progress, time); this.updateDust(this.progress, time); }
      this.updateCamera(now); this.renderer.render(this.scene, this.camera);
    }

    playCue(result) {
      try {
        const AudioContext = root.AudioContext || root.webkitAudioContext; if (!AudioContext) return;
        this.audioContext ||= new AudioContext(); const ctx = this.audioContext, now = ctx.currentTime, gain = ctx.createGain(), osc = ctx.createOscillator();
        gain.gain.setValueAtTime(.0001, now); gain.gain.exponentialRampToValueAtTime(.035, now + .12); gain.gain.exponentialRampToValueAtTime(.0001, now + 1.25);
        osc.type = result.intensity > 55 ? "sawtooth" : "sine"; osc.frequency.setValueAtTime(54 + result.gas * .18, now); osc.frequency.exponentialRampToValueAtTime(28, now + 1.2); osc.connect(gain).connect(ctx.destination); osc.start(now); osc.stop(now + 1.3);
      } catch (_) { /* Audio remains optional. */ }
    }

    dispose() { this.disposed = true; cancelAnimationFrame(this.raf); this.renderer.dispose(); this.audioContext?.close?.(); }
  }

  root.VolcanoGL = VolcanoGL;
})(globalThis);
