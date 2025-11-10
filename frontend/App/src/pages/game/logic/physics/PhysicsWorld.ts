import { World } from './World';

export class PhysicsWorld {
    _world: World;

    constructor() {
        this._world = new World();
    }

    getWorld(): World {
        return this._world;
    }

    addBody(body: any): void {
        this._world.addBody(body);
    }

    removeBody(body: any): void {
        this._world.removeBody(body);
    }

    addConstraint(constraint: any): void {
        this._world.addConstraint(constraint);
    }

    removeConstraint(constraint: any): void {
        this._world.removeConstraint(constraint);
    }
}
