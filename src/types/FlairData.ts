export enum Flairs {
    First = 'First',
    Second = 'Second',
    Third = 'Third',
    Fourth = 'Fourth',
    Fifth = 'Fifth',
}

export const FlairsRankingArray = [
    Flairs.First,
    Flairs.Second,
    Flairs.Third,
    Flairs.Fourth,
    Flairs.Fifth,
];

export type FlairData = {
    flairId: string;
    assignedTo: string;
};