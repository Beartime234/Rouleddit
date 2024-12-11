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
    [BetType.AtoI]: 5,
    [BetType.JtoR]: 5,
    [BetType.StoZ]: 5,
    [BetType.Vowel]: 4,
    [BetType.Consonant]: 1.5,
}

export const DailyBetTypeMultiplier: { [key in BetType]: number } = {
    [BetType.SingleLetter]: 100,
    [BetType.AtoI]: 20,
    [BetType.JtoR]: 20,
    [BetType.StoZ]: 20,
    [BetType.Vowel]: 10,
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