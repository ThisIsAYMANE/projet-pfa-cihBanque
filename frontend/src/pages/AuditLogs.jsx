import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useTranslation } from 'react-i18next'
import keycloak from '../auth/keycloak'

function AuditLogs() {
  const { t } = useTranslation()
  const [logs, setLogs] = useState([])

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await axios.get('http://localhost:8081/api/audit-logs', {
          headers: { Authorization: `Bearer ${keycloak.token}` }
        })
        setLogs(response.data.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp)))
      } catch (error) {
        console.error('Erreur de chargement des logs', error)
      }
    }
    fetchLogs()
  }, [])

  return (
    <div className="card">
      <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>{t('audit.title')}</h2>
      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>{t('audit.date')}</th>
              <th>{t('audit.action')}</th>
              <th>{t('audit.target')}</th>
              <th>{t('audit.before')}</th>
              <th>{t('audit.after')}</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>-</td></tr>
            ) : logs.map(log => (
              <tr key={log.id}>
                <td style={{ whiteSpace: 'nowrap' }}>{new Date(log.timestamp).toLocaleString()}</td>
                <td>
                  <span className={`badge ${log.action === 'CREATE' ? 'badge-active' : (log.action === 'UPDATE' ? 'badge-draft' : 'badge-inactive')}`}>
                    {log.action}
                  </span>
                </td>
                <td style={{ fontWeight: '500' }}>{log.entityType}</td>
                <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{log.beforeState || '-'}</td>
                <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{log.afterState || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AuditLogs
