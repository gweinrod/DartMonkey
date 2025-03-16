import * as THREE from "three";


export default class Balloon {
    
    static COLORS = {
        red: 0xff2222,
        green: 0x22ff22,
        blue: 0x2222ff,
        yellow: 0xff2222,
        orange: 0xff2222,
        purple: 0xff22ff,
        pink: 0xff22ff,
        white: 0xffffff,
        black: 0x000000,
    };

    static TYPES = {
        red: {
            color: Balloon.COLORS.red,
            speed: 2.0,
            becomes: undefined,
            size: 1,
            score: 50,
        },
        blue: {
            color: Balloon.COLORS.blue,
            speed: 3.5,
            size: 1,
            becomes: "red",
            score: 40,
        },
        green: {
            color: Balloon.COLORS.green,
            speed: 6,
            size: 0.9,
            becomes: "blue",
            score: 30,
        },
        yellow: {
            color: Balloon.COLORS.yellow,
            speed: 8,
            size: 1.1,
            becomes: "green",
            score: 20,
        },
        pink: {
            color: Balloon.COLORS.pink,
            speed: 11,

            size: 0.75,
            becomes: "yellow",
            score: 10,
        },
    };

    randomOffset = Math.random() * 100;

    static BASE_RADIUS = 2;

    type;

    static generateBalloonGeometry(radius) {
        const geometry = new THREE.SphereGeometry(radius, 32, 32);

        const vertices = geometry.attributes.position;

        for (let i = 0; i < vertices.count; i++) {
            let x = vertices.getX(i);
            let y = vertices.getY(i);
            let z = vertices.getZ(i);

            if (y <= 0) {
                let factor = 1 + y * 0.05;
                vertices.setX(i, x * factor);
                vertices.setZ(i, z * factor);
                vertices.setY(i, y * 0.95);
            } else if (y > 0) {
                vertices.setY(i, y * 0.8);
            }
        }

        geometry.attributes.position.needsUpdate = true;
        geometry.computeBoundingSphere();

        return geometry;
    }

    constructor({ color, position, waypoints, speed, type }, scene) {
        if (color !== undefined) this.color = color;
        if (type) {
            this.type = type;
            this.color = type.color;
            this.speed = type.speed;
            this.radius = type.size * Balloon.BASE_RADIUS;
        }
        if (speed) this.speed = speed;
        if (position) {
            this.position = position;
        } else if (waypoints) {
            this.position = waypoints[0];
        }
        this.direction = new THREE.Vector3(0.0, 0.0, 0.0);
        this.lerping = false;
        this.lerp =  new THREE.Vector3(0.0, 0.0, 0.0);
        this.lerpfactor = 0;
    
        const balloonMat = this.createBalloonMaterial({ 
            color: this.color, 
            ambient: 0.025, 
            diffusivity: 0.25, 
            specularity: 1.0, 
            smoothness: 100.0 
        });
    
        this.balloon = new THREE.Mesh(
            Balloon.generateBalloonGeometry(this.radius),
            balloonMat
        );
    
        this.balloon.scale.set(1, 1.4, 1);
        if (position)
            this.balloon.position.set(position.x, position.y, position.z);
    
        if (waypoints) {
            this.waypoints = waypoints;
            this.waypointIndex = 0;
    
            this.balloon.position.set(
                waypoints[0].x,
                waypoints[0].y,
                waypoints[0].z
            );
        }
    
        this.dartIDs = {};
    
        scene.add(this.balloon);
    }

    pop(scene, dartID) {
        if (dartID in this.dartIDs) {
            return false; // already popped
        }
        this.dartIDs[dartID] = true;
        //if (this.type.becomes) {
        //    this.createParticleExplosion(scene);
        //    this.changeType(Balloon.TYPES[this.type.becomes]);
        //    return false;
        //} else {
            this.createParticleExplosion(scene);
            return true;
        //}
    }

    createParticleExplosion(scene) {
        if (!scene) return;

        const particleCount = 100;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount * 3);
        const material = new THREE.PointsMaterial({
            color: this.color,
            size: 0.3,
            transparent: true,
            opacity: 1,
        });
        const particles = new THREE.Points(geometry, material);

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = this.balloon.position.x;
            positions[i * 3 + 1] = this.balloon.position.y;
            positions[i * 3 + 2] = this.balloon.position.z;

