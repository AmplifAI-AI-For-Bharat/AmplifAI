import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, OrbitControls, Billboard, Line, Html } from '@react-three/drei';
import * as THREE from 'three';

// --- Components ---

const SmartLabel = ({ text, subtext, color, visible = true }) => {
    if (!visible) return null;

    return (
        <Html position={[0, 1.8, 0]} center distanceFactor={15} zIndexRange={[100, 0]}>
            <div className="pointer-events-none select-none flex flex-col items-center">
                <div
                    className="px-3 py-1.5 rounded-xl bg-white border-2 border-gray-100 shadow-df text-devfolio-text-primary font-black text-[10px] uppercase tracking-widest whitespace-nowrap transition-all duration-200"
                    style={{ borderTopColor: color, borderTopWidth: '4px' }}
                >
                    {text}
                </div>
                {subtext && (
                    <div className="mt-2 text-[9px] uppercase font-black tracking-[0.2em] bg-devfolio-muted px-2 py-1 rounded-lg text-devfolio-blue border border-devfolio-blue/10">
                        {subtext}
                    </div>
                )}
            </div>
        </Html>
    );
};

// A single video node in 3D space
const VideoNode = ({ video, position, onClick }) => {
    const mesh = useRef();
    const [hovered, setHover] = useState(false);

    // Visuals based on Hyperbolic Score
    const size = Math.max(0.6, video.hyperbolic_score / 25);
    const color = video.hyperbolic_score > 80 ? '#27C499' : (video.hyperbolic_score > 50 ? '#3770FF' : '#F9B233');
    const glow = hovered ? 1.3 : 1;

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        mesh.current.position.y = position[1] + Math.sin(t + position[0]) * 0.15;
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
                    roughness={0.1}
                    metalness={0.1}
                />
            </mesh>

            <SmartLabel
                text={video.title.length > 25 ? video.title.substring(0, 25) + '...' : video.title}
                subtext={`Signal: ${video.hyperbolic_score.toFixed(0)}`}
                color={color}
                visible={hovered || video.hyperbolic_score > 70}
            />
        </group>
    );
};

const NicheNode = ({ niche, position, onClick }) => {
    const mesh = useRef();
    const [hovered, setHover] = useState(false);

    const score = niche.market_gap_score || 0;
    const size = Math.max(1, score / 18);
    const isBlueOcean = score > 60;
    const color = isBlueOcean ? '#3770FF' : '#F9B233';

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        mesh.current.position.y = position[1] + Math.sin(t + position[0]) * 0.1;
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
                <icosahedronGeometry args={[1, 0]} />
                <meshStandardMaterial
                    color={color}
                    wireframe={!isBlueOcean}
                    roughness={0.5}
                    transparent
                    opacity={0.8}
                />
            </mesh>

            {/* Node Interior "Crystal" */}
            <mesh scale={[size * 0.4, size * 0.4, size * 0.4]} rotation={[Math.PI / 4, 0, Math.PI / 4]}>
                <octahedronGeometry args={[1, 0]} />
                <meshStandardMaterial
                    color={color}
                    wireframe
                    transparent
                    opacity={0.4}
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
    const circles = [8, 16, 24];
    const sectors = 12;

    return (
        <group rotation={[1.57, 0, 0]}>
            {/* Origin Label */}
            <Html position={[0, -0.5, 0]} center>
                <div className="text-gray-300 font-black text-[9px] uppercase tracking-[0.2em] select-none">NICHE ORIGIN</div>
            </Html>

            {circles.map((r, i) => (
                <Line
                    key={`circle-${i}`}
                    points={new Array(65).fill(0).map((_, j) => {
                        const angle = (j / 64) * Math.PI * 2;
                        return [r * Math.cos(angle), 0, r * Math.sin(angle)];
                    })}
                    color="#f1f5f9"
                    lineWidth={2}
                    transparent
                    opacity={0.8}
                />
            ))}
            {new Array(sectors).fill(0).map((_, i) => {
                const angle = (i / sectors) * Math.PI * 2;
                return (
                    <Line
                        key={`radial-${i}`}
                        points={[[0, 0, 0], [30 * Math.cos(angle), 0, 30 * Math.sin(angle)]]}
                        color="#f1f5f9"
                        lineWidth={1}
                        transparent
                        opacity={0.5}
                    />
                );
            })}
        </group>
    );
};

