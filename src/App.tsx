import React from 'react';
import './App.css';
import {
    Box,
    Card,
    CardContent,
    Container,
    CssBaseline,
    Stack,
    Toolbar,
    Typography
} from "@mui/material";
import QueLingAppBar from "./Components/QueLingAppBar";
import HoldingContestTable from "./Components/HoldingContestTable";

function App() {
  return (
      <React.Fragment>
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
                  <Stack spacing={5}>
                      <Card>
                          <CardContent>
                              <Typography variant={"h6"}>
                                  进行中的比赛
                              </Typography>
                              <HoldingContestTable state={"holding"}/>
                          </CardContent>
                      </Card>
                      <Card>
                          <CardContent>
                              <Typography variant={"h6"}>
                                  报名中的比赛
                              </Typography>
                              <HoldingContestTable state={"registering"}/>
                          </CardContent>
                      </Card>
                      <Card>
                          <CardContent>
                              <Typography variant={"h6"}>
                                  已经结束的比赛
                              </Typography>
                              <HoldingContestTable state={"end"}/>
                          </CardContent>
                      </Card>
                  </Stack>
              </Container>
          </Box>
      </React.Fragment>
  );
}

export default App;
