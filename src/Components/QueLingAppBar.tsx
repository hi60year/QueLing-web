import {AppBar, Box, Button, Toolbar, Typography, useMediaQuery, useTheme} from "@mui/material";
import {blue, blueGrey, grey} from "@mui/material/colors";
import ContestApplicationDialog from "./ContestApplicationDialog";
import {useState} from "react";
import {useNavigate} from "react-router-dom";

export default function QueLingAppBar() {

    const theme = useTheme();
    const isSmall = useMediaQuery(theme.breakpoints.down("sm"));
    const [applyContest, setApplyContest] = useState(false);
    const nav = useNavigate()

    return (
        <AppBar sx={{backgroundColor: blueGrey[50]}}>
            <Toolbar>
                <Typography variant={"h6"} component={"div"} sx={{
                    letterSpacing: 3,
                    color: grey[800],
                    marginLeft: isSmall ? "10px" : "50px",
                    cursor: "pointer"
                }}
                    onClick={() => nav("/")}
                >
                    雀 岭
                </Typography>
                {!isSmall && <Typography variant={"subtitle1"} component={"div"} sx={{
                    letterSpacing: 3,
                    color: grey[500],
                    marginLeft: "40px"
                }}>
                    立直麻将团体管理平台
                </Typography>}
                <Box sx={{flexGrow: 1}}/>
                <Button sx={{
                    color: blue[300],
                    marginRight: "5px",
                    letterSpacing: 2,
                }}
                        size={"large"}
                        onClick={() => setApplyContest(true)}
                >
                    申请比赛
                </Button>
                <Button sx={{
                    color: "pink",
                    marginRight: "20px",
                    letterSpacing: 2
                }} size={"large"}>
                    赞助
                </Button>
            </Toolbar>
            <ContestApplicationDialog open={applyContest} onClose={() => setApplyContest(false)}/>
        </AppBar>
    )
}