import React, { useState, useEffect } from 'react';
import api, { healthService, predictionService, datasetService } from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Brain, TrendingUp, Calendar, Heart, Zap, Moon, Sparkles, Activity } from 'lucide-react';
import {
    calculateWellnessScore,
    getAIRecommendations,
    detectPatterns,
    predictNextPeriod,
    WellnessScoreCard,
    PeriodPredictionCard,
    ExplainableAI,
    MoodPredictor,
    InsightsTimeline
} from '../components/HealthIntelligence';

const StatCard = ({ icon, label, value, unit }) => (
    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ padding: '0.8rem', borderRadius: '12px', background: 'var(--background)' }}>
            {icon}
        </div>
        <div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>{label}</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.3rem' }}>
                <h3 style={{ margin: 0 }}>{value}</h3>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{unit}</span>
            </div>
        </div>
    </div>
);

const Dashboard = ({ onDataUpdate }) => {
    const [records, setRecords] = useState([]);
    const [predictions, setPredictions] = useState([]);
    const [datasets, setDatasets] = useState([]);
    const [globalSummary, setGlobalSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            healthService.getRecords(),
            predictionService.getHistory(),
            datasetService.list(),
            api.get('/datasets/summary').catch(() => ({ data: null }))
        ]).then(([recRes, predRes, dataRes, globalRes]) => {
            setRecords(recRes.data);
            setPredictions(predRes.data);
            setDatasets(dataRes.data);
            setGlobalSummary(globalRes.data);
        }).finally(() => setLoading(false));
    }, []);

    const isExampleData = records.length > 0 && records[0].is_example;
    const latestPrediction = predictions[0] || (isExampleData ? { phase: 'Luteal Phase', confidence: 0.92 } : null);
    const latestRecord = records.length > 0 ? records[records.length - 1] : null;

    // --- AI Intelligence Calculations ---
    const wellnessScore = calculateWellnessScore(latestRecord);
    const recommendations = getAIRecommendations(latestPrediction?.phase, wellnessScore);
    const patterns = detectPatterns(records);
    const nextPeriodData = predictNextPeriod(records, latestPrediction?.phase);

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: '1rem' }}>
            <Activity className="animate-spin" size={32} color="var(--primary)" />
            <p>Analyzing Health Signals...</p>
        </div>
    );

    return (
        <div style={{ padding: '0 2rem 4rem', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header Section */}
            <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 className="title-gradient" style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>
                        NeoHealth Intelligence
                    </h1>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        AI-Powered Cycle & Wellness Analytics
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div className="card glass" style={{ padding: '0.8rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>Current Phase</p>
                            <h3 style={{ margin: 0, color: 'var(--primary)' }}>{latestPrediction ? latestPrediction.phase : 'Needs Data'}</h3>
                        </div>
                        <Brain size={28} color="var(--primary)" />
                    </div>
                </div>
            </header>

            {/* AI Intelligence Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                {/* 1. Wellness Score */}
                <WellnessScoreCard score={wellnessScore} />

                {/* 2. Mood & Energy */}
                <MoodPredictor phase={latestPrediction?.phase} wellnessScore={wellnessScore} />

                {/* 3. Next Period Prediction */}
                <PeriodPredictionCard data={nextPeriodData} onUpdate={onDataUpdate} />

                {/* 4. Daily AI Recommendation */}
                <div className="card" style={{ background: 'linear-gradient(135deg, #1e293b, #334155)', color: 'white' }}>
                    <h3 style={{ fontSize: '0.9rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Sparkles size={16} color="#fbbf24" /> AI RECOMMENDATION
                    </h3>
                    <ul style={{ paddingLeft: '1.2rem', fontSize: '0.95rem', lineHeight: '1.6' }}>
                        {recommendations.map((rec, i) => (
                            <li key={i} style={{ marginBottom: '0.5rem' }}>{rec}</li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Main Analytics Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', alignItems: 'start' }}>

                {/* Left Column: Charts */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* Hormone Chart */}
                    <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Activity size={20} /> Hormone Trends
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

                    {/* Vitals Chart */}
                    <div className="card">
                        <h3 style={{ marginBottom: '1.5rem' }}>Physiological Vitals</h3>
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
                    <div className="card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={{ textAlign: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                            <Heart size={20} color="#ef4444" style={{ marginBottom: '0.5rem' }} />
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{latestRecord?.avg_resting_heart_rate || '--'}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>BPM</div>
                        </div>
                        <div style={{ textAlign: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                            <Zap size={20} color="#f59e0b" style={{ marginBottom: '0.5rem' }} />
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{latestRecord?.daily_steps ? (latestRecord.daily_steps / 1000).toFixed(1) + 'k' : '--'}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Steps</div>
                        </div>
                        <div style={{ textAlign: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                            <Moon size={20} color="#6366f1" style={{ marginBottom: '0.5rem' }} />
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{latestRecord?.overall_score || '--'}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Sleep Score</div>
                        </div>
                        <div style={{ textAlign: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                            <TrendingUp size={20} color="#ec4899" style={{ marginBottom: '0.5rem' }} />
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{latestRecord?.stress_score || '--'}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Stress Level</div>
                        </div>
                    </div>

                    {/* Global Data Card */}
                    {globalSummary && (
                        <div className="card" style={{ background: '#0f172a', color: 'white' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', opacity: 0.9 }}>
                                <Brain size={16} /> Community Insights
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
                                <div>
                                    <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{(globalSummary.total_steps / 1000000).toFixed(1)}M</div>
                                    <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Steps tracked globally</div>
                                </div>
                                <div style={{ fontSize: '0.8rem', padding: '4px 8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>
                                    {globalSummary.total_records.toLocaleString()} Records
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
};

export default Dashboard;