            velocities[i * 3] = (Math.random() - 0.5) * 3; //x
            velocities[i * 3 + 1] = (Math.random() - 0.5) * 3; //y
            velocities[i * 3 + 2] = (Math.random() - 0.5) * 3; //z
        }

        geometry.setAttribute(
            "position",
            new THREE.BufferAttribute(positions, 3)
        );
        geometry.setAttribute(
            "velocity",
            new THREE.BufferAttribute(velocities, 3)
        );

        scene.add(particles);

        let elapsed = 0;

        const animateParticles = () => {
            elapsed += 0.05;
            if (elapsed >= 2.0) {
                scene.remove(particles);
                return;
            }

            for (let i = 0; i < particleCount; i++) {
                positions[i * 3] += velocities[i * 3] * 0.1; // x
                positions[i * 3 + 1] += velocities[i * 3 + 1] * 0.1; //y
                positions[i * 3 + 2] += velocities[i * 3 + 2] * 0.1; //z
            }

            material.opacity = Math.max(0, 1 - elapsed / 2.0);
            geometry.attributes.position.needsUpdate = true;
            requestAnimationFrame(animateParticles);
        };

        animateParticles();
    }

    changeType(type) {
        //this.type = type;
        //this.color = type.color;
        //this.speed = type.speed;
        //this.radius = type.size * Balloon.BASE_RADIUS;
        //this.balloon.geometry.dispose();
        //this.balloon.geometry = Balloon.generateBalloonGeometry(this.radius);
        //this.balloon.material.color.setHex(this.color);
    }

    changeSpeed(speed) {
        this.speed = speed;
    }

    setDirection() {
        let direction = new THREE.Vector3(0, 0, 0);
        if (this.waypoints) {
            const waypoint = this.waypoints[this.waypointIndex];
            const nextWaypoint = this.waypoints[this.waypointIndex + 1];
            if (waypoint && nextWaypoint) {
                direction = new THREE.Vector3().subVectors(
                    nextWaypoint,
                    waypoint
                );
                direction.normalize();

                const horizontalPosition = new THREE.Vector2(
                    this.balloon.position.x,
                    this.balloon.position.z
                );
                const horizontalWaypoint = new THREE.Vector2(
                    nextWaypoint.x,
                    nextWaypoint.z
                );

                if (horizontalPosition.distanceTo(horizontalWaypoint) < 1) {
                    this.waypointIndex++;
                    this.direction = direction;
                    // console.log("reached waypoint", this.waypointIndex);
                    if (this.waypointIndex >= this.waypoints.length - 1) {
                        // console.log("reached last waypoint");
                        // remove if reached last waypoint
                        return true;
                    }
                }
            }
        }
        this.direction = direction;
    }

