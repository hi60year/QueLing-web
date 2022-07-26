export default interface IPlayerRankResponse{
    id: number,
    nickname: string,
    level: {
        id: number,
        score: number,
        delta: number,
    },
    latest_timestamp: number
}