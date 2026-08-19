// frontend/src/components/Map.jsx
import React, { useRef } from 'react';
import { BookOpen, PenTool } from 'lucide-react';

const SHOPS = [
  // ================= 1. YAZIHANE (Üstteki Su Kuyusu) =================
  { id: 'yazihane', name: 'Scriptorium', x: 48, y: 15, isYazihane: true },

  // ================= 2. DÜKKANLAR (Cadde Boyunca Hizalı) =================
  // Sol Üst Çatı
  { id: 'fantasy', name: 'Fantasy', x: 18, y: 9 },

  // Sağ Üst Bahçeli Bina
  { id: 'scifi', name: 'Sci-Fi', x: 82, y: 9 },

  // Sol Üst Çatı 1
  { id: 'romance', name: 'Romance', x: 18, y: 25 },
  
  // Sol ara çatı 2
  { id: 'mythology', name: 'Mythology', x: 18, y: 39 }, 

  // Sağ Üst Çatılı Konut
  { id: 'horror', name: 'Horror', x: 82, y: 30 },

  // Sol Orta Çatı
  { id: 'mystery', name: 'Mystery', x: 18, y: 52 },

  // Sağ Orta Uzun Bina (Büyük Han)
  { id: 'historical', name: 'Historical', x: 82, y: 54 },

  // Sol Alt Küçük Avlulu Ev
  { id: 'dystopian', name: 'Dystopian', x: 16, y: 69 },

  // Sol Alt Büyük Köşe Binası (Giriş)
  { id: 'classics', name: 'Classics', x: 18, y: 91 },

  // Sağ Alt Kuleli Han / Tavernası
  { id: 'gothic', name: 'Gothic / Thriller', x: 82, y: 78 },

  // Sağ En Alt Bahçeli Ahşap Teras
  { id: 'ya', name: 'Young Adult', x: 80, y: 92 },
];

export default function Map({ onSelectShop, onOpenYazihane }) {
  const containerRef = useRef(null);

    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: '#0a0512',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        {/* Üst Karartma (Fade) */}
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, height: '120px',
          background: 'linear-gradient(to bottom, #0a0512, transparent)',
          pointerEvents: 'none', zIndex: 20
        }} />

        {/* Alt Karartma (Fade) */}
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, height: '120px',
          background: 'linear-gradient(to top, #0a0512, transparent)',
          pointerEvents: 'none', zIndex: 20
        }} />

        {/* Harita Konteyneri */}
        <div style={{
          position: 'relative',
          width: '100%',
          maxWidth: '850px',
          margin: '0 auto',
          paddingTop: '60px',
          paddingBottom: '100px',
          backgroundColor: '#0a0512',
        }}>
          <img
            src="/map.jpg"
            alt="Map"
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />

        {/* Butonlar */}
        {SHOPS.map((shop) => (
          <button
            key={shop.id}
            onClick={() => (shop.isYazihane ? onOpenYazihane() : onSelectShop(shop))}
            style={{
              position: 'absolute',
              left: `${shop.x}%`,
              top: `${shop.y}%`,
              transform: 'translate(-50%, -50%)',
              backgroundColor: shop.isYazihane ? '#facc15' : 'rgba(20, 10, 38, 0.92)',
              color: shop.isYazihane ? '#451a03' : '#fef08a',
              border: shop.isYazihane ? '2px solid #ffffff' : '1.5px solid #c084fc',
              borderRadius: '24px',
              padding: '8px 14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 'bold',
              fontSize: '12px',
              fontFamily: '"Cinzel", serif',
              boxShadow: shop.isYazihane 
                ? '0 0 20px rgba(250, 204, 21, 0.9), 0 4px 12px rgba(0,0,0,0.8)' 
                : '0 4px 15px rgba(0,0,0,0.8)',
              zIndex: 10,
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              whiteSpace: 'nowrap',
              backdropFilter: 'blur(6px)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1.12)';
              e.currentTarget.style.boxShadow = '0 0 22px rgba(250, 204, 21, 0.7)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)';
              e.currentTarget.style.boxShadow = shop.isYazihane 
                ? '0 0 20px rgba(250, 204, 21, 0.9), 0 4px 12px rgba(0,0,0,0.8)' 
                : '0 4px 15px rgba(0,0,0,0.8)';
            }}
          >
            {shop.isYazihane ? <PenTool size={15} color="#451a03" /> : <BookOpen size={14} color="#c084fc" />}
            <span>{shop.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}