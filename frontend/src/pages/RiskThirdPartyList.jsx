import { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ShieldAlert, ShieldCheck, Edit, FileText, Ban, Search } from 'lucide-react';
import keycloak from '../auth/keycloak';

export default function RiskThirdPartyList() {
  const { t } = useTranslation();
  const [inds, setInds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historyModal, setHistoryModal] = useState({ open: false, data: [] });
  const [searchTerm, setSearchTerm] = useState('');

  const canWrite = keycloak.hasRealmRole('ROLE_ADMIN') || keycloak.hasRealmRole('ROLE_IG') || keycloak.hasRealmRole('ROLE_CONFORMITE_SF') || keycloak.hasRealmRole('ROLE_CONFORMITE_PF') || keycloak.hasRealmRole('ROLE_JURIDIQUE');

  useEffect(() => {
    fetchINDs();
  }, []);

  const fetchINDs = async () => {
    try {
      const res = await axios.get('http://localhost:8081/api/v1/risk-third-parties', {
        headers: { Authorization: `Bearer ${keycloak.token}` }
      });
      setInds(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLiftStatus = async (id) => {
    if (!window.confirm("Voulez-vous vraiment lever le statut de ce tiers ?")) return;
    try {
      await axios.put(`http://localhost:8081/api/v1/risk-third-parties/${id}/lift`, {}, {
        headers: { Authorization: `Bearer ${keycloak.token}` }
      });
      fetchINDs();
    } catch (error) {
      console.error(error);
      alert("Error lifting status");
    }
  };

  const handleToggleBlock = async (id) => {
    if (!window.confirm("Voulez-vous modifier le blocage de ce tiers ?")) return;
    try {
      await axios.put(`http://localhost:8081/api/v1/risk-third-parties/${id}/block`, {}, {
        headers: { Authorization: `Bearer ${keycloak.token}` }
      });
      fetchINDs();
    } catch (error) {
      console.error(error);
      alert("Error toggling block");
    }
  };

  const viewHistory = async (id) => {
    try {
      const res = await axios.get(`http://localhost:8081/api/v1/risk-third-parties/${id}/history`, {
        headers: { Authorization: `Bearer ${keycloak.token}` }
      });
      setHistoryModal({ open: true, data: res.data });
    } catch (error) {
      console.error(error);
      alert("Error fetching history");
    }
  };

  const filteredInds = inds.filter(ind => {
    const term = searchTerm.toLowerCase();
    const name = ind.isCihClient ? 'Client CIH' : `${ind.firstName || ''} ${ind.lastName || ''}`.trim();
    const ident = ind.isCihClient ? ind.identifier || '' : ind.cin || '';
    
    return (
      name.toLowerCase().includes(term) ||
      ident.toLowerCase().includes(term) ||
      (ind.declaringEntity && ind.declaringEntity.toLowerCase().includes(term)) ||
      (ind.status && ind.status.toLowerCase().includes(term))
    );
  });

  if (loading) return <div>Loading...</div>;

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ color: 'var(--text-primary)', margin: 0 }}>{t('ind.title')}</h2>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Rechercher par Nom, CIN, Entité..."
              className="form-control"
              style={{ paddingLeft: '40px' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {canWrite && (
            <Link to="/ind-form" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}>
              <ShieldAlert size={18} /> {t('ind.form_title')}
            </Link>
          )}
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="table">
          <thead>
            <tr>
              <th>{t('ind.identifier')} / {t('ind.cin')}</th>
              <th>Nom / Raison Sociale</th>
              <th>{t('ind.declaring_entity')}</th>
              <th>Statut</th>
              <th>Blocage Sitex</th>
              <th>{t('search.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredInds.map(ind => (
              <tr key={ind.id}>
                <td>{ind.isCihClient ? (ind.identifier ? `${ind.identifierType || 'ID'} : ${ind.identifier}` : <span style={{color: 'var(--text-muted)'}}>-</span>) : (ind.cin || <span style={{color: 'var(--text-muted)'}}>-</span>)}</td>
                <td>{ind.isCihClient ? 'Client CIH' : (`${ind.firstName || ''} ${ind.lastName || ''}`.trim() || <span style={{color: 'var(--text-muted)'}}>-</span>)}</td>
                <td>{ind.declaringEntity}</td>
                <td>
                  <span className={`status-badge status-${ind.status.toLowerCase()}`}>
                    {t(`ind.status_${ind.status.toLowerCase()}`)}
                  </span>
                </td>
                <td>
                  {ind.blockRelationship ? <span style={{ color: 'var(--danger-color)', fontWeight: 'bold' }}>OUI</span> : <span style={{ color: 'var(--success-color)' }}>NON</span>}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => viewHistory(ind.id)} className="btn-icon" title={t('ind.history')}>
                      <FileText size={18} />
                    </button>
                    {canWrite && (
                      <>
                        <Link to={`/ind-form/${ind.id}`} className="btn-icon" title={t('ind.update')}>
                          <Edit size={18} />
                        </Link>
                        {ind.status !== 'TERMINATED' && ind.status !== 'LIFTED' && (
                          <button onClick={() => handleLiftStatus(ind.id)} className="btn-icon" title={t('ind.lift_status')} style={{ color: 'var(--success-color)' }}>
                            <ShieldCheck size={18} />
                          </button>
                        )}
                        {ind.status !== 'TERMINATED' && (
                          <button onClick={() => handleToggleBlock(ind.id)} className="btn-icon" title={t('ind.toggle_block')} style={{ color: ind.blockRelationship ? 'var(--success-color)' : 'var(--danger-color)' }}>
                            <Ban size={18} />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filteredInds.length === 0 && (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>Aucun résultat pour cette recherche.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {historyModal.open && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '80%', maxWidth: '800px', maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0 }}>{t('ind.history')}</h3>
              <button className="btn" onClick={() => setHistoryModal({ open: false, data: [] })}>Close</button>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th>{t('audit.date')}</th>
                  <th>{t('audit.action')}</th>
                  <th>{t('audit.user')}</th>
                  <th>{t('audit.before')}</th>
                  <th>{t('audit.after')}</th>
                </tr>
              </thead>
              <tbody>
                {historyModal.data.map(log => (
                  <tr key={log.id}>
                    <td>{new Date(log.timestamp).toLocaleString()}</td>
                    <td><strong>{log.action}</strong></td>
                    <td>{log.performedBy}</td>
                    <td style={{ fontSize: '0.8rem', maxWidth: '150px', wordBreak: 'break-all' }}>{log.detailsBefore}</td>
                    <td style={{ fontSize: '0.8rem', maxWidth: '150px', wordBreak: 'break-all' }}>{log.detailsAfter}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
