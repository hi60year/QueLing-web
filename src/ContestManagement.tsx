import {
    Box,
    Button,
    Card,
    CardContent,
    Collapse,
    CssBaseline,
    Dialog,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider, Fade,
    FormControl,
    FormControlLabel,
    IconButton,
    InputLabel, LinearProgress,
    List,
    ListItem,
    MenuItem,
    Select,
    Stack,
    Switch,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Toolbar,
    Typography
} from "@mui/material";
import React, {ChangeEvent, Fragment, useEffect, useState} from "react";
import QueLingAppBar from "./Components/QueLingAppBar";
import {useParams, useSearchParams} from "react-router-dom";
import {ContestState, IContest, RankingRequirement} from "./Models/Contest";
import api from "./api";
import {TransitionGroup} from "react-transition-group";
import { Delete } from "@mui/icons-material";
import {grey} from "@mui/material/colors";
import {getChineseRankFromRankId, TenhouRanks} from "./Models/Player";
import {ITeam} from "./Models/Team";
import IPlayerRankResponse from "./Models/IPlayerRankResponse";
import ITenhouPlayerRankResponse from "./Models/ITenhouPlayerRankResponse";
import {useSnackbar} from "notistack";
import {isNaN} from "@amcharts/amcharts5/.internal/core/util/Type";

interface RenderItemOptions {
    rankingRequirement: RankingRequirement;
    handleRemoveRequirement: (item: RankingRequirement) => void;
    index: number,
}