// Custom Phong Shader for Balloons
createBalloonMaterial(materialProperties) {
    const numLights = 1;
    
    // convert shape_color1 to a Vector4
    let shape_color_representation = new THREE.Color(materialProperties.color);
    let shape_color = new THREE.Vector4(
        shape_color_representation.r,
        shape_color_representation.g,
        shape_color_representation.b,
        1.0
    );

    // Vertex Shader
    let vertexShader = `
        precision mediump float;
        const int N_LIGHTS = ${numLights};
        uniform float ambient, diffusivity, specularity, smoothness;
        uniform vec4 light_positions_or_vectors[N_LIGHTS];
        uniform vec4 light_colors[N_LIGHTS];
        uniform float light_attenuation_factors[N_LIGHTS];
        uniform vec4 shape_color;
        uniform vec3 squared_scale;
        uniform vec3 camera_center;
        varying vec3 N, vertex_worldspace;

        // ***** PHONG SHADING HAPPENS HERE: *****
        vec3 phong_model_lights(vec3 N, vec3 vertex_worldspace) {
            vec3 E = normalize(camera_center - vertex_worldspace); // View direction
            vec3 result = vec3(0.0); // Initialize the output color
            for(int i = 0; i < N_LIGHTS; i++) {
                // Calculate the vector from the surface to the light source
                vec3 surface_to_light_vector = light_positions_or_vectors[i].xyz - 
                    light_positions_or_vectors[i].w * vertex_worldspace;
                float distance_to_light = length(surface_to_light_vector); // Light distance
                vec3 L = normalize(surface_to_light_vector); // Light direction
                
                // Phong uses the reflection vector R
                vec3 R = reflect(-L, N); // Reflect L around the normal N
                
                float diffuse = max(dot(N, L), 0.0); // Diffuse term
                float specular = pow(max(dot(R, E), 0.0), smoothness); // Specular term
                
                // Light attenuation
                float attenuation = 1.0 / (1.0 + light_attenuation_factors[i] * distance_to_light * distance_to_light);
                
                // Calculate the contribution of this light source
                vec3 light_contribution = shape_color.xyz * light_colors[i].xyz * diffusivity * diffuse
                                        + light_colors[i].xyz * specularity * specular;
                result += attenuation * light_contribution;
            }
            return result;
        }

        uniform mat4 model_transform;
        uniform mat4 projection_camera_model_transform;

        void main() {
            gl_Position = projection_camera_model_transform * vec4(position, 1.0);
            N = normalize(mat3(model_transform) * normal / squared_scale);
            vertex_worldspace = (model_transform * vec4(position, 1.0)).xyz;
        }
    `;

    // Fragment Shader
    let fragmentShader = `
        precision mediump float;
        const int N_LIGHTS = ${numLights};
        uniform float ambient, diffusivity, specularity, smoothness;
        uniform vec4 light_positions_or_vectors[N_LIGHTS];
        uniform vec4 light_colors[N_LIGHTS];
        uniform float light_attenuation_factors[N_LIGHTS];
        uniform vec4 shape_color;
        uniform vec3 camera_center;
        varying vec3 N, vertex_worldspace;

        // ***** PHONG SHADING HAPPENS HERE: *****
        vec3 phong_model_lights(vec3 N, vec3 vertex_worldspace) {
            vec3 E = normalize(camera_center - vertex_worldspace); // View direction
            vec3 result = vec3(0.0); // Initialize the output color
            for(int i = 0; i < N_LIGHTS; i++) {
                // Calculate the vector from the surface to the light source
                vec3 surface_to_light_vector = light_positions_or_vectors[i].xyz - 
                    light_positions_or_vectors[i].w * vertex_worldspace;
                float distance_to_light = length(surface_to_light_vector); // Light distance
                vec3 L = normalize(surface_to_light_vector); // Light direction
                
                // Phong uses the reflection vector R
                vec3 R = reflect(-L, N); // Reflect L around the normal N
                
                float diffuse = max(dot(N, L), 0.0); // Diffuse term
                float specular = pow(max(dot(R, E), 0.0), smoothness); // Specular term
                
                // Light attenuation
                float attenuation = 1.0 / (1.0 + light_attenuation_factors[i] * distance_to_light * distance_to_light);
                
                // Calculate the contribution of this light source
                vec3 light_contribution = shape_color.xyz * light_colors[i].xyz * diffusivity * diffuse
                                        + light_colors[i].xyz * specularity * specular;
                result += attenuation * light_contribution;
            }

            


            return result;
        }

        void main() {
            // Compute an initial (ambient) color:
            vec4 color = vec4(shape_color.xyz * ambient, shape_color.w);
            // Compute the final color with contributions from lights:
            color.xyz += phong_model_lights(normalize(N), vertex_worldspace);

            //** CUSTOM SHADER **//
            //use coefficients of human brightness perception
            float brightness = ((1.0 / 1.0) * color.x + (1.0 / 1.0) * color.y + (1.0 / 1.0) * color.z); //TODO adjust for dynamic balloon colors

            float dark = 0.20;
            float darker = 0.40;
            float light = 0.001;



            if (brightness >= dark) { // we're very dark
                color.xyz = shape_color.xyz / 3.0;  //
            };

            if (brightness >= darker) { // we're very dark
                color.xyz = shape_color.xyz / 7.0;  //
            };
            



            if (brightness <= light) { // very bright
                //color.xyz = shape_color.xyz;
                color.xyz = shape_color.xyz * 3.00;
            }
        
            if (brightness > light && brightness < dark) {
                color.xyz = shape_color.xyz;
            }
          

            color.xyz = min(color.xyz, vec3(1.0));
            color.xyz = max(color.xyz, vec3(0.0));

            //** END CUSTOM SHADER **//

            gl_FragColor = color;
        }
    `;

    // Prepare uniforms
    const uniforms = {
        ambient: { value: 0.15 },
        diffusivity: { value: 0.50 },
        specularity: { value: 1.00 },
        smoothness: { value: materialProperties.smoothness },
        shape_color: { value: shape_color },
        squared_scale: { value: new THREE.Vector3(1.0, 1.0, 1.0) },
        camera_center: { value: new THREE.Vector3() },
        model_transform: { value: new THREE.Matrix4() },
        projection_camera_model_transform: { value: new THREE.Matrix4() },
        light_positions_or_vectors: { value: [] },
        light_colors: { value: [] },
        light_attenuation_factors: { value: [] }
    };

    // Create the ShaderMaterial using the custom vertex and fragment shaders
    return new THREE.ShaderMaterial({
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        uniforms: uniforms
    });
}

