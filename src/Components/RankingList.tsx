import {Box, Card, CardContent, Fade, Skeleton, Slider, Stack, Typography} from "@mui/material";
import {IContest} from "../Models/Contest";
import {grey, red} from "@mui/material/colors";
import {useEffect, useState} from "react";
import api from "../api";
import { LoadingButton } from "@mui/lab";
import RankingListChart from "./RankingListChart";

export default function RankingList(props: {
    contest: IContest
}) {

    const [classData, setClassData] = useState<any[]>()
    const [scoreData, setScoreData] = useState<{name: string, score: number}[]>()
    const [executed, setExecuted] = useState(false)
    const [executing, setExecuting] = useState(false)
    const [selectedRounds, setSelectedRounds] = useState<number[]>([1, 1])

    useEffect(() => {
        const callback = async () => {
            setClassData((await api.get(`DflClass/${props.contest.dflId}`)).data)
        }
        callback()
    }, [])

    const handleSelectedRoundsChange = (event: Event, newValue: number | number[]) => {
        setSelectedRounds(newValue as number[])
    }

    const handleExecution = async () => {
        setExecuting(true)
        const gameResult: object[] = []
        for (let i = selectedRounds[0]; i <= selectedRounds[1]; i++) {
            gameResult.push((await api.get(`GameResult/${props.contest.dflId}?round=${i}`)).data)
        }
        const tempScoreData = new Map<string, number>()
        gameResult.forEach((oneRoundResult, index) => {
            Object.entries(oneRoundResult).forEach(entry => {
                const gameId = entry[0]
                const games = entry[1] as object[]
                const classDatum = classData!.find((datum) => datum["rid"] === gameId && +datum["round"] === index + selectedRounds[0])
                const lastGame: any = games[games.length - 1]
                const resultPairs: [string, number][] = []
                for (let i = 1; i <= 4; i++) {
                    resultPairs.push([classDatum[`tid${i}`] as unknown as string, +lastGame[`num${i}`]])
                }
                // ascending score sort
                resultPairs.sort((lhs, rhs) => rhs[1] - lhs[1])
                for (let i = 0; i < 4; i++) {
                    let originalScore = tempScoreData.get(resultPairs[i][0]) ?? 0
                    const countingFactor = props.contest.countingPolicy!.countingFactor[index + selectedRounds[0]] ?? 1
                    if (!props.contest.countingPolicy!.pureSeq) {
                        originalScore += resultPairs[i][1]/props.contest.countingPolicy!.rawPointDivider * countingFactor
                    }
                    if (resultPairs[i][1] < 0) {
                        tempScoreData.set(resultPairs[i][0], originalScore + props.contest.countingPolicy!.seqPoint[4] * countingFactor)
                    } else {
                        tempScoreData.set(resultPairs[i][0], originalScore + props.contest.countingPolicy!.seqPoint[i] * countingFactor)
                    }
                }
            })
        })

        let scoreData = new Map<string, number>()

        classData!.filter(datum => +datum["round"] === selectedRounds[1]).forEach( datum => {
            for (let i = 1; i <= 4; i++) {
                if (tempScoreData.get(datum[`tid${i}`]) == null)
                    scoreData.set(datum[`tid${i}`], 0)
                else
                    scoreData.set(datum[`tid${i}`], tempScoreData.get(datum[`tid${i}`])!)
            }
        })

        let dataList = []
        const dflTeams = (await api.get(`DflTeam/${props.contest.dflId}`)).data
        for (let i of scoreData.entries()) {
            dataList.push({
                name: dflTeams[i[0]]["t_name"] as string,
                score: i[1]
            })
        }

        setScoreData(dataList)
        setExecuting(false)
        setExecuted(true)
    }

    const latestRound = () => {
        if (classData == null) return 0;
        return classData.map(x => +(x.round as string)).reduce((x, y) => Math.max(x, y))
    }

    return (
        <Box sx={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            p: 4
        }}>
            {
                props.contest.dflId == null ?
                    <Box sx={{alignSelf: "center"}}>
                        <Card sx={{px: 5, backgroundColor: red[400]}}>
                            <CardContent>
                                <Typography variant={"h6"} sx={{color: "white"}}>不可用</Typography>
                                <Typography sx={{color: grey[400]}}>
                                    排行榜功能需要赛事主办在管理界面绑定大凤林比赛ID后方可使用
                                </Typography>
                            </CardContent>
                        </Card>
                    </Box> :
                    <Box>
                    {
                        classData == null ? <Skeleton variant={"rectangular"} height={100}/> : (
                            <Stack>
                                <Stack direction={"row"} spacing={4} justifyContent={"center"} alignItems={"center"}>
                                    <Typography>轮数选择</Typography>
                                    <Slider
                                        min={1}
                                        max={latestRound()}
                                        value={selectedRounds}
                                        onChange={handleSelectedRoundsChange}
                                        sx={{maxWidth: 300}}
                                        valueLabelDisplay={"auto"}
                                    />
                                    <Typography>
                                        {selectedRounds[0] === selectedRounds[1]? selectedRounds[0] : `${selectedRounds[0]}~${selectedRounds[1]}`}
                                    </Typography>
                                    <LoadingButton variant={"outlined"} onClick={handleExecution} loading={executing}>执 行</LoadingButton>

                                </Stack>
                                <Stack direction={"row"} justifyContent={"center"}>
                                    {!executed && <Fade in>
                                        <Typography variant={"caption"} sx={{color: grey[600]}}>
                                            仅有参与轮数选择中最后一轮比赛的队伍会被统计；此表仅做参考，具体分数由主办公布；由于各比赛半庄数和击飞规则不同，该表<b>暂不统计</b>区间奖励，敬请谅解。
                                        </Typography>
                                    </Fade>}
                                    <Fade in={executed || executing} >
                                        { scoreData != null ?
                                            <RankingListChart scoreData={scoreData} height={scoreData.length / 12 * 500}/> : <Box/>
                                        }
                                    </Fade>
                                </Stack>
                            </Stack>
                        )
                    }
                    </Box>
            }
        </Box>
    )
}