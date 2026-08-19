import React, { useState } from 'react';
import axios from 'axios';
import { X, Sparkles, KeyRound, Shield, Feather, BookOpen, Loader2 } from 'lucide-react';

const GUILD_CLASSES = [
  { id: 'scribe', name: 'Valley Scribe', desc: 'Masters of ink, reviews, and ancient marginalia.', icon: Feather },
  { id: 'archivist', name: 'Grand Archivist', desc: 'Keepers of shelf order and book trackers.', icon: BookOpen },
  { id: 'wayfarer', name: 'Lore Wayfarer', desc: 'Seekers of forgotten shop shelves and TBR queues.', icon: Shield }
];

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedClass, setSelectedClass] = useState('scribe');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const endpoint = isRegister ? 'http://localhost:5000/api/auth/register' : 'http://localhost:5000/api/auth/login';
      const payload = isRegister 
        ? { username, email, password, guildClass: selectedClass }
        : { username, password };

      const res = await axios.post(endpoint, payload);

      if (res.data.success && res.data.user) {
        localStorage.setItem('bibliovalley_user', JSON.stringify(res.data.user));
        onAuthSuccess(res.data.user);
        onClose();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'The arcane seals rejected your entry.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(5, 2, 10, 0.88)',
      backdropFilter: 'blur(10px)',
      zIndex: 300,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: '"Cinzel", serif'
    }}>
      <div style={{
        backgroundColor: '#150a26',
        border: '2px solid #facc15',
        borderRadius: '28px',
        width: '100%',
        maxWidth: '460px',
        padding: '32px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.9), 0 0 35px rgba(250, 204, 21, 0.25)',
        position: 'relative'
      }}>
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            color: '#cbd5e1',
            cursor: 'pointer'
          }}
        >
          <X size={22} />
        </button>

        {/* Header and Icons */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '54px',
            height: '54px',
            backgroundColor: 'rgba(250, 204, 21, 0.12)',
            border: '1px solid #facc15',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px auto',
            boxShadow: '0 0 15px rgba(250, 204, 21, 0.4)'
          }}>
            <KeyRound size={26} color="#fef08a" />
          </div>
          <h2 style={{ fontSize: '24px', color: '#fef08a', margin: 0, letterSpacing: '2px' }}>
            {isRegister ? 'SCRIBE ENROLLMENT' : 'UNSEAL THE GATES'}
          </h2>
          <p style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '6px' }}>
            {isRegister ? 'Inscribe your signature into the Great Valley Guild' : 'Speak your arcane credentials to step through'}
          </p>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid #ef4444',
            borderRadius: '10px',
            padding: '8px 12px',
            color: '#fca5a5',
            fontSize: '12px',
            marginBottom: '16px',
            textAlign: 'center'
          }}>
            {errorMsg}
          </div>
        )}

        {/* RPG Register*/}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          <div>
            <label style={{ fontSize: '11px', color: '#c084fc', display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>
              Wanderer / Scribe Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Scribe of the North"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: '#0a0512',
                border: '1px solid #7c3aed',
                borderRadius: '10px',
                padding: '10px 14px',
                color: '#fff',
                fontSize: '13px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {isRegister && (
            <div>
              <label style={{ fontSize: '11px', color: '#c084fc', display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>
                Astral Pigeon Mail (Email)
              </label>
              <input
                type="email"
                required
                placeholder="scribe@bibliovalley.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: '#0a0512',
                  border: '1px solid #7c3aed',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  color: '#fff',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          )}

          <div>
            <label style={{ fontSize: '11px', color: '#c084fc', display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>
              Secret Rune Phrase (Password)
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: '#0a0512',
                border: '1px solid #7c3aed',
                borderRadius: '10px',
                padding: '10px 14px',
                color: '#fff',
                fontSize: '13px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* RPG class selection */}
          {isRegister && (
            <div style={{ marginTop: '4px' }}>
              <label style={{ fontSize: '11px', color: '#c084fc', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>
                Select Your Guild Affinity
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {GUILD_CLASSES.map((c) => {
                  const Icon = c.icon;
                  const isSelected = selectedClass === c.id;
                  return (
                    <div
                      key={c.id}
                      onClick={() => setSelectedClass(c.id)}
                      style={{
                        backgroundColor: isSelected ? 'rgba(250, 204, 21, 0.15)' : 'rgba(255,255,255,0.04)',
                        border: isSelected ? '2px solid #facc15' : '1px solid rgba(124, 58, 237, 0.3)',
                        borderRadius: '10px',
                        padding: '10px 6px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <Icon size={18} color={isSelected ? '#facc15' : '#c084fc'} style={{ margin: '0 auto 4px auto' }} />
                      <div style={{ fontSize: '10px', fontWeight: 'bold', color: isSelected ? '#fef08a' : '#cbd5e1' }}>
                        {c.name}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              backgroundColor: '#facc15',
              color: '#451a03',
              border: 'none',
              borderRadius: '12px',
              padding: '12px',
              fontWeight: 'bold',
              fontSize: '14px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '10px',
              boxShadow: '0 0 20px rgba(250, 204, 21, 0.35)'
            }}
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            {isRegister ? 'Inscribe & Enter Valley' : 'Open Valley Gates'}
          </button>
        </form>

        {/* Jump button */}
        <div style={{ textAlign: 'center', marginTop: '18px', fontSize: '12px', color: '#94a3b8' }}>
          {isRegister ? 'Already inscribed in the scrolls?' : 'A new traveler upon the path?'}{' '}
          <button
            onClick={() => { setIsRegister(!isRegister); setErrorMsg(''); }}
            style={{
              background: 'none',
              border: 'none',
              color: '#facc15',
              fontWeight: 'bold',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            {isRegister ? 'Enter Gates' : 'Join Guild'}
          </button>
        </div>

      </div>
    </div>
  );
}
