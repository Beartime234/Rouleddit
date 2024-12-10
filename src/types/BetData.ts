export enum BetType {
    SingleLetter = 'SingleLetter',
    AtoI = 'AtoI',
    JtoR = 'JtoR',
    StoZ = 'StoZ',
    Vowel = 'Vowel',
    Consonant = 'Consonant',
}

export const BetTypeMultiplier: { [key in BetType]: number } = {
    [BetType.SingleLetter]: 30,
    [BetType.AtoI]: 6,
    [BetType.JtoR]: 6,
    [BetType.StoZ]: 6,
    [BetType.Vowel]: 4,
    [BetType.Consonant]: 1.5,
}


export type Bet = {
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