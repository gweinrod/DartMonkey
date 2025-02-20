# CS174A Team Project: Dart Monkey
# Summer Dixon, Bogdan Yaremenko, Gregory Weinrod

This project exhibits the use of sequences of matrix transformations applied to objects in a three dimensional virtual environment, represented by collections of vertices, faces, and normals, in order to render and illuminate those objects on a two dimensional screen of any currently reasonable size from any reasonable perspective in that virtual space.  User input will dynamically modify the game world as the play evolves and balloons are laid to rest.  Mouse movement will move the camera perspective and mouse clicks will be analyzed to determine through mouse-picking where a dart has been aimed while keyboard input will move the character and the camera in synchronization.

Balloons will be modeled by a sphere geometry and will animate through sequences of basic transformations, including shears and rotations.  Darts will be modeled with a custom geometry and their flight will be animated using sequences of translations towards some object that the player has clicked.  Basic physical mechanics will apply towards the darts flight and be calculated during the game's looping behavior.

You, the player, are a dart monkey, and will be challenged to move your character around the environment as an increasing number of balloons intrude upon your territory. You must do everything in your power to pop as many balloons as possible by throwing darts, testing your speed and accuracy before inevitably being overwhelmed by sheer numbers and defeated. Points are earned by popping balloons, where balloons come in different tiers of difficulty (represented by color) and defined by their increasingly random and difficult to predict movements (while still moving towards their goal), and are worth different point values . Games continue until the player loses, which occurs when some arbitrary number of balloons have crossed to the other side.

## Goals

1. **Game Logic**  
  Implement game loop eg spawn balloons, count balloons, update score, trigger animation, check game end, repeat
  
2. **Models, Textures**  
  Create or import custom geometries and textures for:
    Game:
    Player
    Projectiles
    Balloons

    Level:
    Sky Sphere
    Environmental Details
    
3. **Animations**  
   Apply custom translation, rotation, and scaling matrices to animate objects in 3D space over time.

4. **Shaders**  
   Apply custom vertex and fragment shaders using GLSL (OpenGL Shading Language) to implement lighting changes eg day and night, balloon shadows.

5. **Interaction**
   Allow users to interact with the scene with WASD moving the player (and camera), mouse clicking, and additional configuration keys.

6. **Physics**
   Animate a dart's flight path and so calculate the actual trajectories of darts and balloons to detect dart/balloon collisions.

7. **Mouse-Picking**
   Check location of balloon on screen and click on screen to aim dart trajectory

---
