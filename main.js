/* ============================================================
   TECH MANTHAN 6.0 — main.js
   Three.js 3D Background + HandPose Biometric Authorization
   ============================================================ */

/* ══════════════════════════════════════════════════════════
   PART 1 — THREE.JS 3D SCENE
   ══════════════════════════════════════════════════════════ */
(function initThreeScene() {
    const canvas   = document.getElementById('bg-canvas');
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 800);
    camera.position.set(0, 1.5, 14);
    camera.lookAt(0, 0, 0);

    /* ── FOG ── */
    scene.fog = new THREE.FogExp2(0x020810, 0.025);

    /* ── LIGHTS ── */
    scene.add(new THREE.AmbientLight(0x0a1628, 3));

    const lCyan = new THREE.PointLight(0x00d4ff, 10, 35);
    lCyan.position.set(-8, 6, 6);
    scene.add(lCyan);

    const lViolet = new THREE.PointLight(0x7b2fff, 10, 35);
    lViolet.position.set(9, -4, 4);
    scene.add(lViolet);

    const lGreen = new THREE.PointLight(0x00ff88, 4, 25);
    lGreen.position.set(0, 10, -5);
    scene.add(lGreen);

    /* ── MAIN TORUS KNOT ── */
    const tkGeo = new THREE.TorusKnotGeometry(2.9, 0.52, 200, 32, 2, 3);
    const tkMat = new THREE.MeshStandardMaterial({
        color: 0x008aaa,
        metalness: 0.92,
        roughness: 0.08,
        emissive: 0x001c35,
        emissiveIntensity: 0.5,
    });
    const torusKnot = new THREE.Mesh(tkGeo, tkMat);
    torusKnot.position.set(0, 0, -1);
    scene.add(torusKnot);

    /* Wireframe shell */
    const wGeo = new THREE.TorusKnotGeometry(3.18, 0.54, 80, 18, 2, 3);
    const wMat = new THREE.MeshBasicMaterial({ color: 0x00d4ff, wireframe: true, transparent: true, opacity: 0.07 });
    const wireShell = new THREE.Mesh(wGeo, wMat);
    wireShell.position.set(0, 0, -1);
    scene.add(wireShell);

    /* ── SECONDARY OBJECTS ── */
    const floaters = [];
    const floaterData = [
        { geo: new THREE.IcosahedronGeometry(0.9, 1), pos: [-6.5, 3.5, 0], color: 0x7b2fff },
        { geo: new THREE.IcosahedronGeometry(0.6, 0), pos: [ 6.8,-2.5, 1], color: 0x00d4ff },
        { geo: new THREE.OctahedronGeometry(0.7, 0),  pos: [-5.5,-3.2, 2], color: 0x00ff88 },
        { geo: new THREE.TetrahedronGeometry(0.6, 0), pos: [ 5.5, 4.0,-2], color: 0x7b2fff },
    ];

    floaterData.forEach(d => {
        const mat  = new THREE.MeshStandardMaterial({ color: d.color, metalness: 0.75, roughness: 0.18 });
        const mesh = new THREE.Mesh(d.geo, mat);
        mesh.position.set(...d.pos);
        scene.add(mesh);
        floaters.push({ mesh, baseY: d.pos[1] });
    });

    /* Wireframe versions of floaters */
    floaterData.forEach(d => {
        const mat  = new THREE.MeshBasicMaterial({ color: d.color, wireframe: true, transparent: true, opacity: 0.25 });
        const mesh = new THREE.Mesh(d.geo, mat);
        mesh.position.set(...d.pos);
        mesh.scale.setScalar(1.12);
        scene.add(mesh);
    });

    /* ── NEON HALOS ── */
    [5, 6.8, 8.6].forEach((r, i) => {
        const g = new THREE.TorusGeometry(r, 0.012, 8, 128);
        const m = new THREE.MeshBasicMaterial({
            color: i % 2 === 0 ? 0x00d4ff : 0x7b2fff,
            transparent: true,
            opacity: 0.14,
        });
        const halo = new THREE.Mesh(g, m);
        halo.rotation.x = Math.PI / 2 + i * 0.35;
        halo.position.set(0, 0, -3);
        scene.add(halo);
    });

    /* ── GRID FLOOR ── */
    const grid = new THREE.GridHelper(100, 50, 0x00d4ff, 0x001525);
    grid.position.y = -7;
    grid.material.opacity = 0.38;
    grid.material.transparent = true;
    scene.add(grid);

    /* ── STAR PARTICLES ── */
    const starCount = 3500;
    const starPos   = new Float32Array(starCount * 3);
    const starColors= new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
        starPos[i * 3]     = (Math.random() - 0.5) * 130;
        starPos[i * 3 + 1] = (Math.random() - 0.5) * 90;
        starPos[i * 3 + 2] = (Math.random() - 0.5) * 90 - 10;

        // Mix cyan and violet stars
        const isCyan = Math.random() > 0.35;
        starColors[i * 3]     = isCyan ? 0   : 0.48;
        starColors[i * 3 + 1] = isCyan ? 0.83: 0.18;
        starColors[i * 3 + 2] = isCyan ? 1   : 1;
    }

    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute('color',    new THREE.BufferAttribute(starColors, 3));

    const starMat = new THREE.PointsMaterial({
        size: 0.09,
        vertexColors: true,
        transparent: true,
        opacity: 0.65,
    });

    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    /* ── MOUSE PARALLAX ── */
    const mouse = { x: 0, y: 0 };
    document.addEventListener('mousemove', e => {
        mouse.x = (e.clientX / window.innerWidth  - 0.5) * 2;
        mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    /* ── ANIMATION LOOP ── */
    let t = 0;
    function animate() {
        requestAnimationFrame(animate);
        t += 0.004;

        /* Core torus knot */
        torusKnot.rotation.x  = t * 0.38;
        torusKnot.rotation.y  = t * 0.55;
        wireShell.rotation.x  = t * 0.38;
        wireShell.rotation.y  = t * 0.55;

        /* Floaters */
        floaters.forEach((f, i) => {
            f.mesh.rotation.x += 0.007 + i * 0.003;
            f.mesh.rotation.y += 0.005 + i * 0.002;
            f.mesh.position.y  = f.baseY + Math.sin(t * 0.9 + i * 1.8) * 0.7;
        });

        /* Particles slow drift */
        stars.rotation.y = t * 0.015;
        stars.rotation.x = t * 0.008;

        /* Light pulse */
        lCyan.intensity   = 9  + Math.sin(t * 2.2) * 4;
        lViolet.intensity = 9  + Math.cos(t * 2.7) * 4;

        /* Camera parallax */
        camera.position.x += (mouse.x * 2.2 - camera.position.x) * 0.038;
        camera.position.y += (-mouse.y * 1.5 + 1.5 - camera.position.y) * 0.038;
        camera.lookAt(0, 0, 0);

        renderer.render(scene, camera);
    }
    animate();

    /* ── RESIZE ── */
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
})();


