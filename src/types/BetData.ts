export enum BetType {
    SingleLetter = 'SingleLetter',
    AtoI = 'AtoI',
    JtoR = 'JtoR',
    StoZ = 'StoZ',
    Vowel = 'Vowel',
    Consonant = 'Consonant',
}

export const BetTypeMultiplier: { [key in BetType]: number } = {
    [BetType.SingleLetter]: 26,
    [BetType.AtoI]: 8,
    [BetType.JtoR]: 8,
    [BetType.StoZ]: 8,
    [BetType.Vowel]: 5,
    [BetType.Consonant]: 1.25,
}

export const DailyBetTypeMultiplier: { [key in BetType]: number } = {
    [BetType.SingleLetter]: 100,
    [BetType.AtoI]: 25,
    [BetType.JtoR]: 25,
    [BetType.StoZ]: 25,
    [BetType.Vowel]: 15,
    [BetType.Consonant]: 3,
}


export type Bet = {
    type: BetType;
    letter?: string;
    amount: number;
}

export type DailyBet = {
    username: string;
    type: BetType;
    letter?: string;
    amount: number;
}

export type ChosenPostData = {
    subreddit: string;
    postTitle: string;
    postLink: string;
    winningLetter: string;
    upvotes: number;
}

export type PayoutData = {
    isWin: boolean;
    payoutAmount: number;
}