import { useState } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home'
import GameWorkspace from './pages/GameWorkspace';

function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/game" element={<GameWorkspace />} />
      </Routes>
    </>
  )
}

export default App