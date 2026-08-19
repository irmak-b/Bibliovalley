// frontend/src/components/ShopModal.jsx
import React, { useEffect, useState } from 'react';
import { X, Book, Sparkles, Trash2 } from 'lucide-react';
import axios from 'axios';

const SPINE_COLORS = [
  '#78350f', '#451a03', '#92400e', '#064e3b', '#1e3a8a', '#581c87', '#881337'
];

export default function ShopModal({ isOpen, shop, onClose, onSelectParchment , currentUser }) {
  const [parchments, setParchments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
  const fetchParchments = async () => {
    if (!shop?.id) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/shops/${shop.id}/parchments`, {
        params: { userId: currentUser?.id },
        headers: { 'x-user-id': currentUser?.id || '' }
      });
      setParchments(res.data || []);
    } catch (err) {
      console.error('Parşömenler alınamadı:', err);
    }
  };
  fetchParchments();
}, [shop, currentUser]);

  const fetchParchments = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/shops/${shop.id}/parchments`);
      setParchments(res.data);
    } catch (err) {
      console.error('Parchments can not upload:', err);
    } finally {
      setLoading(false);
    }
  };

  // Parşömen Silme Fonksiyonu
  const handleDeleteParchment = async (e, parchmentId, title) => {
    e.stopPropagation(); // Kitabın açılmasını engelle
    if (!window.confirm(`"${title}" Are you sure you want to burn/erase your parchment??`)) return;

    try {
      await axios.delete(`http://localhost:5000/api/parchments/${parchmentId}`);
      setParchments(parchments.filter((p) => p.id !== parchmentId));
    } catch (err) {
      console.error('Deletion Error:', err);
      alert('An error occurred while deleting the parchment.');
    }
  };

  if (!isOpen || !shop) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 40,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#1c1917',
        border: '3px solid #b45309',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '850px',
        color: '#fef3c7',
        boxShadow: '0 25px 50px rgba(0,0,0,0.9)',
        overflow: 'hidden'
      }}>
        
        {/* Dükkan Başlığı */}
        <div style={{
          padding: '20px 24px',
          backgroundColor: '#292524',
          borderBottom: '2px solid #78350f',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles color="#fde047" size={24} />
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>
              🏰 {shop.name} Shop Book Shelves
            </h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#a8a29e', cursor: 'pointer' }}>
            <X size={26} />
          </button>
        </div>

        {/* Ahşap Raf İçeriği */}
        <div style={{ padding: '40px 30px', backgroundColor: '#0c0a09', minHeight: '320px' }}>
          
          {loading ? (
            <p style={{ textAlign: 'center', color: '#a8a29e' }}>The shelves are being cleared of dust...</p>
          ) : parchments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#78716c' }}>
              <Book size={48} style={{ marginBottom: '12px', opacity: 0.5, margin: '0 auto' }} />
              <p style={{ fontSize: '16px', margin: 0 }}>Bu dükkanın rafı henüz boş.</p>
              <p style={{ fontSize: '13px', marginTop: '6px' }}>Yazıhane'ye gidip ilk parşömeni sen mühürle!</p>
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              {/* Kitap Sırtları */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-end',
                gap: '16px',
                flexWrap: 'wrap',
                paddingBottom: '8px',
                minHeight: '200px'
              }}>
                {parchments.map((p, index) => {
                  const spineColor = SPINE_COLORS[index % SPINE_COLORS.length];
                  return (
                    <div
                      key={p.id}
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}
                    >
                      {/* Silme Butonu */}
                      <button
                        onClick={(e) => handleDeleteParchment(e, p.id, p.title)}
                        style={{
                          backgroundColor: '#991b1b',
                          border: 'none',
                          borderRadius: '50%',
                          color: '#fff',
                          width: '22px',
                          height: '22px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          marginBottom: '6px',
                          boxShadow: '0 2px 5px rgba(0,0,0,0.5)'
                        }}
                        title="Burn the Parchment"
                      >
                        <Trash2 size={12} />
                      </button>

                      {/* Kitap Sırtı */}
                      <div
                        onClick={() => onSelectParchment({ ...p, shopGenre: shop.id })}
                        style={{
                          backgroundColor: spineColor,
                          width: '42px',
                          height: '170px',
                          borderRadius: '4px 4px 0 0',
                          borderLeft: '2px solid rgba(255,255,255,0.2)',
                          borderRight: '2px solid rgba(0,0,0,0.4)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          writingMode: 'vertical-rl',
                          textOrientation: 'mixed',
                          transform: 'rotate(180deg)',
                          color: '#fef3c7',
                          fontWeight: 'bold',
                          fontSize: '12px',
                          padding: '8px 0',
                          boxShadow: '3px 0 10px rgba(0,0,0,0.5)',
                          transition: 'transform 0.2s ease',
                          userSelect: 'none'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = 'rotate(180deg) translateY(10px)')}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = 'rotate(180deg) translateY(0)')}
                        title={p.title}
                      >
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxHeight: '140px' }}>
                          {p.title}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Ahşap Raf Tabanı */}
              <div style={{
                height: '16px',
                backgroundColor: '#78350f',
                borderRadius: '4px',
                borderTop: '2px solid #b45309',
                boxShadow: '0 6px 12px rgba(0,0,0,0.8)'
              }} />
            </div>
          )}

        </div>

      </div>
    </div>
  );
}