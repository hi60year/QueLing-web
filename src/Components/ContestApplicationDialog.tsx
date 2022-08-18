import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from "@mui/material";

export default function ContestApplicationDialog(props: {open: boolean, onClose: () => void}) {
    return (
        <Dialog open={props.open} onClose={props.onClose} maxWidth={"sm"} fullWidth>
            <DialogTitle>
                申请比赛
            </DialogTitle>
            <DialogContent>
                <DialogContentText sx={{marginBottom: "20px"}}>
                请通过QQ联系申请。QQ号：3197173556
                </DialogContentText>
                <img src="https://s1.328888.xyz/2022/07/31/FPcE7.jpg" alt="vk1HDP.jpg" width={"200px"}/>
            </DialogContent>
            <DialogActions sx={{paddingX: "20px", marginTop: "-20px"}}>
                <Button size={"large"} onClick={() => props.onClose()}>关闭</Button>
            </DialogActions>
        </Dialog>
    )
}