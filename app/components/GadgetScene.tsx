"use client";

import { useEffect, useRef, useState } from "react";
import type * as Three from "three";

export type ModelKind =
  | "tracker"
  | "shooter"
  | "mask"
  | "camera"
  | "cartridge"
  | "web"
  | "drone";

type Props = {
  kind: ModelKind;
  accent: string;
  exploded: boolean;
  autoRotate: boolean;
  zoom: number;
  resetKey: number;
  onReady?: () => void;
};

const names: Record<ModelKind, string> = {
  tracker: "Spider Tracker",
  shooter: "Web Shooter",
  mask: "Spider Mask",
  camera: "Field Camera",
  cartridge: "Web Fluid Cartridge",
  web: "Organic Web",
  drone: "Spider Drone",
};

/** All geometry is generated locally: the exhibit needs no models or image requests. */
export default function GadgetScene(props: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const current = useRef(props);
  const [fallback, setFallback] = useState(false);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    current.current = props;
  }, [props]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let cancelled = false;
    let frame = 0;
    let disposeScene: (() => void) | undefined;
    const ready = () => current.current.onReady?.();

    async function initialize() {
      const [T, { OrbitControls }, { RoomEnvironment }] = await Promise.all([
        import("three"),
        import("three/addons/controls/OrbitControls.js"),
        import("three/addons/environments/RoomEnvironment.js"),
      ]);
      if (cancelled || !host) return;

      const renderer = new T.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
        failIfMajorPerformanceCaveat: false,
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
      renderer.setClearColor(0x0b0c0e, 0);
      renderer.outputColorSpace = T.SRGBColorSpace;
      renderer.toneMapping = T.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.5;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = T.PCFSoftShadowMap;
      renderer.domElement.style.cssText =
        "display:block;width:100%;height:100%;touch-action:none;outline:none;";
      renderer.domElement.setAttribute("aria-hidden", "true");
      host.appendChild(renderer.domElement);

      const scene = new T.Scene();
      const cleanup: Array<() => void> = [];
      const allMaterials: Three.Material[] = [];
      const maskLenses: Three.MeshStandardMaterial[] = [];
      let disposed = false;
      disposeScene = () => {
        if (disposed) return;
        disposed = true;
        cancelAnimationFrame(frame);
        cleanup.reverse().forEach((release) => release());
        const geometries = new Set<Three.BufferGeometry>();
        const materials = new Set<Three.Material>(allMaterials);
        scene.traverse((object) => {
          if (object instanceof T.Mesh) {
            geometries.add(object.geometry);
            (Array.isArray(object.material) ? object.material : [object.material]).forEach((mat) => materials.add(mat));
          }
        });
        geometries.forEach((geometry) => geometry.dispose());
        materials.forEach((mat) => mat.dispose());
        renderer.dispose();
        renderer.forceContextLoss();
        renderer.domElement.remove();
      };
      const camera = new T.PerspectiveCamera(35, 1, 0.1, 70);
      const start = new T.Vector3(3.85, 4.15, 6.3);
      camera.position.copy(start);
      const controls = new OrbitControls(camera, renderer.domElement);
      cleanup.push(() => controls.dispose());
      controls.target.set(0, 0.02, 0);
      controls.enableDamping = true;
      controls.dampingFactor = 0.065;
      controls.enablePan = false;
      controls.minDistance = 3.1;
      controls.maxDistance = 12;
      controls.maxPolarAngle = Math.PI * 0.86;
      controls.rotateSpeed = 0.65;
      controls.zoomSpeed = 0.65;
      controls.autoRotate = false;
      controls.update();

      const room = new RoomEnvironment();
      const pmrem = new T.PMREMGenerator(renderer);
      const environment = pmrem.fromScene(room, 0.04);
      cleanup.push(() => environment.dispose());
      scene.environment = environment.texture;
      scene.environmentIntensity = 0.95;
      room.dispose();
      pmrem.dispose();

      scene.add(new T.HemisphereLight(0xdce7ff, 0x121018, 1.65));
      const key = new T.DirectionalLight(0xfff3e9, 4.8);
      key.position.set(-3, 6, 5);
      key.castShadow = true;
      key.shadow.mapSize.set(1024, 1024);
      key.shadow.camera.left = -4;
      key.shadow.camera.right = 4;
      key.shadow.camera.top = 4;
      key.shadow.camera.bottom = -4;
      key.shadow.normalBias = 0.03;
      scene.add(key);
      const fill = new T.DirectionalLight(0xa6bdd9, 3.2);
      fill.position.set(5, 2, -2);
      scene.add(fill);
      const rim = new T.PointLight(0xff263d, 15, 18, 2);
      rim.position.set(-3, 1.1, -3);
      scene.add(rim);
      const front = new T.DirectionalLight(0xffffff, 1.1);
      front.position.set(1, -1, 5);
      scene.add(front);

      const resources: Array<Three.Texture> = [];
      cleanup.push(() => resources.forEach((texture) => texture.dispose()));
      const material = (color: string | number, metalness = 0.75, roughness = 0.26) =>
        new T.MeshStandardMaterial({ color, metalness, roughness });
      const red = new T.MeshPhysicalMaterial({
        color: 0xc5162e,
        metalness: 0.62,
        roughness: 0.2,
        clearcoat: 1,
        clearcoatRoughness: 0.11,
      });
      const dark = material(0x15171b, 0.85, 0.27);
      const rubber = material(0x101114, 0.08, 0.85);
      const steel = material(0xa9b2bb, 0.97, 0.2);
      const blackSteel = material(0x3a4148, 0.9, 0.31);
      const silver = material(0xd9dcdf, 0.92, 0.18);
      const gold = material(0xb99b66, 0.82, 0.22);
      const glow = new T.MeshStandardMaterial({
        color: 0xc7eeff,
        emissive: 0x92e0ff,
        emissiveIntensity: 2.5,
        metalness: 0.1,
        roughness: 0.3,
      });
      const redGlow = new T.MeshStandardMaterial({
        color: 0xff2841,
        emissive: 0xff102e,
        emissiveIntensity: 2,
        roughness: 0.3,
      });
      allMaterials.push(
        red, dark, rubber, steel, blackSteel, silver, gold, glow, redGlow,
      );
      cleanup.push(() => key.shadow.map?.dispose());

      const mesh = (
        geometry: Three.BufferGeometry,
        mat: Three.Material,
        parent: Three.Object3D,
        x = 0,
        y = 0,
        z = 0,
      ) => {
        const object = new T.Mesh(geometry, mat);
        object.position.set(x, y, z);
        object.castShadow = true;
        object.receiveShadow = true;
        parent.add(object);
        return object;
      };
      const ball = (
        parent: Three.Object3D,
        mat: Three.Material,
        position: [number, number, number],
        scale: [number, number, number],
      ) => {
        const object = mesh(new T.SphereGeometry(1, 40, 28), mat, parent, ...position);
        object.scale.set(...scale);
        return object;
      };
      const box = (
        parent: Three.Object3D,
        mat: Three.Material,
        size: [number, number, number],
        position: [number, number, number],
      ) => mesh(new T.BoxGeometry(...size), mat, parent, ...position);
      const rod = (
        parent: Three.Object3D,
        mat: Three.Material,
        a: [number, number, number],
        b: [number, number, number],
        radius: number,
        endRadius = radius,
      ) => {
        const from = new T.Vector3(...a);
        const to = new T.Vector3(...b);
        const delta = to.clone().sub(from);
        const object = mesh(
          new T.CylinderGeometry(endRadius, radius, delta.length(), 12),
          mat,
          parent,
        );
        object.position.copy(from.add(to).multiplyScalar(0.5));
        object.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), delta.normalize());
        return object;
      };
      const ring = (
        parent: Three.Object3D,
        mat: Three.Material,
        radius: number,
        tube: number,
        position: [number, number, number],
        horizontal = false,
      ) => {
        const object = mesh(new T.TorusGeometry(radius, tube, 10, 64), mat, parent, ...position);
        if (horizontal) object.rotation.x = Math.PI / 2;
        return object;
      };
      const screw = (parent: Three.Object3D, x: number, y: number, z: number, radius = 0.045) => {
        mesh(new T.CylinderGeometry(radius, radius, 0.025, 12), steel, parent, x, y, z);
        box(parent, dark, [radius * 1.25, 0.007, radius * 0.22], [x, y + 0.016, z]);
      };
      const label = (
        parent: Three.Object3D,
        text: string,
        width: number,
        height: number,
        position: [number, number, number],
      ) => {
        const canvas = document.createElement("canvas");
        canvas.width = 512;
        canvas.height = 128;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.fillStyle = "#0e1013";
        ctx.fillRect(0, 0, 512, 128);
        ctx.strokeStyle = "#657079";
        ctx.lineWidth = 2;
        ctx.strokeRect(10, 10, 492, 108);
        ctx.fillStyle = "#ced4d8";
        ctx.font = "500 38px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(text, 256, 65);
        const texture = new T.CanvasTexture(canvas);
        texture.colorSpace = T.SRGBColorSpace;
        resources.push(texture);
        const mat = new T.MeshStandardMaterial({ map: texture, roughness: 0.7, metalness: 0.3 });
        allMaterials.push(mat);
        const plaque = mesh(new T.PlaneGeometry(width, height), mat, parent, ...position);
        plaque.rotation.x = -Math.PI / 2;
      };

      const exhibit = new T.Group();
      const model = new T.Group();
      exhibit.add(model);
      scene.add(exhibit);
      const parts: { object: Three.Object3D; base: Three.Vector3; offset: Three.Vector3 }[] = [];
      const part = (
        parent: Three.Object3D,
        position: [number, number, number],
        offset: [number, number, number],
      ) => {
        const group = new T.Group();
        group.position.set(...position);
        parent.add(group);
        parts.push({ object: group, base: group.position.clone(), offset: new T.Vector3(...offset) });
        return group;
      };

      function spiderEmblem(parent: Three.Object3D, size: number, mat: Three.Material) {
        const emblem = new T.Group();
        parent.add(emblem);
        ball(emblem, mat, [0, 0, 0.045 * size], [0.09 * size, 0.018 * size, 0.17 * size]);
        ball(emblem, mat, [0, 0, -0.13 * size], [0.067 * size, 0.02 * size, 0.075 * size]);
        for (const side of [-1, 1]) {
          for (let i = 0; i < 4; i++) {
            const z = (-0.09 + i * 0.061) * size;
            const endZ = (-0.36 + i * 0.24) * size;
            rod(emblem, mat, [side * 0.045 * size, 0, z], [side * 0.19 * size, 0, endZ * 0.4], 0.018 * size);
            rod(emblem, mat, [side * 0.19 * size, 0, endZ * 0.4], [side * 0.28 * size, 0, endZ], 0.012 * size);
          }
        }
        return emblem;
      }

      function tracker() {
        model.rotation.y = Math.PI - 0.34;
        ball(model, dark, [0, 0, 0.07], [0.77, 0.25, 1.09]);
        ball(model, blackSteel, [0, -0.14, 0.06], [0.65, 0.19, 0.96]);
        for (const side of [-1, 1]) {
          const shell = part(model, [side * 0.355, 0.19, 0.13], [side * 0.48, 0.73, 0.15]);
          const wing = ball(shell, red, [0, 0, 0], [0.4, 0.265, 0.94]);
          wing.rotation.z = side * -0.13;
          // A narrow metallic shoulder plate catches the studio strip lights.
          const shoulder = ball(shell, blackSteel, [side * 0.22, -0.085, -0.57], [0.15, 0.07, 0.34]);
          shoulder.rotation.y = side * -0.24;
          for (let i = 0; i < 3; i++) {
            const vent = box(shell, dark, [0.11, 0.018, 0.019], [side * 0.14, 0.218 - i * 0.012, 0.25 + i * 0.11]);
            vent.rotation.z = side * -0.3;
          }
          screw(shell, side * 0.21, 0.141, 0.6, 0.035);
          screw(shell, side * 0.21, 0.143, -0.61, 0.035);
          // Four articulated, tapered mechanical legs on each side.
          for (let i = 0; i < 4; i++) {
            const anchorZ = -0.68 + i * 0.45;
            const spread = [-1.18, -0.48, 0.51, 1.19][i];
            const leg = part(model, [side * 0.59, -0.015, anchorZ], [side * 0.55, 0.04, (i - 1.5) * 0.17]);
            const a: [number, number, number] = [0, 0, 0];
            const b: [number, number, number] = [side * 0.46, 0.1, spread * 0.26];
            const c: [number, number, number] = [side * (1.08 - Math.abs(i - 1.5) * 0.12), 0.005, spread * 0.61];
            const d: [number, number, number] = [side * (1.56 - Math.abs(i - 1.5) * 0.14), -0.43, spread * 0.9];
            ball(leg, dark, a, [0.15, 0.15, 0.15]);
            rod(leg, steel, a, b, 0.083, 0.071);
            rod(leg, dark, b, c, 0.09, 0.064);
            rod(leg, steel, [b[0], b[1] + 0.057, b[2]], [c[0], c[1] + 0.045, c[2]], 0.022, 0.018);
            rod(leg, blackSteel, c, d, 0.06, 0.018);
            rod(leg, silver, [c[0], c[1] + 0.018, c[2] + 0.035], [d[0], d[1] + 0.015, d[2]], 0.017, 0.007);
            ball(leg, dark, b, [0.118, 0.118, 0.118]);
            ball(leg, blackSteel, c, [0.09, 0.09, 0.09]);
            screw(leg, b[0], b[1] + 0.11, b[2], 0.046);
            screw(leg, c[0], c[1] + 0.082, c[2], 0.034);
            ring(leg, red, 0.093, 0.017, [b[0], b[1] + 0.05, b[2]], true);
            ball(leg, rubber, d, [0.033, 0.047, 0.049]);
          }
        }
        const spine = part(model, [0, 0.285, 0], [0, 0.3, 0]);
        ball(spine, dark, [0, 0, 0.14], [0.089, 0.075, 0.93]);
        rod(spine, blackSteel, [0, 0.066, 0.35], [0, 0.046, 0.89], 0.025);
        const core = part(model, [0, 0.39, -0.23], [0, 0.75, -0.2]);
        mesh(new T.CylinderGeometry(0.21, 0.23, 0.1, 48), dark, core);
        mesh(new T.CylinderGeometry(0.149, 0.149, 0.015, 48), redGlow, core, 0, 0.057, 0);
        ring(core, steel, 0.179, 0.013, [0, 0.06, 0], true);
        const symbol = spiderEmblem(core, 0.47, silver);
        symbol.position.y = 0.072;
        const head = part(model, [0, 0.045, -0.94], [0, 0.15, -0.57]);
        ball(head, dark, [0, 0, 0], [0.38, 0.23, 0.33]);
        ball(head, red, [0, 0.127, -0.02], [0.31, 0.115, 0.25]);
        for (const side of [-1, 1]) {
          const eye = ball(head, glow, [side * 0.13, 0.069, -0.27], [0.075, 0.038, 0.025]);
          eye.rotation.z = side * -0.25;
          rod(head, steel, [side * 0.22, -0.05, -0.17], [side * 0.33, -0.1, -0.4], 0.038, 0.014);
        }
        label(model, "ST—01  /  PARKER", 0.48, 0.13, [0, -0.197, 0.72]);
        for (let i = 0; i < 6; i++) {
          box(model, gold, [0.038, 0.016, 0.1], [(i - 2.5) * 0.085, 0.153, 0.98]);
        }
      }

      function shooter() {
        model.rotation.set(0.1, -0.15, -0.18);
        // Broad wrist cuff with a visible opening and mechanical locking blocks.
        const cuff = mesh(new T.CylinderGeometry(0.99, 1.03, 0.88, 64, 1, true), dark, model, 0, -0.1, 0);
        cuff.rotation.z = Math.PI / 2;
        for (const side of [-1, 1]) {
          const edge = ring(model, blackSteel, 1.015, 0.08, [side * 0.43, -0.1, 0]);
          edge.rotation.y = Math.PI / 2;
          for (let i = 0; i < 8; i++) {
            const theta = i / 8 * Math.PI * 2;
            const clamp = box(model, rubber, [0.56, 0.1, 0.26], [0, Math.cos(theta) * 1.035 - 0.1, Math.sin(theta) * 1.035]);
            clamp.rotation.x = theta;
          }
        }
        const deck = part(model, [0, 0.99, 0], [0, 0.75, 0]);
        box(deck, blackSteel, [1.08, 0.16, 1.53], [0, 0, 0]);
        const cover = part(deck, [0, 0.15, 0.04], [0, 0.55, 0.16]);
        ball(cover, red, [0, 0, 0], [0.5, 0.22, 0.69]);
        label(cover, "WS / 02", 0.51, 0.14, [0, 0.213, 0.22]);
        for (const side of [-1, 1]) {
          rod(deck, steel, [side * 0.42, 0.14, -0.56], [side * 0.42, 0.14, 0.54], 0.048);
          for (const z of [-0.6, 0.6]) screw(deck, side * 0.43, 0.095, z);
        }
        const nozzle = part(model, [0, 1.16, 0.76], [0, 0.2, 0.65]);
        const barrel = mesh(new T.CylinderGeometry(0.2, 0.24, 0.46, 40), steel, nozzle, 0, 0, 0.05);
        barrel.rotation.x = Math.PI / 2;
        ring(nozzle, dark, 0.166, 0.045, [0, 0, 0.285]);
        mesh(new T.CircleGeometry(0.13, 40), rubber, nozzle, 0, 0, 0.286);
        ring(nozzle, glow, 0.092, 0.011, [0, 0, 0.29]);
        const trigger = part(model, [0, 0.54, 1.08], [0, -0.2, 0.48]);
        box(trigger, dark, [0.57, 0.09, 0.58], [0, 0, 0]);
        for (const side of [-1, 1]) {
          const button = box(trigger, red, [0.19, 0.055, 0.28], [side * 0.15, 0.056, 0.1]);
          button.rotation.x = 0.12;
        }
        model.position.y = -0.28;
        model.scale.setScalar(1.1);
      }

      function mask() {
        const fabric = new T.MeshPhysicalMaterial({ color: 0xb71227, roughness: 0.75, metalness: 0.05, sheen: 0.65, sheenColor: new T.Color(0xff2943) });
        allMaterials.push(fabric);
        const head = part(model, [0, 0.15, 0], [0, 0.3, 0]);
        ball(head, fabric, [0, 0.03, 0], [0.94, 1.29, 0.83]);
        ball(head, fabric, [0, -0.64, 0.14], [0.63, 0.7, 0.66]);
        // Conforming web lines are projected onto the curved mask surface.
        const webMat = material(0x2a0e15, 0.25, 0.67);
        allMaterials.push(webMat);
        const curveLine = (points: Three.Vector3[], width = 0.009) => {
          const curve = new T.CatmullRomCurve3(points);
          mesh(new T.TubeGeometry(curve, 64, width, 5, false), webMat, head);
        };
        const surface = (latitude: number, longitude: number) => new T.Vector3(
          0.946 * Math.cos(latitude) * Math.sin(longitude),
          0.035 + 1.302 * Math.sin(latitude),
          0.839 * Math.cos(latitude) * Math.cos(longitude),
        );
        for (let i = 0; i < 16; i++) {
          const longitude = i / 16 * Math.PI * 2;
          curveLine(Array.from({ length: 49 }, (_, n) => surface(-1.53 + n / 48 * 3.06, longitude)));
        }
        for (let i = -4; i <= 4; i++) {
          curveLine(Array.from({ length: 81 }, (_, n) => surface(i * 0.27 + Math.sin(n / 80 * Math.PI * 16) * 0.035, n / 80 * Math.PI * 2)));
        }
        for (const side of [-1, 1]) {
          const eye = part(model, [side * 0.425, 0.32, 0.694], [side * 0.48, 0.15, 0.72]);
          eye.rotation.set(-0.06, side * 0.3, side * 0.28);
          const shape = new T.Shape();
          shape.moveTo(-0.3, 0.2);
          shape.bezierCurveTo(-0.11, 0.19, 0.17, 0.31, 0.34, 0.38);
          shape.bezierCurveTo(0.4, 0.08, 0.18, -0.24, -0.04, -0.2);
          shape.bezierCurveTo(-0.24, -0.15, -0.29, 0.05, -0.3, 0.2);
          const outline = mesh(new T.ExtrudeGeometry(shape, { depth: 0.055, bevelEnabled: true, bevelThickness: 0.025, bevelSize: 0.044, bevelSegments: 4, curveSegments: 30, steps: 1 }), dark, eye);
          if (side < 0) outline.scale.x = -1;
          const eyeWhite = material(0xe9eff2, 0.3, 0.28);
          allMaterials.push(eyeWhite);
          maskLenses.push(eyeWhite);
          const lens = mesh(new T.ShapeGeometry(shape, 32), eyeWhite, eye, 0, 0, 0.087);
          lens.scale.set(side < 0 ? -0.86 : 0.86, 0.86, 1);
          for (let n = 0; n < 4; n++) {
            const notch = box(eye, blackSteel, [0.085, 0.02, 0.02], [side * 0.24, 0.12 - n * 0.054, 0.093]);
            notch.rotation.z = side * 0.4;
          }
        }
        model.rotation.y = -0.14;
        model.scale.setScalar(1.3);
      }

      function cameraModel() {
        model.rotation.y = -0.3;
        const body = part(model, [0, 0.15, 0], [0, 0.1, -0.5]);
        box(body, dark, [2.2, 1.4, 0.84], [0, 0, 0]);
        box(body, rubber, [2.21, 0.89, 0.86], [0, -0.14, 0]);
        box(body, blackSteel, [2.27, 0.22, 0.9], [0, 0.6, 0]);
        box(body, blackSteel, [2.27, 0.15, 0.9], [0, -0.66, 0]);
        box(body, dark, [0.6, 0.33, 0.55], [0, 0.84, 0.08]);
        box(body, silver, [0.28, 0.07, 0.27], [0, 1.035, 0.06]);
        mesh(new T.CylinderGeometry(0.2, 0.2, 0.12, 40), steel, body, -0.75, 0.78, 0);
        mesh(new T.CylinderGeometry(0.105, 0.105, 0.12, 32), red, body, 0.77, 0.77, 0.1);
        const lens = part(model, [0.07, 0.12, 0.65], [0, 0, 0.85]);
        const barrel = mesh(new T.CylinderGeometry(0.59, 0.66, 0.65, 64), dark, lens);
        barrel.rotation.x = Math.PI / 2;
        for (let i = 0; i < 7; i++) ring(lens, i === 5 ? red : blackSteel, 0.602, 0.026, [0, 0, -0.2 + i * 0.078]);
        ring(lens, silver, 0.53, 0.03, [0, 0, 0.35]);
        const glass = new T.MeshPhysicalMaterial({ color: 0x132b3d, metalness: 0.95, roughness: 0.075, clearcoat: 1 });
        allMaterials.push(glass);
        const optics = ball(lens, glass, [0, 0, 0.355], [0.49, 0.49, 0.09]);
        optics.castShadow = false;
        ring(lens, blackSteel, 0.34, 0.02, [0, 0, 0.421]);
        ring(lens, dark, 0.19, 0.035, [0, 0, 0.439]);
        for (const side of [-1, 1]) {
          ring(body, steel, 0.08, 0.021, [side * 1.14, 0.47, 0]);
          screw(body, side * 0.94, 0.722, 0.28);
        }
        const badge = spiderEmblem(body, 0.37, red);
        badge.rotation.x = Math.PI / 2;
        badge.position.set(-0.81, 0.17, 0.435);
        label(body, "DAILY BUGLE", 0.65, 0.16, [-0.49, 0.725, 0]);
        model.scale.setScalar(1.25);
      }

      function cartridge(formula = false) {
        model.rotation.set(0.1, 0, -0.28);
        const glass = new T.MeshPhysicalMaterial({ color: 0xb6d6e3, metalness: 0.15, roughness: 0.1, transparent: true, opacity: 0.22, side: T.DoubleSide, depthWrite: false });
        allMaterials.push(glass);
        const count = formula ? 1 : 3;
        for (let i = 0; i < count; i++) {
          const x = (i - (count - 1) / 2) * 0.84;
          const cylinder = part(model, [x, i === 1 ? 0.14 : 0, 0], [x * 0.65, 0, 0]);
          mesh(new T.CylinderGeometry(0.325, 0.325, 1.86, 48, 1, true), glass, cylinder);
          const fluid = material(formula ? 0xadbcca : 0x7a9ead, 0.3, 0.34);
          allMaterials.push(fluid);
          mesh(new T.CylinderGeometry(0.235, 0.235, 1.44, 40), fluid, cylinder, 0, -0.09, 0);
          for (const side of [-1, 1]) {
            const cap = part(cylinder, [0, side * 0.95, 0], [0, side * 0.55, 0]);
            mesh(new T.CylinderGeometry(0.37, 0.37, 0.22, 48), blackSteel, cap);
            mesh(new T.CylinderGeometry(0.33, 0.33, 0.11, 48), red, cap, 0, side * 0.12, 0);
            ring(cap, steel, 0.326, 0.02, [0, side * 0.18, 0], true);
            mesh(new T.CylinderGeometry(0.11, 0.11, 0.19, 24), gold, cap, 0, side * 0.22, 0);
          }
          for (let j = 0; j < 4; j++) {
            const angle = j / 4 * Math.PI * 2;
            rod(cylinder, steel, [Math.cos(angle) * 0.32, -0.84, Math.sin(angle) * 0.32], [Math.cos(angle) * 0.32, 0.84, Math.sin(angle) * 0.32], 0.026);
          }
          for (let j = 0; j < 8; j++) {
            box(cylinder, silver, [j % 2 === 0 ? 0.12 : 0.065, 0.018, 0.012], [-0.08, -0.57 + j * 0.16, 0.326]);
          }
          if (formula) {
            const helix = Array.from({ length: 100 }, (_, n) => new T.Vector3(Math.cos(n / 99 * Math.PI * 7) * 0.16, -0.65 + n / 99 * 1.3, Math.sin(n / 99 * Math.PI * 7) * 0.16));
            mesh(new T.TubeGeometry(new T.CatmullRomCurve3(helix), 120, 0.018, 7, false), glow, cylinder);
          }
        }
        if (!formula) {
          const holder = part(model, [0, -0.47, -0.2], [0, -0.1, -0.65]);
          box(holder, dark, [2.55, 0.44, 0.51], [0, 0, 0]);
          label(holder, "PARKER / SYNTHETIC", 1.4, 0.19, [0, 0.226, 0]);
        }
        model.scale.setScalar(formula ? 1.9 : 1.25);
      }

      function drone() {
        const body = part(model, [0, 0.15, 0], [0, 0.35, 0]);
        ball(body, dark, [0, 0, 0], [0.63, 0.23, 0.84]);
        const shell = part(body, [0, 0.13, 0], [0, 0.55, 0]);
        ball(shell, red, [0, 0, 0], [0.57, 0.21, 0.76]);
        const symbol = spiderEmblem(shell, 0.9, dark);
        symbol.position.y = 0.206;
        for (const x of [-1, 1]) {
          for (const z of [-1, 1]) {
            const arm = part(model, [x * 0.41, 0.05, z * 0.51], [x * 0.48, 0, z * 0.48]);
            rod(arm, blackSteel, [0, 0, 0], [x * 0.71, 0, z * 0.62], 0.091, 0.065);
            const rotor = new T.Group();
            rotor.position.set(x * 0.85, 0, z * 0.72);
            arm.add(rotor);
            ring(rotor, dark, 0.61, 0.041, [0, 0.05, 0], true);
            ring(rotor, red, 0.6, 0.015, [0, 0.087, 0], true);
            mesh(new T.CylinderGeometry(0.11, 0.12, 0.22, 24), steel, rotor);
            for (let j = 0; j < 3; j++) {
              const blade = ball(rotor, dark, [0, 0.13, 0], [0.5, 0.012, 0.062]);
              blade.rotation.y = j * Math.PI / 3;
            }
            mesh(new T.CylinderGeometry(0.062, 0.08, 0.07, 24), red, rotor, 0, 0.16, 0);
            rod(arm, steel, [0.1 * x, 0, 0.2 * z], [0.2 * x, -0.56, 0.35 * z], 0.035, 0.018);
          }
        }
        const optics = part(model, [0, -0.15, 0.68], [0, -0.3, 0.46]);
        ball(optics, dark, [0, 0, 0], [0.25, 0.22, 0.24]);
        ring(optics, steel, 0.134, 0.02, [0, 0, 0.206]);
        ball(optics, glow, [0, 0, 0.226], [0.105, 0.105, 0.019]);
        model.rotation.y = -0.22;
      }

      function organicWeb() {
        const silk = new T.MeshStandardMaterial({
          color: 0xe7edf0, metalness: 0.35, roughness: 0.34,
          emissive: 0x283a46, emissiveIntensity: 0.35,
        });
        allMaterials.push(silk);
        const radius = 1.65;
        const spokeCount = 16;
        const surface = (r: number, angle: number) => new T.Vector3(
          Math.cos(angle) * r,
          Math.sin(angle) * r,
          0.37 * (1 - r / radius) + Math.sin(angle * 3) * r * 0.045,
        );
        const strand = (parent: Three.Object3D, points: Three.Vector3[], thickness: number, closed = false) => {
          const curve = new T.CatmullRomCurve3(points, closed);
          mesh(new T.TubeGeometry(curve, closed ? 192 : 36, thickness, 7, closed), silk, parent);
        };
        for (let i = 0; i < spokeCount; i++) {
          const angle = i / spokeCount * Math.PI * 2;
          const radial = part(model, [0, 0, 0], [Math.cos(angle) * 0.2, Math.sin(angle) * 0.2, -0.1]);
          strand(radial, Array.from({ length: 12 }, (_, n) => surface(n / 11 * (radius + 0.17), angle)), 0.014);
          ball(radial, silk, [Math.cos(angle) * radius, Math.sin(angle) * radius, Math.sin(angle * 3) * radius * 0.045], [0.025, 0.025, 0.025]);
        }
        for (let i = 1; i <= 8; i++) {
          const r = i / 8 * radius;
          const spiral = part(model, [0, 0, 0], [0, 0, i * 0.075]);
          const points = Array.from({ length: 160 }, (_, n) => {
            const angle = n / 160 * Math.PI * 2;
            // Silk bows inward between the stronger radial support threads.
            const scallop = 1 - 0.048 * (1 - Math.cos(angle * spokeCount));
            return surface(r * scallop, angle);
          });
          strand(spiral, points, i === 8 ? 0.012 : 0.009, true);
        }
        ball(model, silk, [0, 0, 0.37], [0.055, 0.055, 0.035]);
        model.rotation.set(-0.13, -0.25, 0.12);
        model.scale.setScalar(1.16);
      }

      switch (props.kind) {
        case "tracker": tracker(); break;
        case "shooter": shooter(); break;
        case "mask": mask(); break;
        case "camera": cameraModel(); break;
        case "cartridge": cartridge(); break;
        case "web": organicWeb(); break;
        case "drone": drone(); break;
      }

      // Floating exhibit pedestal: fine elliptical rings stay quiet behind the object.
      const stageMat = new T.MeshBasicMaterial({ color: 0x535b66, transparent: true, opacity: 0.17, depthWrite: false });
      const stageAccent = new T.MeshBasicMaterial({ color: 0x852735, transparent: true, opacity: 0.26, depthWrite: false });
      allMaterials.push(stageMat, stageAccent);
      const floor = new T.Group();
      floor.position.y = props.kind === "mask" || props.kind === "web" ? -1.9 : -1.28;
      scene.add(floor);
      ring(floor, stageMat, 2.48, 0.006, [0, 0, 0], true);
      ring(floor, stageMat, 2.61, 0.003, [0, 0, 0], true);
      const arc = mesh(new T.TorusGeometry(2.48, 0.012, 5, 54, Math.PI * 0.42), stageAccent, floor);
      arc.rotation.x = Math.PI / 2;
      arc.rotation.z = 0.3;
      for (let i = 0; i < 40; i++) {
        const angle = i / 40 * Math.PI * 2;
        const mark = box(floor, stageMat, [0.009, 0.003, i % 5 === 0 ? 0.11 : 0.045], [Math.cos(angle) * 2.55, 0, Math.sin(angle) * 2.55]);
        mark.rotation.y = -angle + Math.PI / 2;
        mark.castShadow = false;
      }
      const shadowMat = new T.ShadowMaterial({ opacity: 0.24 });
      allMaterials.push(shadowMat);
      const shadow = mesh(new T.CircleGeometry(3, 64), shadowMat, floor, 0, -0.015, 0);
      shadow.rotation.x = -Math.PI / 2;
      shadow.castShadow = false;

      const resize = () => {
        if (cancelled || !host) return;
        const width = host.clientWidth || 640;
        const height = host.clientHeight || 540;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.fov = width < 520 ? 43 : 35;
        camera.updateProjectionMatrix();
      };
      const observer = new ResizeObserver(resize);
      observer.observe(host);
      cleanup.push(() => observer.disconnect());
      resize();

      const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      let reduceMotion = motionQuery.matches;
      const updateMotion = () => {
        reduceMotion = motionQuery.matches;
        controls.enableDamping = !reduceMotion;
      };
      updateMotion();
      motionQuery.addEventListener("change", updateMotion);
      cleanup.push(() => motionQuery.removeEventListener("change", updateMotion));
      let visible = document.visibilityState !== "hidden";
      const visibility = () => { visible = document.visibilityState !== "hidden"; };
      document.addEventListener("visibilitychange", visibility);
      cleanup.push(() => document.removeEventListener("visibilitychange", visibility));
      let lost = false;
      const contextLost = (event: Event) => {
        event.preventDefault();
        lost = true;
        cancelAnimationFrame(frame);
        renderer.domElement.style.visibility = "hidden";
        if (!cancelled) { setFallback(true); ready(); }
      };
      renderer.domElement.addEventListener("webglcontextlost", contextLost);
      cleanup.push(() => renderer.domElement.removeEventListener("webglcontextlost", contextLost));

      let lastTime = 0;
      let elapsed = 0;
      let explosion = 0;
      let previousZoom = current.current.zoom;
      let previousReset = current.current.resetKey;
      let previousAccent = "";
      let zoomTarget = start.length() / Math.max(0.7, previousZoom);
      let zoomPending = true;
      let interacting = false;
      let pausedUntil = 0;
      let keyboardOrbitPending = false;
      const keyboardOrbit = new T.Spherical();
      const cameraOrbit = new T.Spherical();
      const orbitOffset = new T.Vector3();
      const onControlStart = () => {
        interacting = true;
        zoomPending = false;
        keyboardOrbitPending = false;
        resetPending = false;
        rotationReset = false;
      };
      const onControlEnd = () => {
        interacting = false;
        pausedUntil = performance.now() + 1500;
      };
      controls.addEventListener("start", onControlStart);
      controls.addEventListener("end", onControlEnd);
      cleanup.push(() => {
        controls.removeEventListener("start", onControlStart);
        controls.removeEventListener("end", onControlEnd);
      });
      const viewVector = new T.Vector3();
      const initialQuaternion = camera.quaternion.clone();
      let resetPending = false;
      let rotationReset = false;
      const resetDirection = start.clone().normalize();
      const resetGoal = new T.Vector3();
      const onKeyDown = (event: KeyboardEvent) => {
        if (lost || event.altKey || event.ctrlKey || event.metaKey) return;
        if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
        event.preventDefault();
        if (!keyboardOrbitPending) {
          keyboardOrbit.setFromVector3(orbitOffset.copy(camera.position).sub(controls.target));
        }
        const step = event.shiftKey ? 0.24 : 0.12;
        if (event.key === "ArrowLeft") keyboardOrbit.theta -= step;
        if (event.key === "ArrowRight") keyboardOrbit.theta += step;
        if (event.key === "ArrowUp") keyboardOrbit.phi -= step;
        if (event.key === "ArrowDown") keyboardOrbit.phi += step;
        keyboardOrbit.phi = T.MathUtils.clamp(keyboardOrbit.phi, 0.05, controls.maxPolarAngle);
        keyboardOrbitPending = true;
        zoomPending = false;
        resetPending = false;
        rotationReset = false;
        pausedUntil = performance.now() + 1500;
      };
      const focusViewer = () => host.focus({ preventScroll: true });
      host.addEventListener("keydown", onKeyDown);
      renderer.domElement.addEventListener("pointerdown", focusViewer);
      cleanup.push(() => {
        host.removeEventListener("keydown", onKeyDown);
        renderer.domElement.removeEventListener("pointerdown", focusViewer);
      });

      function animate(time: number) {
        if (cancelled || lost) return;
        frame = requestAnimationFrame(animate);
        const delta = Math.min((time - lastTime) / 1000 || 0, 0.04);
        lastTime = time;
        if (!visible) return;
        elapsed += delta;
        const state = current.current;
        const smoothing = reduceMotion ? 1 : 1 - Math.exp(-delta * 7);
        if (state.accent !== previousAccent) {
          previousAccent = state.accent;
          rim.color.set(state.accent);
          stageAccent.color.set(state.accent);
          maskLenses.forEach((lens) => lens.color.set(state.accent.toLowerCase() === "#ed6848" ? 0xc9a566 : 0xe9eff2));
        }
        if (state.zoom !== previousZoom) {
          previousZoom = state.zoom;
          zoomTarget = T.MathUtils.clamp(start.length() / Math.max(0.5, state.zoom), 3.1, 12);
          zoomPending = true;
        }
        if (state.resetKey !== previousReset) {
          previousReset = state.resetKey;
          zoomTarget = T.MathUtils.clamp(start.length() / Math.max(0.5, state.zoom), 3.1, 12);
          zoomPending = true;
          resetPending = true;
          keyboardOrbitPending = false;
          rotationReset = true;
          exhibit.rotation.y = T.MathUtils.euclideanModulo(exhibit.rotation.y + Math.PI, Math.PI * 2) - Math.PI;
          controls.target.set(0, 0.02, 0);
        }
        if (resetPending && !interacting) {
          viewVector.copy(camera.position).sub(controls.target);
          resetGoal.copy(resetDirection).multiplyScalar(zoomTarget).add(controls.target);
          camera.position.lerp(resetGoal, smoothing);
          camera.quaternion.slerp(initialQuaternion, smoothing);
          if (camera.position.distanceTo(resetGoal) < 0.008) resetPending = false;
        } else if (zoomPending && !interacting) {
          viewVector.copy(camera.position).sub(controls.target);
          const distance = viewVector.length();
          const next = T.MathUtils.lerp(distance, zoomTarget, smoothing);
          camera.position.copy(viewVector.normalize().multiplyScalar(next).add(controls.target));
          if (Math.abs(next - zoomTarget) < 0.008) zoomPending = false;
        }
        if (keyboardOrbitPending && !interacting) {
          cameraOrbit.setFromVector3(orbitOffset.copy(camera.position).sub(controls.target));
          const thetaDifference = T.MathUtils.euclideanModulo(keyboardOrbit.theta - cameraOrbit.theta + Math.PI, Math.PI * 2) - Math.PI;
          cameraOrbit.theta += thetaDifference * smoothing;
          cameraOrbit.phi = T.MathUtils.lerp(cameraOrbit.phi, keyboardOrbit.phi, smoothing);
          camera.position.copy(orbitOffset.setFromSpherical(cameraOrbit).add(controls.target));
          if (Math.abs(thetaDifference) * (1 - smoothing) + Math.abs(cameraOrbit.phi - keyboardOrbit.phi) < 0.002) {
            keyboardOrbitPending = false;
          }
        }
        explosion = T.MathUtils.lerp(explosion, state.exploded ? 1 : 0, smoothing);
        for (const item of parts) {
          item.object.position.copy(item.base).addScaledVector(item.offset, explosion);
        }
        if (rotationReset) {
          exhibit.rotation.y = T.MathUtils.lerp(exhibit.rotation.y, 0, smoothing);
          if (Math.abs(exhibit.rotation.y) < 0.005) rotationReset = false;
        }
        if (!reduceMotion) {
          exhibit.position.y = Math.sin(elapsed * 0.7) * 0.038;
          if (state.autoRotate && !interacting && time > pausedUntil && !resetPending && !rotationReset && !keyboardOrbitPending) {
            exhibit.rotation.y += delta * 0.07;
          }
        }
        redGlow.emissiveIntensity = reduceMotion ? 1.6 : 1.65 + Math.sin(elapsed * 1.8) * 0.35;
        controls.update();
        renderer.render(scene, camera);
      }

      if (cancelled) { disposeScene(); return; }
      setFallback(false);
      renderer.render(scene, camera);
      ready();
      frame = requestAnimationFrame(animate);
    }

    initialize().catch(() => {
      if (cancelled) return;
      disposeScene?.();
      setFallback(true);
      ready();
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      disposeScene?.();
    };
  }, [props.kind]);

  return (
    <div
      ref={hostRef}
      role={fallback ? "img" : "application"}
      tabIndex={fallback ? -1 : 0}
      aria-label={fallback ? `${names[props.kind]}. 3D preview unavailable on this device.` : `โมเดล 3D ${names[props.kind]} ใช้ปุ่มลูกศรเพื่อหมุน หรือใช้เมาส์ลาก เลื่อนหรือจีบนิ้วเพื่อซูม ปุ่มซูมและรีเซ็ตอยู่ถัดจากโมเดล`}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{ width: "100%", height: "100%", position: "relative", cursor: fallback ? "default" : "grab", outline: focused ? "2px solid #f13946" : "none", outlineOffset: -8 }}
    >
      {fallback && (
        <div
          role="status"
          style={{
            position: "absolute", inset: 0, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", color: "#e1e3e8", gap: 16,
            padding: 32, textAlign: "center", background: "radial-gradient(ellipse, #38131d 0%, transparent 65%)",
          }}
        >
          <div style={{ width: 82, height: 110, borderRadius: "48% 48% 44% 44%", background: "linear-gradient(125deg,#f14253,#9e1128 65%,#360d17)", boxShadow: "inset -9px -8px 18px #270913, 0 0 70px #ba203326", border: "1px solid #fb697060", transform: "rotate(-18deg)", position: "relative" }}>
            <div style={{ position: "absolute", width: 3, height: 100, top: 4, left: 39, background: "#260a12", borderRadius: 3 }} />
            <div style={{ position: "absolute", width: 16, height: 16, top: 29, left: 32, borderRadius: "50%", background: "#ffd2d8", boxShadow: "0 0 20px #ff3657" }} />
          </div>
          <strong style={{ fontFamily: "monospace", fontSize: 14, letterSpacing: ".12em", textTransform: "uppercase" }}>{names[props.kind]}</strong>
          <span style={{ maxWidth: 260, fontSize: 12, lineHeight: 1.7, color: "#92959f" }}>3D preview is unavailable on this device. You can still explore all specifications below.</span>
        </div>
      )}
    </div>
  );
}
