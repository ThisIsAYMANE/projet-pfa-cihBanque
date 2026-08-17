import { useState, useEffect } from 'react'
import axios from 'axios'
import { Users, AlertTriangle, ShieldCheck, Bell } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import keycloak from '../auth/keycloak'

function Dashboard() {
  const { t } = useTranslation()
  const [stats, setStats] = useState({
    activeRestrictions: 0,
    protectedAccounts: 0,
    activeUsers: 0
  });
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    fetchStats()
    fetchAlerts()
  }, [])

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

  const fetchAlerts = async () => {
    try {
      const res = await axios.get('http://localhost:8081/api/dashboard/alerts', {
        headers: { Authorization: `Bearer ${keycloak.token}` }
      })
      setAlerts(res.data)
    } catch (err) {
      console.error("Failed to load alerts", err)
    }
  }

  const handleResolveAlert = async (id, action) => {
    try {
      await axios.post(`http://localhost:8081/api/dashboard/alerts/${id}/resolve?action=${action}`, {}, {
        headers: { Authorization: `Bearer ${keycloak.token}` }
      })
      alert(t('alerts.success_resolve'))
      fetchAlerts()
    } catch (err) {
      console.error("Failed to resolve alert", err)
      alert("Error resolving alert")
    }
  }


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

      <div className="card" style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <Bell color="var(--accent-color)" />
          <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>{t('alerts.title')}</h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Message</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {alerts.length > 0 ? alerts.map(alert => (
                <tr key={alert.id}>
                  <td><strong>{alert.type}</strong></td>
                  <td>{alert.message}</td>
                  <td>
                    <span className={`status-badge status-${alert.status.toLowerCase()}`}>
                      {t(`alerts.status_${alert.status.toLowerCase()}`)}
                    </span>
                  </td>
                  <td>{new Date(alert.createdAt).toLocaleString()}</td>
                  <td>
                    {alert.status === 'PENDING' && (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-primary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }} onClick={() => handleResolveAlert(alert.id, 'BLOCK')}>
                          {t('alerts.block_action')}
                        </button>
                        <button className="btn" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem', color: 'var(--danger-color)', borderColor: 'var(--danger-color)' }} onClick={() => handleResolveAlert(alert.id, 'TERMINATE')}>
                          {t('alerts.terminate_action')}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>No alerts found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
