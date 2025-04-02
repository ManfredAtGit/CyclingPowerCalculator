function calculateCyclistPower(
    cyclistSpeedKmh = 0,
    windSpeedKmh = 0,
    windDirectionDegrees = 0,
    cyclistDirectionDegrees = 90,
    percAscent = 0,
    bodyWeight = 70,
    bikeWeight = 10) {
    /**
     * Calculates the power a cyclist needs to produce, considering wind.
     * TODO: incorporate ascent in calculation
     *
     * @param cyclistSpeedKmh Cyclist speed in km/h.
     * @param windSpeedKmh True wind speed in km/h.
     * @param windDirectionDegrees Wind direction in degrees (0 = headwind, 180 = tailwind).
     * @param cyclistDirectionDegrees The direction in degrees the cyclist is riding (default from west to east).
     * @param percAscent Percentage of ascent.
     * @param bodyWeight Cyclist's body weight in kg.
     * @param bikeWeight Bike weight in kg.
     * @returns Total power in watts.
     */

    // Constants
    const airDensity = 1.225; // kg/m^3
    const dragCoefficient = 0.4;
    const frontalArea = 0.5; // m^2
    const rollingResistanceCoefficient = 0.005;
    const cyclistBikeMass = bodyWeight + bikeWeight; // kg

    const gravity = 9.81; // m/s^2
    const percAscentRadians = (percAscent * Math.PI) / 180;

    // Convert speeds to m/s
    const cyclistSpeedMs = cyclistSpeedKmh / 3.6;
    const windSpeedMs = windSpeedKmh / 3.6;

    // Rotate by cyclist direction
    let windCyclistDirDegrees = (windDirectionDegrees - cyclistDirectionDegrees) % 360;
    if (windCyclistDirDegrees < 0) windCyclistDirDegrees += 360;

    // Calculate relative wind speed
    let windCyclistDirFlipped = (180 - windCyclistDirDegrees) % 360;
    if (windCyclistDirFlipped < 0) windCyclistDirFlipped += 360;
    const windDirectionRadians = (windCyclistDirFlipped * Math.PI) / 180;
    const relativeWindSpeedMs = Math.sqrt(
        Math.pow(cyclistSpeedMs, 2) +
        Math.pow(windSpeedMs, 2) -
        2 * cyclistSpeedMs * windSpeedMs * Math.cos(windDirectionRadians)
    );

    // Calculate drag force and power
    const dragForce = 0.5 * airDensity * dragCoefficient * frontalArea * Math.pow(relativeWindSpeedMs, 2);
    const dragPower = dragForce * cyclistSpeedMs;

    // Calculate rolling resistance force and power
    const ascentFactor = Math.cos(Math.atan(percAscentRadians));
    const rollingResistanceForce = rollingResistanceCoefficient * cyclistBikeMass * gravity * ascentFactor;
    const rollingResistancePower = rollingResistanceForce * cyclistSpeedMs;

    // Calculate gravitational force and power due to ascent
    //console.log('percAscent: ', percAscent, 'radians: ', percAscentRadians);

 

    //const atanRadians = Math.atan(percAscentRadians); 
    //const gravitationalForce = cyclistBikeMass * gravity * Math.sin(atanRadians);
    //let gravitationalPower = gravitationalForce * cyclistSpeedMs;
    // for some reason, above calculation yields much to high values
    const slope = percAscent/100.0;
    const angle = Math.atan(slope);
    const gravitationalPower = cyclistBikeMass * gravity * Math.sin(angle)  * cyclistSpeedMs;

    // use simpler calculation for small slopes 

    /*
    if (slope>=0) {
        gravitationalPower = cyclistBikeMass * gravity * slope * cyclistSpeedMs;
    } else {
        gravitationalPower = - (cyclistBikeMass * gravity * Math.abs(slope) * cyclistSpeedMs);
    }
    */
  

    // Calculate total power
    const totalPower = dragPower + rollingResistancePower + gravitationalPower;

    return Math.max(totalPower,0);
}

