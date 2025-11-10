export class Table {
    constructor(private readonly data: unknown[]) {
        this.data = data;
    }

    get(index: number): unknown {
        return this.data[index];
    }

    get length(): number {
        return this.data.length;
    }
}
