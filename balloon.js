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
            speed: 3,
            becomes: undefined,
            size: 1,
            score: 50
        },

        blue: {
            color: Balloon.COLORS.blue,
            speed: 3.5,
            size: 1,
            becomes: "red",
            score: 40
        },
        green: {
            color: Balloon.COLORS.green,
            speed: 6,
            size: 0.9,
            becomes: "blue",
            score: 30

        },
        yellow: {
            color: Balloon.COLORS.yellow,
            speed: 8,
            size: 1.1,
            becomes: "green",
            score: 20
        },
        pink: {
            color: Balloon.COLORS.pink,
            speed: 11,

            size: 0.75,
            becomes: "yellow",
            score: 10
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

    animate(time, delta) {
        this.balloon.position.y += Math.sin(time + this.randomOffset) * 0.01;

        if (this.waypoints) {
            const waypoint = this.waypoints[this.waypointIndex];
            const nextWaypoint = this.waypoints[this.waypointIndex + 1];

            if (waypoint && nextWaypoint) {
                const direction = new THREE.Vector3().subVectors(
                    nextWaypoint,
                    waypoint
                );
                direction.normalize();
                this.balloon.position.add(
                    direction.multiplyScalar(this.speed * delta)
                );

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
                    // console.log("reached waypoint", this.waypointIndex);
                    if (this.waypointIndex >= this.waypoints.length - 1) {
                        // console.log("reached last waypoint");
                        // remove if reached last waypoint
                        return true;
                    }
                }
            }
        }
    }
}
