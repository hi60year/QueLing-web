import React, {useEffect} from 'react';
import logo from './logo.svg';
import './App.css';
import {TeamTable} from "./Components/TeamTable";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <TeamTable teamMessage={{
            id: 1,
            name: "Chongqing University",
            state: "editing",
            members: [
                {
                    name: "皮卡丘",
                    majSoulUid: 44325904,
                    majSoulRank: 10502,
                    majSoulName: "盛世闲王",
                    qqNum: "1010417465"
                },
                {
                    name: "条形码",
                    majSoulName: "llllill",
                    majSoulRank: 10402,
                    qqNum: "1330383643",
                    majSoulUid: 27499403,
                    tenhouRank: "4 Dan",
                    tenhouName: "ホルスゼラ"
                },
                {
                    name: "夜曲",
                    majSoulUid: 50323743,
                    majSoulRank: 10203,
                    majSoulName: "再玩德扑我剁手",
                    qqNum: "464954492",
                },
                {
                    name: "萝卜",
                    majSoulName: "嘿呀咻",
                    majSoulUid: 18232734,
                    majSoulRank: 10402,
                    qqNum: "1925797701"
                },
                {
                    name: "幻梦岚",
                    majSoulUid: 59496075,
                    majSoulRank: 10401,
                    majSoulName: "幻梦岚",
                    qqNum: "1438819534"
                },
            ]
        }}
        canToggleToSmall/>
      </header>
    </div>
  );
}

export default App;
