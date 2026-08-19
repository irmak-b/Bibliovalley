import React, { useState } from 'react';
import { Star, X } from 'lucide-react';
import { getThemeByGenre } from '../config/parchmentThemes';

export default function ParchmentView({ parchment, onClose }) {
  if (!parchment) return null;

  const genreToUse = parchment.shopGenre || parchment.shop?.genre || parchment.genre;
  const theme = getThemeByGenre(genreToUse);

  const quotesList = parchment.quotes ? parchment.quotes.split('|||') : [];
  const [favoritePages, setFavoritePages] = useState(Array(20).fill(''));

  const handlePageChange = (index, value) => {
    if (value.length <= 5) {
      const updated = [...favoritePages];
      updated[index] = value;
      setFavoritePages(updated);
    }
  };

  return (
    <div 
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2500,
        padding: '20px',
      }}
    >
      {/* Parch container */}
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundImage: `url(${theme.bgImage})`,
          fontFamily: theme.fontFamily,
          color: theme.textColor,
          position: 'relative',
          width: '900px',
          height: '560px',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: '12px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.9)',
          display: 'flex',
          padding: '36px',
          gap: '32px',
          boxSizing: 'border-box',
        }}
      >
        {/* Closing */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '-15px',
            right: '-15px',
            backgroundColor: '#451a03',
            border: '2px solid #b45309',
            color: '#fef3c7',
            borderRadius: '50%',
            width: '38px',
            height: '38px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
            zIndex: 10,
          }}
        >
          <X size={22} />
        </button>

        {/* Left Page */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <img 
              src={parchment.coverUrl || 'https://via.placeholder.com/110x160?text=Kapak+Yok'} 
              alt={parchment.title} 
              style={{
                width: '115px',
                height: '160px',
                objectFit: 'cover',
                borderRadius: '6px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                border: '1px solid rgba(0,0,0,0.3)',
              }}
            />
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: 'rgba(0, 0, 0, 0.25)',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}>
              <h2 style={{
                margin: 0,
                fontSize: '20px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                lineHeight: '1.2',
                color: theme.titleColor || '#ffffff',
                textShadow: '0 2px 4px rgba(0,0,0,0.6)',
              }}>
                {parchment.title}
              </h2>
              
              <p style={{ 
                margin: '6px 0 12px 0', 
                fontSize: '15px', 
                fontWeight: '600', 
                color: theme.titleColor || '#ffffff',
                opacity: 0.95,
              }}>
                ✍️ {parchment.author}
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '4px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    size={20} 
                    fill={star <= (parchment.rating || 5) ? '#f59e0b' : 'none'} 
                    color={star <= (parchment.rating || 5) ? '#f59e0b' : '#a8a29e'} 
                  />
                ))}
              </div>
            </div>
          </div>

          <div style={{
            flex: 1,
            overflowY: 'auto',
            fontSize: '14px',
            lineHeight: '1.6',
            padding: '12px 14px',
            backgroundColor: 'rgba(255, 255, 255, 0.25)',
            backdropFilter: 'blur(3px)',
            border: '1px solid rgba(0, 0, 0, 0.15)',
            borderRadius: '8px',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)',
          }}>
            <p style={{ margin: 0, fontWeight: '500' }}>
              {parchment.thoughts || 'No personal notes added yet...'}
            </p>
          </div>
        </div>

        {/* Right Page */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '360px', overflowY: 'auto' }}>
            {quotesList.length > 0 ? (
              quotesList.map((q, idx) => (
                <div 
                  key={idx}
                  style={{
                    backgroundColor: theme.quoteBg,
                    padding: '12px 16px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    lineHeight: '1.5',
                    fontStyle: 'italic',
                    borderLeft: `4px solid ${theme.tableBorder || '#b45309'}`,
                    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                  }}
                >
                  <strong style={{ display: 'block', fontSize: '11px', fontStyle: 'normal', marginBottom: '2px', opacity: 0.8 }}>
                    QUOTE {idx + 1}:
                  </strong> 
                  "{q}"
                </div>
              ))
            ) : (
              <div style={{
                backgroundColor: theme.quoteBg,
                padding: '12px',
                borderRadius: '8px',
                fontSize: '13px',
                fontStyle: 'italic',
                borderLeft: '4px solid rgba(0,0,0,0.2)',
              }}>
                No quotes have been added yet...
              </div>
            )}
          </div>

          {/* Fav chaps (to be developed) */}
          <div style={{ marginTop: 'auto' }}>
            <div style={{
              backgroundColor: theme.tableBg,
              border: `1px solid ${theme.tableBorder}`,
              borderRadius: '6px 6px 0 0',
              padding: '6px',
              fontSize: '12px',
              fontWeight: 'bold',
              textAlign: 'center',
            }}>
              Favorite Chapters / Pages
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(10, 1fr)',
              borderBottom: `1px solid ${theme.tableBorder}`,
              borderLeft: `1px solid ${theme.tableBorder}`,
              borderRight: `1px solid ${theme.tableBorder}`,
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: '0 0 6px 6px',
            }}>
              {favoritePages.map((val, idx) => (
                <input
                  key={idx}
                  type="text"
                  maxLength={5}
                  value={val}
                  onChange={(e) => handlePageChange(idx, e.target.value)}
                  placeholder="—"
                  style={{
                    borderTop: `1px solid ${theme.tableBorder}`,
                    borderRight: `1px solid ${theme.tableBorder}`,
                    height: '28px',
                    width: '100%',
                    backgroundColor: 'transparent',
                    borderLeft: 'none',
                    borderBottom: 'none',
                    textAlign: 'center',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    fontFamily: 'monospace',
                    color: theme.textColor,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
