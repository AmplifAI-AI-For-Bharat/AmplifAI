import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, OrbitControls, Stars, Billboard, Line, Html } from '@react-three/drei';
import * as THREE from 'three';

// --- Components ---

const SmartLabel = ({ text, subtext, color, visible = true }) => {
    if (!visible) return null;

    return (
        <Html position={[0, 1.5, 0]} center distanceFactor={15} zIndexRange={[100, 0]}>
            <div className="pointer-events-none select-none flex flex-col items-center">
                <div
                    className="px-2 py-1 rounded bg-black/80 border border-white/10 backdrop-blur-md shadow-xl text-white font-bold text-sm whitespace-nowrap transition-all duration-200"
                    style={{ borderColor: color }}
                >
                    {text}
                </div>
                {subtext && (
                    <div className="mt-1 text-[10px] uppercase font-mono tracking-wider bg-black/60 px-1 rounded text-gray-300">
                        {subtext}
                    </div>
                )}
            </div>
        </Html>
    );
};

// A single video node in 3D space
const VideoNode = ({ video, position, onClick, mode }) => {
    const mesh = useRef();
    const [hovered, setHover] = useState(false);

    // Visuals based on Hyperbolic Score
    const size = Math.max(0.8, video.hyperbolic_score / 20);
    const color = video.hyperbolic_score > 80 ? '#00ff88' : (video.hyperbolic_score > 50 ? '#00ccff' : '#ff0055');
    const glow = hovered ? 1.5 : 1;

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        mesh.current.position.y = position[1] + Math.sin(t + position[0]) * 0.2;
        mesh.current.rotation.y += 0.005;
    });

    return (
        <group position={position}>
            <mesh
                ref={mesh}
                onClick={(e) => { e.stopPropagation(); onClick(video); }}
                onPointerOver={() => setHover(true)}
                onPointerOut={() => setHover(false)}
                scale={[size * glow, size * glow, size * glow]}
            >
                <sphereGeometry args={[1, 32, 32]} />
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={hovered ? 2 : 0.5}
                    roughness={0.2}
                    metalness={0.8}
                />
            </mesh>

            <SmartLabel
                text={video.title.length > 20 ? video.title.substring(0, 20) + '...' : video.title}
                subtext={`Score: ${video.hyperbolic_score.toFixed(0)}`}
                color={color}
                visible={true}
            />
        </group>
    );
};

const NicheNode = ({ niche, position, onClick }) => {
    const mesh = useRef();
    const [hovered, setHover] = useState(false);

    const score = niche.market_gap_score || 0;
    const size = Math.max(1.2, score / 15);
    const isBlueOcean = score > 60;
    const color = isBlueOcean ? '#00ccff' : '#ff4444';

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        mesh.current.position.y = position[1] + Math.sin(t + position[0]) * 0.1;
        mesh.current.rotation.x += 0.002;
        mesh.current.rotation.y += 0.01;
    });

    return (
        <group position={position}>
            <mesh
                ref={mesh}
                onClick={(e) => { e.stopPropagation(); onClick(niche); }}
                onPointerOver={() => setHover(true)}
                onPointerOut={() => setHover(false)}
                scale={[size, size, size]}
            >
                <icosahedronGeometry args={[1, 1]} />
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={hovered ? 2 : 0.5}
                    wireframe={!isBlueOcean}
                />
            </mesh>

            <SmartLabel
                text={niche.topic}
                subtext={isBlueOcean ? "BLUE OCEAN" : "SATURATED"}
                color={color}
                visible={true}
            />
        </group>
    );
};

const Grid = () => {
    const circles = [5, 10, 15, 20];
    const sectors = 8;

    return (
        <group rotation={[1.5, 0, 0]}> {/* Flat on XZ plane */}
            {/* Coordinate Labels */}
            <Html position={[0, 0, 0]} center>
                <div className="text-gray-600 font-mono text-xs opacity-50 select-none">ORIGIN</div>
            </Html>
            <Html position={[0, -22, 0]} center>
                <div className="text-gray-500 font-mono text-xs select-none tracking-[0.2em]">HIGH SPECIFICITY</div>
            </Html>

            {circles.map((r, i) => (
                <Line
                    key={`circle-${i}`}
                    points={new Array(65).fill(0).map((_, j) => {
                        const angle = (j / 64) * Math.PI * 2;
                        return [r * Math.cos(angle), 0, r * Math.sin(angle)];
                    })}
                    color="#333"
                    lineWidth={1}
                    transparent
                    opacity={0.4}
                />
            ))}
            {new Array(sectors).fill(0).map((_, i) => {
                const angle = (i / sectors) * Math.PI * 2;
                return (
                    <Line
                        key={`radial-${i}`}
                        points={[[0, 0, 0], [22 * Math.cos(angle), 0, 22 * Math.sin(angle)]]}
                        color="#333"
                        lineWidth={1}
                        transparent
                        opacity={0.4}
                    />
                );
            })}
        </group>
    );
};

