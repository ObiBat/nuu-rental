import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, ContactShadows, ScrollControls } from '@react-three/drei';
import FloorPlan from './FloorPlan';
import TechGrid from './TechGrid';

const ArchitecturalScene = () => {
    return (
        <div className="absolute inset-0 z-0 pointer-events-none">
            <Canvas
                shadows
                camera={{ position: [8, 6, 8], fov: 35 }}
                gl={{ antialias: true, alpha: true }}
                dpr={[1, 2]} // Handle high-DPI screens
            >
                <Suspense fallback={null}>
                    {/* Lighting */}
                    <ambientLight intensity={0.5} />
                    <directionalLight
                        position={[10, 10, 5]}
                        intensity={1}
                        castShadow
                        shadow-mapSize={[1024, 1024]}
                    >
                        <orthographicCamera attach="shadow-camera" args={[-10, 10, 10, -10]} />
                    </directionalLight>

                    {/* Environment Reflection */}
                    <Environment preset="city" />

                    {/* Scroll Controls for Animation */}
                    <ScrollControls pages={2} damping={0.2}>
                        <group position={[0, -0.5, 0]}>
                            <FloorPlan />
                            <TechGrid />
                        </group>
                    </ScrollControls>

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