export default function ContestManagement() {

    const params = useParams()
    const [contest, setContest] = useState<IContest>()
    const [contestState, setContestState] = useState<ContestState>("registering")
    const [stateBtnColor, setStateBtnColor] = useState<"primary" | "warning">("primary")
    const [rankingRequirements, setRankingRequirements] = useState<[number, number, number][]>([])
    const [inviteCode, setInviteCode] = useState("--loading--")
    const [autoCounting, setAutoCounting] = useState<boolean>(false)
    const [seqPoint, setSeqPoint] = useState([0, 0, 0, 0, 0])
    const [pureSeq, setPureSeq] = useState(false)
    const [rawPointDivider, setRawPointDivider] = useState(100000)
    const [lastIntervalBonus, setLastIntervalBonus] = useState(0)
    const [rawPointBonus, setRawPointBonus] = useState(0)
    const [checkRanking, setCheckRanking] = useState(false)
    const [checkRankingLog, setCheckRankingLog] = useState("")
    const [teamJsonDialogOpened, setTeamJsonDialogOpened] = useState(false)
    const [teams, setTeams] = useState<ITeam[]>([])
    const [dflId, setDflId] = useState<number | null>(null)
    const [searchParams, setSearchParams] = useSearchParams()
    const {enqueueSnackbar} = useSnackbar();


    useEffect(() => {
        (async () => {
            let rContest = (await api.get(`Contest/${params.contestId}`)).data as IContest
            setContest(rContest)
            setContestState(rContest.state)
            setRankingRequirements(rContest.rankingRequirement ?? [])
            setAutoCounting(rContest.countingPolicy != null)
            setSeqPoint(rContest.countingPolicy ? rContest.countingPolicy.seqPoint : seqPoint)
            setPureSeq(rContest.countingPolicy ? rContest.countingPolicy.pureSeq : pureSeq)
            setLastIntervalBonus(rContest.countingPolicy ? rContest.countingPolicy.highestLastIntervalPosBonus : lastIntervalBonus)
            setRawPointBonus(rContest.countingPolicy ? rContest.countingPolicy.highestRawPointBonus : rawPointBonus)
            setDflId(rContest.dflId)
            setInviteCode((await api.get(`Contest/InviteCode/${params.contestId}?authorizationCode=${searchParams.get("auth")}`)).data)
            let teams: ITeam[] = []
            await Promise.all(rContest.teams.map(async (teamId) => {
                teams.push((await api.get(`/Team/${teamId}`)).data as ITeam)
            }))
            setTeams([...teams])
        })()
    }, [])

    const renderItem = ({ rankingRequirement, handleRemoveRequirement, index }: RenderItemOptions) => {
        return (
            <ListItem
                secondaryAction={
                    <IconButton
                        edge="end"
                        aria-label="delete"
                        title="Delete"
                        onClick={() => handleRemoveRequirement(rankingRequirement)}
                    >
                        <Delete />
                    </IconButton>
                }
            >
                <Stack direction={"row"} alignItems={"center"} spacing={3}>
                    <TextField variant={"standard"} label={"人数"} value={rankingRequirement[0]} onChange={(event) => {
                        rankingRequirements[index][0] = isNaN(+event.target.value) ? 0 : +event.target.value
                        setRankingRequirements([...rankingRequirements])
                    }}/>
                    <FormControl sx={{ m: 1, minWidth: 120 }} variant={"standard"}>
                        <InputLabel id={"msRankLabel"}>雀魂段位</InputLabel>
                        <Select label={"雀魂段位"} value={rankingRequirement[1]} labelId={"msRankLabel"} onChange={(event) => {
                            rankingRequirements[index][1] = +event.target.value
                            setRankingRequirements([...rankingRequirements])
                        }}>
                            {[0, 10101, 10102, 10103, 10201, 10202, 10203, 10301, 10302, 10303, 10401, 10402, 10403, 10501, 10502, 10503, 10701].map( msRankId =>
                                <MenuItem key={msRankId} value={msRankId}>
                                    {msRankId === 0 ? "无" : getChineseRankFromRankId(msRankId)}
                                </MenuItem>
                            )}
                        </Select>
                    </FormControl>
                    <Typography>
                        或
                    </Typography>
                    <FormControl sx={{ m: 1, minWidth: 120 }} variant={"standard"}>
                        <InputLabel id={"thRankLabel"}>天凤段位</InputLabel>
                        <Select label={"天凤段位"} value={rankingRequirement[2]} labelId={"thRankLabel"} onChange={(event) => {
                            rankingRequirements[index][2] = +event.target.value
                            setRankingRequirements([...rankingRequirements])
                        }}>
                            {TenhouRanks.map( (thRankId, index) =>
                                <MenuItem key={thRankId} value={index}>
                                    {index === 0 ? "无" : TenhouRanks[index]}
                                </MenuItem>
                            )}
                        </Select>
                    </FormControl>
                </Stack>
            </ListItem>
        );
    }

    const handleRemoveRequirement = (rankingRequirement: RankingRequirement) => {
        setRankingRequirements(rankingRequirements.filter(r => r !== rankingRequirement))
    }

    const handleAddRequirement = () => {
        setRankingRequirements([...rankingRequirements, [0, 0, 0]])
    }

    const handleStateChange = (event: React.MouseEvent<HTMLElement>, newState: ContestState | null) => {
        setStateBtnColor("warning")
        if (newState != null) {
            setContestState(newState)
        }
    }

    const seqPointChangeHandlerGenerator = (index: number) => (e: ChangeEvent<HTMLInputElement>) => {
        seqPoint[index] = isNaN(+e.target.value) ? 0 : +e.target.value
        setSeqPoint([...seqPoint])
    }

    const handleCheckRanking = async () => {
        setCheckRanking(true)
        let rankingNotFoundError: string[] = []
        let rankingNotSatisfiedError: string[] = []
        let rankingNotConsistentError: string[] = []
        let rankingInaccessibleError: string[] = []
        await Promise.all(contest!.teams.map(async (teamId) => {
            const team = (await api.get(`/Team/${teamId}`)).data as ITeam
            await Promise.all(team.members.map(async (member, index) => {
                try {
                    let msPromiseData: IPlayerRankResponse[] = (await api.get(`GetMajsoulRanking?name=${member.mahjsoulName}`)).data
                    if (member.mahjsoulRank >= 10301) {
                        if (msPromiseData.length === 0 || msPromiseData[0].nickName !== member.mahjsoulName) {
                            rankingNotFoundError.push(`队伍 ${team.name} 中 雀魂名称填写为 ${member.mahjsoulName} 的选手段位信息未找到。`)
                        } else if ((msPromiseData[0].level.id !== 10701 && msPromiseData[0].level.id !== member.mahjsoulRank) || msPromiseData[0].level.id < member.mahjsoulRank) {
                            rankingNotConsistentError.push(
                                `队伍 ${team.name} 中 雀魂名称填写为 ${member.mahjsoulName} 的选手段位信息不一致。实际段位为${getChineseRankFromRankId(msPromiseData[0].level.id)}`
                            )
                            team.members[index].mahjsoulRank = msPromiseData[0].level.id
                        }
                    }
                } catch {
                    rankingInaccessibleError.push(`队伍 ${team.name} 中 雀魂名称填写为 ${member.mahjsoulName} 的选手段位请求失败。`)
                }

                if (member.tenhouName == null || member.tenhouRank == null) return

                try {
                    let thPromiseData: ITenhouPlayerRankResponse = (await api.get(`GetTenhouRanking?name=${member.tenhouName}`)).data
                    if (thPromiseData.assumept[4].level !== member.tenhouRank) {
                        rankingNotConsistentError.push(
                            `队伍 ${team.name} 中 天凤名称填写为 ${member.tenhouName} 的选手段位信息不一致。实际段位为${TenhouRanks[thPromiseData.assumept[4].level]}`
                        )
                        team.members[index].tenhouRank = thPromiseData.assumept[4].level ?? 0
                    }
                } catch {
                    rankingInaccessibleError.push(`队伍 ${team.name} 中 天凤名称填写为 ${member.tenhouName} 的选手段位请求失败。`)
                }
            }))

            // Check Ranking Satisfied
            if (contest == null) return

            rankingRequirements.forEach(requirement => {
                let num = team.members.filter(mem => {
                    let msSatisfied = requirement[1] === 0 ? false : mem.mahjsoulRank > requirement[1]
                    let thSatisfied = requirement[2] === 0 || mem.tenhouRank == null ? false : mem.tenhouRank > requirement[2]
                    return msSatisfied || thSatisfied
                }).length
                if (num < (requirement[0] === 0 ? team.members.length : requirement[0])) {
                    rankingNotSatisfiedError.push(`队伍 ${team.name} 不满足 ${(requirement[0] === 0 ? "所有" : requirement[0])} 人的段位要求`)
                }
            })
        }))
        let finalString = [rankingNotFoundError.join('\n'), rankingNotSatisfiedError.join('\n'), rankingNotConsistentError.join('\n'), rankingInaccessibleError.join('\n')]
            .join('\n').trim()
        setCheckRankingLog(finalString === "" ? "所有队伍通过段位检查" : finalString)
    }

    const handleSubmit = () => {
        if (contest == null) return
        const newContest: IContest = {
            ...contest,
            state: contestState,
            rankingRequirement: rankingRequirements,
            countingPolicy: autoCounting ? {
                pureSeq,
                highestRawPointBonus: rawPointBonus,
                highestLastIntervalPosBonus: lastIntervalBonus,
                seqPoint,
                rawPointDivider,
                countingFactor: []
            } : null,
            dflId
        }
        api.put(`Contest/${contest.id}?authorizationCode=${searchParams.get("auth")}`, newContest).then( response =>
            enqueueSnackbar("修改成功", {variant: "success"})
        ).catch(reason => {
            enqueueSnackbar(reason.response.data.toString(), {variant: "error"})
        })
    }


    return (
        <Fragment>
            <CssBaseline/>
            <QueLingAppBar/>
            <Box
                component="main"
                sx={{
                    backgroundColor: (theme) =>
                        theme.palette.mode === 'light'
                            ? theme.palette.grey[100]
                            : theme.palette.grey[900],
                    flexGrow: 1,
                    height: '100vh',
                    overflow: 'auto',
                    display: 'flex',
                    justifyContent: 'center',
                }}
            >
                <Toolbar/>
                <Card sx={{mt: 6, mx: 9, maxWidth: "1272px", flexGrow: 1, minHeight: "80%", px: 9, overflow: "auto"}}>
                    <CardContent>
                        <Stack sx={{alignItems: "center"}} spacing={3}>
                            <Typography variant={"h6"}>{`赛事管理: ${params.contestId}`}</Typography>
                            <Typography>{`邀请码: ${inviteCode}`}</Typography>
                            <Stack direction={"row"} alignItems={"center"}>
                                <TextField label={"赛事名称"} disabled value={contest?.name} defaultValue={"--loading--"}/>
                                <Typography sx={{ml: 3}}>比赛状态:</Typography>
                                <ToggleButtonGroup color={stateBtnColor} sx={{ml: 2}} value={contestState} onChange={handleStateChange} exclusive>
                                    <ToggleButton value={"registering"}>报名中</ToggleButton>
                                    <ToggleButton value={"holding"}>进行中</ToggleButton>
                                    <ToggleButton value={"end"}>已结束</ToggleButton>
                                </ToggleButtonGroup>
                            </Stack>
                            <Stack direction={"row"} alignItems={"center"} spacing={3}>
                                <Typography>大凤林Id:</Typography>
                                <TextField value={dflId} onChange={e => {
                                    if (e.target.value === "") {
                                        setDflId(null)
                                    } else if (isNaN(+e.target.value)) {
                                        setDflId(0)
                                    } else {
                                        setDflId(+e.target.value)
                                    }
                                }}/>
                            </Stack>
                            <Stack sx={{alignSelf: "start", mt: 3}}  direction={"row"} alignItems={"center"} spacing={3}>
                                <Typography>段位要求:</Typography>
                                <Button variant={"contained"} onClick={handleAddRequirement}>添加段位要求</Button>
                                <Stack>
                                    <Typography color={grey[500]}>*注意: 要应用全员段位要求，请在人数中填0。天凤和雀魂一方为无，则必须满足填写的一方。</Typography>
                                    <Typography color={grey[500]}>若要应用最低人数检查，只需要添加一个雀魂段位为初心，天凤段位为9级，人数为最小人数的要求即可。</Typography>
                                </Stack>
                            </Stack>
                            <List>
                                <TransitionGroup>
                                    {
                                        rankingRequirements.map((rankingRequirement, index) => (
                                            <Collapse key={index}>
                                                {renderItem({index, rankingRequirement, handleRemoveRequirement})}
                                            </Collapse>
                                        ))
                                    }
                                </TransitionGroup>
                            </List>
                            <Button fullWidth variant={"outlined"} onClick={handleCheckRanking}>执行段位检查</Button>
                            <Divider sx={{width: "96%"}}/>
                            <FormControlLabel
                                control={<Switch checked={autoCounting} onClick={() => setAutoCounting(!autoCounting)}/>}
                                label={"使用自动计分"}
                            />
                            <Collapse in={autoCounting}>
                                <Stack sx={{alignItems: "center"}} spacing={2}>
                                    <Stack direction={"row"} alignItems={"center"} spacing={3}>
                                        <Typography>顺位点</Typography>
                                        <TextField sx={{width: 100}} label={"一位"} defaultValue={0} value={seqPoint[0]} onChange={seqPointChangeHandlerGenerator(0)}/>
                                        <TextField sx={{width: 100}} label={"二位"} defaultValue={0} value={seqPoint[1]} onChange={seqPointChangeHandlerGenerator(1)}/>
                                        <TextField sx={{width: 100}} label={"三位"} defaultValue={0} value={seqPoint[2]} onChange={seqPointChangeHandlerGenerator(2)}/>
                                        <TextField sx={{width: 100}} label={"四位"} defaultValue={0} value={seqPoint[3]} onChange={seqPointChangeHandlerGenerator(3)}/>
                                        <TextField sx={{width: 100}} label={"负分"} defaultValue={0} value={seqPoint[4]} onChange={seqPointChangeHandlerGenerator(4)}/>
                                    </Stack>
                                    <FormControlLabel
                                        control={<Switch checked={pureSeq} onClick={() => setPureSeq(!pureSeq)}/>}
                                        label={"使用纯顺位点"}
                                    />
                                    <Collapse in={!pureSeq}>
                                        <Stack direction={"row"} alignItems={"center"} spacing={3}>
                                            <TextField sx={{width: 130}} label={"素点除数"} value={rawPointDivider} onChange={(e) => setRawPointDivider(
                                                isNaN(+e.target.value) ? 0 : +e.target.value
                                            )}/>
                                            <TextField sx={{width: 130}} label={"区间奖励-末选手"} type={"number"} value={lastIntervalBonus} onChange={(e) => setLastIntervalBonus(
                                                isNaN(+e.target.value) ? 0 : +e.target.value
                                            )}/>
                                            <TextField sx={{width: 130}} label={"区间奖励-总打点"} type={"number"} value={rawPointBonus} onChange={(e) => setRawPointBonus(
                                                isNaN(+e.target.value) ? 0 : +e.target.value
                                            )}/>
                                        </Stack>
                                    </Collapse>
                                </Stack>
                            </Collapse>
                            <Button fullWidth variant={"outlined"} onClick={() => setTeamJsonDialogOpened(true)}>导出队伍JSON信息</Button>
                            <Button fullWidth variant={"contained"} onClick={handleSubmit}>提交更改</Button>
                        </Stack>
                    </CardContent>
                </Card>
            </Box>
            <Dialog open={checkRanking} maxWidth={"md"} fullWidth onClose={() => {
                setCheckRanking(false)
                setCheckRankingLog("")
            }}>
                <DialogTitle>段位检查</DialogTitle>
                <DialogContent>
                    {  checkRankingLog === "" &&
                        <Fade in>
                            <Stack alignItems={"center"} spacing={3}>
                                <DialogContentText>正在执行段位检查...</DialogContentText>
                                <LinearProgress sx={{width: "100%"}}/>
                            </Stack>
                        </Fade>
                    }
                    <Fade in={checkRankingLog !== ""}>
                        <TextField
                            value={checkRankingLog}
                            multiline
                            fullWidth
                            maxRows={13}
                        />
                    </Fade>
                </DialogContent>
            </Dialog>
            <Dialog open={teamJsonDialogOpened} maxWidth={"md"} fullWidth onClose={() => setTeamJsonDialogOpened(false)}>
                <DialogTitle>队伍数据</DialogTitle>
                <DialogContent>
                    <TextField
                        value={JSON.stringify(teams)}
                        multiline
                        fullWidth
                        maxRows={13}
                    />
                </DialogContent>
            </Dialog>
        </Fragment>
    )
}