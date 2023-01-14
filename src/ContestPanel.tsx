import {useNavigate, useParams} from "react-router-dom";
import {Fragment, ReactNode, useEffect, useState} from "react";
import {
    Box, Button, ButtonGroup,
    Card,
    CardContent,
    CssBaseline, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
    Fade,
    Skeleton, Stack,
    Tab,
    Table, TableBody, TableCell, TableHead, TableRow,
    Tabs, TextField,
    Toolbar,
    Typography, useTheme
} from "@mui/material";
import QueLingAppBar from "./Components/QueLingAppBar";
import {ContestState, IContest} from "./Models/Contest";
import api from "./api";
import {green, grey, red, yellow} from "@mui/material/colors";
import SwipeableViews from 'react-swipeable-views'
import {getChineseRankFromRankId, TenhouRanks} from "./Models/Player";
import {getStateTextAndColor, ITeam, TeamState} from "./Models/Team";
import {TeamTable} from "./Components/TeamTable";
import RankingList from "./Components/RankingList";
import {LoadingButton} from "@mui/lab";

interface TabPanelProps {
    children?: ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <Box
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </Box>
    );
}

function RankingRequirementText(contest: IContest) {
    if (contest.rankingRequirement == null || contest.rankingRequirement.length === 0) {
        return <p>段位要求: 无</p>
    } else {
        return <div>
            段位要求:
            <ul>
                {
                    contest.rankingRequirement.map((requirement, index) => {
                        const tenhou = requirement[2] > 0 &&
                            `天凤段位高于${TenhouRanks[requirement[2]]}`
                        const mahjsoul = requirement[1] > 0 &&
                            `雀魂段位高于${getChineseRankFromRankId(requirement[1])}`
                        return <li key={index}>{`${requirement[0] === 0 ? "所有" : requirement[0]}人${[tenhou, mahjsoul].filter(x => x).join(" 或 ")}`}</li>
                    })
                }
            </ul>
        </div>
    }
}

function ScoreCountingText(contest: IContest) {
    if (contest.countingPolicy === null)
        return <p>自动计分未启用</p>
    else {
        const seq = `顺位积分：${contest.countingPolicy.seqPoint[0]},
         ${contest.countingPolicy.seqPoint[1]}, ${contest.countingPolicy.seqPoint[2]},
          ${contest.countingPolicy.seqPoint[3]}`
        const flyPunish = `负分得分：${contest.countingPolicy.seqPoint[4]}`
        const pureSeq = `纯顺位积分: ${contest.countingPolicy.pureSeq ? "是" : "否"}`
        const divider = `素点除数: ${contest.countingPolicy.rawPointDivider}`
        const intervalBonus = `区间奖励-队伍: ${contest.countingPolicy.highestRawPointBonus !== 0 ? 
            contest.countingPolicy.highestRawPointBonus : "无"
        }`
        const lastBonus = `区间奖励-末选手: ${contest.countingPolicy.highestLastIntervalPosBonus !== 0 ?
            contest.countingPolicy.highestLastIntervalPosBonus : "无"
        }`
        return <span>
            <p>{seq}</p>
            <p>{flyPunish}</p>
            <p>{pureSeq}</p>
            <p>{!pureSeq && divider}</p>
            <p>{intervalBonus}</p>
            <p>{lastBonus}</p>
        </span>
    }
}

function stateTextInChinese(state: ContestState) {
    if (state === "holding") {
        return "进行中"
    } else if (state === "registering") {
        return "报名中"
    } else {
        return "已结束"
    }
}

