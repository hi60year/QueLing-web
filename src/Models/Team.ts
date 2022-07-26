import {IPlayer} from "./Player";

export type TeamState =
    | "editing"
    | "pending"
    | "rejected"
    | "success"

export interface ITeam {
    id: number;
    contestId?: number
    name: string;
    members: IPlayer[];
    state: TeamState
}