// Update uniforms
updateBalloonMaterialUniforms(scene, camera) {
    const material = this.balloon.material;
    if (!material.uniforms) return;

    const uniforms = material.uniforms;

    const numLights = 1;
    const lights = scene.children.filter(child => child.isLight).slice(0, numLights);
    // Ensure we have the correct number of lights
    if (lights.length < numLights) {
        console.warn(`Expected ${numLights} lights, but found ${lights.length}. Padding with default lights.`);
    }
    
    // Update model_transform and projection_camera_model_transform
    this.balloon.updateMatrixWorld();
    camera.updateMatrixWorld();

    uniforms.model_transform.value.copy(this.balloon.matrixWorld);
    uniforms.projection_camera_model_transform.value.multiplyMatrices(
        camera.projectionMatrix,
        camera.matrixWorldInverse
    ).multiply(this.balloon.matrixWorld);

    // Update camera_center
    uniforms.camera_center.value.setFromMatrixPosition(camera.matrixWorld);

    // Update squared_scale (in case the scale changes)
    const scale = this.balloon.scale;
    uniforms.squared_scale.value.set(
        scale.x * scale.x,
        scale.y * scale.y,
        scale.z * scale.z
    );

    // Update light uniforms
    uniforms.light_positions_or_vectors.value = [];
    uniforms.light_colors.value = [];
    uniforms.light_attenuation_factors.value = [];

    for (let i = 0; i < numLights; i++) {
        const light = lights[i];
        if (light) {
            let position = new THREE.Vector4();
            if (light.isDirectionalLight) {
                // For directional lights
                const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(light.quaternion);
                position.set(direction.x, direction.y, direction.z, 0.0);
            } else if (light.position) {
                // For point lights
                position.set(light.position.x, light.position.y, light.position.z, 1.0);
            } else {
                // Default position
                position.set(55.0, 55.0, 55.0, 1.0);
            }
            uniforms.light_positions_or_vectors.value.push(position);

            // Update light color
            const color = new THREE.Vector4(light.color.r, light.color.g, light.color.b, 1.0);
            uniforms.light_colors.value.push(color);

            // Update attenuation factor
            let attenuation = 0.0;
            if (light.isPointLight || light.isSpotLight) {
                const distance = light.distance || 1000.0; // Default large distance
                attenuation = 1.0 / (distance * distance);
            } else if (light.isDirectionalLight) {
                attenuation = 0.0; // No attenuation for directional lights
            }
            // Include light intensity
            const intensity = light.intensity !== undefined ? light.intensity : 1.0;
            attenuation *= intensity;

            uniforms.light_attenuation_factors.value.push(attenuation);
        } else {
            // Default light values
            uniforms.light_positions_or_vectors.value.push(new THREE.Vector4(0.0, 0.0, 0.0, 0.0));
            uniforms.light_colors.value.push(new THREE.Vector4(0.0, 0.0, 0.0, 1.0));
            uniforms.light_attenuation_factors.value.push(0.0);
        }
    }
}

    animate(time, delta) {
        if (!this.lerping) {
            this.setDirection();
            this.balloon.position.y += Math.sin(time + this.randomOffset) * 0.01;
            this.balloon.position.addScaledVector(this.direction, this.speed * delta);
        } else {
            this.balloon.position.lerp(this.lerp, this.lerpfactor);
            if (this.balloon.position.distanceTo(this.lerp) < 0.1 ) {
                this.lerping = false
            }
        }
    }

}