function calculateHeartBeatsPerMinute(power, ftp=170) {

    /**
     * Calculates/estimates the heart beats rate as a function of power(watts) and functional threashold power.
     *
     * @param power in wats.
     * @param ftp functional threashold power.
     * @returns estimate for heart beats per minute.
     */

    const maxHearttRate = 180;
    const minHeartRate = 60;

    let calculatedValue = (power / ftp) * (maxHearttRate - minHeartRate) + minHeartRate;
    //return (power / ftp) * (maxHearttRate - minHeartRate) + minHeartRate;
    return Math.min(maxHearttRate,calculatedValue)
}

const canvas = document.getElementById('visualizationCanvas');
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setClearColor(0x222222);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 7;

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.1;
controls.rotateSpeed = 0.5;
controls.enableRotate = false;
controls.enableZoom = false;

const bikes = [];
const bikeCount = 50;
for (let i = 0; i < bikeCount; i++) {
    const bike = {
        element: document.createElement('div'),
        x: (Math.random() - 0.5) * 10,
        y: (Math.random() - 0.5) * 10,
        z: (Math.random() - 0.5) * 10,
        rotation: Math.PI / 0.5,
        xSpeed: -0.002,
        ySpeed: 0,
        zSpeed: 0,
    };
    bike.element.classList.add('bike-icon');
    bike.element.innerHTML = '<i class="fas fa-bicycle"></i>';
    document.body.appendChild(bike.element);
    bikes.push(bike);
}

const ascentSlider = document.getElementById('ascentSlider');
const ascentValueDisplay = document.getElementById('ascentValue');
let ascent = parseInt(ascentSlider.value);

const speedSlider = document.getElementById('speedSlider');
const speedValueDisplay = document.getElementById('speedValue');
let speed = parseInt(speedSlider.value);

const windForceSlider = document.getElementById('windForceSlider');
const windForceValueDisplay = document.getElementById('windForceValue');
let windForce = parseInt(windForceSlider.value);

const windDirectionControl = document.getElementById('windDirectionControl');
const windDirectionArrow = document.getElementById('windDirectionArrow');

let windDirection = 0;
let isDragging = false;
let startAngle = 0;

const powerValueDisplay = document.getElementById('powerValue'); // Get the power display element
const powerBulb = document.getElementById('powerBulb');
let cyclistDirection = 90;

const heartBeatValueDisplay = document.getElementById('heartBeatValue'); // Get the heart rate display element

const heartBeatIcon = document.getElementById('heartBeatIcon'); // Get the heart icon element
let heartBeatInterval = null;

let ftp = 170; // Default FTP value
let weight = 70; // Default bodyweight value
let bikeWeight = 10; // Default bike weight value

function updatePowerDisplay() {
    const percAscent = parseFloat(ascentSlider.value);
    const cyclistSpeed = parseFloat(speedSlider.value);
    const windSpeed = parseFloat(windForceSlider.value);
    // Convert windDirection from radians to degrees and normalize to 0-360 range
    let windDirectionDegrees = (windDirection * 180 / Math.PI) % 360;
    if (windDirectionDegrees < 0) {
        windDirectionDegrees += 360;
    }

    const power = calculateCyclistPower(cyclistSpeed, windSpeed, windDirectionDegrees, cyclistDirection, percAscent, weight, bikeWeight);
    powerValueDisplay.textContent = power.toFixed(0); // Update the display

    // Change bulb color based on power, interpolating between orange, yellow, and white
    let bulbColor = '';
    let shadowColor = '';
    const maxPower = 500; // Adjust as needed
    const normalizedPower = Math.min(power, maxPower) / maxPower; // Normalize to 0-1

    if (normalizedPower < 0.33) { // Orange to Yellow
        const red = 255;
        const green = 165 + (255 - 165) * (normalizedPower / 0.33);
        const blue = 0;
        bulbColor = `rgb(${red}, ${green}, ${blue})`;
        shadowColor = `rgba(${red}, ${green}, ${blue}, 0.6)`;
    } else if (normalizedPower < 0.66) { // Yellow to White
        const red = 255;
        const green = 255;
        const blue = (normalizedPower - 0.33) / 0.33 * 255;
        bulbColor = `rgb(${red}, ${green}, ${blue})`;
        shadowColor = `rgba(${red}, ${green}, ${blue}, 0.8)`;
    } else {
        const red = 255;
        const green = 255;
        const blue = 255;
        bulbColor = `rgb(${red}, ${green}, ${blue})`;
        shadowColor = `rgba(${red}, ${green}, ${blue}, 1)`;
    }

    powerBulb.style.color = bulbColor;
    powerBulb.style.textShadow = `0 0 15px ${shadowColor}`;

    // Calculate and display heart rate
    const heartRate = calculateHeartBeatsPerMinute(power, ftp);
    heartBeatValueDisplay.textContent = heartRate.toFixed(0);

    // Update heart beat animation
    if (heartBeatInterval) {
        clearInterval(heartBeatInterval);
    }
    const interval = 60000 / heartRate;
    heartBeatInterval = setInterval(() => {
        // Heart beat animation is handled by CSS, we just need to trigger it.
        heartBeatIcon.style.animation = 'none';
        void heartBeatIcon.offsetWidth; // Trigger reflow
        heartBeatIcon.style.animation = 'beat 1s infinite';
    }, interval);

}

