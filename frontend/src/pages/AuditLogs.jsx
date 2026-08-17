import { useState, useEffect } from 'react'
import axios from 'axios'
import { useTranslation } from 'react-i18next'
import keycloak from '../auth/keycloak'

import { Search } from 'lucide-react'

function AuditLogs() {
  const { t } = useTranslation()
  const [logs, setLogs] = useState([])
  const [searchTerm, setSearchTerm] = useState('')

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

  const filteredLogs = logs.filter(log => {
    const term = searchTerm.toLowerCase();
    return (
      (log.action && log.action.toLowerCase().includes(term)) ||
      (log.entityType && log.entityType.toLowerCase().includes(term)) ||
      (log.performedByUsername && log.performedByUsername.toLowerCase().includes(term)) ||
      (log.entityIdentifier && log.entityIdentifier.toLowerCase().includes(term)) ||
      (log.beforeState && log.beforeState.toLowerCase().includes(term)) ||
      (log.afterState && log.afterState.toLowerCase().includes(term))
    );
  });

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ color: 'var(--text-primary)', margin: 0 }}>{t('audit.title')}</h2>
        
        <div style={{ position: 'relative', width: '300px' }}>
          <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Rechercher dans l'audit..."
            className="form-control"
            style={{ paddingLeft: '40px' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>{t('audit.date')}</th>
              <th>{t('audit.action')}</th>
              <th>Utilisateur</th>
              <th>Identifiant Tiers</th>
              <th>{t('audit.target')}</th>
              <th>{t('audit.before')}</th>
              <th>{t('audit.after')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>Aucun log trouvé.</td></tr>
            ) : filteredLogs.map(log => (
              <tr key={log.id}>
                <td style={{ whiteSpace: 'nowrap' }}>{new Date(log.timestamp).toLocaleString()}</td>
                <td>
                  <span className={`badge ${log.action === 'CREATE_IND' ? 'badge-active' : (log.action === 'UPDATE_IND' ? 'badge-draft' : 'badge-inactive')}`}>
                    {log.action}
                  </span>
                </td>
                <td style={{ fontWeight: '500' }}>{log.performedByUsername || '-'}</td>
                <td style={{ fontWeight: '500', color: 'var(--primary-color)' }}>{log.entityIdentifier || '-'}</td>
                <td style={{ fontSize: '0.8rem' }}>{log.entityType}</td>
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
