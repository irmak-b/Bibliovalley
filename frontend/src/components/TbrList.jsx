// frontend/src/components/TbrList.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Sparkles, 
  Plus, 
  Trash2, 
  Search, 
  Loader2, 
  Flame, 
  BookOpen, 
  X,
  Feather
} from 'lucide-react';

export default function TbrList({ currentUser, onTranscribeToScriptorium }) {
  const [tbrBooks, setTbrBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Modal & Arama State'leri
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [priority, setPriority] = useState('Medium');

  // 1. Kullanıcı Giriş Yaptığında Veritabanından TBR Listesini Çek
  useEffect(() => {
    const fetchTbr = async () => {
      if (!currentUser?.id) return;
      setIsLoading(true);
      try {
        const res = await axios.get(`http://localhost:5000/api/tbr/${currentUser.id}`);
        setTbrBooks(res.data || []);
      } catch (err) {
        console.error('TBR veritabanından alınamadı:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTbr();
  }, [currentUser]);

  // Open Library API Arama Tetikleyici
  const handleSearchBooks = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/books/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchResults(res.data || []);
    } catch (err) {
      console.error('Kitap arama hatası:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // 2. Veritabanına Yeni TBR Kitabı Ekle
  const handleAddBook = async () => {
    if (!selectedBook || !currentUser?.id) {
      alert('Please log in to inscribe quests to your scroll!');
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/api/tbr/add', {
        userId: currentUser.id,
        title: selectedBook.title,
        author: selectedBook.author || 'Unknown Bard',
        coverUrl: selectedBook.coverUrl || '',
        priority: priority,
        status: 'Queue',
      });

      setTbrBooks((prev) => [res.data, ...prev]);

      setSelectedBook(null);
      setSearchQuery('');
      setSearchResults([]);
      setIsModalOpen(false);
    } catch (err) {
      console.error('Veritabanına TBR eklenemedi:', err);
      alert('Failed to inscribe quest to database.');
    }
  };

  // 3. Kitap Durumunu Döndür
  const handleToggleStatus = async (id) => {
    const target = tbrBooks.find((b) => b.id === id);
    if (!target) return;

    const nextStatus = 
      target.status === 'Queue' ? 'Reading' : 
      target.status === 'Reading' ? 'Completed' : 'Queue';

    try {
      await axios.put(`http://localhost:5000/api/tbr/status/${id}`, {
        status: nextStatus,
      });

      setTbrBooks((prev) =>
        prev.map((book) => (book.id === id ? { ...book, status: nextStatus } : book))
      );
    } catch (err) {
      console.error('Durum veritabanında güncellenemedi:', err);
    }
  };

  // 4. Kitabı Sil
  const handleDeleteBook = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/tbr/${id}`);
      setTbrBooks((prev) => prev.filter((book) => book.id !== id));
    } catch (err) {
      console.error('Kitap silinemedi:', err);
    }
  };

  // Scriptorium'a Aktarma
  const handleSendToScriptorium = (book) => {
    if (onTranscribeToScriptorium) {
      onTranscribeToScriptorium(book);
    }
  };

  const getPriorityStyle = (p) => {
    switch (p) {
      case 'High':
        return { color: '#f87171', bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.3)' };
      case 'Medium':
        return { color: '#facc15', bg: 'rgba(250, 204, 21, 0.15)', border: 'rgba(250, 204, 21, 0.3)' };
      default:
        return { color: '#60a5fa', bg: 'rgba(96, 165, 250, 0.15)', border: 'rgba(96, 165, 250, 0.3)' };
    }
  };

  const getStatusStyle = (s) => {
    switch (s) {
      case 'Reading':
        return { color: '#c084fc', bg: '#581c87', border: '#7c3aed' };
      case 'Completed':
        return { color: '#4ade80', bg: 'rgba(34, 197, 94, 0.2)', border: '#22c55e' };
      default:
        return { color: '#cbd5e1', bg: 'rgba(255, 255, 255, 0.05)', border: 'rgba(255, 255, 255, 0.1)' };
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a0512',
      color: '#f8fafc',
      padding: '120px 24px 80px 24px',
      fontFamily: '"Cinzel", serif',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Peri Işıkları */}
      <div style={{ position: 'fixed', top: '15%', left: '8%', width: '12px', height: '12px', backgroundColor: '#fef08a', borderRadius: '50%', boxShadow: '0 0 20px 8px rgba(250, 204, 21, 0.7)', pointerEvents: 'none', zIndex: 1 }} />
      <div style={{ position: 'fixed', top: '55%', right: '10%', width: '14px', height: '14px', backgroundColor: '#c084fc', borderRadius: '50%', boxShadow: '0 0 25px 10px rgba(192, 132, 252, 0.65)', pointerEvents: 'none', zIndex: 1 }} />

      <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
        {/* Başlık ve Kitap Ekle Butonu */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '36px', color: '#fef08a', letterSpacing: '3px', margin: 0, textShadow: '0 0 20px rgba(250, 204, 21, 0.5)' }}>
              TBR SCROLL OF DESTINY
            </h1>
            <p style={{ color: '#cbd5e1', fontSize: '14px', marginTop: '6px' }}>
              Enchanted quests awaiting your literary ink.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            style={{
              backgroundColor: '#facc15',
              color: '#451a03',
              border: 'none',
              borderRadius: '12px',
              padding: '12px 20px',
              fontSize: '13px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 0 20px rgba(250, 204, 21, 0.4)',
              transition: 'transform 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <Plus size={16} /> Inscribe New Quest
          </button>
        </div>

        {/* Yükleniyor / Boş / Liste Durumları */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#c084fc' }}>
            <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 12px auto' }} />
            <span>Unrolling your sacred parchment...</span>
          </div>
        ) : tbrBooks.length === 0 ? (
          <div style={{
            backgroundColor: 'rgba(26, 14, 48, 0.6)',
            border: '2px dashed rgba(168, 85, 247, 0.4)',
            borderRadius: '24px',
            padding: '80px 24px',
            textAlign: 'center',
            backdropFilter: 'blur(8px)',
          }}>
            <Sparkles size={36} color="#facc15" style={{ marginBottom: '16px', opacity: 0.8 }} />
            <h3 style={{ fontSize: '18px', color: '#fef08a', margin: '0 0 8px 0' }}>Your TBR Scroll is Clean & Silent...</h3>
            <p style={{ color: '#cbd5e1', fontSize: '14px', maxWidth: '420px', margin: '0 auto' }}>
              No reading quests inscribed yet. Click above to search Open Library and add your next adventure!
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {tbrBooks.map((book) => {
              const pStyle = getPriorityStyle(book.priority);
              const sStyle = getStatusStyle(book.status);

              return (
                <div
                  key={book.id}
                  style={{
                    backgroundColor: 'rgba(26, 14, 48, 0.75)',
                    border: '1px solid rgba(124, 58, 237, 0.4)',
                    borderRadius: '16px',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: 0 }}>
                    {book.coverUrl ? (
                      <img src={book.coverUrl} alt={book.title} style={{ width: '40px', height: '60px', objectFit: 'cover', borderRadius: '6px' }} />
                    ) : (
                      <div style={{ width: '40px', height: '60px', backgroundColor: '#2e1065', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <BookOpen size={18} color="#a855f7" />
                      </div>
                    )}
                    
                    <div style={{ minWidth: 0 }}>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {book.title}
                      </h4>
                      <p style={{ margin: 0, fontSize: '12px', color: '#cbd5e1' }}>
                        {book.author}
                      </p>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                        <span style={{ fontSize: '10px', color: pStyle.color, backgroundColor: pStyle.bg, border: `1px solid ${pStyle.border}`, padding: '2px 8px', borderRadius: '999px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <Flame size={10} /> {book.priority} Priority
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                      onClick={() => handleSendToScriptorium(book)}
                      title="Transcribe to Scriptorium review"
                      style={{
                        backgroundColor: 'rgba(124, 58, 237, 0.25)',
                        border: '1px solid #c084fc',
                        color: '#fef08a',
                        borderRadius: '8px',
                        padding: '6px 12px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#7c3aed';
                        e.currentTarget.style.color = '#ffffff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(124, 58, 237, 0.25)';
                        e.currentTarget.style.color = '#fef08a';
                      }}
                    >
                      <Feather size={13} color="#facc15" /> Transcribe
                    </button>

                    <button
                      onClick={() => handleToggleStatus(book.id)}
                      title="Click to cycle status: Queue -> Reading -> Completed"
                      style={{
                        backgroundColor: sStyle.bg,
                        border: `1px solid ${sStyle.border}`,
                        color: sStyle.color,
                        borderRadius: '8px',
                        padding: '6px 12px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                      }}
                    >
                      {book.status}
                    </button>

                    <button
                      onClick={() => handleDeleteBook(book.id)}
                      title="Remove from TBR"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#64748b',
                        cursor: 'pointer',
                        padding: '6px',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ================= KİTAP EKLEME MODALI ================= */}
      {isModalOpen && (
        <div 
          onClick={() => setIsModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(6px)',
            zIndex: 2500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#170b2c',
              border: '2px solid #facc15',
              borderRadius: '24px',
              width: '100%',
              maxWidth: '520px',
              padding: '28px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.9)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, color: '#fef08a', fontSize: '20px' }}>Inscribe to TBR Queue</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSearchBooks} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <input
                type="text"
                placeholder="Search Open Library..."
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

            {searchResults.length > 0 && (
              <div style={{
                maxHeight: '160px',
                overflowY: 'auto',
                backgroundColor: '#0a0512',
                borderRadius: '10px',
                border: '1px solid rgba(124, 58, 237, 0.4)',
                padding: '8px',
                marginBottom: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}>
                {searchResults.map((book) => (
                  <div
                    key={book.externalId}
                    onClick={() => setSelectedBook(book)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      backgroundColor: selectedBook?.externalId === book.externalId ? 'rgba(124, 58, 237, 0.4)' : 'transparent',
                      border: selectedBook?.externalId === book.externalId ? '1px solid #facc15' : '1px solid transparent',
                      cursor: 'pointer',
                    }}
                  >
                    {book.coverUrl ? (
                      <img src={book.coverUrl} alt={book.title} style={{ width: '28px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                    ) : (
                      <div style={{ width: '28px', height: '40px', backgroundColor: '#2e1065', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <BookOpen size={14} color="#a855f7" />
                      </div>
                    )}
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{book.title}</div>
                      <div style={{ fontSize: '10px', color: '#cbd5e1' }}>{book.author}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedBook && (
              <div style={{
                backgroundColor: 'rgba(124, 58, 237, 0.2)',
                border: '1px solid #c084fc',
                borderRadius: '12px',
                padding: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
              }}>
                <div style={{ fontSize: '12px', color: '#fef08a', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {selectedBook.title}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    style={{
                      backgroundColor: '#0a0512',
                      border: '1px solid #7c3aed',
                      borderRadius: '8px',
                      padding: '6px',
                      color: '#facc15',
                      fontSize: '11px',
                    }}
                  >
                    <option value="High">High 🔥</option>
                    <option value="Medium">Medium ⚡</option>
                    <option value="Low">Low 🍃</option>
                  </select>

                  <button
                    onClick={handleAddBook}
                    style={{
                      backgroundColor: '#facc15',
                      color: '#451a03',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 14px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                    }}
                  >
                    Add
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}