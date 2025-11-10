export type Vector = { x: number; y: number; };
export type BallState = { id: number; position: Vector; isPocketed: boolean; };
export type TurnReport = { pocketedBallIds: number[]; isFoul: boolean; nextPlayerId: string; turnWinnerId?: string; };
export type Player = { id: string; name: string; ballType: 'solid' | 'striped' | null; };
