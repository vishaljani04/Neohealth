import React, { useState, useEffect } from 'react';
import api, { healthService, predictionService, datasetService } from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Brain, TrendingUp, Calendar, Heart, Zap, Moon, Sparkles, Activity } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
    calculateWellnessScore,
    calculateWellnessTrend,
    getAIRecommendations,
    detectPatterns,
    predictNextPeriod,
    WellnessScoreCard,
    PeriodPredictionCard,
    ExplainableAI,
    MoodPredictor,
    InsightsTimeline
} from '../components/HealthIntelligence';
import Chatbot from '../components/Chatbot';

// ... (StatCard component remains same)

const Dashboard = ({ onDataUpdate }) => {
    const { t, i18n } = useTranslation();
    const [records, setRecords] = useState([]);
    const [predictions, setPredictions] = useState([]);
    const [datasets, setDatasets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        document.title = 'Dashboard | NeoHealth';
        Promise.all([
            healthService.getRecords(),
            predictionService.getHistory(),
            datasetService.list()
        ]).then(([recRes, predRes, dataRes]) => {
            setRecords(recRes.data);
            setPredictions(predRes.data);
            setDatasets(dataRes.data);
        }).finally(() => setLoading(false));
    }, []);

    const isExampleData = records.length > 0 && records[0].is_example;
    const latestPrediction = predictions[0] || (isExampleData ? { phase: 'Luteal Phase', confidence: 0.92 } : null);
    const latestRecord = records.length > 0 ? records[records.length - 1] : null;

    // --- AI Intelligence Calculations ---
    const wellnessScore = calculateWellnessScore(latestRecord);
    const wellnessTrend = calculateWellnessTrend(records); // New Trend Calculation
    const recommendations = getAIRecommendations(latestPrediction?.phase, wellnessScore);
    const patterns = detectPatterns(records, latestPrediction?.phase); // Pass Phase for PMS detection
    const nextPeriodData = predictNextPeriod(records, latestPrediction?.phase);

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: '1rem' }}>
            <Activity className="animate-spin" size={32} color="var(--primary)" />
            <p>Analyzing Health Signals...</p>
        </div>
    );

    return (
        <div style={{ padding: '0 0.5rem 4rem', width: '92%', maxWidth: '1800px', margin: '0 auto' }}>
            {/* Header Section */}
            <header className="header-flex">
                <div>
                    <h1 className="title-gradient" style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>
                        {t('app_title')}
                    </h1>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        {t('app_subtitle')}
                    </p>
                </div>
                <div className="header-right-content">
                    <div className="card glass current-phase-card">
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>{t('current_phase')}</p>
                            <h3 style={{ margin: 0, color: 'var(--primary)' }}>{latestPrediction ? latestPrediction.phase : t('needs_data')}</h3>
                        </div>
                        <Brain size={28} color="var(--primary)" />
                    </div>
                </div>
            </header >

            {/* Disclaimer Banner - Only show if using Example Data */}
            {isExampleData && (
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
                        <h4 style={{ margin: '0 0 0.2rem 0', color: '#9a3412', fontSize: '1rem' }}>Demo Environment</h4>
                        <p style={{ margin: 0, color: '#c2410c', fontSize: '0.9rem', lineHeight: '1.4' }}>
                            Welcome to NeoHealth AI Demo. The data shown here is for demonstration purposes.
                            Feel free to explore the features and test AI predictions with your own inputs.
                        </p>
                    </div>
                </div>
            )}

            {/* AI Intelligence Grid */}
            <div className="intelligence-grid">
                {/* 1. Wellness Score */}
                <WellnessScoreCard score={wellnessScore} isEstimated={latestRecord?.is_estimated} trend={wellnessTrend} />

                {/* 2. Mood & Energy */}
                <MoodPredictor phase={latestPrediction?.phase} wellnessScore={wellnessScore} isEstimated={latestRecord?.is_estimated} />

                {/* 3. Next Period Prediction */}
                <PeriodPredictionCard data={nextPeriodData} onUpdate={onDataUpdate} />

                {/* 4. Daily AI Recommendation */}
                <div className="card" style={{ background: 'linear-gradient(135deg, #1e293b, #334155)', color: 'white' }}>
                    <h3 style={{ fontSize: '0.9rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Sparkles size={16} color="#fbbf24" /> {t('ai_recommendation')}
                    </h3>
                    <ul style={{ paddingLeft: '1.2rem', fontSize: '0.95rem', lineHeight: '1.6' }}>
                        {recommendations.map((rec, i) => (
                            <li key={i} style={{ marginBottom: '0.5rem' }}>{rec}</li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Main Analytics Layout */}
            <div className="dashboard-layout">

                {/* Left Column: Charts */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* Hormone Chart */}
                    <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Activity size={20} /> {t('hormone_trends')}
                            </h3>
                            <div style={{ fontSize: '0.8rem', display: 'flex', gap: '1rem' }}>
                                <span style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>● LH Path</span>
                                <span style={{ color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>● Estrogen</span>
                            </div>
                        </div>
                        <div style={{ height: '320px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={records}>
                                    <defs>
                                        <linearGradient id="colorLh" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                    <Area type="monotone" dataKey="lh" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorLh)" />
                                    <Area type="monotone" dataKey="estrogen" stroke="var(--secondary)" strokeWidth={2} fillOpacity={0} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Vitals Chart */}
                <div className="card">
                    <h3 style={{ marginBottom: '1.5rem' }}>{t('physiological_vitals')}</h3>
                    <div style={{ height: '250px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={records}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                                <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                <Line yAxisId="left" type="monotone" dataKey="avg_resting_heart_rate" stroke="#ef4444" strokeWidth={2} dot={false} name="Heart Rate" />
                                <Line yAxisId="right" type="monotone" dataKey="daily_steps" stroke="#10b981" strokeWidth={2} dot={false} name="Steps" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Right Column: AI Insights & Stats */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                {/* Explainable AI Widget */}
                <ExplainableAI record={latestRecord} prediction={latestPrediction} />

                {/* Pattern Detection Timeline */}
                <InsightsTimeline patterns={patterns} />

                {/* Quick Stats Grid */}
                <div className="card stats-grid">
                    <div style={{ textAlign: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                        <Heart size={20} color="#ef4444" style={{ marginBottom: '0.5rem' }} />
                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{latestRecord?.avg_resting_heart_rate || '--'}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{t('bpm')}</div>
                    </div>
                    <div style={{ textAlign: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                        <Zap size={20} color="#f59e0b" style={{ marginBottom: '0.5rem' }} />
                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{latestRecord?.daily_steps ? (latestRecord.daily_steps / 1000).toFixed(1) + 'k' : '--'}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{t('steps')}</div>
                    </div>
                    <div style={{ textAlign: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                        <Moon size={20} color="#6366f1" style={{ marginBottom: '0.5rem' }} />
                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{latestRecord?.overall_score || '--'}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{t('sleep_score')}</div>
                    </div>
                    <div style={{ textAlign: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                        <TrendingUp size={20} color="#ec4899" style={{ marginBottom: '0.5rem' }} />
                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{latestRecord?.stress_score || '--'}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{t('stress_level')}</div>
                    </div>
                </div>

            </div>

            {/* AI Assistant */}
            <Chatbot healthContext={{
                phase: latestPrediction?.phase,
                wellnessScore: wellnessScore,
                lastPeriod: latestRecord?.last_period_date,
                nextPeriod: nextPeriodData?.date,
                symptoms: "None reported explicitly",
                language: i18n.language // Pass language to chatbot
            }} />
        </div>
    );
};

export default Dashboard;
