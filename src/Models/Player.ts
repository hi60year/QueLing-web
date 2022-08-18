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
export const TenhouMaxRankScores = [20, 20, 20, 20, 40, 60, 80, 100, 100, 100, 400, 800, 1200, 1600, 2000, 2400, 2800, 3200, 3600, 4000] as const

export type MajSoulRank = [typeof MajSoulMajorRanks[number], number]

export const TenhouRanks = [
    "新人", "9 级", "8 级", "7 级", "6 级", "5 级", "4 级", "3 级", "2 级", "1 级"
    , "初段", "二段", "三段", "四段", "五段", "六段", "七段", "八段", "九段", "十段", "天凤位"
] as const

export type TenhouRank = typeof TenhouRanks[number]
export const TenhouRankMap = new Map<number, TenhouRank>(TenhouRanks.map((rank, index) => [index, rank]))

export interface IPlayer {
    mahjsoulName: string;
    mahjsoulRank: number;
    mahjsoulUid: number;
    tenhouName?: string;
    tenhouRank?: number;
    name?: string;
    qqNum?: string
}

export class Player implements IPlayer {
    public mahjsoulName: string;
    public mahjsoulRank: number;
    public tenhouName?: string;
    public tenhouRank?: number;
    public mahjsoulUid: number;
    public name?: string;
    public qqNum?: string

    constructor(playerMessage: IPlayer) {
        this.mahjsoulName = playerMessage.mahjsoulName
        this.tenhouName = playerMessage.tenhouName
        this.tenhouRank = playerMessage.tenhouRank
        this.mahjsoulUid = playerMessage.mahjsoulUid
        this.name = playerMessage.name
        this.mahjsoulRank = playerMessage.mahjsoulRank
        this.qqNum = playerMessage.qqNum
    }

    getMajSoulRankList(): MajSoulRank {
        const majorRankId = Math.floor(this.mahjsoulRank % 10000 / 100)
        const minorRankId = this.mahjsoulRank % 100
        const majorRank = majorRankId < 7 ? MajSoulMajorRanks[majorRankId - 1] : "Celestial"
        return [majorRank, minorRankId]
    }
}

export function getChineseRankFromRankId(rank: number): string {
    const majorRankId = Math.floor(rank % 10000 / 100)
    const minorRankId = rank % 100
    return (majorRankId < 7 ? MajSoulMajorRanksInChinese[majorRankId - 1] : "魂天") + " " + minorRankId
}
