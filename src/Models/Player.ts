export const MajSoulMajorRanks = [
    "Novice"
    , "Adept"
    , "Expert"
    , "Master"
    , "Saint"
    , "Celestial"
] as const

export const MajSoulMajorRanksInChinese = ["初心", "雀士", "雀杰", "雀豪", "雀圣", "魂天"] as const

export const MaxRankScores = [20, 80, 200, 600, 800, 1000, 1200, 1400, 2000, 2800, 3200, 3600, 4000, 6000, 9000] as const

export type MajSoulRank = [typeof MajSoulMajorRanks[number], number]

export const TenhouRanks = [
    "Newbie", "9 Kyu", "8 Kyu", "7 Kyu", "6 Kyu", "5 Kyu", "4 Kyu", "3 Kyu", "2 Kyu", "1 Kyu"
    , "1 Dan", "2 Dan", "3 Dan", "4 Dan", "5 Dan", "6 Dan", "7 Dan", "8 Dan", "9 Dan", "10 Dan", "Tenhou"
] as const

export type TenhouRank = typeof TenhouRanks[number]
export const TenhouRankMap = new Map<number, TenhouRank>(TenhouRanks.map((rank, index) => [index, rank]))

export interface IPlayer {
    majSoulName: string;
    majSoulRank: number;
    majSoulUid: number;
    tenhouName?: string;
    tenhouRank?: TenhouRank;
    name?: string;
    qqNum?: string
}

export class Player implements IPlayer {
    public majSoulName: string;
    public majSoulRank: number;
    public tenhouName?: string;
    public tenhouRank?: TenhouRank;
    public majSoulUid: number;
    public name?: string;
    public qqNum?: string

    constructor(playerMessage: IPlayer) {
        this.majSoulName = playerMessage.majSoulName
        this.tenhouName = playerMessage.tenhouName
        this.tenhouRank = playerMessage.tenhouRank
        this.majSoulUid = playerMessage.majSoulUid
        this.name = playerMessage.name
        this.majSoulRank = playerMessage.majSoulRank
        this.qqNum = playerMessage.qqNum
    }

    getMajSoulRankList(): MajSoulRank {
        const majorRankId = Math.floor(this.majSoulRank % 10000 / 100)
        const minorRankId = this.majSoulRank % 100
        const majorRank = majorRankId < 7 ? MajSoulMajorRanks[majorRankId - 1] : "Celestial"
        return [majorRank, minorRankId]
    }
}

export function getChineseRankFromRankId(rank: number): string {
    const majorRankId = Math.floor(rank % 10000 / 100)
    const minorRankId = rank % 100
    return (majorRankId < 7 ? MajSoulMajorRanksInChinese[majorRankId - 1] : "魂天") + " " + minorRankId
}
