/**
 * Interactive 3D Block Scene
 * A real-time 3D scene with interactive blocks and particle effects.
 * Features clustering, shadows, and raycasting for interactivity.
 */
class BlockScene {
    constructor() {
        // Core Three.js components
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;

        // Raycasting for interactivity
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.lastIntersected = null;

        // Block and particle groups
        this.blockGroup = new THREE.Group();
        this.particleGroup = new THREE.Group();
        this.particles = [];

        // Configuration
        this.colors = [0x1e90ff, 0x00ff7f, 0xffffff]; // Blue, green, white
        this.blockCount = 150;
        this.particleCount = 300;
        this.clusterRadius = 8;
    }

    /**
     * Initialize the scene, camera, renderer, and controls
     */
    init() {
        try {
            // Scene setup
            this.scene = new THREE.Scene();
            this.scene.background = new THREE.Color(0xf0f0f0);

            // Camera setup
            this.camera = new THREE.PerspectiveCamera(
                75,
                window.innerWidth / window.innerHeight,
                0.1,
                1000
            );
            this.camera.position.set(0, 10, 20);

            // Renderer setup
            this.renderer = new THREE.WebGLRenderer({ antialias: true });
            this.renderer.setPixelRatio(window.devicePixelRatio);
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Soft shadows
            document.body.appendChild(this.renderer.domElement);

            // OrbitControls for camera interaction
            this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;
            this.controls.minDistance = 5;
            this.controls.maxDistance = 50;

            // Add lighting
            this.addLighting();

            // Add blocks and particles
            this.scene.add(this.blockGroup);
            this.scene.add(this.particleGroup);
            this.createBlocks();
            this.createParticles();

            // Event listeners
            this.addEventListeners();

            // Start animation
            this.animate();
        } catch (error) {
            console.error('Failed to initialize the scene:', error);
        }
    }

    /**
     * Add lighting to the scene
     */
    addLighting() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 10);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 1024;
        directionalLight.shadow.mapSize.height = 1024;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;
        this.scene.add(directionalLight);
    }

    /**
     * Create a single block with given parameters
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} z - Z position
     * @param {number} color - Hex color
     * @returns {THREE.Mesh} - The created block
     */
    createBlock(x, y, z, color) {
        const size = Math.random() * 0.5 + 0.5; // Random size between 0.5 and 1
        const geometry = new THREE.BoxGeometry(size, size, size);
        const material = new THREE.MeshStandardMaterial({
            color,
            roughness: 0.7,
            metalness: 0.1
        });
        const block = new THREE.Mesh(geometry, material);
        block.position.set(x, y, z);
        block.castShadow = true;
        block.receiveShadow = true;
        return block;
    }

    /**
     * Create blocks with clustering effect
     */
    createBlocks() {
        for (let i = 0; i < this.blockCount; i++) {
            // Create clusters by biasing positions toward a few central points
            const clusterIndex = Math.floor(Math.random() * 3); // 3 clusters
            const clusterCenter = {
                x: (Math.random() - 0.5) * 10,
                y: (Math.random() - 0.5) * 10,
                z: (Math.random() - 0.5) * 10
            };
            const x = clusterCenter.x + (Math.random() - 0.5) * this.clusterRadius;
            const y = clusterCenter.y + (Math.random() - 0.5) * this.clusterRadius;
            const z = clusterCenter.z + (Math.random() - 0.5) * this.clusterRadius;
            const color = this.colors[Math.floor(Math.random() * this.colors.length)];
            const block = this.createBlock(x, y, z, color);
            this.blockGroup.add(block);
        }
    }

    /**
     * Create particles for the dissolving effect
     */
    createParticles() {
        const geometry = new THREE.SphereGeometry(0.05, 8, 8);
        const material = new THREE.MeshBasicMaterial({ color: 0x1e90ff });

        for (let i = 0; i < this.particleCount; i++) {
            const particle = new THREE.Mesh(geometry, material);
            particle.position.set(
                (Math.random() - 0.5) * 30,
                (Math.random() - 0.5) * 30,
                (Math.random() - 0.5) * 30
            );
            particle.velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 0.02,
                (Math.random() - 0.5) * 0.02,
                (Math.random() - 0.5) * 0.02
            );
            this.particleGroup.add(particle);
            this.particles.push(particle);
        }
    }

    /**
     * Animate particles to create a dissolving effect
     */
    animateParticles() {
        this.particles.forEach(particle => {
            particle.position.add(particle.velocity);
            // Reset particle position if it goes too far
            if (particle.position.length() > 20) {
                particle.position.set(
                    (Math.random() - 0.5) * 10,
                    (Math.random() - 0.5) * 10,
                    (Math.random() - 0.5) * 10
                );
                particle.velocity.set(
                    (Math.random() - 0.5) * 0.02,
                    (Math.random() - 0.5) * 0.02,
                    (Math.random() - 0.5) * 0.02
                );
            }
        });
    }

    /**
     * Add event listeners for interactivity
     */
    addEventListeners() {
        window.addEventListener('resize', () => this.onWindowResize());
        window.addEventListener('mousemove', (event) => this.onMouseMove(event));
        window.addEventListener('click', (event) => this.onMouseClick(event));
    }

    /**
     * Handle window resize
     */
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    /**
     * Handle mouse movement for hover effects
     * @param {MouseEvent} event
     */
    onMouseMove(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.blockGroup.children);

        // Reset previous intersected block's scale
        if (this.lastIntersected) {
            this.lastIntersected.scale.set(1, 1, 1);
        }

        if (intersects.length > 0) {
            this.lastIntersected = intersects[0].object;
            this.lastIntersected.scale.set(1.1, 1.1, 1.1); // Scale up on hover
        } else {
            this.lastIntersected = null;
        }
    }

    /**
     * Handle mouse click for color change
     * @param {MouseEvent} event
     */
    onMouseClick(event) {
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.blockGroup.children);

        if (intersects.length > 0) {
            const block = intersects[0].object;
            block.material.color.set(this.colors[Math.floor(Math.random() * this.colors.length)]);
        }
    }

    /**
     * Animation loop
     */
    animate() {
        requestAnimationFrame(() => this.animate());

        // Rotate the block group
        this.blockGroup.rotation.x += 0.002;
        this.blockGroup.rotation.y += 0.002;

        // Animate particles
        this.animateParticles();

        // Update controls
        this.controls.update();

        // Render the scene
        this.renderer.render(this.scene, this.camera);
    }
}

// Instantiate and run the scene
const blockScene = new BlockScene();
blockScene.init();