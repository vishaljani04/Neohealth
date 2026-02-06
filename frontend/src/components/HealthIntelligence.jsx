import React, { useState } from 'react';
import { Brain, CloudRain, Sun, Zap, AlertTriangle, TrendingUp, Activity, Moon, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

// --- Logic Layer (Heuristics) ---

import { useTranslation } from 'react-i18next';

// --- Logic Layer (Heuristics) ---

export const calculateWellnessScore = (record) => {
    if (!record) return 0;
    // Weighted formula: Sleep (40%) + Stress (30%) + Steps (30%)
    const sleepScore = record.overall_score || 70;
    const stressScore = Math.max(0, 100 - (record.stress_score || 50));
    const stepScore = Math.min(100, ((record.daily_steps || 5000) / 10000) * 100);

    return Math.round((sleepScore * 0.4) + (stressScore * 0.3) + (stepScore * 0.3));
};

export const predictNextPeriod = (records, currentPhase) => {
    // 1. Find unique period start dates
    const periodDates = records && records.length > 0 ? records
        .filter(r => r.last_period_date)
        .map(r => r.last_period_date)
        .filter((v, i, a) => a.indexOf(v) === i)
        .sort() : [];

    // Fallback if no records
    const lastPeriod = periodDates.length > 0 ? periodDates[periodDates.length - 1] : new Date().toISOString().split('T')[0];

    // Priority: Manual Setting > History Calc > Default 28
    let avgCycle = 28;
    let isManual = false;

    const storedCycle = localStorage.getItem('neohealth_cycle_length');
    if (storedCycle) {
        avgCycle = parseInt(storedCycle);
        isManual = true;
    } else if (periodDates.length >= 2) {
        let totalDays = 0;
        let count = 0;
        for (let i = 1; i < periodDates.length; i++) {
            const d1 = new Date(periodDates[i]);
            const d2 = new Date(periodDates[i - 1]);
            const diff = (d1 - d2) / (1000 * 60 * 60 * 24);
            if (diff > 20 && diff < 45) { // reasonable cycle filter
                totalDays += diff;
                count++;
            }
        }
        if (count > 0) avgCycle = Math.round(totalDays / count);
    }

    // 3. Predict Next
    const lastDateObj = new Date(lastPeriod);
    const nextDateObj = new Date(lastDateObj);
    nextDateObj.setDate(lastDateObj.getDate() + avgCycle);

    const today = new Date();
    const daysUntil = Math.ceil((nextDateObj - today) / (1000 * 60 * 60 * 24));

    // Format Next Date
    const nextDateStr = nextDateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    // AI Explanation context
    let explanation = `Based on ${isManual ? 'your manual' : 'avg'} ${avgCycle}-day cycle.`;
    let confidence = "Medium";

    const p = currentPhase?.toLowerCase() || '';
    if (p.includes('luteal')) {
        explanation = "Luteal phase indicators confirm period is approaching.";
        confidence = "High";
    } else if (p.includes('menstruation')) {
        explanation = "Currently in menstruation phase.";
        confidence = "Max";
    }

    return {
        date: nextDateStr,
        daysUntil: daysUntil > 0 ? daysUntil : 0,
        explanation,
        confidence,
        isMenstruating: p.includes('menstruation'),
        avgCycle
    };
};

export const getMoodPrediction = (phase, sleepScore) => {
    if (sleepScore < 60) return { mood: 'Exhausted', icon: <CloudRain color="#94a3b8" /> };
    // Translate keys handled in component
    const p = phase?.toLowerCase() || '';
    if (p.includes('luteal')) return { mood: 'Reflective / Low Energy', icon: <Moon color="#6366f1" /> };
    if (p.includes('follicular')) return { mood: 'Energetic / Creative', icon: <Sun color="#f59e0b" /> };
    if (p.includes('ovulation')) return { mood: 'Peak Confidence', icon: <Zap color="#ec4899" /> };
    if (p.includes('menstruation')) return { mood: 'Rest & Recover', icon: <Activity color="#ef4444" /> };

    return { mood: 'Balanced', icon: <Brain color="#10b981" /> };
};

export const getAIRecommendations = (phase, wellnessScore) => {
    const recs = [];
    if (wellnessScore < 50) recs.push("Prioritize sleep tonight. Your recovery score is low.");

    const p = phase?.toLowerCase() || '';
    if (p.includes('luteal')) {
        recs.push("Reduce caffeine intake to manage potential anxiety.");
        recs.push("Light yoga or walking is better than HIIT today.");
    } else if (p.includes('follicular')) {
        recs.push("Great time to start a new project or intense workout.");
        recs.push("Optimize protein intake for energy.");
    } else if (p.includes('ovulation')) {
        recs.push("Social energy is high – connect with friends.");
    } else if (p.includes('menstruation')) {
        recs.push("Focus on iron-rich foods.");
        recs.push("Magnesium can help with cramps and sleep.");
    }

    if (recs.length === 0) recs.push("Maintain your current healthy rhythm!");
    return recs;
};

export const detectPatterns = (history) => {
    if (!history || history.length < 3) return [];

    const patterns = [];
    const recent = history.slice(-3); // Last 3 days

    // Check increasing stress
    if (recent[0].stress_score < recent[1].stress_score && recent[1].stress_score < recent[2].stress_score) {
        patterns.push({ type: 'warning', msg: 'Stress levels are trending upward over the last 3 days.' });
    }

    // Check low sleep
    const avgSleep = recent.reduce((sum, r) => sum + (r.overall_score || 0), 0) / 3;
    if (avgSleep < 70) {
        patterns.push({ type: 'alert', msg: 'Consistent low sleep quality detected.' });
    }

    if (patterns.length === 0) patterns.push({ type: 'success', msg: 'No negative health trends detected.' });
    return patterns;
};

// --- Components ---

export const WellnessScoreCard = ({ score }) => {
    const { t } = useTranslation();
    return (
        <div className="card glass" style={{ textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: `linear-gradient(90deg, #ef4444 ${score}%, #e2e8f0 ${score}%)` }}></div>
            <h3 style={{ marginTop: '1rem', color: 'var(--text-secondary)', fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('wellness_score')}</h3>
            <div style={{ fontSize: '4.5rem', fontWeight: 'bold', color: score > 75 ? 'var(--success)' : score > 50 ? 'var(--warning)' : 'var(--danger)' }}>
                {score || 0}
            </div>
            <p style={{ fontSize: '1.2rem', opacity: 0.9, fontWeight: 500 }}>
                {score > 80 ? t('excellent_balance') : score > 50 ? t('moderate_health') : t('needs_attention')}
            </p>
        </div>
    );
};

export const PeriodPredictionCard = ({ data, onUpdate }) => {
    const { t } = useTranslation();
    const [isEditing, setIsEditing] = useState(false);
    const [manualCycle, setManualCycle] = useState(data?.avgCycle || 28);

    if (!data) return (
        <div className="card glass" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'var(--text-secondary)' }}>
            <Calendar size={32} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <p>{t('log_period_msg')}</p>
        </div>
    );

    const handleSave = () => {
        localStorage.setItem('neohealth_cycle_length', manualCycle);
        setIsEditing(false);
        if (onUpdate) onUpdate(); // Trigger refresh
    };

    return (
        <div className="card glass" style={{ background: 'linear-gradient(135deg, rgba(236,72,153,0.05), rgba(99,102,241,0.05))', position: 'relative' }}>

            {/* Edit Button */}
            <button
                onClick={() => setIsEditing(!isEditing)}
                style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', opacity: 0.6 }}
            >
                <TrendingUp size={16} />
            </button>

            <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={18} /> {t('cycle_prediction')}
            </h3>

            {isEditing ? (
                <div style={{ padding: '1rem 0' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Set Average Cycle Length (Days):</label>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <input
                            type="number"
                            value={manualCycle}
                            onChange={(e) => setManualCycle(e.target.value)}
                            style={{ width: '60px', padding: '5px', borderRadius: '4px', border: '1px solid var(--border)' }}
                        />
                        <button onClick={handleSave} className="btn-primary" style={{ padding: '0 10px', fontSize: '0.8rem' }}>{t('save')}</button>
                    </div>
                </div>
            ) : (
                <>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.8rem', marginBottom: '0.5rem' }}>
                        <h2 style={{ fontSize: '2.2rem', margin: 0, color: 'var(--primary)' }}>
                            {data.isMenstruating ? t('active') : data.date}
                        </h2>
                        {!data.isMenstruating && (
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                                {t('next_period_in', { days: data.daysUntil })}
                            </span>
                        )}
                    </div>

                    <div style={{ padding: '0.6rem', background: 'rgba(255,255,255,0.6)', borderRadius: '8px', fontSize: '0.9rem', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                            <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{t('ai_confidence')}:</span>
                            <span style={{ color: data.confidence === 'High' || data.confidence === 'Max' ? 'var(--success)' : 'var(--warning)', fontWeight: 600 }}>{data.confidence}</span>
                        </div>
                        <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                            {data.explanation}
                        </p>
                    </div>
                </>
            )}
        </div>
    );
};

export const ExplainableAI = ({ record, prediction }) => {
    const { t } = useTranslation();
    if (!record || !prediction) return null;

    // Mock Explanation logic (since we don't have SHAP values from backend)
    const factors = [];
    try {
        if ((record.lh || 0) > 10) factors.push({ name: 'High LH Level', impact: 'Strong indicator of Ovulation' });
        if ((record.pdg || 0) > 5) factors.push({ name: 'Elevated PdG', impact: 'Confirms Luteal Phase' });
        if ((record.estrogen || 0) > 200) factors.push({ name: 'Estrogen Peak', impact: 'Follicular-Ovulation Transition' });
        if ((record.avg_resting_heart_rate || 0) > 75) factors.push({ name: 'Elevated HRV', impact: 'Common in Luteal Phase' });
    } catch (e) {
        console.error("Error in ExplainableAI factors", e);
    }

    return (
        <div className="card">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.2rem', fontSize: '1.5rem' }}>
                <Brain size={24} color="var(--primary)" /> {t('why_prediction')}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {factors.length > 0 ? factors.map((f, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', paddingBottom: '0.6rem', borderBottom: '1px dashed var(--border)' }}>
                        <span style={{ fontWeight: 600 }}>{f.name}</span>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>{f.impact}</span>
                    </div>
                )) : (
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Detailed factors require more drastic hormone shifts.</p>
                )}
            </div>
        </div>
    );
};

export const MoodPredictor = ({ phase, wellnessScore }) => {
    const { t } = useTranslation();
    const { mood, icon } = getMoodPrediction(phase, wellnessScore);
    return (
        <div className="card glass" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(236,72,153,0.1))' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('mood_energy')}</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                <div style={{ padding: '1rem', background: 'white', borderRadius: '50%', boxShadow: 'var(--shadow)' }}>
                    {icon}
                </div>
                <div>
                    <h2 style={{ margin: 0, fontSize: '1.8rem' }}>{mood}</h2>
                    <p style={{ fontSize: '1rem', opacity: 0.8 }}>{t('based_on_sleep')}</p>
                </div>
            </div>
        </div>
    );
};

export const InsightsTimeline = ({ patterns }) => (
    <div className="card">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <TrendingUp size={20} /> AI Pattern Detection
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {patterns.map((p, i) => (
                <div key={i} style={{
                    padding: '0.8rem',
                    borderRadius: '8px',
                    background: p.type === 'alert' ? '#fee2e2' : p.type === 'warning' ? '#fef3c7' : '#dcfce7',
                    color: p.type === 'alert' ? '#ef4444' : p.type === 'warning' ? '#d97706' : '#166534',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.8rem',
                    fontSize: '0.9rem'
                }}>
                    {p.type === 'alert' ? <AlertTriangle size={18} /> : p.type === 'warning' ? <Activity size={18} /> : <Zap size={18} />}
                    {p.msg}
                </div>
            ))}
        </div>
    </div>
);
