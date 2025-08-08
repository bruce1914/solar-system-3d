// Solar System 3D Explorer - Ultra Realistic Version
class SolarSystem {
    constructor() {
        // Check if Three.js is loaded
        if (typeof THREE === 'undefined') {
            console.error('THREE.js library is not loaded!');
            alert('THREE.js library failed to load. Please check your internet connection.');
            return;
        }
        
        console.log('THREE.js version:', THREE.REVISION);
        
        // Check WebGL support
        if (!this.isWebGLAvailable()) {
            console.error('WebGL is not supported in this browser!');
            alert('WebGL is not supported in your browser. Please use a modern browser.');
            return;
        }
        
        try {
            this.scene = new THREE.Scene();
            this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 50000);
            this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            console.log('Renderer created successfully:', this.renderer);
        } catch (error) {
            console.error('Failed to create Three.js objects:', error);
            alert('Failed to initialize 3D graphics. Error: ' + error.message);
            return;
        }
        this.controls = null;
        this.planets = [];
        this.clock = new THREE.Clock();
        this.textureLoader = new THREE.TextureLoader();
        this.textureLoader.setCrossOrigin('anonymous');
        
        // Raycaster for mouse interaction
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.selectedPlanet = null;

        // Animation state
        this.animationEnabled = false;
        this.animationSpeed = 1.0;

        // Texture URLs from a reliable source (e.g., NASA, etc.)
        this.textureUrls = {
            sun: 'textures/8k_sun.jpg',
            mercury: 'textures/8k_mercury.jpg',
            venus: 'textures/8k_venus_surface.jpg',
            earth: 'textures/8k_earth_daymap.jpg',
            earth_night: 'textures/8k_earth_nightmap.jpg',
            earth_clouds: 'textures/8k_earth_clouds.jpg',
            earth_normal: 'textures/8k_earth_normal_map.jpg',
            earth_specular: 'textures/8k_earth_specular_map.jpg',
            mars: 'textures/8k_mars.jpg',
            jupiter: 'textures/8k_jupiter.jpg',
            saturn: 'textures/8k_saturn.jpg',
            saturn_rings: 'textures/8k_saturn_ring_alpha.png',
            uranus: 'textures/2k_uranus.jpg',
            neptune: 'textures/2k_neptune.jpg',
            moon: 'textures/8k_moon.jpg',
            starfield: 'textures/8k_stars_milky_way.jpg'
        };

