// Enhanced Solar System 3D Explorer with High-Quality Textures
class SolarSystem {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.controls = null;
        this.planets = [];
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        this.init();
        this.createSolarSystem();
        this.setupControls();
        this.setupEventListeners();
        this.animate();
    }
    
    init() {
        // Setup renderer with better quality
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        document.getElementById('container').appendChild(this.renderer.domElement);
        
        // Setup camera position
        this.camera.position.set(0, 30, 80);
        
        // Add enhanced starfield background
        this.createStarfield();
        
        // Add nebula background
        this.createNebulaBackground();
    }
    
    createStarfield() {
        const starsGeometry = new THREE.BufferGeometry();
        const starsVertices = [];
        const starsColors = [];
        
        for (let i = 0; i < 15000; i++) {
            const x = (Math.random() - 0.5) * 3000;
            const y = (Math.random() - 0.5) * 3000;
            const z = (Math.random() - 0.5) * 3000;
            starsVertices.push(x, y, z);
            
            // Random star colors (white, blue, yellow, red)
            const starType = Math.random();
            if (starType < 0.7) {
                starsColors.push(1, 1, 1); // White
            } else if (starType < 0.85) {
                starsColors.push(0.8, 0.8, 1); // Blue
            } else if (starType < 0.95) {
                starsColors.push(1, 1, 0.8); // Yellow
            } else {
                starsColors.push(1, 0.8, 0.8); // Red
            }
        }
        
        starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
        starsGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starsColors, 3));
        
        const starsMaterial = new THREE.PointsMaterial({ 
            size: 1.5, 
            vertexColors: true,
            transparent: true,
            opacity: 0.8
        });
        
        const stars = new THREE.Points(starsGeometry, starsMaterial);
        this.scene.add(stars);
    }
    
    createNebulaBackground() {
        // Create a large sphere for nebula background
        const nebulaGeometry = new THREE.SphereGeometry(1500, 32, 32);
        const nebulaMaterial = new THREE.MeshBasicMaterial({
            color: 0x220033,
            transparent: true,
            opacity: 0.1,
            side: THREE.BackSide
        });
        
        const nebula = new THREE.Mesh(nebulaGeometry, nebulaMaterial);
        this.scene.add(nebula);
    }
    
    createPlanetTexture(planetName) {
        // Create procedural textures for planets
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');
        
        switch(planetName) {
            case 'Sun':
                this.createSunTexture(ctx, canvas);
                break;
            case 'Mercury':
                this.createMercuryTexture(ctx, canvas);
                break;
            case 'Venus':
                this.createVenusTexture(ctx, canvas);
                break;
            case 'Earth':
                this.createEarthTexture(ctx, canvas);
                break;
            case 'Mars':
                this.createMarsTexture(ctx, canvas);
                break;
            case 'Jupiter':
                this.createJupiterTexture(ctx, canvas);
                break;
            case 'Saturn':
                this.createSaturnTexture(ctx, canvas);
                break;
            case 'Uranus':
                this.createUranusTexture(ctx, canvas);
                break;
            case 'Neptune':
                this.createNeptuneTexture(ctx, canvas);
                break;
            case 'Pluto':
                this.createPlutoTexture(ctx, canvas);
                break;
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        return texture;
    }
    
    createSunTexture(ctx, canvas) {
        // Create sun surface with solar flares
        const gradient = ctx.createRadialGradient(512, 512, 0, 512, 512, 512);
        gradient.addColorStop(0, '#FFF8DC');
        gradient.addColorStop(0.3, '#FFD700');
        gradient.addColorStop(0.6, '#FF8C00');
        gradient.addColorStop(1, '#FF4500');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 1024, 1024);
        
        // Add solar flare patterns
        for (let i = 0; i < 100; i++) {
            ctx.beginPath();
            ctx.arc(Math.random() * 1024, Math.random() * 1024, Math.random() * 40 + 10, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 0, ${Math.random() * 0.3 + 0.2})`;
            ctx.fill();
        }
    }
    
    createMercuryTexture(ctx, canvas) {
        // Gray rocky surface with craters
        ctx.fillStyle = '#8C7853';
        ctx.fillRect(0, 0, 1024, 1024);
        
        // Add craters
        for (let i = 0; i < 200; i++) {
            const x = Math.random() * 1024;
            const y = Math.random() * 1024;
            const radius = Math.random() * 30 + 5;
            
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(60, 60, 60, ${Math.random() * 0.5 + 0.3})`;
            ctx.fill();
        }
    }
    
    createVenusTexture(ctx, canvas) {
        // Thick cloudy atmosphere
        const gradient = ctx.createLinearGradient(0, 0, 1024, 1024);
        gradient.addColorStop(0, '#FFC649');
        gradient.addColorStop(0.5, '#FFB347');
        gradient.addColorStop(1, '#FF8C00');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 1024, 1024);
        
        // Add swirling cloud patterns
        for (let i = 0; i < 60; i++) {
            ctx.beginPath();
            ctx.ellipse(Math.random() * 1024, Math.random() * 1024, 
                       Math.random() * 100 + 40, Math.random() * 40 + 20, 
                       Math.random() * Math.PI, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.2 + 0.1})`;
            ctx.fill();
        }
    }
    
    createEarthTexture(ctx, canvas) {
        // Blue oceans and green/brown continents
        ctx.fillStyle = '#4169E1'; // Ocean blue
        ctx.fillRect(0, 0, 1024, 1024);
        
        // Add continents
        const continents = [
            {x: 200, y: 400, w: 300, h: 200}, // Africa/Europe
            {x: 400, y: 300, w: 240, h: 160},  // Asia
            {x: 100, y: 600, w: 200, h: 300},  // Americas
            {x: 700, y: 500, w: 160, h: 120}    // Australia
        ];
        
        continents.forEach(continent => {
            ctx.fillStyle = Math.random() > 0.5 ? '#228B22' : '#8B4513'; // Green or brown
            ctx.fillRect(continent.x, continent.y, continent.w, continent.h);
        });
        
        // Add clouds
        for (let i = 0; i < 80; i++) {
            ctx.beginPath();
            ctx.arc(Math.random() * 1024, Math.random() * 1024, Math.random() * 50 + 20, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.4 + 0.2})`;
            ctx.fill();
        }
    }
    
    createMarsTexture(ctx, canvas) {
        // Red desert surface
        ctx.fillStyle = '#CD5C5C';
        ctx.fillRect(0, 0, 1024, 1024);
        
        // Add darker regions
        for (let i = 0; i < 40; i++) {
            ctx.beginPath();
            ctx.arc(Math.random() * 1024, Math.random() * 1024, Math.random() * 80 + 40, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(139, 69, 19, ${Math.random() * 0.3 + 0.2})`;
            ctx.fill();
        }
        
        // Polar caps
        ctx.beginPath();
        ctx.arc(512, 100, 60, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(512, 924, 50, 0, Math.PI * 2);
        ctx.fill();
    }
    
    createJupiterTexture(ctx, canvas) {
        // Great Red Spot and bands
        const bands = ['#D2691E', '#F4A460', '#DEB887', '#D2B48C', '#BC8F8F'];
        
        // Create horizontal bands
        for (let y = 0; y < 1024; y += 80) {
            ctx.fillStyle = bands[Math.floor(Math.random() * bands.length)];
            ctx.fillRect(0, y, 1024, 80);
        }
        
        // Great Red Spot
        ctx.beginPath();
        ctx.ellipse(700, 600, 120, 80, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#B22222';
        ctx.fill();
    }
    
    createSaturnTexture(ctx, canvas) {
        // Similar to Jupiter but more muted
        const bands = ['#FAD5A5', '#DEB887', '#D2B48C', '#F5DEB3'];
        
        for (let y = 0; y < 1024; y += 70) {
            ctx.fillStyle = bands[Math.floor(Math.random() * bands.length)];
            ctx.fillRect(0, y, 1024, 70);
        }
    }
    
    createUranusTexture(ctx, canvas) {
        // Uniform blue-green color
        const gradient = ctx.createRadialGradient(512, 512, 0, 512, 512, 512);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#4FD0E7');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 1024, 1024);
    }
    
    createNeptuneTexture(ctx, canvas) {
        // Deep blue with storm patterns
        ctx.fillStyle = '#4169E1';
        ctx.fillRect(0, 0, 1024, 1024);
        
        // Add storm spots
        for (let i = 0; i < 20; i++) {
            ctx.beginPath();
            ctx.arc(Math.random() * 1024, Math.random() * 1024, Math.random() * 60 + 30, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(70, 130, 180, ${Math.random() * 0.4 + 0.3})`;
            ctx.fill();
        }
    }
    
    createPlutoTexture(ctx, canvas) {
        // Brown and tan surface
        ctx.fillStyle = '#A0522D';
        ctx.fillRect(0, 0, 1024, 1024);
        
        // Add surface features
        for (let i = 0; i < 30; i++) {
            ctx.beginPath();
            ctx.arc(Math.random() * 1024, Math.random() * 1024, Math.random() * 40 + 20, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(210, 180, 140, ${Math.random() * 0.3 + 0.2})`;
            ctx.fill();
        }
    }
    
    createSolarSystem() {
        // Planet data with realistic properties
        const planetData = [
            { name: 'Sun', radius: 10, distance: 0, color: 0xFDB813, emissive: 0xFDB813, rings: false },
            { name: 'Mercury', radius: 0.4, distance: 15, color: 0x8C7853, emissive: 0x000000, rings: false },
            { name: 'Venus', radius: 0.9, distance: 20, color: 0xFFC649, emissive: 0x000000, rings: false },
            { name: 'Earth', radius: 1, distance: 25, color: 0x6B93D6, emissive: 0x000000, rings: false },
            { name: 'Mars', radius: 0.5, distance: 30, color: 0xCD5C5C, emissive: 0x000000, rings: false },
            { name: 'Jupiter', radius: 5, distance: 45, color: 0xD8CA9D, emissive: 0x000000, rings: false },
            { name: 'Saturn', radius: 4, distance: 60, color: 0xFAD5A5, emissive: 0x000000, rings: true },
            { name: 'Uranus', radius: 2, distance: 75, color: 0x4FD0E7, emissive: 0x000000, rings: true },
            { name: 'Neptune', radius: 2, distance: 90, color: 0x4B70DD, emissive: 0x000000, rings: false },
            { name: 'Pluto', radius: 0.2, distance: 105, color: 0xA0522D, emissive: 0x000000, rings: false }
        ];
        
        // Create planets
        planetData.forEach((data, index) => {
            const planet = this.createPlanet(data);
            this.planets.push(planet);
            this.scene.add(planet.group);
            
            // Add orbit path
            if (data.distance > 0) {
                this.createOrbitPath(data.distance);
            }
        });
        
        // Add Moon to Earth
        this.addMoon();
        
        // Create asteroid belt
        this.createAsteroidBelt();
        
        // Add lighting
        this.setupLighting();
    }
    
    createPlanet(data) {
        const geometry = new THREE.SphereGeometry(data.radius, 64, 64);
        
        // Create detailed texture
        const texture = this.createPlanetTexture(data.name);
        
        const material = new THREE.MeshPhongMaterial({ 
            map: texture,
            emissive: data.emissive,
            emissiveIntensity: data.name === 'Sun' ? 0.5 : 0,
            shininess: data.name === 'Earth' ? 100 : 30
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.userData = { name: data.name, info: this.getPlanetInfo(data.name) };
        
        const group = new THREE.Group();
        group.add(mesh);
        
        // Add rings for Saturn and Uranus
        if (data.rings) {
            const rings = this.createRings(data.radius);
            group.add(rings);
        }
        
        // Position planet (no animation)
        group.position.x = data.distance;
        
        return {
            group: group,
            mesh: mesh,
            distance: data.distance,
            name: data.name
        };
    }
    
    createRings(planetRadius) {
        const innerRadius = planetRadius * 1.2;
        const outerRadius = planetRadius * 2.5;
        const geometry = new THREE.RingGeometry(innerRadius, outerRadius, 64);
        
        // Create ring texture
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        // Create ring pattern
        for (let r = 0; r < 256; r += 5) {
            const opacity = Math.random() * 0.3 + 0.1;
            ctx.strokeStyle = `rgba(200, 200, 200, ${opacity})`;
            ctx.lineWidth = Math.random() * 3 + 1;
            ctx.beginPath();
            ctx.arc(256, 256, r, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        const ringTexture = new THREE.CanvasTexture(canvas);
        
        const material = new THREE.MeshBasicMaterial({ 
            map: ringTexture,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.7
        });
        
        const rings = new THREE.Mesh(geometry, material);
        rings.rotation.x = Math.PI / 2;
        return rings;
    }
    
    addMoon() {
        const earthPlanet = this.planets.find(p => p.name === 'Earth');
        if (earthPlanet) {
            const moonGeometry = new THREE.SphereGeometry(0.25, 32, 32);
            
            // Create moon texture
            const moonTexture = this.createMoonTexture();
            const moonMaterial = new THREE.MeshPhongMaterial({ 
                map: moonTexture,
                color: 0xC0C0C0 
            });
            
            const moon = new THREE.Mesh(moonGeometry, moonMaterial);
            moon.position.set(3, 0, 0);
            moon.userData = { name: 'Moon', info: 'Earth\'s natural satellite' };
            earthPlanet.group.add(moon);
        }
    }
    
    createMoonTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        // Gray surface
        ctx.fillStyle = '#C0C0C0';
        ctx.fillRect(0, 0, 512, 512);
        
        // Add craters
        for (let i = 0; i < 150; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const radius = Math.random() * 25 + 5;
            
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(80, 80, 80, ${Math.random() * 0.4 + 0.3})`;
            ctx.fill();
        }
        
        return new THREE.CanvasTexture(canvas);
    }
    
    createOrbitPath(radius) {
        const curve = new THREE.EllipseCurve(0, 0, radius, radius, 0, 2 * Math.PI, false, 0);
        const points = curve.getPoints(100);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ 
            color: 0x444444, 
            transparent: true, 
            opacity: 0.3 
        });
        
        const orbit = new THREE.Line(geometry, material);
        orbit.rotation.x = Math.PI / 2;
        this.scene.add(orbit);
    }
    
    createAsteroidBelt() {
        const asteroidGroup = new THREE.Group();
        const asteroidCount = 800;
        
        for (let i = 0; i < asteroidCount; i++) {
            const size = Math.random() * 0.15 + 0.05;
            const geometry = new THREE.SphereGeometry(size, 8, 8);
            const material = new THREE.MeshPhongMaterial({ 
                color: new THREE.Color().setHSL(0.1, 0.3, Math.random() * 0.3 + 0.2)
            });
            const asteroid = new THREE.Mesh(geometry, material);
            
            const angle = Math.random() * Math.PI * 2;
            const distance = 35 + Math.random() * 10; // Between Mars and Jupiter
            const height = (Math.random() - 0.5) * 3;
            
            asteroid.position.x = Math.cos(angle) * distance;
            asteroid.position.z = Math.sin(angle) * distance;
            asteroid.position.y = height;
            
            asteroidGroup.add(asteroid);
        }
        
        this.scene.add(asteroidGroup);
    }
    
    setupLighting() {
        // Sun light (point light)
        const sunLight = new THREE.PointLight(0xFFFFFF, 3, 2000);
        sunLight.position.set(0, 0, 0);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 4096;
        sunLight.shadow.mapSize.height = 4096;
        sunLight.shadow.camera.near = 0.1;
        sunLight.shadow.camera.far = 2000;
        this.scene.add(sunLight);
        
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.2);
        this.scene.add(ambientLight);
        
        // Add directional light for better planet visibility
        const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.5);
        directionalLight.position.set(50, 50, 50);
        this.scene.add(directionalLight);
    }
    
    setupControls() {
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 5;
        this.controls.maxDistance = 500;
        this.controls.autoRotate = false;
    }
    
    setupEventListeners() {
        // Window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
        
        // Mouse click for planet info
        window.addEventListener('click', (event) => {
            this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            
            this.raycaster.setFromCamera(this.mouse, this.camera);
            
            const intersectableObjects = [];
            this.planets.forEach(planet => {
                intersectableObjects.push(planet.mesh);
            });
            
            const intersects = this.raycaster.intersectObjects(intersectableObjects);
            
            if (intersects.length > 0) {
                const object = intersects[0].object;
                this.showPlanetInfo(object.userData.name, object.userData.info);
            } else {
                this.hidePlanetInfo();
            }
        });
        
        // Keyboard controls
        const keys = {};
        window.addEventListener('keydown', (event) => {
            keys[event.code] = true;
        });
        
        window.addEventListener('keyup', (event) => {
            keys[event.code] = false;
        });
        
        // Camera movement with keyboard
        const moveCamera = () => {
            const speed = 1;
            if (keys['KeyW']) this.camera.position.z -= speed;
            if (keys['KeyS']) this.camera.position.z += speed;
            if (keys['KeyA']) this.camera.position.x -= speed;
            if (keys['KeyD']) this.camera.position.x += speed;
            if (keys['Space']) this.camera.position.y += speed;
            if (keys['ShiftLeft']) this.camera.position.y -= speed;
            
            requestAnimationFrame(moveCamera);
        };
        moveCamera();
    }
    
    showPlanetInfo(name, info) {
        document.getElementById('planet-name').textContent = name;
        document.getElementById('planet-description').textContent = info;
        document.getElementById('planet-info').style.display = 'block';
    }
    
    hidePlanetInfo() {
        document.getElementById('planet-info').style.display = 'none';
    }
    
    getPlanetInfo(name) {
        const info = {
            'Sun': 'The star at the center of our solar system. Contains 99.86% of the system\'s mass.',
            'Mercury': 'The smallest and innermost planet. Extreme temperature variations.',
            'Venus': 'The hottest planet with a thick, toxic atmosphere.',
            'Earth': 'Our home planet. The only known planet with life.',
            'Mars': 'The red planet. Has the largest volcano in the solar system.',
            'Jupiter': 'The largest planet. Has a Great Red Spot storm.',
            'Saturn': 'Famous for its prominent ring system.',
            'Uranus': 'Rotates on its side. Has faint rings.',
            'Neptune': 'The windiest planet with speeds up to 2,100 km/h.',
            'Pluto': 'A dwarf planet in the outer solar system.',
            'Moon': 'Earth\'s natural satellite. Influences tides on Earth.'
        };
        return info[name] || 'No information available.';
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Update controls
        this.controls.update();
        
        // Render
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize the solar system when the page loads
window.addEventListener('load', () => {
    new SolarSystem();
});
