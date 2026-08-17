import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useTranslation } from 'react-i18next'
import keycloak from '../auth/keycloak'
import { ExternalLink, ShieldCheck } from 'lucide-react'

function UserManagement() {
  const { t } = useTranslation()
  const [users, setUsers] = useState([])

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:8081/api/users', {
        headers: { Authorization: `Bearer ${keycloak.token}` }
      })
      setUsers(response.data)
    } catch (error) {
      console.error('Erreur de chargement des utilisateurs', error)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>{t('users.title')}</h2>
        <a 
          href="http://localhost:8085/admin/master/console/" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="btn btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', fontSize: '0.875rem' }}
        >
          <ExternalLink size={16} /> Console Keycloak
        </a>
      </div>

      <div style={{ padding: '1rem 1.25rem', background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.2)', color: 'var(--text-primary)', borderRadius: 'var(--radius-card)', marginBottom: '1.5rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <ShieldCheck size={20} style={{ color: 'var(--primary-color)', flexShrink: 0 }} />
        <div>
          <strong>Gestion Centralisée IAM (Keycloak) :</strong> La création de comptes, la réinitialisation de mots de passe et la modification des rôles sont gérées de manière sécurisée directement dans la console Keycloak.
        </div>
      </div>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>{t('users.name')}</th>
              <th>{t('users.username')}</th>
              <th>{t('users.id')}</th>
              <th>{t('users.role')}</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr><td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Aucun utilisateur enregistré.</td></tr>
            ) : users.map(user => (
              <tr key={user.id}>
                <td style={{ fontWeight: '500' }}>{user.fullName || user.username}</td>
                <td>{user.username}</td>
                <td style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{user.keycloakId}</td>
                <td>
                  <span className={`badge ${user.role === 'ROLE_ADMIN' ? 'badge-active' : (user.role === 'ROLE_USER' ? 'badge-draft' : 'badge-inactive')}`}>
                    {user.role}
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

export default UserManagement
