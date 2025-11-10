// 简易物理世界类，用于 PhysicsWorld 测试和依赖消除
export class World {
    bodies: any[] = [];
    constraints: any[] = [];

    addBody(body: any) {
        this.bodies.push(body);
    }
    removeBody(body: any) {
        this.bodies = this.bodies.filter(b => b !== body);
    }
    addConstraint(constraint: any) {
        this.constraints.push(constraint);
    }
    removeConstraint(constraint: any) {
        this.constraints = this.constraints.filter(c => c !== constraint);
    }
}
