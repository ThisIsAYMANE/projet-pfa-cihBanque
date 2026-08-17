import React, { useState } from 'react'
import axios from 'axios'
import { useTranslation } from 'react-i18next'
import keycloak from '../auth/keycloak'

function SearchAndFilter() {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [editTarget, setEditTarget] = useState(null)
  
  const isAdmin = keycloak.hasRealmRole('ROLE_ADMIN')

  const handleSearch = async () => {
    try {
      const res = await axios.get(`http://localhost:8081/api/restrictions/search?query=${query}`, {
        headers: { Authorization: `Bearer ${keycloak.token}` }
      })
      setResults(res.data)
    } catch (err) {
      console.error("Search failed", err)
    }
  }

  const handleDeactivate = async (id) => {
    if (!window.confirm(t('entries.delete_confirm'))) return;
    try {
      await axios.delete(`http://localhost:8081/api/restrictions/${id}`, {
        headers: { Authorization: `Bearer ${keycloak.token}` }
      })
      handleSearch()
    } catch (err) {
      console.error("Deactivation failed", err)
    }
  }

  const handleEditSave = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:8081/api/restrictions/${editTarget.id}`, editTarget, {
        headers: { Authorization: `Bearer ${keycloak.token}` }
      })
      setEditTarget(null)
      handleSearch()
    } catch (err) {
      console.error("Edit failed", err)
      alert("Erreur lors de la modification")
    }
  }

  const getStatusBadgeClass = (status) => {
    if (status === 'ACTIVE' || status === 'CONFIRMED') return 'badge-active';
    if (status === 'DRAFT') return 'badge-draft';
    return 'badge-inactive';
  }

  return (
    <div className="card">
      <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>{t('search.title')}</h2>
      
      {/* Edit Modal (Simple overlay) */}
      {editTarget && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ padding: '2rem', width: '90%', maxWidth: '500px' }}>
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>{t('search.edit')}</h3>
            <form onSubmit={handleEditSave}>
              <div className="form-group">
                <label className="form-label">{t('search.account')}</label>
                <input type="text" className="form-control" value={editTarget.accountNumber} disabled />
              </div>
              <div className="form-group">
                <label className="form-label">{t('search.reason')}</label>
                <textarea 
                  className="form-control" 
                  value={editTarget.reason} 
                  onChange={e => setEditTarget({...editTarget, reason: e.target.value})} 
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">{t('form.endDate')}</label>
                <input 
                  type="date" 
                  className="form-control" 
                  value={editTarget.endDate || ''} 
                  onChange={e => setEditTarget({...editTarget, endDate: e.target.value})} 
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn" style={{ flex: 1, background: 'var(--bg-color)', color: 'var(--text-primary)' }} onClick={() => setEditTarget(null)}>Annuler</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{t('form.save')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="form-group" style={{ display: 'flex', gap: '1rem' }}>
        <input 
          type="text" 
          className="form-control" 
          placeholder={t('search.placeholder')} 
          style={{ flex: 1 }} 
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
        />
        <button className="btn btn-primary" onClick={handleSearch}>{t('search.btn')}</button>
      </div>
      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>{t('search.account')}</th>
              <th>{t('search.reason')}</th>
              <th>{t('search.status')}</th>
              {isAdmin && <th>{t('search.actions')}</th>}
            </tr>
          </thead>
          <tbody>
            {results.length === 0 ? (
              <tr><td colSpan={isAdmin ? 4 : 3} style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>-</td></tr>
            ) : results.map(r => (
              <tr key={r.id}>
                <td style={{ fontWeight: '500' }}>{r.accountNumber}</td>
                <td>{r.reason}</td>
                <td>
                  <span className={`badge ${getStatusBadgeClass(r.status)}`}>
                    {r.status === 'ACTIVE' || r.status === 'CONFIRMED' ? t('entries.status_active') : 
                     (r.status === 'DRAFT' ? t('entries.status_draft') : t('entries.status_inactive'))}
                  </span>
                </td>
                {isAdmin && (
                  <td>
                    {r.status === 'ACTIVE' || r.status === 'CONFIRMED' || r.status === 'DRAFT' ? (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn" style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', background: 'var(--bg-color)', color: 'var(--primary-color)' }} onClick={() => setEditTarget(r)}>
                          {t('search.edit')}
                        </button>
                        <button className="btn" style={{ padding: '0.4rem 0.75rem', background: 'var(--danger-color)', color: 'white', fontSize: '0.75rem' }} onClick={() => handleDeactivate(r.id)}>
                          {t('search.deactivate')}
                        </button>
                      </div>
                    ) : '-'}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default SearchAndFilter
