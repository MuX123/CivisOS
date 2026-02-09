import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import { useAppDispatch } from './store/hooks'
import { initializeTheme } from './store/modules/config'
import './assets/styles/variables.css'
import './assets/styles/global.css'

// Theme context and components
import { ThemeProvider } from './context/ThemeContext'
import ThemeToggle from './components/ui/ThemeToggle'

// Import components
import ParkingSystem from './views/Frontstage/ParkingSystem'
import CalendarSystemIntegrated from './views/Frontstage/CalendarSystemIntegrated'
import FacilitySystem from './views/Backstage/FacilitySystem' // Replaced FacilitySystemV2 with new one
import ResidentSystem from './views/Backstage/ResidentSystem' // Replaced ResidentSystemV2 with new one
import DepositSystemV2 from './views/Frontstage/DepositSystemV2'
import FeeSystem from './views/Frontstage/FeeSystem'
import FeeSettings from './views/Backstage/FeeSettings'
import PersistenceDemo from './views/Backstage/PersistenceDemo'
import UnitLayoutManager from './views/Backstage/UnitLayoutManager'
import ColorConfigPanel from './views/Backstage/ColorConfigPanel'
import BuildingFloorConfig from './views/Backstage/BuildingFloorConfig'
import ParkingSpaceSettings from './views/Backstage/ParkingSpaceSettings'
import DataSync from './views/Backstage/DataSync'
import IntroductionSettings from './views/Backstage/IntroductionSettings'
import CalendarSettings from './views/Backstage/CalendarSettings'
import FacilitySettings from './views/Backstage/FacilitySettings'
import SystemFunctions from './views/Backstage/SystemFunctions' // Replaced StressTest
import IntroductionButton from './components/ui/IntroductionButton'

