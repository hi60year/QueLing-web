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
            </DialogContent>
            <DialogActions sx={{paddingX: "20px", marginTop: "-20px"}}>
                <Button size={"large"} onClick={() => props.onClose()}>关闭</Button>
            </DialogActions>
        </Dialog>
    )
}