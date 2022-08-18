export default interface IPlayerRankResponse{
    id: number,
    nickName: string,
    level: {
        id: number,
        score: number,
        delta: number,
    },
    latestTimestamp: number
}