import * as THREE from "three";

export default class Balloon {
    static COLORS = {
        red: 0xff0000,
        green: 0x10cc10,
        blue: 0x0000ff,
        yellow: 0xffff00,
        orange: 0xff7020,
        purple: 0xff00ff,
        white: 0xffffff,
        black: 0x000000,
    };

    randomOffset = Math.random() * 100;

    radius = 2;
    color = 0xff0000;
    speed = 4;

    constructor({ color, position, waypoints, speed }, scene) {
        this.color = color;
        if (speed) this.speed = speed;
        if (position) {
            this.position = position;
        } else if (waypoints) {
            this.position = waypoints[0];
        }

        this.geometry = new THREE.SphereGeometry(this.radius, 32, 32);

        const vertices = this.geometry.attributes.position;

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

        this.geometry.attributes.position.needsUpdate = true;
        this.geometry.computeBoundingSphere();

        const balloonMat = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.3,
            metalness: 0.2,
        });

        this.balloon = new THREE.Mesh(this.geometry, balloonMat);

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

                if (horizontalPosition.distanceTo(horizontalWaypoint) < 0.1) {
                    this.waypointIndex++;
                    console.log("reached waypoint", this.waypointIndex);
                    if (this.waypointIndex >= this.waypoints.length - 1) {
                        console.log("reached last waypoint");
                        // remove if reached last waypoint
                        return true;
                    }
                }
            }
        }
    }
}
