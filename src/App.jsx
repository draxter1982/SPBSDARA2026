// PENTING: JIKA SKRIN PUTIH, PASTIKAN FAIL "package.json" TELAH DIBUAT.
// Kod ini memerlukan 'firebase' dalam dependencies package.json.

import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, collection, addDoc, query, onSnapshot, deleteDoc, doc, writeBatch, limit, orderBy } from 'firebase/firestore';

// =================================================================================
// KONFIGURASI SISTEM
// =================================================================================
const ADMIN_PIN = "5866"; // <--- TUKAR KOD PIN ADMIN DI SINI

const manualConfig = {
  apiKey: "AIzaSyBLXJjJ4xFrErf7KnOrpri1D8_l86I0-AQ",
  authDomain: "sistembukusdara.firebaseapp.com",
  projectId: "sistembukusdara",
  storageBucket: "sistembukusdara.firebasestorage.app",
  messagingSenderId: "390977162224",
  appId: "1:390977162224:web:d44470d20786a72c282b35",
  measurementId: "G-6KD98KG7R8"
};

// --- 2. IKON (SVG MANUAL) ---
const Camera = (p) => <svg {...p} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>;
const Upload = (p) => <svg {...p} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>;
const FileText = (p) => <svg {...p} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>;
const CheckCircle = (p) => <svg {...p} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
const Search = (p) => <svg {...p} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const User = (p) => <svg {...p} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const X = (p) => <svg {...p} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const ImageIcon = (p) => <svg {...p} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>;
const Menu = (p) => <svg {...p} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
const Smartphone = (p) => <svg {...p} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>;
const AlertTriangle = (p) => <svg {...p} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const Lock = (p) => <svg {...p} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>;
const Wifi = (p) => <svg {...p} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>;
const WifiOff = (p) => <svg {...p} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="1" y1="1" x2="23" y2="23"/><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/><path d="M10.71 5.05A16 16 0 0 1 22.58 9"/><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>;
const RefreshCw = (p) => <svg {...p} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>;
const Trash = (p) => <svg {...p} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
const Download = (p) => <svg {...p} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>;
const DollarSign = (p) => <svg {...p} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>;
const CloudDownload = (p) => <svg {...p} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>;

// Icon Loading (Spinner Animasi)
const LoadingSpinner = (p) => (
  <svg {...p} xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 1 1-6.219-8.56">
      <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite" />
    </path>
  </svg>
);

// --- 3. INITIALIZATION ---
let app, auth, db, appId;
let initError = null;

try {
  let firebaseConfig = manualConfig;
  appId = "sekolah-buku-2026-v1"; // ID Default

  if (typeof __firebase_config !== 'undefined' && __firebase_config) {
     firebaseConfig = JSON.parse(__firebase_config);
     appId = typeof __app_id !== 'undefined' ? __app_id : appId;
  } else {
    if (firebaseConfig.apiKey && firebaseConfig.apiKey.includes("GANTI")) {
        throw new Error("Sila isi 'manualConfig' di baris 10 dengan API Key sebenar dari Firebase Console anda.");
    }
  }

  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);

} catch (e) {
  console.error("Firebase Init Error:", e);
  initError = e.message;
}

// --- Data Struktur Kelas ---
const SENARAI_KELAS = {
  "Tingkatan 1": ["1UM", "1UPM", "1UKM", "1USM", "1UTM", "1UUM"],
  "Tingkatan 2": ["2UM", "2UPM", "2UKM", "2USM", "2UTM", "2UUM"],
  "Tingkatan 3": ["3UM", "3UPM", "3UKM", "3USM", "3UTM", "3UUM"],
  "Tingkatan 4": ["4UM", "4UPM", "4UKM", "4USM", "4UTM", "4UUM"],
  "Tingkatan 5": ["5UM", "5UPM", "5UKM", "5USM", "5UTM", "5UUM", "5UITM"]
};

