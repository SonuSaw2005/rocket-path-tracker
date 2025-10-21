// === SETUP ===
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("vanta-bg").appendChild(renderer.domElement);

// === STARFIELD ===
const starGeometry = new THREE.BufferGeometry();
const starCount = 3000;
const starPositions = [];
for (let i = 0; i < starCount; i++) {
  const x = (Math.random() - 0.5) * 4000;
  const y = (Math.random() - 0.5) * 4000;
  const z = -Math.random() * 4000;
  starPositions.push(x, y, z);
}
starGeometry.setAttribute("position", new THREE.Float32BufferAttribute(starPositions, 3));
const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 1.5 });
scene.add(new THREE.Points(starGeometry, starMaterial));

// === EARTH ===
const earthGeometry = new THREE.SphereGeometry(50, 64, 64);
const earthTexture = new THREE.TextureLoader().load(
  "https://threejs.org/examples/textures/land_ocean_ice_cloud_2048.jpg"
);
const earthMaterial = new THREE.MeshPhongMaterial({ map: earthTexture });
const earth = new THREE.Mesh(earthGeometry, earthMaterial);
earth.scale.set(1.2, 1.2, 1.2);
scene.add(earth);

// === LIGHT ===
scene.add(new THREE.AmbientLight(0x333333, 0.5));
const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
directionalLight.position.set(100, 100, 100).normalize();
scene.add(directionalLight);

// === EARTH GLOW ===
const glowMaterial = new THREE.MeshBasicMaterial({
  color: 0x00aaff,
  side: THREE.BackSide,
  transparent: true,
  opacity: 0.2,
});
const glowGeometry = new THREE.SphereGeometry(52, 64, 64);
const earthGlow = new THREE.Mesh(glowGeometry, glowMaterial);
earthGlow.scale.set(1.1, 1.1, 1.1);
scene.add(earthGlow);

// === ROCKET ===
let rocket = null;
let isLaunching = false;
let launchStartTime = 0;
let trajectoryPoints = []; // world coords used to animate rocket
let trajDuration = 1; // seconds (will set based on data)
let trajStartMillis = 0;
const loader = new THREE.GLTFLoader();
loader.load(
  "https://cdn.jsdelivr.net/gh/m-g-d/gltf-models@5a3c944/space-shuttle/space-shuttle.glb",
  function (gltf) {
    rocket = gltf.scene;
    rocket.scale.set(8, 8, 8);
    rocket.rotation.y = Math.PI;
    rocket.position.set(0, 0, 150);
    rocket.visible = false;
    scene.add(rocket);
  },
  undefined,
  function () {
    const rocketGeometry = new THREE.ConeGeometry(2, 8, 32);
    const rocketMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    rocket = new THREE.Mesh(rocketGeometry, rocketMaterial);
    rocket.position.set(0, 0, 150);
    rocket.visible = false;
    scene.add(rocket);
  }
);

// === ROCKET EXHAUST ===
const exhaustParticles = 200;
const exhaustGeometry = new THREE.BufferGeometry();
const exhaustPositions = new Float32Array(exhaustParticles * 3);
exhaustGeometry.setAttribute("position", new THREE.BufferAttribute(exhaustPositions, 3));
const exhaustMaterial = new THREE.PointsMaterial({
  color: 0xff6600,
  size: 2,
  transparent: true,
  opacity: 0.8,
});
const exhaust = new THREE.Points(exhaustGeometry, exhaustMaterial);
exhaust.visible = false;
scene.add(exhaust);

// === SATELLITES ===
const satellites = [];
const satelliteGeometry = new THREE.SphereGeometry(2, 16, 16);
const satelliteMaterial = new THREE.MeshStandardMaterial({ color: 0xffff00, emissive: 0xffff00 });
for (let i = 0; i < 4; i++) {
  const sat = new THREE.Mesh(satelliteGeometry, satelliteMaterial);
  sat.userData = {
    angle: Math.random() * Math.PI * 2,
    radius: 100 + Math.random() * 40,
    speed: 0.001 + Math.random() * 0.002,
    tilt: Math.random() * Math.PI / 3,
    blinkTimer: Math.random() * 100
  };
  satellites.push(sat);
  scene.add(sat);
}