ascentSlider.addEventListener('input', (event) => {
    ascent = parseInt(event.target.value);
    ascentValueDisplay.textContent = ascent.toFixed(0);
    
    // Calculate color based on slider value
    const value = parseInt(event.target.value);
    let color;
    
    if (value < 0) {
        // For negative values (-15 to 0): Dark green to #ddd
        const greenValue = Math.floor(128 + (128 * (15 + value) / 15));
        color = `rgb(0, ${greenValue}, 0)`;
    } else if (value > 0) {
        // For positive values (0 to 15): dark red to light gray
        // Calculate the red component from 255 (dark red) to 128 (#ddd)
        const redValue = Math.floor(255 - (127 * value / 15));
        color = `rgb(${redValue}, 0, 0)`;
    } else {
        // value = 0
        color = `rgb(221, 221, 221)`;
    }
    
    // Apply the color
    event.target.style.backgroundColor = color;
    
    updatePowerDisplay(); // Update power on input change
});

speedSlider.addEventListener('input', (event) => {
    speed = parseInt(event.target.value);
    speedValueDisplay.textContent = speed.toFixed(0);
    updatePowerDisplay(); // Update power on input change
});

windForceSlider.addEventListener('input', (event) => {
    windForce = parseInt(event.target.value);
    windForceValueDisplay.textContent = windForce.toFixed(0);
    updatePowerDisplay(); // Update power on input change
});

windDirectionControl.addEventListener('mousedown', (event) => {
    isDragging = true;
    const rect = windDirectionControl.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const x = event.clientX - centerX;
    const y = event.clientY - centerY;
    startAngle = Math.atan2(y, x);
});

document.addEventListener('mousemove', (event) => {
    if (!isDragging) return;
    const rect = windDirectionControl.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const x = event.clientX - centerX;
    const y = event.clientY - centerY;
    let currentAngle = Math.atan2(y, x);
    let deltaAngle = currentAngle - startAngle;

    if (deltaAngle > Math.PI) {
        deltaAngle -= 2 * Math.PI;
    } else if (deltaAngle < -Math.PI) {
        deltaAngle += 2 * Math.PI;
    }
    windDirection += deltaAngle;
    startAngle = currentAngle;
    windDirectionArrow.style.transform = `rotate(${windDirection}rad)`;

    // Convert radians to degrees (0-360 range)
    let degrees = (windDirection * 180 / Math.PI) % 360;
    if (degrees < 0) {
        degrees += 360;
    }
    //console.log("Wind Direction:", degrees);
    updatePowerDisplay(); // Update power on mousemove
});

document.addEventListener('mouseup', () => {
    isDragging = false;
});

const ftpInput = document.getElementById('ftpInput');
ftpInput.addEventListener('input', (event) => {
    ftp = parseInt(event.target.value);
    updatePowerDisplay(); // Update display when FTP changes
});

const weightInput = document.getElementById('weightInput');
weightInput.addEventListener('input', (event) => {
    weight = parseInt(event.target.value);
    updatePowerDisplay(); // Update display when weight changes
});

const bikeWeightInput = document.getElementById('bikeWeightInput');
bikeWeightInput.addEventListener('input', (event) => {
    bikeWeight = parseInt(event.target.value);
    updatePowerDisplay(); // Update display when bike weight changes
});

function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = window.innerWidth;
    const height = window.innerHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    }
    return needResize;
}

