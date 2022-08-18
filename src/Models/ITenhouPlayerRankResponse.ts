interface AssumePt {
    starttime: number,
    level: number,
    pt: number,
    hlevel: number,
    hpt: number,
    recent: string | null
    type: number
}

export default interface ITenhouPlayerRankResponse {
    assumept: {
        3: AssumePt,
        4: AssumePt
    }
}