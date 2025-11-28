import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, useScroll, Float } from '@react-three/drei';
import * as THREE from 'three';

// --- Materials ---

// Phase 1: Blank White (The "Canvas")
const BlankMaterial = new THREE.MeshStandardMaterial({
    color: '#ffffff',
    roughness: 0.9,
    metalness: 0.0,
});

// Phase 2: Designed (The "Result")
const DesignedFloorMaterial = new THREE.MeshStandardMaterial({
    color: '#e0e0e0', // Concrete
    roughness: 0.5,
    metalness: 0.1,
});

const DesignedWallMaterial = new THREE.MeshStandardMaterial({
    color: '#f5f5f5', // Off-white
    roughness: 0.2,
    metalness: 0.1,
});

const FurnitureMaterial = new THREE.MeshStandardMaterial({
    color: '#2a2a2a', // Carbon
    roughness: 0.8,
});

const AccentMaterial = new THREE.MeshStandardMaterial({
    color: '#ff4d00', // Signal Orange
    roughness: 0.4,
    emissive: '#ff4d00',
    emissiveIntensity: 0.2,
});

const GlassMaterial = new THREE.MeshPhysicalMaterial({
    color: '#aaddff',
    metalness: 0.1,
    roughness: 0.05,
    transmission: 0.9,
    thickness: 0.5,
    transparent: true,
    opacity: 0.5,
});

// --- Components ---

const Furniture = ({ type, position, rotation = [0, 0, 0], scale = 1 }) => {
    const mesh = useRef();
    const scroll = useScroll();

    useFrame(() => {
        // Furniture appears as you scroll
        const r = scroll.range(0, 1);
        // Smooth step for visibility
        const visible = r > 0.2;

        if (mesh.current) {
            // Scale up from 0 when scrolling starts
            const s = THREE.MathUtils.lerp(0, scale, r * 1.5);
            mesh.current.scale.setScalar(Math.min(s, scale));
        }
    });

    // Procedural furniture shapes
    if (type === 'bed') {
        return (
            <group position={position} rotation={rotation} ref={mesh}>
                <Box args={[1.6, 0.4, 2]} position={[0, 0.2, 0]} material={FurnitureMaterial} castShadow />
                <Box args={[1.6, 0.1, 0.5]} position={[0, 0.45, -0.75]} material={AccentMaterial} /> {/* Pillows */}
            </group>
        );
    }

    if (type === 'sofa') {
        return (
            <group position={position} rotation={rotation} ref={mesh}>
                <Box args={[2.2, 0.4, 0.8]} position={[0, 0.2, 0]} material={FurnitureMaterial} castShadow />
                <Box args={[2.2, 0.4, 0.2]} position={[0, 0.6, -0.3]} material={FurnitureMaterial} castShadow />
                <Box args={[0.2, 0.3, 0.8]} position={[-1, 0.55, 0]} material={FurnitureMaterial} />
                <Box args={[0.2, 0.3, 0.8]} position={[1, 0.55, 0]} material={FurnitureMaterial} />
            </group>
        );
    }

    if (type === 'table') {
        return (
            <group position={position} rotation={rotation} ref={mesh}>
                <Box args={[1.2, 0.05, 0.8]} position={[0, 0.7, 0]} material={AccentMaterial} castShadow />
                <Box args={[0.1, 0.7, 0.1]} position={[-0.5, 0.35, -0.3]} material={FurnitureMaterial} />
                <Box args={[0.1, 0.7, 0.1]} position={[0.5, 0.35, -0.3]} material={FurnitureMaterial} />
                <Box args={[0.1, 0.7, 0.1]} position={[-0.5, 0.35, 0.3]} material={FurnitureMaterial} />
                <Box args={[0.1, 0.7, 0.1]} position={[0.5, 0.35, 0.3]} material={FurnitureMaterial} />
            </group>
        );
    }

    if (type === 'kitchen_island') {
        return (
            <group position={position} rotation={rotation} ref={mesh}>
                <Box args={[2, 0.9, 0.8]} position={[0, 0.45, 0]} material={FurnitureMaterial} castShadow />
                <Box args={[2, 0.05, 0.8]} position={[0, 0.92, 0]} material={DesignedWallMaterial} />
            </group>
        );
    }

    return null;
};

