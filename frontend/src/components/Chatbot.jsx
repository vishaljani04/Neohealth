import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Minimize2, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

import { useTranslation } from 'react-i18next';

const Chatbot = ({ healthContext }) => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: t('chatbot.initialMessage'), sender: 'bot' }
    ]);
    const [modelType, setModelType] = useState('llama');
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        const userMsg = { id: Date.now(), text: inputText, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setIsTyping(true);

        try {
            // Send to backend with context
            const res = await api.post('/chat/message', {
                message: userMsg.text,
                context: healthContext,
                model: modelType
            });

            const botMsg = { id: Date.now() + 1, text: res.data.response, sender: 'bot' };
            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            const errorMsg = { id: Date.now() + 1, text: t('chatbot.connectionError'), sender: 'bot', isError: true };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="chatbot-container" style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className="card glass chatbot-window"
                        style={{
                            width: isExpanded ? '500px' : '380px',
                            height: isExpanded ? '700px' : '550px',
                            marginBottom: '1rem',
                            display: 'flex',
                            flexDirection: 'column',
                            padding: 0,
                            overflow: 'hidden',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                            border: '1px solid rgba(255, 255, 255, 0.4)'
                        }}
                    >
                        {/* Header */}
                        <div style={{
                            padding: '1rem',
                            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                            color: 'white',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{ background: 'white', padding: '4px', borderRadius: '50%' }}>
                                    <Bot size={20} color="var(--primary)" />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '0.95rem' }}>{t('chatbot.headerTitle')}</h3>
                                    <span style={{ fontSize: '0.7rem', opacity: 0.8, display: 'block' }}>{t('chatbot.headerSubtitle')}</span>
                                </div>
                            </div>



                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button onClick={() => setIsExpanded(!isExpanded)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                                    {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                                </button>
                                <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                            {messages.map(msg => (
                                <div key={msg.id} style={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                                    <div style={{
                                        maxWidth: '80%',
                                        padding: '0.8rem 1rem',
                                        borderRadius: '12px',
                                        background: msg.sender === 'user' ? 'var(--primary)' : 'white',
                                        color: msg.sender === 'user' ? 'white' : 'var(--text-main)',
                                        borderTopLeftRadius: msg.sender === 'bot' ? '2px' : '12px',
                                        borderTopRightRadius: msg.sender === 'user' ? '2px' : '12px',
                                        boxShadow: msg.sender === 'bot' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                                        fontSize: '0.9rem',
                                        lineHeight: '1.5',
                                        whiteSpace: 'pre-wrap'
                                    }}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                                    <div style={{ background: 'white', padding: '0.8rem 1rem', borderRadius: '12px', borderTopLeftRadius: '2px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                        <div className="typing-dot" style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#cbd5e1', marginRight: '4px', animation: 'typing 1.4s infinite ease-in-out both' }}></div>
                                        <div className="typing-dot" style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#cbd5e1', marginRight: '4px', animation: 'typing 1.4s infinite ease-in-out both', animationDelay: '0.16s' }}></div>
                                        <div className="typing-dot" style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#cbd5e1', animation: 'typing 1.4s infinite ease-in-out both', animationDelay: '0.32s' }}></div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSendMessage} style={{ padding: '0.8rem', background: 'white', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.5rem' }}>
                            <input
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder={t('chatbot.inputPlaceholder')}
                                style={{ flex: 1, padding: '0.6rem 1rem', borderRadius: '20px', border: '1px solid var(--border)', fontSize: '0.9rem', outline: 'none' }}
                            />
                            <button
                                type="submit"
                                disabled={!inputText.trim() || isTyping}
                                style={{
                                    background: inputText.trim() ? 'var(--primary)' : '#cbd5e1',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '36px',
                                    height: '36px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: inputText.trim() ? 'pointer' : 'default',
                                    transition: 'background 0.2s'
                                }}
                            >
                                <Send size={16} />
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Action Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                    border: 'none',
                    boxShadow: '0 4px 14px rgba(79, 70, 229, 0.4)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                }}
            >
                {isOpen ? <X size={28} /> : <Bot size={28} />}
            </motion.button>

            <style>{`
                @keyframes typing {
                    0%, 80%, 100% { transform: scale(0); }
                    40% { transform: scale(1); }
                }
                
                @media (max-width: 480px) {
                    .chatbot-container {
                        right: 1rem !important;
                        bottom: 1.5rem !important;
                    }
                    .chatbot-window {
                        width: calc(100vw - 2rem) !important;
                        height: 70vh !important;
                        position: fixed !important;
                        bottom: 6rem !important;
                        right: 1rem !important;
                        margin-bottom: 0 !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default Chatbot;
