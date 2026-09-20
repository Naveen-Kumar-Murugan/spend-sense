import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { ComponentType } from 'react';

function Core() {
  const mesh = useRef<THREE.Mesh>(null);
  const wire = useRef<THREE.Mesh>(null);
  const glow = useRef<THREE.Mesh>(null);
  useFrame(({ clock, pointer }) => {
    const t = clock.getElapsedTime();
    const px = pointer.x * 0.35;
    const py = pointer.y * 0.25;
    if (mesh.current) {
      mesh.current.rotation.y = t * 0.12 + px;
      mesh.current.rotation.x = Math.sin(t * 0.25) * 0.18 - py;
    }
    if (wire.current) {
      wire.current.rotation.y = -t * 0.07 + px * 1.4;
      wire.current.rotation.z = Math.sin(t * 0.18) * 0.2;
    }
    if (glow.current) {
      const s = 1 + Math.sin(t * 1.4) * 0.03;
      glow.current.scale.set(s, s, s);
    }
  });
  return (
    <group>
      <mesh ref={glow} scale={1.02}>
        <icosahedronGeometry args={[1.32, 3]} />
        <meshBasicMaterial color="#6366F1" transparent opacity={0.14} side={THREE.BackSide} depthWrite={false} />
      </mesh>
      <mesh ref={mesh}>
        <icosahedronGeometry args={[1.05, 4]} />
        <meshStandardMaterial color="#0B0F22" metalness={0.9} roughness={0.22} />
      </mesh>
      <mesh ref={wire} scale={1.005}>
        <icosahedronGeometry args={[1.05, 2]} />
        <meshBasicMaterial color="#818CF8" wireframe transparent opacity={0.28} depthWrite={false} />
      </mesh>
    </group>
  );
}

function Rings() {
  const r1 = useRef<THREE.Mesh>(null);
  const r2 = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (r1.current) {
      r1.current.rotation.x = Math.PI / 2.35 + Math.sin(t * 0.2) * 0.08;
      r1.current.rotation.y = t * 0.1;
    }
    if (r2.current) {
      r2.current.rotation.x = Math.PI / 1.85 + Math.cos(t * 0.16) * 0.08;
      r2.current.rotation.y = -t * 0.07;
    }
  });
  return (
    <group>
      <mesh ref={r1}>
        <torusGeometry args={[1.78, 0.012, 12, 180]} />
        <meshBasicMaterial color="#22D3EE" transparent opacity={0.5} depthWrite={false} />
      </mesh>
      <mesh ref={r2}>
        <torusGeometry args={[2.12, 0.01, 12, 200]} />
        <meshBasicMaterial color="#A78BFA" transparent opacity={0.34} depthWrite={false} />
      </mesh>
    </group>
  );
}

function Particles({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useRef<Float32Array | null>(null);
  if (!positions.current) {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      const r = 1.9 + Math.random() * 2.4;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.7;
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    positions.current = arr;
  }
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 0.03;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions.current, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#93A0FF" size={0.028} transparent opacity={0.75} sizeAttenuation depthWrite={false} />
    </points>
  );
}

function Orbiters() {
  const g = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (g.current) g.current.rotation.y = clock.getElapsedTime() * 0.22;
  });
  return (
    <group ref={g}>
      {[0, 1, 2].map((i) => {
        const a = (i / 3) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 1.78, Math.sin(a * 1.7) * 0.35, Math.sin(a) * 1.78]}>
            <sphereGeometry args={[0.045, 16, 16]} />
            <meshBasicMaterial color={i === 1 ? '#22D3EE' : '#C7D2FE'} />
          </mesh>
        );
      })}
    </group>
  );
}

export function OrbScene({ Canvas }: { Canvas: ComponentType<any> }) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0.4, 5.2], fov: 42 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      aria-hidden
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[4, 5, 6]} intensity={1.4} color="#C7D2FE" />
      <directionalLight position={[-5, -2, 3]} intensity={0.5} color="#22D3EE" />
      <pointLight position={[0, 0, 0]} intensity={6} distance={9} color="#6366F1" />
      <group>
        <Core />
        <Rings />
        <Particles count={220} />
        <Orbiters />
      </group>
    </Canvas>
  );
}
