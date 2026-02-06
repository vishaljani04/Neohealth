import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, LogOut, LayoutDashboard, PlusCircle, User, Settings, Database, ChevronDown } from 'lucide-react';
import ProfileModal from './ProfileModal';
import HealthDataModal from './HealthDataModal';

const Navbar = ({ user, setUser, onDataUpdate }) => {
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showDataModal, setShowDataModal] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setUser(null);
        navigate('/login');
    };

    return (
        <>
            <nav className="glass" style={{
                position: 'sticky', top: 0, zIndex: 100,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '1rem 2rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Activity color="var(--primary)" size={28} />
                    <span className="title-gradient" style={{ fontSize: '1.5rem' }}>NeoHealth AI</span>
                </div>

                <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                    <Link to="/" style={{ textDecoration: 'none', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 500 }}>
                        <LayoutDashboard size={18} /> Dashboard
                    </Link>
                    <Link to="/input" style={{ textDecoration: 'none', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 500 }}>
                        <PlusCircle size={18} /> Add Health Data
                    </Link>

                    {/* User Dropdown */}
                    <div style={{ position: 'relative' }} ref={dropdownRef}>
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                background: 'white', border: '1px solid var(--border)',
                                padding: '0.5rem 1rem', borderRadius: '20px', cursor: 'pointer',
                                boxShadow: 'var(--shadow)'
                            }}
                        >
                            <div style={{ width: '28px', height: '28px', background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.9rem' }}>
                                {user.username.charAt(0).toUpperCase()}
                            </div>
                            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user.username}</span>
                            <ChevronDown size={16} color="var(--text-secondary)" />
                        </button>

                        {dropdownOpen && (
                            <div style={{
                                position: 'absolute', top: '120%', right: 0, width: '220px',
                                background: 'white', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                border: '1px solid var(--border)', overflow: 'hidden', padding: '0.5rem'
                            }}>
                                <div style={{ padding: '0.8rem', borderBottom: '1px solid var(--border)', marginBottom: '0.5rem' }}>
                                    <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem' }}>{user.username}</p>
                                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</p>
                                </div>

                                <button
                                    onClick={() => { setShowProfileModal(true); setDropdownOpen(false); }}
                                    className="dropdown-item"
                                    style={{ width: '100%', textAlign: 'left', padding: '0.6rem 0.8rem', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem', color: 'var(--text-main)', borderRadius: '6px' }}
                                >
                                    <User size={16} /> Profile Management
                                </button>

                                <button
                                    onClick={() => { setShowDataModal(true); setDropdownOpen(false); }}
                                    className="dropdown-item"
                                    style={{ width: '100%', textAlign: 'left', padding: '0.6rem 0.8rem', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem', color: 'var(--text-main)', borderRadius: '6px' }}
                                >
                                    <Database size={16} /> Health Data
                                </button>

                                <div style={{ borderTop: '1px solid var(--border)', margin: '0.5rem 0' }}></div>

                                <button
                                    onClick={handleLogout}
                                    style={{ width: '100%', textAlign: 'left', padding: '0.6rem 0.8rem', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem', color: '#ef4444', borderRadius: '6px' }}
                                >
                                    <LogOut size={16} /> Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            {showProfileModal && (
                <ProfileModal
                    user={user}
                    onClose={() => setShowProfileModal(false)}
                    onUpdate={(updatedUser) => setUser(updatedUser)}
                />
            )}

            {showDataModal && (
                <HealthDataModal
                    onClose={() => setShowDataModal(false)}
                    onDataUpdate={onDataUpdate}
                />
            )}

            <style>{`
                .dropdown-item:hover { background-color: #f1f5f9 !important; }
            `}</style>
        </>
    );
};

export default Navbar;
