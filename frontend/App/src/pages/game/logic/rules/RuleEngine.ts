export interface Rule {
    evaluate(data: any): number;
}

export class RuleEngine {
    rules: Rule[];

    constructor() {
        this.rules = [];
    }

    addRule(rule: Rule): void {
        this.rules.push(rule);
    }

    evaluate(data: any): number {
        return this.rules.map(rule => rule.evaluate(data)).reduce((a, b) => a + b, 0);
    }
}
