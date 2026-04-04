const countries = ["UAE", "Taiwan", "Kazakhstan", "Lebanon"];
let current = 0;

function openCountry(index) {
  current = index;
  renderCountry();
}

function renderCountry() {
  const frame = document.getElementById("frame");
  frame.innerHTML = `
    <div class="arrow left" onclick="prev()">‹</div>
    <div class="country">
      <h2>Faiza the Falcon: In ${countries[current]}</h2>
      <img src="https://via.placeholder.com/200" />
      <br>
      <button class="back" onclick="resetMap()">Back</button>
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
  document.getElementById("frame").innerHTML = `
    <div class="map">
      <button onclick="openCountry(0)">UAE</button>
      <button onclick="openCountry(1)">Taiwan</button>
      <button onclick="openCountry(2)">Kazakhstan</button>
      <button onclick="openCountry(3)">Lebanon</button>
    </div>
  `;
}

function scrollToSection(id) {
  document.getElementById(id).scrollIntoView({ behavior: "smooth", block: "start" });
}