/* ══════════════════════════════════════════════════════════
   PART 2 — CLOCK
   ══════════════════════════════════════════════════════════ */
function tickClock() {
    const el = document.getElementById('ss-clock');
    if (!el) return;
    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    el.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}
setInterval(tickClock, 1000);
tickClock();


/* ══════════════════════════════════════════════════════════
   PART 3 — BIOMETRIC AUTHORIZATION SYSTEM
   ══════════════════════════════════════════════════════════ */

/* ── DOM refs ── */
const bioVideo    = document.getElementById('bio-video');
const bioCanvas   = document.getElementById('bio-canvas');
const bioCtx      = bioCanvas.getContext('2d');
const activateBtn = document.getElementById('activate-btn');

/* Status bar */
const ssIndicator = document.getElementById('ss-indicator');
const ssLabel     = document.getElementById('ss-label');

/* Overlays */
const overlayIdle     = document.getElementById('overlay-idle');
const overlayScan     = document.getElementById('overlay-scan');
const overlayAnalyze  = document.getElementById('overlay-analyze');
const overlayGranted  = document.getElementById('overlay-granted');

/* Telemetry */
const tvPalm   = document.getElementById('tv-palm');
const tvConf   = document.getElementById('tv-conf');
const tvPts    = document.getElementById('tv-pts');
const tvState  = document.getElementById('tv-state');
const tvFrames = document.getElementById('tv-frames');

