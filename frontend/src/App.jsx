import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, FilePlus, List, Search, FileText, Users, Globe } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import keycloak from './auth/keycloak'
import EntryForm from './pages/EntryForm'
import MyEntries from './pages/MyEntries'
import Dashboard from './pages/Dashboard'
import SearchAndFilter from './pages/SearchAndFilter'
import AuditLogs from './pages/AuditLogs'
import UserManagement from './pages/UserManagement'
import cihLogo from './assets/cih-logo.png'
import './App.css'

function Sidebar() {
  const location = useLocation()
  const { t, i18n } = useTranslation()
  
  const navItems = [
    { path: '/', label: t('sidebar.saisie'), icon: <FilePlus size={20} /> },
    { path: '/my-entries', label: t('sidebar.mes_saisies'), icon: <List size={20} /> },
    { path: '/dashboard', label: t('sidebar.dashboard'), icon: <LayoutDashboard size={20} />, roles: ['ROLE_ADMIN', 'ROLE_VIEWER'] },
    { path: '/search', label: t('sidebar.recherche'), icon: <Search size={20} />, roles: ['ROLE_ADMIN', 'ROLE_VIEWER'] },
    { path: '/audit', label: t('sidebar.audit'), icon: <FileText size={20} />, roles: ['ROLE_ADMIN', 'ROLE_VIEWER'] },
    { path: '/users', label: t('sidebar.utilisateurs'), icon: <Users size={20} />, roles: ['ROLE_ADMIN'] },
  ]

  const hasRole = (roles) => {
    if (!roles) return true;
    return roles.some(role => keycloak.hasRealmRole(role));
  }

  const toggleLanguage = () => {
    const newLang = i18n.language === 'fr' ? 'en' : 'fr';
    i18n.changeLanguage(newLang);
  }

  return (
    <div className="sidebar">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1rem' }}>
        <img src={cihLogo} alt="CIH BANK" style={{ width: '120px', marginBottom: '1rem' }} />
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: '500' }}>{t('sidebar.subtitle')}</p>
      </div>
      <div className="sidebar-nav">
        {navItems.filter(item => hasRole(item.roles)).map(item => (
          <Link 
            key={item.path} 
            to={item.path} 
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </div>
      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <button onClick={toggleLanguage} className="btn" style={{ background: 'var(--bg-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', display: 'flex', gap: '0.5rem' }}>
          <Globe size={18} /> {t('sidebar.language')}
        </button>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textAlign: 'center', fontWeight: '500' }}>
          {keycloak.tokenParsed?.preferred_username}
        </div>
        <button onClick={() => keycloak.logout()} className="btn btn-primary" style={{ width: '100%' }}>
          {t('sidebar.logout')}
        </button>
      </div>
    </div>
  )
}

function App() {
  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<EntryForm />} />
            <Route path="/my-entries" element={<MyEntries />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/search" element={<SearchAndFilter />} />
            <Route path="/audit" element={<AuditLogs />} />
            <Route path="/users" element={<UserManagement />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
