import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Float } from '@react-three/drei';
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

const Furniture = ({ type, position, rotation = [0, 0, 0], scale = 1, scrollProgress }) => {
    const mesh = useRef();

    useFrame(() => {
        const r = scrollProgress ? scrollProgress.get() : 0;

        if (mesh.current) {
            // Intensified "Pop" animation
            // Appear earlier and faster
            const progress = THREE.MathUtils.smoothstep(r, 0.05, 0.4);

            // Elastic pop effect
            let s = progress;
            if (progress > 0 && progress < 1) {
                s = progress + Math.sin(progress * Math.PI) * 0.1; // Slight bounce
            }

            const finalScale = THREE.MathUtils.lerp(0, scale, s);
            mesh.current.scale.setScalar(finalScale);
            mesh.current.visible = finalScale > 0.01;
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

    if (type === 'tv') {
        return (
            <group position={position} rotation={rotation} ref={mesh}>
                {/* Screen */}
                <Box args={[1.5, 0.9, 0.05]} position={[0, 0, 0]} material={new THREE.MeshStandardMaterial({ color: '#111', roughness: 0.2 })} />
                {/* Stand/Console */}
                <Box args={[1.8, 0.4, 0.4]} position={[0, -0.8, 0]} material={FurnitureMaterial} castShadow />
            </group>
        )
    }

    if (type === 'art') {
        return (
            <group position={position} rotation={rotation} ref={mesh}>
                <Box args={[1, 1.2, 0.05]} position={[0, 0, 0]} material={AccentMaterial} />
                <Box args={[1.1, 1.3, 0.02]} position={[0, 0, -0.02]} material={FurnitureMaterial} />
            </group>
        )
    }

    return null;
};

const Wall = ({ args, position, material, castShadow, receiveShadow, scrollProgress }) => {
    const mesh = useRef();

    useFrame(() => {
        if (mesh.current && scrollProgress) {
            const r = scrollProgress.get();
            // Transition from Blank White (#ffffff) to Designed Feature Wall
            // Let's use a stylish dark grey/blue for high contrast "Design" look
            const targetColor = new THREE.Color('#2c3e50'); // Dark Blue-Grey Feature Wall
            const initialColor = new THREE.Color('#ffffff'); // White

            // Make the transition happen earlier and faster to be noticeable
            const progress = THREE.MathUtils.smoothstep(r, 0.05, 0.5);
            mesh.current.material.color.lerpColors(initialColor, targetColor, progress);

            // Also adjust roughness to make it look more "matte" painted vs glossy white
            // Note: We can modify the material properties directly as it's a clone
            mesh.current.material.roughness = THREE.MathUtils.lerp(0.9, 0.4, progress);
        }
    });

    return (
        <Box
            ref={mesh}
            args={args}
            position={position}
            material={material.clone()} // Clone to allow independent color updates
            castShadow={castShadow}
            receiveShadow={receiveShadow}
        />
    );
};

const Floor = ({ args, position, receiveShadow, scrollProgress }) => {
    const mesh = useRef();

    useFrame(() => {
        if (mesh.current && scrollProgress) {
            const r = scrollProgress.get();
            // Transition from White (#ffffff) to Timber (#8d6e63)
            const targetColor = new THREE.Color('#8d6e63'); // Warm Timber
            const initialColor = new THREE.Color('#ffffff'); // White

            // Transition matches the walls
            const progress = THREE.MathUtils.smoothstep(r, 0.05, 0.5);
            mesh.current.material.color.lerpColors(initialColor, targetColor, progress);

            // Timber is smoother than matte white
            mesh.current.material.roughness = THREE.MathUtils.lerp(0.9, 0.3, progress);
        }
    });

    return (
        <Box
            ref={mesh}
            args={args}
            position={position}
            material={DesignedFloorMaterial.clone()}
            receiveShadow={receiveShadow}
        />
    );
};

const Room = ({ position, size, delay = 0, children, scrollProgress }) => {
    const group = useRef();

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
    });

    const wallThickness = 0.2;
    const [width, height, depth] = size;

    return (
        <group position={[position[0], 0, position[2]]}>
            <group ref={group}>
                {/* Floor - Now Animated */}
                <Floor
                    args={[width, 0.1, depth]}
                    position={[0, -height / 2 + 0.05, 0]}
                    receiveShadow
                    scrollProgress={scrollProgress}
                />

                {/* Walls Group - Using custom Wall component for color transition */}
                <group>
                    {/* Back Wall */}
                    <Wall
                        args={[width, height, wallThickness]}
                        position={[0, 0, -depth / 2 + wallThickness / 2]}
                        material={DesignedWallMaterial}
                        castShadow
                        receiveShadow
                        scrollProgress={scrollProgress}
                    />

                    {/* Front Wall (Glass/Partial) */}
                    <Wall
                        args={[width * 0.3, height, wallThickness]}
                        position={[-width / 2 + (width * 0.15), 0, depth / 2 - wallThickness / 2]}
                        material={DesignedWallMaterial}
                        castShadow
                        receiveShadow
                        scrollProgress={scrollProgress}
                    />
                    <Box
                        args={[width * 0.7, height * 0.8, wallThickness / 2]}
                        position={[width * 0.15, -height * 0.1, depth / 2 - wallThickness / 2]}
                        material={GlassMaterial}
                    />

                    {/* Left Wall */}
                    <Wall
                        args={[wallThickness, height, depth]}
                        position={[-width / 2 + wallThickness / 2, 0, 0]}
                        material={DesignedWallMaterial}
                        castShadow
                        receiveShadow
                        scrollProgress={scrollProgress}
                    />

                    {/* Right Wall */}
                    <Wall
                        args={[wallThickness, height, depth]}
                        position={[width / 2 - wallThickness / 2, 0, 0]}
                        material={DesignedWallMaterial}
                        castShadow
                        receiveShadow
                        scrollProgress={scrollProgress}
                    />
                </group>

                {/* Furniture Container */}
                <group position={[0, -height / 2, 0]}>
                    {React.Children.map(children, child =>
                        React.cloneElement(child, { scrollProgress })
                    )}
                </group>
            </group>
        </group>
    );
};

const FloorPlan = ({ scrollProgress }) => {
    const group = useRef();

    // Rotate based on scroll + Infinite Idle
    useFrame((state) => {
        if (group.current) {
            const r = scrollProgress ? scrollProgress.get() : 0;
            const t = state.clock.getElapsedTime();

            // 1. Infinite Idle Rotation (slowly spins when at top/stopped)
            const idleRotation = t * 0.05;

            // 2. Scroll Rotation (Full 360 view + Extra Spins)
            // "Add one more rotation on each side" -> Let's double the range to 4PI (2 full spins)
            // This gives a very active "inspecting" feel
            const scrollRotation = -r * (Math.PI * 4);

            // Combine them. Start at 0.5 offset to show best initial angle.
            group.current.rotation.y = 0.5 + idleRotation + scrollRotation;

            // Tilt slightly down as we scroll to see inside better
            group.current.rotation.x = r * 0.2;
        }
    });

    return (
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
            <group ref={group} position={[0, -1, 0]} rotation={[0, 0.5, 0]}>
                {/* Living Room */}
                <Room position={[0, 0, 0]} size={[4, 2.5, 5]} delay={0.5} scrollProgress={scrollProgress}>
                    <Furniture type="sofa" position={[0, 0.2, -1.5]} />
                    <Furniture type="table" position={[0, 0, 1]} />
                    {/* TV on Right Wall */}
                    <Furniture type="tv" position={[1.8, 1.2, -1.5]} rotation={[0, -Math.PI / 2, 0]} />
                    {/* Art on Back Wall */}
                    <Furniture type="art" position={[-1, 1.5, -2.3]} />
                </Room>

                {/* Bedroom */}
                <Room position={[-3.5, 0, -1]} size={[3, 2.5, 3]} delay={0.8} scrollProgress={scrollProgress}>
                    <Furniture type="bed" position={[0, 0.2, 0]} rotation={[0, Math.PI / 2, 0]} />
                    {/* Art above bed */}
                    <Furniture type="art" position={[0, 1.5, -1.3]} scale={0.8} />
                </Room>

                {/* Kitchen */}
                <Room position={[3.5, 0, -0.5]} size={[3, 2.5, 4]} delay={1.1} scrollProgress={scrollProgress}>
                    <Furniture type="kitchen_island" position={[0, 0, 0]} />
                </Room>

                {/* Bathroom */}
                <Room position={[-3.5, 0, 2]} size={[3, 2.5, 3]} delay={1.4} scrollProgress={scrollProgress}>
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

export { FloorPlan };
