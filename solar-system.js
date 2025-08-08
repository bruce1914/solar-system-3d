// Solar System 3D Explorer
class SolarSystem {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.controls = null;
        this.planets = [];
        this.asteroidBelt = null;
        this.clock = new THREE.Clock();
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        this.init();
        this.createSolarSystem();
        this.setupControls();
        this.setupEventListeners();
        this.animate();
    }
    
    init() {
        // Setup renderer
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.getElementById('container').appendChild(this.renderer.domElement);
        
        // Setup camera position
        this.camera.position.set(0, 50, 100);
        
        // Add starfield background
        this.createStarfield();
    }
    
    createStarfield() {
        const starsGeometry = new THREE.BufferGeometry();
        const starsMaterial = new THREE.PointsMaterial({ color: 0xFFFFFF, size: 0.5 });
        
        const starsVertices = [];
        for (let i = 0; i < 10000; i++) {
            const x = (Math.random() - 0.5) * 2000;
            const y = (Math.random() - 0.5) * 2000;
            const z = (Math.random() - 0.5) * 2000;
            starsVertices.push(x, y, z);
        }
        
        starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
        const stars = new THREE.Points(starsGeometry, starsMaterial);
        this.scene.add(stars);
    }
    
    createSolarSystem() {
        // Planet data with realistic properties
        const planetData = [
            { name: 'Sun', radius: 10, distance: 0, speed: 0, color: 0xFDB813, emissive: 0xFDB813, rings: false },
            { name: 'Mercury', radius: 0.4, distance: 15, speed: 0.02, color: 0x8C7853, emissive: 0x000000, rings: false },
            { name: 'Venus', radius: 0.9, distance: 20, speed: 0.015, color: 0xFFC649, emissive: 0x000000, rings: false },
            { name: 'Earth', radius: 1, distance: 25, speed: 0.01, color: 0x6B93D6, emissive: 0x000000, rings: false },
            { name: 'Mars', radius: 0.5, distance: 30, speed: 0.008, color: 0xCD5C5C, emissive: 0x000000, rings: false },
            { name: 'Jupiter', radius: 5, distance: 45, speed: 0.005, color: 0xD8CA9D, emissive: 0x000000, rings: false },
            { name: 'Saturn', radius: 4, distance: 60, speed: 0.004, color: 0xFAD5A5, emissive: 0x000000, rings: true },
            { name: 'Uranus', radius: 2, distance: 75, speed: 0.003, color: 0x4FD0E7, emissive: 0x000000, rings: true },
            { name: 'Neptune', radius: 2, distance: 90, speed: 0.002, color: 0x4B70DD, emissive: 0x000000, rings: false },
            { name: 'Pluto', radius: 0.2, distance: 105, speed: 0.001, color: 0xA0522D, emissive: 0x000000, rings: false }
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
        const geometry = new THREE.SphereGeometry(data.radius, 32, 32);
        const material = new THREE.MeshPhongMaterial({ 
            color: data.color,
            emissive: data.emissive,
            emissiveIntensity: data.name === 'Sun' ? 0.3 : 0
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
        
        // Position planet
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
        const outerRadius = planetRadius * 2;
        const geometry = new THREE.RingGeometry(innerRadius, outerRadius, 64);
        const material = new THREE.MeshBasicMaterial({ 
            color: 0xAAAAA, 
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.6
        });
        
        const rings = new THREE.Mesh(geometry, material);
        rings.rotation.x = Math.PI / 2;
        return rings;
    }
    
    addMoon() {
        const earthPlanet = this.planets.find(p => p.name === 'Earth');
        if (earthPlanet) {
            const moonGeometry = new THREE.SphereGeometry(0.25, 16, 16);
            const moonMaterial = new THREE.MeshPhongMaterial({ color: 0xC0C0C0 });
            const moon = new THREE.Mesh(moonGeometry, moonMaterial);
            moon.position.set(3, 0, 0);
            moon.userData = { name: 'Moon', info: 'Earth\'s natural satellite' };
            earthPlanet.group.add(moon);
            
            // Store moon reference for animation
            earthPlanet.moon = moon;
        }
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
        const asteroidCount = 500;
        
        for (let i = 0; i < asteroidCount; i++) {
            const size = Math.random() * 0.1 + 0.05;
            const geometry = new THREE.SphereGeometry(size, 8, 8);
            const material = new THREE.MeshPhongMaterial({ color: 0x666666 });
            const asteroid = new THREE.Mesh(geometry, material);
            
            const angle = Math.random() * Math.PI * 2;
            const distance = 35 + Math.random() * 10; // Between Mars and Jupiter
            const height = (Math.random() - 0.5) * 2;
            
            asteroid.position.x = Math.cos(angle) * distance;
            asteroid.position.z = Math.sin(angle) * distance;
            asteroid.position.y = height;
            
            asteroidGroup.add(asteroid);
        }
        
        this.asteroidBelt = asteroidGroup;
        this.scene.add(asteroidGroup);
    }
    
    setupLighting() {
        // Sun light (point light)
        const sunLight = new THREE.PointLight(0xFFFFFF, 2, 1000);
        sunLight.position.set(0, 0, 0);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        this.scene.add(sunLight);
        
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.1);
        this.scene.add(ambientLight);
    }
    
    setupControls() {
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 5;
        this.controls.maxDistance = 500;
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
        
        const deltaTime = this.clock.getDelta();
        
        // Animate planets
        this.planets.forEach(planet => {
            if (planet.distance > 0) {
                planet.angle += planet.speed;
                planet.group.position.x = Math.cos(planet.angle) * planet.distance;
                planet.group.position.z = Math.sin(planet.angle) * planet.distance;
            }
            
            // Rotate planet on its axis
            planet.mesh.rotation.y += 0.01;
            
            // Animate moon around Earth
            if (planet.moon) {
                planet.moon.position.x = Math.cos(planet.angle * 10) * 3;
                planet.moon.position.z = Math.sin(planet.angle * 10) * 3;
            }
        });
        
        // Rotate asteroid belt slowly
        if (this.asteroidBelt) {
            this.asteroidBelt.rotation.y += 0.001;
        }
        
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
