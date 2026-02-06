import React, { useState } from 'react';
import { User, Mail, Lock, X } from 'lucide-react';
import { authService } from '../services/api';

const ProfileModal = ({ user, onClose, onUpdate }) => {
    const [formData, setFormData] = useState({
        username: user.username,
        email: user.email,
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const res = await authService.updateProfile(formData);
            setMessage('Profile updated successfully!');
            if (onUpdate) onUpdate(res.data.user);
            setTimeout(onClose, 1500);
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
            <div className="card" style={{ width: '400px', position: 'relative' }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer' }}>
                    <X size={20} color="var(--text-secondary)" />
                </button>

                <h2 className="title-gradient" style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Manage Profile</h2>

                {message && <div style={{ padding: '0.8rem', background: '#dcfce7', color: '#166534', borderRadius: '8px', marginBottom: '1rem', textAlign: 'center' }}>{message}</div>}
                {error && <div style={{ padding: '0.8rem', background: '#fee2e2', color: '#ef4444', borderRadius: '8px', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Full Name</label>
                        <div style={{ position: 'relative' }}>
                            <User size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                            <input
                                type="text"
                                value={formData.username}
                                onChange={e => setFormData({ ...formData, username: e.target.value })}
                                style={{ width: '100%', paddingLeft: '35px' }}
                                required
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Email</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                            <input
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                style={{ width: '100%', paddingLeft: '35px' }}
                                required
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>New Password (Optional)</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                            <input
                                type="password"
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                placeholder="Leave blank to keep current"
                                style={{ width: '100%', paddingLeft: '35px' }}
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', padding: '12px' }}>
                        {loading ? 'Saving...' : 'Update Profile'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProfileModal;
