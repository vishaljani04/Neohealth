import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { healthService, predictionService } from '../services/api';
import { Save, Loader2 } from 'lucide-react';

import { useTranslation } from 'react-i18next';

const InputData = () => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        last_period_date: '',
        lh: '', estrogen: '', pdg: '',
        cramps: 0, fatigue: 0, moodswing: 0,
        stress: 0, bloating: 0, sleepissue: 0,
        overall_score: '', deep_sleep_in_minutes: '',
        avg_resting_heart_rate: '', stress_score: '', daily_steps: ''
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    React.useEffect(() => {
        document.title = 'Update Data | NeoHealth';
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLikert = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // 1. Submit Record
            await healthService.addRecord(formData);
            // 2. Run Prediction
            await predictionService.predict({ date: formData.date });
            navigate('/');
        } catch (err) {
            console.error(err);
            const errorMsg = err.response?.data?.msg || err.response?.data?.error || t('error_saving_data');
            alert(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const LikertScale = ({ name, current }) => (
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            {[0, 1, 2, 3, 4].map(v => (
                <button
                    key={v}
                    type="button"
                    onClick={() => handleLikert(name, v)}
                    style={{
                        width: '32px', height: '32px', borderRadius: '50%',
                        backgroundColor: current === v ? 'var(--primary)' : 'var(--background)',
                        color: current === v ? 'white' : 'var(--text-main)',
                        border: `1px solid ${current === v ? 'var(--primary)' : 'var(--border)'}`
                    }}
                >
                    {v}
                </button>
            ))
            }
        </div >
    );

    return (
        <div className="input-page-container" style={{ padding: '0 2rem 4rem' }}>
            <style>{`
                .input-main-grid {
                    display: grid;
                    grid-template-columns: minmax(300px, 1.2fr) 1fr;
                    gap: 2rem;
                }
                .input-sub-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.2rem;
                }
                @media (max-width: 768px) {
                    .input-page-container {
                        padding: 0 1rem 4rem !important;
                    }
                    .input-main-grid {
                        grid-template-columns: 1fr;
                    }
                    .input-sub-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>

            {/* Disclaimer Banner */}
            <div style={{
                background: '#fff7ed',
                borderLeft: '4px solid #f97316',
                padding: '1rem',
                marginBottom: '2rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'start',
                gap: '0.8rem'
            }}>
                <div style={{ color: '#ea580c', marginTop: '2px' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                </div>
                <div>
                    <h4 style={{ margin: '0 0 0.2rem 0', color: '#9a3412', fontSize: '1rem' }}>Demo Data Disclaimer</h4>
                    <p style={{ margin: 0, color: '#c2410c', fontSize: '0.9rem', lineHeight: '1.4' }}>
                        This is a demonstration environment. The data entered here is temporary and for testing purposes only.
                        Please feel free to use example values (e.g., LH: 10.5, Sleep: 85) to test the AI predictions.
                    </p>
                </div>
            </div>

            <h2 className="title-gradient" style={{ marginBottom: '2rem' }}>{t('log_daily_health')}</h2>

            <form onSubmit={handleSubmit} className="card" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <div className="input-main-grid">
                    <div>
                        <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>{t('hormones_vitals')}</h3>
                        <div className="input-sub-grid" style={{ marginBottom: '1.5rem' }}>
                            <div>
                                <label style={{ fontSize: '0.85rem' }}>{t('entry_date')}</label>
                                <input type="date" name="date" value={formData.date} onChange={handleChange} style={{ width: '100%' }} required />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.85rem' }}>{t('last_period_start')}</label>
                                <input type="date" name="last_period_date" value={formData.last_period_date} onChange={handleChange} style={{ width: '100%' }} />
                            </div>
                        </div>

                        <div className="input-sub-grid">
                            <div>
                                <label style={{ fontSize: '0.85rem' }}>{t('lh_level')} (mIU/mL)</label>
                                <input type="number" step="0.1" name="lh" value={formData.lh} onChange={handleChange} placeholder="e.g. 5.0 - 20.0" style={{ width: '100%' }} />
                                <small style={{ opacity: 0.6, fontSize: '0.7rem' }}>{t('normal')}: 1.9 - 14.6</small>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.85rem' }}>{t('estrogen')} (pg/mL)</label>
                                <input type="number" step="0.1" name="estrogen" value={formData.estrogen} onChange={handleChange} placeholder="e.g. 100 - 400" style={{ width: '100%' }} />
                                <small style={{ opacity: 0.6, fontSize: '0.7rem' }}>{t('normal')}: 30 - 400</small>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.85rem' }}>{t('pdg')} (ug/mL)</label>
                                <input type="number" step="0.1" name="pdg" value={formData.pdg} onChange={handleChange} placeholder="e.g. 5.0 - 25.0" style={{ width: '100%' }} />
                                <small style={{ opacity: 0.6, fontSize: '0.7rem' }}>{t('progesterone_metabolite')}</small>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.85rem' }}>{t('sleep_score')} (0-100)</label>
                                <input type="number" name="overall_score" value={formData.overall_score} onChange={handleChange} placeholder="e.g. 85" style={{ width: '100%' }} />
                                <small style={{ opacity: 0.6, fontSize: '0.7rem' }}>{t('from_smart_watch')}</small>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.85rem' }}>{t('deep_sleep')} (Mins)</label>
                                <input type="number" name="deep_sleep_in_minutes" value={formData.deep_sleep_in_minutes} onChange={handleChange} placeholder="e.g. 90" style={{ width: '100%' }} />
                                <small style={{ opacity: 0.6, fontSize: '0.7rem' }}>{t('suggested')}: 60 - 120</small>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.85rem' }}>{t('heart_rate')} (Avg BPM)</label>
                                <input type="number" name="avg_resting_heart_rate" value={formData.avg_resting_heart_rate} onChange={handleChange} placeholder="e.g. 72" style={{ width: '100%' }} />
                                <small style={{ opacity: 0.6, fontSize: '0.7rem' }}>{t('normal')}: 60 - 100</small>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.85rem' }}>{t('stress_score')} (0-100)</label>
                                <input type="number" name="stress_score" value={formData.stress_score} onChange={handleChange} placeholder="e.g. 20" style={{ width: '100%' }} />
                                <small style={{ opacity: 0.6, fontSize: '0.7rem' }}>{t('lower_is_better')}</small>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.85rem' }}>{t('daily_steps')}</label>
                                <input type="number" name="daily_steps" value={formData.daily_steps} onChange={handleChange} placeholder="e.g. 8000" style={{ width: '100%' }} />
                                <small style={{ opacity: 0.6, fontSize: '0.7rem' }}>{t('recommended')}: 7000+</small>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 style={{ marginBottom: '1.5rem', color: 'var(--secondary)' }}>{t('symptoms_scale')}</h3>
                        <p style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: '1rem' }}>{t('symptoms_legend')}</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.2rem' }}>
                            <div><label style={{ fontSize: '0.85rem' }}>{t('cramps')}</label><LikertScale name="cramps" current={formData.cramps} /></div>
                            <div><label style={{ fontSize: '0.85rem' }}>{t('fatigue')}</label><LikertScale name="fatigue" current={formData.fatigue} /></div>
                            <div><label style={{ fontSize: '0.85rem' }}>{t('mood_swings')}</label><LikertScale name="moodswing" current={formData.moodswing} /></div>
                            <div><label style={{ fontSize: '0.85rem' }}>{t('bloating')}</label><LikertScale name="bloating" current={formData.bloating} /></div>
                            <div><label style={{ fontSize: '0.85rem' }}>{t('sleep_issues')}</label><LikertScale name="sleepissue" current={formData.sleepissue} /></div>
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: '3rem', textAlign: 'center' }}>
                    <button type="submit" disabled={loading} className="btn-primary" style={{ padding: '12px 48px', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.8rem', margin: '0 auto' }}>
                        {loading ? <Loader2 className="animate-spin" /> : <Save />}
                        {loading ? t('processing_prediction') : t('save_run_prediction')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default InputData;
