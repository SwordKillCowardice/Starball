import { useState } from 'react'
import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Login from './pages/login/login.jsx'
import MainMenu from './pages/mainmenu/mainmenu.jsx'
import Game from './pages/game/game.jsx'
import Market from './pages/market/market.jsx'
import UserInfo from './pages/UserInfo/UserInfo.jsx'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/mainmenu" element={<MainMenu />} />
          <Route path="/game" element={<Game />} />
          <Route path="/market" element={<Market />} />
          <Route path="/userInfo" element={<UserInfo />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App;
