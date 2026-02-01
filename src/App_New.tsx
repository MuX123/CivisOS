import React, { useState } from 'react'
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import './assets/styles/variables.css'
import './assets/styles/global.css'

// Theme context and components
import { ThemeProvider } from './context/ThemeContext'
import ThemeToggle from './components/ui/ThemeToggle'

// Import components
import ParkingSystem from './views/Frontstage/ParkingSystem'
import ScheduleXCalendar from './views/Frontstage/ScheduleXCalendar'
import FacilitySystemV2 from './views/Frontstage/FacilitySystemV2'
import ResidentSystemV2 from './views/Frontstage/ResidentSystemV2'
import DepositSystem from './views/Frontstage/DepositSystem'
import FeeSystem from './views/Frontstage/FeeSystem'
import PersistenceDemo from './views/Backstage/PersistenceDemo'
import UnitLayoutManager from './views/Backstage/UnitLayoutManager'
import ColorConfigPanel from './views/Backstage/ColorConfigPanel'
import BuildingFloorConfig from './views/Backstage/BuildingFloorConfig'

function App() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getLinkClass = (path: string) => {
    const isActive = location.pathname.startsWith(path);
    const baseClass = "flex items-center px-3 py-2 mx-2 rounded mb-1 transition-all duration-200 group text-sm";
    const activeClass = "bg-[rgba(99,102,241,0.15)] text-[var(--brand-experiment)] border-l-2 border-[var(--brand-experiment)]";
    const inactiveClass = "text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-normal)]";

    return `${baseClass} ${isActive ? activeClass : inactiveClass}`;
  };

  return (
    <ThemeProvider>
      <div className="App flex h-screen bg-[var(--bg-tertiary)] font-sans">
        {/* Mobile Header */}
        <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-[var(--bg-secondary)] border-b border-[var(--color-border)] z-50 flex items-center px-4">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="text-[var(--text-normal)] p-2 hover:bg-[var(--bg-hover)] rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="ml-3 text-base font-bold text-[var(--text-normal)] truncate">智慧社區管理系統</h1>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-50 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Mobile Navigation Drawer */}
        <nav
          className={`fixed top-0 left-0 bottom-0 w-64 bg-[var(--bg-secondary)] z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:relative lg:w-64 lg:flex lg:flex-col lg:flex-shrink-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          {/* Mobile Close Button */}
          <div className="lg:hidden h-14 px-4 flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--bg-secondary)]">
            <h1 className="text-base font-bold text-[var(--text-normal)] truncate">智慧社區管理系統</h1>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-[var(--text-muted)] p-2 hover:bg-[var(--bg-hover)] hover:text-[var(--text-normal)] rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Scrollable Nav Items */}
          <div className="flex-1 overflow-y-auto custom-scrollbar py-4">
            {/* Section: 一般功能 */}
            <div className="mb-6">
              <div className="px-4 mb-2 flex items-center justify-between group cursor-default">
                <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">一般功能</h3>
              </div>

              <Link to="/parking" className={getLinkClass('/parking')} onClick={() => setIsMobileMenuOpen(false)}>
                <span className="text-lg leading-none mr-3 text-[var(--text-muted)] group-hover:text-[var(--text-normal)] flex items-center justify-center w-5 h-5">#</span>
                <span>停車管理</span>
              </Link>
              <Link to="/calendar" className={getLinkClass('/calendar')} onClick={() => setIsMobileMenuOpen(false)}>
                <span className="text-lg leading-none mr-3 text-[var(--text-muted)] group-hover:text-[var(--text-normal)] flex items-center justify-center w-5 h-5">#</span>
                <span>行事曆</span>
              </Link>
              <Link to="/facility" className={getLinkClass('/facility')} onClick={() => setIsMobileMenuOpen(false)}>
                <span className="text-lg leading-none mr-3 text-[var(--text-muted)] group-hover:text-[var(--text-normal)] flex items-center justify-center w-5 h-5">#</span>
                <span>公設預約</span>
              </Link>
              <Link to="/resident" className={getLinkClass('/resident')} onClick={() => setIsMobileMenuOpen(false)}>
                <span className="text-lg leading-none mr-3 text-[var(--text-muted)] group-hover:text-[var(--text-normal)] flex items-center justify-center w-5 h-5">#</span>
                <span>住戶管理</span>
              </Link>
              <Link to="/deposit" className={getLinkClass('/deposit')} onClick={() => setIsMobileMenuOpen(false)}>
                <span className="text-lg leading-none mr-3 text-[var(--text-muted)] group-hover:text-[var(--text-normal)] flex items-center justify-center w-5 h-5">#</span>
                <span>寄放管理</span>
              </Link>
              <Link to="/fee" className={getLinkClass('/fee')} onClick={() => setIsMobileMenuOpen(false)}>
                <span className="text-lg leading-none mr-3 text-[var(--text-muted)] group-hover:text-[var(--text-normal)] flex items-center justify-center w-5 h-5">#</span>
                <span>管理費</span>
              </Link>
            </div>

            <div className="mx-4 h-px bg-[var(--color-border)] mb-6"></div>

            {/* Section: 後台設定 */}
            <div className="mb-4">
              <div className="px-4 mb-2 flex items-center justify-between group cursor-default">
                <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">後台設定</h3>
              </div>

              <Link to="/backstage/building" className={getLinkClass('/backstage/building')} onClick={() => setIsMobileMenuOpen(false)}>
                <svg className="w-5 h-5 mr-3 text-[var(--text-muted)] group-hover:text-[var(--text-normal)] flex-shrink-0" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 00-2.572 1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>棟數設定</span>
              </Link>
              <Link to="/backstage/color-config" className={getLinkClass('/backstage/color-config')} onClick={() => setIsMobileMenuOpen(false)}>
                <svg className="w-5 h-5 mr-3 text-[var(--text-muted)] group-hover:text-[var(--text-normal)] flex-shrink-0" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
                <span>顏色設定</span>
              </Link>
            </div>
          </div>
        </nav>

        {/* Main Content Area with Left Sidebar */}
        <main className="App-main flex-1 bg-[var(--bg-primary)] relative overflow-hidden flex lg:pt-0">
          {/* Left Sidebar - Desktop Only */}
          <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-[var(--bg-secondary)] border-r border-[var(--color-border)] transform transition-transform duration-300 ease-in-out absolute lg:relative left-0 top-0 bottom-0 z-40 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}">
            {/* Sidebar Header */}
            <div className="h-14 px-4 flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--bg-secondary)]">
              <h1 className="text-base font-bold text-[var(--text-normal)] truncate">智慧社區管理系統</h1>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="lg:hidden text-[var(--text-muted)] p-2 hover:bg-[var(--bg-hover)] hover:text-[var(--text-normal)] rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Scrollable Nav Items */}
            <div className="flex-1 overflow-y-auto custom-scrollbar py-4">
              {/* Section: 一般功能 */}
              <div className="mb-6">
                <div className="px-4 mb-2 flex items-center justify-between group cursor-default">
                  <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">一般功能</h3>
                </div>

                <Link to="/parking" className={getLinkClass('/parking')} onClick={() => setIsMobileMenuOpen(false)}>
                  <span className="text-lg leading-none mr-3 text-[var(--text-muted)] group-hover:text-[var(--text-normal)] flex items-center justify-center w-5 h-5">#</span>
                  <span>停車管理</span>
                </Link>
                <Link to="/calendar" className={getLinkClass('/calendar')} onClick={() => setIsMobileMenuOpen(false)}>
                  <span className="text-lg leading-none mr-3 text-[var(--text-muted)] group-hover:text-[var(--text-normal)] flex items-center justify-center w-5 h-5">#</span>
                  <span>行事曆</span>
                </Link>
                <Link to="/facility" className={getLinkClass('/facility')} onClick={() => setIsMobileMenuOpen(false)}>
                  <span className="text-lg leading-none mr-3 text-[var(--text-muted)] group-hover:text-[var(--text-normal)] flex items-center justify-center w-5 h-5">#</span>
                  <span>公設預約</span>
                </Link>
                <Link to="/resident" className={getLinkClass('/resident')} onClick={() => setIsMobileMenuOpen(false)}>
                  <span className="text-lg leading-none mr-3 text-[var(--text-muted)] group-hover:text-[var(--text-normal)] flex items-center justify-center w-5 h-5">#</span>
                  <span>住戶管理</span>
                </Link>
                <Link to="/deposit" className={getLinkClass('/deposit')} onClick={() => setIsMobileMenuOpen(false)}>
                  <span className="text-lg leading-none mr-3 text-[var(--text-muted)] group-hover:text-[var(--text-normal)] flex items-center justify-center w-5 h-5">#</span>
                  <span>寄放管理</span>
                </Link>
                <Link to="/fee" className={getLinkClass('/fee')} onClick={() => setIsMobileMenuOpen(false)}>
                  <span className="text-lg leading-none mr-3 text-[var(--text-muted)] group-hover:text-[var(--text-normal)] flex items-center justify-center w-5 h-5">#</span>
                  <span>管理費</span>
                </Link>
              </div>

              <div className="mx-4 h-px bg-[var(--color-border)] mb-6"></div>

              {/* Section: 後台設定 */}
              <div className="mb-4">
                <div className="px-4 mb-2 flex items-center justify-between group cursor-default">
                  <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">後台設定</h3>
                </div>

                <Link to="/backstage/building" className={getLinkClass('/backstage/building')} onClick={() => setIsMobileMenuOpen(false)}>
                  <svg className="w-5 h-5 mr-3 text-[var(--text-muted)] group-hover:text-[var(--text-normal)] flex-shrink-0" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 00-2.572 1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>棟數設定</span>
                </Link>
                <Link to="/backstage/color-config" className={getLinkClass('/backstage/color-config')} onClick={() => setIsMobileMenuOpen(false)}>
                  <svg className="w-5 h-5 mr-3 text-[var(--text-muted)] group-hover:text-[var(--text-normal)] flex-shrink-0" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                  <span>顏色設定</span>
                </Link>
              </div>
            </div>
          </aside>

          {/* Main Content with Left Margin for Sidebar */}
          <div className="flex-1 flex flex-col lg:ml-0">
            {/* Top Bar (Desktop) */}
            <div className="hidden lg:flex h-14 border-b border-[var(--color-border)] items-center px-6 flex-shrink-0 bg-[var(--bg-floating)] shadow-sm z-10 justify-between">
              <div className="flex items-center">
                <span className="text-[var(--text-muted)] mr-3 text-xl font-bold">#</span>
                <h2 className="font-bold text-[var(--text-normal)] text-base">
                  {location.pathname === '/' ? '停車管理' :
                 location.pathname.includes('parking') ? '停車管理' :
                 location.pathname.includes('calendar') ? '行事曆' :
                 location.pathname.includes('facility') ? '公設預約' :
                 location.pathname.includes('resident') ? '住戶管理' :
                 location.pathname.includes('deposit') ? '寄放管理' :
                 location.pathname.includes('fee') ? '管理費' :
                  location.pathname.includes('backstage/building') ? '棟數設定' :
                   location.pathname.includes('backstage/color-config') ? '顏色設定' :
                   '儀表板'}
                </h2>
                <div className="h-6 w-px bg-[var(--color-border)] mx-4"></div>
                <span className="text-[var(--text-muted)] text-sm font-medium truncate">
                  {location.pathname.includes('parking') ? '即時車位狀態監控與管理' : '系統功能'}
                </span>
              </div>
              {/* Theme Toggle Button - Top Right */}
              <div className="flex items-center gap-3">
                <ThemeToggle />
                {/* Sidebar Toggle for Desktop */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="hidden lg:flex items-center justify-center w-8 h-8 bg-[var(--bg-hover)] rounded-lg hover:bg-[var(--bg-active)] transition-colors"
                  title="切換側邊欄"
                >
                  <svg className="w-4 h-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content Scroll Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar lg:p-6 lg:pt-6 p-2 pt-12">
              <Routes>
                <Route path="/" element={<Navigate to="/parking" replace />} />
                <Route path="/calendar" element={<ScheduleXCalendar />} />
                <Route path="/facility" element={<FacilitySystemV2 />} />
                <Route path="/resident" element={<ResidentSystemV2 />} />
                <Route path="/deposit" element={<DepositSystem />} />
                <Route path="/fee" element={<FeeSystem />} />
                <Route path="/backstage/persistence" element={<PersistenceDemo />} />
                <Route path="/backstage/unit-layout" element={<UnitLayoutManager buildingId="" />} />
                <Route path="/backstage/color-config" element={<ColorConfigPanel />} />
                <Route path="/backstage/building" element={<BuildingFloorConfig />} />
              </Routes>
            </div>
          </div>
        </main>
      </div>
    </ThemeProvider>
  )
}

export default App