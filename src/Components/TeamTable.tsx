import {
    Button,
    Card,
    CardContent,
    CircularProgress,
    Collapse,
    createTheme,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Fade,
    FormControlLabel,
    IconButton,
    LinearProgress,
    Paper,
    Stack,
    Switch,
    Table,
    TableBody,
    TableCell, TableContainer,
    TableHead,
    TableRow,
    TextField, ThemeProvider,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
    Zoom
} from "@mui/material";
import {ITeam, TeamState} from "../Models/Team";
import {ChangeEvent,  useRef, useState} from "react";
import {Close, Star, Warning} from "@mui/icons-material";
import {blue, blueGrey, grey, orange, red, yellow} from "@mui/material/colors";
import {
    getChineseRankFromRankId,
    IPlayer,
    MaxRankScores, TenhouMaxRankScores,
    TenhouRanks
} from "../Models/Player";
import {AxiosError} from "axios";
import IPlayerRankResponse from "../Models/IPlayerRankResponse";
import {useSnackbar} from "notistack";
import api from "../api";
import ITenhouPlayerRankResponse from "../Models/ITenhouPlayerRankResponse";
import {useNavigate} from "react-router-dom";
import {LoadingButton} from "@mui/lab";

export function TeamTable(props: { teamMessage: ITeam, canToggleToSmall?: boolean }) {

    const hasAnyPlayerName = props.teamMessage.members.some(mem => mem.name)
    const hasAnyQQNum = props.teamMessage.members.some(mem => mem.qqNum)
    const containerRef = useRef(null);
    const [useDetailRank, setUseDetailRank] = useState(false);
    const [loadingUseDetailRank, setLoadingUseDetailRank] = useState(false);
    const [detailRankSwitchDisabled, setDetailRankSwitchDisabled] = useState(false);
    const [memberDetailRanks, setMemberDetailRanks]: [Map<number, ([number, number] | null)> | null, Function] = useState(new Map());
    const [memberDetailTenhouRanks, setMemberDetailTenhouRanks] = useState(new Map<number, ([number, number] | null)>())
    const [managing, setManaging] = useState(false)
    const [authorizationCode, setAuthorizationCode] = useState("")
    const [authorizationCodeError, setAuthorizationCodeError] = useState(false)
    const [submittingAuthorizationCode, setSubmittingAuthorizationCode] = useState(false)
    const [changingState, setChangingState] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [teamState, setTeamState] = useState<TeamState>(props.teamMessage.state)
    const [teamNameConfirm, setTeamNameConfirm] = useState("")
    const nav = useNavigate()
    const {enqueueSnackbar} = useSnackbar();
    const darkTheme = createTheme({
        palette: {
            mode: 'dark',
        },
    });

    const handleLoadDetailRank = async (event: ChangeEvent<HTMLInputElement>) => {
        setUseDetailRank(event.target.checked)
        if (event.target.checked) {
            setLoadingUseDetailRank(true)
            setDetailRankSwitchDisabled(true);
            try {
                let promises = props.teamMessage.members.map((member) =>
                    member.mahjsoulRank < 10300
                        ? null
                        : api.get(`GetMajsoulRanking?name=${member.mahjsoulName}`)
                )
                let tenhouPromises = props.teamMessage.members.map((member) =>
                    member.tenhouName ? api.get(`GetTenhouRanking?name=${member.tenhouName}`) : null
                )

                let result = new Map<number, ([number, number] | null)>()
                let tenhouResult = new Map<number, ([number, number] | null)>()
                let errorList: string[] = []

                await Promise.all(promises.map(async (promise, index) => {
                    if (promise == null) {
                        result.set(props.teamMessage.members[index].mahjsoulUid, null)
                    } else {
                        let response: IPlayerRankResponse[] = (await promise).data
                        if (response.length === 0 || response[0].nickName !== props.teamMessage.members[index].mahjsoulName) {
                            result.set(props.teamMessage.members[index].mahjsoulUid, null)
                            errorList.push(props.teamMessage.members[index].mahjsoulName)
                        } else {
                            result.set(props.teamMessage.members[index].mahjsoulUid,
                                [response[0].level.id, response[0].level.score + response[0].level.delta])
                        }
                    }
                }))

                await Promise.all(tenhouPromises.map(async (promise, index) => {
                    if (promise == null) {
                        tenhouResult.set(props.teamMessage.members[index].mahjsoulUid, null)
                    } else {
                        let response: ITenhouPlayerRankResponse = (await promise).data
                        if (response.assumept[4].recent == null) {
                            tenhouResult.set(props.teamMessage.members[index].mahjsoulUid, null)
                            errorList.push(props.teamMessage.members[index].tenhouName!)
                        } else {
                            tenhouResult.set(props.teamMessage.members[index].mahjsoulUid,
                                [response.assumept[4].level, response.assumept[4].pt])
                        }
                    }
                }))

                setMemberDetailRanks(result)
                setMemberDetailTenhouRanks(tenhouResult)

                errorList.forEach((errorName) => {
                    enqueueSnackbar(`未能获取『${errorName}』详细段位，请检查用户名是否正确`, {variant: "warning"})
                })
            } catch (e) {
                enqueueSnackbar("在获取详细段位时发生错误，请稍后重试", {variant: "error"})
                console.log(e)
                setUseDetailRank(false)
            } finally {
                setDetailRankSwitchDisabled(false)
                setLoadingUseDetailRank(false)
            }
        }
    }

    const getPersonIconColor = (player: IPlayer) => {
        if (player.mahjsoulRank >= 10700 || (player.tenhouRank !== undefined && player.tenhouRank) >= TenhouRanks.indexOf("七段")) {
            return red[500]
        } else if (player.mahjsoulRank >= 10500 || (player.tenhouRank !== undefined && player.tenhouRank) >= TenhouRanks.indexOf("四段")) {
            return orange[500]
        } else if (player.mahjsoulRank >= 10400 || (player.tenhouRank !== undefined && player.tenhouRank) >= TenhouRanks.indexOf("二段")) {
            return yellow[500]
        } else {
            return blue[500]
        }
    }

    const submitAuthorizationCode = async () => {
        setSubmittingAuthorizationCode(true)
        if (!authorizationCode || !(await api.get(`Team/CheckAuthorizationCode/${props.teamMessage.id}?authorizationCode=${authorizationCode}`)).data) {
            setAuthorizationCodeError(true)
            setSubmittingAuthorizationCode(false)
            return
        }
        nav(`/contests/${props.teamMessage.contestId}/team/${props.teamMessage.id}/management?authCode=${authorizationCode}`)
    }

    const submitTeamState = async () => {
        try {
            await api.post(`/Team/state/${props.teamMessage.id}/${teamState}?authorizationCode=${authorizationCode}`)
            enqueueSnackbar("更改完成", {variant: "success"})
        } catch (e) {
            if ((e as AxiosError).response?.status === 401) {
                enqueueSnackbar("管理码错误", {variant: "error"})
            } else {
                enqueueSnackbar((e as any).response?.data.toString(), {variant: "error"})
            }
        }
    }

    const submitDeletion = async () => {
        try {
            await api.delete(`/Team/${props.teamMessage.id}?authorizationCode=${authorizationCode}`)
            enqueueSnackbar("成功删除", {variant: "success"})
        } catch (e) {
            if ((e as AxiosError).response?.status === 401) {
                enqueueSnackbar("管理码错误", {variant: "error"})
            } else {
                enqueueSnackbar((e as any).response?.data.toString(), {variant: "error"})
            }
        }
    }

    return (
        <Card sx={{
            paddingTop: "20px",
            paddingX: "30px",
            position: "relative",
            backgroundColor: blueGrey[100],
        }}>
            <CardContent>
                <Stack direction={"row"} alignItems={"center"} justifyContent={"space-between"}>
                    <Typography gutterBottom variant={"h5"} component={"div"}>
                        {props.teamMessage.name}
                    </Typography>
                    <Stack direction={"row"} alignItems={"center"} spacing={2}>
                        <Button variant={"contained"} onClick={() => setChangingState(true)}>变更状态</Button>
                        <Button variant={"contained"} color={"error"} onClick={() => {
                            setTeamNameConfirm("")
                            setDeleting(true)
                        }}>删除</Button>
                    </Stack>
                </Stack>
                <Fade in={true} style={{transitionDuration: "1s"}}><Paper elevation={4} sx={{marginTop: "20px"}}>
                    <TableContainer sx={{maxHeight: "490px"}}>
                    <Table ref={containerRef} stickyHeader>
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
                                                    <TableCell align={"center"}>
                                                        {mem.name}
                                                    </TableCell>
                                                    : null
                                            }
                                            <TableCell align={"center"}>
                                                {mem.mahjsoulName}
                                            </TableCell>
                                            <TableCell align={"center"}>
                                                {
                                                    useDetailRank && !loadingUseDetailRank
                                                        ? (
                                                            <Fade in={useDetailRank} style={{transitionDuration: "2s"}}>
                                                                <Stack>
                                                                    <Typography>
                                                                        {memberDetailRanks && memberDetailRanks.get(mem.mahjsoulUid)
                                                                            ? getChineseRankFromRankId(memberDetailRanks.get(mem.mahjsoulUid)![0])
                                                                            : (mem.mahjsoulRank === 10701 ? "魂天" : getChineseRankFromRankId(mem.mahjsoulRank))}
                                                                    </Typography>
                                                                    {
                                                                        memberDetailRanks && memberDetailRanks.get(mem.mahjsoulUid) ? (
                                                                        /*<Typography>
                                                                            {`${memberDetailRanks[index][1]}`}
                                                                        </Typography>)*/
                                                                                <Stack direction={"row"} alignItems={"center"} spacing={2}>
                                                                                    <LinearProgress
                                                                                        sx={{flexGrow: 1}}
                                                                                        variant={"determinate"}
                                                                                        value={
                                                                                            memberDetailRanks.get(mem.mahjsoulUid)![0] >= 10700
                                                                                                ? 100
                                                                                                : memberDetailRanks.get(mem.mahjsoulUid)![1] / MaxRankScores[
                                                                                            Math.floor((memberDetailRanks.get(mem.mahjsoulUid)![0] % 10000 / 100) - 1) * 3
                                                                                            + memberDetailRanks.get(mem.mahjsoulUid)![0] % 100 - 1
                                                                                                ] * 100
                                                                                        }
                                                                                    />
                                                                                    <Typography variant={"caption"} sx={{color: grey[500]}}>
                                                                                        {`${memberDetailRanks.get(mem.mahjsoulUid)![1]}/${MaxRankScores[
                                                                                        Math.floor((memberDetailRanks.get(mem.mahjsoulUid)![0] % 10000 / 100) - 1) * 3
                                                                                        + memberDetailRanks.get(mem.mahjsoulUid)![0] % 100 - 1
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
                                                                    {(mem.mahjsoulRank === 10701 ? "魂天" : getChineseRankFromRankId(mem.mahjsoulRank))}
                                                                </Typography>
                                                            </Fade>
                                                        )
                                                }
                                            </TableCell>
                                            <TableCell align={"center"}>
                                                {mem.mahjsoulUid}
                                            </TableCell>
                                            <TableCell align={"center"}>
                                                {mem.tenhouName}
                                            </TableCell>
                                            <TableCell align={"center"}>
                                                {
                                                    useDetailRank && !loadingUseDetailRank ? (
                                                        <Fade in={useDetailRank} style={{transitionDuration: "2s"}}>
                                                            <Stack>
                                                                <Typography>
                                                                    {
                                                                        memberDetailTenhouRanks && memberDetailTenhouRanks.get(mem.mahjsoulUid)
                                                                            ? TenhouRanks[memberDetailTenhouRanks.get(mem.mahjsoulUid)![0]]
                                                                            : TenhouRanks[mem.tenhouRank!]
                                                                    }
                                                                </Typography>
                                                                    {
                                                                        memberDetailTenhouRanks && memberDetailTenhouRanks.get(mem.mahjsoulUid) && (
                                                                            <Stack direction={"row"} alignItems={"center"} spacing={2}>
                                                                                <LinearProgress
                                                                                    sx={{flexGrow: 1}}
                                                                                    variant={"determinate"}
                                                                                    value={memberDetailTenhouRanks.get(mem.mahjsoulUid)![1]
                                                                                    / TenhouMaxRankScores[memberDetailTenhouRanks.get(mem.mahjsoulUid)![0]] * 100} />
                                                                                <Typography variant={"caption"} sx={{color: grey[500]}}>
                                                                                    {`${memberDetailTenhouRanks.get(mem.mahjsoulUid)![1]}/${TenhouMaxRankScores[memberDetailTenhouRanks.get(mem.mahjsoulUid)![0]]}`}
                                                                                </Typography>
                                                                            </Stack>
                                                                        )
                                                                    }
                                                            </Stack>
                                                        </Fade>
                                                    ) : (
                                                        <Fade in={!useDetailRank} style={{transitionDuration: "2s"}}>
                                                            <Typography>
                                                                {mem.tenhouRank && TenhouRanks[mem.tenhouRank]}
                                                            </Typography>
                                                        </Fade>
                                                    )
                                                }
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
                    </TableContainer>
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
            <CardContent>
                <Button fullWidth variant={"outlined"} sx={{mt: -2}} onClick={() => setManaging(true)}>管理队伍</Button>
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
            <Dialog open={managing} onClose={() => setManaging(false)}
                    maxWidth={"sm"}
                    fullWidth
            >
                <DialogTitle>
                    队伍管理
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        请输入管理码，管理码在创建队伍时下发。
                    </DialogContentText>
                    <TextField
                        fullWidth
                        autoFocus
                        variant={"standard"}
                        margin={"dense"}
                        id={"inviteCode"}
                        value={authorizationCode}
                        error={authorizationCodeError}
                        helperText={authorizationCodeError && "错误的邀请码"}
                        onChange={(event) => setAuthorizationCode(event.target.value)}
                        onKeyDown={(e) => {
                            if(e.key === "Enter" && !submittingAuthorizationCode) {
                                setTimeout(submitAuthorizationCode, 500)
                            }
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setManaging(false)}>取消</Button>
                    <LoadingButton onClick={submitAuthorizationCode} loading={submittingAuthorizationCode}>确认</LoadingButton>
                </DialogActions>
            </Dialog>
            <Dialog open={changingState} maxWidth={"sm"} fullWidth onClose={() => setChangingState(false)}>
                <DialogTitle>状态变更</DialogTitle>
                <DialogContent>
                    <ToggleButtonGroup exclusive value={teamState} onChange={(_, newValue: TeamState) => setTeamState(newValue ?? teamState)}
                                       color={"primary"}
                    >
                        <ToggleButton value={"editing"}>编辑中</ToggleButton>
                        <ToggleButton value={"pending"}>待审核</ToggleButton>
                        <ToggleButton value={"accepted"}>通过</ToggleButton>
                        <ToggleButton value={"rejected"}>拒绝</ToggleButton>
                    </ToggleButtonGroup>
                    <Collapse in={teamState !== props.teamMessage.state}>
                        <Typography color={grey[700]} sx={{mt: 3, mb: 2}}>{
                            ["editing", "pending"].includes(teamState)
                            ? "请提供队伍管理码或赛事管理码:"
                            : "请提供赛事管理码:"
                        }</Typography>
                        <TextField variant={"standard"} fullWidth sx={{mb: 3}} value={authorizationCode}
                                   onChange={(e) => setAuthorizationCode(e.target.value)}/>
                        <Button variant={"outlined"} fullWidth onClick={submitTeamState}>变更</Button>
                    </Collapse>
                </DialogContent>
            </Dialog>
            <ThemeProvider theme={darkTheme}>
            <Dialog open={deleting} maxWidth={"sm"} fullWidth onClose={() => setDeleting(false)}>
                <Card sx={{backgroundColor: red[700]}}>
                    <DialogTitle sx={{color: "white"}}>删除队伍</DialogTitle>
                    <DialogContent>
                        <Stack alignItems={"center"}>
                            <Typography sx={{color: yellow[500]}}>危险操作</Typography>
                            <Warning sx={{color: yellow[500]}} fontSize={"large"}/>
                            <Typography sx={{color: yellow[500]}}>警告：队伍一经删除将不能恢复</Typography>
                        </Stack>
                    </DialogContent>
                    <DialogContent>
                        <DialogContentText color={grey[300]}>如果您知道您在做什么，请输入该队伍的队伍名:</DialogContentText>
                        <TextField fullWidth variant={"standard"} color={"warning"} value={teamNameConfirm} onChange={e => setTeamNameConfirm(e.target.value)}/>
                        <Collapse in={teamNameConfirm === props.teamMessage.name} sx={{mt: 3}}>
                            <TextField fullWidth value={authorizationCode}
                                       onChange={e => setAuthorizationCode(e.target.value)}
                                       label={"赛事管理码"}
                                       InputLabelProps={{shrink: true}}
                                       color={"warning"}
                            />
                            <Button fullWidth color={"warning"} variant={"outlined"} sx={{mt: 2}} onClick={submitDeletion}>确认删除</Button>
                        </Collapse>
                    </DialogContent>
                </Card>
            </Dialog>
            </ThemeProvider>
        </Card>
    )
}