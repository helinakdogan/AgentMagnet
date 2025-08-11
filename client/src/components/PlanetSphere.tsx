import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

interface PlanetSphereProps {
  color: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  size?: number;
}

const PlanetSphere: React.FC<PlanetSphereProps> = ({ 
  color, 
  icon, 
  title, 
  description, 
  size = 100 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sphereRef = useRef<THREE.Mesh | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.z = 200;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true 
    });
    renderer.setSize(size, size);
    renderer.setClearColor(0x000000, 0);
    rendererRef.current = renderer;

    // Create sphere geometry - make it bigger
    const geometry = new THREE.SphereGeometry(size * 0.45, 32, 32);

    // Create material with custom shader for glassmorphic planet effect
    const material = new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color(color) },
        time: { value: 0 }
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec3 vWorldPosition;
        
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        uniform float time;
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec3 vWorldPosition;
        
        void main() {
          vec3 light = normalize(vec3(1.0, 1.0, 1.0));
          float intensity = dot(vNormal, light);
          
          // Create gradient background like "Ready to discover" button
          vec3 gradientStart = vec3(0.4, 0.2, 0.8); // Deep purple
          vec3 gradientEnd = vec3(0.1, 0.1, 0.2);   // Dark almost black
          
          // Create gradient based on position
          float gradientFactor = (vPosition.y + 1.0) * 0.5; // 0 to 1
          vec3 gradientColor = mix(gradientEnd, gradientStart, gradientFactor);
          
          // Create glass effect with gradient background
          vec3 glassColor = vec3(0.95, 0.95, 0.98);
          float glassAlpha = 0.3 + intensity * 0.4;
          
          // Create subtle internal refraction
          vec3 refraction = vec3(0.98, 0.98, 1.0) * (0.8 + 0.2 * sin(time * 1.0 + vWorldPosition.x * 0.05));
          
          // Create glass highlight effect
          vec3 highlight = vec3(1.0, 1.0, 1.0);
          float highlightIntensity = pow(max(0.0, dot(reflect(-light, vNormal), normalize(vPosition))), 128.0);
          
          // Create fresnel effect for glass edges
          float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 4.0);
          
          // Combine all effects with gradient background
          vec3 finalColor = mix(gradientColor, glassColor, 0.7);
          finalColor = mix(finalColor, refraction, 0.2);
          finalColor = mix(finalColor, highlight, highlightIntensity * 0.8);
          finalColor = mix(finalColor, vec3(1.0, 1.0, 1.0), fresnel * 0.2);
          
          // Glass transparency
          float alpha = glassAlpha + fresnel * 0.2 + highlightIntensity * 0.3;
          alpha = clamp(alpha, 0.2, 0.8);
          
          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      transparent: true,
      alphaTest: 0.05
    });

    // Create sphere mesh
    const sphere = new THREE.Mesh(geometry, material);
    sphereRef.current = sphere;
    scene.add(sphere);

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);

    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Add point light for subtle glow effect
    const pointLight = new THREE.PointLight(color, 0.2, 200);
    pointLight.position.set(0, 0, 100);
    scene.add(pointLight);

    // Mount renderer
    mountRef.current.appendChild(renderer.domElement);

    // Animation loop
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      
      if (sphere) {
        sphere.rotation.y += 0.01;
        sphere.rotation.x += 0.005;
        
        // Update shader time uniform
        if (material.uniforms.time) {
          material.uniforms.time.value += 0.01;
        }
      }
      
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, [color, size]);

  // Handle hover effects
  useEffect(() => {
    if (sphereRef.current) {
      if (isHovered) {
        sphereRef.current.scale.setScalar(1.1);
        sphereRef.current.rotation.y += 0.1;
      } else {
        sphereRef.current.scale.setScalar(1.0);
      }
    }
  }, [isHovered]);

  return (
    <div 
      className="planet-sphere-container"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div ref={mountRef} className="planet-canvas" />
      
      {/* Overlay content with text on sphere */}
      <div className="planet-overlay">
        <div className="planet-icon-overlay">
          {icon}
        </div>
        
        {/* Text overlay on sphere */}
        <div className={`planet-text-overlay ${isHovered ? 'visible' : ''}`}>
          <h4 className="planet-title">{title}</h4>
          <p className="planet-description">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default PlanetSphere; 