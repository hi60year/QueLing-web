import React, {Fragment, useEffect, useState} from "react";
import {
    Box, Button,
    Card,
    Collapse,
    Container,
    CssBaseline, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
    Divider, FormControl, IconButton, InputLabel,
    List,
    ListItem, MenuItem, Select,
    Stack,
    TextField,
    Toolbar,
    Typography
} from "@mui/material";
import QueLingAppBar from "./Components/QueLingAppBar";
import {useNavigate, useParams, useSearchParams} from "react-router-dom";
import {IContest} from "./Models/Contest";
import api from "./api";
import {ITeam} from "./Models/Team";
import {getChineseRankFromRankId, IPlayer, TenhouRanks} from "./Models/Player";
import {TransitionGroup} from "react-transition-group";
import {Delete} from "@mui/icons-material";
import {useSnackbar} from "notistack";

export default function Registration() {

    const params = useParams()
    const [searchParams, setSearchParams] = useSearchParams()
    const [team, setTeam] = useState<ITeam>()
    const [contest, setContest] = useState<IContest>()
    const [inviteCode, setInviteCode] = useState("")
    const [name, setName] = useState("")
    const [members, setMembers] = useState<IPlayer[]>([])
    const [memberErrors, setMemberErrors] = useState<Map<string, string>[]>([])
    const [nameInvalidError, setNameInvalidError] = useState<string>()
    const [submitSuccess, setSubmitSuccess] = useState(false)
    const [authCode, setAuthCode] = useState("")
    const nav = useNavigate()
    const {enqueueSnackbar} = useSnackbar();

    useEffect(() => {(async () => {
        setContest((await api.get(`Contest/${params.contestId}`)).data as IContest)
        setAuthCode(searchParams.get("authCode") ?? authCode)
        setInviteCode(searchParams.get("invite") ?? inviteCode)
        if (params.teamId != null) {
            let oldTeam = (await api.get(`Team/${params.teamId}`)).data as ITeam
            setTeam(oldTeam)
            setName(oldTeam.name)
            setMembers(oldTeam.members)
            setMemberErrors(oldTeam.members.map((_) => new Map<string, string>()))
        }
    })()}, [])

    const handleRemovePlayer = (index: number) => {
        setMembers(members.filter((_, i) => i !== index))
        setMemberErrors(memberErrors.filter((_, i) => i !== index))
    }

    const handleAddPlayer = () => {
        setMembers([...members,
            {
                mahjsoulUid: null as unknown as number,
                mahjsoulName: "",
                mahjsoulRank: 10101,
            }
        ])
        setMemberErrors([...memberErrors, new Map<string, string>()])
    }

    const submit = async () => {
        setNameInvalidError(undefined)
        setMemberErrors(memberErrors.map(_ => new Map<string, string>()))
        if (name == null || name === "") {
            setNameInvalidError("队伍名是必须的")
            return
        }
        let abort = false
        members.forEach((member, index) => {
            if (member.mahjsoulName == null || member.mahjsoulName === "") {
                memberErrors[index].set("mahjsoulName", "雀魂名称是必须的")
                abort = true
            }
            if (member.mahjsoulUid == null) {
                memberErrors[index].set("mahjsoulUid", "雀魂uid是必须的")
                abort = true
            } else if (isNaN(+member.mahjsoulUid)) {
                memberErrors[index].set("mahjsoulUid", "不合法的雀魂UID")
                abort = true
            }
        })
        setMemberErrors([...memberErrors])
        if (abort) return
        if (contest?.maxTeamMember != null && members.length > contest?.maxTeamMember) {
            enqueueSnackbar(`队伍人员超出了最大人数${contest?.maxTeamMember}`, {variant: "error"})
            return
        }
        const newTeam: ITeam = {
            members,
            id: null as unknown as string,
            name,
            state: "editing",
            contestId: contest?.id
        }
        try {
            if (authCode == null || authCode === "") {
                const result = (await api.post(`Team/${contest?.id}?inviteCode=${inviteCode}`, newTeam)).data
                setAuthCode(result.authorizationCode)
            } else {
                await api.put(`Team/${params.teamId}?authorizationCode=${authCode}`, newTeam)
            }
            setSubmitSuccess(true)
        } catch (e: any) {
            enqueueSnackbar(e.response.data.toString(), {variant: "error"})
        }
    }

    const renderItem = (player: IPlayer, handleRemovePlayer: (index: number) => void, index: number) =>
        <ListItem
            secondaryAction={
                <IconButton
                    edge="end"
                    aria-label="delete"
                    title="Delete"
                    onClick={() => handleRemovePlayer(index)}
                >
                    <Delete />
                </IconButton>
            }
        >
            <Stack direction={"row"} spacing={3}>
                <TextField label={"称呼"} value={player.name} onChange={(e) => {
                    members[index].name = e.target.value
                    setMembers([...members])
                }} />
                <TextField label={"雀魂名称*"} value={player.mahjsoulName} error={memberErrors[index].get("mahjsoulName") != null} onChange={e => {
                    members[index].mahjsoulName = e.target.value
                    setMembers([...members])
                }} helperText={memberErrors[index].get("mahjsoulName")} />
                <TextField label={"雀魂UID*"} value={player.mahjsoulUid} error={memberErrors[index].get("mahjsoulUid") != null} onChange={e => {
                    members[index].mahjsoulUid = isNaN(+e.target.value) ? 0 : +e.target.value
                    setMembers([...members])
                }} helperText={memberErrors[index].get("mahjsoulUid")}/>
                <FormControl sx={{minWidth: 120}}>
                    <InputLabel id={"msRankLabel"}>雀魂段位*</InputLabel>
                    <Select label={"雀魂段位*"} value={player.mahjsoulRank} labelId={"msRankLabel"} onChange={(event) => {
                        members[index].mahjsoulRank = +event.target.value
                        setMembers([...members])
                    }}>
                        {[10101, 10102, 10103, 10201, 10202, 10203, 10301, 10302, 10303, 10401, 10402, 10403, 10501, 10502, 10503, 10701].map( msRankId =>
                            <MenuItem key={msRankId} value={msRankId}>
                                {msRankId === 10701 ? "魂天" : getChineseRankFromRankId(msRankId)}
                            </MenuItem>
                        )}
                    </Select>
                </FormControl>
                <TextField label={"天凤名称"} value={player.tenhouName} onChange={e => {
                    members[index].tenhouName = e.target.value === "" ? undefined : e.target.value
                }} />
                <FormControl sx={{minWidth: 120 }}>
                    <InputLabel id={"thRankLabel"}>天凤段位</InputLabel>
                    <Select label={"天凤段位"} value={player.tenhouRank ?? "-1"} labelId={"thRankLabel"} onChange={(event) => {
                        members[index].tenhouRank = +event.target.value === -1 ? undefined : +event.target.value
                        setMembers([...members])
                    }}>
                        <MenuItem value={-1}>无</MenuItem>
                        {TenhouRanks.map( (thRankId, index) =>
                            <MenuItem key={thRankId} value={index}>
                                {TenhouRanks[index]}
                            </MenuItem>
                        )}
                    </Select>
                </FormControl>
            </Stack>
        </ListItem>

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
                }}
            >
                <Toolbar/>
                <Container maxWidth={"lg"} sx={{my: 4}}>
                    <Card sx={{p: 4}}>
                        <Stack>
                            <Typography variant={"h5"} sx={{alignSelf: "center"}}>
                                {"报名 - " + (contest?.name ?? "")}
                            </Typography>
                            <Divider sx={{width: "90%", my: 3, alignSelf: "center"}}/>
                            <TextField
                                label={"队伍名"}
                                sx={{alignSelf: "center", width: "321px"}}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                helperText={nameInvalidError ?? "*请注意队伍名字一经创建不能修改"}
                                error={nameInvalidError != null}
                                disabled={searchParams.get("authCode") != null}
                            />
                            <Button sx={{alignSelf: "center", my: 3}} variant={"contained"} onClick={handleAddPlayer}>添加新队员</Button>
                            <List>
                                <TransitionGroup>
                                    {
                                        members.map((member, index) =>
                                            <Collapse key={index}>
                                                {renderItem(member, handleRemovePlayer, index)}
                                            </Collapse>
                                        )
                                    }
                                </TransitionGroup>
                            </List>
                            <Button fullWidth variant={"contained"} sx={{mt: 3}} onClick={submit}>提交</Button>
                        </Stack>
                    </Card>
                </Container>
            </Box>
            <Dialog open={submitSuccess} maxWidth={"sm"} fullWidth>
                <DialogTitle>报名/修改成功</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        <b>{`队伍管理码为: ${authCode}。请务必妥善保管控制码。`}</b>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => nav(`/contests/${contest?.id}`)}>回到比赛页</Button>
                </DialogActions>
            </Dialog>
        </Fragment>
    )
}