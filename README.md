# space-invaders-game
space invaders game in pure cilent-side-only javascript

# **Executive Summary**  

**Game Title:** Space Invaders Game
**Developer:** Douglas Mun  
**Technology:** JavaScript (Canvas API), HTML5, CSS3  

### **Overview**  
Space Invaders is a modern, browser-based rendition of the classic arcade shooter, developed entirely in JavaScript using the HTML5 Canvas API. This single-player game features responsive controls, dynamic enemy movement, particle effects, and a scoring system with increasing difficulty. Designed for seamless client-side execution, it requires no server dependencies, making it easily deployable and playable in any modern web browser.  

### **Key Features**  
- **Smooth Player Controls:** Intuitive keyboard inputs (arrow keys for movement, spacebar for shooting).  
- **Progressive Difficulty:** Enemies move faster and spawn in greater numbers as the player advances levels.  
- **Visual Effects:** Explosion particles, invulnerability flashing, and animated projectiles enhance gameplay immersion.  
- **Score & Lives System:** Tracks player progress with a persistent UI displaying score, level, and remaining lives.  
- **Responsive UI:** Clean, retro-styled interface with start/game-over screens for seamless playability.  

### **Technical Highlights**  
- **Client-Side Only:** No backend server required—runs entirely in the browser.  
- **Optimized Rendering:** Uses `requestAnimationFrame` for smooth frame rates and efficient canvas rendering.  
- **Collision Detection:** Precise hit-box calculations for projectiles, enemies, and the player ship.  
- **State Management:** Self-contained game logic handles spawning, movement, and game-over conditions.  

### **Deployment & Accessibility**  
- Zero setup required—just open `index.html` in a browser.  
- Lightweight (~50KB uncompressed) with no external dependencies.  
- Cross-platform compatibility (desktop/mobile with keyboard support).  

---

# **Technical Summary**  

### **Architecture & Design**  
The game follows a **monolithic but modular** structure, with all logic and rendering handled client-side via:  
- **Game State Management:** A centralized `gameState` object tracks player position, enemies, projectiles, particles, and meta-data (score, level, lives).  
- **Game Loop:** The `requestAnimationFrame`-driven loop updates game state (60 FPS) and renders frames, ensuring smooth animations.  
- **Entity-Component Pattern:** Enemies, projectiles, and particles share common properties (position, size, velocity) but are rendered uniquely via dedicated functions (e.g., `drawEnemy()`, `drawParticle()`).  

### **Core Systems**  
1. **Input Handling**  
   - Keyboard events (`keydown/keyup`) toggle movement/shooting states in a `keys` object, decoupling input from frame updates.  
   - Anti-auto-fire logic prevents rapid projectile spam.  

2. **Physics & Collision**  
   - **Movement:** Linear velocity for projectiles; enemy movement reverses direction upon reaching screen edges.  
   - **Collision Detection:** AABB (Axis-Aligned Bounding Box) checks for:  
     - Player projectiles vs. enemies (score increase + explosion).  
     - Enemy projectiles vs. player (life loss + invulnerability period).  
   - **Invulnerability:** Temporary post-hit immunity (3 seconds) with visual feedback (blinking ship).  

3. **Particle System**  
   - Explosions spawn 25–40 particles with randomized:  
     - Trajectories (`moveAngle`).  
     - Colors (red/yellow for enemies, red/orange for player hits).  
     - Lifespans (20–50 frames).  
   - Gravity simulation (`hasGravity`) and size decay create organic effects.  

4. **Progression & Difficulty**  
   - **Level Scaling:** Each cleared level increases enemy speed (`level * 0.2`).  
   - **Enemy Spawning:** Grid-based procedural generation (5 rows × 11 columns) with tiered colors (red/green/blue).  

### **Performance Optimizations**  
- **Object Pooling:** Projectiles/enemies are spliced from arrays upon destruction to minimize GC overhead.  
- **Efficient Rendering:**  
  - `ctx.imageSmoothingEnabled = false` for crisp pixel-art aesthetics.  
  - Semi-transparent black background (`rgba(0,0,0,0.1)`) creates motion trails without full clears.  
- **Conditional Drawing:** Invulnerable players skip rendering every 100ms for a "blinking" effect.  

### **Challenges & Solutions**  
- **Challenge:** Janky enemy movement when reversing direction.  
  **Solution:** Batch-update all enemies in a single frame after edge detection.  
- **Challenge:** Particle performance degradation.  
  **Solution:** Capped particle counts + lifecycle management (`splice()` dead particles).  

### **Future Enhancements**  
- Local storage for high scores.  
- Mobile touch controls.  
- Enemy AI patterns (zig-zag, diving).  

---

### **Conclusion**  
The Space Invaders game demonstrates a robust, client-side implementation of arcade-style gameplay with clean code structure and attention to performance. Its modular design allows for easy expansion, while the absence of server dependencies ensures instant accessibility—a testament to efficient JavaScript game development.  

