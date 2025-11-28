import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, ContactShadows } from '@react-three/drei';
import { FloorPlan } from './FloorPlan';
import TechGrid from './TechGrid';

const ArchitecturalScene = ({ scrollProgress }) => {
    return (
        <div className="absolute inset-0 z-0">
            <Canvas
                shadows
                camera={{ position: [8, 6, 8], fov: 35 }}
                gl={{ antialias: true, alpha: true }}
                dpr={[1, 2]} // Handle high-DPI screens
            >
                <Suspense fallback={null}>
                    {/* Lighting */}
                    <ambientLight intensity={0.8} />
                    <directionalLight
                        position={[10, 10, 5]}
                        intensity={2.0}
                        castShadow
                        shadow-mapSize={[1024, 1024]}
                    >
                        <orthographicCamera attach="shadow-camera" args={[-10, 10, 10, -10]} />
                    </directionalLight>
                    {/* Fill Light to reduce harsh shadows */}
                    <directionalLight position={[-5, 5, 5]} intensity={1.0} />

                    {/* Environment Reflection */}
                    <Environment preset="city" />

                    {/* Scene Content */}
                    <group position={[0, -0.5, 0]}>
                        <FloorPlan scrollProgress={scrollProgress} />
                        <TechGrid />
                    </group>

                    {/* Shadows */}
                    <ContactShadows
                        resolution={1024}
                        scale={20}
                        blur={2}
                        opacity={0.5}
                        far={10}
                        color="#000000"
                    />
                </Suspense>
            </Canvas>

            {/* Gradient Overlay to blend with hero text */}
            <div className="absolute inset-0 bg-gradient-to-r from-carbon via-carbon/80 to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-carbon via-transparent to-transparent z-10 pointer-events-none" />
        </div>
    );
};

export default ArchitecturalScene;
