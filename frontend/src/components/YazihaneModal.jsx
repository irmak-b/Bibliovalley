import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Search, Sparkles, Loader2, BookOpen } from 'lucide-react';

const VALLEY_GENRES = [
  { id: 'fantasy', name: 'Fantasy' },
  { id: 'scifi', name: 'Sci-Fi' },
  { id: 'romance', name: 'Romance' },
  { id: 'horror', name: 'Horror' },
  { id: 'mystery', name: 'Mystery' },
  { id: 'historical', name: 'Historical' },
  { id: 'dystopian', name: 'Dystopian' },
  { id: 'classics', name: 'Classics' },
  { id: 'gothic', name: 'Gothic / Thriller' },
  { id: 'ya', name: 'Young Adult' },
  { id: 'mythology', name: 'Mythology' },
];

export default function YazihaneModal({ isOpen, onClose, initialBook, currentUser }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const [selectedBook, setSelectedBook] = useState(null);
  const [genre, setGenre] = useState('fantasy');
  const [rating, setRating] = useState(5);
  const [thoughts, setThoughts] = useState('');
  const [quotes, setQuotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (initialBook) {
      setSelectedBook({
        title: initialBook.title,
        author: initialBook.author,
        coverUrl: initialBook.coverUrl,
        externalId: initialBook.externalId || String(Date.now()),
        pages: initialBook.pages || null,
      });

      // Target genre match
      if (initialBook.targetGenre) {
        const found = VALLEY_GENRES.find(
          g => g.name.toLowerCase() === initialBook.targetGenre.toLowerCase() || g.id === initialBook.targetGenre.toLowerCase()
        );
        if (found) setGenre(found.id);
      }
    }
  }, [initialBook]);

  if (!isOpen) return null;

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/books/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchResults(res.data || []);
    } catch (err) {
      console.error('Searcing error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSealParchment = async (e) => {
    e.preventDefault();
    if (!selectedBook || isSaving) return;

    setIsSaving(true);
    try {
      const res = await axios.post('http://localhost:5000/api/parchments', {
        userId: currentUser?.id || null,
        book: selectedBook,
        genre: genre,
        rating,
        thoughts,
        quotes,
      });

      if (res.data && res.data.success) {
        alert('✨ The parchment has been successfully sealed and added to the shop!');
        setSelectedBook(null);
        setThoughts('');
        setQuotes('');
        onClose();
      }
    } catch (err) {
      console.error('Sealing error:', err);
      alert('An error occured while loading ' + (err.response?.data?.error || err.message));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div 
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 2500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontFamily: '"Cinzel", serif',
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#170b2c',
          border: '2px solid #facc15',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '560px',
          padding: '28px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.9)',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: '#fef08a', fontSize: '24px' }}>The Scriptorium (Yazıhane)</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer' }}>
            <X size={22} />
          </button>
        </div>

        {/* 1. SEARCH FORM IF NO BOOK IS SELECTED */}
        {!selectedBook ? (
          <div>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <input
                type="text"
                placeholder="Search book in Open Library..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  flex: 1,
                  backgroundColor: '#0a0512',
                  border: '1px solid #7c3aed',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  color: '#fff',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                disabled={isSearching}
                style={{
                  backgroundColor: '#7c3aed',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '0 16px',
                  color: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {isSearching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
              </button>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
              {searchResults.map((b) => (
                <div
                  key={b.externalId}
                  onClick={() => setSelectedBook(b)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    cursor: 'pointer',
                    border: '1px solid rgba(124, 58, 237, 0.3)',
                  }}
                >
                  {b.coverUrl ? (
                    <img src={b.coverUrl} alt={b.title} style={{ width: '32px', height: '46px', objectFit: 'cover', borderRadius: '4px' }} />
                  ) : (
                    <div style={{ width: '32px', height: '46px', backgroundColor: '#2e1065', borderRadius: '4px' }} />
                  )}
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#fff' }}>{b.title}</div>
                    <div style={{ fontSize: '11px', color: '#cbd5e1' }}>{b.author}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* 2. STAMPING FORM FOR SELECTED BOOK */
          <form onSubmit={handleSealParchment} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'rgba(124, 58, 237, 0.2)',
              border: '1px solid #c084fc',
              borderRadius: '14px',
              padding: '12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {selectedBook.coverUrl ? (
                  <img src={selectedBook.coverUrl} alt={selectedBook.title} style={{ width: '40px', height: '58px', objectFit: 'cover', borderRadius: '6px' }} />
                ) : (
                  <div style={{ width: '40px', height: '58px', backgroundColor: '#2e1065', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BookOpen size={20} color="#a855f7" />
                  </div>
                )}
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#fef08a' }}>{selectedBook.title}</div>
                  <div style={{ fontSize: '12px', color: '#cbd5e1' }}>{selectedBook.author}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBook(null)}
                style={{ background: 'none', border: 'none', color: '#c084fc', fontSize: '11px', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Change Book
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', color: '#c084fc', display: 'block', marginBottom: '4px' }}>Target Shop (Genre)</label>
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  style={{ width: '100%', backgroundColor: '#0a0512', border: '1px solid #7c3aed', borderRadius: '8px', padding: '8px', color: '#fff', fontSize: '12px' }}
                >
                  {VALLEY_GENRES.map((g) => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '11px', color: '#c084fc', display: 'block', marginBottom: '4px' }}>Rating</label>
                <select
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  style={{ width: '100%', backgroundColor: '#0a0512', border: '1px solid #7c3aed', borderRadius: '8px', padding: '8px', color: '#facc15', fontSize: '12px' }}
                >
                  <option value={5}>⭐⭐⭐⭐⭐ (5)</option>
                  <option value={4}>⭐⭐⭐⭐ (4)</option>
                  <option value={3}>⭐⭐⭐ (3)</option>
                  <option value={2}>⭐⭐ (2)</option>
                  <option value={1}>⭐ (1)</option>
                </select>
              </div>
            </div>

            <textarea
              placeholder="Your enchanted thoughts & review..."
              value={thoughts}
              onChange={(e) => setThoughts(e.target.value)}
              rows={3}
              style={{
                backgroundColor: '#0a0512',
                border: '1px solid #7c3aed',
                borderRadius: '10px',
                padding: '10px',
                color: '#fff',
                fontSize: '12px',
                outline: 'none',
                resize: 'none',
              }}
            />

            <textarea
              placeholder="Memorable quotes..."
              value={quotes}
              onChange={(e) => setQuotes(e.target.value)}
              rows={2}
              style={{
                backgroundColor: '#0a0512',
                border: '1px solid #7c3aed',
                borderRadius: '10px',
                padding: '10px',
                color: '#fff',
                fontSize: '12px',
                outline: 'none',
                resize: 'none',
              }}
            />

            <button
              type="submit"
              disabled={isSaving}
              style={{
                backgroundColor: '#facc15',
                color: '#451a03',
                border: 'none',
                borderRadius: '12px',
                padding: '12px',
                fontWeight: 'bold',
                fontSize: '14px',
                cursor: isSaving ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                opacity: isSaving ? 0.7 : 1,
              }}
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              Seal Parchment to Shop
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
