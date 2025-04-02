# YAWC (Yet Another Watt Computer) 
is a web application that visualizes and animates the movement and power output (watt) of a cyclist under the influence of different forces. It includes features like speed control, wind direction and force, and power display.

The application uses client-side only Javascipt

[View on github pages](https://manfredatgit.github.io/CyclingPowerCalculator/)

Key features include:

## Visualization
- Uses Three.js for rendering the 3D scene, including the cyclists (represented by bicycle icons).
- however: currently this application is pure 2D

## User Controls
- **Ascent Slider**: Controls the ascent/descend (currently not yet used for power calculation).
- **Speed Slider**: Controls the speed of the cyclists.
- **Wind Force Slider**: Controls the force of the wind.
- **Wind Direction Control**: A circular control to set the wind direction.

## Dynamic Elements
- Cyclist movement, responding to the speed slider.
- Wind arrows, showing direction and intensity.
- **Power Display**: Calculates and displays the cyclist's power output (in Watts), changing the color of a lightbulb icon.
- **Heart Rate Display**: Calculates and displays estimated heart rate (in bpm), and animates a heart icon.

## Responsive Design
- The canvas adapts to the window size.

# Key Code Sections

## HTML (body)
- **Canvas (`#visualizationCanvas`)**: The rendering area for the 3D scene.
- **Ascent Slider (`#ascentSlider`)**: A slider to control the ascent of the ride (currently not used for power calculation).
- **Speed Slider (`#speedSlider`)**: A slider to control the speed of the bicycle.
- **Wind Force Slider (`#windForceSlider`)**: A slider to control the wind force.
- **Wind Direction Control (`#windDirectionControl`)**: A circular control to set wind direction.
- **Power Display (`#powerDisplay`)**: Displays calculated power.
- **Power Bulb (`#powerBulb`)**: A lightbulb icon, its color changes with power.
- **Heart Beat Display (`#heartBeatDisplay`)**: Displays calculated heart rate.
- **Heart Beat Icon (`#heartBeatIcon`)**: An icon that beats with the heart rate.

## CSS (style)
- Basic styling for the canvas, sliders, and controls.
- Minimal 3D effects.
- Positioning and layout of the control elements.
- Styling for the wind direction control.
- Styling for wind arrows.
- Styling for the power display and bulb.
- Styling for the heart beat display and icon.

## JavaScript (script)

### Three.js Setup
- Creates a `WebGLRenderer`, `Scene`, and `PerspectiveCamera`.
- Sets up `OrbitControls` for camera interaction (though rotation and zoom are disabled).

### Cyclist Representation
- Creates `bikeCount` number of cyclists, each represented by a `<div>` element containing a bicycle icon (`<i class="fas fa-bicycle"></i>`).
- Cyclists are positioned randomly in the 3D space.
- Cyclists move with a fixed speed.

### Slider Interaction
- **`speedSlider`**: Updates the speed variable, which affects cyclist movement.
- **`windForceSlider`**: Updates the windForce variable, which affects the speed of the wind arrows and the power calculation.

### Wind Direction Control
- **`windDirectionControl`**: Allows the user to drag and rotate an arrow, changing the `windDirection` variable.

### `calculateCyclistPower()`
- Calculates the power a cyclist needs to produce, taking into account cyclist speed, wind speed, wind direction, and cyclist/bike weight.

### `calculateHeartBeatsPerMinute()`
- Estimates the cyclist's heart rate based on power output and functional threshold power (FTP).

### Wind Arrow Creation and Movement
- **`createWindArrow()`**: Creates `<div>` elements with arrow icons (`<i class="fas fa-arrow-up"></i>`) to visualize wind.
- Wind arrows are rendered and move across the canvas, their speed and direction determined by the `windForce` and `windDirection`.

### Animation Loop (`animate()`)
- Uses `requestAnimationFrame()` for smooth animation.
- Updates cyclist positions.
- Updates wind arrow positions and appearance.
- Renders the 3D scene with Three.js.
- Handles window resizing.
- Updates the power and heart rate displays.

# Libraries and Technologies
- **Three.js**: For 3D rendering.
- **Font Awesome**: For icons (bicycle, wind arrow, lightbulb, heart).
- **Inter Font**: For the page's font.

# Future work
- dynamic, mobile friendly page layout
- refactor the code to be more modular and easier to maintain (separate in js, html, css files)
- add ascent and descent as input control and use in power calculation
- add further input control for body weight, bike weight, ftp, etc. (possibly use menue control to avoid overcrowded page)
- add more realistic cyclist movement (e.g. using a physics engine)


# Disclaimer

The power and heart rate values provided by this visualization are estimates.  They are intended for illustrative and educational purposes only and should not be used for training or medical decisions.

For accurate power and heart rate data, use dedicated sensors and consult with a qualified professional.

[Wikipedia Link](https://en.wikipedia.org/wiki/Bicycle_performance)

© 2025 Manfred's Bicycle Performance Visualization  
with the friendly help from [Gemini canvas for code generation](https://codeassist.google/)

