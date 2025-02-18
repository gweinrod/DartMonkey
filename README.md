# CS174A Team Project: Dart Monkey
# Summer Dixon, Bogdan Yaremenko, Gregory Weinrod

This project exhibits the use of sequences of matrix transformations applied to objects in a three dimensional virtual environment, represented by collections of vertices, faces, and normals, in order to render and illumnate those objects on a two dimensional screen of any currently reasonable size from any reasonable perspective in that virtual space.

A player is challenged to move their character around the environment as an increasing number of balloons intrude upon the player's territory and pop as many balloons as possible before being overwhelmed and defeated.  Points are earned and lost by ...  Games are won and lost by ...

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
   Check location of balloon on screen and click on screen to detect dart/balloon collisions.

---