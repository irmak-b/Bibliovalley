// frontend/src/components/ReadingTracker.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toPng } from 'html-to-image';
import { 
  Calendar as CalendarIcon, 
  X, 
  Plus, 
  Trophy, 
  Search, 
  Loader2, 
  BookOpen, 
  Camera,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const MONTHS = [
  { name: 'January', frog: '/frogs/frog-1.png' },
  { name: 'February', frog: '/frogs/frog-2.png' },
  { name: 'March', frog: '/frogs/frog-3.png' },
  { name: 'April', frog: '/frogs/frog-4.png' },
  { name: 'May', frog: '/frogs/frog-5.png' },
  { name: 'June', frog: '/frogs/frog-6.png' },
  { name: 'July', frog: '/frogs/frog-7.png' },
  { name: 'August', frog: '/frogs/frog-8.png' },
  { name: 'September', frog: '/frogs/frog-9.png' },
  { name: 'October', frog: '/frogs/frog-10.png' },
  { name: 'November', frog: '/frogs/frog-11.png' },
  { name: 'December', frog: '/frogs/frog-12.png' },
];

const STORY_WIDTH = 1080;
const STORY_HEIGHT = 1920;

export default function ReadingTracker({ currentUser }) {
  // 1. Dinamik Takvim State'leri
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [activeCalMonth, setActiveCalMonth] = useState(new Date().getMonth());
  const [activeCalYear, setActiveCalYear] = useState(2026);
  const [selectedDay, setSelectedDay] = useState(null);

  // Kullanıcıya özel dinamik localStorage anahtarı (Kullanıcılar birbirine karışmaz)
  // currentUser yoksa storageKey null olur -> hiçbir okuma/yazma yapılmaz (güvenlik için)
  const storageKey = currentUser?.id
    ? `bibliovalley_reading_logs_${currentUser.id}`
    : null;

  const [readingLogs, setReadingLogs] = useState({});
  const [inputPages, setInputPages] = useState('');
  const [monthsData, setMonthsData] = useState({});

  // Modal State'leri
  const [editingMonth, setEditingMonth] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [rating, setRating] = useState(5);
  const [capturingMonth, setCapturingMonth] = useState(null);

  const getDaysInMonth = (year, monthIndex) => {
    return new Date(year, monthIndex + 1, 0).getDate();
  };

  const totalDays = getDaysInMonth(activeCalYear, activeCalMonth);
  const currentMonthName = MONTHS[activeCalMonth].name;

  // Ortak anahtar üretici: HER ZAMAN yıl-ay-gün formatında.
  // Böylece Ağustos 18 ile Eylül 18 (hatta farklı yıllardaki 18'ler) asla karışmaz.
  const buildLogKey = (year, monthNum, day) => `${year}-${monthNum}-${day}`;

  // TEK VE BASİT FETCH EFEKTİ (CycleTracker'daki Promise.all yaklaşımı ile aynı mantık).
  // Önceki sürümde ayrı ayrı çalışan "cache'i yükle" + "backend'den çek" efektleri
  // birbirine giriyor, hangisinin son çalıştığı garanti değildi ve bu yüzden
  // sayfa yenilenince eski/boş veri ekranda kalabiliyordu.
  // Artık: kullanıcı değişince state anında sıfırlanır, SONRA backend'den
  // (Promise.all ile paralel) hem aylık raflar hem günlük loglar tek seferde
  // çekilir ve state DOĞRUDAN backend cevabıyla doldurulur. localStorage sadece
  // "backend cevap verene kadar" gösterilecek geçici bir önizleme için kullanılır,
  // asla backend sonucunun üzerine yazmaz.
  useEffect(() => {
    // Kullanıcı yoksa (çıkış yapıldıysa) her şeyi temizle ve dur.
    if (!currentUser?.id) {
      setReadingLogs({});
      setMonthsData({});
      return;
    }

    let cancelled = false;
    const userId = currentUser.id;
    const key = `bibliovalley_reading_logs_${userId}`;

    // Backend cevabı gelene kadar ekranda hiçbir şey (ya da sadece bu kullanıcının
    // önceki cache'i) görünsün; başka bir kullanıcının verisi asla sızmasın.
    setReadingLogs({});
    setMonthsData({});
    try {
      const cached = localStorage.getItem(key);
      if (cached) setReadingLogs(JSON.parse(cached));
    } catch {
      // cache bozuksa yok say, backend cevabı zaten üzerine yazacak
    }

    (async () => {
      try {
        const [monthsRes, dailyRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/tracker/${userId}`, {
            headers: { 'x-user-id': userId },
          }),
          axios.get(`http://localhost:5000/api/tracker/daily`, {
            params: { userId },
            headers: { 'x-user-id': userId },
          }),
        ]);

        if (cancelled || currentUser?.id !== userId) return; // kullanıcı bu arada değiştiyse eski cevabı yok say

        const grouped = {};
        (monthsRes.data || []).forEach((log) => {
          if (!grouped[log.month]) grouped[log.month] = [];
          grouped[log.month].push(log);
        });
        setMonthsData(grouped);

        const dailyData = dailyRes.data || {};
        setReadingLogs(dailyData);
        localStorage.setItem(key, JSON.stringify(dailyData));
      } catch (err) {
        console.error('Reading Tracker verileri alınamadı:', err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [currentUser?.id]);

  // Gün Rengi Belirleme
  const getDayColor = (pages) => {
    const num = Number(pages) || 0;
    if (num <= 0) return '#1f1338';     // Boş gün
    if (num <= 30) return '#6b21a8';    // 1-30 sayfa
    if (num <= 70) return '#9333ea';    // 31-70 sayfa
    if (num <= 120) return '#c084fc';   // 71-120 sayfa
    return '#facc15';                   // 120+ sayfa
  };

  // Günlük Sayfa Kaydetme (Yıl + Ay + Gün bazlı tekil anahtar)
  const handleSavePages = async (e) => {
    e.preventDefault();
    if (!selectedDay || !currentUser?.id || !storageKey) return;

    const pages = parseInt(inputPages, 10) || 0;
    const currentMonthNum = activeCalMonth + 1;
    const logKey = buildLogKey(activeCalYear, currentMonthNum, selectedDay);

    // Sadece o kullanıcının o yıl/ayına özel anahtarı kaydet
    const updatedLogs = {
      ...readingLogs,
      [logKey]: pages,
    };
    setReadingLogs(updatedLogs);
    localStorage.setItem(storageKey, JSON.stringify(updatedLogs));

    try {
      await axios.post(
        'http://localhost:5000/api/tracker/daily',
        {
          userId: currentUser.id,
          day: Number(selectedDay),
          month: currentMonthNum,
          year: activeCalYear,
          pages: pages,
        },
        { headers: { 'x-user-id': currentUser.id } }
      );
    } catch (err) {
      console.error('Günlük okuma backend kaydı başarısız:', err);
    }

    setSelectedDay(null);
    setInputPages('');
  };

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

  const handleAddBookToMonth = async () => {
    if (!selectedBook || !editingMonth || !currentUser?.id) {
      alert('Please log in to place book covers in your vault!');
      return;
    }

    try {
      const res = await axios.post(
        'http://localhost:5000/api/tracker/add',
        {
          userId: currentUser.id,
          month: editingMonth,
          title: selectedBook.title,
          author: selectedBook.author || 'Unknown Bard',
          coverUrl: selectedBook.coverUrl || '',
          pages: selectedBook.pages ? Number(selectedBook.pages) : 0,
          rating: Number(rating),
          isFavorite: false,
        },
        { headers: { 'x-user-id': currentUser.id } }
      );

      setMonthsData((prev) => ({
        ...prev,
        [editingMonth]: [...(prev[editingMonth] || []), res.data],
      }));

      setSelectedBook(null);
      setSearchQuery('');
      setSearchResults([]);
    } catch (err) {
      console.error('Kitap veritabanına eklenemedi:', err);
      alert('Failed to place cover into the database.');
    }
  };

  const handleToggleFavorite = async (month, bookId) => {
    if (!currentUser?.id) return;
    try {
      await axios.put(
        'http://localhost:5000/api/tracker/favorite',
        {
          id: bookId,
          month,
          userId: currentUser.id,
        },
        { headers: { 'x-user-id': currentUser.id } }
      );

      setMonthsData((prev) => ({
        ...prev,
        [month]: (prev[month] || []).map((b) => ({
          ...b,
          isFavorite: b.id === bookId ? !b.isFavorite : false,
        })),
      }));
    } catch (err) {
      console.error('Şampiyonluk güncellenemedi:', err);
    }
  };

  const waitForImages = (node) => {
    const imgs = Array.from(node.querySelectorAll('img'));
    return Promise.all(
      imgs.map((img) => {
        if (img.complete && img.naturalWidth > 0) return Promise.resolve();
        return new Promise((resolve) => {
          img.addEventListener('load', resolve, { once: true });
          img.addEventListener('error', resolve, { once: true });
          setTimeout(resolve, 4000);
        });
      })
    );
  };

  const handleCaptureMonth = async (monthName, e) => {
    e.stopPropagation();
    setCapturingMonth(monthName);

    await new Promise((resolve) => requestAnimationFrame(resolve));
    await new Promise((resolve) => requestAnimationFrame(resolve));

    const node = document.getElementById(`story-template-${monthName}`);
    if (!node) {
      setCapturingMonth(null);
      return;
    }

    await waitForImages(node);
    await new Promise((resolve) => requestAnimationFrame(resolve));

    try {
      const dataUrl = await toPng(node, {
        quality: 1,
        pixelRatio: 2,
        width: STORY_WIDTH,
        height: STORY_HEIGHT,
        backgroundColor: '#0a0512',
        style: { opacity: '1' },
      });

      const link = document.createElement('a');
      link.download = `Bibliovalley-${monthName}-Wrapup.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Görsel kaydedilemedi:', err);
    } finally {
      setCapturingMonth(null);
    }
  };

  const capturingMonthItem = MONTHS.find((m) => m.name === capturingMonth);
  const capturingBooks = capturingMonth ? (monthsData[capturingMonth] || []) : [];

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
      {/* Süzülen Peri Işıkları */}
      <div style={{ position: 'fixed', top: '15%', left: '8%', width: '12px', height: '12px', backgroundColor: '#fef08a', borderRadius: '50%', boxShadow: '0 0 20px 8px rgba(250, 204, 21, 0.7)', pointerEvents: 'none', zIndex: 1 }} />
      <div style={{ position: 'fixed', top: '45%', right: '8%', width: '14px', height: '14px', backgroundColor: '#c084fc', borderRadius: '50%', boxShadow: '0 0 25px 10px rgba(192, 132, 252, 0.65)', pointerEvents: 'none', zIndex: 1 }} />
      <div style={{ position: 'fixed', bottom: '20%', left: '12%', width: '10px', height: '10px', backgroundColor: '#38bdf8', borderRadius: '50%', boxShadow: '0 0 16px 6px rgba(56, 189, 248, 0.7)', pointerEvents: 'none', zIndex: 1 }} />
      <div style={{ position: 'fixed', top: '75%', right: '15%', width: '12px', height: '12px', backgroundColor: '#facc15', borderRadius: '50%', boxShadow: '0 0 18px 6px rgba(250, 204, 21, 0.6)', pointerEvents: 'none', zIndex: 1 }} />

      {/* ================= SABİT YÜZEN DİNAMİK TAKVİM BUTONU ================= */}
      <div style={{ position: 'fixed', left: '24px', top: '50%', transform: 'translateY(-50%)', zIndex: 90 }}>
        <button
          onClick={() => setIsCalendarOpen(!isCalendarOpen)}
          title="Daily Reading Heatmap"
          style={{
            backgroundColor: '#2e1065',
            border: '2px solid #facc15',
            borderRadius: '50%',
            width: '56px',
            height: '56px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 0 25px rgba(250, 204, 21, 0.5)',
          }}
        >
          <CalendarIcon size={26} color="#fef08a" />
        </button>

        {isCalendarOpen && (
          <div style={{
            position: 'absolute',
            left: '70px',
            top: '50%',
            transform: 'translateY(-50%)',
            backgroundColor: 'rgba(20, 10, 38, 0.98)',
            border: '2px solid #a855f7',
            borderRadius: '24px',
            padding: '24px',
            width: '360px',
            boxShadow: '0 25px 60px rgba(0,0,0,0.95), 0 0 30px rgba(168, 85, 247, 0.35)',
            backdropFilter: 'blur(16px)',
            zIndex: 100,
            boxSizing: 'border-box',
          }}>
            {/* Üst Kısım: Ay Seçici & Kapat Butonu */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  onClick={() => {
                    setActiveCalMonth((prev) => {
                      if (prev === 0) {
                        setActiveCalYear((y) => y - 1);
                        return 11;
                      }
                      return prev - 1;
                    });
                    setSelectedDay(null);
                  }}
                  style={{ background: 'rgba(124, 58, 237, 0.3)', border: '1px solid #c084fc', borderRadius: '8px', color: '#facc15', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}
                >
                  <ChevronLeft size={18} />
                </button>
                <span style={{ fontSize: '16px', color: '#fef08a', fontWeight: 'bold', letterSpacing: '1px' }}>
                  {currentMonthName} {activeCalYear}
                </span>
                <button
                  onClick={() => {
                    setActiveCalMonth((prev) => {
                      if (prev === 11) {
                        setActiveCalYear((y) => y + 1);
                        return 0;
                      }
                      return prev + 1;
                    });
                    setSelectedDay(null);
                  }}
                  style={{ background: 'rgba(124, 58, 237, 0.3)', border: '1px solid #c084fc', borderRadius: '8px', color: '#facc15', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
              <button onClick={() => setIsCalendarOpen(false)} style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {/* Günlerin 7 Sütunlu Izgarası */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(7, 1fr)', 
              gap: '6px', 
              marginBottom: '18px',
              width: '100%',
              boxSizing: 'border-box'
            }}>
              {Array.from({ length: totalDays }, (_, i) => i + 1).map((day) => {
                const currentMonthNum = activeCalMonth + 1;
                // KRİTİK: yıl + ay + gün birlikte -> Ağustos 18 ile Eylül 18 asla karışmaz
                const logKey = buildLogKey(activeCalYear, currentMonthNum, day);

                const pages = readingLogs[logKey] !== undefined
                  ? Number(readingLogs[logKey])
                  : 0;

                const isSelected = selectedDay === day;

                return (
                  <button
                    key={day}
                    onClick={() => {
                      setSelectedDay(day);
                      setInputPages(pages > 0 ? String(pages) : '');
                    }}
                    style={{
                      height: '38px',
                      width: '100%',
                      backgroundColor: getDayColor(pages),
                      border: isSelected 
                        ? '2px solid #ffffff' 
                        : (pages > 0 ? '1px solid #facc15' : '1px solid rgba(168, 85, 247, 0.4)'),
                      borderRadius: '8px',
                      color: pages >= 120 ? '#451a03' : '#f8fafc',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 0,
                      boxShadow: isSelected 
                        ? '0 0 12px #ffffff' 
                        : (pages > 0 ? '0 0 8px rgba(250, 204, 21, 0.5)' : 'none'),
                      transition: 'all 0.15s ease',
                      boxSizing: 'border-box',
                    }}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            {/* Sayfa Giriş Formu */}
            {selectedDay ? (
              <form onSubmit={handleSavePages} style={{ display: 'flex', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '14px' }}>
                <input
                  type="number"
                  placeholder={`${currentMonthName} ${selectedDay} pages...`}
                  value={inputPages}
                  onChange={(e) => setInputPages(e.target.value)}
                  autoFocus
                  style={{
                    flex: 1,
                    backgroundColor: '#0a0512',
                    border: '1px solid #7c3aed',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    color: '#fff',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
                <button
                  type="submit"
                  style={{
                    backgroundColor: '#facc15',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 18px',
                    color: '#451a03',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                  }}
                >
                  Save
                </button>
              </form>
            ) : (
              <div style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'center' }}>
                Click on a day to record pages for {currentMonthName}.
              </div>
            )}
          </div>
        )}
      </div>

      {/* ================= 12 AYLIK ZİG-ZAG DÖNGÜSÜ ================= */}
      <div style={{ maxWidth: '1050px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h1 style={{ fontSize: '38px', color: '#fef08a', letterSpacing: '3px', textShadow: '0 0 20px rgba(250, 204, 21, 0.5)' }}>
            ANNUAL READING VAULT
          </h1>
          <p style={{ color: '#cbd5e1', fontSize: '14px', marginTop: '6px' }}>
            Click on any month to search Open Library and place book covers on your shelf!
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '80px' }}>
          {MONTHS.map((monthItem, index) => {
            const month = monthItem.name;
            const books = monthsData[month] || [];
            const isEven = index % 2 === 0;
            const isCapturing = capturingMonth === month;

            return (
              <div
                key={month}
                id={`month-card-${month}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: isEven ? 'row' : 'row-reverse',
                  width: '100%',
                  gap: '24px',
                  padding: '24px',
                  borderRadius: '24px',
                  backgroundColor: 'transparent',
                  position: 'relative',
                }}
              >
                {/* 1. AY KARTI */}
                <div
                  onClick={() => setEditingMonth(month)}
                  style={{
                    width: '380px',
                    backgroundColor: 'rgba(26, 14, 48, 0.75)',
                    border: '2px solid #7c3aed',
                    borderRadius: '24px',
                    padding: '24px',
                    cursor: 'pointer',
                    boxShadow: '0 12px 35px rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(8px)',
                    transition: 'transform 0.2s ease, border-color 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.03)';
                    e.currentTarget.style.borderColor = '#facc15';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.borderColor = '#7c3aed';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h3 style={{ margin: 0, fontSize: '20px', color: '#fef08a', letterSpacing: '1px' }}>{month}</h3>
                      <button
                        onClick={(e) => handleCaptureMonth(month, e)}
                        disabled={isCapturing}
                        className="hide-on-capture"
                        title="Capture as Story (1080x1920)"
                        style={{
                          backgroundColor: 'rgba(124, 58, 237, 0.3)',
                          border: '1px solid #c084fc',
                          borderRadius: '8px',
                          padding: '4px 8px',
                          color: '#fef08a',
                          fontSize: '10px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          boxShadow: '0 0 10px rgba(124, 58, 237, 0.3)',
                        }}
                      >
                        {isCapturing ? <Loader2 size={11} className="animate-spin" /> : <Camera size={11} />}
                        <span>{isCapturing ? 'Saving...' : 'Capture'}</span>
                      </button>
                    </div>
                    <span style={{ fontSize: '12px', color: '#c084fc' }}>{books.length} Books</span>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '8px',
                    minHeight: '160px',
                    backgroundColor: 'rgba(10, 5, 18, 0.4)',
                    padding: '12px',
                    borderRadius: '16px',
                  }}>
                    {Array.from({ length: 16 }).map((_, slotIdx) => {
                      const book = books[slotIdx];
                      return (
                        <div
                          key={slotIdx}
                          style={{
                            aspectRatio: '2/3',
                            backgroundColor: book ? '#2e1065' : 'rgba(255, 255, 255, 0.05)',
                            borderRadius: '6px',
                            border: book?.isFavorite ? '2px solid #facc15' : '1px solid rgba(168, 85, 247, 0.3)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow: book?.isFavorite ? '0 0 10px rgba(250, 204, 21, 0.6)' : 'none',
                          }}
                        >
                          {book ? (
                            <>
                              {book.coverUrl ? (
                                <img
                                  src={book.coverUrl}
                                  alt={book.title}
                                  crossOrigin="anonymous"
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                              ) : (
                                <span style={{ fontSize: '8px', color: '#fef08a', padding: '2px', textAlign: 'center' }}>
                                  {book.title.slice(0, 12)}
                                </span>
                              )}
                              {book.isFavorite && (
                                <div style={{
                                  position: 'absolute',
                                  top: '2px',
                                  right: '2px',
                                  backgroundColor: 'rgba(0,0,0,0.8)',
                                  borderRadius: '50%',
                                  padding: '2px',
                                }}>
                                  <Trophy size={10} color="#facc15" />
                                </div>
                              )}
                            </>
                          ) : (
                            <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.15)' }}>•</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. KURBAĞA MASKOTU */}
                <div
                  className="frog-container"
                  style={{
                    width: '280px',
                    display: 'flex',
                    justifyContent: isEven ? 'flex-start' : 'flex-end',
                    alignItems: 'center',
                    position: 'relative',
                    cursor: 'pointer',
                  }}
                >
                  <img
                    src={monthItem.frog}
                    alt={`${month} Frog Familiar by @lightdraconis`}
                    crossOrigin="anonymous"
                    style={{
                      width: '260px',
                      height: 'auto',
                      maxHeight: '260px',
                      objectFit: 'contain',
                      filter: 'drop-shadow(0 14px 28px rgba(0,0,0,0.9))',
                      animation: isCapturing ? 'none' : 'frogHover 4s infinite ease-in-out',
                      userSelect: 'none',
                    }}
                  />

                  <div
                    className="frog-tooltip hide-on-capture"
                    style={{
                      position: 'absolute',
                      bottom: '12px',
                      left: '50%',
                      transform: 'translateX(-50%) translateY(0px)',
                      backgroundColor: 'rgba(20, 10, 38, 0.95)',
                      border: '1px solid #c084fc',
                      borderRadius: '10px',
                      padding: '6px 12px',
                      color: '#fef08a',
                      fontSize: '11px',
                      whiteSpace: 'nowrap',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.8), 0 0 12px rgba(192, 132, 252, 0.4)',
                      pointerEvents: 'none',
                      opacity: 0,
                      transition: 'opacity 0.25s ease, transform 0.25s ease',
                      zIndex: 20,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      backdropFilter: 'blur(6px)',
                    }}
                  >
                    <span>Art by</span>
                    <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>@lightdraconis</span>
                    <span>✨</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= GİZLİ SABİT BOYUTLU STORY TEMPLATE ================= */}
      {capturingMonth && capturingMonthItem && (
        <div
          id={`story-template-${capturingMonth}`}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: -1,
            opacity: 0.01,
            pointerEvents: 'none',
            width: `${STORY_WIDTH}px`,
            height: `${STORY_HEIGHT}px`,
            overflow: 'hidden',
            backgroundColor: '#0a0512',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            padding: '60px 60px',
            fontFamily: '"Cinzel", serif',
            color: '#f8fafc',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ position: 'absolute', top: '8%', right: '12%', width: '18px', height: '18px', backgroundColor: '#fef08a', borderRadius: '50%', boxShadow: '0 0 30px 12px rgba(250, 204, 21, 0.6)' }} />
          <div style={{ position: 'absolute', bottom: '12%', left: '10%', width: '16px', height: '16px', backgroundColor: '#c084fc', borderRadius: '50%', boxShadow: '0 0 26px 10px rgba(192, 132, 252, 0.6)' }} />

          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <p style={{ fontSize: '22px', color: '#c084fc', letterSpacing: '4px', margin: 0 }}>
              ANNUAL READING VAULT
            </p>
            <h1 style={{ fontSize: '72px', color: '#fef08a', letterSpacing: '4px', textShadow: '0 0 24px rgba(250, 204, 21, 0.5)', margin: '10px 0 0 0' }}>
              {capturingMonth}
            </h1>
          </div>

          <img
            src={capturingMonthItem.frog}
            alt={`${capturingMonth} Frog Familiar`}
            crossOrigin="anonymous"
            style={{
              width: '420px',
              height: 'auto',
              maxHeight: '420px',
              objectFit: 'contain',
              filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.9))',
              margin: '40px 0',
            }}
          />

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '20px',
            width: '100%',
            backgroundColor: 'rgba(26, 14, 48, 0.85)',
            border: '3px solid #7c3aed',
            borderRadius: '32px',
            padding: '40px',
          }}>
            {Array.from({ length: 16 }).map((_, slotIdx) => {
              const book = capturingBooks[slotIdx];
              return (
                <div
                  key={slotIdx}
                  style={{
                    aspectRatio: '2/3',
                    backgroundColor: book ? '#2e1065' : 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '10px',
                    border: book?.isFavorite ? '3px solid #facc15' : '1px solid rgba(168, 85, 247, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: book?.isFavorite ? '0 0 16px rgba(250, 204, 21, 0.6)' : 'none',
                  }}
                >
                  {book ? (
                    <>
                      {book.coverUrl ? (
                        <img
                          src={book.coverUrl}
                          alt={book.title}
                          crossOrigin="anonymous"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <span style={{ fontSize: '14px', color: '#fef08a', padding: '4px', textAlign: 'center' }}>
                          {book.title.slice(0, 16)}
                        </span>
                      )}
                      {book.isFavorite && (
                        <div style={{ position: 'absolute', top: '4px', right: '4px', backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: '50%', padding: '4px' }}>
                          <Trophy size={18} color="#facc15" />
                        </div>
                      )}
                    </>
                  ) : (
                    <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.15)' }}>•</span>
                  )}
                </div>
              );
            })}
          </div>

          <p style={{ fontSize: '32px', color: '#c084fc', marginTop: '50px', letterSpacing: '1px' }}>
            {capturingBooks.length} Books Read
          </p>
        </div>
      )}

      {/* ================= OPEN LIBRARY DESTEKLİ KİTAP EKLEME MODALI ================= */}
      {editingMonth && (
        <div 
          onClick={() => setEditingMonth(null)}
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
              maxWidth: '560px',
              padding: '28px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.9)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, color: '#fef08a', fontSize: '24px' }}>{editingMonth} Reading Shelf</h2>
              <button onClick={() => setEditingMonth(null)} style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer' }}>
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSearchBooks} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <input
                type="text"
                placeholder="Search title or author in Open Library..."
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
                Search
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
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {selectedBook.coverUrl && (
                    <img src={selectedBook.coverUrl} alt={selectedBook.title} style={{ width: '32px', height: '46px', objectFit: 'cover', borderRadius: '4px' }} />
                  )}
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#fef08a' }}>{selectedBook.title}</div>
                    <div style={{ fontSize: '10px', color: '#cbd5e1' }}>{selectedBook.author}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <select
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    style={{
                      backgroundColor: '#0a0512',
                      border: '1px solid #7c3aed',
                      borderRadius: '8px',
                      padding: '6px',
                      color: '#facc15',
                      fontSize: '11px',
                    }}
                  >
                    <option value={5}>5 ⭐</option>
                    <option value={4}>4 ⭐</option>
                    <option value={3}>3 ⭐</option>
                    <option value={2}>2 ⭐</option>
                    <option value={1}>1 ⭐</option>
                  </select>

                  <button
                    onClick={handleAddBookToMonth}
                    style={{
                      backgroundColor: '#facc15',
                      color: '#451a03',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 14px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Plus size={14} /> Place Cover
                  </button>
                </div>
              </div>
            )}

            <h4 style={{ color: '#fef08a', fontSize: '14px', marginBottom: '10px' }}>Current Shelf:</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
              {(monthsData[editingMonth] || []).length === 0 ? (
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>No book covers placed for this month yet.</span>
              ) : (
                (monthsData[editingMonth] || []).map((book) => (
                  <div
                    key={book.id}
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: book.isFavorite ? '1px solid #facc15' : '1px solid rgba(124, 58, 237, 0.3)',
                      borderRadius: '10px',
                      padding: '8px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {book.coverUrl && (
                        <img src={book.coverUrl} alt={book.title} style={{ width: '24px', height: '34px', objectFit: 'cover', borderRadius: '3px' }} />
                      )}
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#fff' }}>{book.title}</div>
                        <div style={{ fontSize: '10px', color: '#cbd5e1' }}>{book.author} • {book.rating}⭐</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggleFavorite(editingMonth, book.id)}
                      style={{
                        backgroundColor: book.isFavorite ? '#facc15' : 'transparent',
                        border: '1px solid #facc15',
                        color: book.isFavorite ? '#451a03' : '#fef08a',
                        borderRadius: '8px',
                        padding: '4px 10px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Trophy size={12} /> {book.isFavorite ? 'Champion' : 'Nominate'}
                    </button>
                  </div>
                ))
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}