import React, { useState } from 'react'
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import './assets/styles/variables.css'
import './assets/styles/global.css'

// Import components
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
import BuildingFloorConfig from './views/Backstage/BuildingFloorConfig'

function App() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Helper to determine active state style
  const getLinkClass = (path: string) => {
    const isActive = location.pathname.startsWith(path);
    const baseClass = "flex items-center px-1.5 py-0.5 mx-0.5 rounded mb-0.5 transition-colors duration-200 group text-xs";
    const activeClass = "bg-[rgba(79,84,92,0.6)] text-white";
    const inactiveClass = "text-[#96989d] hover:bg-[rgba(79,84,92,0.4)] hover:text-[#dcddde]";

    return `${baseClass} ${isActive ? activeClass : inactiveClass}`;
  };

  return (
    <div className="App flex h-screen bg-[#202225] font-sans">
      {/* Mobile Header with Hamburger */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-11 bg-[#2f3136] border-b border-[#202225] z-50 flex items-center px-3">
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="text-white p-1 hover:bg-[rgba(255,255,255,0.1)] rounded"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="ml-2 text-xs font-bold text-white truncate">智慧社區</h1>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Navigation Drawer */}
      <nav
        className={`fixed top-0 left-0 bottom-0 w-64 bg-[#2f3136] z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:relative lg:w-64 lg:flex lg:flex-col lg:flex-shrink-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Mobile Close Button */}
        <div className="lg:hidden h-12 px-4 flex items-center justify-between border-b border-[#202225]">
          <h1 className="text-base font-bold text-white truncate">智慧社區管理系統</h1>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-white p-1 hover:bg-[rgba(255,255,255,0.1)] rounded"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Server Header (Desktop) */}
        <div className="hidden lg:flex h-12 px-4 items-center justify-between shadow-sm border-b border-[#202225] hover:bg-[#34373c] cursor-pointer transition-colors">
          <h1 className="text-sm font-bold text-white truncate">智慧社區管理系統</h1>
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Scrollable Nav Items */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* Section: 一般功能 */}
          <div className="py-3">
            <div className="px-2 mb-1 flex items-center justify-between group cursor-default">
              <h3 className="text-xs font-bold text-[#8e9297] uppercase hover:text-[#dcddde] transition-colors">一般功能</h3>
            </div>

            <Link to="/parking" className={getLinkClass('/parking')} onClick={() => setIsMobileMenuOpen(false)}>
              <span className="text-base leading-none mr-1 text-[#8e9297] group-hover:text-[#dcddde] flex items-center justify-center w-4 h-4">#</span>
              <span>停車管理</span>
            </Link>
            <Link to="/calendar" className={getLinkClass('/calendar')} onClick={() => setIsMobileMenuOpen(false)}>
              <span className="text-base leading-none mr-1 text-[#8e9297] group-hover:text-[#dcddde] flex items-center justify-center w-4 h-4">#</span>
              <span>行事曆</span>
            </Link>
            <Link to="/facility" className={getLinkClass('/facility')} onClick={() => setIsMobileMenuOpen(false)}>
              <span className="text-base leading-none mr-1 text-[#8e9297] group-hover:text-[#dcddde] flex items-center justify-center w-4 h-4">#</span>
              <span>公設預約</span>
            </Link>
            <Link to="/resident" className={getLinkClass('/resident')} onClick={() => setIsMobileMenuOpen(false)}>
              <span className="text-base leading-none mr-1 text-[#8e9297] group-hover:text-[#dcddde] flex items-center justify-center w-4 h-4">#</span>
              <span>住戶管理</span>
            </Link>
            <Link to="/deposit" className={getLinkClass('/deposit')} onClick={() => setIsMobileMenuOpen(false)}>
              <span className="text-base leading-none mr-1 text-[#8e9297] group-hover:text-[#dcddde] flex items-center justify-center w-4 h-4">#</span>
              <span>寄放管理</span>
            </Link>
            <Link to="/fee" className={getLinkClass('/fee')} onClick={() => setIsMobileMenuOpen(false)}>
              <span className="text-base leading-none mr-1 text-[#8e9297] group-hover:text-[#dcddde] flex items-center justify-center w-4 h-4">#</span>
              <span>管理費</span>
            </Link>
          </div>

          <div className="w-full h-[1px] bg-[rgba(79,84,92,0.48)] my-2 mx-2"></div>

          {/* Section: 後台設定 */}
          <div className="mb-4">
            <div className="px-2 mb-1 flex items-center justify-between group cursor-default">
              <h3 className="text-xs font-bold text-[#8e9297] uppercase hover:text-[#dcddde] transition-colors">後台設定</h3>
            </div>

            <Link to="/backstage/building" className={getLinkClass('/backstage/building')} onClick={() => setIsMobileMenuOpen(false)}>
              <svg className="w-3.5 h-3.5 mr-1 text-[#8e9297] group-hover:text-[#dcddde]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>棟數設定</span>
            </Link>
            <Link to="/backstage/color-config" className={getLinkClass('/backstage/color-config')} onClick={() => setIsMobileMenuOpen(false)}>
              <svg className="w-3.5 h-3.5 mr-1 text-[#8e9297] group-hover:text-[#dcddde]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
              <span>顏色設定</span>
            </Link>
            <Link to="/backstage/iot-bus" className={getLinkClass('/backstage/iot-bus')} onClick={() => setIsMobileMenuOpen(false)}>
              <svg className="w-3.5 h-3.5 mr-1 text-[#8e9297] group-hover:text-[#dcddde]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
              <span>IoT監控</span>
            </Link>
            <Link to="/backstage/iot-bus" className={getLinkClass('/backstage/iot-bus')} onClick={() => setIsMobileMenuOpen(false)}>
              <svg className="w-3.5 h-3.5 mr-1 text-[#8e9297] group-hover:text-[#dcddde]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6H3m18-6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
              <span>IoT監控</span>
            </Link>
            <Link to="/backstage/color-config" className={getLinkClass('/backstage/color-config')} onClick={() => setIsMobileMenuOpen(false)}>
              <svg className="w-4 h-4 mr-1.5 text-[#8e9297] group-hover:text-[#dcddde]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
              <span className="font-medium">顏色設定</span>
            </Link>
            <Link to="/backstage/iot-bus" className={getLinkClass('/backstage/iot-bus')} onClick={() => setIsMobileMenuOpen(false)}>
              <svg className="w-4 h-4 mr-1.5 text-[#8e9297] group-hover:text-[#dcddde]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
              <span className="font-medium">IoT監控</span>
            </Link>
          </div>
        </div>

        {/* User Profile Footer */}
        <div className="bg-[#292b2f] p-2 flex items-center justify-between">
          <UserProfile />
          <div className="flex space-x-2">
             <button className="text-[#b9bbbe] hover:bg-[#36393f] p-1 rounded hover:text-[#dcddde]">
                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                 </svg>
             </button>
             <button className="text-[#b9bbbe] hover:bg-[#36393f] p-1 rounded hover:text-[#dcddde]">
                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                 </svg>
             </button>
             <button className="text-[#b9bbbe] hover:bg-[#36393f] p-1 rounded hover:text-[#dcddde]">
                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                 </svg>
             </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="App-main flex-1 bg-[#36393f] relative overflow-hidden flex flex-col lg:pt-0">
        {/* Top Bar (Desktop) */}
        <div className="hidden lg:flex h-12 border-b border-[#202225] items-center px-4 flex-shrink-0 bg-[#36393f] shadow-sm z-10">
            <span className="text-[#72767d] mr-2 text-xl">#</span>
            <h2 className="font-bold text-white text-sm">
                {location.pathname === '/' ? '停車管理' :
                 location.pathname.includes('parking') ? '停車管理' :
                 location.pathname.includes('calendar') ? '行事曆' :
                 location.pathname.includes('facility') ? '公設預約' :
                 location.pathname.includes('resident') ? '住戶管理' :
                 location.pathname.includes('deposit') ? '寄放管理' :
                 location.pathname.includes('fee') ? '管理費' :
                 location.pathname.includes('backstage/building') ? '棟數設定' :
                 location.pathname.includes('backstage/color-config') ? '顏色設定' :
                 location.pathname.includes('backstage/iot-bus') ? 'IoT監控' :
                 '儀表板'}
            </h2>
            <div className="h-6 w-[1px] bg-[#42454a] mx-4"></div>
            <span className="text-[#b9bbbe] text-xs font-medium truncate">
                {location.pathname.includes('parking') ? '即時車位狀態監控與管理' : '系統功能'}
            </span>
         </div>

        {/* Content Scroll Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar lg:p-6 lg:pt-6 p-2 pt-12">
            <Routes>
            <Route path="/" element={<Navigate to="/parking" replace />} />
            <Route path="/parking" element={<ParkingSystem />} />
            <Route path="/calendar" element={<CalendarSystem />} />
            <Route path="/facility" element={<FacilitySystemV2 />} />
            <Route path="/resident" element={<ResidentSystemV2 />} />
            <Route path="/deposit" element={<DepositSystem />} />
            <Route path="/fee" element={<FeeSystem />} />
            
            <Route path="/backstage/persistence" element={<PersistenceDemo />} />
            <Route path="/backstage/unit-layout" element={<UnitLayoutManager buildingId="" />} />
            <Route path="/backstage/color-config" element={<ColorConfigPanel />} />
            <Route path="/backstage/iot-bus" element={<IoTEventBus />} />
            <Route path="/backstage/building" element={<BuildingFloorConfig />} />
            </Routes>
        </div>
      </main>
    </div>
  )
}

export default App