export type ContestState =
    | "holding"
    | "registering"
    | "end"

export type RankingRequirement = [requireNumber: number, mahjsoulRankRequirement: number, tenhouRankRequirement: number]

export interface CountingPolicy {
    countingFactor: number[]
    pureSeq: boolean
    seqPoint: number[]
    rawPointDivider: number
    highestRawPointBonus: number
    highestLastIntervalPosBonus: number
}

export interface IContest {
    state: ContestState
    id: string
    name: string
    teams: string[]
    dflId: number | null
    rankingRequirement: RankingRequirement[]
    promotionQuantity: number | null
    countingPolicy: CountingPolicy | null
    maxTeamMember: number
}
