import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import './assets/styles/variables.css'
import './assets/styles/global.css'

// Import components
import AuthGuard from './components/auth/AuthGuard'
import UserProfile from './components/auth/UserProfile'
import ParkingSystem from './views/Frontstage/ParkingSystem'
// 區塊二：新版系統
import CalendarSystem from './views/Frontstage/CalendarSystem'
import FacilitySystemV2 from './views/Frontstage/FacilitySystemV2'
import ResidentSystemV2 from './views/Frontstage/ResidentSystemV2'
import DepositSystem from './views/Frontstage/DepositSystem'
import FeeSystem from './views/Frontstage/FeeSystem'
// 原有系統（保留）
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
          <Route path="/" element={
            <AuthGuard>
              <Navigate to="/parking" replace />
            </AuthGuard>
          } />
          <Route path="/parking" element={<AuthGuard><ParkingSystem /></AuthGuard>} />
          <Route path="/calendar" element={<AuthGuard><CalendarSystem /></AuthGuard>} />
          <Route path="/facility" element={<AuthGuard><FacilitySystemV2 /></AuthGuard>} />
          <Route path="/resident" element={<AuthGuard><ResidentSystemV2 /></AuthGuard>} />
          <Route path="/deposit" element={<AuthGuard><DepositSystem /></AuthGuard>} />
          <Route path="/fee" element={<AuthGuard><FeeSystem /></AuthGuard>} />
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