import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import keycloak from '../auth/keycloak';

export default function RiskThirdPartyForm() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    isCihClient: false,
    identifierType: 'RADICAL',
    identifier: '',
    firstName: '',
    lastName: '',
    cin: '',
    passport: '',
    phone: '',
    email: '',
    address: '',
    declarationReason: '',
    declaringEntity: 'INSPECTION',
    restrictionType: 'BLOCK_ALL',
    blockRelationship: false
  });

  const canWrite = keycloak.hasRealmRole('ROLE_ADMIN') || keycloak.hasRealmRole('ROLE_IG') || keycloak.hasRealmRole('ROLE_CONFORMITE_SF') || keycloak.hasRealmRole('ROLE_CONFORMITE_PF') || keycloak.hasRealmRole('ROLE_JURIDIQUE');

  const fetchIND = useCallback(async () => {
    try {
      const res = await axios.get(`http://localhost:8081/api/v1/risk-third-parties/${id}`, {
        headers: { Authorization: `Bearer ${keycloak.token}` }
      });
      setFormData(res.data);
    } catch (error) {
      console.error(error);
      alert('Error fetching IND data');
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchIND();
    }
  }, [id, fetchIND]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canWrite) return;
    setLoading(true);
    try {
      if (id) {
        await axios.put(`http://localhost:8081/api/v1/risk-third-parties/${id}`, formData, {
          headers: { Authorization: `Bearer ${keycloak.token}` }
        });
        alert(t('ind.success_update'));
      } else {
        await axios.post('http://localhost:8081/api/v1/risk-third-parties', formData, {
          headers: { Authorization: `Bearer ${keycloak.token}` }
        });
        alert(t('ind.success_create'));
        navigate('/ind-list');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving IND');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>{t('ind.form_title')}</h2>
      
      {!canWrite && (
        <div style={{ padding: '1rem', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid var(--warning-color)', color: 'var(--warning-color)', borderRadius: 'var(--radius-card)', marginBottom: '1.5rem', fontWeight: '500' }}>
          {t('form.readonly')}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input
            type="checkbox"
            id="isCihClient"
            checked={formData.isCihClient}
            onChange={e => setFormData({ ...formData, isCihClient: e.target.checked })}
            disabled={!canWrite}
            style={{ width: 'auto' }}
          />
          <label htmlFor="isCihClient" className="form-label" style={{ marginBottom: 0 }}>{t('ind.is_client')}</label>
        </div>

        {formData.isCihClient ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Type d&apos;identifiant</label>
              <select
                className="form-control"
                value={formData.identifierType}
                onChange={e => setFormData({ ...formData, identifierType: e.target.value })}
                disabled={!canWrite}
              >
                <option value="RADICAL">Numéro Client (Radical)</option>
                <option value="RIB">RIB</option>
                <option value="CIN">CIN</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">{t('ind.identifier')}</label>
              <input
                type="text"
                className="form-control"
                required
                value={formData.identifier}
                onChange={e => setFormData({ ...formData, identifier: e.target.value })}
                disabled={!canWrite}
              />
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">{t('ind.first_name')}</label>
              <input type="text" className="form-control" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} disabled={!canWrite} required />
            </div>
            <div className="form-group">
              <label className="form-label">{t('ind.last_name')}</label>
              <input type="text" className="form-control" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} disabled={!canWrite} required />
            </div>
            <div className="form-group">
              <label className="form-label">{t('ind.cin')}</label>
              <input type="text" className="form-control" value={formData.cin} onChange={e => setFormData({...formData, cin: e.target.value})} disabled={!canWrite} />
            </div>
            <div className="form-group">
              <label className="form-label">{t('ind.passport')}</label>
              <input type="text" className="form-control" value={formData.passport} onChange={e => setFormData({...formData, passport: e.target.value})} disabled={!canWrite} />
            </div>
            <div className="form-group">
              <label className="form-label">{t('ind.phone')}</label>
              <input type="text" className="form-control" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} disabled={!canWrite} />
            </div>
            <div className="form-group">
              <label className="form-label">{t('ind.email')}</label>
              <input type="email" className="form-control" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} disabled={!canWrite} />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">{t('ind.address')}</label>
              <textarea className="form-control" rows="2" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} disabled={!canWrite} />
            </div>
          </div>
        )}

        <hr style={{ margin: '2rem 0', borderColor: 'var(--border-color)' }} />

        <div className="form-group">
          <label className="form-label">{t('ind.declaring_entity')}</label>
          <select className="form-control" value={formData.declaringEntity} onChange={e => setFormData({...formData, declaringEntity: e.target.value})} disabled={!canWrite}>
            <option value="INSPECTION">Inspection Générale (IG)</option>
            <option value="CONFORMITE_SF">Conformité Sécurité Financière</option>
            <option value="CONFORMITE_PF">Conformité Protection de la clientèle</option>
            <option value="JURIDIQUE">Juridique</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">{t('ind.reason')}</label>
          <textarea
            className="form-control"
            rows="3"
            required
            value={formData.declarationReason}
            onChange={e => setFormData({ ...formData, declarationReason: e.target.value })}
            disabled={!canWrite}
          />
        </div>

        <div className="form-group">
          <label className="form-label">{t('ind.restriction_type')}</label>
          <select className="form-control" value={formData.restrictionType} onChange={e => setFormData({...formData, restrictionType: e.target.value})} disabled={!canWrite}>
            <option value="BLOCK_ALL">Blocage tiers : blocage ALL</option>
            <option value="BLOCK_PHYSICAL_ACCOUNT_OPS">Blocage de compte Physique : virement, transfert, etc.</option>
            <option value="BLOCK_SECURITIES_BL">Blocage de compte titre et BL : ALL</option>
            <option value="BLOCK_LEGAL_ENTITY_OPS">Blocage de compte personne morale : virement, transfert, etc.</option>
            <option value="BLOCK_ONLINE_BANKING">Blocage banque à distance : blocage d&apos;accès</option>
            <option value="VIGILANCE">Vigilance à observer</option>
          </select>
        </div>

        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: 'var(--radius-card)', border: '1px solid var(--danger-color)' }}>
          <input
            type="checkbox"
            id="blockRelationship"
            checked={formData.blockRelationship}
            onChange={e => setFormData({ ...formData, blockRelationship: e.target.checked })}
            disabled={!canWrite}
            style={{ width: 'auto' }}
          />
          <label htmlFor="blockRelationship" className="form-label" style={{ marginBottom: 0, color: 'var(--danger-color)', fontWeight: 'bold' }}>{t('ind.block_relationship')}</label>
        </div>

        {canWrite && (
          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" className="btn" style={{ flex: 1, background: 'var(--surface-color)', border: '1px solid var(--border-color)' }} onClick={() => navigate('/ind-list')}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
              {loading ? '...' : id ? t('ind.update') : t('ind.save')}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
