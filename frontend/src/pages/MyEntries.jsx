import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useTranslation } from 'react-i18next'
import keycloak from '../auth/keycloak'

function MyEntries() {
  const { t } = useTranslation()
  const [entries, setEntries] = useState([])

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const response = await axios.get('http://localhost:8081/api/restrictions/me', {
          headers: { Authorization: `Bearer ${keycloak.token}` }
        })
        setEntries(response.data)
      } catch (error) {
        console.error('Erreur de chargement des saisies', error)
      }
    }
    fetchEntries()
  }, [])

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'ACTIVE':
      case 'CONFIRMED':
        return 'badge-active';
      case 'INACTIVE':
        return 'badge-inactive';
      default:
        return 'badge-draft';
    }
  }

  return (
    <div className="card">
      <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>{t('entries.title')}</h2>
      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>{t('entries.account')}</th>
              <th>{t('entries.reason')}</th>
              <th>{t('form.startDate')}</th>
              <th>{t('form.endDate')}</th>
              <th>{t('entries.status')}</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Aucune restriction saisie.</td></tr>
            ) : entries.map(entry => (
              <tr key={entry.id}>
                <td style={{ fontWeight: '500' }}>{entry.accountNumber}</td>
                <td>{entry.reason}</td>
                <td>{entry.startDate}</td>
                <td>{entry.endDate || '-'}</td>
                <td>
                  <span className={`badge ${getStatusBadgeClass(entry.status)}`}>
                    {entry.status === 'ACTIVE' || entry.status === 'CONFIRMED' ? t('entries.status_active') : 
                     entry.status === 'INACTIVE' ? t('entries.status_inactive') : 
                     t('entries.status_draft')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default MyEntries
