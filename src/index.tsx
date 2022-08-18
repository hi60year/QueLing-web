import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {SnackbarProvider} from "notistack";
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import ContestPanel from './ContestPanel';
import Registration from "./Registration";
import ContestManagement from "./ContestManagement";

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
      <SnackbarProvider>
        <BrowserRouter>
            <Routes>
                <Route path={"/"} element={<App />} />
                <Route path={"/contests/:contestId"} element={<ContestPanel/>} />
                <Route path={"/contests/:contestId/register"} element={<Registration/>} />
                <Route path={"/contests/:contestId/team/:teamId/management"} element={<Registration />} />
                <Route path={"/contests/:contestId/management"} element={<ContestManagement/>} />
            </Routes>
        </BrowserRouter>
      </SnackbarProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
