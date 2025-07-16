# Angry Flappy Bird

A modern, modular Flappy Bird game with an Angry Birds theme, featuring beautiful graphics, smooth animations, and professional UI design.

## Features

- **Full-screen gameplay** with responsive design
- **Beautiful graphics** with gradients, shadows, and particle effects
- **Modular architecture** with clean separation of concerns
- **Font Awesome icons** for professional UI
- **Persistent high score** system using localStorage
- **Smooth animations** at 60 FPS
- **Multiple game states** (start screen, playing, game over)
- **Particle effects** for flapping, scoring, and explosions

## Project Structure

```
AngryFlappyBird/
├── index.html              # Main HTML file with Font Awesome
├── js/
│   ├── main.js             # Entry point and initialization
│   ├── game.js             # Main game class and loop
│   ├── constants.js        # Game constants and configuration
│   ├── gameState.js        # Game state management and scoring
│   ├── bird.js             # Bird class with physics and rendering
│   ├── pipes.js            # Pipe and PipeManager classes
│   ├── particles.js        # Particle system for effects
│   ├── renderer.js         # Rendering engine and background
│   └── uiManager.js        # UI management and event handling
├── package.json            # Project configuration
├── README.md              # This file
└── LICENSE                # MIT License
```

## Classes Overview

### `Game` (game.js)
Main game controller that coordinates all other systems. Handles the game loop, state transitions, and overall game flow.

### `GameState` (gameState.js)
Manages game state, scoring, and high score persistence. Handles localStorage operations and score display updates.

### `Bird` (bird.js)
Handles bird physics, animation, collision detection, and rendering. Includes trail effects and smooth animations.

### `PipeManager` (pipes.js)
Manages pipe generation, movement, collision detection, and rendering. Includes 3D pipe effects and highlighting.

### `ParticleSystem` (particles.js)
Handles all particle effects including flap particles, score particles, and explosion effects.

### `Renderer` (renderer.js)
Manages background rendering, cloud animations, and coordinates all visual elements.

### `UIManager` (uiManager.js)
Handles all UI interactions, Font Awesome icons, and screen transitions.

## Technologies Used

- **HTML5 Canvas** for game rendering
- **ES6 Modules** for modular architecture
- **Font Awesome** for professional icons
- **CSS3** for styling and animations
- **localStorage** for persistent high scores
- **Vanilla JavaScript** for optimal performance

## How to Play

1. **Start**: Click the "START GAME" button or press SPACE
2. **Flap**: Press SPACE or click to make the bird flap
3. **Avoid**: Navigate through pipes without hitting them
4. **Score**: Earn points by passing through pipes
5. **Compete**: Beat your high score!

## Controls

- **SPACE** or **Mouse Click**: Flap the bird
- **Start Game**: Begin playing from the main menu
- **Play Again**: Restart immediately after game over
- **Main Menu**: Return to the start screen

## Installation

1. Clone or download the repository
2. Open `index.html` in a modern web browser
3. No server required - runs as a static website

## Browser Support

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

## Development

The game uses ES6 modules, so it requires a modern browser or development server for local development. For production, the game can be served from any static file server.

## License

MIT License - feel free to use this code for your own projects!