const HyperbolicSpace = ({ data, mode = 'videos' }) => {
    // Generate random positions on a sphere surface for a cool layout
    const positions = useMemo(() => {
        if (mode === 'niches') {
            return (data || []).map((niche, i) => {
                if (i === 0) return [0, 0, 0]; // Center

                const topicStr = niche.topic || "";
                const hash = topicStr.split("").reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0);
                const normalizedHash = Math.abs(hash) % 360;
                const theta = (normalizedHash / 360) * Math.PI * 2;
                const r = 8 + (Math.random() * 10);

                return [
                    r * Math.cos(theta),
                    0,
                    r * Math.sin(theta)
                ];
            });
        }

        // Default Cloud Layout
        return (data || []).map(() => {
            const phi = Math.acos(-1 + (2 * Math.random()));
            const theta = Math.sqrt((data || []).length * Math.PI) * phi;
            const r = 15;

            return [
                r * Math.cos(theta) * Math.sin(phi),
                r * Math.sin(theta) * Math.sin(phi),
                r * Math.cos(phi)
            ];
        });
    }, [data, mode]);

    const handleNodeClick = (item) => {
        if (mode === 'videos') {
            window.open(`https://www.youtube.com/watch?v=${item.video_id}`, '_blank');
        } else {
            console.log("Exploring niche:", item.topic);
        }
    };

    return (
        <div className="w-full h-[600px] border border-gray-800 rounded-3xl overflow-hidden bg-black shadow-2xl relative">
            <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur p-4 rounded-xl border border-white/10 text-xs text-gray-300 font-mono shadow-xl pointer-events-none">
                <div className="text-white font-bold mb-2 text-sm">
                    {mode === 'niches' ? 'STRATEGY MAP' : 'DISCOVERY CLOUD'}
                </div>
                {mode === 'niches' ? (
                    <>
                        <div className="flex items-center gap-2 mb-1"><div className="w-2 h-2 rounded-full bg-[#00ccff]"></div> Blue Ocean (High Opp)</div>
                        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#ff4444]"></div> Saturated (Low Opp)</div>
                    </>
                ) : (
                    <>
                        <div className="text-gray-400">Dim: Semantic Density</div>
                        <div className="text-gray-400">Size: Relevance</div>
                    </>
                )}
            </div>

            <Canvas camera={{ position: mode === 'niches' ? [0, 30, 0] : [0, 0, 40], fov: 50 }}>
                <color attach="background" args={['#020205']} />

                {mode === 'niches' && <Grid />}

                {mode === 'videos' && <fog attach="fog" args={['#020205', 20, 60]} />}

                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={0.5} />

                {mode === 'videos' && (data || []).map((video, i) => (
                    <VideoNode
                        key={video.video_id}
                        video={video}
                        position={positions[i] || [0, 0, 0]}
                        onClick={handleNodeClick}
                        mode={mode}
                    />
                ))}

                {mode === 'niches' && (
                    <>
                        {(data || []).slice(1).map((_, i) => (
                            <Line
                                key={`line-${i}`}
                                points={[[0, 0, 0], positions[i + 1] || [0, 0, 0]]}
                                color="#2d3748"
                                lineWidth={1}
                                transparent
                                opacity={0.2}
                            />
                        ))}

                        {(data || []).map((niche, i) => (
                            <NicheNode
                                key={`niche-${i}`}
                                niche={niche}
                                position={positions[i] || [0, 0, 0]}
                                onClick={(n) => console.log('Clicked Niche:', n)}
                            />
                        ))}
                    </>
                )}

                <OrbitControls
                    autoRotate={mode === 'videos'}
                    autoRotateSpeed={0.5}
                    enableZoom={true}
                    maxPolarAngle={mode === 'niches' ? Math.PI / 2 : Math.PI} // Restrict camera in map mode
                />
            </Canvas>
        </div>
    );
};

export default HyperbolicSpace;
