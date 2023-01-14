import React, {useEffect, useState} from 'react';
import logo from './logo.svg';
import './App.css';
import axios from 'axios';
import {Box, Paper, Table, TableCell, TableContainer, TableHead, Typography, TypographyVariant} from "@mui/material";
import {blue, grey} from "@mui/material/colors";
import {DataGrid, GridColDef} from "@mui/x-data-grid";


interface IScore {
    mainScore: number
    accumulatedPoints: number
    headPoints: number
    headRawPoints: number
    teamRawPoints: number
}

function TempScoreCounter() {
    const api = axios.create({
        baseURL: "http://101.34.84.77/api"
    });

    const [gameResults, setGameResults] = useState<Map<string, any[]>[]>()
    const [dflClass, setDflClass] = useState<any[]>()
    const [rows, setRows] = useState<any[]>([])
    const sequencePoints = [
        [6, 0, -2, -4],
        [5, 3, -3, -5],
        [4, 2, 0, -6],
        [6, 2, -2, -6],
        [6, 2, -2, -6]
    ] as const
    const mainSequencePoints = [4, 2, 1, 0] as const
    const columns: GridColDef[] = [
        {field: 'ranking', headerName: 'Ranking'},
        {field: 'team', headerName: 'Team', minWidth: 200},
        {field: 'mainScore', headerName: 'Main Score'},
        {field: 'accumulatedPoints', headerName: 'Accumulated Points', minWidth: 170},
        {field: 'headPoints', headerName: 'Points of General', minWidth: 150},
        {field: 'headRawPoints', headerName: 'Raw Points of General', minWidth: 170},
        {field: 'teamRawPoints', headerName: 'Raw Points of Team', minWidth: 170}
    ]
    const teams = {"8277":{"tid":"8277","t_name":"重庆大学","t_player":"番风~\nconstructor\n结果论吃四\n盛世闲王","t_sub":"嘿呀咻\n四喜战神\n璃星落霖\nllllill\n再玩德扑我剁手\n落星lxtf\n四月的阿森纳\n重慶陳奕迅","t_type":"0","img":"https://tuchuangs.com/imgs/2022/09/24/f1ad4dadece73855.jpg","t_ps":""},"8278":{"tid":"8278","t_name":"重庆文理学院队","t_player":"平生欢\n樱花树下的水水\n在哄理查德\n无忧、","t_sub":"18相送\nCrazyTutu","t_type":"0","img":"https://i.ibb.co/hcMxvQd/4fe89149bd671a5b.jpg","t_ps":""},"8279":{"tid":"8279","t_name":"四川外国语大学300/500队","t_player":"阿尔法的雨天\n光睿\n天才少女的烦恼\nleewe","t_sub":"櫻野一叶\n立原冬馬\n1mmortalzR","t_type":"0","img":"https://i.ibb.co/y6p7NK8/QQ-20220922231911.png","t_ps":""},"8280":{"tid":"8280","t_name":"胶衣联盟！！","t_player":"shangyi\n以十六夜咲百夜\n天雀神\n7sssssss","t_sub":"池田之鲤\n呆萌不萌\n乖乖的luna","t_type":"1","img":"https://i.ibb.co/S09VPPq/R-C.jpg","t_ps":"拿着双东风还有dora2不仅没和到甚至被下庄了！"},"8281":{"tid":"8281","t_name":"西南大学黑子的麻将队","t_player":"麻将很奇妙吧\n蓝子\n御无礼送\n代打帮我上魂天","t_sub":"没有wifi\n手牌全是朵拉\nxiyue\nNranphy","t_type":"0","img":"https://i.ibb.co/LNsYSRL/K-YX1-WWP-WH6-K-P0-CURK5-VM.jpg","t_ps":""},"8282":{"tid":"8282","t_name":"重庆理工大学 ReVdol队","t_player":"万古生香\n援气十足美少女\n豆沙包包\nTakamiyaMio","t_sub":"LP4889\n卿未许\nchino蓝陨\n散落漫天回忆\n昆西quincy0v0","t_type":"0","img":"https://i.ibb.co/LYYNyvC/123.jpg","t_ps":"战斗吧歌姬，时刻回应爱！"},"8283":{"tid":"8283","t_name":"西南政法大学 石瓦坡说唱队","t_player":"聪明刀宝铳铳铳\n何盘盘\n海纳百川捏\n神域赤木Akagi","t_sub":"柠啊柠阿柠\n超高能的凉开水\n每天八桶水\n自闭嘤嘤怪","t_type":"1","img":"https://i.ibb.co/nbtmj4v/3-FD99-FEDFF20-C83-AF5-A23446-FB14-A36-A.jpg","t_ps":"再续法专荣光，吾辈义不容辞"},"8284":{"tid":"8284","t_name":"重庆邮电大学 捉鸡队","t_player":"萌新99\n阿休贝尔\n立上淡\n已被寒霜所噬","t_sub":"老仙奶我不赚钱\n雷葑","t_type":"1","img":"https://i.ibb.co/JKx5DW9/Thumb-640591974603-4ad536be-da39-3012-97be-dcbf0.jpg","t_ps":"我们是一支喜欢捉鸡的队伍。"},"8285":{"tid":"8285","t_name":"重庆师范大学 魔法麻将部","t_player":"花山院真泰\n一位dd\n野原新之兔\n衰尾道人swdr","t_sub":"敲豆麻呆\n鱼啊鱼啊鱼お\n壳子君呀\n天オ麻将杳杳","t_type":"0","img":"https://i.ibb.co/wSkLLWJ/QQ-20220922233344.jpg","t_ps":""},"8286":{"tid":"8286","t_name":"工作日龙王队","t_player":"Gecko\n一一二三二一一\n同怜\n莫言请勿语","t_sub":"namelessrice\n加藤惠手心的雪\n秋婷紫樱\n断幺的风笛\n山県透","t_type":"0","img":"https://i.ibb.co/7KT4vg6/QQ-20220921114745.jpg","t_ps":"十四张牌你能飞我？你能秒飞我？！你今天能十四张牌把慈善赌王秒了，K神传说！当！场！就把这个麻将吃掉！"},"8287":{"tid":"8287","t_name":"千夜恶人庄","t_player":"碳碳酱\n自摸欧皇\n狗还是我狗\n赤木我老攻","t_sub":"北风自摸十三郎\n跳跳跳跳跳丶\n小呀咩小面条\n灵乌路音\n白给小神仙\n玄学麻将MAX\n不准乱来","t_type":"1","img":"https://i.ibb.co/pnDS2CK/1656081565926.jpg","t_ps":"千夜集结了重庆本地现代立直麻将的毒瘤，开创全员恶人时代，线上叱咤风云，线下所向披靡。队内主力先锋北风自摸十三郎在重庆麻坛无人闻其名而不丧胆。"},"8288":{"tid":"8288","t_name":"重庆工商大学 啊对对队","t_player":"欲航\n雫霓nani\n云舞花月间\n天才玩家P","t_sub":"啊鸡丶\n夜溟yeming\n万雨魅\n曜的女友\nK神传说_2020","t_type":"0","img":"https://i.ibb.co/khYRTGs/7ad820e2c5213ce.jpg","t_ps":"伸出双手一触即发，东南西北即刻绽放～"}} as const

    useEffect(() => {
        (async () => {
            const _dflClass: any[] = (await api.get("DflClass/141")).data
            setDflClass(_dflClass)
            let _gameResults: Map<string, any[]>[] = []
            const update = async () => {
                _gameResults = []
                for (let round = 1; ; round++) {
                    const roundData = (await api.get(`GameResult/141?round=${round}`)).data
                    if (!roundData || Object.keys(roundData).length === 0) {
                        break
                    } else {
                        _gameResults.push(new Map(Object.entries(roundData)))
                    }
                }
                setGameResults(_gameResults)
                const scoreMap = new Map<string, IScore>()

                for (let round = 1; round <= _gameResults.length; round++) {
                    for (const gameResult of _gameResults[round - 1].entries()) {
                        const teamPoints = [0, 0, 0, 0]
                        const generalPoints = [0, 0, 0, 0]
                        const teamRawPoints = [0, 0, 0, 0]
                        const generalRawPoints = [0, 0, 0, 0]
                        const mainPoints = [0, 0, 0, 0]
                        const rid = gameResult[0]
                        const result = gameResult[1]
                        const thisClass = _dflClass.find(c => +c["rid"] === +rid)!
                        for (let position = 0; position < result.length; position++) {
                            const nums: number[] = []
                            for (let t = 1; t <= 4; t++) {
                                nums.push(+result[position][`num${t}`])
                            }
                            const sortedNum = [...nums]
                            sortedNum.sort((lhs, rhs) => lhs > rhs ? -1 : 1)
                            const positionRankings = []
                            for (let t = 0; t < 4; t++) {
                                positionRankings.push(sortedNum.indexOf(nums[t]))
                                teamPoints[t] += sequencePoints[position][positionRankings[t]]
                                teamRawPoints[t] += nums[t]
                                if (position === 3 || position === 4) {
                                    generalPoints[t] += sequencePoints[position][positionRankings[t]]
                                    generalRawPoints[t] += nums[t]
                                }
                            }
                            if (position === 4) {
                                const mainRanking = [0, 1, 2, 3]
                                mainRanking.sort((lhs, rhs) => {
                                    if (teamPoints[lhs] > teamPoints[rhs]) {
                                        return -1
                                    } else if (teamPoints[lhs] === teamPoints[rhs]) {
                                        if (generalPoints[lhs] > generalPoints[rhs]) {
                                            return -1
                                        } else if (generalPoints[lhs] === generalPoints[rhs]) {
                                            if (generalRawPoints[lhs] > generalRawPoints[rhs]) {
                                                return -1
                                            } else if (generalRawPoints[lhs] === generalRawPoints[rhs]) {
                                                if (teamRawPoints[lhs] > teamRawPoints[rhs]) {
                                                    return -1
                                                }
                                            }
                                        }
                                    }
                                    return 1
                                })
                                for (let t = 0; t < 4; t++) {
                                    mainPoints[mainRanking[t]] += mainSequencePoints[t]
                                }
                            }
                        }
                        for (let t = 0; t < 4; t++) {
                            let roundScore: IScore = {
                                mainScore: mainPoints[t],
                                accumulatedPoints: teamPoints[t],
                                headPoints: generalPoints[t],
                                headRawPoints: generalRawPoints[t],
                                teamRawPoints: teamRawPoints[t]
                            }
                            const oldScore = scoreMap.get(thisClass[`tid${t+1}`])
                            if (!oldScore) {
                                scoreMap.set(thisClass[`tid${t+1}`], roundScore)
                            } else {
                                let newScore: IScore = {
                                    mainScore: roundScore.mainScore + oldScore.mainScore,
                                    accumulatedPoints: roundScore.accumulatedPoints + oldScore.accumulatedPoints,
                                    headPoints: roundScore.headPoints + oldScore.headPoints,
                                    headRawPoints: roundScore.headRawPoints + oldScore.headRawPoints,
                                    teamRawPoints: roundScore.teamRawPoints + oldScore.teamRawPoints
                                }
                                scoreMap.set(thisClass[`tid${t+1}`], newScore)
                            }
                        }
                    }
                }
                let _rows = []
                const entries = Array.from(scoreMap.entries())
                entries.sort((lhs, rhs) => {
                    if (lhs[1].mainScore > rhs[1].mainScore) {
                        return -1
                    } else if (lhs[1].mainScore === rhs[1].mainScore) {
                        if (lhs[1].accumulatedPoints > rhs[1].accumulatedPoints) {
                            return -1
                        } else if (lhs[1].accumulatedPoints === rhs[1].accumulatedPoints) {
                            if (lhs[1].headPoints > rhs[1].headPoints) {
                                return -1
                            } else if (lhs[1].headPoints === rhs[1].headPoints) {
                                if (lhs[1].headRawPoints > rhs[1].headRawPoints) {
                                    return -1
                                } else if (lhs[1].headRawPoints === rhs[1].headPoints) {
                                    if (lhs[1].teamRawPoints > rhs[1].teamRawPoints){
                                        return -1
                                    }
                                }
                            }
                        }
                    }
                    return 1
                })
                for (let i = 0; i < entries.length; i++) {
                    const score = scoreMap.get(entries[i][0])!
                    _rows.push({
                        ranking: i + 1,
                        team: ((teams as any)[entries[i][0]])["t_name"] as string,
                        id: i,
                        mainScore: score.mainScore,
                        accumulatedPoints: score.accumulatedPoints,
                        headPoints: score.headPoints,
                        headRawPoints: score.headRawPoints,
                        teamRawPoints: score.teamRawPoints
                    })
                }
                setRows([..._rows])
            }
            await update()
            setInterval(update, 60000)
        })()
    }, [])
    return (
        <Box sx={{height: '100vh', backgroundColor: grey[300]}}>
            <Box sx={{p: 3, width: "100%", display: 'flex', justifyContent: 'center'}}>
                <Paper sx={{maxWidth: 1200, flexGrow: 1, p: 2, display: 'flex', flexDirection: 'column'}}>
                    <Typography variant={"h5"} color={blue[500]}>
                        Score Table
                    </Typography>
                    <Box sx={{height: '80vh'}}>
                        <DataGrid columns={columns} rows={rows}/>
                    </Box>
                </Paper>
            </Box>
        </Box>
    );
}

export default TempScoreCounter;
