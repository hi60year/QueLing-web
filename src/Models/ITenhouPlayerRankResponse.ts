export default interface ITenhouPlayerRankResponse {
    list: {
        starttime: string,
        during?: string,
        sctype: string,
        playernum: string,
        playerlevel: string,
        playlength: string,
        kuitanari: string,
        akaari: string,
        lobby?: string,
        player1: string,
        player1ptr: string,
        player2: string,
        player2ptr: string,
        player3: string,
        player3ptr: string,
        player4?: string,
        player4ptr?: string
        rate?: number
    }[],
    name: string,
    rate: {
        "4"?: number,
        "3"?: number
    } | [],
    rseq: [
        number, number
    ]
}