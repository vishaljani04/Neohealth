import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Activity } from 'lucide-react';

const SplashScreen = ({ onFinish }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onFinish();
        }, 2500);
        return () => clearTimeout(timer);
    }, [onFinish]);

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            color: 'white'
        }}>
            <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, type: "spring" }}
                style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}
            >
                <div style={{ position: 'relative' }}>
                    <Heart size={64} fill="#ec4899" stroke="none" />
                    <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        style={{ position: 'absolute', inset: 0 }}
                    >
                        <Activity size={64} color="white" style={{ opacity: 0.8 }} />
                    </motion.div>
                </div>
            </motion.div>

            <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                style={{ fontSize: '2.5rem', fontWeight: 'bold', background: 'linear-gradient(to right, #fff, #a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
            >
                NeoHealth AI
            </motion.h1>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                transition={{ delay: 1 }}
                style={{ marginTop: '0.5rem', fontSize: '1rem' }}
            >
                Smart Health Intelligence
            </motion.p>
        </div>
    );
};

export default SplashScreen;
