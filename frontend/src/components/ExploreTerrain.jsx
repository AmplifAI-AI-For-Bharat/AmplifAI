/**
 * ExploreTerrain.jsx — Smooth gradient mountains + Clash Royale animated ocean
 *
 * Mountains: LatheGeometry (smooth parabolic silhouette) + gradient canvas texture
 * Contour rings: thin TubeGeometry rings at each terrace height (visual, not stepped)
 * Ocean: animated vertex-displaced PlaneGeometry, bright turquoise with foam highlights
 * Interaction: click emoji/label/mountain → zoom in, rings light up with AWS topics
 */

import React, { useRef, useState, useMemo, useCallback, useEffect, Component } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

class ExploreTerrainErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        this.setState({ errorInfo });
        console.error("ExploreTerrain crashed:", error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: 20, background: '#fee', color: '#c00', height: '100%', overflow: 'auto' }}>
                    <h2>ExploreTerrain Crashed</h2>
                    <pre>{this.state.error && this.state.error.toString()}</pre>
                    <pre style={{ fontSize: 10 }}>{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
                </div>
            );
        }
        return this.props.children;
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// DOMAIN DATA  —  each has base→mid→peak gradient colors
// ─────────────────────────────────────────────────────────────────────────────

export const DOMAINS = [
    { id: 'Music', label: 'Music', icon: '🎵', x: -40, z: 0, colors: ['#0284C7', '#38BDF8', '#BAE6FD'] },
    { id: 'Fashion', label: 'Fashion', icon: '👗', x: -32, z: -15, colors: ['#EA580C', '#F97316', '#FDBA74'] },
    { id: 'Science & Tech', label: 'Science & Tech', icon: '🔬', x: -24, z: 5, colors: ['#059669', '#34D399', '#A7F3D0'] },
    { id: 'Cinema & Media', label: 'Cinema & Media', icon: '🎬', x: -16, z: -10, colors: ['#7C3AED', '#A855F7', '#D8B4FE'] },
    { id: 'Art', label: 'Art', icon: '🎨', x: -8, z: 10, colors: ['#DC2626', '#EF4444', '#FCA5A5'] },
    { id: 'Business', label: 'Business', icon: '📈', x: 0, z: -5, colors: ['#0F766E', '#14B8A6', '#5EEAD4'] },
    { id: 'Food', label: 'Food & Cuisine', icon: '🍔', x: 8, z: 5, colors: ['#E11D48', '#F43F5E', '#FDA4AF'] },
    { id: 'Travel', label: 'Travel', icon: '✈️', x: 16, z: -15, colors: ['#0284C7', '#0EA5E9', '#7DD3FC'] },
    { id: 'Gaming', label: 'Gaming', icon: '🎮', x: 24, z: 0, colors: ['#4F46E5', '#6366F1', '#A5B4FC'] },
    { id: 'Education', label: 'Education', icon: '📚', x: 32, z: -20, colors: ['#16A34A', '#22C55E', '#86EFAC'] },
    { id: 'Comedy', label: 'Comedy', icon: '😂', x: 40, z: 10, colors: ['#D97706', '#F59E0B', '#FCD34D'] },
];

export const STATIC_MAP = {
    'Music': ['Audio Architect', 'Soundscape Master', 'Beat Blueprint Specialist', 'Vocal Virtuoso', 'Sonic Storyteller'],
    'Fashion': ['Streetwear Culture', 'Sustainable Fashion', 'Avant-Garde Design', 'Vintage Revival', 'Couture Visionary'],
    'Science & Tech': ['AI & Machine Learning', 'Space Exploration', 'Biotechnology', 'Quantum Computing', 'Neuroscience'],
    'Cinema & Media': ['World Cinema', 'Animation Techniques', 'Documentary Filmmaking', 'Screenwriting', 'Cinematography'],
    'Art': ['Contemporary Art', 'Street Art', 'Digital Art', 'Photography', 'Sculpture'],
    'Business': ['Startups', 'Content Marketing', 'Leadership & Strategy', 'Finance', 'Product Management'],
    'Food': ['Gastronomic Arts', 'Culinary Science', 'Fine Dining Innovations', 'Sustainable Agriculture', 'Global Flavor Profiles'],
    'Travel': ['Cultural Expeditions', 'Eco-Tourism', 'Geographical Documentaries', 'Historical Demographics', 'Architecture Tours'],
    'Gaming': ['Game Design Theory', 'Interactive Storytelling', 'Esports Economics', 'Player Psychology', 'Procedural Generation'],
    'Education': ['Academic Discourse', 'Pedagogical Methodologies', 'Scientific Literacy', 'Cognitive Sciences', 'Historical Analysis'],
    'Comedy': ['Satirical Analysis', 'Comedic Writing Theory', 'Improvisational Arts', 'Societal Commentary', 'Stand-up Structuring'],
};

