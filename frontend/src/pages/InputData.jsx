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

    const [userMode, setUserMode] = useState('normal'); // 'normal' or 'professional'

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

    // Helper for Normal Mode Simple Inputs
    const handleNormalInput = (category, value) => {
        // Map simple inputs to complex data structure
        if (category === 'mood') {
            // value: 'happy' (0), 'neutral' (1), 'sad' (2), 'anxious' (3)
            const map = { 'happy': 0, 'neutral': 1, 'sad': 2, 'anxious': 3 };
            setFormData(prev => ({ ...prev, moodswing: map[value] || 0 }));
        }
        if (category === 'energy') {
            // value: 'high' (fatigue=0), 'medium' (fatigue=1), 'low' (fatigue=3)
            const map = { 'high': 0, 'medium': 1, 'low': 3 };
            setFormData(prev => ({ ...prev, fatigue: map[value] || 0 }));
        }
        if (category === 'sleep') {
            // value: 'great' (score=90, deep=90, issues=0), 'good' (score=75, deep=60, issues=1), 'bad' (score=50, deep=30, issues=3)
            const map = {
                'great': { overall_score: 90, deep_sleep_in_minutes: 90, sleepissue: 0 },
                'good': { overall_score: 75, deep_sleep_in_minutes: 60, sleepissue: 1 },
                'bad': { overall_score: 50, deep_sleep_in_minutes: 30, sleepissue: 3 }
            };
            const scores = map[value] || map['good'];
            setFormData(prev => ({ ...prev, ...scores }));
        }
        if (category === 'stress') {
            // value: 'calm' (score=15, stress=0), 'busy' (score=40, stress=1), 'stressed' (score=75, stress=3)
            const map = {
                'calm': { stress_score: 15, stress: 0 },
                'busy': { stress_score: 40, stress: 1 },
                'stressed': { stress_score: 75, stress: 3 }
            };
            const scores = map[value] || map['busy'];
            setFormData(prev => ({ ...prev, ...scores }));
        }
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

    // Normal Mode Simple Option Button
    const SimpleOption = ({ label, icon, isSelected, onClick }) => (
        <button
            type="button"
            onClick={onClick}
            style={{
                flex: 1,
                padding: '1rem',
                borderRadius: '12px',
                border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                background: isSelected ? 'rgba(99, 102, 241, 0.1)' : 'var(--surface)',
                color: isSelected ? 'var(--primary)' : 'var(--text-main)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
            }}
        >
            <span style={{ fontSize: '1.5rem' }}>{icon}</span>
            <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{label}</span>
        </button>
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
                .toggle-container {
                    display: flex;
                    background: #e2e8f0;
                    padding: 4px;
                    border-radius: 99px;
                    width: fit-content;
                    margin: 0 auto 2rem;
                }
                .toggle-btn {
                    padding: 8px 24px;
                    border-radius: 99px;
                    border: none;
                    background: transparent;
                    color: var(--text-secondary);
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                .toggle-btn.active {
                    background: white;
                    color: var(--primary);
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
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

            <h2 className="title-gradient" style={{ marginBottom: '1.5rem', textAlign: 'center' }}>{t('log_daily_health')}</h2>

            {/* Mode Toggle */}
            <div className="toggle-container">
                <button
                    className={`toggle-btn ${userMode === 'normal' ? 'active' : ''}`}
                    onClick={() => setUserMode('normal')}
                >
                    Normal Mode
                </button>
                <button
                    className={`toggle-btn ${userMode === 'professional' ? 'active' : ''}`}
                    onClick={() => setUserMode('professional')}
                >
                    Professional Mode
                </button>
            </div>

            <form onSubmit={handleSubmit} className="card" style={{ maxWidth: '1000px', margin: '0 auto' }}>

                {/* --- NORMAL MODE FORM --- */}
                {userMode === 'normal' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div>
                            <h3 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>How are you today?</h3>
                            <input type="date" name="date" value={formData.date} onChange={handleChange} style={{ width: '100%', padding: '12px', fontSize: '1rem' }} required />
                        </div>

                        {/* Energy Question */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: 500 }}>Energy Level</label>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <SimpleOption label="High" icon="⚡" isSelected={formData.fatigue === 0} onClick={() => handleNormalInput('energy', 'high')} />
                                <SimpleOption label="Okay" icon="🙂" isSelected={formData.fatigue === 1} onClick={() => handleNormalInput('energy', 'medium')} />
                                <SimpleOption label="Tired" icon="😴" isSelected={formData.fatigue === 3} onClick={() => handleNormalInput('energy', 'low')} />
                            </div>
                        </div>

                        {/* Sleep Question */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: 500 }}>Sleep Quality</label>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <SimpleOption label="Great" icon="🌙" isSelected={formData.sleepissue === 0} onClick={() => handleNormalInput('sleep', 'great')} />
                                <SimpleOption label="Good" icon="🛌" isSelected={formData.sleepissue === 1} onClick={() => handleNormalInput('sleep', 'good')} />
                                <SimpleOption label="Bad" icon="😫" isSelected={formData.sleepissue === 3} onClick={() => handleNormalInput('sleep', 'bad')} />
                            </div>
                        </div>

                        {/* Mood Question */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: 500 }}>Mood</label>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <SimpleOption label="Happy" icon="😊" isSelected={formData.moodswing === 0} onClick={() => handleNormalInput('mood', 'happy')} />
                                <SimpleOption label="Neutral" icon="😐" isSelected={formData.moodswing === 1} onClick={() => handleNormalInput('mood', 'neutral')} />
                                <SimpleOption label="Sad" icon="😢" isSelected={formData.moodswing === 2} onClick={() => handleNormalInput('mood', 'sad')} />
                                <SimpleOption label="Anxious" icon="😰" isSelected={formData.moodswing === 3} onClick={() => handleNormalInput('mood', 'anxious')} />
                            </div>
                        </div>

                        {/* Stress Question */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: 500 }}>Stress Level</label>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <SimpleOption label="Chill" icon="😌" isSelected={formData.stress_score <= 20 && formData.stress_score !== ''} onClick={() => handleNormalInput('stress', 'calm')} />
                                <SimpleOption label="Busy" icon="🐝" isSelected={formData.stress_score > 20 && formData.stress_score <= 50} onClick={() => handleNormalInput('stress', 'busy')} />
                                <SimpleOption label="Stressed" icon="🤯" isSelected={formData.stress_score > 50} onClick={() => handleNormalInput('stress', 'stressed')} />
                            </div>
                        </div>

                        {/* Daily Note Input (Added for both modes) */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: 500 }}>Anything else on your mind?</label>
                            <textarea
                                name="daily_note"
                                value={formData.daily_note || ''}
                                onChange={handleChange}
                                placeholder="e.g. Had a really stressful meeting today, but a nice walk helped."
                                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border)', minHeight: '100px', fontFamily: 'inherit' }}
                            />
                        </div>

                        {/* Symptoms Checklist */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: 500 }}>Physical Symptoms</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
                                <button type="button"
                                    onClick={() => setFormData(p => ({ ...p, cramps: p.cramps === 0 ? 2 : 0 }))}
                                    style={{ padding: '8px 16px', borderRadius: '20px', border: formData.cramps > 0 ? 'none' : '1px solid var(--border)', background: formData.cramps > 0 ? 'var(--secondary)' : 'transparent', color: formData.cramps > 0 ? 'white' : 'var(--text-main)' }}>
                                    Cramps
                                </button>
                                <button type="button"
                                    onClick={() => setFormData(p => ({ ...p, bloating: p.bloating === 0 ? 2 : 0 }))}
                                    style={{ padding: '8px 16px', borderRadius: '20px', border: formData.bloating > 0 ? 'none' : '1px solid var(--border)', background: formData.bloating > 0 ? 'var(--secondary)' : 'transparent', color: formData.bloating > 0 ? 'white' : 'var(--text-main)' }}>
                                    Bloating
                                </button>
                            </div>
                        </div>
                    </div>
                )}


                {/* --- PROFESSIONAL MODE FORM (Existing) --- */}
                {userMode === 'professional' && (
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

                                {/* Daily Note Input for Professional Mode */}
                                <div style={{ gridColumn: 'span 2' }}>
                                    <label style={{ fontSize: '0.85rem' }}>Additional Notes / Journal</label>
                                    <textarea
                                        name="daily_note"
                                        value={formData.daily_note || ''}
                                        onChange={handleChange}
                                        placeholder="Any specific symptoms or feelings today?"
                                        style={{ width: '100%', padding: '10px 16px', borderRadius: '12px', border: '1px solid var(--border)', minHeight: '80px', fontFamily: 'inherit' }}
                                    />
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
                )}

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