// === DEBRIS ===
const debrisGroup = new THREE.Group();
for (let i = 0; i < 80; i++) {
  const cubeGeometry = new THREE.BoxGeometry(2.5, 2.5, 2.5);
  const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0xaaaaaa });
  const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
  const angle = Math.random() * Math.PI * 2;
  const radius = 80 + Math.random() * 40;
  cube.userData = { angle, radius, speed: 0.001 + Math.random() * 0.003 };
  cube.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
  debrisGroup.add(cube);
}
scene.add(debrisGroup);

camera.position.z = 200;
let mouseX = 0, mouseY = 0; // <-- ADDED: Variables for parallax effect

// === CHART SETUP ===
const ctx = document.getElementById('rocketGraph').getContext('2d');
const gradient = ctx.createLinearGradient(0, 0, 0, 200);
gradient.addColorStop(0, 'rgba(0, 200, 255, 1)');
gradient.addColorStop(1, 'rgba(0, 50, 100, 0.2)');

const rocketChart = new Chart(ctx, {
  type: 'line',
  data: { labels: [], datasets: [ { label: 'Rocket Y Position', data: [], borderColor: gradient, borderWidth: 3, pointBackgroundColor: '#00ffff', pointBorderColor: '#0ff', pointRadius: 4, pointHoverRadius: 6, tension: 0.4, fill: true, backgroundColor: gradient }, { label: 'Rocket Z Position', data: [], borderColor: '#ff0099', borderWidth: 2, pointRadius: 0, tension: 0.3 } ] },
  options: { responsive: false, animation: { duration: 1200, easing: 'easeOutQuart' }, plugins: { legend: { labels: { color: '#fff', font: { size: 13, family: 'Orbitron, Arial, sans-serif' } } } }, scales: { x: { ticks: { color: '#0ff' }, grid: { color: 'rgba(0,255,255,0.1)' }, title: { display: true, text: 'Time (s)', color: '#0ff' } }, y: { ticks: { color: '#0ff' }, grid: { color: 'rgba(0,255,255,0.1)' }, title: { display: true, text: 'Position', color: '#0ff' } } } }
});

// NEW: Setup for the Velocity Chart
const vtx = document.getElementById('velocityGraph').getContext('2d');
const vGradient = vtx.createLinearGradient(0, 0, 0, 200);
vGradient.addColorStop(0, 'rgba(255, 100, 0, 1)');
vGradient.addColorStop(1, 'rgba(150, 60, 0, 0.2)');

const velocityChart = new Chart(vtx, {
    type: 'line',
    data: { labels: [], datasets: [ { label: 'Velocity (km/s)', data: [], borderColor: vGradient, borderWidth: 3, backgroundColor: vGradient, fill: true, tension: 0.4, pointRadius: 0 }] },
    options: { responsive: false, plugins: { legend: { labels: { color: '#fff', font: { size: 13, family: 'Orbitron, Arial, sans-serif' } } } }, scales: { x: { ticks: { color: '#ff9900' }, grid: { color: 'rgba(255,153,0,0.1)' }, title: { display: true, text: 'Time (s)', color: '#ff9900' } }, y: { ticks: { color: '#ff9900' }, grid: { color: 'rgba(255,153,0,0.1)' }, title: { display: true, text: 'Velocity', color: '#ff9900' } } } }
});


// =============================
// MINI HOLLOW-EARTH
// =============================
const miniWidth = 300, miniHeight = 200;
const miniCanvas = document.getElementById('miniEarth');
const miniScene = new THREE.Scene();
const miniCamera = new THREE.PerspectiveCamera(60, miniWidth / miniHeight, 0.1, 1000);
miniCamera.position.set(0, 0, 140);
const miniRenderer = new THREE.WebGLRenderer({ canvas: miniCanvas, alpha: true, antialias: true });
miniRenderer.setSize(miniWidth, miniHeight);

