import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Users, AlertTriangle, ShieldCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import keycloak from '../auth/keycloak'

function Dashboard() {
  const { t } = useTranslation()
  const [stats, setStats] = useState({
    activeRestrictions: 0,
    protectedAccounts: 0,
    activeUsers: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('http://localhost:8081/api/dashboard/stats', {
          headers: { Authorization: `Bearer ${keycloak.token}` }
        })
        setStats(res.data)
      } catch (err) {
        console.error("Failed to load stats", err)
      }
    }
    fetchStats()
  }, [])

  return (
    <div>
      <h2 style={{ marginBottom: '2rem', color: 'var(--text-primary)' }}>{t('dashboard.title')}</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(28, 164, 221, 0.1)', borderRadius: '12px', color: 'var(--primary-color)' }}>
            <AlertTriangle size={28} />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: '500' }}>{t('dashboard.active_restrictions')}</p>
            <h3 style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--text-primary)' }}>{stats.activeRestrictions}</h3>
          </div>
        </div>
        
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(0, 200, 83, 0.1)', borderRadius: '12px', color: 'var(--success-color)' }}>
            <ShieldCheck size={28} />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: '500' }}>{t('dashboard.protected_accounts')}</p>
            <h3 style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--text-primary)' }}>{stats.protectedAccounts}</h3>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(241, 94, 37, 0.1)', borderRadius: '12px', color: 'var(--accent-color)' }}>
            <Users size={28} />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: '500' }}>{t('dashboard.active_users')}</p>
            <h3 style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--text-primary)' }}>{stats.activeUsers}</h3>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
