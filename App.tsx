import React, { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  onSnapshot, 
  setDoc, 
  doc, 
  updateDoc, 
  query, 
  orderBy, 
  Timestamp,
  getDocs,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import { 
  signInAnonymously, 
  onAuthStateChanged,
  User as AuthUser
} from 'firebase/auth';
import { db, auth } from './lib/firebase';
import { User, PlateType } from './lib/types';
import { PLATES, PREDEFINED_USERS, MILESTONES } from './constants';
import UserSelection from './components/UserSelection';
import SushiPlate from './components/SushiPlate';
import Leaderboard from './components/Leaderboard';
import CelebrationOverlay from './components/CelebrationOverlay';
import { motion, AnimatePresence } from 'motion/react';
import { LogOut, RefreshCw, AlertCircle, ShoppingBag, Settings } from 'lucide-react';
import { cn } from './lib/utils';

// Helper for confetti/sounds (optional)
const playPopSound = () => {
  // Simple check for audio context or just ignore if not easy
  // try { new Audio('/pop.mp3').play(); } catch(e) {}
};

export default function App() {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMilestone, setActiveMilestone] = useState<typeof MILESTONES[0] | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  // 1. Auth Listener - Auto login anonymously
  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      setAuthUser(user);
      if (!user) {
        try {
          await signInAnonymously(auth);
        } catch (e) {
          console.error("Anon auth failed", e);
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    });
  }, []);

  // 2. Real-time Users Listener
  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('totalSpend', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as User[];
      setUsers(usersData);
      setLoading(false);
    });
  }, []);

  // 3. Sync Current User from LocalStorage/Firestore
  useEffect(() => {
    if (authUser && users.length > 0) {
      const savedUserId = localStorage.getItem('sushi_user_id');
      if (savedUserId) {
        const found = users.find(u => u.id === savedUserId);
        if (found) {
          setCurrentUser(found);
        }
      }
    }
  }, [authUser, users]);

  const selectUser = async (name: string) => {
    if (!authUser) return;

    // Check if user already exists in Firestore
    let existing = users.find(u => u.name.toLowerCase() === name.toLowerCase());
    
    if (!existing) {
      const newUserId = authUser.uid; // Use auth UID as document ID if it doesn't exist
      // But wait, if multiple people want to play as Fon? 
      // Prompt says "Add New User", "Predefined users". 
      // I'll just use the name as ID (slugified) or a random ID to allow multiple "Fons" if needed?
      // No, let's keep name unique for the leaderboard's sake.
      const id = name.toLowerCase().replace(/\s+/g, '-');
      const newUser: User = {
        id,
        name,
        totalSpend: 0,
        plateCounts: {},
        milestonesTriggered: [],
      };
      await setDoc(doc(db, 'users', id), {
        ...newUser,
        updatedAt: serverTimestamp()
      });
      existing = newUser;
    }

    localStorage.setItem('sushi_user_id', existing.id);
    setCurrentUser(existing);
  };

  const handlePlateClick = async (plate: PlateType) => {
    if (!currentUser) return;

    const newTotal = currentUser.totalSpend + plate.price;
    const newPlateCounts = { ...currentUser.plateCounts };
    newPlateCounts[plate.price.toString()] = (newPlateCounts[plate.price.toString()] || 0) + 1;

    // Check milestones
    let newMilestone = null;
    const newMilestonesTriggered = [...(currentUser.milestonesTriggered || [])];
    
    for (const m of MILESTONES) {
      if (newTotal >= m.value && !newMilestonesTriggered.includes(m.value)) {
        newMilestonesTriggered.push(m.value);
        newMilestone = m;
      }
    }

    if (newMilestone) {
      setActiveMilestone(newMilestone);
    }

    try {
      await updateDoc(doc(db, 'users', currentUser.id), {
        totalSpend: newTotal,
        plateCounts: newPlateCounts,
        milestonesTriggered: newMilestonesTriggered,
        updatedAt: serverTimestamp()
      });
    } catch (e) {
      console.error("Update failed", e);
    }
  };

  const handlePlateRemove = async (plate: PlateType) => {
    if (!currentUser || (currentUser.plateCounts[plate.price.toString()] || 0) <= 0) return;

    const newTotal = currentUser.totalSpend - plate.price;
    const newPlateCounts = { ...currentUser.plateCounts };
    newPlateCounts[plate.price.toString()] = Math.max(0, newPlateCounts[plate.price.toString()] - 1);

    try {
      await updateDoc(doc(db, 'users', currentUser.id), {
        totalSpend: newTotal,
        plateCounts: newPlateCounts,
        updatedAt: serverTimestamp()
      });
    } catch (e) {
      console.error("Remove failed", e);
    }
  };

  const handleResetAll = async () => {
    if (!window.confirm("Are you sure you want to reset ALL users? This cannot be undone.")) return;
    
    try {
      const q = query(collection(db, 'users'));
      const snapshot = await getDocs(q);
      const batchPromises = snapshot.docs.map(d => 
        updateDoc(doc(db, 'users', d.id), {
          totalSpend: 0,
          plateCounts: {},
          milestonesTriggered: [],
          updatedAt: serverTimestamp()
        })
      );
      await Promise.all(batchPromises);
      setShowSettings(false);
    } catch (e) {
      console.error("Reset failed", e);
    }
  };

  const handleLogout = () => {
    auth.signOut();
    setCurrentUser(null);
    localStorage.removeItem('sushi_user_id');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-sushi-bg">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="text-6xl mb-4"
        >
          🍣
        </motion.div>
        <p className="text-sushi-sub font-black uppercase tracking-widest text-xs">Preparing the Kitchen...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <UserSelection onSelect={selectUser} existingUsers={users} />;
  }

  const progress = Math.min((currentUser.totalSpend / 1000) * 100, 100);

  return (
    <div className="min-h-screen pb-32 pt-10 px-4 max-w-lg mx-auto relative overflow-x-hidden sushi-pattern">
      <CelebrationOverlay 
        milestone={activeMilestone} 
        onComplete={() => setActiveMilestone(null)} 
      />

      <header className="flex items-center justify-between mb-8 px-4 py-6 bg-sushi-card/80 border border-sushi-border rounded-3xl backdrop-blur-sm shadow-sm ring-1 ring-black/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-sushi-red flex items-center justify-center text-white font-black text-xl shadow-sm">
            {currentUser.name[0].toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest text-sushi-sub font-black leading-none mb-1">Dining Now</span>
            <h2 className="text-lg font-black text-sushi-text leading-tight">{currentUser.name}</h2>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-sushi-sub hover:text-sushi-red transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button 
            onClick={() => {
                setCurrentUser(null);
                localStorage.removeItem('sushi_user_id');
            }}
            className="p-2 text-sushi-sub hover:text-sushi-red transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Display */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-sushi-text rounded-[40px] p-8 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.3)] relative overflow-hidden mb-12 text-white border-2 border-white/10"
      >
        <div className="relative z-10">
          <p className="text-xs uppercase tracking-[0.2em] font-bold text-white/60 mb-2">Total Bill</p>
          <div className="flex items-end gap-2 mb-6">
            <h1 className="text-6xl font-black tracking-tighter leading-none tabular-nums">
              {currentUser.totalSpend.toLocaleString()}
            </h1>
            <span className="text-xl font-bold opacity-40 pb-1 italic">฿</span>
          </div>
          
          <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden mb-2">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-yellow-400 rounded-full transition-all duration-1000"
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-white/40 uppercase tracking-widest font-black">
            <span>{Math.floor(progress)}% of 1000฿ Club</span>
            <span>Table 08</span>
          </div>
        </div>
        
        {/* Decorative circle */}
        <div className="absolute top-[-40px] right-[-40px] w-32 h-32 bg-white/5 rounded-full blur-2xl" />
      </motion.div>

      <p className="text-center text-[10px] uppercase tracking-[0.3em] text-sushi-sub font-black mb-8 opacity-60">Tap plate to add // − icon to remove</p>

      {/* Plates Grid */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-12 mb-16 h-full px-4">
        {PLATES.map((plate) => (
          <SushiPlate 
            key={plate.price} 
            plate={plate} 
            count={currentUser.plateCounts[plate.price.toString()] || 0}
            onClick={() => handlePlateClick(plate)} 
            onRemove={() => handlePlateRemove(plate)}
          />
        ))}
      </div>

      <Leaderboard users={users} currentUserId={currentUser.id} />

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-sushi-text/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-sushi-card p-8 rounded-[40px] w-full max-w-sm shadow-2xl border-[8px] border-sushi-text"
            >
              <h2 className="text-2xl font-black text-sushi-text mb-4 uppercase italic">Kitchen Reset</h2>
              <p className="text-sushi-sub font-medium mb-8 text-sm">
                This will wipe the leaderboard and reset everyone back to 0 Baht.
              </p>

              <button 
                onClick={handleResetAll}
                className="w-full p-5 bg-sushi-red text-white rounded-2xl font-black shadow-lg shadow-sushi-red/20 active:scale-95 transition-all mb-4 uppercase tracking-widest"
              >
                Reset All Totals
              </button>

              <button 
                onClick={() => setShowSettings(false)}
                className="w-full p-4 bg-sushi-border/40 text-sushi-sub rounded-2xl font-bold active:scale-95 transition-all uppercase text-xs tracking-widest"
              >
                Go Back
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Footer Branding */}
      <footer className="text-center pb-8 opacity-20 pointer-events-none">
        <p className="text-xs font-bold uppercase tracking-[0.3em] font-sans">
          Sushi Spender 2026 // Arigato
        </p>
      </footer>
    </div>
  );
}