// --- Komponen Utama ---
export default function SistemRekodBuku() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('borang');
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataError, setDataError] = useState(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false); // Status login admin
  const [pinInput, setPinInput] = useState(''); // Input PIN
  const [pinError, setPinError] = useState(''); // Mesej ralat PIN
  const [isOnline, setIsOnline] = useState(true); // Status Online/Offline
  const [pendingCount, setPendingCount] = useState(0);
  const [isViewAll, setIsViewAll] = useState(false); // New state to control load all

  // Semak status online/offline
  useEffect(() => {
    if (typeof navigator !== 'undefined') {
        setIsOnline(navigator.onLine);
        const handleStatus = () => setIsOnline(navigator.onLine);
        window.addEventListener('online', handleStatus);
        window.addEventListener('offline', handleStatus);
        return () => {
            window.removeEventListener('online', handleStatus);
            window.removeEventListener('offline', handleStatus);
        };
    }
  }, []);

  // Sync Queue Logic (Offline -> Online)
  useEffect(() => {
    const updatePendingCount = () => {
        const queue = JSON.parse(localStorage.getItem('pending_submissions') || '[]');
        setPendingCount(queue.length);
    };
    updatePendingCount();

    if (isOnline) {
        processQueue();
    }
  }, [isOnline]);

  const processQueue = async () => {
    const queue = JSON.parse(localStorage.getItem('pending_submissions') || '[]');
    if (queue.length === 0) return;

    if (!auth?.currentUser) {
        try { await signInAnonymously(auth); } catch(e) {}
    }

    const newQueue = [];
    for (const item of queue) {
      try {
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'rekod_buku_2026'), {
          ...item,
          tarikh: new Date(),
          status: 'Disegerakkan',
          isOfflineSubmission: true
        });
      } catch (err) {
        console.error("Gagal sync item:", err);
        newQueue.push(item);
      }
    }

    localStorage.setItem('pending_submissions', JSON.stringify(newQueue));
    setPendingCount(newQueue.length);
  };

  // Fungsi Log Masuk Admin
  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (pinInput === ADMIN_PIN) {
        setIsAdminAuthenticated(true);
        setPinError('');
    } else {
        setPinError('Kod PIN salah. Sila cuba lagi.');
        setPinInput('');
    }
  };

  if (initError) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center bg-red-50 p-6 text-center"
        style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fef2f2', padding: '20px', fontFamily: 'sans-serif' }}
      >
        <div 
            className="max-w-md bg-white p-6 rounded-xl shadow-lg border border-red-100"
            style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', border: '1px solid #fee2e2', maxWidth: '400px' }}
        >
          <div className="bg-red-100 text-red-600 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#fee2e2', color: '#dc2626', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-red-800 mb-2" style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#991b1b', marginBottom: '8px' }}>Konfigurasi Diperlukan</h1>
          <p className="text-slate-600 mb-4 text-sm" style={{ color: '#475569', marginBottom: '16px' }}>{initError}</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
           await signInWithCustomToken(auth, __initial_auth_token);
        } else {
           await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Auth Error:", err);
        setDataError("Mod Offline: Akses terhad.");
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => {
        setUser(u);
    });
    return () => unsubscribe();
  }, []);

  // OPTIMIZED DATA FETCHING: Only fetch if Admin is authenticated
  useEffect(() => {
    // Stop if user is not logged in OR not an admin
    if (!user || !isAdminAuthenticated) {
        setLoading(false); // Stop loading spinner for parents
        return;
    }

    if (!isOnline) {
        setLoading(false);
        return;
    }

    setLoading(true); // Start loading when admin logs in

    try {
      const collectionRef = collection(db, 'artifacts', appId, 'public', 'data', 'rekod_buku_2026');
      let q;
      
      if (isViewAll) {
         q = query(collectionRef); // Load everything if requested
      } else {
         q = query(collectionRef, orderBy('tarikh', 'desc'), limit(50)); // Load recent 50 by default
      }

      const unsubscribe = onSnapshot(q, (snapshot) => {
        try {
          const data = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          // Sort client-side too to be safe
          data.sort((a, b) => (b.tarikh?.seconds || 0) - (a.tarikh?.seconds || 0));
          setSubmissions(data);
          localStorage.setItem('cached_dashboard_data', JSON.stringify(data)); // Save cache
          setLoading(false);
          setDataError(null);
        } catch (processErr) {
          console.error("Error processing data:", processErr);
        }
      }, (error) => {
        console.error("Firestore Error:", error);
        setLoading(false);
        if (error.code !== 'permission-denied') {
             // Silently handle index error for now or fallback
             if (error.message.includes("requires an index")) {
                 setDataError("Sila bina indeks di Firebase Console untuk 'tarikh' (descending).");
             } else {
                 setDataError("Gagal menyambung ke pangkalan data.");
             }
        }
      });
      return () => unsubscribe();
    } catch (err) {
      console.error("Query Error:", err);
      setLoading(false);
    }
  }, [user, isOnline, isAdminAuthenticated, isViewAll]); // Re-run if isViewAll changes

  const mainContainerStyle = {
    minHeight: '100vh',
    width: '100vw',
    maxWidth: '100%',
    backgroundColor: '#f8fafc',
    color: '#1e293b',
    fontFamily: 'sans-serif',
    paddingBottom: '80px',
    overflowX: 'hidden',
    boxSizing: 'border-box',
    margin: 0,
    padding: 0
  };

  return (
    <>
      <style>
        {`
          body { margin: 0; padding: 0; box-sizing: border-box; }
          * { box-sizing: border-box; }
        `}
      </style>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-24 md:pb-0" style={mainContainerStyle}>
        <header 
          className={`${isOnline ? 'bg-blue-900' : 'bg-slate-800'} text-white p-4 shadow-lg sticky top-0 z-50 transition-colors duration-500`}
          style={{ backgroundColor: isOnline ? '#1e3a8a' : '#1e293b', color: 'white', padding: '16px', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', width: '100%', boxSizing: 'border-box' }}
        >
          <div className="max-w-4xl mx-auto" style={{ maxWidth: '896px', margin: '0 auto', width: '100%' }}>
            <div className="flex justify-between items-center mb-1 md:mb-0" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="flex items-center space-x-3" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="bg-white/10 p-2 rounded-lg relative" style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '8px', borderRadius: '8px', position: 'relative' }}>
                  {/* LOGO SEKOLAH DI SINI */}
                  {/* GANTI URL DI BAWAH DENGAN URL LOGO SEKOLAH ANDA */}
                  <img 
                    src="https://pbs.twimg.com/profile_images/1314868100/LOGO_copy_400x400.png" 
                    alt="Logo Sekolah" 
                    className="w-8 h-8 object-contain" 
                    style={{ width: '32px', height: '32px', objectFit: 'contain' }}
                    onError={(e) => {e.target.onerror = null; e.target.src = "https://via.placeholder.com/32?text=Logo"}}
                  />
                  {!isOnline && (
                      <div className="absolute -top-1 -right-1 bg-red-500 rounded-full p-0.5 border-2 border-slate-800" style={{ position: 'absolute', top: '-4px', right: '-4px', backgroundColor: '#ef4444', borderRadius: '50%', padding: '2px', border: '2px solid #1e293b' }}>
                          <WifiOff className="w-3 h-3 text-white" />
                      </div>
                  )}
                </div>
                <div>
                  <h1 className="text-lg font-bold leading-tight flex items-center gap-2" style={{ fontSize: '1.125rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      Sistem Rekod Pembayaran Buku 2026
                      {!isOnline && <span className="text-[10px] bg-red-500 px-2 py-0.5 rounded-full uppercase tracking-wider" style={{ fontSize: '10px', backgroundColor: '#ef4444', padding: '2px 8px', borderRadius: '9999px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Offline</span>}
                  </h1>
                  <p className="text-xs text-blue-200 hidden md:block" style={{ fontSize: '0.75rem', color: '#bfdbfe' }}>Koperasi SMK Dato' Abdul Rahman Andak Berhad</p>
                </div>
              </div>
              <nav className="hidden md:flex space-x-1 bg-white/10 p-1 rounded-lg" style={{ display: 'none' }}>
                <button onClick={() => setActiveTab('borang')}>Borang</button>
              </nav>
            </div>
            
            {/* Status Bar for Offline/Sync */}
            {!isOnline && (
              <div className="mt-2 text-xs bg-red-500/20 text-red-100 p-1.5 rounded flex items-center gap-2" style={{ marginTop: '8px', fontSize: '12px', backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#fee2e2', padding: '6px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <WifiOff className="w-3 h-3" />
                  <span>Tiada internet. Data disimpan dalam peranti.</span>
              </div>
            )}
            {isOnline && pendingCount > 0 && (
              <div className="mt-2 text-xs bg-green-500/20 text-green-100 p-1.5 rounded flex items-center gap-2" style={{ marginTop: '8px', fontSize: '12px', backgroundColor: 'rgba(34, 197, 94, 0.2)', color: '#dcfce7', padding: '6px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <RefreshCw className="w-3 h-3" />
                  <span>Menyegerakkan {pendingCount} rekod...</span>
              </div>
            )}
          </div>
        </header>

        <div 
          className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg z-50 flex justify-around p-2 pb-safe"
          style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: 'white', borderTop: '1px solid #e2e8f0', boxShadow: '0 -4px 6px -1px rgba(0,0,0,0.1)', zIndex: 50, display: 'flex', justifyContent: 'space-around', padding: '8px', width: '100%', boxSizing: 'border-box' }}
        >
          <button 
            onClick={() => setActiveTab('borang')}
            className={`flex flex-col items-center p-2 rounded-lg w-full transition-colors ${activeTab === 'borang' ? 'text-blue-600 bg-blue-50' : 'text-slate-400'}`}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px', width: '100%', border: 'none', background: activeTab === 'borang' ? '#eff6ff' : 'transparent', color: activeTab === 'borang' ? '#2563eb' : '#94a3b8' }}
          >
            <Smartphone className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium" style={{ fontSize: '12px', fontWeight: 500 }}>Borang</span>
          </button>
          <button 
            onClick={() => setActiveTab('admin')}
            className={`flex flex-col items-center p-2 rounded-lg w-full transition-colors ${activeTab === 'admin' ? 'text-blue-600 bg-blue-50' : 'text-slate-400'}`}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px', width: '100%', border: 'none', background: activeTab === 'admin' ? '#eff6ff' : 'transparent', color: activeTab === 'admin' ? '#2563eb' : '#94a3b8' }}
          >
            <Menu className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium" style={{ fontSize: '12px', fontWeight: 500 }}>Rekod</span>
          </button>
        </div>

        <main className="max-w-4xl mx-auto p-4 md:p-6" style={{ maxWidth: '896px', margin: '0 auto', padding: '16px', width: '100%', boxSizing: 'border-box' }}>
          {dataError && (
            <div className="mb-4 bg-orange-50 border border-orange-200 text-orange-700 px-4 py-3 rounded-lg flex items-center gap-3" style={{ marginBottom: '16px', backgroundColor: '#fff7ed', border: '1px solid #fed7aa', color: '#c2410c', padding: '12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">{dataError}</p>
            </div>
          )}

          {loading && activeTab === 'borang' && !user ? (
             /* Only show loading on borang if user auth is not ready */
            <div className="flex flex-col items-center justify-center py-12 text-slate-400" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 0', color: '#94a3b8' }}>
              <LoadingSpinner className="text-blue-900 mb-4" style={{ color: '#1e3a8a', width: '48px', height: '48px', marginBottom: '16px' }} />
              <p className="text-sm font-medium">Memuatkan Sistem...</p>
            </div>
          ) : (
            <>
              {/* Logic Tab Borang */}
              <div style={{ display: activeTab === 'borang' ? 'block' : 'none' }}>
                <BorangSubmission user={user} appId={appId} isOnline={isOnline} setPendingCount={setPendingCount} />
              </div>

              {/* Logic Tab Admin dengan Keselamatan PIN */}
              <div style={{ display: activeTab === 'admin' ? 'block' : 'none' }}>
                {!isAdminAuthenticated ? (
                  // Paparan Login Admin
                  <div className="flex flex-col items-center justify-center p-8 bg-white rounded-xl shadow-sm border border-slate-200 mt-4" style={{ backgroundColor: 'white', borderRadius: '12px', padding: '32px', border: '1px solid #e2e8f0', maxWidth: '400px', margin: '32px auto', textAlign: 'center' }}>
                      <div className="bg-slate-100 p-4 rounded-full mb-4" style={{ backgroundColor: '#f1f5f9', padding: '16px', borderRadius: '50%', width: '64px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                          <Lock className="w-8 h-8 text-slate-600" />
                      </div>
                      <h2 className="text-xl font-bold mb-2 text-slate-800" style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}>Akses Guru Sahaja</h2>
                      <p className="text-slate-500 mb-6 text-sm" style={{ color: '#64748b', marginBottom: '24px', fontSize: '14px' }}>Sila masukkan kod PIN untuk melihat rekod.</p>
                      
                      <form onSubmit={handleAdminLogin} style={{ width: '100%' }}>
                          <input
                              type="password"
                              placeholder="Kod PIN"
                              value={pinInput}
                              onChange={(e) => setPinInput(e.target.value)}
                              className="w-full p-3 border border-slate-300 rounded-lg text-center text-lg tracking-widest mb-4 focus:ring-2 focus:ring-blue-500"
                              style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', textAlign: 'center', fontSize: '18px', letterSpacing: '0.1em', marginBottom: '16px', backgroundColor: '#ffffff', color: '#000000' }}
                              autoFocus
                          />
                          {pinError && <p className="text-red-500 mb-4 text-sm font-medium" style={{ color: '#ef4444', marginBottom: '16px', fontSize: '14px' }}>{pinError}</p>}
                          <button 
                              type="submit"
                              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                              style={{ backgroundColor: '#2563eb', color: 'white', width: '100%', padding: '12px', borderRadius: '8px', fontWeight: 600, border: 'none', cursor: 'pointer' }}
                          >
                              Masuk
                          </button>
                      </form>
                  </div>
                ) : (
                  // Paparan Dashboard Admin (Jika PIN Betul)
                  <>
                    {loading ? (
                         <div className="flex flex-col items-center justify-center py-12 text-slate-400" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 0', color: '#94a3b8' }}>
                            <LoadingSpinner className="text-blue-900 mb-4" style={{ color: '#1e3a8a', width: '48px', height: '48px', marginBottom: '16px' }} />
                            <p className="text-sm font-medium">Memuatkan Rekod...</p>
                         </div>
                    ) : (
                         <AdminDashboard data={submissions} isOnline={isOnline} appId={appId} isViewAll={isViewAll} setIsViewAll={setIsViewAll} />
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </>
  );
}

// --- Komponen: Borang ---
function BorangSubmission({ user, appId, isOnline, setPendingCount }) {
  const [formData, setFormData] = useState({
    namaMurid: '',
    tingkatan: '',
    kelas: '',
    namaPenjaga: '',
    noTelefon: '',
    jumlahBayaran: '',
  });
  const [imgResit, setImgResit] = useState(null);
  const [imgSenarai, setImgSenarai] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [offlineSaved, setOfflineSaved] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);

  const processImage = (file, callback) => {
    if (!file) return;
    setLoadingImage(true); // Start loading UI
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        let width = img.width;
        let height = img.height;
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        callback(canvas.toDataURL('image/jpeg', 0.6));
        setLoadingImage(false); // Stop loading UI
      };
    };
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      processImage(file, (base64) => {
        if (type === 'resit') setImgResit(base64);
        if (type === 'senarai') setImgSenarai(base64);
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.namaMurid.trim() || !formData.tingkatan || !formData.kelas || !imgResit || !formData.jumlahBayaran) {
      return alert("Sila lengkapkan maklumat wajib.");
    }

    // Jika online dan tiada user, tunggu sebentar (tapi biasanya dah ada dari init)
    if (isOnline && !user) return alert("Sistem sedang memuatkan pengesahan pengguna...");

    setIsSubmitting(true);
    const recordData = {
        ...formData,
        namaMurid: formData.namaMurid.toUpperCase(),
        resitImage: imgResit,
        senaraiImage: imgSenarai || null,
        tarikh: new Date(),
        status: 'Dalam Semakan',
        submittedBy: user?.uid || 'anonymous_offline'
    };

    if (!isOnline) {
        try {
            const currentQueue = JSON.parse(localStorage.getItem('pending_submissions') || '[]');
            if (currentQueue.length >= 10) {
                alert("Storan offline penuh. Sila cari internet untuk menghantar rekod sedia ada dahulu.");
                setIsSubmitting(false);
                return;
            }
            currentQueue.push(recordData);
            localStorage.setItem('pending_submissions', JSON.stringify(currentQueue));
            
            setPendingCount(currentQueue.length);
            setOfflineSaved(true);
            setSuccess(true);
            resetForm();
        } catch (err) {
            console.error(err);
            alert("Ralat Storan: Gambar mungkin terlalu besar untuk disimpan offline.");
        }
        setIsSubmitting(false);
        return;
    }

    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'rekod_buku_2026'), recordData);
      setSuccess(true);
      setOfflineSaved(false);
      resetForm();
      window.scrollTo(0, 0);
    } catch (err) {
      alert("Gagal menghantar. Sila periksa sambungan internet anda.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({ namaMurid: '', tingkatan: '', kelas: '', namaPenjaga: '', noTelefon: '', jumlahBayaran: '' });
    setImgResit(null);
    setImgSenarai(null);
  };

  // Inline styles for form elements - Added color property to fix invisible text
  // UPDATE: Added backgroundColor: '#ffffff' to force white background on inputs
  const inputStyle = { width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '16px', color: '#1e293b', backgroundColor: '#ffffff' };
  const labelStyle = { display: 'block', fontSize: '14px', fontWeight: 500, color: '#334155', marginBottom: '4px' };

  if (success) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 text-center max-w-lg mx-auto mt-4 md:mt-10" style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', padding: '32px', textAlign: 'center', margin: '16px auto', maxWidth: '512px' }}>
        <div className={`w-16 h-16 ${offlineSaved ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'} rounded-full flex items-center justify-center mx-auto mb-4`} style={{ width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', backgroundColor: offlineSaved ? '#ffedd5' : '#dcfce7', color: offlineSaved ? '#ea580c' : '#16a34a' }}>
          {offlineSaved ? <WifiOff className="w-8 h-8" /> : <CheckCircle className="w-8 h-8" />}
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}>
            {offlineSaved ? 'Disimpan (Offline)' : 'Terima Kasih!'}
        </h2>
        <p className="text-slate-600 mb-6" style={{ color: '#475569', marginBottom: '24px' }}>
            {offlineSaved 
                ? "Tiada internet. Data disimpan dalam peranti dan akan dihantar bila internet ada."
                : "Maklumat anda sudah dihantar."}
        </p>
        <button 
          onClick={() => setSuccess(false)}
          className="bg-blue-600 text-white w-full md:w-auto px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
          style={{ backgroundColor: '#2563eb', color: 'white', width: '100%', padding: '12px 32px', borderRadius: '8px', fontWeight: 500, border: 'none', cursor: 'pointer' }}
        >
          Hantar Borang Lain
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6" style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', overflow: 'hidden', marginBottom: '24px' }}>
      <div className={`p-4 border-b flex items-center gap-2 ${isOnline ? 'bg-blue-50 border-blue-100' : 'bg-slate-100 border-slate-200'}`} style={{ padding: '16px', borderBottom: '1px solid', backgroundColor: isOnline ? '#eff6ff' : '#f1f5f9', borderColor: isOnline ? '#dbeafe' : '#e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <User className={`w-5 h-5 ${isOnline ? 'text-blue-600' : 'text-slate-500'}`} />
        <h2 className={`font-semibold ${isOnline ? 'text-blue-800' : 'text-slate-700'}`} style={{ fontWeight: 600, color: isOnline ? '#1e40af' : '#334155' }}>
            Butiran Pelajar {isOnline ? '' : '(Mod Offline)'}
        </h2>
      </div>
      
      <form onSubmit={handleSubmit} className="p-4 md:p-6 grid gap-5" style={{ padding: '16px', display: 'grid', gap: '20px' }}>
        <div className="grid md:grid-cols-2 gap-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Tingkatan</label>
            <select
              value={formData.tingkatan}
              onChange={(e) => setFormData({...formData, tingkatan: e.target.value, kelas: ''})}
              style={{...inputStyle, backgroundColor: 'white'}}
              required
            >
              <option value="">Pilih Tingkatan</option>
              {Object.keys(SENARAI_KELAS).map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Kelas</label>
            <select
              value={formData.kelas}
              onChange={(e) => setFormData({...formData, kelas: e.target.value})}
              disabled={!formData.tingkatan}
              style={{...inputStyle, backgroundColor: !formData.tingkatan ? '#f1f5f9' : 'white'}}
              required
            >
              <option value="">Pilih Kelas</option>
              {formData.tingkatan && SENARAI_KELAS[formData.tingkatan].map(k => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label style={labelStyle}>Nama Penuh Murid</label>
          <input
            type="text"
            placeholder="NAMA PENUH (HURUF BESAR)"
            value={formData.namaMurid}
            onChange={(e) => setFormData({...formData, namaMurid: e.target.value.toUpperCase()})}
            style={inputStyle}
            required
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Nama Penjaga</label>
            <input
              type="text"
              value={formData.namaPenjaga}
              onChange={(e) => setFormData({...formData, namaPenjaga: e.target.value})}
              style={inputStyle}
              required
            />
          </div>
          <div>
            <label style={labelStyle}>No. Telefon</label>
            <input
              type="tel"
              value={formData.noTelefon}
              onChange={(e) => setFormData({...formData, noTelefon: e.target.value})}
              style={inputStyle}
              placeholder="0123456789"
              required
            />
          </div>
        </div>

        <div className="border-t border-slate-200 my-1" style={{ borderTop: '1px solid #e2e8f0', margin: '4px 0' }}></div>

        {loadingImage && (
            <div className="text-center text-sm text-blue-600 font-medium animate-pulse" style={{ color: '#2563eb' }}>
                Sedang memproses gambar...
            </div>
        )}

        <div className="grid md:grid-cols-2 gap-4 md:gap-6" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
          <div style={{ border: `2px dashed ${imgResit ? '#93c5fd' : '#cbd5e1'}`, borderRadius: '12px', padding: '16px', backgroundColor: imgResit ? '#eff6ff' : '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <h3 className="font-semibold text-slate-700 mb-2 flex items-center gap-2 text-sm" style={{ fontWeight: 600, color: '#334155', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
              <Camera className="w-4 h-4" /> Bukti Resit Pembayaran <span className="text-red-500" style={{ color: '#ef4444' }}>*</span>
            </h3>
            {imgResit ? (
              <div className="relative w-full h-48 group" style={{ position: 'relative', width: '100%', height: '192px' }}>
                <img src={imgResit} alt="Resit" className="w-full h-full object-contain rounded-lg shadow-sm bg-white" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '8px', backgroundColor: 'white' }} />
                <button 
                  type="button"
                  onClick={() => setImgResit(null)}
                  style={{ position: 'absolute', top: '8px', right: '8px', backgroundColor: '#ef4444', color: 'white', padding: '8px', borderRadius: '9999px', border: 'none', cursor: 'pointer' }}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <label style={{ cursor: 'pointer', width: '100%', height: '128px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                <Upload className="w-8 h-8 mb-2 text-slate-400" />
                <span className="text-sm font-medium text-blue-600" style={{ fontSize: '14px', fontWeight: 500, color: '#2563eb' }}>Ambil Gambar</span>
                {/* Changed: Removed capture="environment" to allow Gallery/Camera selection */}
                <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'resit')} className="hidden" style={{ display: 'none' }} required />
              </label>
            )}
          </div>

          <div style={{ border: `2px dashed ${imgSenarai ? '#93c5fd' : '#cbd5e1'}`, borderRadius: '12px', padding: '16px', backgroundColor: imgSenarai ? '#eff6ff' : '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <h3 className="font-semibold text-slate-700 mb-2 flex items-center gap-2 text-sm" style={{ fontWeight: 600, color: '#334155', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
              <FileText className="w-4 h-4" /> Senarai Pembelian Buku
            </h3>
            {imgSenarai ? (
              <div style={{ position: 'relative', width: '100%', height: '192px' }}>
                <img src={imgSenarai} alt="Senarai" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '8px', backgroundColor: 'white' }} />
                <button type="button" onClick={() => setImgSenarai(null)} style={{ position: 'absolute', top: '8px', right: '8px', backgroundColor: '#ef4444', color: 'white', padding: '8px', borderRadius: '9999px', border: 'none', cursor: 'pointer' }}><X className="w-5 h-5" /></button>
              </div>
            ) : (
              <label style={{ cursor: 'pointer', width: '100%', height: '128px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                <Upload className="w-8 h-8 mb-2 text-slate-400" />
                <span className="text-sm font-medium text-blue-600" style={{ fontSize: '14px', fontWeight: 500, color: '#2563eb' }}>Ambil Gambar</span>
                {/* Changed: Removed capture="environment" to allow Gallery/Camera selection */}
                <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'senarai')} style={{ display: 'none' }} />
              </label>
            )}
          </div>
        </div>

        <div>
          <label style={labelStyle}>Jumlah Pembayaran (RM)</label>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontWeight: 'bold', fontSize: '14px' }}>
              RM
            </div>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.jumlahBayaran}
              onChange={(e) => setFormData({...formData, jumlahBayaran: e.target.value})}
              style={{ ...inputStyle, paddingLeft: '44px' }}
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || loadingImage}
          className={`mt-2 w-full py-3.5 px-6 rounded-lg text-white font-semibold text-lg shadow-md transition-all ${isSubmitting || loadingImage ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          style={{ marginTop: '8px', width: '100%', padding: '14px 24px', borderRadius: '8px', color: 'white', fontWeight: 600, fontSize: '18px', border: 'none', cursor: isSubmitting || loadingImage ? 'not-allowed' : 'pointer', backgroundColor: isSubmitting || loadingImage ? '#94a3b8' : '#2563eb' }}
        >
          {isSubmitting ? 'Sedang Hantar...' : (isOnline ? 'Hantar Borang' : 'Simpan Secara Offline')}
        </button>
      </form>
    </div>
  );
}

// --- Komponen: Admin ---
function AdminDashboard({ data, isOnline, appId, isViewAll, setIsViewAll }) {
  const [filterClass, setFilterClass] = useState('Semua');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  const allClasses = Object.values(SENARAI_KELAS).flat();
  const safeData = Array.isArray(data) ? data : [];

  const filteredData = safeData.filter(record => {
    if (!record) return false;
    const matchClass = filterClass === 'Semua' || record.kelas === filterClass;
    const nameMatch = record.namaMurid ? record.namaMurid.toLowerCase().includes(searchTerm.toLowerCase()) : false;
    return matchClass && nameMatch;
  });

  const toggleSelect = (id, e) => {
    e.stopPropagation();
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(sid => sid !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredData.length && filteredData.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredData.map(r => r.id));
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Adakah anda pasti mahu memadam rekod ini?")) return;
    
    // Guna db global atau inject db
    const db = getFirestore(); 
    try {
        // AppId need to be passed down or retrieved
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'rekod_buku_2026', id));
        alert("Rekod berjaya dipadam.");
    } catch (err) {
        console.error("Gagal padam:", err);
        alert("Gagal memadam rekod.");
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Adakah anda pasti mahu memadam ${selectedIds.length} rekod yang dipilih?`)) return;
    
    const db = getFirestore();
    const batch = writeBatch(db);
    
    selectedIds.forEach(id => {
      const ref = doc(db, 'artifacts', appId, 'public', 'data', 'rekod_buku_2026', id);
      batch.delete(ref);
    });

    try {
      await batch.commit();
      alert(`${selectedIds.length} rekod berjaya dipadam.`);
      setSelectedIds([]);
    } catch (err) {
      console.error("Gagal pukal padam:", err);
      alert("Gagal memadam rekod.");
    }
  };

  const handleExport = () => {
    const dataToExport = selectedIds.length > 0
      ? safeData.filter(d => selectedIds.includes(d.id))
      : filteredData; // If nothing selected, export filtered list

    if (dataToExport.length === 0) return alert("Tiada data untuk dieksport.");

    // CSV Header
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Nama Murid,Tingkatan,Kelas,Nama Penjaga,No Telefon,Jumlah Bayaran (RM),Tarikh\n";

    // CSV Rows
    dataToExport.forEach(row => {
        const dateStr = row.tarikh?.seconds ? new Date(row.tarikh.seconds * 1000).toLocaleDateString('en-GB') : '-';
        // Clean strings to prevent CSV breakage
        const clean = (str) => `"${(str || '').replace(/"/g, '""')}"`;
        
        csvContent += `${clean(row.namaMurid)},${clean(row.tingkatan)},${clean(row.kelas)},${clean(row.namaPenjaga)},${clean(row.noTelefon)},${clean(row.jumlahBayaran)},${clean(dateStr)}\n`;
    });

    // Download Trigger
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `rekod_buku_2026_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 md:space-y-6 mb-20" style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '80px' }}>
      
      {/* Offline Alert in Admin Dashboard */}
      {!isOnline && (
        <div className="bg-slate-100 border border-slate-300 text-slate-600 px-4 py-2 rounded-lg flex items-center gap-2 text-sm" style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569', padding: '8px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
             <WifiOff className="w-4 h-4" />
             Data Offline (Cache). Data baharu mungkin tidak kelihatan.
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center" style={{ backgroundColor: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div className="flex gap-2 w-full md:w-auto" style={{ display: 'flex', gap: '8px', width: '100%', flex: 1 }}>
            <div className="relative w-full" style={{ position: 'relative', width: '100%' }}>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', width: '16px', height: '16px' }} />
            <input
                type="text"
                placeholder="Cari Nama..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-slate-300 rounded-lg"
                style={{ width: '100%', paddingLeft: '36px', paddingRight: '16px', paddingTop: '10px', paddingBottom: '10px', border: '1px solid #cbd5e1', borderRadius: '8px' }}
            />
            </div>
            <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="w-full md:w-48 p-2.5 border border-slate-300 rounded-lg bg-white"
            style={{ width: 'auto', minWidth: '140px', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: 'white' }}
            >
            <option value="Semua">Semua Kelas</option>
            {allClasses.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 w-full md:w-auto" style={{ display: 'flex', gap: '8px', width: 'auto' }}>
            <button 
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: '#16a34a', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 500 }}
            >
                <Download className="w-4 h-4" style={{width:'16px', height:'16px'}} /> Export CSV
            </button>
            {selectedIds.length > 0 && (
                <button 
                    onClick={handleBulkDelete}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: '#dc2626', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 500 }}
                >
                    <Trash className="w-4 h-4" style={{width:'16px', height:'16px'}} /> Padam ({selectedIds.length})
                </button>
            )}
        </div>
      </div>

      {/* Load All Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex justify-between items-center" style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', padding: '12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p className="text-sm text-blue-800" style={{ fontSize: '14px', color: '#1e40af', margin: 0 }}>
             {isViewAll 
                ? `Menunjukkan semua ${safeData.length} rekod.` 
                : `Menunjukkan ${safeData.length} rekod terkini.`}
          </p>
          <button 
             onClick={() => setIsViewAll(!isViewAll)}
             className="text-xs font-bold text-blue-600 hover:text-blue-800 underline"
             style={{ fontSize: '12px', fontWeight: 'bold', color: '#2563eb', textDecoration: 'underline', border: 'none', background: 'none', cursor: 'pointer' }}
          >
             {isViewAll ? "Lihat Terkini Sahaja" : "Lihat Semua Rekod"}
          </button>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden" style={{ display: window.innerWidth > 768 ? 'block' : 'none', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table className="w-full text-sm text-left" style={{ width: '100%', fontSize: '14px', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead className="bg-slate-50 border-b" style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <tr>
              <th className="px-4 py-3 w-10 text-center" style={{ padding: '12px 16px', width: '40px', textAlign: 'center' }}>
                <input 
                    type="checkbox" 
                    onChange={toggleSelectAll} 
                    checked={selectedIds.length === filteredData.length && filteredData.length > 0}
                    style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                />
              </th>
              <th className="px-4 py-3" style={{ padding: '12px 16px' }}>Tarikh</th>
              <th className="px-4 py-3" style={{ padding: '12px 16px' }}>Nama</th>
              <th className="px-4 py-3" style={{ padding: '12px 16px' }}>Kelas</th>
              <th className="px-4 py-3" style={{ padding: '12px 16px' }}>Jumlah (RM)</th>
              <th className="px-4 py-3 text-center" style={{ padding: '12px 16px', textAlign: 'center' }}>Bukti</th>
              <th className="px-4 py-3 text-right" style={{ padding: '12px 16px', textAlign: 'right' }}>Tindakan</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredData.map((record) => (
              <tr key={record.id} className="hover:bg-blue-50/50" style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }} onClick={() => setSelectedRecord(record)}>
                <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()} style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <input 
                        type="checkbox" 
                        checked={selectedIds.includes(record.id)} 
                        onChange={(e) => toggleSelect(record.id, e)}
                        style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                    />
                </td>
                <td className="px-4 py-3" style={{ padding: '12px 16px' }}>{record.tarikh?.seconds ? new Date(record.tarikh.seconds * 1000).toLocaleDateString() : 'Baru'}</td>
                <td className="px-4 py-3 font-medium" style={{ padding: '12px 16px', fontWeight: 500 }}>{record.namaMurid}</td>
                <td className="px-4 py-3" style={{ padding: '12px 16px' }}><span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs" style={{ backgroundColor: '#dbeafe', color: '#1d4ed8', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>{record.kelas}</span></td>
                <td className="px-4 py-3 font-medium text-green-600" style={{ padding: '12px 16px', color: '#16a34a' }}>{record.jumlahBayaran ? `RM ${parseFloat(record.jumlahBayaran).toFixed(2)}` : '-'}</td>
                <td className="px-4 py-3 text-center" style={{ padding: '12px 16px', textAlign: 'center' }}>{record.resitImage && <ImageIcon className="w-4 h-4 text-green-500 mx-auto" />}</td>
                <td className="px-4 py-3 text-right" style={{ padding: '12px 16px', textAlign: 'right' }}>
                  <div className="flex justify-end gap-2" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <button onClick={(e) => handleDelete(record.id, e)} className="text-red-500 hover:text-red-700 p-1" title="Padam" style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444' }}>
                        <Trash className="w-4 h-4" style={{width:'16px', height:'16px'}} />
                    </button>
                    <button className="text-blue-600 hover:underline font-semibold text-xs" style={{ color: '#2563eb', fontWeight: 600, fontSize: '12px', border: 'none', background: 'none', cursor: 'pointer' }}>LIHAT</button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredData.length === 0 && <tr><td colSpan="7" className="p-4 text-center" style={{ padding: '16px', textAlign: 'center', color: '#64748b' }}>Tiada rekod.</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden flex flex-col gap-3" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Mobile Select All */}
        <div className="flex items-center gap-2 px-2" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 8px' }}>
            <input 
                type="checkbox" 
                onChange={toggleSelectAll} 
                checked={selectedIds.length === filteredData.length && filteredData.length > 0}
                id="mobileSelectAll"
                style={{ width: '18px', height: '18px' }}
            />
            <label htmlFor="mobileSelectAll" className="text-sm font-medium text-slate-600" style={{ fontSize: '14px', color: '#475569' }}>Pilih Semua</label>
        </div>

        {filteredData.map((record) => (
            <div key={record.id} className="bg-white p-4 rounded-xl border shadow-sm relative" style={{ backgroundColor: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)', cursor: 'pointer', position: 'relative' }} onClick={() => setSelectedRecord(record)}>
              {/* Checkbox Absolute Position */}
              <div className="absolute top-4 right-4" onClick={(e) => e.stopPropagation()} style={{ position: 'absolute', top: '16px', right: '16px' }}>
                 <input 
                    type="checkbox" 
                    checked={selectedIds.includes(record.id)} 
                    onChange={(e) => toggleSelect(record.id, e)}
                    style={{ width: '20px', height: '20px' }}
                 />
              </div>

              <div className="flex justify-between items-start mb-2 pr-8" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', paddingRight: '32px' }}>
                <div><h3 className="font-bold text-sm" style={{ fontWeight: 'bold', fontSize: '14px' }}>{record.namaMurid}</h3><p className="text-xs text-slate-500" style={{ fontSize: '12px', color: '#64748b' }}>{record.namaPenjaga}</p></div>
              </div>
              <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold" style={{ backgroundColor: '#dbeafe', color: '#1d4ed8', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>{record.kelas}</span>
                <span className="text-green-600 font-bold text-sm" style={{ color: '#16a34a', fontWeight: 'bold' }}>{record.jumlahBayaran ? `RM ${parseFloat(record.jumlahBayaran).toFixed(2)}` : ''}</span>
              </div>
              <div className="flex justify-between items-center mt-3 border-t pt-2" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
                <span className="text-xs text-slate-400" style={{ fontSize: '12px', color: '#94a3b8' }}>{record.tarikh?.seconds ? new Date(record.tarikh.seconds * 1000).toLocaleDateString() : 'Baru'}</span>
                <div className="flex gap-3" style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={(e) => handleDelete(record.id, e)} className="text-red-500 font-bold text-xs" style={{ color: '#ef4444', fontSize: '12px', fontWeight: 'bold', border: 'none', background: 'none' }}>PADAM</button>
                    <button className="text-blue-600 text-xs font-bold flex items-center gap-1" style={{ color: '#2563eb', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', border: 'none', background: 'none' }}>LIHAT <CheckCircle className="w-3 h-3" /></button>
                </div>
              </div>
            </div>
        ))}
        {filteredData.length === 0 && <div className="text-center p-8 text-slate-500" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>Tiada rekod dijumpai.</div>}
      </div>

      {/* Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" style={{ backgroundColor: 'white', borderRadius: '16px', width: '100%', maxWidth: '512px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white" style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, backgroundColor: 'white' }}>
              <h3 className="font-bold">Butiran Rekod</h3>
              <button onClick={() => setSelectedRecord(null)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-4" style={{ padding: '20px', display: 'grid', gap: '16px' }}>
              <div><label className="text-xs font-bold text-slate-500" style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>NAMA</label><div className="font-bold">{selectedRecord.namaMurid}</div></div>
              <div className="grid grid-cols-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div><label className="text-xs font-bold text-slate-500" style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>KELAS</label><div>{selectedRecord.kelas}</div></div>
                  <div><label className="text-xs font-bold text-slate-500" style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>TELEFON</label><div>{selectedRecord.noTelefon}</div></div>
              </div>
              
              <div>
                  <label className="text-xs font-bold text-slate-500" style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>JUMLAH BAYARAN</label>
                  <div className="font-bold text-green-600 text-lg" style={{ color: '#16a34a', fontSize: '18px' }}>
                    {selectedRecord.jumlahBayaran ? `RM ${parseFloat(selectedRecord.jumlahBayaran).toFixed(2)}` : 'Tiada Maklumat'}
                  </div>
              </div>

              {/* Added Senarai Buku Image display */}
              {selectedRecord.senaraiImage && (
                <div>
                    <label className="text-xs font-bold text-slate-500 mb-2 block" style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', marginBottom: '8px', display: 'block' }}>SENARAI PEMBELIAN BUKU</label>
                    <img src={selectedRecord.senaraiImage} className="w-full rounded bg-slate-100" style={{ width: '100%', borderRadius: '8px', backgroundColor: '#f1f5f9' }} />
                </div>
              )}

              <div>
                 <label className="text-xs font-bold text-slate-500 mb-2 block" style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', marginBottom: '8px', display: 'block' }}>BUKTI RESIT PEMBAYARAN</label>
                 <img src={selectedRecord.resitImage} className="w-full rounded bg-slate-100" style={{ width: '100%', borderRadius: '8px', backgroundColor: '#f1f5f9' }} />
              </div>

              {/* Added Close Button */}
              <button 
                onClick={() => setSelectedRecord(null)}
                style={{
                    backgroundColor: '#e2e8f0', 
                    color: '#475569', 
                    width: '100%', 
                    padding: '12px 32px', 
                    borderRadius: '8px', 
                    fontWeight: 600, 
                    border: 'none', 
                    cursor: 'pointer',
                    marginTop: '16px'
                }}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}