/* Progress */
const pwFill  = document.getElementById('pw-fill');
const pwPct   = document.getElementById('pw-pct');
const pwLabel = document.getElementById('pw-label');
const pSteps  = ['pws-1','pws-2','pws-3','pws-4'].map(id => document.getElementById(id));

/* ── State ── */
let model         = null;
let bioRunning    = false;
let authState     = 'idle';  // idle | active | scanning | analyzing | granted
let detectedFrames= 0;
let detecting     = false;
const FRAMES_NEEDED = 22;

/* ── Helpers ── */
function setSystemStatus(state, text) {
    ssIndicator.className = 'ss-indicator ' + state;
    ssLabel.className     = 'ss-label ' + state;
    ssLabel.textContent   = text;
}

function showOverlay(name) {
    [overlayIdle, overlayScan, overlayAnalyze, overlayGranted].forEach(el => {
        el.classList.remove('visible');
    });
    if (name === 'idle')    overlayIdle.classList.add('visible');
    if (name === 'scan')    overlayScan.classList.add('visible');
    if (name === 'analyze') overlayAnalyze.classList.add('visible');
    if (name === 'granted') overlayGranted.classList.add('visible');
}

function setProgress(pct, label) {
    pwFill.style.width  = pct + '%';
    pwPct.textContent   = Math.round(pct) + '%';
    pwLabel.textContent = label;

    pSteps.forEach((el, i) => {
        el.classList.remove('active', 'done');
        const thresholds = [0, 30, 60, 88];
        if (pct >= (i === 3 ? 98 : thresholds[i + 1])) {
            el.classList.add('done');
        } else if (pct >= thresholds[i]) {
            el.classList.add('active');
        }
    });
}

function updateTelemetry(palm, conf, pts, state, frames) {
    tvPalm.textContent   = palm;
    tvConf.textContent   = conf;
    tvPts.textContent    = pts;
    tvState.textContent  = state;
    tvFrames.textContent = frames;

    // Color coding
    const stateIsActive  = ['SCANNING','ANALYZING'].includes(state);
    const stateIsGranted = state === 'AUTHORIZED';
    [tvPalm, tvConf, tvPts, tvState, tvFrames].forEach(el => {
        el.classList.toggle('active',  stateIsActive);
        el.classList.toggle('granted', stateIsGranted);
    });
}

