import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Sparkles, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

// AI Knowledge Base for Favatis
const knowledgeBase = {
    subscriptions: {
        keywords: ['subscription', 'subscribe', 'tier', 'price', 'cost', 'pay', 'payment', 'plan'],
        response: "🎵 **Favatis Subscriptions** work in flexible tiers:\n\n• **Fan Tier** ($3-5/mo) - Basic exclusive content\n• **VIP Tier** ($10-15/mo) - Early releases + behind-the-scenes\n• **Patron Tier** ($25+/mo) - Direct artist interaction + exclusive merch\n\nArtists set their own tier prices and perks. 100% of your subscription goes directly to the artist!"
    },
    support: {
        keywords: ['support', 'help', 'artist', 'donate', 'contribute', 'money'],
        response: "💜 **Supporting Artists on Favatis** is easy:\n\n1. Find an artist you love on our Explore page\n2. View their profile and subscription tiers\n3. Choose a tier that fits your budget\n4. Subscribe with secure payment\n\nYour support goes **100% directly** to the artist - no middleman fees!"
    },
    content: {
        keywords: ['content', 'exclusive', 'access', 'video', 'music', 'release', 'behind'],
        response: "🎬 **Exclusive Content** varies by artist, but typically includes:\n\n• 🎵 Unreleased tracks and demos\n• 📹 Behind-the-scenes footage\n• 🎤 Live session recordings\n• 📝 Songwriting process insights\n• 💬 Direct Q&A sessions\n• 🎁 Exclusive merchandise discounts"
    },
    artist: {
        keywords: ['join', 'become', 'artist', 'creator', 'signup', 'register', 'musician'],
        response: "🎸 **Becoming a Favatis Artist** is simple:\n\n1. Click 'Apply as Artist' on our homepage\n2. Fill out your profile details\n3. Set up your subscription tiers\n4. Start uploading exclusive content\n5. Share with your fans!\n\nWe review applications within 24-48 hours. No upfront costs!"
    },
    payment: {
        keywords: ['paid', 'earn', 'revenue', 'income', 'payout', 'withdraw'],
        response: "💰 **Artist Payments:**\n\n• Artists receive **100%** of subscription revenue\n• Payouts are processed **monthly**\n• Minimum payout threshold: $25\n• Supported: PayPal, Stripe, Bank Transfer\n\nFavatis is free for artists - we believe in supporting creators!"
    },
    security: {
        keywords: ['secure', 'safe', 'privacy', 'data', 'protect'],
        response: "🔒 **Your Security Matters:**\n\n• All payments processed via **Stripe** (bank-level encryption)\n• Personal data protected under **GDPR/CCPA**\n• Secure **HTTPS** on all pages\n• No password sharing - unique account per user\n• Two-factor authentication available"
    },
    general: {
        keywords: [],
        response: "🎵 I'm FavatisAI, your guide to the platform!\n\nI can help you with:\n• Understanding subscriptions\n• Supporting your favorite artists\n• Accessing exclusive content\n• Becoming an artist\n• Payment questions\n\nWhat would you like to know?"
    }
};

// Simple AI response generator
const generateResponse = (message) => {
    const lowerMessage = message.toLowerCase();

    for (const [key, data] of Object.entries(knowledgeBase)) {
        if (key === 'general') continue;
        if (data.keywords.some(kw => lowerMessage.includes(kw))) {
            return data.response;
        }
    }

    // Greeting detection
    if (/^(hi|hello|hey|greetings|sup|yo)/i.test(lowerMessage)) {
        return "👋 Hello! Welcome to Favatis - where fans connect directly with artists!\n\nHow can I help you today? You can ask about:\n• Subscriptions & pricing\n• Supporting artists\n• Exclusive content\n• Becoming an artist";
    }

    // Thank you detection
    if (/thank|thanks/i.test(lowerMessage)) {
        return "🎵 You're welcome! Happy to help. Is there anything else you'd like to know about Favatis?";
    }

    return knowledgeBase.general.response;
};

export default function AIAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "Hi! I'm FavatisAI 🎵\n\nI'm here to help you explore the platform. Ask me anything about subscriptions, supporting artists, or getting started!" }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsTyping(true);

        // Simulate AI thinking time
        setTimeout(() => {
            const response = generateResponse(userMessage);
            setMessages(prev => [...prev, { role: 'assistant', content: response }]);
            setIsTyping(false);
        }, 800 + Math.random() * 700);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const quickQuestions = [
        "How do subscriptions work?",
        "How do I support an artist?",
        "What exclusive content can I get?",
        "How can I become an artist?"
    ];

    return (
        <>
            {/* Floating AI Button */}
            <button
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-24 right-5 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center group ${isOpen ? 'hidden' : ''}`}
                aria-label="Open AI Assistant"
            >
                <Sparkles className="w-6 h-6 group-hover:animate-pulse" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-24 right-5 z-50 w-[380px] h-[520px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                <Bot className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold">FavatisAI</h3>
                                <p className="text-xs text-white/80">Always here to help</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex items-start gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user'
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
                                    }`}>
                                    {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                </div>
                                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${msg.role === 'user'
                                        ? 'bg-purple-600 text-white rounded-tr-sm'
                                        : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-tl-sm'
                                    }`}>
                                    <div className="text-sm whitespace-pre-wrap leading-relaxed">
                                        {msg.content.split('**').map((part, i) =>
                                            i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {isTyping && (
                            <div className="flex items-start gap-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center">
                                    <Bot className="w-4 h-4" />
                                </div>
                                <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-gray-100">
                                    <div className="flex gap-1">
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Questions */}
                    {messages.length === 1 && (
                        <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
                            <p className="text-xs text-gray-500 mb-2">Quick questions:</p>
                            <div className="flex flex-wrap gap-1.5">
                                {quickQuestions.map((q, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            setInput(q);
                                            setTimeout(() => handleSend(), 100);
                                        }}
                                        className="text-xs bg-white border border-gray-200 rounded-full px-3 py-1.5 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 transition-colors"
                                    >
                                        {q}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Input */}
                    <div className="p-4 bg-white border-t border-gray-200">
                        <div className="flex items-center gap-2">
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Ask me anything..."
                                className="flex-1 px-4 py-2.5 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim()}
                                className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white flex items-center justify-center hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