export default function ContestPanel() {

    let params = useParams()
    const [contest, setContest] = useState<IContest>()
    const [teams, setTeams] = useState<ITeam[]>()
    const [tabValue, setTabValue] = useState(0)
    const [tableRowColors, setTableRowColors] = useState<string[]>([]);
    const [selectedTeam, setSelectedTeam] = useState<ITeam | null>()
    const [manageContest, setManageContest] = useState(false)
    const [authorizationCode, setAuthorizationCode] = useState("")
    const [authorizationCodeError, setAuthorizationCodeError] = useState(false)
    const [submittingAuthorizationCode, setSubmittingAuthorizationCode] = useState(false)
    const [registering, setRegistering] = useState(false)
    const [inviteCode, setInviteCode] = useState("")
    const [inviteCodeError, setInviteCodeError] = useState(false)
    const [submittingInviteCode, setSubmittingInviteCode] = useState(false)
    const theme = useTheme()
    const nav = useNavigate()

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
        api.get(`Contest/${params.contestId}`).then(response => {
            setContest(response.data)
            api.get(`Team?contestId=${response.data.id}`).then(teamResponse => {
                setTeams(teamResponse.data)
            })
            setTableRowColors(response.data.teams.map((_: any) => "#FFFFFF"))
        })
    }, [])

    const handleTabIndexChange = (_: any, index: number) => {
        setTabValue(index)
    }

    const submitAuthorizationCode = async () => {
        setSubmittingAuthorizationCode(true)
        if (!authorizationCode || !(await api.get(`/ContestAuthorizationCheck/${contest!.id}?authorizationCode=${authorizationCode}`)).data) {
            setAuthorizationCodeError(true)
            setSubmittingAuthorizationCode(false)
            return
        }
        nav(`management?auth=${authorizationCode}`)
    }

    const submitInviteCode = async () => {
        setSubmittingInviteCode(true)
        if (!inviteCode || !(await api.get(`/ContestInviteCheck/${contest!.id}?inviteCode=${inviteCode}`)).data) {
            setInviteCodeError(true)
            setSubmittingInviteCode(false)
            return
        }
        nav(`register?invite=${inviteCode}`)
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
                    alignItems: 'center'
                }}
            >
                <Card sx={{maxWidth: "1272px", flexGrow: 1, height: "80%",
                    [theme.breakpoints.up('md')]: {
                        mx: 9, mt: 5
                    },
                    [theme.breakpoints.down('md')]: {
                        mx: 0, mt: 0
                    }
                }}>
                    <CardContent sx={{height: "100%"}}>
                        <Box sx={{display: "flex", justifyContent: "center", mt: 2}}>
                            {
                                contest ?
                                    <Fade in><Typography variant={"h5"} component={"div"}> {contest.name} </Typography></Fade> :
                                    <Skeleton width={400}/>
                            }
                        </Box>
                        <Stack direction={"row"} sx={{width: "100%", mt: 2, mb: 1}} justifyContent={"center"}>
                            {contest && <ButtonGroup variant={"outlined"}>
                                <Button sx={{px: 4}} disabled={contest.state !== "registering"} onClick={() => setRegistering(true)}>报名</Button>
                                <Button sx={{px: 4}} onClick={() => setManageContest(true)}>管理</Button>
                            </ButtonGroup>}
                        </Stack>
                        <Box sx={{
                            borderColor: grey[500],
                            [theme.breakpoints.up('md')]: {
                                borderWidth: "0.5px",
                                borderRadius: "10px",
                                borderStyle: "solid",
                                p: 3,
                                mt: 5,
                                mx: 3,
                            },

                            flexGrow: 1,
                            height: "calc(100% - 130px)",
                            display: "flex",
                            flexDirection: "column"
                        }}>
                            <Tabs
                                centered
                                value={tabValue}
                                onChange={handleTabIndexChange}
                            >
                                <Tab sx={{fontSize: "large"}} label={"总 览"}/>
                                <Tab sx={{fontSize: "large"}} label={"队 伍"}/>
                                <Tab sx={{fontSize: "large"}} label={"排 行 榜"}/>
                            </Tabs>
                            <SwipeableViews
                                index={tabValue}
                                onChangeIndex={(index: number) => handleTabIndexChange(null, index)}
                                style={{
                                    width: "100%",
                                    height: "100%"
                                }}
                            >
                                <TabPanel value={tabValue} index={0}>
                                    {
                                        contest ?
                                            <Fade in={true}>
                                                <Typography component={"span"}>
                                                    <p>{`名称: ${contest.name}`}</p>
                                                    <p>{`队伍数量: ${contest.teams.length}`}</p>
                                                    <p>{`最大队伍人数（包括替补）: ${contest.maxTeamMember}`}</p>
                                                    <p>{contest.dflId && `绑定的大凤林Id: ${contest.dflId}`}</p>
                                                    <p>{`状态: ${stateTextInChinese(contest.state)}`}</p>
                                                    {RankingRequirementText(contest)}
                                                    <p>{contest.promotionQuantity != null && `本轮晋级数: ${contest.promotionQuantity}`}</p>
                                                    {ScoreCountingText(contest)}
                                                </Typography>
                                            </Fade>
                                            : <Skeleton variant={"rectangular"} height={100}/>

                                    }
                                </TabPanel>
                                <TabPanel value={tabValue} index={1}>
                                    <Table stickyHeader>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{fontWeight: "bold"}}>队伍名</TableCell>
                                                <TableCell sx={{fontWeight: "bold"}} align={"right"}>
                                                    队员数
                                                </TableCell>
                                                <TableCell sx={{fontWeight: "bold", width: 136}} align={"right"}>
                                                    状态
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {teams?.map((team, index) => (
                                                <TableRow
                                                    key={index}
                                                    sx={{backgroundColor: tableRowColors[index] ?? "#FFFFFF", cursor: "pointer"}}
                                                    onMouseEnter={() => setNthColor(index, grey[100])}
                                                    onMouseLeave={() => setNthColor(index, "#FFFFFF")}
                                                    onClick={() => setSelectedTeam(team)}
                                                >
                                                    <TableCell>{team.name}</TableCell>
                                                    <TableCell align={"right"}>{team.members.length}</TableCell>
                                                    <TableCell align={"right"} sx={{width: 136, color: getStateTextAndColor(team.state)[1]}}>{
                                                        getStateTextAndColor(team.state)[0]
                                                    }</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TabPanel>
                                <TabPanel value={tabValue} index={2}>
                                    {
                                        contest && <RankingList contest={contest}/>
                                    }
                                </TabPanel>
                            </SwipeableViews>
                        </Box>
                    </CardContent>
                </Card>
            </Box>
            <Dialog open={selectedTeam != null} onClose={() => setSelectedTeam(null)} maxWidth={"lg"} fullWidth>
                {selectedTeam && <TeamTable teamMessage={selectedTeam}/>}
            </Dialog>
            <Dialog open={manageContest} onClose={() => setManageContest(false)}
                    maxWidth={"sm"}
                    fullWidth
            >
                <DialogTitle>
                    赛事管理
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        请输入赛事管理码，赛事管理码在申请赛事时会向您下发。
                    </DialogContentText>
                    <TextField
                        fullWidth
                        autoFocus
                        variant={"standard"}
                        margin={"dense"}
                        id={"authorizationCode"}
                        value={authorizationCode}
                        error={authorizationCodeError}
                        helperText={authorizationCodeError && "错误的管理码"}
                        onChange={(event) => setAuthorizationCode(event.target.value)}
                        onKeyDown={(e) => {
                            if(e.key === "Enter" && !submittingAuthorizationCode) {
                                setTimeout(submitAuthorizationCode, 500)
                            }
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setManageContest(false)}>取消</Button>
                    <LoadingButton onClick={submitAuthorizationCode} loading={submittingAuthorizationCode}>确认</LoadingButton>
                </DialogActions>
            </Dialog>
            <Dialog open={registering} onClose={() => setRegistering(false)}
                    maxWidth={"sm"}
                    fullWidth
            >
                <DialogTitle>
                    队伍报名
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        请输入邀请码，邀请码由赛事方提供。
                    </DialogContentText>
                    <TextField
                        fullWidth
                        autoFocus
                        variant={"standard"}
                        margin={"dense"}
                        id={"inviteCode"}
                        value={inviteCode}
                        error={inviteCodeError}
                        helperText={inviteCodeError && "错误的邀请码"}
                        onChange={(event) => setInviteCode(event.target.value)}
                        onKeyDown={(e) => {
                            if(e.key === "Enter" && !submittingInviteCode) {
                                setTimeout(submitInviteCode, 500)
                            }
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRegistering(false)}>取消</Button>
                    <LoadingButton onClick={submitInviteCode} loading={submittingInviteCode}>确认</LoadingButton>
                </DialogActions>
            </Dialog>
        </Fragment>
    )
}