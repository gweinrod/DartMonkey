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
            size: 1.5,
        },

        blue: {
            color: Balloon.COLORS.blue,
            speed: 4.0,
            size: 1.25,
            becomes: undefined,
        },
        green: {
            color: Balloon.COLORS.green,
            speed: 6.0,
            size: 1,
            becomes: undefined,
        },
        yellow: {
            color: Balloon.COLORS.yellow,
            speed: 8.0,
            size: .75,
            becomes: undefined,
        },
        pink: {
            color: Balloon.COLORS.pink,
            speed: 10.0,
            size: 0.5,
            becomes: undefined,
        },
    };

    randomOffset = Math.random() * 100;

    static BASE_RADIUS = 2;

    type = Balloon.TYPES.red;

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

        const balloonMat = new THREE.MeshStandardMaterial({
            color: this.color,
            roughness: 0.3,
            metalness: 0.2
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

        scene.add(this.balloon);
    }

    pop() {
        if (this.type.becomes) {
            this.changeType(Balloon.TYPES[this.type.becomes]);
            return false;
        } else {
            return true;
        }
    }

    changeType(type) {
        this.type = type;
        this.color = type.color;
        this.speed = type.speed;
        this.radius = type.size * Balloon.BASE_RADIUS;
        this.balloon.geometry.dispose();
        this.balloon.geometry = Balloon.generateBalloonGeometry(this.radius);
        this.balloon.material.color.set(this.color);
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
            console.log("Setting direction to waypoint direction");
            this.setDirection();
            this.balloon.position.y += Math.sin(time + this.randomOffset) * 0.01;
            this.balloon.position.addScaledVector(this.direction, this.speed * delta);
        } else if (this.balloon.position == this.lerp) {
            console.log(`Reached lerp position`);
            this.lerping = false;
        } else {
            console.log(`Lerping in animate with lerp value <${this.lerp.x},${this.lerp.y},${this.lerp.z}>\n`)
            console.log(`From current position <${this.balloon.position.x},${this.balloon.position.y},${this.balloon.position.z}>\n`)
            this.balloon.position.lerp(this.lerp, 0.5); //move fast --> slow as final position is reached
            if (this.balloon.position.distanceTo(this.lerp) < 0.1) {
                this.balloon.position == this.lerp;
                this.lerping = false
            }
        }
       
    }
}
