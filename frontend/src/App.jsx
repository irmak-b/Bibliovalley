import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import Map from './components/Map';
import YazihaneModal from './components/YazihaneModal';
import ShopModal from './components/ShopModal';
import ParchmentView from './components/ParchmentView';
import ReadingTracker from './components/ReadingTracker';
import Playoffs from './components/Playoffs';
import TbrList from './components/TbrList';
import AuthModal from './components/AuthModal';
import ProfileModal from './components/ProfileModal';

function App() {
  const [currentView, setCurrentView] = useState('landing');
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const [isYazihaneOpen, setIsYazihaneOpen] = useState(false);
  const [selectedShop, setSelectedShop] = useState(null);
  const [selectedParchment, setSelectedParchment] = useState(null);
  const [transcribingBook, setTranscribingBook] = useState(null);

  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Check the session
  useEffect(() => {
    const savedUser = localStorage.getItem('bibliovalley_user');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Korumalı işlem kontrolü
  const requireAuth = (callback) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
    } else {
      callback();
    }
  };

  const handleLogout = () => {
  
    if (currentUser?.id) {
      localStorage.removeItem(`bibliovalley_reading_logs_${currentUser.id}`);
    }
    localStorage.removeItem('bibliovalley_user');

    setCurrentUser(null);
    setSelectedShop(null);
    setSelectedParchment(null);
    setTranscribingBook(null);
    setCurrentView('landing');
    alert('You have departed from the Valley gates. Safe journeys! 🌌');
  };

  return (
    <div style={{ width: '100vw', minHeight: '100vh', margin: 0, padding: 0, position: 'relative', backgroundColor: '#0a0512' }}>
      
      {/* Navbar */}
      <Navbar
        activeTab={currentView}
        onNavigate={(tab) => {
          if (tab === 'tracker' || tab === 'playoff' || tab === 'tbr') {
            requireAuth(() => setCurrentView(tab));
          } else {
            setCurrentView(tab);
          }
        }}
        currentUser={currentUser}
        onOpenProfile={() => {
          if (!currentUser) {
            setIsAuthModalOpen(true);
          } else {
            setIsProfileOpen(true);
          }
        }}
        onLogout={handleLogout}
      />

      {/* 1. LANDING PAGE */}
      {currentView === 'landing' && (
        <LandingPage
          currentUser={currentUser}
          onEnterValley={() => setCurrentView('valley')}
          onNavigate={(tab) => {
            if (tab === 'tracker' || tab === 'playoff' || tab === 'tbr') {
              requireAuth(() => setCurrentView(tab));
            } else {
              setCurrentView(tab);
            }
          }}
        />
      )}

      {/* 2. MAP (VALLEY) */}
      {currentView === 'valley' && (
        <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
          <button
            onClick={() => setCurrentView('landing')}
            style={{
              position: 'fixed',
              top: '90px',
              left: '30px',
              zIndex: 30,
              backgroundColor: 'rgba(30, 27, 75, 0.85)',
              border: '1px solid #7c3aed',
              color: '#fef08a',
              padding: '8px 18px',
              borderRadius: '999px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '13px',
              backdropFilter: 'blur(6px)'
            }}
          >
            ← Back to Haven
          </button>

          <Map
            onSelectShop={(shop) => setSelectedShop(shop)}
            onOpenYazihane={() => {
              requireAuth(() => {
                setTranscribingBook(null);
                setIsYazihaneOpen(true);
              });
            }}
          />
        </div>
      )}

      {/* 3. PROTECTED VIEWS */}
      {currentView === 'playoff' && (
        <Playoffs currentUser={currentUser} />
      )}

      {currentView === 'tbr' && (
        <TbrList 
          currentUser={currentUser} 
          onTranscribeToScriptorium={(book) => {
            requireAuth(() => {
              setTranscribingBook(book);
              setIsYazihaneOpen(true);
            });
          }} 
        />
      )}

      {currentView === 'tracker' && (
        <ReadingTracker currentUser={currentUser} />
      )}

      {/* RPG AUTH MODAL */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={(user) => setCurrentUser(user)}
      />

      {/* Scriptorium Modal */}
      <YazihaneModal
        isOpen={isYazihaneOpen}
        onClose={() => {
          setIsYazihaneOpen(false);
          setTranscribingBook(null);
        }}
        initialBook={transcribingBook}
        currentUser={currentUser}
      />

      {/* Shop Modal */}
      <ShopModal
        isOpen={!!selectedShop}
        shop={selectedShop}
        onClose={() => setSelectedShop(null)}
        onSelectParchment={(parchment) => setSelectedParchment(parchment)}
        currentUser={currentUser}
      />

      {/* Parchment View */}
      {selectedParchment && (
        <ParchmentView
          parchment={selectedParchment}
          onClose={() => setSelectedParchment(null)}
        />
      )}

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={currentUser}
        onLogout={handleLogout}
      />
    </div>
  );
}

export default App;
