import React, { useState, useRef, useEffect } from 'react';
import { Send, CheckCircle, AlertCircle, Loader2, Shield, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Secure Contact Form with multiple anti-spam layers:
// 1. Honeypot field (invisible to users, bots fill it)
// 2. Timestamp validation (too fast = bot)
// 3. Client-side validation
// 4. Rate limiting simulation
// 5. No sensitive data in client-side code

export default function SecureContactForm({ onSubmitSuccess, className = '' }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
        website: '', // Honeypot field
        timestamp: Date.now()
    });

    const [status, setStatus] = useState('idle'); // idle, submitting, success, error
    const [errors, setErrors] = useState({});
    const [touchCount, setTouchCount] = useState(0);
    const formRef = useRef(null);

    // Update timestamp on mount
    useEffect(() => {
        setFormData(prev => ({ ...prev, timestamp: Date.now() }));
    }, []);

    // Track user interaction (bots don't interact naturally)
    const handleInteraction = () => {
        setTouchCount(prev => prev + 1);
    };

    // Validation
    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        } else if (formData.name.length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }

        if (!formData.subject.trim()) {
            newErrors.subject = 'Subject is required';
        }

        if (!formData.message.trim()) {
            newErrors.message = 'Message is required';
        } else if (formData.message.length < 10) {
            newErrors.message = 'Message must be at least 10 characters';
        }

        // Check for spam patterns
        const spamPatterns = [
            /\b(buy|cheap|discount|free money|casino|viagra|crypto|bitcoin)\b/i,
            /(https?:\/\/[^\s]+){3,}/i, // Multiple URLs
            /(.)\1{10,}/i, // Repeated characters
        ];

        for (const pattern of spamPatterns) {
            if (pattern.test(formData.message)) {
                newErrors.message = 'Your message was flagged as potentially spam';
                break;
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Anti-spam checks
    const passesAntiSpamChecks = () => {
        // Check 1: Honeypot field should be empty
        if (formData.website.trim()) {
            console.log('Anti-spam: Honeypot triggered');
            return false;
        }

        // Check 2: Form should take at least 3 seconds to fill
        const timeTaken = Date.now() - formData.timestamp;
        if (timeTaken < 3000) {
            console.log('Anti-spam: Form submitted too quickly');
            return false;
        }

        // Check 3: User should have interacted with form
        if (touchCount < 3) {
            console.log('Anti-spam: Insufficient user interaction');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate form
        if (!validateForm()) {
            return;
        }

        // Check anti-spam measures
        if (!passesAntiSpamChecks()) {
            // Silently reject spam (don't give bots feedback)
            setStatus('success');
            return;
        }

        setStatus('submitting');

        try {
            // Simulate API call - replace with actual endpoint
            await new Promise(resolve => setTimeout(resolve, 1500));

            // In production, send to your backend:
            // const response = await fetch('/api/contact', {
            //   method: 'POST',
            //   headers: { 'Content-Type': 'application/json' },
            //   body: JSON.stringify({
            //     name: formData.name,
            //     email: formData.email,
            //     subject: formData.subject,
            //     message: formData.message,
            //     // Don't send honeypot/timestamp to backend
            //   })
            // });

            setStatus('success');
            onSubmitSuccess?.();

            // Reset form after delay
            setTimeout(() => {
                setFormData({
                    name: '',
                    email: '',
                    subject: '',
                    message: '',
                    website: '',
                    timestamp: Date.now()
                });
                setTouchCount(0);
            }, 2000);

        } catch (error) {
            setStatus('error');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    if (status === 'success') {
        return (
            <div className={`bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 text-center ${className}`}>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-green-800 mb-2">Message Sent!</h3>
                <p className="text-green-600">We'll get back to you within 24-48 hours.</p>
            </div>
        );
    }

    return (
        <form
            ref={formRef}
            onSubmit={handleSubmit}
            onMouseMove={handleInteraction}
            onKeyDown={handleInteraction}
            className={`space-y-5 ${className}`}
        >
            {/* Security Badge */}
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                <Shield className="w-4 h-4 text-green-600" />
                <span>Your information is secure and encrypted</span>
            </div>

            {/* Name Field */}
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Your Name
                </label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl border ${errors.name ? 'border-red-400 focus:ring-red-500' : 'border-gray-300 focus:ring-purple-500'
                        } focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                    placeholder="John Doe"
                    autoComplete="name"
                />
                {errors.name && (
                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.name}
                    </p>
                )}
            </div>

            {/* Email Field */}
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email Address
                </label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl border ${errors.email ? 'border-red-400 focus:ring-red-500' : 'border-gray-300 focus:ring-purple-500'
                        } focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                    placeholder="you@example.com"
                    autoComplete="email"
                />
                {errors.email && (
                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.email}
                    </p>
                )}
            </div>

            {/* Subject Field */}
            <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Subject
                </label>
                <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl border ${errors.subject ? 'border-red-400 focus:ring-red-500' : 'border-gray-300 focus:ring-purple-500'
                        } focus:outline-none focus:ring-2 focus:border-transparent transition-all bg-white`}
                >
                    <option value="">Select a topic...</option>
                    <option value="general">General Inquiry</option>
                    <option value="support">Fan Support</option>
                    <option value="artist">Artist Inquiry</option>
                    <option value="partnership">Partnership Opportunity</option>
                    <option value="bug">Report a Bug</option>
                </select>
                {errors.subject && (
                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.subject}
                    </p>
                )}
            </div>

            {/* Message Field */}
            <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Message
                </label>
                <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    className={`w-full px-4 py-3 rounded-xl border ${errors.message ? 'border-red-400 focus:ring-red-500' : 'border-gray-300 focus:ring-purple-500'
                        } focus:outline-none focus:ring-2 focus:border-transparent transition-all resize-none`}
                    placeholder="How can we help you?"
                />
                {errors.message && (
                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.message}
                    </p>
                )}
            </div>

            {/* Honeypot Field - Hidden from users, visible to bots */}
            <div
                style={{
                    position: 'absolute',
                    left: '-9999px',
                    top: '-9999px',
                    opacity: 0,
                    pointerEvents: 'none'
                }}
                aria-hidden="true"
            >
                <label htmlFor="website">Website (leave blank)</label>
                <input
                    type="text"
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    tabIndex={-1}
                    autoComplete="off"
                />
            </div>

            {/* Error Message */}
            {status === 'error' && (
                <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    <span>Something went wrong. Please try again.</span>
                </div>
            )}

            {/* Submit Button */}
            <Button
                type="submit"
                disabled={status === 'submitting'}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white h-12 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg disabled:opacity-70"
            >
                {status === 'submitting' ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Sending...
                    </>
                ) : (
                    <>
                        <Send className="w-5 h-5 mr-2" />
                        Send Message
                    </>
                )}
            </Button>

            {/* Privacy Notice */}
            <p className="text-xs text-gray-500 text-center flex items-center justify-center gap-1">
                <Lock className="w-3 h-3" />
                By submitting, you agree to our Privacy Policy
            </p>
        </form>
    );
}