const hollowEarthGeometry = new THREE.SphereGeometry(50, 32, 32);
const hollowEarthMaterial = new THREE.MeshBasicMaterial({ color: 0x00aaff, wireframe: true, transparent: true, opacity: 0.25 });
const hollowEarth = new THREE.Mesh(hollowEarthGeometry, hollowEarthMaterial);
miniScene.add(hollowEarth);

const miniGlowMaterial = new THREE.MeshBasicMaterial({ color: 0x00aaff, side: THREE.BackSide, transparent: true, opacity: 0.15 });
const miniGlowGeometry = new THREE.SphereGeometry(54, 32, 32);
const miniEarthGlow = new THREE.Mesh(miniGlowGeometry, miniGlowMaterial);
miniScene.add(miniEarthGlow);

const rocketMarkerGeometry = new THREE.SphereGeometry(2.2, 12, 12);
const rocketMarkerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const rocketMarker = new THREE.Mesh(rocketMarkerGeometry, rocketMarkerMaterial);
miniScene.add(rocketMarker);

const destinationGeometry = new THREE.SphereGeometry(2.6, 12, 12);
const destinationMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const destinationMarker = new THREE.Mesh(destinationGeometry, destinationMaterial);
miniScene.add(destinationMarker);

const startGeometry = new THREE.SphereGeometry(2.6, 12, 12);
const startMaterial = new THREE.MeshBasicMaterial({ color: 0x00aaff });
const startMarker = new THREE.Mesh(startGeometry, startMaterial);
miniScene.add(startMarker);

let miniTrajectoryLine = null;
const trajectoryMaterial = new THREE.LineBasicMaterial({ color: 0xffff00 });

const miniDebrisGroup = new THREE.Group();
for (let i = 0; i < 18; i++) {
  const debrisGeo = new THREE.SphereGeometry(1, 8, 8);
  const debrisMat = new THREE.MeshBasicMaterial({ color: 0xaaaaaa });
  const d = new THREE.Mesh(debrisGeo, debrisMat);
  d.userData = { angle: Math.random() * Math.PI * 2, radius: 70 + Math.random() * 18, speed: (0.002 + Math.random() * 0.005) };
  miniDebrisGroup.add(d);
}
miniScene.add(miniDebrisGroup);

const miniSatellitesGroup = new THREE.Group();
const miniSatMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
for (let i = 0; i < 3; i++) {
    const satGeo = new THREE.SphereGeometry(1.5, 8, 8);
    const sat = new THREE.Mesh(satGeo, miniSatMaterial);
    sat.userData = { angle: Math.random() * Math.PI * 2, radius: 65 + i * 10, speed: 0.005 + Math.random() * 0.005 };
    miniSatellitesGroup.add(sat);
}
miniScene.add(miniSatellitesGroup);

function scalePoint(p) {
  const scale = 1 / 5.0;
  return new THREE.Vector3(p.x * scale, p.y * scale, p.z * scale);
}

// === NEW: MOUSE PARALLAX EFFECT ===
function onDocumentMouseMove(event) {
  // Normalize mouse position from -1 to 1
  mouseX = (event.clientX / window.innerWidth) * 2 - 1;
  mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
}
document.addEventListener('mousemove', onDocumentMouseMove);


