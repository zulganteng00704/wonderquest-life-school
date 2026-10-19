import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, Lightformer, RoundedBox } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const COLORS = ["#38bdf8", "#fbbf24", "#34d399", "#fb7185", "#c084fc"];

function Piece({ kind, color, pos, speed }: { kind: number; color: string; pos: [number, number, number]; speed: number }) {
  const mat = <meshStandardMaterial color={color} roughness={0.3} metalness={0.05} />;
  return (
    <Float speed={speed} rotationIntensity={1.4} floatIntensity={2} position={pos}>
      {kind === 0 && (
        <group>
          {Array.from({ length: 10 }).map((_, i) => (
            <RoundedBox key={i} args={[0.4, 0.4, 0.4]} radius={0.06} position={[0, (i - 4.5) * 0.41, 0]}>{mat}</RoundedBox>
          ))}
        </group>
      )}
      {kind === 1 && <RoundedBox args={[0.7, 0.7, 0.7]} radius={0.12}>{mat}</RoundedBox>}
      {kind === 2 && (
        <mesh><torusGeometry args={[0.55, 0.22, 24, 48]} />{mat}</mesh>
      )}
      {kind === 3 && (
        <mesh><icosahedronGeometry args={[0.6, 0]} /><meshStandardMaterial color={color} roughness={0.4} flatShading /></mesh>
      )}
    </Float>
  );
}

function Drift({ children }: { children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (!ref.current) return;
    ref.current.rotation.y = s.pointer.x * 0.15 + s.clock.elapsedTime * 0.02;
    ref.current.rotation.x = -s.pointer.y * 0.08;
  });
  return <group ref={ref}>{children}</group>;
}

export default function Background3D({ count = 22 }: { count?: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        kind: i % 4,
        color: COLORS[i % COLORS.length],
        pos: [(Math.random() - 0.5) * 22, (Math.random() - 0.5) * 12, -Math.random() * 10 - 2] as [number, number, number],
        speed: 1 + Math.random() * 1.5,
      })),
    [count],
  );
  return (
    <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 10], fov: 50 }} gl={{ alpha: true }}>
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 8, 5]} intensity={1.4} />
      <Environment resolution={64}>
        <Lightformer intensity={2} position={[0, 5, 0]} scale={[10, 10, 1]} />
        <Lightformer intensity={1} color="#bde0ff" position={[-5, 1, -1]} rotation-y={Math.PI / 2} scale={[20, 1, 1]} />
      </Environment>
      <fog attach="fog" args={["#e0f2fe", 8, 22]} />
      <Drift>
        {pieces.map((p, i) => <Piece key={i} {...p} />)}
      </Drift>
    </Canvas>
  );
}
