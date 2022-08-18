import {Collapse, LinearProgress, Stack, Table, TableBody, TableCell, TableHead, TableRow} from "@mui/material";
import {useEffect, useState} from "react";
import {ContestState, IContest} from "../Models/Contest";
import {grey} from "@mui/material/colors";
import api from "../api";
import {useNavigate} from "react-router-dom";

export default function HoldingContestTable(props: {state: ContestState}) {

    const [gotHoldingContests, setGotHoldingContests] = useState(false);
    const [holdingContests, setHoldingContests] = useState<IContest[]>([]);
    const [tableRowColors, setTableRowColors] = useState<string[]>([]);
    const navigate = useNavigate()

    const setNthColor = (n: number, color: string) => {
        let list = [...tableRowColors]
        list[n] = color
        if (color !== "#FFFFFF") {
            for (let i = 0; i < list.length; i++)
                if (i !== n) list[i] = "#FFFFFF"
        }
        setTableRowColors([...list])
    }

    useEffect(() => {
        api.get(`/Contest?state=${props.state}`).then(response => {
            setHoldingContests(response.data as IContest[])
            setTableRowColors(holdingContests.map(_ => "#FFFFFF"))
            setGotHoldingContests(true)
        })
    }, [])

    return (
        <Stack>
            {gotHoldingContests ? null : <LinearProgress sx={{mt: "20px"}}/>}
            <Collapse in={gotHoldingContests}>
                <Table sx={{
                    maxHeight: "443px"
                }}>
                    <TableHead>
                        <TableRow>
                            <TableCell align={"left"} sx={{fontWeight: "bold"}}>比赛名称</TableCell>
                            <TableCell align={"right"} sx={{fontWeight: "bold"}}>自动计分</TableCell>
                            <TableCell align={"right"} sx={{fontWeight: "bold"}}>队伍数量</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {holdingContests.map((contest, index) => (
                            <TableRow
                                key={index}
                                sx={{backgroundColor: tableRowColors[index] ?? "#FFFFFF", cursor: "pointer"}}
                                onMouseEnter={() => setNthColor(index, grey[100])}
                                onMouseLeave={() => setNthColor(index, "#FFFFFF")}
                                onClick={() => navigate(`/contests/${contest.id}`)}
                            >
                                <TableCell align={"left"}>{contest.name}</TableCell>
                                <TableCell align={"right"}>{contest.countingPolicy ? "是" : "否"}</TableCell>
                                <TableCell align={"right"}>{contest.teams.length}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Collapse>
        </Stack>)
}