        this.init();
    }

    isWebGLAvailable() {
        try {
            const canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
        } catch (e) {
            return false;
        }
    }

    async init() {
        this.setupRenderer();
        this.setupCamera();
        this.setupControls();
        this.setupLighting();
        this.setupPostProcessing();
        await this.createEnvironment();
        await this.createSolarSystem();
        this.setupUI();
        this.setupEventListeners();
        this.animate();
    }

    setupRenderer() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 0.6;
        document.getElementById('container').appendChild(this.renderer.domElement);
    }

    setupCamera() {
        this.camera.position.set(0, 50, 150);
        this.camera.lookAt(0, 0, 0);
    }

    setupControls() {
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 10;
        this.controls.maxDistance = 5000;
        this.controls.maxPolarAngle = Math.PI / 2 - 0.05; // Prevent camera from going below the plane
    }

    setupLighting() {
        // Soft ambient light for basic visibility
        const ambientLight = new THREE.AmbientLight(0x404040, 0.15);
        this.scene.add(ambientLight);

        // Main directional light from the sun - reduced intensity
        const sunLight = new THREE.DirectionalLight(0xffffff, 0.8);
        sunLight.position.set(0, 0, 0);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        sunLight.shadow.camera.near = 0.1;
        sunLight.shadow.camera.far = 1000;
        sunLight.shadow.camera.left = -500;
        sunLight.shadow.camera.right = 500;
        sunLight.shadow.camera.top = 500;
        sunLight.shadow.camera.bottom = -500;
        this.scene.add(sunLight);
        
        // Very soft hemisphere light
        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.1);
        this.scene.add(hemiLight);
        
        // Point light at sun position with reduced intensity
        const pointLight = new THREE.PointLight(0xffffff, 0.5, 1000);
        pointLight.position.set(0, 0, 0);
        this.scene.add(pointLight);
        
        // Store sun light reference for dynamic updates
        this.sunLight = sunLight;
        this.pointLight = pointLight;
    }

    async createEnvironment() {
        console.log('Creating environment...');
        
        // Create a subtle starfield background
        const starsGeometry = new THREE.BufferGeometry();
        const starsMaterial = new THREE.PointsMaterial({ 
            color: 0xffffff, 
            size: 1.5,
            sizeAttenuation: false,
            transparent: true,
            opacity: 0.4
        });
        
        const starsVertices = [];
        const starsColors = [];
        
        for (let i = 0; i < 8000; i++) {
            const x = (Math.random() - 0.5) * 20000;
            const y = (Math.random() - 0.5) * 20000;
            const z = (Math.random() - 0.5) * 20000;
            starsVertices.push(x, y, z);
            
            // Add subtle color variation to stars
            const color = new THREE.Color();
            color.setHSL(Math.random() * 0.05 + 0.55, 0.1, 0.6 + Math.random() * 0.3);
            starsColors.push(color.r, color.g, color.b);
        }
        
        starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
        starsGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starsColors, 3));
        starsMaterial.vertexColors = true;
        
        const starField = new THREE.Points(starsGeometry, starsMaterial);
        this.scene.add(starField);
        
        console.log('Environment created successfully');
    }

    async createSolarSystem() {
        console.log('Creating solar system...');
        
        const planetData = [
            { name: 'Sun', radius: 15, distance: 0, speed: 0, texture: this.textureUrls.sun, emissive: 0xffddaa },
            { name: 'Mercury', radius: 2, distance: 50, speed: 1.2, texture: this.textureUrls.mercury },
            { name: 'Venus', radius: 3, distance: 70, speed: 0.9, texture: this.textureUrls.venus },
            { name: 'Earth', radius: 3.2, distance: 100, speed: 0.7, texture: this.textureUrls.earth, nightTexture: this.textureUrls.earth_night, cloudTexture: this.textureUrls.earth_clouds },
            { name: 'Mars', radius: 2.5, distance: 130, speed: 0.5, texture: this.textureUrls.mars },
            { name: 'Jupiter', radius: 8, distance: 200, speed: 0.3, texture: this.textureUrls.jupiter },
            { name: 'Saturn', radius: 7, distance: 280, speed: 0.2, texture: this.textureUrls.saturn, rings: { texture: this.textureUrls.saturn_rings, innerRadius: 9, outerRadius: 15 } },
            { name: 'Uranus', radius: 4, distance: 350, speed: 0.15, texture: this.textureUrls.uranus },
            { name: 'Neptune', radius: 4, distance: 420, speed: 0.1, texture: this.textureUrls.neptune },
        ];

        const promises = planetData.map(data => this.createPlanet(data));
        this.planets = await Promise.all(promises);
        
        console.log('Planets created:', this.planets.length);
        
        this.planets.forEach((planet, index) => {
            console.log(`Adding planet ${planet.name} to scene`);
            this.scene.add(planet.group);
            if (planet.distance > 0) {
                this.createOrbitPath(planet.distance);
            }
        });

        this.createAsteroidBelt();
        console.log('Solar system creation complete');
    }

    getFallbackColor(planetName) {
        const colors = {
            'Sun': 0xffff00,
            'Mercury': 0x8c7853,
            'Venus': 0xffc649,
            'Earth': 0x6b93d6,
            'Mars': 0xcd5c5c,
            'Jupiter': 0xd8ca9d,
            'Saturn': 0xfad5a5,
            'Uranus': 0x4fd0e7,
            'Neptune': 0x4b70dd
        };
        return colors[planetName] || 0x888888;
    }

    async createPlanet(data) {
        const geometry = new THREE.SphereGeometry(data.radius, 64, 64);

        let texture = null;
        try {
            texture = await this.textureLoader.loadAsync(data.texture);
            console.log(`Texture loaded successfully for ${data.name}`);
        } catch (error) {
            console.warn(`Failed to load texture for ${data.name}:`, error);
            // Create a fallback colored material
            texture = null;
        }

        const material = new THREE.MeshStandardMaterial({
            map: texture,
            metalness: 0.0,
            roughness: 0.8,
            color: texture ? 0xffffff : this.getFallbackColor(data.name),
            emissive: texture ? 0x000000 : this.getFallbackColor(data.name),
            emissiveIntensity: texture ? 0 : 0.05
        });

        if (data.emissive) {
            material.emissive = new THREE.Color(data.emissive);
            material.emissiveMap = material.map;
            material.emissiveIntensity = 0.8;
        }

        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        const group = new THREE.Group();
        group.add(mesh);

        const planetObject = {
            group,
            mesh,
            ...data,
            angle: 0, // Start all planets at angle 0 (aligned)
        };

        // Position planet initially in a straight line
        if (data.distance > 0) {
            group.position.x = data.distance;
            group.position.z = 0;
        }

        if (data.name === 'Earth') {
            await this.enhanceEarth(planetObject, data);
        }

        if (data.rings) {
            const rings = await this.createRings(data.rings);
            group.add(rings);
        }

        return planetObject;
    }

    async enhanceEarth(earthObject, data) {
        const textureLoader = this.textureLoader;

        // Clouds
        try {
            const cloudsTexture = await textureLoader.loadAsync(this.textureUrls.earth_clouds);
            const cloudsMaterial = new THREE.MeshStandardMaterial({
                map: cloudsTexture,
                transparent: true,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
                opacity: 0.5
            });
            const cloudsMesh = new THREE.Mesh(new THREE.SphereGeometry(data.radius * 1.01, 64, 64), cloudsMaterial);
            earthObject.group.add(cloudsMesh);
            earthObject.clouds = cloudsMesh;
            console.log('Earth clouds texture loaded successfully');
        } catch (error) {
            console.warn('Failed to load Earth clouds texture:', error);
            // Create a simple cloud mesh without texture
            const cloudsMaterial = new THREE.MeshStandardMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.3
            });
            const cloudsMesh = new THREE.Mesh(new THREE.SphereGeometry(data.radius * 1.01, 64, 64), cloudsMaterial);
            earthObject.group.add(cloudsMesh);
            earthObject.clouds = cloudsMesh;
        }

        // Night side, Normal Map, and Specular Map
        try {
            const [nightTexture, normalTexture, specularTexture] = await Promise.all([
                textureLoader.loadAsync(this.textureUrls.earth_night),
                textureLoader.loadAsync(this.textureUrls.earth_normal),
                textureLoader.loadAsync(this.textureUrls.earth_specular)
            ]);

            earthObject.mesh.material.emissiveMap = nightTexture;
            earthObject.mesh.material.emissive = new THREE.Color(0xffffff);
            earthObject.mesh.material.emissiveIntensity = 0;

            earthObject.mesh.material.normalMap = normalTexture;
            earthObject.mesh.material.normalScale = new THREE.Vector2(0.5, 0.5);

            earthObject.mesh.material.roughnessMap = specularTexture;
            earthObject.mesh.material.metalness = 0.4;

            earthObject.mesh.material.needsUpdate = true;
            console.log('Earth enhancement textures loaded successfully');
        } catch (error) {
            console.warn('Failed to load Earth enhancement textures:', error);
        }

        // Atmosphere glow
        const atmosphereGeometry = new THREE.SphereGeometry(data.radius * 1.03, 64, 64);
        const atmosphereMaterial = new THREE.ShaderMaterial({
            vertexShader: `
                varying vec3 vNormal;
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                varying vec3 vNormal;
                void main() {
                    float intensity = pow(0.6 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
                    gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity;
                }
            `,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
            transparent: true
        });
        const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        earthObject.group.add(atmosphere);
    }

    createRings(ringData) {
        const texture = this.textureLoader.load(ringData.texture);
        
        // Use MeshBasicMaterial with enhanced properties for better visibility
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            side: THREE.DoubleSide,
            alphaTest: 0.001,
            opacity: 1.0,
            color: 0xffffff,
            // Add emissive to make rings more visible
            emissive: 0x444444,
            emissiveIntensity: 0.2
        });

        const geometry = new THREE.RingGeometry(ringData.innerRadius, ringData.outerRadius, 128);
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.x = Math.PI / 2;
        mesh.castShadow = false;
        mesh.receiveShadow = false; // Disable shadow receiving to avoid darkening
        return mesh;
    }

    createOrbitPath(radius) {
        const geometry = new THREE.BufferGeometry();
        const points = [];
        for (let i = 0; i <= 360; i++) {
            const theta = (i * Math.PI) / 180;
            points.push(new THREE.Vector3(Math.cos(theta) * radius, 0, Math.sin(theta) * radius));
        }
        geometry.setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ color: 0x333333 });
        return new THREE.Line(geometry, material);
    }

    createAsteroidBelt() {
        const asteroids = new THREE.Group();
        const asteroidCount = 1500;
        const textureLoader = this.textureLoader;
        const asteroidTexture = textureLoader.load('textures/asteroid.png'); // A generic rock texture

        for (let i = 0; i < asteroidCount; i++) {
            const size = Math.random() * 0.5 + 0.1;
            const geometry = new THREE.SphereGeometry(size, 8, 8);
            const material = new THREE.MeshStandardMaterial({ map: asteroidTexture, roughness: 0.9, metalness: 0.1 });
            const asteroid = new THREE.Mesh(geometry, material);

            const angle = Math.random() * Math.PI * 2;
            const distance = 800 + Math.random() * 200;
            const y = (Math.random() - 0.5) * 20;

            asteroid.position.set(Math.cos(angle) * distance, y, Math.sin(angle) * distance);
            asteroid.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
            asteroids.add(asteroid);
        }
        this.scene.add(asteroids);
    }

    setupPostProcessing() {
        this.composer = new THREE.EffectComposer(this.renderer);
        this.composer.addPass(new THREE.RenderPass(this.scene, this.camera));
        const bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
        bloomPass.threshold = 0;
        bloomPass.strength = 1.2; // Glow intensity
        bloomPass.radius = 0;
        this.composer.addPass(bloomPass);
    }

    setupUI() {
        const toggle = document.getElementById('animation-toggle');
        toggle.checked = this.animationEnabled;
        console.log('Initial animation state:', this.animationEnabled);
        toggle.addEventListener('change', (e) => {
            this.animationEnabled = e.target.checked;
            console.log('Animation toggled:', this.animationEnabled);
        });

        const speedSlider = document.getElementById('speed-slider');
        const speedValue = document.getElementById('speed-value');
        speedSlider.value = this.animationSpeed;
        speedValue.textContent = `${this.animationSpeed.toFixed(2)}x`;
        speedSlider.addEventListener('input', (e) => {
            this.animationSpeed = parseFloat(e.target.value);
            speedValue.textContent = `${this.animationSpeed.toFixed(2)}x`;
        });
        
        const resetButton = document.getElementById('reset-camera');
        resetButton.addEventListener('click', () => {
            this.resetCamera();
        });
        
        // Add mouse event listeners for planet interaction
        this.setupMouseInteraction();
    }
    
    setupMouseInteraction() {
        const canvas = this.renderer.domElement;
        let clickCount = 0;
        let clickTimer = null;
        
        canvas.addEventListener('click', (event) => {
            clickCount++;
            
            if (clickCount === 1) {
                clickTimer = setTimeout(() => {
                    clickCount = 0;
                }, 300); // 300ms window for double click
            } else if (clickCount === 2) {
                clearTimeout(clickTimer);
                clickCount = 0;
                this.handleDoubleClick(event);
            }
        });
        
        canvas.addEventListener('mousemove', (event) => {
            this.updateMousePosition(event);
        });
    }
    
    updateMousePosition(event) {
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    }
    
    handleDoubleClick(event) {
        this.updateMousePosition(event);
        
        // Update raycaster
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        // Get all planet meshes for intersection testing
        const planetMeshes = this.planets.map(planet => planet.mesh);
        const intersects = this.raycaster.intersectObjects(planetMeshes);
        
        if (intersects.length > 0) {
            const clickedMesh = intersects[0].object;
            const planet = this.planets.find(p => p.mesh === clickedMesh);
            
            if (planet) {
                console.log('Double clicked on:', planet.name);
                this.zoomToPlanet(planet);
            }
        }
    }
    
    zoomToPlanet(planet) {
        this.selectedPlanet = planet;
        
        // Calculate zoom distance based on planet size
        const distance = planet.radius * 8; // 8x planet radius for good viewing
        const minDistance = 20; // Minimum distance to prevent too close zoom
        const finalDistance = Math.max(distance, minDistance);
        
        // Get planet's current position
        const planetPosition = planet.group.position.clone();
        
        // Calculate camera position (slightly above and in front of planet)
        const cameraPosition = planetPosition.clone();
        cameraPosition.x += finalDistance * 0.7;
        cameraPosition.y += finalDistance * 0.3;
        cameraPosition.z += finalDistance * 0.7;
        
        // Animate camera to new position
        this.animateCamera(cameraPosition, planetPosition, 1500); // 1.5 second animation
        
        console.log(`Zooming to ${planet.name} at distance ${finalDistance}`);
    }
    
    animateCamera(targetPosition, targetLookAt, duration) {
        const startPosition = this.camera.position.clone();
        const startLookAt = this.controls.target.clone();
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (ease out)
            const easeOut = 1 - Math.pow(1 - progress, 3);
            
            // Interpolate camera position
            this.camera.position.lerpVectors(startPosition, targetPosition, easeOut);
            
            // Interpolate look at target
            this.controls.target.lerpVectors(startLookAt, targetLookAt, easeOut);
            this.controls.update();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }
    
    resetCamera() {
        this.selectedPlanet = null;
        const defaultPosition = new THREE.Vector3(0, 80, 250);
        const defaultTarget = new THREE.Vector3(0, 0, 0);
        this.animateCamera(defaultPosition, defaultTarget, 1000); // 1 second animation
        console.log('Camera reset to overview');
    }

    setupEventListeners() {
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.composer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    updateEarth(earth, sunPosition) {
        const earthPos = new THREE.Vector3();
        earth.group.getWorldPosition(earthPos);
        const sunDir = new THREE.Vector3().subVectors(sunPosition, earthPos).normalize();
        const camDir = new THREE.Vector3().subVectors(this.camera.position, earthPos).normalize();
        
        // Day/Night cycle
        const dot = sunDir.dot(new THREE.Vector3(1, 0, 0)); // simplified
        earth.mesh.material.emissiveIntensity = Math.max(0, -dot * 2);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        const deltaTime = this.clock.getDelta();

        // Always rotate planets on their axis
        this.planets.forEach(planet => {
            planet.mesh.rotation.y += 0.1 * deltaTime;
        });
        
        // Only move planets in orbit if animation is enabled
        if (this.animationEnabled) {
            this.planets.forEach(planet => {
                if (planet.distance > 0) {
                    planet.angle += planet.speed * this.animationSpeed * deltaTime;
                    planet.group.position.x = Math.cos(planet.angle) * planet.distance;
                    planet.group.position.z = Math.sin(planet.angle) * planet.distance;
                }
                if (planet.name === 'Earth' && planet.clouds) {
                    planet.clouds.rotation.y += 0.15 * deltaTime;
                    this.updateEarth(planet, this.planets[0].group.position);
                }
            });
        }

        this.controls.update();
        this.composer.render();
    }
}

// Need to load EffectComposer and UnrealBloomPass
const loadScript = (src) => {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
    });
};

async function main() {
    try {
        await loadScript('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/EffectComposer.js');
        await loadScript('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/RenderPass.js');
        await loadScript('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/shaders/CopyShader.js');
        await loadScript('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/ShaderPass.js');
        await loadScript('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/shaders/LuminosityHighPassShader.js');
        await loadScript('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/UnrealBloomPass.js');
        new SolarSystem();
    } catch (error) {
        console.error('Failed to load necessary Three.js components:', error);
        document.getElementById('container').innerText = 'Error: Could not load required 3D components. Please check the console.';
    }
}

window.addEventListener('load', main);
