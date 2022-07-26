import {
    Card,
    CardContent, CircularProgress,
    Fade, FormControlLabel, IconButton, LinearProgress,
    Paper, Stack, Switch,
    Table, TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
    Zoom
} from "@mui/material";
import {ITeam} from "../Models/Team";
import {ChangeEvent,  useRef, useState} from "react";
import {Close, Star} from "@mui/icons-material";
import {blue, blueGrey, grey, orange, red, yellow} from "@mui/material/colors";
import {
    getChineseRankFromRankId,
    IPlayer,
    MaxRankScores,
    TenhouRanks
} from "../Models/Player";
import axios from "axios";
import IPlayerRankResponse from "../Models/IPlayerRankResponse";
import {useSnackbar} from "notistack";

export function TeamTable(props: { teamMessage: ITeam, canToggleToSmall?: boolean }) {

    const hasAnyPlayerName = props.teamMessage.members.some(mem => mem.name)
    const hasAnyQQNum = props.teamMessage.members.some(mem => mem.qqNum)
    const containerRef = useRef(null);
    const [useDetailRank, setUseDetailRank] = useState(false);
    const [loadingUseDetailRank, setLoadingUseDetailRank] = useState(false);
    const [detailRankSwitchDisabled, setDetailRankSwitchDisabled] = useState(false);
    const [memberDetailRanks, setMemberDetailRanks]: [Map<number, ([number, number] | null)> | null, Function] = useState(new Map());
    const {enqueueSnackbar} = useSnackbar();

    const handleLoadDetailRank = async (event: ChangeEvent<HTMLInputElement>) => {
        setUseDetailRank(event.target.checked)
        if (event.target.checked) {
            setLoadingUseDetailRank(true)
            setDetailRankSwitchDisabled(true);
            try {
                let promises = props.teamMessage.members.map((member) =>
                    member.majSoulRank < 10300
                        ? null
                        : axios.get(`https://5-data.amae-koromo.com/api/v2/pl4/search_player/${member.majSoulName}?limit=20`)
                )

                let result = new Map<number, ([number, number] | null)>()
                let errorList: string[] = []

                await Promise.all(promises.map(async (promise, index) => {
                    if (promise == null) {
                        result.set(props.teamMessage.members[index].majSoulUid, null)
                    } else {
                        let response: IPlayerRankResponse[] = (await promise).data
                        if (response.length === 0 || response[0].nickname !== props.teamMessage.members[index].majSoulName) {
                            result.set(props.teamMessage.members[index].majSoulUid, null)
                            errorList.push(props.teamMessage.members[index].majSoulName)
                        } else {
                            result.set(props.teamMessage.members[index].majSoulUid,
                                [response[0].level.id, response[0].level.score + response[0].level.delta])
                        }
                    }
                }))

                setMemberDetailRanks(result)

                errorList.forEach((errorName) => {
                    enqueueSnackbar(`未能获取『${errorName}』详细段位，请检查用户名是否正确`, {variant: "warning"})
                })
            } catch (e) {
                enqueueSnackbar("在获取详细段位时发生错误，请稍后重试", {variant: "error"})
                setUseDetailRank(false)
            } finally {
                setDetailRankSwitchDisabled(false)
                setLoadingUseDetailRank(false)
            }
        }
    }

    const getPersonIconColor = (player: IPlayer) => {
        if (player.majSoulRank >= 10700 || (player.tenhouRank !== undefined && TenhouRanks.indexOf(player.tenhouRank)) >= TenhouRanks.indexOf("7 Dan")) {
            return red[500]
        } else if (player.majSoulRank >= 10500 || (player.tenhouRank !== undefined && TenhouRanks.indexOf(player.tenhouRank)) >= TenhouRanks.indexOf("4 Dan")) {
            return orange[500]
        } else if (player.majSoulRank >= 10400 || (player.tenhouRank !== undefined && TenhouRanks.indexOf(player.tenhouRank)) >= TenhouRanks.indexOf("2 Dan")) {
            return yellow[500]
        } else {
            return blue[500]
        }
    }

    return (
        <Card sx={{
            paddingTop: "20px",
            paddingX: "30px",
            position: "relative",
            backgroundColor: blueGrey[100]
        }}>
            <CardContent>
                <Typography gutterBottom variant={"h5"} component={"div"}>
                    {props.teamMessage.name}
                </Typography>
                <Fade in={true} style={{transitionDuration: "1s"}}><Paper elevation={4} sx={{marginTop: "20px"}}>
                    <Table ref={containerRef}>
                        <TableHead>
                            <TableRow>
                                {
                                    [
                                        <TableCell/>,
                                        <TableCell>序号</TableCell>,
                                        hasAnyPlayerName ? <TableCell align={"center"}>称呼</TableCell> : null,
                                        <TableCell align={"center"} sx={{minWidth: 100}}>雀魂名称</TableCell>,
                                        <TableCell align={"center"} sx={{minWidth: 150}}>雀魂段位</TableCell>,
                                        <TableCell align={"center"}>雀魂UID</TableCell>,
                                        <TableCell align={"center"} sx={{minWidth: 100}}>天凤名称</TableCell>,
                                        <TableCell align={"center"} sx={{minWidth: 150}}>天凤段位</TableCell>,
                                        hasAnyQQNum ? <TableCell align={"center"}>QQ</TableCell> : null
                                    ]
                                        .filter(com => com)
                                        .map((com, index) =>
                                            <Zoom key={index} in={true}
                                                  style={{transitionDelay: `${index * 50}ms`}}
                                            >
                                                {com!}
                                            </Zoom>)
                                }
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                props.teamMessage.members.map((mem, index) =>
                                    <Fade key={index} in
                                          style={{
                                              transitionDelay: `${300 + index * 100}ms`,
                                              transitionDuration: "1s"
                                          }}
                                    >
                                        <TableRow>
                                            <TableCell align={"center"}>
                                                <Star fontSize={"medium"} sx={{
                                                    color: getPersonIconColor(mem),
                                                }}/>
                                            </TableCell>
                                            <TableCell>
                                                {index + 1}
                                            </TableCell>
                                            {
                                                hasAnyPlayerName ?
                                                    <TableCell>
                                                        {mem.name}
                                                    </TableCell>
                                                    : null
                                            }
                                            <TableCell align={"center"}>
                                                {mem.majSoulName}
                                            </TableCell>
                                            <TableCell align={"center"}>
                                                {
                                                    useDetailRank && !loadingUseDetailRank
                                                        ? (
                                                            <Fade in={useDetailRank} style={{transitionDuration: "2s"}}>
                                                                <Stack>
                                                                    <Typography>
                                                                        {memberDetailRanks && memberDetailRanks.get(mem.majSoulUid)
                                                                            ? `${getChineseRankFromRankId(memberDetailRanks.get(mem.majSoulUid)![0])}`
                                                                            : `${getChineseRankFromRankId(mem.majSoulRank)}`}
                                                                    </Typography>
                                                                    {
                                                                        memberDetailRanks && memberDetailRanks.get(mem.majSoulUid) ? (
                                                                        /*<Typography>
                                                                            {`${memberDetailRanks[index][1]}`}
                                                                        </Typography>)*/
                                                                                <Stack direction={"row"} alignItems={"center"} spacing={2}>
                                                                                    <LinearProgress
                                                                                        sx={{flexGrow: 1}}
                                                                                        variant={"determinate"}
                                                                                        value={
                                                                                            memberDetailRanks.get(mem.majSoulUid)![0] >= 10700
                                                                                                ? 100
                                                                                                : memberDetailRanks.get(mem.majSoulUid)![1] / MaxRankScores[
                                                                                            Math.floor((memberDetailRanks.get(mem.majSoulUid)![0] % 10000 / 100) - 1) * 3
                                                                                            + memberDetailRanks.get(mem.majSoulUid)![0] % 100
                                                                                                ] * 100
                                                                                        }
                                                                                    />
                                                                                    <Typography variant={"caption"} sx={{color: grey[500]}}>
                                                                                        {`${memberDetailRanks.get(mem.majSoulUid)![1]}/${MaxRankScores[
                                                                                        Math.floor((memberDetailRanks.get(mem.majSoulUid)![0] % 10000 / 100) - 1) * 3
                                                                                        + memberDetailRanks.get(mem.majSoulUid)![0] % 100
                                                                                            ]}`}
                                                                                    </Typography>
                                                                                </Stack>)
                                                                            : null

                                                                    }
                                                                </Stack>
                                                            </Fade>
                                                        ) : (
                                                            <Fade in={!useDetailRank} style={{transitionDuration: "2s"}}>
                                                                <Typography>
                                                                    {`${getChineseRankFromRankId(mem.majSoulRank)}`}
                                                                </Typography>
                                                            </Fade>
                                                        )
                                                }
                                            </TableCell>
                                            <TableCell align={"center"}>
                                                {mem.majSoulUid}
                                            </TableCell>
                                            <TableCell align={"center"}>
                                                {mem.tenhouName}
                                            </TableCell>
                                            <TableCell align={"center"}>
                                                {mem.tenhouRank}
                                            </TableCell>
                                            {
                                                hasAnyQQNum ?
                                                    <TableCell align={"center"} sx={{paddingRight: "20px"}}>
                                                        {mem.qqNum}
                                                    </TableCell>
                                                    : null
                                            }
                                        </TableRow>
                                    </Fade>
                                )
                            }
                        </TableBody>
                    </Table>
                </Paper></Fade>
            </CardContent>
            <CardContent sx={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center"
            }}>
                {
                    loadingUseDetailRank ?
                        <CircularProgress sx={{marginRight: "30px"}} size={30}/> : null
                }
                <FormControlLabel disabled={detailRankSwitchDisabled}
                                  control={<Switch checked={useDetailRank} onChange={handleLoadDetailRank}/>} label={
                    <Typography variant={"caption"}>
                        显示详细段位
                    </Typography>
                }/>
            </CardContent>
            {
                props.canToggleToSmall ?
                    <IconButton sx={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                    }}>
                        <Close/>
                    </IconButton>
                    : null
            }
        </Card>
    )
}