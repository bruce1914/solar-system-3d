// Enhanced Solar System 3D Explorer - Final Version
class SolarSystem {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.controls = null;
        this.planets = [];
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.clock = new THREE.Clock();
        
        // Animation controls
        this.animationEnabled = false;
        this.animationSpeed = 1.0;
        
        this.init();
        this.createSolarSystem();
        this.setupControls();
        this.setupEventListeners();
        this.setupUI();
        this.animate();
    }
    
    init() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        document.getElementById('container').appendChild(this.renderer.domElement);
        
        this.camera.position.set(0, 30, 80);
        this.createStarfield();
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
            
            const starType = Math.random();
            if (starType < 0.7) {
                starsColors.push(1, 1, 1);
            } else if (starType < 0.85) {
                starsColors.push(0.8, 0.8, 1);
            } else if (starType < 0.95) {
                starsColors.push(1, 1, 0.8);
            } else {
                starsColors.push(1, 0.8, 0.8);
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
    
    createDetailedTexture(planetName) {
        const canvas = document.createElement('canvas');
        canvas.width = 2048;
        canvas.height = 2048;
        const ctx = canvas.getContext('2d');
        
        switch(planetName) {
            case 'Sun':
                this.createSunTexture(ctx);
                break;
            case 'Earth':
                this.createEarthTexture(ctx);
                break;
            case 'Mars':
                this.createMarsTexture(ctx);
                break;
            case 'Jupiter':
                this.createJupiterTexture(ctx);
                break;
            case 'Saturn':
                this.createSaturnTexture(ctx);
                break;
            default:
                this.createDefaultTexture(ctx, planetName);
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        return texture;
    }
    
    createSunTexture(ctx) {
        const gradient = ctx.createRadialGradient(1024, 1024, 0, 1024, 1024, 1024);
        gradient.addColorStop(0, '#FFF8DC');
        gradient.addColorStop(0.3, '#FFD700');
        gradient.addColorStop(0.6, '#FF8C00');
        gradient.addColorStop(1, '#FF4500');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 2048, 2048);
        
        for (let i = 0; i < 200; i++) {
            ctx.beginPath();
            ctx.arc(Math.random() * 2048, Math.random() * 2048, Math.random() * 80 + 20, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 0, ${Math.random() * 0.3 + 0.2})`;
            ctx.fill();
        }
    }
    
    createEarthTexture(ctx) {
        ctx.fillStyle = '#4169E1';
        ctx.fillRect(0, 0, 2048, 2048);
        
        const continents = [
            {x: 400, y: 800, w: 600, h: 800},
            {x: 500, y: 600, w: 300, h: 200},
            {x: 800, y: 400, w: 800, h: 600},
            {x: 200, y: 400, w: 400, h: 500},
            {x: 300, y: 1200, w: 300, h: 600},
            {x: 1400, y: 1000, w: 320, h: 240}
        ];
        
        continents.forEach(continent => {
            ctx.fillStyle = Math.random() > 0.6 ? '#228B22' : '#8B4513';
            ctx.fillRect(continent.x, continent.y, continent.w, continent.h);
        });
        
        for (let i = 0; i < 150; i++) {
            ctx.beginPath();
            ctx.arc(Math.random() * 2048, Math.random() * 2048, Math.random() * 100 + 40, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.4 + 0.2})`;
            ctx.fill();
        }
    }
    
    createMarsTexture(ctx) {
        ctx.fillStyle = '#CD5C5C';
        ctx.fillRect(0, 0, 2048, 2048);
        
        for (let i = 0; i < 80; i++) {
            ctx.beginPath();
            ctx.arc(Math.random() * 2048, Math.random() * 2048, Math.random() * 160 + 80, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(139, 69, 19, ${Math.random() * 0.3 + 0.2})`;
            ctx.fill();
        }
        
        ctx.beginPath();
        ctx.arc(1024, 200, 120, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(1024, 1848, 100, 0, Math.PI * 2);
        ctx.fill();
    }
    
    createJupiterTexture(ctx) {
        const bands = ['#D2691E', '#F4A460', '#DEB887', '#D2B48C', '#BC8F8F'];
        
        for (let y = 0; y < 2048; y += 200) {
            ctx.fillStyle = bands[Math.floor(Math.random() * bands.length)];
            ctx.fillRect(0, y, 2048, 200);
        }
        
        ctx.beginPath();
        ctx.ellipse(1400, 1200, 240, 160, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#B22222';
        ctx.fill();
    }
    
    createSaturnTexture(ctx) {
        const bands = ['#FAD5A5', '#DEB887', '#D2B48C', '#F5DEB3'];
        
        for (let y = 0; y < 2048; y += 140) {
            ctx.fillStyle = bands[Math.floor(Math.random() * bands.length)];
            ctx.fillRect(0, y, 2048, 140);
        }
    }
    
    createDefaultTexture(ctx, planetName) {
        const colors = {
            'Mercury': '#8C7853',
            'Venus': '#FFC649',
            'Uranus': '#4FD0E7',
            'Neptune': '#4169E1',
            'Pluto': '#A0522D'
        };
        
        ctx.fillStyle = colors[planetName] || '#888888';
        ctx.fillRect(0, 0, 2048, 2048);
        
        for (let i = 0; i < 100; i++) {
            ctx.beginPath();
            ctx.arc(Math.random() * 2048, Math.random() * 2048, Math.random() * 60 + 20, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(100, 100, 100, ${Math.random() * 0.3 + 0.2})`;
            ctx.fill();
        }
    }
    
    createSolarSystem() {
        const planetData = [
            { name: 'Sun', radius: 10, distance: 0, speed: 0, emissive: 0xFDB813, rings: false },
            { name: 'Mercury', radius: 0.4, distance: 15, speed: 0.02, emissive: 0x000000, rings: false },
            { name: 'Venus', radius: 0.9, distance: 20, speed: 0.015, emissive: 0x000000, rings: false },
            { name: 'Earth', radius: 1, distance: 25, speed: 0.01, emissive: 0x000000, rings: false },
            { name: 'Mars', radius: 0.5, distance: 32, speed: 0.008, emissive: 0x000000, rings: false },
            { name: 'Jupiter', radius: 5, distance: 55, speed: 0.005, emissive: 0x000000, rings: false },
            { name: 'Saturn', radius: 4, distance: 70, speed: 0.004, emissive: 0x000000, rings: true },
            { name: 'Uranus', radius: 2, distance: 85, speed: 0.003, emissive: 0x000000, rings: true },
            { name: 'Neptune', radius: 2, distance: 100, speed: 0.002, emissive: 0x000000, rings: false },
            { name: 'Pluto', radius: 0.2, distance: 115, speed: 0.001, emissive: 0x000000, rings: false }
        ];
        
        planetData.forEach((data) => {
            const planet = this.createPlanet(data);
            this.planets.push(planet);
            this.scene.add(planet.group);
            
            if (data.distance > 0) {
                this.createOrbitPath(data.distance);
            }
        });
        
        this.addMoon();
        this.createAsteroidBelt();
        this.setupLighting();
    }
    
    createPlanet(data) {
        const geometry = new THREE.SphereGeometry(data.radius, 64, 64);
        const texture = this.createDetailedTexture(data.name);
        
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
        
        if (data.rings) {
            const rings = this.createRings(data.radius);
            group.add(rings);
        }
        
        group.position.x = data.distance;
        
        return {
            group: group,
            mesh: mesh,
            distance: data.distance,
            speed: data.speed,
            angle: Math.random() * Math.PI * 2,
            name: data.name
        };
    }
    
    createRings(planetRadius) {
        const innerRadius = planetRadius * 1.2;
        const outerRadius = planetRadius * 2.5;
        const geometry = new THREE.RingGeometry(innerRadius, outerRadius, 64);
        
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');
        
        for (let r = 0; r < 512; r += 3) {
            const opacity = Math.random() * 0.3 + 0.1;
            ctx.strokeStyle = `rgba(200, 200, 200, ${opacity})`;
            ctx.lineWidth = Math.random() * 2 + 1;
            ctx.beginPath();
            ctx.arc(512, 512, r, 0, Math.PI * 2);
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
            const moonTexture = this.createMoonTexture();
            const moonMaterial = new THREE.MeshPhongMaterial({ 
                map: moonTexture,
                color: 0xC0C0C0 
            });
            
            const moon = new THREE.Mesh(moonGeometry, moonMaterial);
            moon.position.set(3, 0, 0);
            moon.userData = { name: 'Moon', info: 'Earth\'s natural satellite' };
            earthPlanet.group.add(moon);
            earthPlanet.moon = moon;
            earthPlanet.moonAngle = 0;
        }
    }
    
    createMoonTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#C0C0C0';
        ctx.fillRect(0, 0, 1024, 1024);
        
        for (let i = 0; i < 300; i++) {
            const x = Math.random() * 1024;
            const y = Math.random() * 1024;
            const radius = Math.random() * 50 + 10;
            
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
        const asteroidCount = 1000;
        
        for (let i = 0; i < asteroidCount; i++) {
            const size = Math.random() * 0.15 + 0.05;
            const geometry = new THREE.SphereGeometry(size, 8, 8);
            const material = new THREE.MeshPhongMaterial({ 
                color: new THREE.Color().setHSL(0.1, 0.3, Math.random() * 0.3 + 0.2)
            });
            const asteroid = new THREE.Mesh(geometry, material);
            
            const angle = Math.random() * Math.PI * 2;
            const distance = 37 + Math.random() * 10;
            const height = (Math.random() - 0.5) * 4;
            
            asteroid.position.x = Math.cos(angle) * distance;
            asteroid.position.z = Math.sin(angle) * distance;
            asteroid.position.y = height;
            
            asteroidGroup.add(asteroid);
        }
        
        this.asteroidBelt = asteroidGroup;
        this.scene.add(asteroidGroup);
    }
    
    setupLighting() {
        const sunLight = new THREE.PointLight(0xFFFFFF, 3, 2000);
        sunLight.position.set(0, 0, 0);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 4096;
        sunLight.shadow.mapSize.height = 4096;
        this.scene.add(sunLight);
        
        const ambientLight = new THREE.AmbientLight(0x404040, 0.2);
        this.scene.add(ambientLight);
        
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
    }
    
    setupUI() {
        const animationToggle = document.getElementById('animation-toggle');
        animationToggle.addEventListener('change', (e) => {
            this.animationEnabled = e.target.checked;
        });
        
        const speedSlider = document.getElementById('speed-slider');
        const speedValue = document.getElementById('speed-value');
        speedSlider.addEventListener('input', (e) => {
            this.animationSpeed = parseFloat(e.target.value);
            speedValue.textContent = `${this.animationSpeed.toFixed(1)}x`;
        });
        
        const downloadButton = document.getElementById('download-textures');
        const textureStatus = document.getElementById('texture-status');
        downloadButton.addEventListener('click', () => {
            textureStatus.innerHTML = '<span class="loading">HD textures are now procedurally generated at 2048x2048 resolution!</span>';
        });
        
        const resetButton = document.getElementById('reset-camera');
        resetButton.addEventListener('click', () => {
            this.camera.position.set(0, 30, 80);
            this.controls.target.set(0, 0, 0);
            this.controls.update();
        });
    }
    
    setupEventListeners() {
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
        
        window.addEventListener('click', (event) => {
            if (event.target.closest('.control-panel')) {
                return;
            }
            
            this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            
            this.raycaster.setFromCamera(this.mouse, this.camera);
            
            const intersectableObjects = [];
            this.planets.forEach(planet => {
                intersectableObjects.push(planet.mesh);
                if (planet.moon) {
                    intersectableObjects.push(planet.moon);
                }
            });
            
            const intersects = this.raycaster.intersectObjects(intersectableObjects);
            
            if (intersects.length > 0) {
                const object = intersects[0].object;
                this.showPlanetInfo(object.userData.name, object.userData.info);
            } else {
                this.hidePlanetInfo();
            }
        });
        
        const keys = {};
        window.addEventListener('keydown', (event) => {
            keys[event.code] = true;
        });
        
        window.addEventListener('keyup', (event) => {
            keys[event.code] = false;
        });
        
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
        
        const deltaTime = this.clock.getDelta();
        
        if (this.animationEnabled) {
            this.planets.forEach(planet => {
                if (planet.distance > 0) {
                    planet.angle += planet.speed * this.animationSpeed;
                    planet.group.position.x = Math.cos(planet.angle) * planet.distance;
                    planet.group.position.z = Math.sin(planet.angle) * planet.distance;
                }
                
                planet.mesh.rotation.y += 0.01 * this.animationSpeed;
                
                if (planet.moon) {
                    planet.moonAngle += 0.1 * this.animationSpeed;
                    planet.moon.position.x = Math.cos(planet.moonAngle) * 3;
                    planet.moon.position.z = Math.sin(planet.moonAngle) * 3;
                }
            });
            
            if (this.asteroidBelt) {
                this.asteroidBelt.rotation.y += 0.001 * this.animationSpeed;
            }
        }
        
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}

window.addEventListener('load', () => {
    new SolarSystem();
});
EOF