// === ANIMATION LOOP ===
function animate() {
  requestAnimationFrame(animate);
  const time = Date.now();

  earth.rotation.y += 0.002;
  earthGlow.rotation.y += 0.002;

  // === ADDED: PARALLAX LOGIC ===
  // Only apply parallax effect when not launching to avoid conflicts
  if (!isLaunching) {
    const parallaxFactor = 5; // How much the scene moves; lower is more subtle
    // Smoothly move the camera towards the target position based on mouse
    camera.position.x += (mouseX * parallaxFactor - camera.position.x) * 0.05;
    camera.position.y += (mouseY * parallaxFactor - camera.position.y) * 0.05;
    // Ensure the camera always points at the center of the scene
    camera.lookAt(scene.position);
  }
  // === END OF PARALLAX LOGIC ===

  if (rocket) {
    if (isLaunching && trajectoryPoints.length > 0) {
      const elapsed = (time - trajStartMillis) / 1000;
      const t = Math.min(elapsed / trajDuration, 1);
      const idxFloat = t * (trajectoryPoints.length - 1);
      const idx = Math.floor(idxFloat);
      const nextIdx = Math.min(idx + 1, trajectoryPoints.length - 1);
      const frac = idxFloat - idx;
      const pA = trajectoryPoints[idx];
      const pB = trajectoryPoints[nextIdx];
      const interp = new THREE.Vector3().lerpVectors(pA, pB, frac);
      rocket.position.copy(interp);

      if (nextIdx > idx) {
        rocket.lookAt(pB);
        rocket.rotation.y += Math.PI;
      }

      exhaust.visible = true;
      const positions = exhaust.geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i] = rocket.position.x + (Math.random() - 0.5) * 1.2;
        positions[i + 1] = rocket.position.y - 2.5 - Math.random() * 1.5;
        positions[i + 2] = rocket.position.z + (Math.random() - 0.5) * 1.2;
      }
      exhaust.geometry.attributes.position.needsUpdate = true;
      camera.position.z = 200 - Math.min(50, rocket.position.y * 0.2);

      if (t >= 1) {
        isLaunching = false;
        exhaust.visible = false;
        camera.position.set(0, 0, 200);
      }
    }
  }

  satellites.forEach((sat) => {
    sat.userData.angle += sat.userData.speed;
    sat.position.x = Math.cos(sat.userData.angle) * sat.userData.radius;
    sat.position.z = Math.sin(sat.userData.angle) * sat.userData.radius;
    sat.position.y = Math.sin(sat.userData.tilt) * sat.userData.radius * 0.3;
    sat.userData.blinkTimer += 0.1;
    sat.material.emissiveIntensity = (Math.sin(sat.userData.blinkTimer) + 1) / 2;
  });
  debrisGroup.children.forEach((cube) => {
    cube.userData.angle += cube.userData.speed;
    cube.position.x = Math.cos(cube.userData.angle) * cube.userData.radius;
    cube.position.z = Math.sin(cube.userData.angle) * cube.userData.radius;
  });

  renderer.render(scene, camera);

  // === MINI SCENE ANIMATION ===
  hollowEarth.rotation.y += 0.004;
  miniEarthGlow.rotation.y += 0.004;
  miniEarthGlow.material.opacity = 0.1 + (Math.sin(time * 0.001) + 1) / 8;
  miniDebrisGroup.children.forEach((d) => {
    d.userData.angle += d.userData.speed;
    d.position.x = Math.cos(d.userData.angle) * d.userData.radius;
    d.position.z = Math.sin(d.userData.angle) * d.userData.radius;
    d.position.y = Math.sin(d.userData.angle * 0.5) * 6;
  });
  miniSatellitesGroup.children.forEach((sat) => {
      sat.userData.angle += sat.userData.speed;
      sat.position.x = Math.cos(sat.userData.angle) * sat.userData.radius;
      sat.position.z = Math.sin(sat.userData.angle) * sat.userData.radius;
  });
  miniCamera.position.x = Math.sin(time * 0.0001) * 10;
  miniCamera.position.y = Math.cos(time * 0.0001) * 5;
  miniCamera.lookAt(miniScene.position);
  
  if (trajectoryPoints.length > 0) {
    const elapsed = Math.max(0, time - trajStartMillis) / 1000;
    const t = Math.min(elapsed / trajDuration, 1);
    const idxFloat = t * (trajectoryPoints.length - 1);
    const idx = Math.floor(idxFloat);
    const nextIdx = Math.min(idx + 1, trajectoryPoints.length - 1);
    const frac = idxFloat - idx;
    const pA = trajectoryPoints[idx];
    const pB = trajectoryPoints[nextIdx];
    const interp = new THREE.Vector3().lerpVectors(pA, pB, frac);
    rocketMarker.position.copy(interp);
  }

  miniRenderer.render(miniScene, miniCamera);
}
animate();

