const countries = ["UAE", "Taiwan", "Kazakhstan", "Lebanon"];
const countryPages = ["uae.html", "taiwan.html", "kazakhstan.html", "lebanon.html"];
let current = 0;
let globeInstance = null;

const markerData = [
  { name: "UAE",        index: 0, lat: 25.2048,  lng: 55.2708  },
  { name: "Taiwan",     index: 1, lat: 25.0330,  lng: 121.5654 },
  { name: "Kazakhstan", index: 2, lat: 51.1801,  lng: 71.4460  },
  { name: "Lebanon",    index: 3, lat: 33.8938,  lng: 35.5018  },
];

// Falcon state — starts at UAE
let falconLat = 25.2048;
let falconLng = 55.2708;
let falconLoopActive = false;

function initGlobe() {
  const container = document.getElementById('globe-container');
  if (!container || typeof Globe === 'undefined') return;

  container.innerHTML = '';
  falconLoopActive = false;

  const frame  = document.getElementById('frame');
  const width  = frame.clientWidth  || 1100;
  const height = frame.clientHeight || 750;

  globeInstance = Globe()(container)
    .globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
    .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
    .backgroundColor('rgba(0,0,0,0)')
    .width(width)
    .height(height)
    .showAtmosphere(false)
    .labelsData(markerData)
    .labelLat('lat')
    .labelLng('lng')
    .labelText('name')
    .labelSize(1.8)
    .labelColor(() => '#ffffff')
    .labelAltitude(0)
    .labelDotRadius(0.4)
    .labelDotOrientation(() => 'bottom')
    .onLabelClick(d => {
      const target = markerData[d.index];
      flyFalconTo(target.lat, target.lng, () => openCountry(d.index));
    })
    .ringsData(markerData)
    .ringLat('lat')
    .ringLng('lng')
    .ringColor(() => t => `rgba(255,255,255,${1 - t})`)
    .ringStroke(1.7)
    .ringPropagationSpeed(1)
    .ringRepeatPeriod(1000);

  globeInstance.pointOfView({ lat: 35, lng: 65, altitude: 1.2 }, 0);

  const controls = globeInstance.controls();
  controls.autoRotate      = true;
  controls.autoRotateSpeed = 0.35;
  controls.enableZoom      = false;
  controls.enablePan       = false;

  // Lock vertical tilt so only left/right rotation is possible
  const fixedPolar = (90 - 35) * Math.PI / 180; // matches the lat:35 POV
  controls.minPolarAngle = fixedPolar;
  controls.maxPolarAngle = fixedPolar;

  // Falcon sprite overlay
  const falcon = document.createElement('img');
  falcon.id = 'falcon-sprite';
  falcon.src = 'faiza/standing.png';
  falcon.style.cssText = `
    position: absolute;
    width: 55px;
    height: auto;
    pointer-events: none;
    z-index: 10;
    transform: translate(-50%, -100%);
    transition: opacity 0.2s;
  `;
  container.style.position = 'relative';
  container.appendChild(falcon);

  falconLoopActive = true;
  runFalconLoop(falcon);
}

function latLngToScreen(lat, lng) {
  // Convert lat/lng to three-globe's internal 3D cartesian (radius = 100)
  const phi   = (90 - lat) * Math.PI / 180;
  const theta = (lng + 180) * Math.PI / 180;
  const R = 100;
  const px = -R * Math.sin(phi) * Math.cos(theta);
  const py =  R * Math.cos(phi);
  const pz =  R * Math.sin(phi) * Math.sin(theta);

  const cam      = globeInstance.camera();
  const renderer = globeInstance.renderer();
  const W = renderer.domElement.clientWidth;
  const H = renderer.domElement.clientHeight;

  // THREE.js matrices are column-major
  const vm = cam.matrixWorldInverse.elements;
  const pm = cam.projectionMatrix.elements;

  // World → camera space
  const vx = vm[0]*px + vm[4]*py + vm[8]*pz  + vm[12];
  const vy = vm[1]*px + vm[5]*py + vm[9]*pz  + vm[13];
  const vz = vm[2]*px + vm[6]*py + vm[10]*pz + vm[14];
  const vw = vm[3]*px + vm[7]*py + vm[11]*pz + vm[15];

  // Camera → clip space
  const cx = pm[0]*vx + pm[4]*vy + pm[8]*vz  + pm[12]*vw;
  const cy = pm[1]*vx + pm[5]*vy + pm[9]*vz  + pm[13]*vw;
  const cw = pm[3]*vx + pm[7]*vy + pm[11]*vz + pm[15]*vw;

  if (cw <= 0) return null; // point is behind the camera

  return {
    x: ( cx/cw + 1) / 2 * W,
    y: (-cy/cw + 1) / 2 * H
  };
}

function runFalconLoop(falcon) {
  if (!falconLoopActive || !globeInstance) return;

  const pos = latLngToScreen(falconLat, falconLng);
  if (pos) {
    falcon.style.display = 'block';
    falcon.style.left = pos.x + 'px';
    falcon.style.top  = pos.y + 'px';
  } else {
    // Hide when on the back side of the globe
    falcon.style.display = 'none';
  }

  requestAnimationFrame(() => runFalconLoop(falcon));
}

function flyFalconTo(targetLat, targetLng, onDone) {
  const startLat = falconLat;
  const startLng = falconLng;
  const duration = 1200;
  const startTime = performance.now();

  function step(now) {
    const t = Math.min((now - startTime) / duration, 1);
    // ease-in-out
    const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    falconLat = startLat + (targetLat - startLat) * ease;
    falconLng = startLng + (targetLng - startLng) * ease;

    if (t < 1) {
      requestAnimationFrame(step);
    } else {
      falconLat = targetLat;
      falconLng = targetLng;
      onDone();
    }
  }

  requestAnimationFrame(step);
}

function openCountry(index) {
  window.location.href = countryPages[index];
}

function renderCountry() {
  const frame = document.getElementById("frame");
  frame.innerHTML = `
    <div class="arrow left" onclick="prev()">‹</div>
    <div class="country">
      <h2>Faiza the Falcon: In ${countries[current]}</h2>
      <img src="https://via.placeholder.com/200" />
      <br>
      <button class="back" onclick="resetMap()">← Back to Globe</button>
    </div>
    <div class="arrow right" onclick="next()">›</div>
  `;
}

function next() {
  current = (current + 1) % countries.length;
  renderCountry();
}

function prev() {
  current = (current - 1 + countries.length) % countries.length;
  renderCountry();
}

function resetMap() {
  falconLoopActive = false;
  falconLat = 25.2048;
  falconLng = 55.2708;
  const frame = document.getElementById("frame");
  frame.innerHTML = '<div id="globe-container"></div>';
  setTimeout(initGlobe, 60);
}

function scrollToSection(id) {
  document.getElementById(id).scrollIntoView({ behavior: "smooth", block: "start" });
}

document.addEventListener('DOMContentLoaded', initGlobe);
