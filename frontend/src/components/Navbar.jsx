import React, { useState } from 'react';
import { 
  Compass, 
  CalendarDays, 
  Trophy, 
  Bookmark, 
  User, 
  Menu, 
  X, 
  Sparkles 
} from 'lucide-react';

export default function Navbar({ onNavigate, activeTab, onOpenProfile }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'tracker', label: 'Reading Tracker' },
    { id: 'playoff', label: 'Playoffs' },
    { id: 'tbr', label: 'TBR List' },
    { id: 'valley', label: 'The Valley' },
  ];

  const handleItemClick = (id) => {
    onNavigate(id);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav style={{
      position: 'absolute', // 'fixed' yerine 'absolute' ile arka planın bir parçası gibi davranır
      top: 0,
      left: 0,
      width: '100%',
      zIndex: 100,
      padding: '24px 40px', // Daha ferah boşluklar
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxSizing: 'border-box'
      // Arka plan rengi veya gölge (box-shadow) tamamen kaldırıldı
    }}>
      
      {/* LOGO ) */}
      <div 
        onClick={() => handleItemClick('landing')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          cursor: 'pointer',
          userSelect: 'none'
        }}
      >
        {/* Logo */}
        <Sparkles size={24} color="#fef08a" style={{ filter: 'drop-shadow(0 0 8px rgba(250, 204, 21, 0.6))' }} />
        <span style={{
          fontSize: '20px',
          fontWeight: 'bold',
          letterSpacing: '3px',
          color: '#ffffff', // Temiz beyaz metin
          fontFamily: '"Cinzel", serif',
          textShadow: '0 2px 4px rgba(0,0,0,0.5)'
        }}>
          BIBLIOVALLEY
        </span>
      </div>

      {/* linkes */}
      <div style={{
        display: 'flex',
        gap: '32px', 
        alignItems: 'center',
      }} className="desktop-nav">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <span
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              style={{
                color: isActive ? '#fef08a' : '#e2e8f0', 
                fontSize: '14px',
                fontWeight: isActive ? '600' : '400',
                letterSpacing: '1px',
                cursor: 'pointer',
                position: 'relative',
                transition: 'color 0.3s ease',
                textShadow: '0 1px 3px rgba(0,0,0,0.6)',
                borderBottom: isActive ? '2px solid #fef08a' : '2px solid transparent',
                paddingBottom: '4px'
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.color = '#e2e8f0';
              }}
            >
              {item.label}
            </span>
          );
        })}
        
        {/* Profile */}
        <User 
          size={20} 
          color="#e2e8f0" 
          onClick={onOpenProfile}
          style={{ cursor: 'pointer', marginLeft: '16px', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#e2e8f0'}
        />
      </div>

      {/* MOBİL (Burger)*/}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="mobile-menu-btn"
        style={{
          background: 'none',
          border: 'none',
          color: '#ffffff',
          cursor: 'pointer',
          padding: '8px',
          display: 'none',
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))'
        }}
      >
        {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
      </button>

      {/* Mobil opener */}
      {isMobileMenuOpen && (
        <div style={{
          position: 'absolute',
          top: '70px',
          right: '20px',
          backgroundColor: 'rgba(15, 7, 28, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '12px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.8)',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <span
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                style={{
                  color: isActive ? '#fef08a' : '#ffffff',
                  fontSize: '16px',
                  cursor: 'pointer',
                  textAlign: 'right'
                }}
              >
                {item.label}
              </span>
            );
          })}
          <span 
            onClick={() => { onOpenProfile(); setIsMobileMenuOpen(false); }}
            style={{ color: '#ffffff', fontSize: '16px', cursor: 'pointer', textAlign: 'right', marginTop: '8px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px' }}
          >
            Profile
          </span>
        </div>
      )}

      {/* Responsive Rules */}
      <style>{`
        @media (min-width: 768px) {
          .desktop-nav {
            display: flex !important;
          }
          .mobile-menu-btn {
            display: none !important;
          }
        }
        @media (max-width: 767px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-menu-btn {
            display: block !important;
          }
        }
      `}</style>
    </nav>
  );
}
