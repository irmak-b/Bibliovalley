// frontend/src/components/ProfileModal.jsx
import React from 'react';
import { X, Shield, Feather, BookOpen, LogOut, Sparkles, Scroll, Award } from 'lucide-react';

const CLASS_ICONS = {
  'Valley Scribe': Feather,
  'Grand Archivist': BookOpen,
  'Lore Wayfarer': Shield,
};

export default function ProfileModal({ isOpen, onClose, user, onLogout }) {
  if (!isOpen || !user) return null;

  const ClassIcon = CLASS_ICONS[user.guildClass] || Feather;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(5, 2, 10, 0.85)',
      backdropFilter: 'blur(8px)',
      zIndex: 350,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: '"Cinzel", serif',
    }}>
      <div style={{
        backgroundColor: '#150a26',
        border: '2px solid #facc15',
        borderRadius: '28px',
        width: '100%',
        maxWidth: '440px',
        padding: '30px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.9), 0 0 30px rgba(250, 204, 21, 0.2)',
        position: 'relative',
      }}>
        {/* Kapat Butonu */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '18px',
            right: '18px',
            background: 'none',
            border: 'none',
            color: '#cbd5e1',
            cursor: 'pointer',
          }}
        >
          <X size={20} />
        </button>

        {/* Profil Başlığı & Avatar */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '68px',
            height: '68px',
            backgroundColor: 'rgba(250, 204, 21, 0.12)',
            border: '2px solid #facc15',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px auto',
            boxShadow: '0 0 20px rgba(250, 204, 21, 0.35)',
          }}>
            <ClassIcon size={32} color="#fef08a" />
          </div>

          <h2 style={{ fontSize: '22px', color: '#fef08a', margin: '0 0 4px 0', letterSpacing: '1px' }}>
            {user.username}
          </h2>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'rgba(124, 58, 237, 0.3)',
            border: '1px solid #c084fc',
            padding: '4px 12px',
            borderRadius: '999px',
            fontSize: '11px',
            color: '#e9d5ff',
            letterSpacing: '1px',
            textTransform: 'uppercase',
          }}>
            <Sparkles size={12} color="#facc15" /> {user.guildClass || 'Valley Scribe'}
          </div>
        </div>

        {/* Lonca Künyesi Bilgileri */}
        <div style={{
          backgroundColor: 'rgba(10, 5, 18, 0.6)',
          border: '1px solid rgba(124, 58, 237, 0.3)',
          borderRadius: '16px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          marginBottom: '24px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
            <span style={{ color: '#94a3b8' }}>Astral Mail:</span>
            <span style={{ color: '#fff' }}>{user.email || 'wanderer@bibliovalley.com'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
            <span style={{ color: '#94a3b8' }}>Guild Standing:</span>
            <span style={{ color: '#4ade80', fontWeight: 'bold' }}>Active Wanderer 🌟</span>
          </div>
        </div>

        {/* Aksiyon Butonları */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => {
              onLogout();
              onClose();
            }}
            style={{
              flex: 1,
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid #ef4444',
              borderRadius: '12px',
              padding: '10px',
              color: '#fca5a5',
              fontWeight: 'bold',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.3)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)')}
          >
            <LogOut size={16} /> Depart Gates (Logout)
          </button>
        </div>
      </div>
    </div>
  );
}