/* ── Draw hand skeleton on canvas ── */
function drawHand(landmarks) {
    // 21-point hand connections
    const connections = [
        [0,1],[1,2],[2,3],[3,4],         // thumb
        [0,5],[5,6],[6,7],[7,8],          // index
        [0,9],[9,10],[10,11],[11,12],     // middle
        [0,13],[13,14],[14,15],[15,16],   // ring
        [0,17],[17,18],[18,19],[19,20],   // pinky
        [5,9],[9,13],[13,17],             // palm cross
    ];

    /* Scale landmarks to canvas size */
    const scaleX = bioCanvas.width  / bioVideo.videoWidth;
    const scaleY = bioCanvas.height / bioVideo.videoHeight;

    const sx = ([x, y]) => [x * scaleX, y * scaleY];

    bioCtx.save();
    bioCtx.shadowBlur  = 12;
    bioCtx.shadowColor = '#00d4ff';
    bioCtx.strokeStyle = '#00d4ff';
    bioCtx.lineWidth   = 2;

    /* Connections */
    connections.forEach(([a, b]) => {
        const [x1, y1] = sx(landmarks[a]);
        const [x2, y2] = sx(landmarks[b]);
        bioCtx.beginPath();
        bioCtx.moveTo(x1, y1);
        bioCtx.lineTo(x2, y2);
        bioCtx.stroke();
    });

    /* Joints */
    landmarks.forEach((lm, i) => {
        const [x, y] = sx(lm);
        const isWrist = i === 0;
        bioCtx.beginPath();
        bioCtx.arc(x, y, isWrist ? 7 : 4, 0, Math.PI * 2);
        bioCtx.fillStyle    = isWrist ? '#7b2fff' : (i % 4 === 0 ? '#00ff88' : '#00d4ff');
        bioCtx.shadowColor  = isWrist ? '#7b2fff' : '#00d4ff';
        bioCtx.shadowBlur   = isWrist ? 18 : 10;
        bioCtx.fill();
    });

    /* Palm bounding box glow */
    const xs = landmarks.map(l => l[0] * scaleX);
    const ys = landmarks.map(l => l[1] * scaleY);
    const bx = Math.min(...xs), by = Math.min(...ys);
    const bw = Math.max(...xs) - bx, bh = Math.max(...ys) - by;

    bioCtx.strokeStyle = 'rgba(0,212,255,0.22)';
    bioCtx.lineWidth   = 1;
    bioCtx.shadowBlur  = 0;
    bioCtx.strokeRect(bx - 10, by - 10, bw + 20, bh + 20);

    bioCtx.restore();
}

/* ── Main detection loop ── */
async function detectLoop() {
    if (authState === 'granted' || !model || !bioRunning) return;
    if (detecting) { requestAnimationFrame(detectLoop); return; }

    detecting = true;
    let predictions;

    try {
        predictions = await model.estimateHands(bioVideo);
    } catch (e) {
        detecting = false;
        requestAnimationFrame(detectLoop);
        return;
    }

    /* Clear canvas each frame */
    bioCtx.clearRect(0, 0, bioCanvas.width, bioCanvas.height);

    if (predictions && predictions.length > 0) {
        const hand = predictions[0];
        detectedFrames = Math.min(detectedFrames + 1, FRAMES_NEEDED + 5);

        /* Draw hand skeleton */
        drawHand(hand.landmarks);

        const conf = Math.round(hand.handInViewConfidence * 100);
        const pct  = Math.min(99, (detectedFrames / FRAMES_NEEDED) * 100);

        /* Update state machine */
        if (authState === 'active') {
            authState = 'scanning';
            showOverlay('scan');
            setSystemStatus('scanning', 'PALM DETECTED — INITIALIZING SCAN');
        }

        if (authState === 'scanning' && pct >= 35) {
            authState = 'analyzing';
            showOverlay('analyze');
            setSystemStatus('scanning', 'ANALYZING BIOMETRIC SIGNATURE...');
        }

        /* Progress labels */
        let progressLabel = 'DETECTING PALM...';
        if (pct >= 30 && pct < 60) progressLabel = 'ANALYZING BIOMETRICS...';
        else if (pct >= 60 && pct < 88) progressLabel = 'VERIFYING IDENTITY...';
        else if (pct >= 88) progressLabel = 'AUTHORIZING ACCESS...';

        setProgress(pct, progressLabel);
        updateTelemetry('YES', conf + '%', hand.landmarks.length, 'ANALYZING', detectedFrames);

        /* Check grant threshold */
        if (detectedFrames >= FRAMES_NEEDED) {
            grantAccess();
            detecting = false;
            return;
        }

    } else {
        /* No hand — regress progress slowly */
        if (authState === 'scanning' || authState === 'analyzing') {
            detectedFrames = Math.max(0, detectedFrames - 2);
            const pct = (detectedFrames / FRAMES_NEEDED) * 100;
            setProgress(pct, 'PALM LOST — HOLD STEADY...');
            updateTelemetry('NO', '--', '--', 'SEARCHING', detectedFrames);

            if (detectedFrames === 0) {
                authState = 'active';
                showOverlay('idle');
                setSystemStatus('online', 'READY — AWAITING PALM');
                setProgress(0, 'AWAITING INPUT');
            }
        } else {
            updateTelemetry('NO', '--', '--', 'WAITING', 0);
        }
    }

    detecting = false;
    requestAnimationFrame(detectLoop);
}

