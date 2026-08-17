import React, { useState } from 'react'
import axios from 'axios'
import { useTranslation } from 'react-i18next'
import keycloak from '../auth/keycloak'

function EntryForm() {
  const { t } = useTranslation()
  const [step, setStep] = useState(1)
  const [createdId, setCreatedId] = useState(null)

  const [formData, setFormData] = useState({
    accountNumber: '',
    restrictionTypeId: 'c0a80121-8285-1815-8182-85669b760000',
    reason: '',
    startDate: '',
    endDate: '',
    expiryMode: 'AUTO',
    status: 'DRAFT'
  })

  const canWrite = keycloak.hasRealmRole('ROLE_USER') || keycloak.hasRealmRole('ROLE_ADMIN');

  const handleDraftSubmit = async (e) => {
    e.preventDefault()
    if (!canWrite) return;
    try {
      const response = await axios.post('http://localhost:8081/api/restrictions', formData, {
        headers: { Authorization: `Bearer ${keycloak.token}` }
      })
      setCreatedId(response.data.id)
      setStep(2) // Move to confirmation step
    } catch (error) {
      alert(error.response?.data || t('form.error_create'))
    }
  }

  const handleConfirm = async () => {
    try {
      await axios.put(`http://localhost:8081/api/restrictions/${createdId}`, { ...formData, status: 'CONFIRMED' }, {
        headers: { Authorization: `Bearer ${keycloak.token}` }
      })
      alert(t('form.success_create'))
      setStep(1)
      setCreatedId(null)
      setFormData({ ...formData, accountNumber: '', reason: '' })
    } catch (error) {
      alert(t('form.error_confirm'))
    }
  }

  return (
    <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>{t('form.title')}</h2>
      {!canWrite && (
        <div style={{ padding: '1rem', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid var(--warning-color)', color: 'var(--warning-color)', borderRadius: 'var(--radius-card)', marginBottom: '1.5rem', fontWeight: '500' }}>
          {t('form.readonly')}
        </div>
      )}
      <form onSubmit={step === 1 ? handleDraftSubmit : (e) => e.preventDefault()}>
        <div className="form-group">
          <label className="form-label">{t('form.account')}</label>
          <input
            type="text"
            className="form-control"
            required
            value={formData.accountNumber}
            onChange={e => setFormData({ ...formData, accountNumber: e.target.value })}
            disabled={!canWrite || step === 2}
          />
        </div>
        <div className="form-group">
          <label className="form-label">{t('form.type')}</label>
          <select
            className="form-control"
            value={formData.restrictionTypeId}
            onChange={e => setFormData({ ...formData, restrictionTypeId: e.target.value })}
            disabled={!canWrite || step === 2}
          >
            <option value="c0a80121-8285-1815-8182-85669b760000">{t('form.type_gel')}</option>
            <option value="c0a80121-8285-1815-8182-85669b760001">{t('form.type_blocage')}</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">{t('form.reason')}</label>
          <textarea
            className="form-control"
            rows="3"
            required
            value={formData.reason}
            onChange={e => setFormData({ ...formData, reason: e.target.value })}
            disabled={!canWrite || step === 2}
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">{t('form.startDate')}</label>
            <input
              type="date"
              className="form-control"
              required
              value={formData.startDate}
              onChange={e => setFormData({ ...formData, startDate: e.target.value })}
              disabled={!canWrite || step === 2}
            />
          </div>
          <div className="form-group">
            <label className="form-label">{t('form.endDate')}</label>
            <input
              type="date"
              className="form-control"
              value={formData.endDate}
              onChange={e => setFormData({ ...formData, endDate: e.target.value })}
              disabled={!canWrite || step === 2}
            />
          </div>
        </div>

        {canWrite && step === 1 && (
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
            {t('form.save')}
          </button>
        )}

        {canWrite && step === 2 && (
          <div style={{ padding: '1.5rem', background: 'var(--bg-color)', borderRadius: 'var(--radius-card)', marginTop: '1rem', border: '1px solid var(--border-color)' }}>
            <p style={{ marginBottom: '1.5rem', color: 'var(--text-primary)', textAlign: 'center', fontWeight: '500' }}>{t('form.review')}</p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="button" className="btn" style={{ flex: 1, background: 'var(--surface-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }} onClick={() => setStep(1)}>
                {t('form.edit')}
              </button>
              <button type="button" className="btn btn-primary" style={{ flex: 1 }} onClick={handleConfirm}>
                {t('form.confirm')}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}

export default EntryForm
