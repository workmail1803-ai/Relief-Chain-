import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, FileText, Heart, Users, AlertTriangle, Phone, RefreshCw } from 'lucide-react';

const PolicySection = ({ title, icon: Icon, children, color = '#6366f1' }) => (
    <div style={{ marginBottom: '2.5rem' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.4rem', color: color, marginBottom: '1rem' }}>
            <Icon size={24} /> {title}
        </h3>
        <div style={{ background: '#111', padding: '1.5rem', borderRadius: '12px', border: '1px solid #222', lineHeight: '1.7', color: '#bbb' }}>
            {children}
        </div>
    </div>
);

const Policy = () => {
    return (
        <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', color: '#e0e0e0' }}>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ textAlign: 'center', marginBottom: '4rem' }}
            >
                <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem' }}>Our Policies</h1>
                <p style={{ color: '#888', fontSize: '1.1rem' }}>Guidelines and commitments that govern Relief Chain operations.</p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <PolicySection title="1. Transparency Policy" icon={Shield} color="#10b981">
                    <ul style={{ paddingLeft: '20px', margin: 0 }}>
                        <li style={{ marginBottom: '8px' }}>All donations collected through Relief Chain are intended strictly for humanitarian and relief purposes.</li>
                        <li style={{ marginBottom: '8px' }}>Fund collection and distribution details will be displayed publicly whenever possible.</li>
                        <li style={{ marginBottom: '8px' }}>Donations may be distributed gradually depending on the nature and urgency of the situation.</li>
                        <li>Relief Chain does not promise instant distribution in all cases, but guarantees responsible usage.</li>
                    </ul>
                </PolicySection>

                <PolicySection title="2. Donation Policy" icon={Heart} color="#ef4444">
                    <ul style={{ paddingLeft: '20px', margin: 0 }}>
                        <li style={{ marginBottom: '8px' }}>Donations are voluntary and non-refundable once allocated to relief work.</li>
                        <li style={{ marginBottom: '8px' }}>Small and large donations are treated with equal importance.</li>
                        <li style={{ marginBottom: '8px' }}>Funds may be redirected to similar emergency needs if the original cause is resolved or unavailable.</li>
                        <li>Misuse of funds is strictly prohibited and monitored internally.</li>
                    </ul>
                </PolicySection>

                <PolicySection title="3. Volunteer Policy" icon={Users} color="#f59e0b">
                    <ul style={{ paddingLeft: '20px', margin: 0 }}>
                        <li style={{ marginBottom: '8px' }}>Volunteers must follow Relief Chain guidelines and represent the organization respectfully.</li>
                        <li style={{ marginBottom: '8px' }}>Volunteers are required to maintain honesty, discipline, and accountability.</li>
                        <li>Any misuse of identity, funds, or authority will result in immediate removal and legal action if necessary.</li>
                    </ul>
                </PolicySection>

                <PolicySection title="4. Privacy Policy" icon={Lock} color="#8b5cf6">
                    <ul style={{ paddingLeft: '20px', margin: 0 }}>
                        <li style={{ marginBottom: '8px' }}>We respect donor and volunteer privacy.</li>
                        <li style={{ marginBottom: '8px' }}>Personal information (such as phone numbers or names) will not be sold or shared with third parties.</li>
                        <li>Donation records are stored securely and used only for operational and transparency purposes.</li>
                    </ul>
                </PolicySection>

                <PolicySection title="5. Code of Conduct" icon={FileText} color="#ec4899">
                    <ul style={{ paddingLeft: '20px', margin: 0 }}>
                        <li style={{ marginBottom: '8px' }}>Hate speech, fraud, harassment, or exploitation of beneficiaries is strictly forbidden.</li>
                        <li style={{ marginBottom: '8px' }}>Relief Chain maintains a zero-tolerance policy against corruption or misuse of relief materials.</li>
                        <li>All activities must align with humanitarian ethics and local laws.</li>
                    </ul>
                </PolicySection>

                <PolicySection title="6. Limitation of Responsibility" icon={AlertTriangle} color="#f97316">
                    <ul style={{ paddingLeft: '20px', margin: 0 }}>
                        <li style={{ marginBottom: '8px' }}>Relief Chain acts as a facilitator between donors, volunteers, and beneficiaries.</li>
                        <li style={{ marginBottom: '8px' }}>While we strive for accuracy, delays or changes may occur due to real-world emergency conditions.</li>
                        <li>We are not responsible for factors beyond our control such as natural delays, government restrictions, or force majeure events.</li>
                    </ul>
                </PolicySection>

                <PolicySection title="7. Contact & Support" icon={Phone} color="#06b6d4">
                    <p>For questions, concerns, or reports related to donations, volunteers, or transparency, please contact us:</p>
                    <div style={{ marginTop: '1rem', padding: '1rem', background: '#222', borderRadius: '8px' }}>
                        <p style={{ margin: '0 0 8px 0', fontSize: '1.2rem', fontWeight: 'bold' }}>📞 444 45656 8899</p>
                        <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold' }}>📞 01713 478 219</p>
                    </div>
                    <p style={{ marginTop: '1rem', fontStyle: 'italic', color: '#f59e0b' }}>We encourage users to report any suspicious activity immediately.</p>
                </PolicySection>

                <PolicySection title="8. Policy Updates" icon={RefreshCw} color="#64748b">
                    <p>Relief Chain reserves the right to update these policies as needed. Any changes will be reflected on this page.</p>
                </PolicySection>

                <div style={{ textAlign: 'center', marginTop: '4rem', color: '#666', borderTop: '1px solid #222', paddingTop: '2rem' }}>
                    <p>&copy; {new Date().getFullYear()} Relief Chain. All rights reserved.</p>
                </div>
            </motion.div>
        </div>
    );
};

export default Policy;