// === BACKEND CONNECTION ===
// Note: This variable is defined at the bottom of your file, 
// make sure it is accessible to this function.
// const API_BASE_URL = "https://rocket-path-tracker.onrender.com"; 

async function fetchSimulation() {
    const data = {
        site: document.getElementById("site")?.value,
        velocity: parseFloat(document.getElementById("velocity")?.value),
        angle: parseFloat(document.getElementById("angle")?.value),
        orbit: document.getElementById("orbit")?.value
    };

    try {
        // *** THE FIX IS HERE ***
        // Use the deployed Render URL for the POST request
        const apiUrl = "https://rocket-path-tracker.onrender.com/simulate"; 
        
        // OR, if API_BASE_URL is properly scoped and defined:
        // const apiUrl = `${API_BASE_URL}/simulate`; 

        const response = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const result = await response.json();
        
        // ... rest of your successful data processing logic ...
        
        document.getElementById("output").innerText = JSON.stringify(result, null, 2);
        updateStatus(result.risk);
        
        // ... rest of the charting and THREE.js animation logic ...
        
    } catch (error) {
        document.getElementById("output").innerText = "Error connecting to backend or processing data!";
        console.error("Fetch/Processing Error:", error);
    }
}
document.getElementById("sendBtn").addEventListener("click", fetchSimulation);

// === STATUS INDICATOR ===
function updateStatus(riskLevel) {
  document.querySelectorAll(".status .dot").forEach(dot => dot.classList.remove("glow"));
  if (riskLevel === "safe") document.querySelector(".dot.safe").classList.add("glow");
  else if (riskLevel === "caution") document.querySelector(".dot.warning").classList.add("glow");
  else if (riskLevel === "risky") document.querySelector(".dot.critical").classList.add("glow");
}
updateStatus("safe");

// === CLOSE BUTTON ===
document.getElementById("close-btn").addEventListener("click", function () {
  document.querySelector(".dashboard").style.display = "none";
  document.querySelector(".home").style.display = "block";
  this.style.display = "none";
});

// === RESIZE HANDLER ===
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  miniRenderer.setSize(miniWidth, miniHeight);
});

// === USER INTERACTION (DRAG & TOUCH) ===
let touchStartX = 0;
let touchStartY = 0;
let isTouching = false;

document.addEventListener("touchstart", (e) => {
  if (e.touches.length === 1) {
    isTouching = true;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }
});

document.addEventListener("touchmove", (e) => {
  if (isTouching && e.touches.length === 1) {
    const deltaX = e.touches[0].clientX - touchStartX;
    const deltaY = e.touches[0].clientY - touchStartY;
    earth.rotation.y += deltaX * 0.005;
    earth.rotation.x += deltaY * 0.005;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }
});

document.addEventListener("touchend", () => {
  isTouching = false;
});

// Optional: Mouse drag for desktop
let isMouseDown = false;
let mouseStartX = 0;
let mouseStartY = 0;

document.addEventListener("mousedown", (e) => {
  isMouseDown = true;
  mouseStartX = e.clientX;
  mouseStartY = e.clientY;
});   
document.addEventListener("mousemove", (e) => {
  if (isMouseDown) {
    const deltaX = e.clientX - mouseStartX;
    const deltaY = e.clientY - mouseStartY;
    earth.rotation.y += deltaX * 0.005; 
    earth.rotation.x += deltaY * 0.005;
    mouseStartX = e.clientX;
    mouseStartY = e.clientY;
  }
});
document.addEventListener("mouseup", () => {
  isMouseDown = false;
});

// Prevent scrolling on touch devices when interacting with the canvas
document.getElementById("vanta-bg").addEventListener("touchmove", (e) => {
  e.preventDefault();
}, { passive: false });
const API_BASE_URL = "https://rocket-path-tracker.onrender.com";

// Example GET request
fetch(`${API_BASE_URL}/your-endpoint`)
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));