const HyperbolicSpace = ({ data, mode = 'videos' }) => {
    const positions = useMemo(() => {
        if (mode === 'niches') {
            return (data || []).map((niche, i) => {
                if (i === 0) return [0, 0, 0];
                const angle = (i / (data.length - 1)) * Math.PI * 2;
                const r = 15; // Fixed radius for clean diagram look
                return [r * Math.cos(angle), 0, r * Math.sin(angle)];
            });
        }

        return (data || []).map(() => {
            const phi = Math.acos(-1 + (2 * Math.random()));
            const theta = Math.sqrt((data || []).length * Math.PI) * phi;
            const r = 20;
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
        }
    };

    return (
        <div className="w-full h-full border-none rounded-none overflow-hidden bg-white relative">
            {/* Diagram Legend */}
            <div className="absolute top-10 left-10 z-10 bg-white/80 backdrop-blur-md p-6 rounded-[2rem] border-2 border-gray-50 shadow-df pointer-events-none">
                <div className="text-devfolio-blue font-black mb-4 text-[10px] uppercase tracking-[0.3em] flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-devfolio-blue"></div>
                    {mode === 'niches' ? 'HYPERBOLIC STRATEGY MAP' : 'SEMANTIC VECTOR CLOUD'}
                </div>
                <div className="space-y-3">
                    {mode === 'niches' ? (
                        <>
                            <div className="flex items-center gap-3 font-bold text-devfolio-text-secondary text-[11px] uppercase tracking-wider">
                                <div className="w-3 h-3 rounded-md bg-devfolio-blue"></div> High Demand Gap
                            </div>
                            <div className="flex items-center gap-3 font-bold text-devfolio-text-secondary text-[11px] uppercase tracking-wider">
                                <div className="w-3 h-3 border-2 border-devfolio-yellow bg-white"></div> Saturated Market
                            </div>
                        </>
                    ) : (
                        <>
                            <p className="text-[11px] font-bold text-devfolio-text-secondary uppercase tracking-widest">● Point Size: Signal Strength</p>
                            <p className="text-[11px] font-bold text-devfolio-text-secondary uppercase tracking-widest">○ Proximity: Semantic Relation</p>
                        </>
                    )}
                </div>
            </div>

            <Canvas camera={{ position: mode === 'niches' ? [0, 40, 0] : [0, 0, 50], fov: 45 }}>
                <color attach="background" args={['#ffffff']} />

                {mode === 'niches' && <Grid />}

                <ambientLight intensity={1} />
                <pointLight position={[20, 20, 20]} intensity={1.5} />
                <directionalLight position={[-10, 10, 5]} intensity={0.5} />

                {mode === 'videos' && (data || []).map((video, i) => (
                    <VideoNode
                        key={video.video_id}
                        video={video}
                        position={positions[i] || [0, 0, 0]}
                        onClick={handleNodeClick}
                    />
                ))}

                {mode === 'niches' && (
                    <>
                        {(data || []).slice(1).map((_, i) => (
                            <Line
                                key={`line-${i}`}
                                points={[[0, 0, 0], positions[i + 1] || [0, 0, 0]]}
                                color="#e2e8f0"
                                lineWidth={1.5}
                                transparent
                                opacity={0.6}
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
                    autoRotateSpeed={0.3}
                    enableZoom={true}
                    minDistance={mode === 'niches' ? 15 : 10}
                    maxDistance={mode === 'niches' ? 60 : 80}
                    maxPolarAngle={mode === 'niches' ? 1.4 : Math.PI}
                />
            </Canvas>
        </div>
    );
};

export default HyperbolicSpace;