const LEAF_MAP = {
    'Electronic Music': ['Modular Synthesis', 'Ambient Drone', 'Techno History', 'Hyperpop Production'],
    'History of Fashion': ['Victorian Fashion', 'Art Deco Style', 'Regency Dress', '1920s Flappers'],
    'AI & Machine Learning': ['LLM Training', 'AI Alignment', 'Inference Hacks', 'Neural Architecture'],
    'World Cinema': ['French New Wave', 'South Korean Films', 'Iranian Cinema', 'Japanese Art House'],
    'Contemporary Art': ['Post-Internet Art', 'Bio Art', 'Land Art', 'Institutional Critique'],
    'Startups': ['MVP Validation', 'Bootstrapped SaaS', 'Founder Stories', 'Y Combinator'],
};

// ─────────────────────────────────────────────────────────────────────────────
// MOUNTAIN PROFILE  (heights at which contour rings sit)
// ─────────────────────────────────────────────────────────────────────────────

const MOUNTAIN_HEIGHT = 5.5;
const MOUNTAIN_BASE_R = 5.8;
const RING_HEIGHTS = [1.1, 2.0, 2.9, 3.8, 4.7]; // 5 tiers

// ─────────────────────────────────────────────────────────────────────────────
// GRADIENT TEXTURE utility
// ─────────────────────────────────────────────────────────────────────────────

function makeGradientTexture(colors) {
    const canvas = document.createElement('canvas');
    canvas.width = 4;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 256, 0, 0); // bottom → top
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(0.45, colors[1]);
    gradient.addColorStop(1, colors[2]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 4, 256);
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    return tex;
}

// ─────────────────────────────────────────────────────────────────────────────
// MOUNTAIN GEOMETRY (LatheGeometry with smooth parabolic profile)
// ─────────────────────────────────────────────────────────────────────────────

function makeMountainGeo() {
    const pts = [];
    const N = 40;
    for (let i = 0; i <= N; i++) {
        const t = i / N;                          // 0=base, 1=peak
        const y = t * MOUNTAIN_HEIGHT;
        // Smooth exponential taper: wide base, tight peak
        const r = MOUNTAIN_BASE_R * Math.pow(1 - t, 1.35);
        pts.push(new THREE.Vector2(r, y));
    }
    return new THREE.LatheGeometry(pts, 40);
}

// Shared geometry (created once)
const MOUNTAIN_GEO = makeMountainGeo();

// ─────────────────────────────────────────────────────────────────────────────
// CONTOUR RING at a given height
// ─────────────────────────────────────────────────────────────────────────────

