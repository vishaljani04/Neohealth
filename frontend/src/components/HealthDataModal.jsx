import React, { useState, useEffect } from 'react';
import { X, Edit2, Save, Trash2, Activity } from 'lucide-react';
import { healthService } from '../services/api';

const HealthDataModal = ({ onClose, onDataUpdate }) => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchRecords();
    }, []);

    const fetchRecords = async () => {
        try {
            const res = await healthService.getRecords();
            // Filter out sample data if any
            const realRecords = res.data.filter(r => !r.is_example);
            setRecords(realRecords);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (record) => {
        setEditingId(record.id);
        setEditForm({ ...record });
    };

    const handleSave = async (id) => {
        try {
            await healthService.updateRecord(id, editForm);
            setEditingId(null);
            fetchRecords(); // Refresh list
            if (onDataUpdate) onDataUpdate(); // Trigger parent refresh (dashboard)
        } catch (err) {
            setError("Failed to update record");
            setTimeout(() => setError(null), 3000);
        }
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditForm({});
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
            <div className="card" style={{ width: '900px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2 className="title-gradient" style={{ margin: 0 }}>Health Data Management</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                        <X size={24} color="var(--text-secondary)" />
                    </button>
                </div>

                {error && <div style={{ color: 'red', marginBottom: '0.5rem', textAlign: 'center' }}>{error}</div>}

                <div style={{ overflowY: 'auto', flex: 1 }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '2rem' }}>Loading Records...</div>
                    ) : records.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                            No personal health records found. Add data to see it here.
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left' }}>
                                    <th style={{ padding: '10px' }}>Date</th>
                                    <th style={{ padding: '10px' }}>Heart Rate</th>
                                    <th style={{ padding: '10px' }}>Steps</th>
                                    <th style={{ padding: '10px' }}>Sleep Score</th>
                                    <th style={{ padding: '10px' }}>Stress</th>
                                    <th style={{ padding: '10px', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {records.map(record => (
                                    <tr key={record.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        {editingId === record.id ? (
                                            <>
                                                <td style={{ padding: '10px' }}>{record.date}</td>
                                                <td style={{ padding: '10px' }}>
                                                    <input
                                                        type="number"
                                                        value={editForm.avg_resting_heart_rate || ''}
                                                        onChange={e => setEditForm({ ...editForm, avg_resting_heart_rate: e.target.value })}
                                                        style={{ width: '60px', padding: '4px' }}
                                                    />
                                                </td>
                                                <td style={{ padding: '10px' }}>
                                                    <input
                                                        type="number"
                                                        value={editForm.daily_steps || ''}
                                                        onChange={e => setEditForm({ ...editForm, daily_steps: e.target.value })}
                                                        style={{ width: '80px', padding: '4px' }}
                                                    />
                                                </td>
                                                <td style={{ padding: '10px' }}>
                                                    <input
                                                        type="number"
                                                        value={editForm.overall_score || ''}
                                                        onChange={e => setEditForm({ ...editForm, overall_score: e.target.value })}
                                                        style={{ width: '60px', padding: '4px' }}
                                                    />
                                                </td>
                                                <td style={{ padding: '10px' }}>
                                                    <input
                                                        type="number"
                                                        value={editForm.stress_score || ''}
                                                        onChange={e => setEditForm({ ...editForm, stress_score: e.target.value })}
                                                        style={{ width: '60px', padding: '4px' }}
                                                    />
                                                </td>
                                                <td style={{ padding: '10px', textAlign: 'right' }}>
                                                    <button onClick={() => handleSave(record.id)} className="btn-primary" style={{ marginRight: '0.5rem', padding: '4px 8px', fontSize: '0.8rem' }}>
                                                        <Save size={14} />
                                                    </button>
                                                    <button onClick={handleCancel} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer' }}>
                                                        <X size={14} />
                                                    </button>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td style={{ padding: '10px' }}>{record.date}</td>
                                                <td style={{ padding: '10px' }}>{record.avg_resting_heart_rate}</td>
                                                <td style={{ padding: '10px' }}>{record.daily_steps}</td>
                                                <td style={{ padding: '10px' }}>{record.overall_score}</td>
                                                <td style={{ padding: '10px' }}>{record.stress_score}</td>
                                                <td style={{ padding: '10px', textAlign: 'right' }}>
                                                    <button onClick={() => handleEdit(record)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)' }}>
                                                        <Edit2 size={16} />
                                                    </button>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HealthDataModal;