const windArrows = [];
const maxWindArrows = 100;
function createWindArrow(x, y) {
    if (windArrows.length >= maxWindArrows) {
        const arrowToRemove = windArrows.shift();
        document.body.removeChild(arrowToRemove.element);
    }
    const arrow = {
        element: document.createElement('div'),
        x: x,
        y: y,
        rotation: windDirection + Math.PI,
        speedX: 0,
        speedY: 0,
        age: 0,
        size: 16,
    };
    arrow.element.classList.add('wind-arrow');
    arrow.element.innerHTML = '<i class="fas fa-arrow-up"></i>';
    document.body.appendChild(arrow.element);
    windArrows.push(arrow);
    return arrow;
}

function animate() {
    requestAnimationFrame(animate);
    resizeRendererToDisplaySize(renderer);
    controls.update();

    bikes.forEach(bike => {
        bike.x += speed * bike.xSpeed;
        bike.y += bike.ySpeed;
        bike.z += bike.zSpeed;

        if (bike.x > 5) bike.x = -5;
        if (bike.x < -5) bike.x = 5;

        const vector = new THREE.Vector3(bike.x, bike.y, bike.z);
        vector.project(camera);
        const canvasRect = canvas.getBoundingClientRect();
        const x2d = Math.round((vector.x + 1) * canvasRect.width / 2);
        const y2d = Math.round((-vector.y + 1) * canvasRect.height / 2);

        bike.element.style.left = `${x2d}px`;
        bike.element.style.top = `${y2d}px`;
        bike.element.style.transform = `translate(-50%, -50%) rotate(${bike.rotation}rad)`;
    });

    // Windarrow logic
    if (Math.random() < 0.1) {
        const x = (Math.random() - 0.5) * window.innerWidth;
        const y = (Math.random() - 0.5) * window.innerHeight;
        createWindArrow(x, y);
    }

    windArrows.forEach(arrow => {
        const windSpeed = windForce * 0.2;
        arrow.x += Math.cos(arrow.rotation + Math.PI * 1.5) * windSpeed;
        arrow.y += Math.sin(arrow.rotation + Math.PI * 1.5) * windSpeed;
        arrow.age += 1;

        const canvasRect = canvas.getBoundingClientRect();
        const x2d = arrow.x + canvasRect.width / 2;
        const y2d = arrow.y + canvasRect.height / 2;
        const sizeFactor = 1 + (windForce / 50) * 2;
        arrow.size = 16 * sizeFactor;

        // Color logic
        let arrowColor = 'rgba(0, 255, 255, 0.7)';
        let degrees = (windDirection * 180 / Math.PI) % 360;
        if (degrees < 0) degrees += 360;

        if (degrees >= 0 && degrees <= 180) {
            arrowColor = 'rgba(255, 0, 0, 0.7)';
        } else {arrowColor = 'rgba(0, 255, 0, 0.7)';
        }

        arrow.element.style.left = `${x2d}px`;
        arrow.element.style.top = `${y2d}px`;
        arrow.element.style.fontSize = `${arrow.size}px`;
        arrow.element.style.color = arrowColor;
        arrow.element.style.transform = `translate(-50%, -50%) rotate(${arrow.rotation}rad)`;

        if (arrow.age > 100 || x2d < 0 || x2d > canvasRect.width || y2d < 0 || y2d > canvasRect.height) {
            const index = windArrows.indexOf(arrow);
            if (index > -1) {
                windArrows.splice(index, 1);
                document.body.removeChild(arrow.element);
            }
        }
    });

    renderer.render(scene, camera);
}

resizeRendererToDisplaySize(renderer);
animate();

// Initial call of updatePowerDisplay
updatePowerDisplay();

// Get the info button and popup elements
const infoButton = document.getElementById('infoButton');
const infoPopup = document.getElementById('infoPopup');
const popupClose = document.querySelector('.popup-close');
const readmeContentDiv = document.getElementById('readmeContent');