const Room = ({ position, size, delay = 0, children }) => {
    const group = useRef();
    const floorRef = useRef();
    const wallsRef = useRef();
    const scroll = useScroll();

    // 1. Assembly on Load (Time-based)
    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        const start = delay;

        if (t > start) {
            const progress = Math.min(1, (t - start) * 1.5);
            const ease = 1 - Math.pow(1 - progress, 3); // Ease out cubic

            group.current.scale.y = ease;
            group.current.position.y = (size[1] / 2) * ease;
        } else {
            group.current.scale.y = 0;
        }

        // 2. Material Transition on Scroll
        const r = scroll.range(0, 1); // 0 to 1 based on scroll

        // Interpolate colors/materials if needed, or just rely on the furniture appearing
        // to change the look. For now, let's keep the walls clean white/grey.
    });

    const wallThickness = 0.2;
    const [width, height, depth] = size;

    return (
        <group position={[position[0], 0, position[2]]}>
            <group ref={group}>
                {/* Floor */}
                <Box
                    ref={floorRef}
                    args={[width, 0.1, depth]}
                    position={[0, -height / 2 + 0.05, 0]}
                    material={DesignedFloorMaterial}
                    receiveShadow
                />

                {/* Walls Group */}
                <group ref={wallsRef}>
                    {/* Back Wall */}
                    <Box
                        args={[width, height, wallThickness]}
                        position={[0, 0, -depth / 2 + wallThickness / 2]}
                        material={DesignedWallMaterial}
                        castShadow
                        receiveShadow
                    />

                    {/* Front Wall (Glass/Partial) */}
                    <Box
                        args={[width * 0.3, height, wallThickness]}
                        position={[-width / 2 + (width * 0.15), 0, depth / 2 - wallThickness / 2]}
                        material={DesignedWallMaterial}
                        castShadow
                        receiveShadow
                    />
                    <Box
                        args={[width * 0.7, height * 0.8, wallThickness / 2]}
                        position={[width * 0.15, -height * 0.1, depth / 2 - wallThickness / 2]}
                        material={GlassMaterial}
                    />

                    {/* Left Wall */}
                    <Box
                        args={[wallThickness, height, depth]}
                        position={[-width / 2 + wallThickness / 2, 0, 0]}
                        material={DesignedWallMaterial}
                        castShadow
                        receiveShadow
                    />

                    {/* Right Wall */}
                    <Box
                        args={[wallThickness, height, depth]}
                        position={[width / 2 - wallThickness / 2, 0, 0]}
                        material={DesignedWallMaterial}
                        castShadow
                        receiveShadow
                    />
                </group>

                {/* Furniture Container (scales independently of assembly if needed, but here it rides with the room) */}
                <group position={[0, -height / 2, 0]}>
                    {children}
                </group>
            </group>
        </group>
    );
};

const FloorPlan = () => {
    const group = useRef();
    const scroll = useScroll();

    // Rotate based on scroll
    useFrame(() => {
        if (group.current) {
            const r = scroll.range(0, 1);
            // Start at slight angle, rotate to show full layout
            group.current.rotation.y = 0.5 + (r * 1.5);
            // Also tilt slightly down as we scroll to see inside better
            group.current.rotation.x = r * 0.2;
        }
    });

    return (
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
            <group ref={group} position={[0, -1, 0]} rotation={[0, 0.5, 0]}>
                {/* Living Room */}
                <Room position={[0, 0, 0]} size={[4, 2.5, 5]} delay={0.5}>
                    <Furniture type="sofa" position={[0, 0.2, -1.5]} />
                    <Furniture type="table" position={[0, 0, 1]} />
                </Room>

                {/* Bedroom */}
                <Room position={[-3.5, 0, -1]} size={[3, 2.5, 3]} delay={0.8}>
                    <Furniture type="bed" position={[0, 0.2, 0]} rotation={[0, Math.PI / 2, 0]} />
                </Room>

                {/* Kitchen */}
                <Room position={[3.5, 0, -0.5]} size={[3, 2.5, 4]} delay={1.1}>
                    <Furniture type="kitchen_island" position={[0, 0, 0]} />
                </Room>

                {/* Bathroom */}
                <Room position={[-3.5, 0, 2]} size={[3, 2.5, 3]} delay={1.4}>
                    {/* Simple bath block */}
                    <Box args={[1, 0.5, 2]} position={[-0.8, -1, 0]} material={BlankMaterial} />
                </Room>

                {/* Balcony */}
                <mesh position={[0, -1.2, 4]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                    <planeGeometry args={[4, 3]} />
                    <meshStandardMaterial color="#d0d0d0" transparent opacity={0.8} />
                </mesh>
            </group>
        </Float>
    );
};

export default FloorPlan;
