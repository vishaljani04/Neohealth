import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';
import { ArrowRight, Smartphone, Lock, Loader2, ArrowLeft, HeartPulse, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ForgotPassword = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({ mobile: '', password: '', confirmPassword: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    React.useEffect(() => {
        document.title = 'Forgot Password | NeoHealth';
    }, []);

    const handleMobileSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.mobile || formData.mobile.length < 10) {
            setError('Please enter a valid mobile number');
            return;
        }

        setLoading(true);
        try {
            const res = await authService.checkMobile(formData.mobile);
            setLoading(false);

            if (res.data.exists) {
                setStep(2);
            } else {
                setError('This mobile number is not registered with us.');
            }
        } catch (err) {
            setLoading(false);
            setError('Something went wrong. Please try again.');
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            await authService.resetPassword({
                mobile: formData.mobile,
                password: formData.password
            });
            setSuccess(true);
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container" style={{
            minHeight: '100vh',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f0f4f8'
        }}>
            {/* Animated Background */}
            <div className="bg-animation">
                <motion.div
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    style={{ position: 'absolute', top: '-10%', right: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%' }}
                />
                <motion.div
                    animate={{ scale: [1, 1.3, 1], x: [0, -50, 0] }}
                    transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
                    style={{ position: 'absolute', bottom: '-10%', left: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(236,72,153,0.15) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%' }}
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="login-card"
                style={{
                    background: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(12px)',
                    padding: '3rem',
                    borderRadius: '24px',
                    boxShadow: '0 8px 32px rgba(31, 38, 135, 0.1)',
                    width: '100%',
                    maxWidth: '420px',
                    zIndex: 10,
                    border: '1px solid rgba(255, 255, 255, 0.4)'
                }}
            >
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ display: 'inline-flex', padding: '12px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '16px', marginBottom: '1rem' }}>
                        {success ? <ShieldCheck size={32} color="#10b981" /> : <HeartPulse size={32} color="#4f46e5" />}
                    </div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '0.5rem' }}>
                        {success ? 'Password Reset!' : 'Reset Password'}
                    </h2>
                    <p style={{ color: '#64748b' }}>
                        {success ? 'You will be redirected to login shortly.' : 'Enter your mobile number to create a new password'}
                    </p>
                </div>

                <AnimatePresence mode="wait">
                    {!success && (
                        step === 1 ? (
                            <motion.form
                                key="step1"
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -20, opacity: 0 }}
                                onSubmit={handleMobileSubmit}
                            >
                                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#475569', fontWeight: '500' }}>Mobile Number</label>
                                    <div style={{ position: 'relative' }}>
                                        <Smartphone size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                        <input
                                            type="tel"
                                            value={formData.mobile}
                                            onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                            placeholder="Enter your registered mobile"
                                            style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem', outline: 'none' }}
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={{
                                        width: '100%',
                                        padding: '14px',
                                        borderRadius: '12px',
                                        background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
                                        color: 'white',
                                        border: 'none',
                                        fontSize: '1rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    {loading ? <Loader2 className="animate-spin" size={20} /> : <>Verify Mobile <ArrowRight size={20} /></>}
                                </button>
                                <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                                    <Link to="/login" style={{ color: '#64748b', fontSize: '0.9rem', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                        <ArrowLeft size={16} /> Back to Login
                                    </Link>
                                </div>
                            </motion.form>
                        ) : (
                            <motion.form
                                key="step2"
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: 20, opacity: 0 }}
                                onSubmit={handleResetPassword}
                            >
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#475569', fontWeight: '500' }}>New Password</label>
                                    <div style={{ position: 'relative' }}>
                                        <Lock size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            placeholder="Min 6 characters"
                                            style={{ width: '100%', padding: '12px 40px 12px 40px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem', outline: 'none' }}
                                            required
                                            autoFocus
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                        >
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </div>

                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#475569', fontWeight: '500' }}>Confirm Password</label>
                                    <div style={{ position: 'relative' }}>
                                        <Lock size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                            placeholder="Confirm your new password"
                                            style={{ width: '100%', padding: '12px 40px 12px 40px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem', outline: 'none' }}
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={{
                                        width: '100%',
                                        padding: '14px',
                                        borderRadius: '12px',
                                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                        color: 'white',
                                        border: 'none',
                                        fontSize: '1rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    {loading ? <Loader2 className="animate-spin" size={20} /> : 'Reset Password'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    style={{ width: '100%', marginTop: '1rem', background: 'none', border: 'none', color: '#4f46e5', fontSize: '0.9rem', cursor: 'pointer' }}
                                >
                                    Change Mobile Number
                                </button>
                            </motion.form>
                        )
                    )}
                </AnimatePresence>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ marginTop: '1rem', padding: '0.8rem', borderRadius: '8px', background: '#fee2e2', color: '#ef4444', fontSize: '0.9rem', textAlign: 'center' }}
                    >
                        {error}
                    </motion.div>
                )}

                {success && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{ marginTop: '1rem', padding: '1rem', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: '#059669', fontSize: '0.95rem', textAlign: 'center', fontWeight: '500', border: '1px solid rgba(16, 185, 129, 0.2)' }}
                    >
                        Password updated successfully!
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