// Function to fetch and display content from README.md
function fetchReadme() {
    // Use a proxy to avoid CORS issues.  Replace with a suitable proxy if needed.
    const proxyUrl = 'https://cors-anywhere.herokuapp.com/'; // Or another CORS proxy
    const readmeUrl = 'README.md';
    gitUrl='https://raw.githubusercontent.com/ManfredAtGit/CyclingPowerCalculator/refs/heads/main/README.md';


    fetch(gitUrl)
    //fetch(proxyUrl + readmeUrl)
    //fetch('README.md')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(data => {
            // Convert Markdown to HTML (basic conversion for demonstration)
            const html = data
                .replace(/^# (.*$)/gim, '<h2>$1</h2>') // h1
                .replace(/^## (.*$)/gim, '<h3>$1</h3>') // h2
                .replace(/^### (.*$)/gim, '<h4>$1</h4>') // h3
                .replace(/\*\*(.*)\*\*/gim, '<b>$1</b>') // bold
                .replace(/\*(.*)\*/gim, '<i>$1</i>') // italic
                .replace(/!\[(.*?)\]\((.*?)\)/gim, "<img alt='$1' src='$2' />") // images
                .replace(/\[(.*?)\]\((.*?)\)/gim, "<a href='$2'>$1</a>") // links
                .replace(/\n$/gim, '<br />') // line breaks -  Consider more robust paragraph handling
                .replace(/\n/gim, '<p></p>') // paragraphs - Basic paragraph replacement, might need improvement

                // Additional translations
                .replace(/`([^`]*)`/gim, '<code>$1</code>') // Inline code
                .replace(/^(-|\*) (.*$)/gim, '<li>$2</li>') // List items
                .replace(/^(<li>.*<\/li>)+/gim, '<ul>$&</ul>') // Wrap list items in <ul>
                .replace(/```([^]*)```/gim, '<pre><code>$1</code></pre>') // Code blocks

                // Handle headers containing special characters or inline code
                .replace(/^## ([^(]+)\((.*)\)$/gim, (match, text, inlineCode) => `<h3>${text} (<code>${inlineCode}</code>)</h3>`)
                .replace(/^## ([^(]+)<([^>]*)>$/gim, (match, text, inlineCode) => `<h3>${text} (<code>${inlineCode}</code>)</h3>`);

            readmeContentDiv.innerHTML = html;
        })
        .catch(error => {
            console.error('Error fetching README.md:', error);
            readmeContentDiv.innerHTML = '<p>Failed to load description.</p>';
        });
}

// Event listener for the info button to show the popup
infoButton.addEventListener('click', () => {
    infoPopup.style.display = 'block';
    fetchReadme(); // Fetch and display README content when popup is shown
});

// Event listener for the close button to hide the popup
popupClose.addEventListener('click', () => {
    infoPopup.style.display = 'none';
});

// Event listener to close the popup when clicking outside of it
window.addEventListener('click', (event) => {
    // Check if the click is outside the popup AND not on the infoButton or its children
    if (!infoPopup.contains(event.target) && !infoButton.contains(event.target) && infoPopup.style.display === 'block') {
        infoPopup.style.display = 'none';
    }
});

// Add help button element
const helpButton = document.getElementById('helpButton');

// Add click event listener for help button
helpButton.addEventListener('click', () => {
    const helpPopup = document.createElement('div');
    helpPopup.id = 'helpPopup';
    helpPopup.className = 'popup';
    helpPopup.style.display = 'block'; // Make it visible immediately

    
    helpPopup.innerHTML = `
        <h2>Manfred's cycling performance calculator</h2>
        <p>Use the sliders to adjust:</p>
        <ul>
            <li><strong>Ascent:</strong> Adjust the incline (-15 to +15)</li>
            <li><strong>Speed:</strong> Set your cycling speed (0 to 80 km/h)</li>
            <li><strong>Wind Force:</strong> Set the wind strength (0 to 50 km/h)</li>
        </ul>
        <p>Use up-down arrows to adjust:</p>
        <ul>
            <li><strong>FTP:</strong> Set your functional threshold power (150 to 300 W)</li>
            <li><strong>Weight:</strong> Set your body weight (60 to 120 kg)</li>
            <li><strong>Bike Weight:</strong> Set your bike weight (8 to 20 kg)</li>
            <li><strong>Age:</strong> Set your age [20 to 80 years]. (currently not used)</li>
        </ul>
        <p>The visualization shows your power output in watts along with an estimate for heart rate.</p>
        <div class="popup-close">&times;</div>
    `;
    
    document.body.appendChild(helpPopup);
    
    // Add close button functionality
    const closeBtn = helpPopup.querySelector('.popup-close');
    closeBtn.addEventListener('click', () => {
        helpPopup.remove();
    });
});
