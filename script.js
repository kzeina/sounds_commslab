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

function initGlobe() {
  const container = document.getElementById('globe-container');
  if (!container || typeof Globe === 'undefined') return;

  container.innerHTML = '';

  const frame  = document.getElementById('frame');
  const width  = frame.clientWidth  || 700;
  const height = frame.clientHeight || 440;

  globeInstance = Globe()(container)
    .globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
    .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
    .backgroundColor('rgba(0,0,0,0)')
    .width(width)
    .height(height)
    .showAtmosphere(true)
    .atmosphereColor('#9b59b6')
    .atmosphereAltitude(0.15)
    .htmlElementsData(markerData)
    .htmlLat('lat')
    .htmlLng('lng')
    .htmlAltitude(0.02)
    .htmlElement(d => {
      const wrapper = document.createElement('div');
      wrapper.className = 'globe-pin';
      wrapper.style.pointerEvents = 'all';

      const img = document.createElement('img');
      img.src = 'main-page/marker.png';
      img.alt = d.name;
      img.className = 'globe-pin__icon';

      const label = document.createElement('span');
      label.textContent = d.name;
      label.className = 'globe-pin__label';

      wrapper.appendChild(img);
      wrapper.appendChild(label);
      wrapper.addEventListener('click', () => openCountry(d.index));
      return wrapper;
    });

  // Centre the view on the band spanning all four locations
  globeInstance.pointOfView({ lat: 35, lng: 65, altitude: 1.8 }, 800);

  // Slow auto-rotation
  globeInstance.controls().autoRotate = true;
  globeInstance.controls().autoRotateSpeed = 0.35;
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
  const frame = document.getElementById("frame");
  frame.innerHTML = '<div id="globe-container"></div>';
  setTimeout(initGlobe, 60);
}

function scrollToSection(id) {
  document.getElementById(id).scrollIntoView({ behavior: "smooth", block: "start" });
}

document.addEventListener('DOMContentLoaded', initGlobe);
