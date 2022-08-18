import {IPlayer} from "./Player";
import {green, grey, red, yellow} from "@mui/material/colors";

export function getStateTextAndColor(state: TeamState): [text: string, color: string] {
    if (state === "editing") {
        return ["编辑中", grey[600]]
    } else if (state === "pending") {
        return ["审核中", yellow[600]]
    } else if (state === "rejected") {
        return ["拒绝", red[500]]
    } else {
        return ["通过", green[500]]
    }
}

export type TeamState =
    | "editing"
    | "pending"
    | "rejected"
    | "accepted"

export interface ITeam {
    id: string
    contestId?: string
    name: string
    members: IPlayer[]
    state: TeamState
}
