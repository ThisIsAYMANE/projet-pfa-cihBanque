import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom'
import { LayoutDashboard, FilePlus, FileText, Users, Globe } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import keycloak from './auth/keycloak'
import Dashboard from './pages/Dashboard'
import AuditLogs from './pages/AuditLogs'
import UserManagement from './pages/UserManagement'
import RiskThirdPartyForm from './pages/RiskThirdPartyForm'
import RiskThirdPartyList from './pages/RiskThirdPartyList'
import cihLogo from './assets/cih-logo.png'
import './App.css'

function Sidebar() {
  const location = useLocation()
  const { t, i18n } = useTranslation()
  
  const navItems = [
    { path: '/dashboard', label: t('sidebar.dashboard'), icon: <LayoutDashboard size={20} /> },
    { path: '/ind-list', label: t('sidebar.ind_list'), icon: <FileText size={20} /> },
    { path: '/ind-form', label: t('sidebar.ind_form'), icon: <FilePlus size={20} />, roles: ['ROLE_ADMIN', 'ROLE_IG', 'ROLE_CONFORMITE_SF', 'ROLE_CONFORMITE_PF', 'ROLE_JURIDIQUE'] },
    { path: '/audit', label: t('sidebar.audit'), icon: <FileText size={20} /> },
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
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: '500' }}>Tiers à Risques (IND)</p>
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
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/audit" element={<AuditLogs />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/ind-form" element={<RiskThirdPartyForm />} />
            <Route path="/ind-form/:id" element={<RiskThirdPartyForm />} />
            <Route path="/ind-list" element={<RiskThirdPartyList />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
