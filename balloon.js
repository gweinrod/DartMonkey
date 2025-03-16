import * as THREE from "three";

export default class Balloon {
    static COLORS = {
        red: 0xff0000,
        green: 0x10cc10,
        blue: 0x0000ff,
        yellow: 0xffff00,
        orange: 0xff7020,
        purple: 0xff00ff,
        pink: 0xffc0cb,
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

        const balloonMat = new THREE.MeshStandardMaterial({
            color: this.color,
            roughness: 0.3,
            metalness: 0.2,
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
        if (this.type.becomes) {
            this.changeType(Balloon.TYPES[this.type.becomes]);
            this.createParticleExplosion(scene);
            return false;
        } else {
            this.createParticleExplosion(scene);
            return true;
        }
    }

    createParticleExplosion(scene) {
        if (!scene) return;

        console.log(this.color);

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
        this.type = type;
        this.color = type.color;
        this.speed = type.speed;
        this.radius = type.size * Balloon.BASE_RADIUS;
        this.balloon.geometry.dispose();
        this.balloon.geometry = Balloon.generateBalloonGeometry(this.radius);
        this.balloon.material.color.setHex(this.color);
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

    animate(time, delta) {
        
        if (!this.lerping) {
            //console.log("Setting direction to waypoint direction");
            this.setDirection();
            this.balloon.position.y += Math.sin(time + this.randomOffset) * 0.01;
            this.balloon.position.addScaledVector(this.direction, this.speed * delta);
        } else {
            //console.log(`Lerping in animate with lerp value <${this.lerp.x},${this.lerp.y},${this.lerp.z}>\n`)
            //console.log(`From current position <${this.balloon.position.x},${this.balloon.position.y},${this.balloon.position.z}>\n`)
            this.balloon.position.lerp(this.lerp, this.lerpfactor); //move fast --> slow as final position is reached
            if (this.balloon.position.distanceTo(this.lerp) < 0.1 ) {
                //this.balloon.position == this.lerp;
                this.lerping = false

            }
        }
    }
}
