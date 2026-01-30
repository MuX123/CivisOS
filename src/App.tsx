import React from 'react'
import { Routes, Route } from 'react-router-dom'
import './assets/styles/variables.css'
import './assets/styles/global.css'

// Import components
import AuthGuard from './components/auth/AuthGuard'
import UserProfile from './components/auth/UserProfile'
import ParkingSystem from './views/Frontstage/ParkingSystem'
import FacilitySystem from './views/Frontstage/FacilitySystem'
import ResidentSystem from './views/Frontstage/ResidentSystem'
import CalendarSystem from './views/Frontstage/CalendarSystem'
import PersistenceDemo from './views/Backstage/PersistenceDemo'
import UnitLayoutManager from './views/Backstage/UnitLayoutManager'
import ColorConfigPanel from './views/Backstage/ColorConfigPanel'
import IoTEventBus from './views/Backstage/IoTEventBus'

function App() {
  return (
    <div className="App">
      <header className="App-header flex justify-between items-center">
        <h1>智慧社區管理系統</h1>
        <UserProfile />
      </header>
      <main className="App-main">
        <Routes>
          <Route path="/" element={<AuthGuard><div>歡迎使用智慧社區管理系統</div></AuthGuard>} />
          <Route path="/parking" element={<AuthGuard><ParkingSystem /></AuthGuard>} />
          <Route path="/facility" element={<AuthGuard><FacilitySystem /></AuthGuard>} />
          <Route path="/resident" element={<AuthGuard><ResidentSystem /></AuthGuard>} />
          <Route path="/calendar" element={<AuthGuard><CalendarSystem /></AuthGuard>} />
          <Route path="/deposit" element={<AuthGuard><div>押金管理系統 - 開發中</div></AuthGuard>} />
          <Route path="/backstage/persistence" element={<AuthGuard><PersistenceDemo /></AuthGuard>} />
          <Route path="/backstage/unit-layout" element={<AuthGuard><UnitLayoutManager /></AuthGuard>} />
          <Route path="/backstage/color-config" element={<AuthGuard><ColorConfigPanel /></AuthGuard>} />
          <Route path="/backstage/iot-bus" element={<AuthGuard><IoTEventBus /></AuthGuard>} />
        </Routes>
      </main>
    </div>
  )
}

export default App