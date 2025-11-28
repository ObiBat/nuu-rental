import React from 'react';
import { Grid } from '@react-three/drei';

const TechGrid = () => {
    return (
        <group position={[0, -1.26, 0]}>
            <Grid
                renderOrder={-1}
                position={[0, 0, 0]}
                infiniteGrid
                cellSize={1}
                cellThickness={0.5}
                sectionSize={5}
                sectionThickness={1}
                cellColor="#333333"
                sectionColor="#ff4d00" // Signal Orange
                fadeDistance={30}
                fadeStrength={1}
            />
        </group>
    );
};

export default TechGrid;
