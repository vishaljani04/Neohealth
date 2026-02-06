import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, LogOut, LayoutDashboard, PlusCircle, User, Settings, Database, ChevronDown, Globe } from 'lucide-react';
import ProfileModal from './ProfileModal';
import HealthDataModal from './HealthDataModal';
import { useTranslation } from 'react-i18next';

const Navbar = ({ user, setUser, onDataUpdate }) => {
    const navigate = useNavigate();
    const dropdownRef = useRef(null);
    const langDropdownRef = useRef(null);
    const { t, i18n } = useTranslation();

    // UI State
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showHealthModal, setShowHealthModal] = useState(false);
    const [langDropdownOpen, setLangDropdownOpen] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setUser(null);
        navigate('/login');
    };

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
        setLangDropdownOpen(false);
    };

    // Click outside handler
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
            if (langDropdownRef.current && !langDropdownRef.current.contains(event.target)) {
                setLangDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

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

                    {/* Language Switcher */}
                    <div style={{ position: 'relative' }} ref={langDropdownRef}>
                        <button
                            onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                        >
                            <Globe size={18} />
                            <span style={{ textTransform: 'uppercase', fontSize: '0.9rem', fontWeight: 600 }}>{i18n.language}</span>
                            <ChevronDown size={16} color="var(--text-secondary)" />
                        </button>
                        {langDropdownOpen && (
                            <div style={{
                                position: 'absolute', top: '120%', right: 0, width: '120px',
                                background: 'white', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                border: '1px solid var(--border)', overflow: 'hidden', padding: '0.2rem', zIndex: 1000
                            }}>
                                <div onClick={() => changeLanguage('en')} className="dropdown-item" style={{ padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '0.9rem' }}>English</div>
                                <div onClick={() => changeLanguage('hi')} className="dropdown-item" style={{ padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '0.9rem' }}>हिंदी (Hindi)</div>
                                <div onClick={() => changeLanguage('gu')} className="dropdown-item" style={{ padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '0.9rem' }}>ગુજરાતી (Guj)</div>
                            </div>
                        )}
                    </div>

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
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{user.email}</p>
                                </div>

                                <button
                                    onClick={() => { setShowProfileModal(true); setDropdownOpen(false); }}
                                    className="dropdown-item"
                                    style={{ width: '100%', padding: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '6px', textAlign: 'left', fontSize: '0.9rem', color: 'var(--text-main)' }}
                                >
                                    <User size={16} /> {t('profile')}
                                </button>

                                <button
                                    onClick={() => { setShowHealthModal(true); setDropdownOpen(false); }}
                                    className="dropdown-item"
                                    style={{ width: '100%', padding: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '6px', textAlign: 'left', fontSize: '0.9rem', color: 'var(--text-main)' }}
                                >
                                    <Database size={16} /> {t('health_data')}
                                </button>

                                <div style={{ height: '1px', background: 'var(--border)', margin: '0.5rem 0' }}></div>

                                <button
                                    onClick={handleLogout}
                                    className="dropdown-item"
                                    style={{ width: '100%', padding: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '6px', textAlign: 'left', fontSize: '0.9rem', color: '#ef4444' }}
                                >
                                    <LogOut size={16} /> {t('logout')}
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
                    onUpdate={(updatedUser) => {
                        setUser(updatedUser);
                        if (onDataUpdate) onDataUpdate();
                    }}
                />
            )}

            {showHealthModal && (
                <HealthDataModal
                    onClose={() => setShowHealthModal(false)}
                    onDataUpdate={onDataUpdate}
                />
            )}
            <style>{`
                .dropdown-item:hover { background-color: #f1f5f9; }
            `}</style>
        </>
    );
};

export default Navbar;
