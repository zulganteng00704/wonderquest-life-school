import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer, OrbitControls, RoundedBox, ContactShadows } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const ROD = "#38bdf8";
const UNIT = "#fbbf24";
const PLATE = "#34d399";
const C = 0.42; // cube size
const GAP = 0.05;

function DropIn({ delay, children, position }: { delay: number; children: React.ReactNode; position: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null);
  const t = useRef(-delay);
  useFrame((_, d) => {
    t.current += Math.min(d, 0.05);
    const g = ref.current;
    if (!g) return;
    const k = Math.min(1, Math.max(0, t.current / 0.45));
    const e = 1 - Math.pow(1 - k, 3);
    g.position.y = position[1] + (1 - e) * 4;
    g.scale.setScalar(Math.max(0.001, e));
  });
  return <group ref={ref} position={position} scale={0.001}>{children}</group>;
}

function Rod() {
  return (
    <group>
      {Array.from({ length: 10 }).map((_, i) => (
        <RoundedBox key={i} args={[C, C, C]} radius={0.06} smoothness={3} position={[0, i * (C + 0.01) - 4.5 * (C + 0.01), 0]} castShadow>
          <meshStandardMaterial color={ROD} roughness={0.35} metalness={0.05} />
        </RoundedBox>
      ))}
    </group>
  );
}

function Blocks({ n }: { n: number }) {
  const group = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (group.current) group.current.rotation.y = Math.sin(s.clock.elapsedTime * 0.5) * 0.25;
  });

  const layout = useMemo(() => {
    if (n === 100) return null;
    const tens = Math.floor(n / 10);
    const ones = n % 10;
    const rodW = C + GAP * 3;
    const unitCols = Math.min(5, ones || 1);
    const unitsW = ones ? unitCols * (C + GAP) + 0.4 : 0;
    const total = tens * rodW + unitsW;
    const start = -total / 2 + rodW / 2;
    return { tens, ones, rodW, start, unitStart: start + tens * rodW + 0.2 };
  }, [n]);

  if (n === 100) {
    return (
      <group ref={group} rotation={[0.9, 0, 0]}>
        {Array.from({ length: 10 }).map((_, r) => (
          <DropIn key={r} delay={r * 0.08} position={[(r - 4.5) * (C + 0.01), 0, 0]}>
            <group rotation={[0, 0, 0]}>
              {Array.from({ length: 10 }).map((_, i) => (
                <RoundedBox key={i} args={[C, C, C * 0.6]} radius={0.05} smoothness={2} position={[0, (i - 4.5) * (C + 0.01), 0]} castShadow>
                  <meshStandardMaterial color={PLATE} roughness={0.35} />
                </RoundedBox>
              ))}
            </group>
          </DropIn>
        ))}
      </group>
    );
  }

  const { tens, ones, rodW, start, unitStart } = layout!;
  return (
    <group ref={group}>
      {Array.from({ length: tens }).map((_, i) => (
        <DropIn key={`r${i}`} delay={i * 0.07} position={[start + i * rodW, 0, 0]}>
          <Rod />
        </DropIn>
      ))}
      {Array.from({ length: ones }).map((_, i) => {
        const col = i % 5;
        const row = Math.floor(i / 5);
        return (
          <DropIn key={`u${i}`} delay={tens * 0.07 + i * 0.06} position={[unitStart + col * (C + GAP), -1.6 + row * (C + GAP), 0]}>
            <RoundedBox args={[C, C, C]} radius={0.07} smoothness={3} castShadow>
              <meshStandardMaterial color={UNIT} roughness={0.3} />
            </RoundedBox>
          </DropIn>
        );
      })}
    </group>
  );
}

export default function Dienes3D({ n }: { n: number }) {
  const tens = Math.floor(n / 10);
  const width = n === 100 ? 5 : tens * 0.57 + 3;
  const z = Math.max(5.5, width * 1.15);
  return (
    <Canvas shadows dpr={[1, 1.75]} camera={{ position: [0, 0.6, z], fov: 45 }} gl={{ alpha: true, antialias: true }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[4, 6, 5]} intensity={1.6} castShadow shadow-mapSize={[1024, 1024]} />
      <Environment resolution={64}>
        <Lightformer intensity={2} position={[0, 5, 0]} scale={[10, 10, 1]} />
        <Lightformer intensity={1} color="#bde0ff" position={[-5, 1, -1]} rotation-y={Math.PI / 2} scale={[20, 1, 1]} />
        <Lightformer intensity={1} color="#ffe2b8" position={[5, 1, 1]} rotation-y={-Math.PI / 2} scale={[20, 1, 1]} />
      </Environment>
      <Blocks key={n} n={n} />
      <ContactShadows position={[0, -2.4, 0]} opacity={0.35} scale={14} blur={2.5} far={4} />
      <OrbitControls enablePan={false} enableZoom={false} minPolarAngle={Math.PI / 3} maxPolarAngle={Math.PI / 1.8} />
    </Canvas>
  );
}
