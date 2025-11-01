export class Table {
    constructor(width = 800, height = 400) {
        this.width = width;
        this.height = height;
        // 定义六个袋口位置（四角 + 两个中袋）
        this.pockets = [
            { x: 0, y: 0 }, // 左上角
            { x: width / 2, y: 0 }, // 上中
            { x: width, y: 0 }, // 右上角
            { x: 0, y: height }, // 左下角
            { x: width / 2, y: height }, // 下中
            { x: width, y: height }, // 右下角
        ];
    }
    /**
     * 检查球是否在袋口附近（进球判定）
     */
    checkPocket(ball) {
        const pocketRadius = 50; // 袋口半径
        const effectiveRadius = pocketRadius + ball.radius; // 有效进球半径（袋口半径+球半径）
        // 调试球的位置
        console.log(`\nChecking Ball ${ball.id}:`);
        console.log(`Position: (${ball.position.x.toFixed(2)}, ${ball.position.y.toFixed(2)})`);
        console.log(`Effective pocket radius: ${effectiveRadius}`);
        let minDistance = Infinity;
        let closestPocket = -1;
        // 用来标记是否有任何一个袋口满足进球条件
        let isPocketed = false;
        for (let i = 0; i < this.pockets.length; i++) {
            const pocket = this.pockets[i];
            const dx = ball.position.x - pocket.x;
            const dy = ball.position.y - pocket.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            // 更新最小距离
            if (distance < minDistance) {
                minDistance = distance;
                closestPocket = i;
            }
            // 调试每个口袋的距离
            console.log(`  Pocket ${i} at (${pocket.x}, ${pocket.y}) - distance: ${distance.toFixed(2)}`);
            // 检查是否进球（注意：移除了if条件中的break）
            if (distance < effectiveRadius) {
                isPocketed = true;
                console.log(`  ** Ball ${ball.id} can be pocketed in pocket ${i}! **`);
            }
        }
        // 输出最终判定信息
        console.log(`Closest pocket: ${closestPocket} (distance: ${minDistance.toFixed(2)})`);
        // 只返回是否有任何袋口满足进球条件
        return isPocketed;
    }
    /**
     * 处理球与边界的碰撞
     */
    handleWallCollision(ball) {
        const restitution = 0.8; // 反弹系数
        // 左右边界
        if (ball.position.x - ball.radius < 0) {
            ball.position.x = ball.radius;
            ball.velocity.x = -ball.velocity.x * restitution;
        }
        else if (ball.position.x + ball.radius > this.width) {
            ball.position.x = this.width - ball.radius;
            ball.velocity.x = -ball.velocity.x * restitution;
        }
        // 上下边界
        if (ball.position.y - ball.radius < 0) {
            ball.position.y = ball.radius;
            ball.velocity.y = -ball.velocity.y * restitution;
        }
        else if (ball.position.y + ball.radius > this.height) {
            ball.position.y = this.height - ball.radius;
            ball.velocity.y = -ball.velocity.y * restitution;
        }
    }
}
//# sourceMappingURL=Table.js.map