function ContourRing({ y, domain, highlighted, label, onClick }) {
    const [hov, setHov] = useState(false);
    const t = y / MOUNTAIN_HEIGHT;
    const ringR = MOUNTAIN_BASE_R * Math.pow(1 - t, 1.35) + 0.08;
    const isLit = highlighted || hov;

    return (
        <group position={[0, y, 0]}>
            {/* The ring line */}
            <mesh
                rotation={[Math.PI / 2, 0, 0]}
                onClick={e => { e.stopPropagation(); onClick && onClick(); }}
                onPointerOver={e => { e.stopPropagation(); setHov(true); }}
                onPointerOut={e => { e.stopPropagation(); setHov(false); }}
            >
                <torusGeometry args={[ringR, isLit ? 0.095 : 0.06, 8, 80]} />
                <meshStandardMaterial
                    color={isLit ? '#FFFFFF' : '#FFFFFF'}
                    transparent
                    opacity={isLit ? 0.95 : 0.35}
                    emissive={isLit ? '#FFFFFF' : '#88CCFF'}
                    emissiveIntensity={isLit ? 0.8 : 0.1}
                    roughness={0.2}
                />
            </mesh>

            {/* Label beside ring (shown when in zoomed mode) */}
            {label && (
                <Html position={[ringR + 0.6, 0.1, 0]} center transform distanceFactor={12} zIndexRange={[100, 0]}>
                    <div
                        onClick={() => onClick && onClick()}
                        style={{
                            fontFamily: 'Inter, sans-serif', fontWeight: 800,
                            fontSize: 9.5, letterSpacing: '0.12em', textTransform: 'uppercase',
                            color: isLit ? '#fff' : '#1E3A5F',
                            background: isLit ? domain.colors[1] : 'rgba(255,255,255,0.92)',
                            padding: '3px 11px', borderRadius: 20,
                            border: `2px solid ${isLit ? domain.colors[1] : 'rgba(200,220,255,0.7)'}`,
                            whiteSpace: 'nowrap', cursor: 'pointer',
                            boxShadow: isLit ? `0 2px 14px ${domain.colors[1]}70` : '0 1px 6px rgba(0,0,0,0.09)',
                            transition: 'all 0.18s', userSelect: 'none', pointerEvents: 'all',
                        }}
                    >
                        {label}
                    </div>
                </Html>
            )}
        </group>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// MOUNTAIN
// ─────────────────────────────────────────────────────────────────────────────

function Mountain({ domain, isSelected, isMapped, tierLabels = [], highlightedTier, onDomainClick, onRingClick, zoomed }) {
    const groupRef = useRef();
    const texRef = useRef();

    // Build gradient texture once per domain
    const gradientTex = useMemo(() => makeGradientTexture(domain.colors), [domain]);

    useFrame(state => {
        if (!groupRef.current || isSelected) return;
        groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.55 + domain.x * 0.18) * 0.07;
    });

    return (
        <group ref={groupRef} position={[domain.x, 0, domain.z || 0]}>
            {/* Mountain body */}
            <mesh
                geometry={MOUNTAIN_GEO}
                onClick={e => { e.stopPropagation(); onDomainClick(domain); }}
                castShadow
            >
                <meshStandardMaterial
                    map={gradientTex}
                    roughness={0.55}
                    metalness={0.05}
                    emissiveMap={gradientTex}
                    emissiveIntensity={isSelected ? 0.18 : 0.04}
                    emissive={new THREE.Color(domain.colors[1])}
                />
            </mesh>

            {/* Personalized Beacon (Landmark) */}
            {isMapped && <Beacon color={domain.colors[2]} />}

            {/* Summit glow sphere */}
            <mesh position={[0, MOUNTAIN_HEIGHT + 0.18, 0]}>
                <sphereGeometry args={[0.28, 20, 20]} />
                <meshStandardMaterial color={domain.colors[2]} emissive={domain.colors[1]} emissiveIntensity={0.7} roughness={0.1} transparent opacity={0.9} />
            </mesh>

            {/* Contour rings */}
            {RING_HEIGHTS.map((rh, i) => (
                <ContourRing
                    key={i}
                    y={rh}
                    domain={domain}
                    highlighted={isSelected && (highlightedTier === i || highlightedTier == null)}
                    label={isSelected ? (tierLabels[i] || null) : null}
                    onClick={isSelected ? () => onRingClick(i) : null}
                />
            ))}

            {/* Emoji bubble */}
            <Html position={[0, MOUNTAIN_HEIGHT + 2.5, 0]} center distanceFactor={zoomed ? 13 : 19}>
                <div
                    onClick={() => onDomainClick(domain)}
                    style={{
                        background: isSelected ? domain.colors[1] : 'rgba(255,255,255,0.93)',
                        border: `2.5px solid ${domain.colors[1]}`,
                        borderRadius: '50%',
                        width: 44, height: 44,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: domain.isPersonalized ? `0 0 20px ${domain.colors[1]}` : '0 8px 32px rgba(0,0,0,0.15)',
                        cursor: 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        transform: `scale(${zoomed ? 1.2 : 1})`,
                        animation: domain.isPersonalized ? 'bounce 2.5s infinite ease-in-out' : 'none',
                        userSelect: 'none', pointerEvents: 'all',
                    }}
                >
                    <span style={{ fontSize: zoomed ? 24 : 20 }}>{domain.icon}</span>
                    {domain.isPersonalized && !zoomed && (
                        <div style={{
                            position: 'absolute',
                            bottom: -15,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            background: 'black',
                            color: 'white',
                            fontSize: '6px',
                            fontWeight: '900',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            whiteSpace: 'nowrap',
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            pointerEvents: 'none'
                        }}>Personal Peak</div>
                    )}
                </div>
            </Html>

            {/* Name label */}
            <Html position={[0, MOUNTAIN_HEIGHT + 4.3, 0]} center distanceFactor={zoomed ? 13 : 19}>
                <div
                    onClick={() => onDomainClick(domain)}
                    style={{
                        fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: 18,
                        letterSpacing: '0.12em', textTransform: 'uppercase',
                        color: isSelected ? domain.colors[1] : '#1E3A5F',
                        background: 'rgba(255,255,255,0.92)', padding: '5px 14px',
                        borderRadius: 20,
                        border: `1.5px solid ${isSelected ? domain.colors[1] : 'rgba(200,220,255,0.5)'}`,
                        whiteSpace: 'nowrap', cursor: 'pointer', transition: 'all 0.22s',
                        userSelect: 'none', pointerEvents: 'all',
                        boxShadow: isSelected ? `0 2px 12px ${domain.colors[1]}50` : 'none',
                    }}
                >
                    {domain.label}
                </div>
            </Html>
        </group>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// ANIMATED OCEAN  (Clash Royale style — bright turquoise rolling waves)
// ─────────────────────────────────────────────────────────────────────────────

function AnimatedOcean() {
    const meshRef = useRef();
    const geoRef = useRef();

    const geometry = useMemo(() => {
        const g = new THREE.PlaneGeometry(110, 65, 60, 25);
        g.rotateX(-Math.PI / 2);
        return g;
    }, []);

    const originalPositions = useMemo(() => {
        const pos = geometry.attributes.position.array;
        return Float32Array.from(pos);
    }, [geometry]);

    useFrame(({ clock }) => {
        const t = clock.elapsedTime;
        const pos = geoRef.current?.geometry?.attributes?.position;
        if (!pos) return;
        const orig = originalPositions;
        for (let i = 0; i < pos.count; i++) {
            const ox = orig[i * 3];
            const oz = orig[i * 3 + 2];
            // Rolling wave: combination of sine waves
            const wave =
                0.22 * Math.sin(ox * 0.28 + t * 1.1) +
                0.14 * Math.sin(ox * 0.5 - t * 0.85 + oz * 0.1) +
                0.10 * Math.sin(oz * 0.3 + t * 0.7) +
                0.07 * Math.cos(ox * 0.7 + oz * 0.4 + t * 1.4);
            pos.setY(i, orig[i * 3 + 1] + wave);
        }
        pos.needsUpdate = true;
        geoRef.current.geometry.computeVertexNormals();
    });

    // Build per-vertex colors based on height (done each frame via shader trick)
    // Instead use a gradient material + wave height for emissive
    return (
        <mesh ref={geoRef} geometry={geometry} position={[0, -0.55, 0]} receiveShadow>
            <meshStandardMaterial
                color="#00C4E8"
                roughness={0.15}
                metalness={0.1}
                emissive="#00A8D0"
                emissiveIntensity={0.25}
                transparent
                opacity={0.82}
            />
        </mesh>
    );
}

// Ocean foam/highlight layer on top
function OceanFoam() {
    const meshRef = useRef();
    const geo = useMemo(() => {
        const g = new THREE.PlaneGeometry(110, 40, 60, 20);
        g.rotateX(-Math.PI / 2);
        return g;
    }, []);
    const orig = useMemo(() => Float32Array.from(geo.attributes.position.array), [geo]);

    useFrame(({ clock }) => {
        const t = clock.elapsedTime;
        const pos = meshRef.current?.geometry?.attributes?.position;
        if (!pos) return;
        for (let i = 0; i < pos.count; i++) {
            const ox = orig[i * 3];
            const oz = orig[i * 3 + 2];
            const wave =
                0.22 * Math.sin(ox * 0.28 + t * 1.1) +
                0.14 * Math.sin(ox * 0.5 - t * 0.85 + oz * 0.1) +
                0.10 * Math.sin(oz * 0.3 + t * 0.7) +
                0.07 * Math.cos(ox * 0.7 + oz * 0.4 + t * 1.4);
            pos.setY(i, orig[i * 3 + 1] + wave + 0.05);
        }
        pos.needsUpdate = true;
    });
    return (
        <mesh ref={meshRef} geometry={geo} position={[0, -0.55, 0]}>
            <meshStandardMaterial
                color="#E0F7FA"
                roughness={0.05}
                metalness={0}
                emissive="#FFFFFF"
                emissiveIntensity={0.35}
                transparent
                opacity={0.22}
                wireframe={false}
            />
        </mesh>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// BEACON / LANDMARK
// ─────────────────────────────────────────────────────────────────────────────

function Beacon({ color }) {
    return (
        <group position={[0, MOUNTAIN_HEIGHT, 0]}>
            {/* Light beam */}
            <mesh position={[0, 2, 0]}>
                <cylinderGeometry args={[0.03, 0.03, 4, 8]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={4} transparent opacity={0.6} />
            </mesh>
            {/* Top glow orb */}
            <mesh position={[0, 4, 0]}>
                <sphereGeometry args={[0.35, 16, 16]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={8} />
            </mesh>
            <pointLight position={[0, 4, 0]} color={color} intensity={3} distance={12} />
        </group>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// CAMERA RIG
// ─────────────────────────────────────────────────────────────────────────────

function CameraRig({ target }) {
    const { camera } = useThree();
    const pos = useRef(new THREE.Vector3(target.x, target.y, target.z));
    const look = useRef(new THREE.Vector3(target.lx, target.ly, target.lz));

    // Update refs on target change
    useEffect(() => { }, [target]);

    useFrame(() => {
        pos.current.lerp({ x: target.x, y: target.y, z: target.z }, 0.05);
        look.current.lerp({ x: target.lx, y: target.ly, z: target.lz }, 0.05);
        camera.position.copy(pos.current);
        camera.lookAt(look.current);
    });

    return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// SPARKLES
// ─────────────────────────────────────────────────────────────────────────────

function Sparkles() {
    const geo = useMemo(() => {
        const positions = [];
        for (let i = 0; i < 90; i++) {
            positions.push((Math.random() - 0.5) * 110, Math.random() * 12 + 1, (Math.random() - 0.5) * 14);
        }
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        return g;
    }, []);
    return (
        <points geometry={geo}>
            <pointsMaterial size={0.09} color="#BAE6FD" transparent opacity={0.55} sizeAttenuation />
        </points>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// CAMERA PRESETS
// ─────────────────────────────────────────────────────────────────────────────

const ROOT_CAM = { x: 0, y: 22, z: 75, lx: 0, ly: 2.5, lz: 0 };
const zoomedCam = d => ({ x: d.x, y: 8, z: (d.z || 0) + 28, lx: d.x, ly: 3.5, lz: (d.z || 0) });
const tierCam = (d, ringY) => ({ x: d.x, y: ringY + 4.5, z: (d.z || 0) + 18, lx: d.x, ly: ringY, lz: (d.z || 0) });

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

function ExploreTerrainInner({ onSearch, watchHistory = [], atlasMappingResult = null, mapTarget = null, onClearTarget, onClearMapping, personalizedMountain = null, onPersonalStepClick = null }) {
    const [selectedDomain, setSelectedDomain] = useState(null);
    const [selectedTier, setSelectedTier] = useState(null);
    const [tierTopics, setTierTopics] = useState([]);
    const [leafTopics, setLeafTopics] = useState([]);
    const [searching, setSearching] = useState(false);
    const [searchError, setSearchError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [cam, setCam] = useState(ROOT_CAM);

    const effectiveDomains = useMemo(() => {
        let base = [...DOMAINS];
        if (personalizedMountain) {
            base.push({
                id: 'personalized',
                label: personalizedMountain.name || 'Your Personal Peak',
                icon: '✨',
                x: 0,
                z: 22,
                colors: ['#0C4A6E', '#0EA5E9', '#F0F9FF'], // Special Ice/Crystal vibe
                isPersonalized: true
            });
        }
        return base;
    }, [personalizedMountain]);

    // ── Fetch niches ────────────────────────────────────────────────────────────

    const fetchNiches = useCallback(async (domainId, domainLabel, parentTopic = null) => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:8000/explore/generate_terrain', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ domain: domainLabel, parent_topic: parentTopic, watch_history: watchHistory.slice(-20) }),
            });
            if (!res.ok) throw new Error();
            const data = await res.json();
            return data.topics || [];
        } catch {
            if (parentTopic) return LEAF_MAP[parentTopic] || [`${parentTopic} Basics`, `${parentTopic} History`, `Advanced ${parentTopic}`, `${parentTopic} Theory`];
            return STATIC_MAP[domainId] || [];
        } finally {
            setLoading(false);
        }
    }, [watchHistory]);

    // ── Pre-select domain from Atlas Mapping (Moved below) ───────────────────────

    const handleDomainClick = useCallback(async (domain) => {
        setSearchError(null);
        if (selectedDomain?.id === domain.id) { handleZoomOut(); return; }
        setSelectedDomain(domain);
        setSelectedTier(null);
        setLeafTopics([]);
        setCam(zoomedCam(domain));

        if (domain.isPersonalized && personalizedMountain) {
            setTierTopics(personalizedMountain.steps || []);
        } else {
            // Set initial labels from static map instantly so they don't wait for network
            const initialTopics = STATIC_MAP[domain.id] || [];
            setTierTopics(initialTopics.slice(0, 5));

            // Then fetch live ones if possible
            fetchNiches(domain.id, domain.label).then(topics => {
                if (topics && topics.length > 0) setTierTopics(topics.slice(0, 5));
            });
        }
    }, [selectedDomain, fetchNiches, personalizedMountain]);

    // ── Pre-select domain from Atlas Mapping ─────────────────────────────────────
    useEffect(() => {
        if (atlasMappingResult && !selectedDomain) {
            const domainIdToFind = personalizedMountain ? 'personalized' : atlasMappingResult.domainId;
            const domain = effectiveDomains.find(d => d.id === domainIdToFind);
            if (domain) {
                // adding a small delay so the canvas can render before flying the camera
                setTimeout(() => handleDomainClick(domain), 600);
            }
        }
    }, [atlasMappingResult, handleDomainClick, selectedDomain, effectiveDomains, personalizedMountain]);

    // ── Pre-select domain from Search (Map Target) ───────────────────────────────
    useEffect(() => {
        if (mapTarget && mapTarget.domainId) {
            const domain = DOMAINS.find(d => d.id === mapTarget.domainId);
            if (domain) {
                setTimeout(() => {
                    handleDomainClick(domain);
                    if (onClearTarget) onClearTarget();
                }, 100);
            }
        }
    }, [mapTarget, handleDomainClick, onClearTarget]);

    // ── Ring / tier click ────────────────────────────────────────────────────────

    const handleRingClick = useCallback(async (tier) => {
        if (!selectedDomain) return;
        const label = tierTopics[tier];
        if (!label) return;
        setSelectedTier(tier);
        setSearchError(null);
        setCam(tierCam(selectedDomain, RING_HEIGHTS[tier]));

        if (selectedDomain.isPersonalized && onPersonalStepClick) {
            onPersonalStepClick(label);
            setLeafTopics([]); // No leaf topics for personal peak
        } else {
            const leaves = await fetchNiches(selectedDomain.id, selectedDomain.label, label);
            setLeafTopics(leaves.slice(0, 6));
        }
    }, [selectedDomain, tierTopics, fetchNiches, onPersonalStepClick]);

    // ── Leaf click — stays in explore on failure ─────────────────────────────────

    const handleLeafClick = useCallback(async (label) => {
        setSearching(true);
        setSearchError(null);
        const ok = await onSearch(label, { id: 'explore_user', context: [] });
        setSearching(false);
        if (ok === false) {
            setSearchError(`No content found for "${label}" — try a terrace level above`);
        }
    }, [onSearch]);

    // ── Zoom out ──────────────────────────────────────────────────────────────────

    const handleZoomOut = useCallback(() => {
        setSearchError(null);
        if (selectedTier !== null) {
            setSelectedTier(null); setLeafTopics([]);
            if (selectedDomain) setCam(zoomedCam(selectedDomain));
        } else {
            setSelectedDomain(null); setTierTopics([]); setCam(ROOT_CAM);
        }
    }, [selectedTier, selectedDomain]);

    const isZoomed = !!selectedDomain;

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative', background: 'linear-gradient(180deg, #E0F7FA 0%, #B2EBF2 40%, #80DEEA 100%)' }}>

            {/* ── BREADCRUMB ── */}
            <div style={{
                position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)',
                zIndex: 30, display: 'flex', alignItems: 'center', gap: 8,
                background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)',
                borderRadius: 999, border: '1.5px solid rgba(200,235,255,0.7)',
                padding: '7px 18px',
                fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 800,
                letterSpacing: '0.15em', textTransform: 'uppercase',
                boxShadow: '0 4px 20px rgba(0,180,220,0.12)',
            }}>
                <span
                    onClick={() => { setSelectedDomain(null); setSelectedTier(null); setTierTopics([]); setLeafTopics([]); setCam(ROOT_CAM); setSearchError(null); }}
                    style={{ color: isZoomed ? '#0891B2' : '#0C4A6E', cursor: isZoomed ? 'pointer' : 'default' }}
                >
                    All Interests
                </span>
                {selectedDomain && (
                    <>
                        <span style={{ color: '#BAE6FD' }}>›</span>
                        <span
                            onClick={() => { setSelectedTier(null); setLeafTopics([]); setCam(zoomedCam(selectedDomain)); setSearchError(null); }}
                            style={{ color: selectedTier !== null ? '#0891B2' : '#0C4A6E', cursor: selectedTier !== null ? 'pointer' : 'default' }}
                        >
                            {selectedDomain.icon} {selectedDomain.label}
                        </span>
                    </>
                )}
                {selectedTier !== null && tierTopics[selectedTier] && (
                    <>
                        <span style={{ color: '#BAE6FD' }}>›</span>
                        <span style={{ color: '#0C4A6E' }}>{tierTopics[selectedTier]}</span>
                    </>
                )}
            </div>

            {/* ── ZOOM OUT BUTTON ── */}
            {isZoomed && (
                <button onClick={handleZoomOut} style={{
                    position: 'absolute', top: 14, left: 16, zIndex: 30,
                    fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 10,
                    letterSpacing: '0.14em', textTransform: 'uppercase',
                    color: '#0C4A6E', background: 'rgba(255,255,255,0.92)',
                    border: '1.5px solid rgba(186,230,253,0.8)', borderRadius: 999,
                    padding: '7px 15px', cursor: 'pointer',
                    boxShadow: '0 2px 12px rgba(0,180,220,0.15)',
                    backdropFilter: 'blur(10px)',
                }}>
                    ← {selectedTier !== null ? selectedDomain?.label : 'All Mountains'}
                </button>
            )}

            {/* ── LOADING ── */}
            {(loading || searching) && (
                <div style={{
                    position: 'absolute', top: 55, left: '50%', transform: 'translateX(-50%)',
                    zIndex: 30, display: 'flex', alignItems: 'center', gap: 8,
                    background: 'rgba(255,255,255,0.95)', borderRadius: 999,
                    padding: '5px 16px', border: '1.5px solid #BAE6FD',
                    fontFamily: 'Inter, sans-serif', fontSize: 10, fontWeight: 800,
                    letterSpacing: '0.14em', textTransform: 'uppercase', color: '#0891B2',
                }}>
                    <div style={{ width: 9, height: 9, borderRadius: '50%', border: '2px solid #0891B2', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
                    {searching ? 'Searching…' : 'AWS generating niches…'}
                </div>
            )}

            {/* ── SEARCH ERROR TOAST ── */}
            {searchError && (
                <div style={{
                    position: 'absolute', top: 55, left: '50%', transform: 'translateX(-50%)',
                    zIndex: 30, background: 'rgba(255,245,245,0.97)', borderRadius: 12,
                    padding: '8px 18px', border: '1.5px solid #FCA5A5',
                    fontFamily: 'Inter, sans-serif', fontSize: 10, fontWeight: 700,
                    color: '#991B1B', letterSpacing: '0.08em',
                    boxShadow: '0 2px 12px rgba(239,68,68,0.12)',
                }}>
                    ⚠ {searchError}
                    <span onClick={() => setSearchError(null)} style={{ marginLeft: 10, cursor: 'pointer', opacity: 0.6 }}>✕</span>
                </div>
            )}

            {/* ── SWIPE DOWN HINT ── */}
            {(searching || selectedTier !== null) && (
                <div style={{
                    position: 'absolute', top: 60, left: '50%', transform: 'translateX(-50%)',
                    zIndex: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                    animation: 'bounce 2s infinite'
                }}>
                    <div style={{
                        background: 'rgba(255,255,255,0.95)', border: '2px solid #0891B2',
                        borderRadius: 999, padding: '8px 22px',
                        fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 900,
                        letterSpacing: '0.15em', textTransform: 'uppercase', color: '#0891B2',
                        boxShadow: '0 8px 32px rgba(8,145,178,0.2)',
                        display: 'flex', alignItems: 'center', gap: 10
                    }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#0891B2', opacity: 0.8 }}></span>
                        Swipe down to see results
                    </div>
                </div>
            )}



            {/* ── LEAF TOPIC CARDS ── */}
            {selectedTier !== null && leafTopics.length > 0 && (
                <div style={{
                    position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)',
                    zIndex: 30, display: 'flex', flexWrap: 'wrap', gap: 9, justifyContent: 'center', maxWidth: '90vw',
                }}>
                    {leafTopics.map((l, i) => (
                        <button key={i} onClick={() => handleLeafClick(l)} disabled={searching} style={{
                            fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 10,
                            letterSpacing: '0.13em', textTransform: 'uppercase',
                            color: selectedDomain?.colors[1] || '#0891B2',
                            background: 'rgba(255,255,255,0.96)',
                            border: `2px solid ${selectedDomain?.colors[1] || '#BAE6FD'}`,
                            borderRadius: 999, padding: '7px 16px', cursor: searching ? 'wait' : 'pointer',
                            boxShadow: `0 2px 12px ${selectedDomain?.colors[1] || '#BAE6FD'}40`,
                            transition: 'all 0.16s',
                        }}
                            onMouseEnter={e => { e.currentTarget.style.background = selectedDomain?.colors[1]; e.currentTarget.style.color = '#fff'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.96)'; e.currentTarget.style.color = selectedDomain?.colors[1]; }}
                        >
                            {searching ? '⏳' : '🔍'} {l}
                        </button>
                    ))}
                </div>
            )}

            {/* ── HINT ── */}
            <div style={{
                position: 'absolute', bottom: 12, right: 14, zIndex: 30,
                fontFamily: 'Inter, sans-serif', fontSize: 9, fontWeight: 700,
                letterSpacing: '0.16em', textTransform: 'uppercase', color: '#0891B2',
                background: 'rgba(255,255,255,0.75)', borderRadius: 999, padding: '4px 12px',
                pointerEvents: 'none',
            }}>
                {!isZoomed && '↑ Tap a mountain or its icon to explore'}
                {isZoomed && selectedTier === null && '↑ Tap a glowing ring to dive deeper'}
                {selectedTier !== null && (selectedDomain?.isPersonalized ? '↑ Scroll down to see your Community Vision' : '↑ Tap a topic card to search')}
            </div>

            {/* ── CANVAS ── */}
            <Canvas camera={{ position: [0, 12, 46], fov: 48 }} shadows style={{ background: 'transparent' }}>
                <fog attach="fog" args={['#B2EBF2', 58, 125]} />
                <ambientLight intensity={1.2} />
                <pointLight position={[0, 28, 8]} intensity={1.5} castShadow />
                <directionalLight position={[-20, 18, 6]} intensity={0.45} />
                <pointLight position={[0, -2, 0]} intensity={0.4} color="#00C4E8" />

                <CameraRig target={cam} />

                <AnimatedOcean />
                <OceanFoam />
                <Sparkles />

                {effectiveDomains.map(domain => (
                    <Mountain
                        key={domain.id}
                        domain={domain}
                        isSelected={selectedDomain?.id === domain.id}
                        isMapped={atlasMappingResult?.domainId === domain.id || (domain.isPersonalized && !!atlasMappingResult)}
                        tierLabels={selectedDomain?.id === domain.id ? tierTopics : []}
                        highlightedTier={selectedDomain?.id === domain.id ? selectedTier : null}
                        onDomainClick={handleDomainClick}
                        onRingClick={handleRingClick}
                        zoomed={isZoomed && selectedDomain?.id === domain.id}
                    />
                ))}
            </Canvas>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes bounce {
                    0%, 100% { transform: translate(-50%, 0); shadow: 0 4px 20px rgba(8,145,178,0.2); }
                    50% { transform: translate(-50%, -10px); shadow: 0 8px 32px rgba(8,145,178,0.3); }
                }
            `}</style>
        </div>
    );
}

export default function ExploreTerrain(props) {
    return (
        <ExploreTerrainErrorBoundary>
            <ExploreTerrainInner {...props} />
        </ExploreTerrainErrorBoundary>
    );
}