/* ── Grant Access ── */
function grantAccess() {
    authState = 'granted';
    showOverlay('granted');
    setSystemStatus('granted', 'IDENTITY VERIFIED — ACCESS GRANTED');
    setProgress(100, 'ACCESS GRANTED');
    updateTelemetry('YES', '100%', '21', 'AUTHORIZED', FRAMES_NEEDED);

    /* All steps done */
    pSteps.forEach(el => {
        el.classList.remove('active');
        el.classList.add('done');
    });

    /* Flash the panel border green */
    const panel = document.getElementById('cam-hud-panel');
    panel.style.borderColor = 'var(--green)';
    panel.style.boxShadow   = 'var(--glow-g)';

    /* ── Inauguration Voice & Redirect ── */
    // Use Web Speech API for dramatic announcement
    if ('speechSynthesis' in window) {
        const msg = new SpeechSynthesisUtterance("Biometric verified. Welcome Principal. Tech Manthan 6 point 0 is now officially inaugurated. Initializing event portal.");
        msg.rate = 0.9; // Slightly slower for dramatic effect
        msg.pitch = 0.8; // Deeper voice
        window.speechSynthesis.speak(msg);
    }

    // Wait 5 seconds to let the voice finish and user to see the "Access Granted" screen, then redirect
    setTimeout(() => {
        // Stop camera stream before redirecting
        if (bioVideo.srcObject) {
            bioVideo.srcObject.getTracks().forEach(track => track.stop());
        }
        window.location.href = 'home.html';
    }, 6000);
}

/* ── PUBLIC: init biometric ── */
window.initBiometric = async function () {
    if (bioRunning) return;
    bioRunning = true;
    activateBtn.style.display = 'none';

    setSystemStatus('online', 'REQUESTING CAMERA ACCESS...');
    setProgress(3, 'REQUESTING CAMERA...');

    try {
        /* ── Check if MediaDevices API exists ── */
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error("Camera API not supported or blocked. Ensure you are using http://127.0.0.1:8080");
        }

        /* ── Camera ── */
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' }
        });
        bioVideo.srcObject = stream;
        bioVideo.style.display = 'block';

        await new Promise(resolve => {
            bioVideo.onloadedmetadata = resolve;
        });

        /* Match canvas to video resolution */
        bioCanvas.width  = bioVideo.videoWidth  || 640;
        bioCanvas.height = bioVideo.videoHeight || 480;

        setSystemStatus('online', 'LOADING NEURAL NETWORK MODEL...');
        setProgress(12, 'LOADING AI MODEL...');

        /* ── Load HandPose ── */
        model = await handpose.load();

        authState = 'active';
        setSystemStatus('online', 'SYSTEM READY — AWAITING PALM');
        setProgress(0, 'AWAITING INPUT');
        showOverlay('idle');
        updateTelemetry('NO', '--', '--', 'WAITING', 0);

        /* Start loop */
        detectLoop();

    } catch (err) {
        console.error("Camera Error Details:", err);
        const errMsg = err.name === 'NotAllowedError' ? 'CAMERA ACCESS DENIED BY BROWSER' 
                     : err.name === 'NotFoundError' ? 'NO WEBCAM DETECTED ON THIS COMPUTER'
                     : err.message.substring(0, 50).toUpperCase();
                     
        setSystemStatus('offline', 'ERROR: ' + errMsg);
        setProgress(0, 'ERROR — RETRY');
        activateBtn.style.display = 'flex';
        bioRunning = false;
        alert("Camera Error: " + err.message + "\n\nPlease ensure you are using the link http://127.0.0.1:8080/index.html and your browser has permission to use the camera in Windows settings.");
    }
};