function App() {
  const location = useLocation();
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(initializeTheme());

    // 檢查是否有還原後的重整標記
    const shouldRestore = localStorage.getItem('force_reload_restore');
    if (shouldRestore) {
      localStorage.removeItem('force_reload_restore');
      // 可以在這裡顯示提示訊息，例如 toast
      console.log('App restored from backup');
    }
  }, [dispatch]);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // 預設展開側邊欄
  const [isHovering, setIsHovering] = useState(false);

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

        {/* Sidebar Hover Trigger - Desktop Only */}
        <div 
          className="hidden lg:block fixed left-0 top-0 bottom-0 w-1 z-30"
          onMouseEnter={() => setIsHovering(true)}
        />

        {/* Navigation Drawer - Mobile + Desktop Slide-out */}
        <nav
          className={`fixed top-0 left-0 bottom-0 w-64 bg-[var(--bg-secondary)] z-50 transform transition-all duration-300 ease-in-out lg:relative lg:w-64 lg:flex lg:flex-col lg:flex-shrink-0 ${isMobileMenuOpen || isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:-ml-64'}`}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
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

          {/* Server Header (Desktop) */}
          <div className="hidden lg:flex h-14 px-4 items-center justify-between shadow-sm border-b border-[var(--color-border)] bg-[var(--bg-secondary)]">
            <h1 className="text-base font-bold text-[var(--text-normal)] truncate">智慧社區管理系統</h1>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="text-[var(--text-muted)] p-1.5 hover:bg-[var(--bg-hover)] hover:text-[var(--text-normal)] rounded-lg transition-colors"
              title="關閉選單"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
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
                <svg className="w-5 h-5 mr-3 text-[var(--text-muted)] group-hover:text-[var(--text-normal)] flex-shrink-0" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span>車位系統</span>
              </Link>
              <Link to="/calendar" className={getLinkClass('/calendar')} onClick={() => setIsMobileMenuOpen(false)}>
                <svg className="w-5 h-5 mr-3 text-[var(--text-muted)] group-hover:text-[var(--text-normal)] flex-shrink-0" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>行事曆系統</span>
              </Link>
              <Link to="/facility" className={getLinkClass('/facility')} onClick={() => setIsMobileMenuOpen(false)}>
                <svg className="w-5 h-5 mr-3 text-[var(--text-muted)] group-hover:text-[var(--text-normal)] flex-shrink-0" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span>公設系統</span>
              </Link>
              <Link to="/resident" className={getLinkClass('/resident')} onClick={() => setIsMobileMenuOpen(false)}>
                <svg className="w-5 h-5 mr-3 text-[var(--text-muted)] group-hover:text-[var(--text-normal)] flex-shrink-0" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>住戶系統</span>
              </Link>
              <Link to="/deposit" className={getLinkClass('/deposit')} onClick={() => setIsMobileMenuOpen(false)}>
                <svg className="w-5 h-5 mr-3 text-[var(--text-muted)] group-hover:text-[var(--text-normal)] flex-shrink-0" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                <span>寄放系統</span>
              </Link>
              <Link to="/fee" className={getLinkClass('/fee')} onClick={() => setIsMobileMenuOpen(false)}>
                <svg className="w-5 h-5 mr-3 text-[var(--text-muted)] group-hover:text-[var(--text-normal)] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span>管理費系統</span>
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>棟數設定</span>
              </Link>
              <Link to="/backstage/parking-settings" className={getLinkClass('/backstage/parking-settings')} onClick={() => setIsMobileMenuOpen(false)}>
                <svg className="w-5 h-5 mr-3 text-[var(--text-muted)] group-hover:text-[var(--text-normal)] flex-shrink-0" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span>車位設定</span>
              </Link>
              <Link to="/backstage/data-sync" className={getLinkClass('/backstage/data-sync')} onClick={() => setIsMobileMenuOpen(false)}>
                <svg className="w-5 h-5 mr-3 text-[var(--text-muted)] group-hover:text-[var(--text-normal)] flex-shrink-0" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                </svg>
                <span>資料同步</span>
              </Link>
              <Link to="/backstage/fee-settings" className={getLinkClass('/backstage/fee-settings')} onClick={() => setIsMobileMenuOpen(false)}>
                <svg className="w-5 h-5 mr-3 text-[var(--text-muted)] group-hover:text-[var(--text-normal)] flex-shrink-0" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span>管理費設定</span>
              </Link>
              <Link to="/backstage/calendar-settings" className={getLinkClass('/backstage/calendar-settings')} onClick={() => setIsMobileMenuOpen(false)}>
                <svg className="w-5 h-5 mr-3 text-[var(--text-muted)] group-hover:text-[var(--text-normal)] flex-shrink-0" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>行事曆設定</span>
              </Link>
              <Link to="/backstage/facility-settings" className={getLinkClass('/backstage/facility-settings')} onClick={() => setIsMobileMenuOpen(false)}>
                <svg className="w-5 h-5 mr-3 text-[var(--text-muted)] group-hover:text-[var(--text-normal)] flex-shrink-0" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span>公設設定</span>
              </Link>
              <Link to="/backstage/color-config" className={getLinkClass('/backstage/color-config')} onClick={() => setIsMobileMenuOpen(false)}>
                <svg className="w-5 h-5 mr-3 text-[var(--text-muted)] group-hover:text-[var(--text-normal)] flex-shrink-0" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
                <span>顏色設定</span>
              </Link>
              <Link to="/backstage/introduction" className={getLinkClass('/backstage/introduction')} onClick={() => setIsMobileMenuOpen(false)}>
                <svg className="w-5 h-5 mr-3 text-[var(--text-muted)] group-hover:text-[var(--text-normal)] flex-shrink-0" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>介紹設定</span>
              </Link>
              <Link to="/backstage/system-functions" className={getLinkClass('/backstage/system-functions')} onClick={() => setIsMobileMenuOpen(false)}>
                <svg className="w-5 h-5 mr-3 text-[var(--text-muted)] group-hover:text-[var(--text-normal)] flex-shrink-0" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>系統功能</span>
              </Link>
            </div>
          </div>
        </nav>

        {/* Sidebar Toggle Button - Desktop (when closed) */}
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="hidden lg:flex fixed left-0 top-1/2 -translate-y-1/2 z-40 bg-[var(--bg-secondary)] border border-[var(--color-border)] border-l-0 rounded-r-lg p-2 shadow-md hover:bg-[var(--bg-hover)] transition-colors"
            title="展開選單"
          >
            <svg className="w-5 h-5 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {/* Sidebar Toggle Button - Desktop (fixed top-left) */}
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="hidden lg:flex fixed left-4 top-4 z-40 bg-[var(--bg-secondary)] border border-[var(--color-border)] rounded-lg p-2 shadow-md hover:bg-[var(--bg-hover)] transition-colors"
            title="展開選單"
          >
            <svg className="w-5 h-5 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}

        {/* Main Content Area with Left Sidebar */}
        <main className="App-main flex-1 bg-[var(--bg-primary)] relative overflow-hidden flex lg:pt-0">
          {/* Main Content */}
          <div className="flex-1 flex flex-col lg:ml-0">
            {/* Top Bar (Desktop) */}
            <div className="hidden lg:flex h-14 border-b border-[var(--color-border)] items-center px-6 flex-shrink-0 bg-[var(--bg-floating)] shadow-sm z-10 justify-between">
              <div className="flex items-center">
                <span className="text-[var(--text-muted)] mr-3">
                  {/* Icon based on current route */}
                  {location.pathname === '/' || location.pathname === '/parking' || location.pathname.includes('backstage/parking-settings') ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  ) : location.pathname.includes('calendar') ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  ) : location.pathname.includes('facility') ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  ) : location.pathname.includes('resident') ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  ) : location.pathname.includes('deposit') ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  ) : location.pathname === '/fee' || location.pathname.includes('backstage/fee-settings') ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  ) : location.pathname.includes('backstage/building') ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  ) : location.pathname.includes('backstage/data-sync') ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                    </svg>
                  ) : location.pathname.includes('backstage/color-config') ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                  ) : location.pathname.includes('backstage/introduction') ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : location.pathname.includes('backstage/system-functions') ? (
                     <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                     </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  )}
                </span>
                <h2 className="font-bold text-[var(--text-normal)] text-base">
                  {location.pathname === '/' ? '車位系統' :
                  location.pathname === '/parking' ? '車位系統' :
                  location.pathname.includes('calendar') ? '行事曆系統' :
                  location.pathname.includes('facility') ? '公設系統' :
                  location.pathname.includes('resident') ? '住戶系統' :
                  location.pathname.includes('deposit') ? '寄放系統' :
                  location.pathname === '/fee' ? '管理費系統' :
                  location.pathname.includes('backstage/building') ? '棟數設定' :
                  location.pathname.includes('backstage/parking-settings') ? '車位設定' :
                  location.pathname.includes('backstage/fee-settings') ? '管理費設定' :
                   location.pathname.includes('backstage/calendar-settings') ? '行事曆設定' :
                   location.pathname.includes('backstage/facility-settings') ? '公設設定' :
                   location.pathname.includes('backstage/data-sync') ? '資料同步' :
                  location.pathname.includes('backstage/color-config') ? '顏色設定' :
                  location.pathname.includes('backstage/introduction') ? '介紹設定' :
                  location.pathname.includes('backstage/system-functions') ? '系統功能' :
                  '儀表板'}
                </h2>
              </div>
              {/* Theme Toggle Button - Top Right */}
              <div className="flex items-center gap-3">
                <ThemeToggle />
              </div>
            </div>

            {/* Content Scroll Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar lg:p-6 lg:pt-6 p-2 pt-12">
              <Routes>
                <Route path="/" element={<Navigate to="/parking" replace />} />
                <Route path="/parking" element={<ParkingSystem />} />
                <Route path="/calendar" element={<CalendarSystemIntegrated />} />
                <Route path="/facility" element={<FacilitySystem />} />
                <Route path="/resident" element={<ResidentSystem />} />
                <Route path="/deposit" element={<DepositSystemV2 />} />
                <Route path="/fee" element={<FeeSystem />} />
                <Route path="/backstage/persistence" element={<PersistenceDemo />} />
                <Route path="/backstage/unit-layout" element={<UnitLayoutManager buildingId="" />} />
                <Route path="/backstage/color-config" element={<ColorConfigPanel />} />
                <Route path="/backstage/building" element={<BuildingFloorConfig />} />
                <Route path="/backstage/parking-settings" element={<ParkingSpaceSettings />} />
                <Route path="/backstage/data-sync" element={<DataSync />} />
                <Route path="/backstage/fee-settings" element={<FeeSettings />} />
            <Route path="/backstage/calendar-settings" element={<CalendarSettings />} />
            <Route path="/backstage/facility-settings" element={<FacilitySettings />} />
            <Route path="/backstage/introduction" element={<IntroductionSettings />} />
            <Route path="/backstage/system-functions" element={<SystemFunctions />} />
              </Routes>
            </div>
          </div>
        </main>
      </div>
    </ThemeProvider>
  )
}

export default App
