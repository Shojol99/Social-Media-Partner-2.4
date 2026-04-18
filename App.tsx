import React, { useState, useEffect } from 'react';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously
} from 'firebase/auth';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  writeBatch,
  serverTimestamp 
} from 'firebase/firestore';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import LandingPage from './components/LandingPage';
import CheckoutFlow from './components/CheckoutFlow';
import AdminPanel from './components/AdminPanel';
import OrderStatus from './components/OrderStatus';
import { Order } from './types';
import { grantDriveAccess, sendDeliveryEmail } from './services/automation';
import firebaseConfigData from '../firebase-applet-config.json';
import { Loader2, ShieldAlert, Search, Lock, User as UserIcon, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

type View = 'landing' | 'checkout' | 'admin' | 'status';

export default function App() {
  const [view, setView] = useState<View>('landing');
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Handle /admin route
  useEffect(() => {
    const handleRoute = () => {
      if (window.location.pathname === '/admin') {
        setView('admin');
      }
    };
    handleRoute();
    window.addEventListener('popstate', handleRoute);
    return () => window.removeEventListener('popstate', handleRoute);
  }, []);

  const navigateTo = (newView: View) => {
    setView(newView);
    if (newView === 'admin') {
      window.history.pushState({}, '', '/admin');
    } else if (newView === 'landing') {
      window.history.pushState({}, '', '/');
    }
  };

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      // Check if admin
      if (user?.email === 'shojol.admin@socialmediapartner.com') {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Data Listener (Admin only)
  useEffect(() => {
    if (!isAdmin) {
      setOrders([]);
      setReports([]);
      return;
    }

    // Orders
    const qOrders = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribeOrders = onSnapshot(qOrders, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
      setOrders(ordersData);
    });

    // Reports
    const qReports = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
    const unsubscribeReports = onSnapshot(qReports, (snapshot) => {
      const reportsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setReports(reportsData);
    });

    return () => {
      unsubscribeOrders();
      unsubscribeReports();
    };
  }, [isAdmin]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adminUsername === 'Shojol' && adminPassword === 'Shojol99') {
      setIsLoggingIn(true);
      const email = 'shojol.admin@socialmediapartner.com';
      const password = 'Shojol99_secure_relay'; 
      
      try {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success('অ্যাডমিন লগইন সফল');
      } catch (error: any) {
        if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
          try {
            await createUserWithEmailAndPassword(auth, email, password);
            toast.success('অ্যাডমিন অ্যাকাউন্ট তৈরি এবং লগইন সফল');
          } catch (createError) {
            toast.error('অ্যাডমিন অ্যাকাউন্ট তৈরি করতে ব্যর্থ');
          }
        } else {
          toast.error('লগইন ব্যর্থ হয়েছে');
        }
      } finally {
        setIsLoggingIn(false);
      }
    } else {
      toast.error('ভুল ইউজারনেম বা পাসওয়ার্ড');
    }
  };

  const handleAdminGoogleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success('লগইন চেষ্টা করা হচ্ছে...');
    } catch (error) {
      toast.error('গুগল লগইন ব্যর্থ');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigateTo('landing');
    toast.success('লগআউট করা হয়েছে');
  };

  const handleCreateOrder = async (data: any) => {
    // Basic verification before starting
    if (!firebaseConfigData.apiKey || firebaseConfigData.apiKey.includes('TODO')) {
      toast.error('Firebase configuration is missing! Please check your keys.');
      throw new Error('CONFIG_MISSING');
    }

    // Ensure alphanumeric ID only (some hyphen logic can be finicky on first write)
    const orderId = `ORD${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
    const newOrder: Order = {
      id: orderId,
      ...data,
      status: 'pending',
      createdAt: Date.now(),
      uid: auth.currentUser?.uid || 'guest' + Date.now().toString().slice(-4)
    };

    try {
      console.log('--- ORDER LOG START ---');
      console.log('OrderID:', orderId);
      console.log('ProjectID:', firebaseConfigData.projectId);
      console.log('AuthUID:', auth.currentUser?.uid || 'NONE');
      
      // Internal timeout - slightly longer to give it a chance
      const writeTimeout = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('FIRESTORE_WRITE_TIMEOUT')), 30000);
      });

      await Promise.race([
        setDoc(doc(db, 'orders', orderId), newOrder),
        writeTimeout
      ]);
      
      console.log('SUCCESS: Order written');
      console.log('--- ORDER LOG END ---');
      toast.success('অর্ডার সফলভাবে জমা দেওয়া হয়েছে!');
    } catch (error: any) {
      console.error('--- ORDER ERROR START ---');
      console.error('Failed ID:', orderId);
      console.error('Error Name:', error?.name);
      console.error('Error Message:', error?.message);
      console.error('Error Code:', error?.code);
      console.error('--- ORDER ERROR END ---');
      
      let message = 'অর্ডার জমা দিতে ব্যর্থ হয়েছে।';
      if (error.message === 'FIRESTORE_WRITE_TIMEOUT') {
        message = 'সার্ভারের সাথে সংযোগ ধীর গতির (Timeout)। দয়া করে আপনার নেটওয়ার্ক চেক করুন।';
      } else if (error.code === 'permission-denied') {
        message = 'অনুমতি নেই (Security Rules)। অ্যাডমিনকে জানান।';
      }
      
      toast.error(message);
      throw error; 
    }
  };

  const handleApproveOrder = async (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    // Prevent re-processing if already fully delivered
    if (order.status === 'approved' && order.driveAccess && order.emailSent) {
      toast.info('This order is already fully delivered.');
      return;
    }

    try {
      // 1. Mark as Approved first if not already
      if (order.status !== 'approved') {
        await updateDoc(doc(db, 'orders', orderId), {
          status: 'approved',
          approvedAt: Date.now()
        });
      }

      // 2. Trigger Automation (Drive + Email)
      toast.promise(
        (async () => {
          console.log(`[AUTOMATION START] Targeting: ${order.email}`);
          
          if (!order.driveAccess) {
            console.log('[STEP 1] Granting Drive Access...');
            await grantDriveAccess(order.email);
            await updateDoc(doc(db, 'orders', orderId), { driveAccess: true });
            console.log('[STEP 1 DONE] Drive Access Granted');
          } else {
            console.log('[STEP 1 SKIP] Drive Access already exists');
          }
          
          if (!order.emailSent) {
            console.log('[STEP 2] Sending Delivery Email...');
            await sendDeliveryEmail(order);
            await updateDoc(doc(db, 'orders', orderId), { emailSent: true });
            console.log('[STEP 2 DONE] Email Sent');
          } else {
            console.log('[STEP 2 SKIP] Email already sent');
          }
          
          console.log('[AUTOMATION COMPLETED]');
        })(),
        {
          loading: `Automating delivery for ${order.name}...`,
          success: 'Success! Drive access granted & Email delivered.',
          error: (err: any) => `Automation Failed: ${err.message || 'Check connection'}`,
        }
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: 'rejected'
      });
      toast.success('অর্ডার রিজেক্ট করা হয়েছে');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
    }
  };

  const handleDeleteOrders = async (orderIds: string[]) => {
    try {
      const batch = writeBatch(db);
      orderIds.forEach(id => {
        batch.delete(doc(db, 'orders', id));
      });
      await batch.commit();
      toast.success(`${orderIds.length}টি অর্ডার ডিলিট করা হয়েছে`);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'orders/batch');
    }
  };

  const handleBulkApprove = async (orderIds: string[]) => {
    try {
      toast.info(`অ্যাপ্রুভ করা হচ্ছে ${orderIds.length}টি অর্ডার...`);
      for (const id of orderIds) {
        await handleApproveOrder(id);
        // Small delay to ensure toasts don't overlap too much and server has breathing room
        await new Promise(resolve => setTimeout(resolve, 800));
      }
      toast.success('অপারেশন শেষ হয়েছে');
    } catch (error) {
      toast.error('কিছু অর্ডার প্রসেস করতে সমস্যা হয়েছে');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
      </div>
    );
  }

  // Admin View
  if (view === 'admin') {
    if (!isAdmin) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
          <div className="absolute inset-0 gradient-bg opacity-[0.03] -z-10" />
          <Card className="w-full max-w-md bg-white border-none p-10 rounded-[3rem] shadow-2xl">
            <div className="text-center mb-10">
              <div className="w-20 h-20 gradient-bg flex items-center justify-center mx-auto mb-6 rounded-3xl shadow-lg glow-orange">
                <ShieldAlert className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic transform -skew-x-2">Admin Login</h1>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2">Management Portal</p>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Admin Email / ID</Label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <Input 
                    placeholder="shojol@socialmediapartner.netlify.app" 
                    className="bg-slate-50 border-slate-100 pl-12 h-14 rounded-2xl focus:ring-orange-500 font-bold text-slate-800"
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <Input 
                    type="password"
                    placeholder="••••••••" 
                    className="bg-slate-50 border-slate-100 pl-12 h-14 rounded-2xl focus:ring-orange-500 font-bold text-slate-800"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Button 
                  type="submit" 
                  disabled={isLoggingIn}
                  className="w-full h-16 rounded-2xl gradient-bg font-black text-white text-lg shadow-xl glow-orange active:scale-95 transition-all"
                >
                  {isLoggingIn ? <Loader2 className="w-6 h-6 animate-spin" /> : 'LOGIN TO DASHBOARD'}
                </Button>
              </div>

              <Button 
                type="button"
                variant="ghost" 
                onClick={() => navigateTo('landing')} 
                className="w-full text-slate-400 hover:text-orange-500 font-bold uppercase text-xs"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </form>
          </Card>
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-slate-50">
        <AdminPanel 
          orders={orders} 
          reports={reports}
          onApprove={handleApproveOrder} 
          onReject={handleRejectOrder}
          onDelete={handleDeleteOrders}
          onBulkApprove={handleBulkApprove}
          onLogout={handleLogout}
        />
        <Toaster position="top-right" theme="light" />
      </div>
    );
  }

  // Checkout View
  if (view === 'checkout') {
    return (
      <div className="min-h-screen bg-slate-50">
        <CheckoutFlow 
          onComplete={handleCreateOrder} 
          onBack={() => navigateTo('landing')} 
        />
        <Toaster position="top-right" theme="light" />
      </div>
    );
  }

  // Status View
  if (view === 'status') {
    return (
      <div className="min-h-screen bg-slate-50">
        <OrderStatus onBack={() => navigateTo('landing')} />
        <Toaster position="top-right" theme="light" />
      </div>
    );
  }

  // Landing View
  return (
    <div className="min-h-screen bg-slate-50">
      <LandingPage onGetAccess={() => navigateTo('checkout')} />
      
      {/* Quick Access Tracker (Desktop) */}
      <div className="hidden md:flex fixed bottom-8 left-8 gap-3 z-50">
        <Button 
          variant="outline" 
          className="bg-white/90 backdrop-blur-md border-white/20 text-slate-600 hover:text-orange-500 rounded-full h-14 px-8 shadow-2xl font-bold transition-all hover:scale-105"
          onClick={() => navigateTo('status')}
        >
          <Search className="w-5 h-5 mr-3" />
          আপনার অর্ডার ট্র্যাক করুন
        </Button>
      </div>

      {/* Admin Link (Subtle) */}
      <div className={`fixed bottom-4 right-4 ${isAdmin ? 'opacity-100' : 'opacity-0 hover:opacity-100'} transition-opacity z-50`}>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-slate-300 hover:text-orange-500 font-bold"
          onClick={() => navigateTo('admin')}
        >
          {isAdmin ? 'Dashboard' : 'Admin'}
        </Button>
      </div>
      
      <Toaster position="top-right" theme="light" />
    </div>
  );
}
