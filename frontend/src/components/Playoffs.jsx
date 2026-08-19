import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trophy, CheckCircle, RotateCcw, Loader2 } from 'lucide-react';

const SEASONS_CONFIG = [
  { id: 'winter', name: 'Winter Quarter', icon: '❄️', months: ['January', 'February', 'March'], color: '#38bdf8' },
  { id: 'spring', name: 'Spring Quarter', icon: '🌸', months: ['April', 'May', 'June'], color: '#4ade80' },
  { id: 'summer', name: 'Summer Quarter', icon: '☀️', months: ['July', 'August', 'September'], color: '#facc15' },
  { id: 'autumn', name: 'Autumn Quarter', icon: '🍂', months: ['October', 'November', 'December'], color: '#fb923c' },
];

export default function Playoffs({ currentUser }) {
  const userPrefix = currentUser ? `user_${currentUser.id || currentUser.username}` : 'guest';
  const playoffsKey = `bibliovalley_playoffs_${userPrefix}`;

  const [isLoading, setIsLoading] = useState(false);

  // 12 Month 
  const [nominees, setNominees] = useState({
    January: null,
    February: null,
    March: null,
    April: null,
    May: null,
    June: null,
    July: null,
    August: null,
    September: null,
    October: null,
    November: null,
    December: null,
  });

  // Tornament 
  const [seasonWinners, setSeasonWinners] = useState(() => {
    try {
      const saved = localStorage.getItem(`${playoffsKey}_seasons`);
      return saved ? JSON.parse(saved) : { winter: null, spring: null, summer: null, autumn: null };
    } catch {
      return { winter: null, spring: null, summer: null, autumn: null };
    }
  });

  const [semiWinners, setSemiWinners] = useState(() => {
    try {
      const saved = localStorage.getItem(`${playoffsKey}_semis`);
      return saved ? JSON.parse(saved) : { semi1: null, semi2: null };
    } catch {
      return { semi1: null, semi2: null };
    }
  });

  const [grandChampion, setGrandChampion] = useState(() => {
    try {
      const saved = localStorage.getItem(`${playoffsKey}_grand`);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

 
  useEffect(() => {
    const fetchNominees = async () => {
      if (!currentUser?.id) {
        // Kullanıcı yoksa veya çıkış yapılmışsa sıfırla
        setNominees({
          January: null, February: null, March: null, April: null,
          May: null, June: null, July: null, August: null,
          September: null, October: null, November: null, December: null,
        });
        return;
      }

      setIsLoading(true);
      try {
        const res = await axios.get(`http://localhost:5000/api/tracker/${currentUser.id}`);
        const books = res.data || [];

        const newNominees = {
          January: null, February: null, March: null, April: null,
          May: null, June: null, July: null, August: null,
          September: null, October: null, November: null, December: null,
        };

        // Database isFavorite
        books.forEach((book) => {
          if (book.isFavorite && newNominees.hasOwnProperty(book.month)) {
            newNominees[book.month] = book;
          }
        });

        setNominees(newNominees);
      } catch (err) {
        console.error('Playoff adayları DBden çekilemedi:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNominees();
  }, [currentUser]);


  useEffect(() => {
    localStorage.setItem(`${playoffsKey}_seasons`, JSON.stringify(seasonWinners));
  }, [seasonWinners, playoffsKey]);

  useEffect(() => {
    localStorage.setItem(`${playoffsKey}_semis`, JSON.stringify(semiWinners));
  }, [semiWinners, playoffsKey]);

  useEffect(() => {
    localStorage.setItem(`${playoffsKey}_grand`, JSON.stringify(grandChampion));
  }, [grandChampion, playoffsKey]);


  const handleSelectSeasonWinner = (seasonId, monthKey) => {
    const book = nominees[monthKey];
    if (!book) return;
    setSeasonWinners((prev) => ({ ...prev, [seasonId]: { ...book, fromMonth: monthKey } }));

    if (seasonId === 'winter' || seasonId === 'spring') setSemiWinners((prev) => ({ ...prev, semi1: null }));
    if (seasonId === 'summer' || seasonId === 'autumn') setSemiWinners((prev) => ({ ...prev, semi2: null }));
    setGrandChampion(null);
  };

  const handleSelectSemiWinner = (semiSlot, book) => {
    if (!book) return;
    setSemiWinners((prev) => ({ ...prev, [semiSlot]: book }));
    setGrandChampion(null);
  };

  // Reset button
  const handleResetTournament = () => {
    setSeasonWinners({ winter: null, spring: null, summer: null, autumn: null });
    setSemiWinners({ semi1: null, semi2: null });
    setGrandChampion(null);
    localStorage.removeItem(`${playoffsKey}_seasons`);
    localStorage.removeItem(`${playoffsKey}_semis`);
    localStorage.removeItem(`${playoffsKey}_grand`);
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a0512',
      color: '#f8fafc',
      padding: '120px 24px 80px 24px',
      fontFamily: '"Cinzel", serif',
      position: 'relative',
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '50px' }}>
        <h1 style={{ fontSize: '38px', color: '#fef08a', letterSpacing: '3px', textShadow: '0 0 20px rgba(250, 204, 21, 0.5)' }}>
          BOOK OF THE YEAR PLAYOFFS
        </h1>
        <p style={{ color: '#cbd5e1', fontSize: '14px', marginTop: '6px' }}>
          Four Seasons • Final Four • One Supreme Legend
        </p>
        <button
          onClick={handleResetTournament}
          style={{
            marginTop: '16px',
            backgroundColor: 'transparent',
            border: '1px solid rgba(168, 85, 247, 0.4)',
            color: '#c084fc',
            padding: '6px 14px',
            borderRadius: '999px',
            fontSize: '12px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <RotateCcw size={13} /> Reset Bracket
        </button>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#fef08a' }}>
          <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 12px auto' }} />
          <span>Summoning your monthly champions...</span>
        </div>
      ) : (
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '60px' }}>
          
          {/* ================= 1. STAGE: 4 SEASONS QUALIFIERS ================= */}
          <div>
            <h2 style={{ fontSize: '20px', color: '#fef08a', marginBottom: '20px', textAlign: 'center', letterSpacing: '1px' }}>
              STAGE 1: SEASONAL TRIALS (Pick 1 per Season)
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
              {SEASONS_CONFIG.map((season) => (
                <div
                  key={season.id}
                  style={{
                    backgroundColor: 'rgba(26, 14, 48, 0.75)',
                    border: `2px solid ${season.color}`,
                    borderRadius: '20px',
                    padding: '20px',
                    backdropFilter: 'blur(8px)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                    <span style={{ fontSize: '18px' }}>{season.icon}</span>
                    <h3 style={{ margin: 0, fontSize: '16px', color: season.color }}>{season.name}</h3>
                  </div>

                  {/* 3 Aylık Kitap Seçimi */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {season.months.map((month) => {
                      const book = nominees[month];
                      const isSelected = seasonWinners[season.id]?.fromMonth === month;

                      return (
                        <div
                          key={month}
                          onClick={() => book && handleSelectSeasonWinner(season.id, month)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '8px 12px',
                            borderRadius: '12px',
                            backgroundColor: isSelected ? 'rgba(250, 204, 21, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                            border: isSelected ? '2px solid #facc15' : '1px solid rgba(255,255,255,0.1)',
                            cursor: book ? 'pointer' : 'default',
                            opacity: book ? 1 : 0.4,
                            transition: 'all 0.2s ease',
                          }}
                        >
                          {book?.coverUrl ? (
                            <img src={book.coverUrl} alt={book.title} style={{ width: '28px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                          ) : (
                            <div style={{ width: '28px', height: '40px', backgroundColor: '#3b0764', borderRadius: '4px' }} />
                          )}
                          <div style={{ flex: 1, overflow: 'hidden' }}>
                            <span style={{ fontSize: '10px', color: '#a855f7', textTransform: 'uppercase' }}>{month}</span>
                            <div style={{ fontSize: '12px', fontWeight: 'bold', color: book ? '#fff' : '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {book?.title || 'No Champion Nominated'}
                            </div>
                          </div>
                          {isSelected && <CheckCircle size={16} color="#facc15" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ================= 2. STAGE: FINAL FOUR (SEMIFINALS) ================= */}
          <div>
            <h2 style={{ fontSize: '20px', color: '#fef08a', marginBottom: '20px', textAlign: 'center', letterSpacing: '1px' }}>
              STAGE 2: FINAL FOUR (Semifinals)
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
              
              {/* Semifinal 1: Winter vs Spring */}
              <div style={{ backgroundColor: 'rgba(30, 15, 55, 0.8)', border: '2px solid #a855f7', borderRadius: '20px', padding: '20px' }}>
                <div style={{ textAlign: 'center', fontSize: '13px', color: '#c084fc', marginBottom: '14px', fontWeight: 'bold' }}>
                  MATCH 1: Winter vs Spring
                </div>
                <div style={{ display: 'flex', gap: '14px' }}>
                  {[seasonWinners.winter, seasonWinners.spring].map((b, idx) => (
                    <div
                      key={idx}
                      onClick={() => b && handleSelectSemiWinner('semi1', b)}
                      style={{
                        flex: 1,
                        backgroundColor: semiWinners.semi1?.title === b?.title && b ? 'rgba(250, 204, 21, 0.2)' : 'rgba(10, 5, 18, 0.6)',
                        border: semiWinners.semi1?.title === b?.title && b ? '2px solid #facc15' : '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        padding: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        cursor: b ? 'pointer' : 'default',
                        opacity: b ? 1 : 0.4,
                      }}
                    >
                      {b?.coverUrl ? (
                        <img src={b.coverUrl} alt={b.title} style={{ width: '48px', height: '70px', objectFit: 'cover', borderRadius: '6px', marginBottom: '8px' }} />
                      ) : (
                        <div style={{ width: '48px', height: '70px', backgroundColor: '#1e1035', borderRadius: '6px', marginBottom: '8px' }} />
                      )}
                      <span style={{ fontSize: '11px', color: '#fef08a', textAlign: 'center', fontWeight: 'bold' }}>{b?.title || 'TBD'}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Semifinal 2: Summer vs Autumn */}
              <div style={{ backgroundColor: 'rgba(30, 15, 55, 0.8)', border: '2px solid #a855f7', borderRadius: '20px', padding: '20px' }}>
                <div style={{ textAlign: 'center', fontSize: '13px', color: '#c084fc', marginBottom: '14px', fontWeight: 'bold' }}>
                  MATCH 2: Summer vs Autumn
                </div>
                <div style={{ display: 'flex', gap: '14px' }}>
                  {[seasonWinners.summer, seasonWinners.autumn].map((b, idx) => (
                    <div
                      key={idx}
                      onClick={() => b && handleSelectSemiWinner('semi2', b)}
                      style={{
                        flex: 1,
                        backgroundColor: semiWinners.semi2?.title === b?.title && b ? 'rgba(250, 204, 21, 0.2)' : 'rgba(10, 5, 18, 0.6)',
                        border: semiWinners.semi2?.title === b?.title && b ? '2px solid #facc15' : '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        padding: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        cursor: b ? 'pointer' : 'default',
                        opacity: b ? 1 : 0.4,
                      }}
                    >
                      {b?.coverUrl ? (
                        <img src={b.coverUrl} alt={b.title} style={{ width: '48px', height: '70px', objectFit: 'cover', borderRadius: '6px', marginBottom: '8px' }} />
                      ) : (
                        <div style={{ width: '48px', height: '70px', backgroundColor: '#1e1035', borderRadius: '6px', marginBottom: '8px' }} />
                      )}
                      <span style={{ fontSize: '11px', color: '#fef08a', textAlign: 'center', fontWeight: 'bold' }}>{b?.title || 'TBD'}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* ================= 3. STAGE: GRAND FINAL & CROWN ================= */}
          <div style={{
            backgroundColor: 'rgba(20, 10, 38, 0.95)',
            border: '2px solid #facc15',
            borderRadius: '28px',
            padding: '40px 24px',
            textAlign: 'center',
            boxShadow: '0 0 50px rgba(250, 204, 21, 0.25)',
          }}>
            <h2 style={{ fontSize: '26px', color: '#fef08a', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <Trophy size={28} color="#facc15" /> GRAND FINAL MATCH
            </h2>

            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '30px', flexWrap: 'wrap', marginBottom: '30px' }}>
              {[semiWinners.semi1, semiWinners.semi2].map((finalist, idx) => (
                <div
                  key={idx}
                  onClick={() => finalist && setGrandChampion(finalist)}
                  style={{
                    width: '160px',
                    backgroundColor: grandChampion?.title === finalist?.title && finalist ? 'rgba(250, 204, 21, 0.25)' : 'rgba(46, 16, 101, 0.6)',
                    border: grandChampion?.title === finalist?.title && finalist ? '3px solid #facc15' : '1px solid rgba(168, 85, 247, 0.5)',
                    borderRadius: '16px',
                    padding: '16px',
                    cursor: finalist ? 'pointer' : 'default',
                    opacity: finalist ? 1 : 0.4,
                    transform: grandChampion?.title === finalist?.title && finalist ? 'scale(1.08)' : 'scale(1)',
                    transition: 'all 0.2s ease',
                    boxShadow: grandChampion?.title === finalist?.title && finalist ? '0 0 25px rgba(250, 204, 21, 0.6)' : 'none',
                  }}
                >
                  {finalist?.coverUrl ? (
                    <img src={finalist.coverUrl} alt={finalist.title} style={{ width: '70px', height: '105px', objectFit: 'cover', borderRadius: '8px', marginBottom: '10px' }} />
                  ) : (
                    <div style={{ width: '70px', height: '105px', backgroundColor: '#170b2c', borderRadius: '8px', margin: '0 auto 10px auto' }} />
                  )}
                  <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#fff' }}>{finalist?.title || 'Finalist TBD'}</div>
                </div>
              ))}
            </div>

            {/* CROWNED BOOK OF THE YEAR */}
            {grandChampion && (
              <div style={{
                marginTop: '20px',
                padding: '20px',
                backgroundColor: 'rgba(250, 204, 21, 0.1)',
                border: '2px dashed #facc15',
                borderRadius: '20px',
                display: 'inline-block',
              }}>
                <div style={{ fontSize: '14px', color: '#fef08a', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '6px' }}>
                  ✨ CROWNED SUPREME BOOK OF THE YEAR ✨
                </div>
                <h3 style={{ fontSize: '28px', color: '#ffffff', margin: 0, textShadow: '0 0 15px #facc15' }}>
                  {grandChampion.title}
                </h3>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
