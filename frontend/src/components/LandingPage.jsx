// frontend/src/components/LandingPage.jsx
import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { 
  ArrowRight, 
  X, 
  Send, 
  Loader2, 
  Trophy, 
  Flame, 
  Calendar as CalendarIcon, 
  Sparkles, 
  History, 
  Trash2, 
  Search,
  BookOpen
} from 'lucide-react';

export default function LandingPage({ currentUser, onEnterValley, onNavigate }) {
  const [showAiChat, setShowAiChat] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'fairy',
      text: 'Greetings, wanderer! I am Bibi, the keeper of lore in Bibliovalley. Which tales or enchanted genres shall we discover today? ✨📖',
      createdAt: new Date().toISOString(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const chatEndRef = useRef(null);

  // 1. Kullanıcının PostgreSQL'deki sohbet geçmişini çek
  useEffect(() => {
    const fetchChatHistory = async () => {
      if (!currentUser?.id) return;
      try {
        const res = await axios.get(`http://localhost:5000/api/fairy/history/${currentUser.id}`);
        if (res.data && res.data.length > 0) {
          setMessages(res.data);
        }
      } catch (err) {
        console.error('Bibi geçmişi yüklenemedi:', err);
      }
    };
    fetchChatHistory();
  }, [currentUser]);

  // Otomatik aşağı kaydırma
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, showAiChat]);

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    
    const userText = inputMessage.trim();
    if (!userText || isLoading) return;

    const newMsg = { sender: 'user', text: userText, createdAt: new Date().toISOString() };
    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);
    setInputMessage('');
    setIsLoading(true);

    try {
      const res = await axios.post('http://localhost:5000/api/fairy/chat', {
        messages: updatedMessages,
        userId: currentUser?.id || null,
      });

      if (res.data && res.data.reply) {
        setMessages((prev) => [
          ...prev, 
          { sender: 'fairy', text: res.data.reply, createdAt: new Date().toISOString() }
        ]);
      }
    } catch (err) {
      console.error('❌ Bibi Chat Hatası:', err);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'fairy',
          text: 'The arcane winds are turbulent... I could not catch your message. Please try asking again! 🌌',
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const goToView = (viewName) => {
    if (onNavigate) {
      onNavigate(viewName);
    }
  };

  // Geçmiş içinde arama filtrelemesi
  const filteredHistory = messages.filter((m) =>
    m.text.toLowerCase().includes(historySearchQuery.toLowerCase())
  );

  return (
    <div style={{
      backgroundColor: '#0a0512',
      color: '#f8fafc',
      width: '100%',
      minHeight: '100vh',
      overflowX: 'hidden',
      fontFamily: '"Cinzel", "Segoe UI", serif',
      position: 'relative'
    }}>
      
      {/* ================= TOOLTIP & PARILTI CSS STİLLERİ ================= */}
      <style>{`
        .bibi-container:hover .bibi-tooltip {
          opacity: 1 !important;
          transform: translateX(-50%) translateY(-8px) !important;
        }
      `}</style>

      {/* 1. HERO SECTION */}
      <section style={{
        position: 'relative',
        width: '100%',
        height: '100dvh',
        minHeight: '600px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '0 20px 50px 20px',
        boxSizing: 'border-box'
      }}>
        <img
          src="/tree-hero.jpg"
          alt="Tree of Wisdom"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center center',
            zIndex: 1
          }}
        />

        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, transparent 60%, #0a0512 100%)',
          zIndex: 2,
          pointerEvents: 'none'
        }} />

        {/* Peri Işıkları */}
        <div className="fairy-light" style={{ top: '22%', left: '48%', zIndex: 3, animationDelay: '0s' }} />
        <div className="fairy-light" style={{ top: '35%', left: '26%', zIndex: 3, animationDelay: '1.2s' }} />
        <div className="fairy-light" style={{ top: '28%', left: '72%', zIndex: 3, animationDelay: '2.4s' }} />
        <div className="fairy-light" style={{ top: '48%', left: '56%', zIndex: 3, animationDelay: '0.8s' }} />

        {/* Hero Başlık */}
        <div style={{ textAlign: 'center', zIndex: 4, position: 'relative', maxWidth: '800px' }}>
          <h1 style={{
            fontSize: 'clamp(32px, 6vw, 56px)',
            fontWeight: 'bold',
            letterSpacing: '3px',
            color: '#fef08a',
            margin: '0 0 8px 0',
            textShadow: '0 0 30px rgba(250, 204, 21, 0.6), 0 4px 10px rgba(0,0,0,0.9)'
          }}>
            BIBLIOVALLEY
          </h1>
          <p style={{
            fontSize: 'clamp(14px, 2.5vw, 18px)',
            color: '#e2e8f0',
            margin: 0,
            letterSpacing: '1px',
            textShadow: '0 2px 4px rgba(0,0,0,0.9)',
            padding: '0 10px'
          }}>
            Where scrolls breathe, shops thrive, and legends are transcribed.
          </p>
          <div style={{ marginTop: '16px', fontSize: '12px', color: '#c084fc', opacity: 0.9 }}>
            ↓ Scroll down to explore ↓
          </div>
        </div>
      </section>

      {/* 2. ÖZELLİK TANITIMLARI */}
      <div style={{
        background: 'linear-gradient(180deg, #0a0512 0%, #1f0b38 40%, #2e1065 60%, #0a0512 100%)',
        padding: '100px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '120px',
        maxWidth: '1050px',
        margin: '0 auto',
        position: 'relative'
      }}>
        {/* Section 1: Monthly Reading Tracker Mockup */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '40px', flexWrap: 'wrap', position: 'relative', zIndex: 2 }}>
          <div
            onClick={() => goToView('tracker')}
            title="Click to explore Tracker"
            style={{
              flex: '1 1 320px',
              maxWidth: '450px',
              height: '240px',
              backgroundColor: 'rgba(30, 15, 55, 0.75)',
              borderRadius: '20px',
              border: '2px solid rgba(168, 85, 247, 0.5)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '16px 20px',
              backdropFilter: 'blur(8px)',
              cursor: 'pointer',
              boxShadow: '0 12px 30px rgba(0,0,0,0.6)',
              boxSizing: 'border-box'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CalendarIcon size={16} color="#facc15" />
                <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#fef08a' }}>October Reading Vault</span>
              </div>
              <span style={{ fontSize: '10px', color: '#c084fc', backgroundColor: 'rgba(124, 58, 237, 0.3)', padding: '2px 8px', borderRadius: '999px' }}>
                Active Shelf →
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '6px', backgroundColor: 'rgba(10, 5, 18, 0.5)', padding: '8px', borderRadius: '12px' }}>
              {Array.from({ length: 8 }).map((_, idx) => (
                <div
                  key={idx}
                  style={{
                    aspectRatio: '2/3',
                    backgroundColor: idx === 0 ? '#4c1d95' : idx === 1 ? '#581c87' : 'rgba(255,255,255,0.06)',
                    borderRadius: '4px',
                    border: idx === 0 ? '1px solid #facc15' : '1px solid rgba(168, 85, 247, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {idx === 0 && <Trophy size={9} color="#facc15" />}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '10px', color: '#94a3b8' }}>Heatmap:</span>
              <div style={{ display: 'flex', gap: '3px', flex: 1 }}>
                {[15, 45, 120, 0, 80, 200, 60, 90, 30, 110, 0, 180].map((val, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: '14px',
                      borderRadius: '3px',
                      backgroundColor: val === 0 ? 'rgba(255,255,255,0.05)' : val < 50 ? '#4c1d95' : val < 100 ? '#7c3aed' : '#facc15'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div style={{ flex: '1 1 300px', maxWidth: '480px' }}>
            <h3 style={{ fontSize: 'clamp(22px, 4vw, 28px)', color: '#fef08a', marginBottom: '12px', letterSpacing: '1px' }}>Monthly Reading Tracker</h3>
            <p style={{ color: '#cbd5e1', lineHeight: '1.7', fontSize: '15px' }}>Track daily reading journeys, count enchanted pages, and pick your monthly favorite champion book.</p>
          </div>
        </div>

        {/* Section 2: Playoffs Tree Mockup */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '40px', flexWrap: 'wrap-reverse', position: 'relative', zIndex: 2 }}>
          <div style={{ flex: '1 1 300px', maxWidth: '480px' }}>
            <h3 style={{ fontSize: 'clamp(22px, 4vw, 28px)', color: '#fef08a', marginBottom: '12px', letterSpacing: '1px' }}>Favourite Playoffs</h3>
            <p style={{ color: '#cbd5e1', lineHeight: '1.7', fontSize: '15px' }}>Clash 12 monthly book winners in an elimination bracket to crown the ultimate Book of the Year!</p>
          </div>

          <div
            onClick={() => goToView('playoff')}
            title="Click to enter Playoffs"
            style={{
              flex: '1 1 320px',
              maxWidth: '450px',
              height: '240px',
              backgroundColor: 'rgba(30, 15, 55, 0.75)',
              borderRadius: '20px',
              border: '2px solid rgba(168, 85, 247, 0.5)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '16px 20px',
              backdropFilter: 'blur(8px)',
              cursor: 'pointer',
              boxShadow: '0 12px 30px rgba(0,0,0,0.6)',
              boxSizing: 'border-box'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Trophy size={16} color="#facc15" />
                <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#fef08a' }}>Tournament Bracket</span>
              </div>
              <span style={{ fontSize: '10px', color: '#facc15', backgroundColor: 'rgba(250, 204, 21, 0.15)', padding: '2px 8px', borderRadius: '999px' }}>
                4 Seasons Tree →
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', padding: '10px 4px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
                {['❄️ Winter', '🌸 Spring'].map((s, i) => (
                  <div key={i} style={{ backgroundColor: 'rgba(124, 58, 237, 0.25)', border: '1px solid #a855f7', borderRadius: '6px', padding: '4px 6px', fontSize: '9px', color: '#e9d5ff' }}>
                    {s}
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '8px 12px', backgroundColor: 'rgba(250, 204, 21, 0.12)', border: '1px dashed #facc15', borderRadius: '12px' }}>
                <Trophy size={22} color="#facc15" />
                <span style={{ fontSize: '9px', color: '#fef08a', fontWeight: 'bold', marginTop: '3px' }}>Grand Final</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
                {['☀️ Summer', '🍂 Autumn'].map((s, i) => (
                  <div key={i} style={{ backgroundColor: 'rgba(124, 58, 237, 0.25)', border: '1px solid #a855f7', borderRadius: '6px', padding: '4px 6px', fontSize: '9px', color: '#e9d5ff', textAlign: 'right' }}>
                    {s}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ textAlign: 'center', fontSize: '10px', color: '#cbd5e1', fontStyle: 'italic' }}>
              ~ Crown the Supreme Book of the Year ~
            </div>
          </div>
        </div>

        {/* Section 3: TBR Scroll Mockup */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '40px', flexWrap: 'wrap', position: 'relative', zIndex: 2 }}>
          <div
            onClick={() => goToView('tbr')}
            title="Click to view TBR List"
            style={{
              flex: '1 1 320px',
              maxWidth: '450px',
              height: '240px',
              backgroundColor: 'rgba(30, 15, 55, 0.75)',
              borderRadius: '20px',
              border: '2px solid rgba(168, 85, 247, 0.5)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '16px 20px',
              backdropFilter: 'blur(8px)',
              cursor: 'pointer',
              boxShadow: '0 12px 30px rgba(0,0,0,0.6)',
              boxSizing: 'border-box'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={16} color="#facc15" />
                <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#fef08a' }}>TBR Enchanted Queue</span>
              </div>
              <span style={{ fontSize: '10px', color: '#4ade80', backgroundColor: 'rgba(74, 222, 128, 0.15)', padding: '2px 8px', borderRadius: '999px' }}>
                3 Quests In Line →
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(10, 5, 18, 0.6)', border: '1px solid rgba(124, 58, 237, 0.3)', borderRadius: '8px', padding: '6px 10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '18px', height: '26px', backgroundColor: '#581c87', borderRadius: '3px' }} />
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#fff' }}>The Priory of the Orange Tree</div>
                    <div style={{ fontSize: '9px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Flame size={10} /> High Priority • Fantasy
                    </div>
                  </div>
                </div>
                <span style={{ fontSize: '9px', backgroundColor: '#7c3aed', color: '#fff', padding: '2px 6px', borderRadius: '4px' }}>Reading</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#c084fc', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '6px' }}>
              <span>Transcribe to Scriptorium</span>
              <span style={{ color: '#fef08a' }}>Open Scroll →</span>
            </div>
          </div>

          <div style={{ flex: '1 1 300px', maxWidth: '480px' }}>
            <h3 style={{ fontSize: 'clamp(22px, 4vw, 28px)', color: '#fef08a', marginBottom: '12px', letterSpacing: '1px' }}>TBR List (Wishlist)</h3>
            <p style={{ color: '#cbd5e1', lineHeight: '1.7', fontSize: '15px' }}>Maintain your TBR wishlist and transcribe completed titles straight into shop shelves.</p>
          </div>
        </div>
      </div>

      {/* 3. CTA */}
      <section style={{ position: 'relative', textAlign: 'center', padding: '80px 20px 140px', backgroundColor: '#0a0512' }}>
        <h2 style={{ fontSize: 'clamp(26px, 5vw, 36px)', fontWeight: 'bold', color: '#fef08a', marginBottom: '16px', letterSpacing: '2px' }}>AND THE BOOK MAP</h2>
        <p style={{ color: '#cbd5e1', maxWidth: '600px', margin: '0 auto 36px auto', fontSize: '15px', lineHeight: '1.6' }}>Transcribe books into mystical scrolls and stock themed shops across the valley.</p>
        <button
          onClick={onEnterValley}
          style={{
            background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
            color: '#ffffff',
            border: '2px solid #c084fc',
            borderRadius: '999px',
            padding: '16px 36px',
            fontSize: 'clamp(14px, 3.5vw, 18px)',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 0 35px rgba(168, 85, 247, 0.6)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          GO TO THE VALLEY AND EXPLORE <ArrowRight size={20} />
        </button>
      </section>

      {/* 4. FLOATING BIBI AI COMPANION */}
      <div style={{
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end'
      }}>
        
        {/* Sohbet Kutusu */}
        {showAiChat && (
          <div style={{
            marginBottom: '14px',
            width: '350px',
            backgroundColor: 'rgba(20, 10, 38, 0.98)',
            border: '2px solid #facc15',
            borderRadius: '20px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.9), 0 0 25px rgba(250, 204, 21, 0.3)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {/* Header */}
            <div style={{
              padding: '12px 16px',
              backgroundColor: 'rgba(46, 16, 101, 0.8)',
              borderBottom: '1px solid rgba(250, 204, 21, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img
                  src="/fairy-avatar.png"
                  alt="Bibi Avatar"
                  style={{ width: '34px', height: '34px', borderRadius: '50%', filter: 'drop-shadow(0 0 6px #fde047)' }}
                />
                <div>
                  <h4 style={{ margin: 0, fontSize: '13px', color: '#fef08a', fontWeight: 'bold' }}>Bibi the Guardian</h4>
                  <span style={{ fontSize: '10px', color: '#a855f7' }}>Library Fairy</span>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {/* Tüm Geçmişi Görüntüleme Butonu */}
                <button
                  onClick={() => setShowHistoryModal(true)}
                  title="View Lore Chronicles (Full History)"
                  style={{
                    background: 'rgba(124, 58, 237, 0.3)',
                    border: '1px solid #c084fc',
                    borderRadius: '8px',
                    color: '#fef08a',
                    padding: '4px 8px',
                    fontSize: '11px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer'
                  }}
                >
                  <History size={13} /> History
                </button>

                <button
                  onClick={() => setShowAiChat(false)}
                  style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', padding: '4px' }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Mesaj Listesi */}
            <div style={{
              padding: '14px',
              height: '250px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              fontSize: '12px'
            }}>
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  style={{
                    alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    backgroundColor: msg.sender === 'user' ? '#7c3aed' : 'rgba(255, 255, 255, 0.08)',
                    color: msg.sender === 'user' ? '#fff' : '#fef08a',
                    padding: '8px 12px',
                    borderRadius: msg.sender === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                    maxWidth: '85%',
                    lineHeight: '1.4',
                    border: msg.sender === 'fairy' ? '1px solid rgba(250, 204, 21, 0.2)' : 'none'
                  }}
                >
                  {msg.text}
                </div>
              ))}

              {isLoading && (
                <div style={{
                  alignSelf: 'flex-start',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  color: '#fef08a',
                  padding: '8px 12px',
                  borderRadius: '12px 12px 12px 2px',
                  fontSize: '11px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontStyle: 'italic'
                }}>
                  <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
                  Bibi is consulting the scrolls...
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Form */}
            <form onSubmit={handleSendMessage} style={{ padding: '10px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="Ask Bibi for a book recommendation..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                style={{
                  flex: 1,
                  backgroundColor: '#0a0512',
                  border: '1px solid #7c3aed',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  color: '#fff',
                  fontSize: '12px',
                  outline: 'none'
                }}
              />
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  backgroundColor: '#facc15',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0 12px',
                  height: '34px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#451a03',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.6 : 1
                }}
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        )}

        {/* Kayan Bibi Butonu & Tooltip */}
        <div
          className="bibi-container"
          style={{
            position: 'relative',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <button
            onClick={() => setShowAiChat(!showAiChat)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              animation: 'pulseGlow 2.5s infinite ease-in-out',
              borderRadius: '50%',
              display: 'block',
            }}
          >
            <img
              src="/fairy-avatar.png"
              alt="Bibi Fairy"
              style={{
                width: '88px',
                height: '88px',
                display: 'block',
                filter: 'drop-shadow(0 0 14px rgba(250, 204, 21, 0.8))'
              }}
            />
          </button>

          {/* ================= BIBI TOOLTIP ================= */}
          <div
            className="bibi-tooltip"
            style={{
              position: 'absolute',
              top: '-38px',
              left: '50%',
              transform: 'translateX(-50%) translateY(0px)',
              backgroundColor: 'rgba(20, 10, 38, 0.95)',
              border: '1px solid #facc15',
              borderRadius: '10px',
              padding: '6px 12px',
              color: '#fef08a',
              fontSize: '11px',
              fontWeight: 'bold',
              letterSpacing: '1px',
              whiteSpace: 'nowrap',
              boxShadow: '0 8px 24px rgba(0,0,0,0.8), 0 0 15px rgba(250, 204, 21, 0.4)',
              pointerEvents: 'none',
              opacity: 0,
              transition: 'opacity 0.25s ease, transform 0.25s ease',
              zIndex: 120,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backdropFilter: 'blur(6px)',
            }}
          >
            <span>✨</span>
            <span>BIBI</span>
            <span>✨</span>
          </div>
        </div>

      </div>

      {/* ================= 5. FULL CHAT HISTORY MODAL (LORE CHRONICLES) ================= */}
      {showHistoryModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(8px)',
          zIndex: 250,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}>
          <div style={{
            backgroundColor: '#170b2c',
            border: '2px solid #facc15',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '650px',
            height: '80vh',
            maxHeight: '700px',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 60px rgba(0,0,0,0.9), 0 0 30px rgba(250, 204, 21, 0.3)',
            overflow: 'hidden',
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '18px 24px',
              backgroundColor: 'rgba(46, 16, 101, 0.8)',
              borderBottom: '1px solid rgba(250, 204, 21, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <BookOpen size={22} color="#facc15" />
                <div>
                  <h3 style={{ margin: 0, color: '#fef08a', fontSize: '18px', letterSpacing: '1px' }}>
                    BIBI'S LORE CHRONICLES
                  </h3>
                  <span style={{ fontSize: '11px', color: '#c084fc' }}>
                    Archived conversations inscribed into PostgreSQL scrolls
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer' }}
              >
                <X size={22} />
              </button>
            </div>

            {/* Arama Barı */}
            <div style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: '10px' }}>
              <div style={{
                flex: 1,
                backgroundColor: '#0a0512',
                border: '1px solid #7c3aed',
                borderRadius: '10px',
                padding: '8px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <Search size={16} color="#a855f7" />
                <input
                  type="text"
                  placeholder="Search in conversation logs..."
                  value={historySearchQuery}
                  onChange={(e) => setHistorySearchQuery(e.target.value)}
                  style={{
                    flex: 1,
                    background: 'none',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* Mesaj Akışı */}
            <div style={{
              flex: 1,
              padding: '20px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}>
              {filteredHistory.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', fontSize: '13px' }}>
                  No chronicles found matching your search runes.
                </div>
              ) : (
                filteredHistory.map((msg, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                      gap: '4px',
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '10px',
                      color: '#94a3b8',
                    }}>
                      <span style={{ fontWeight: 'bold', color: msg.sender === 'user' ? '#c084fc' : '#facc15' }}>
                        {msg.sender === 'user' ? (currentUser?.username || 'Wanderer') : 'Bibi'}
                      </span>
                      {msg.createdAt && (
                        <span>• {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      )}
                    </div>

                    <div style={{
                      backgroundColor: msg.sender === 'user' ? '#581c87' : 'rgba(255, 255, 255, 0.06)',
                      color: msg.sender === 'user' ? '#fff' : '#fef08a',
                      border: msg.sender === 'fairy' ? '1px solid rgba(250, 204, 21, 0.3)' : '1px solid #7c3aed',
                      borderRadius: msg.sender === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      padding: '12px 16px',
                      maxWidth: '80%',
                      lineHeight: '1.5',
                      fontSize: '13px',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
                    }}>
                      {msg.text}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '12px 20px',
              backgroundColor: '#0a0512',
              borderTop: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '12px',
              color: '#cbd5e1',
            }}>
              <span>Total Inscriptions: {messages.length}</span>
              <button
                onClick={() => setShowHistoryModal(false)}
                style={{
                  backgroundColor: '#7c3aed',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '6px 16px',
                  color: '#fff',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
              >
                Close Chronicles
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}