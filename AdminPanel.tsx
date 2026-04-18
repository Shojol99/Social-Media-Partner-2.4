import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  History,
  Clock, 
  CheckCircle, 
  Search, 
  LogOut, 
  Mail,
  Phone,
  Hash,
  Check,
  X,
  Loader2,
  Calendar,
  Trash2,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  DollarSign,
  Package,
  Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Order, ContactReport } from '@/src/types';
import { format, startOfWeek, startOfMonth, isAfter, subDays, subMonths } from 'date-fns';
import { toast } from 'sonner';

interface AdminPanelProps {
  orders: Order[];
  reports: ContactReport[];
  onApprove: (orderId: string) => Promise<void>;
  onReject: (orderId: string) => Promise<void>;
  onDelete: (orderIds: string[]) => Promise<void>;
  onBulkApprove: (orderIds: string[]) => Promise<void>;
  onLogout: () => void;
}

type AdminTab = 'txid' | 'pending' | 'all' | 'report';

export default function AdminPanel({ 
  orders, 
  reports, 
  onApprove, 
  onReject, 
  onDelete, 
  onBulkApprove, 
  onLogout 
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('pending');
  const [txSearch, setTxSearch] = useState('');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [verifyInput, setVerifyInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Statistics Calculation
  const stats = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now);
    const monthStart = startOfMonth(now);
    const pricePerUnit = 100;

    const weeklyOrders = orders.filter(o => isAfter(new Date(o.createdAt), weekStart));
    const monthlyOrders = orders.filter(o => isAfter(new Date(o.createdAt), monthStart));

    const weeklyApproved = weeklyOrders.filter(o => o.status === 'approved');
    const monthlyApproved = monthlyOrders.filter(o => o.status === 'approved');

    return {
      weeklyCount: weeklyOrders.length,
      weeklyIncome: weeklyApproved.length * pricePerUnit,
      monthlyCount: monthlyOrders.length,
      monthlyIncome: monthlyApproved.length * pricePerUnit,
      totalCount: orders.length,
      totalIncome: orders.filter(o => o.status === 'approved').length * pricePerUnit,
      pendingCount: orders.filter(o => o.status === 'pending').length
    };
  }, [orders]);

  // Filters
  const pendingOrders = orders.filter(o => o.status === 'pending');
  const txFilteredOrders = txSearch 
    ? pendingOrders.filter(o => o.transactionId.toUpperCase().includes(txSearch.toUpperCase()))
    : [];

  const handleBulkAction = async (action: 'approve' | 'delete') => {
    if (selectedOrders.length === 0) return;
    setIsProcessing(true);
    try {
      if (action === 'approve') {
        await onBulkApprove(selectedOrders);
      } else {
        if (confirm(`${selectedOrders.length}টি অর্ডার ডিলিট করতে চান?`)) {
          await onDelete(selectedOrders);
        }
      }
      setSelectedOrders([]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerify = async (order: Order) => {
    if (verifyInput.trim().toUpperCase() === order.transactionId.toUpperCase()) {
      setIsProcessing(true);
      try {
        await onApprove(order.id);
        toast.success('ট্রানজেকশন ম্যাচ হয়েছে! অর্ডার অ্যাপ্রুভ করা হয়েছে।');
        setVerifyingId(null);
        setVerifyInput('');
      } finally {
        setIsProcessing(false);
      }
    } else {
      toast.error('ট্রানজেকশন আইডি মেলেনি। আবার চেষ্টা করুন।');
    }
  };

  const navItems = [
    { id: 'txid', icon: Search, label: 'TxID' },
    { id: 'pending', icon: Clock, label: 'Pending', count: stats.pendingCount },
    { id: 'all', icon: History, label: 'All Orders' },
    { id: 'report', icon: TrendingUp, label: 'Report' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-24 text-slate-900 font-sans">
      {/* Top Header */}
      <header className="glass sticky top-0 z-40 px-4 py-4 flex items-center justify-between border-b border-slate-200/50 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 gradient-bg rounded-xl flex items-center justify-center font-black text-white shadow-lg">S</div>
          <div>
            <h1 className="font-black text-lg tracking-tighter uppercase italic leading-none">Social Partner</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Admin Dashboard</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onLogout} className="rounded-xl text-slate-400 hover:text-orange-500">
          <LogOut className="w-5 h-5" />
        </Button>
      </header>

      <main className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
        
        {/* Bulk Action Toolbar */}
        <AnimatePresence>
          {selectedOrders.length > 0 && (
            <motion.div 
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              className="sticky top-20 z-30 bg-white border border-orange-100 p-4 rounded-2xl shadow-xl flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <Badge className="bg-orange-500 text-white font-bold h-7 px-3">{selectedOrders.length} Selected</Badge>
                <Button variant="ghost" size="sm" onClick={() => setSelectedOrders([])} className="text-slate-400 font-bold uppercase text-[10px]">Cancel</Button>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleBulkAction('delete')} className="text-rose-500 border-rose-100 hover:bg-rose-50 rounded-xl font-bold">
                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                </Button>
                <Button size="sm" onClick={() => handleBulkAction('approve')} className="gradient-bg text-white rounded-xl font-black italic shadow-lg">
                  <CheckCircle className="w-4 h-4 mr-2" /> APPROVE ALL
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* View: TXID Search */}
        {activeTab === 'txid' && (
          <div className="space-y-6">
            <Card className="p-8 rounded-[2.5rem] border-none shadow-xl bg-white space-y-6">
              <div className="text-center md:text-left">
                <h2 className="text-2xl font-black tracking-tight text-slate-800">TxID ভেরিফিকেশন 🔍</h2>
                <p className="text-slate-400 font-medium">সঠিক ট্রানজেকশন আইডি দিয়ে অর্ডারটি খুঁজে ফিল্টার করুন</p>
              </div>
              <div className="relative">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300" />
                <Input 
                  placeholder="ট্রানজেকশন আইডি লিখুন (যেমন: A1B2C3D4)" 
                  className="h-20 pl-16 pr-6 rounded-[1.5rem] border-slate-100 bg-slate-50/50 text-xl font-black text-slate-900 placeholder:text-slate-300 focus:ring-orange-500 transition-all uppercase"
                  value={txSearch}
                  onChange={(e) => setTxSearch(e.target.value)}
                />
              </div>
            </Card>

            <AnimatePresence>
              {txSearch && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <div className="flex items-center justify-between px-4">
                    <h3 className="font-black text-slate-400 uppercase tracking-widest text-xs">ফলাফল ({txFilteredOrders.length})</h3>
                  </div>
                  {txFilteredOrders.map(order => (
                    <OrderCard 
                      key={order.id} 
                      order={order} 
                      onApprove={() => setVerifyingId(order.id)} 
                      isSelected={selectedOrders.includes(order.id)}
                      onSelect={(id) => setSelectedOrders(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])}
                    />
                  ))}
                  {txFilteredOrders.length === 0 && (
                    <Card className="p-12 text-center rounded-[2rem] border-dashed border-slate-200 bg-transparent text-slate-400 font-bold">
                       দুঃখিত! এই TxID দিয়ে কোনো পেন্ডিং অর্ডার পাওয়া যায়নি।
                    </Card>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* View: Pending */}
        {activeTab === 'pending' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-2xl font-black tracking-tighter text-slate-800 italic uppercase">Pending Orders</h2>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSelectedOrders(pendingOrders.map(o => o.id))} 
                className="rounded-full font-bold text-[10px] uppercase border-slate-200"
              >
                Select All
              </Button>
            </div>
            {pendingOrders.map(order => (
              <OrderCard 
                key={order.id} 
                order={order} 
                onApprove={() => setVerifyingId(order.id)} 
                isSelected={selectedOrders.includes(order.id)}
                onSelect={(id) => setSelectedOrders(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])}
              />
            ))}
            {pendingOrders.length === 0 && (
              <div className="text-center py-32 space-y-4">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-300">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <p className="text-slate-400 font-bold text-lg">সব অর্ডার ক্লিয়ার! অসাধারন কাজ! 🙌</p>
              </div>
            )}
          </div>
        )}

        {/* View: All Orders */}
        {activeTab === 'all' && (
          <div className="space-y-6">
             <div className="flex items-center justify-between px-2">
              <h2 className="text-2xl font-black tracking-tighter text-slate-800 italic uppercase">Full History</h2>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setSelectedOrders(orders.map(o => o.id))} 
                  className="rounded-full font-bold text-[10px] uppercase border-slate-200"
                >
                  Select All
                </Button>
              </div>
            </div>
            <div className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="hover:bg-transparent border-slate-100 h-14">
                    <TableHead className="w-12"></TableHead>
                    <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Client</TableHead>
                    <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">TxID</TableHead>
                    <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</TableHead>
                    <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Delivery</TableHead>
                    <TableHead className="text-right"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map(order => (
                    <TableRow key={order.id} className="border-slate-50 group hover:bg-slate-50/50 transition-colors">
                       <TableCell>
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 rounded border-slate-200 text-orange-500 focus:ring-orange-500" 
                          checked={selectedOrders.includes(order.id)} 
                          onChange={() => setSelectedOrders(prev => prev.includes(order.id) ? prev.filter(x => x !== order.id) : [...prev, order.id])}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 text-sm">{order.name}</span>
                          <span className="text-[10px] text-slate-400 font-bold">{order.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-[10px] font-black text-orange-500 bg-orange-50 px-2 py-1 rounded-md">{order.transactionId}</code>
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-[9px] font-black uppercase border-none tracking-tighter ${
                          order.status === 'approved' ? 'bg-emerald-100 text-emerald-600' : 
                          order.status === 'rejected' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
                        }`}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 justify-center">
                          <Badge className={`text-[9px] font-black uppercase border-none px-2 h-6 flex items-center justify-center ${
                            order.driveAccess ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'
                          }`}>
                            {order.driveAccess ? 'ACCESS ✅' : 'ACCESS'}
                          </Badge>
                          <Badge className={`text-[9px] font-black uppercase border-none px-2 h-6 flex items-center justify-center ${
                            order.emailSent ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'
                          }`}>
                            {order.emailSent ? 'EMAIL ✅' : 'EMAIL'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => onDelete([order.id])} 
                          className="text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded-xl"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* View: Report */}
        {activeTab === 'report' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="px-2">
              <h2 className="text-3xl font-black tracking-tighter text-slate-800 italic uppercase">Real-time Analytics</h2>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Social Media Partner BD</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StatCard 
                title="Weekly Overview" 
                count={stats.weeklyCount} 
                income={stats.weeklyIncome} 
                period="Past 7 Days"
                color="orange"
                icon={Calendar}
              />
              <StatCard 
                title="Monthly Overview" 
                count={stats.monthlyCount} 
                income={stats.monthlyIncome} 
                period="Current Month"
                color="purple"
                icon={Layers}
              />
            </div>

            <Card className="p-10 rounded-[3rem] border-none shadow-xl bg-white space-y-8 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -mr-32 -mt-32 opacity-50" />
               <div className="relative z-10 flex flex-col md:flex-row gap-12 justify-between">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Operational Success</span>
                  <h3 className="text-4xl font-black text-slate-900 tracking-tighter">Lifetime Report</h3>
                </div>
                <div className="grid grid-cols-2 gap-12">
                   <div className="space-y-1">
                     <p className="text-xs font-bold text-slate-400 uppercase">Total Access Delivered</p>
                     <p className="text-4xl font-black text-slate-900 tracking-tighter">{orders.filter(o => o.status === 'approved').length}</p>
                   </div>
                   <div className="space-y-1">
                     <p className="text-xs font-bold text-slate-400 uppercase">Total Revenue (BDT)</p>
                     <p className="text-4xl font-black text-orange-500 tracking-tighter">৳ {stats.totalIncome.toLocaleString()}</p>
                   </div>
                </div>
               </div>
            </Card>
          </div>
        )}

      </main>

      {/* Floating Bottom Menu */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-lg z-50">
        <div className="bg-slate-900/95 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-3 shadow-2xl flex items-center justify-between">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as AdminTab)}
                className={`relative flex flex-col items-center justify-center py-2 px-4 rounded-3xl transition-all duration-300 ${
                  isActive ? 'bg-white/10 text-white scale-110' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <item.icon className={`w-5 h-5 mb-1 ${isActive ? 'text-orange-500' : ''}`} />
                <span className={`text-[9px] font-black uppercase tracking-widest ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                  {item.label}
                </span>
                {item.count ? (
                  <Badge className="absolute -top-1 -right-1 bg-orange-500 text-white border-2 border-slate-900 font-black h-5 min-w-5 flex items-center justify-center p-0 rounded-full text-[9px]">
                    {item.count}
                  </Badge>
                ) : null}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Verification Dialog */}
      <AnimatePresence>
        {verifyingId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setVerifyingId(null)}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[3rem] p-10 shadow-2xl space-y-8"
            >
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 mx-auto mb-4">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">অর্ডার ভেরিফিকেশন</h3>
                <p className="text-slate-400 font-medium">কাস্টমার যে TxID সাবমিট করেছেন সেটি এখানে টাইপ করে ম্যাচ করুন</p>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Customer TxID</span>
                  <span className="text-2xl font-black text-orange-500 tracking-widest uppercase">
                    {orders.find(o => o.id === verifyingId)?.transactionId}
                  </span>
                </div>

                <div className="space-y-2 text-center">
                  <Input 
                    placeholder="টাইপ করে কনফার্ম করুন..." 
                    className="h-16 text-center text-xl font-black rounded-2xl border-slate-100 focus:ring-orange-500 uppercase"
                    value={verifyInput}
                    onChange={(e) => setVerifyInput(e.target.value)}
                  />
                  <p className="text-[10px] text-slate-400 font-bold italic">*TxID হুবহু না মিললে কনফার্ম হবে না</p>
                </div>
              </div>

              <div className="flex gap-4">
                <Button variant="ghost" className="flex-1 h-14 rounded-2xl font-bold" onClick={() => setVerifyingId(null)}>বাতিল করুন</Button>
                <Button 
                  className="flex-1 h-14 rounded-2xl gradient-bg text-white font-black italic shadow-lg glow-orange"
                  onClick={() => {
                    const order = orders.find(o => o.id === verifyingId);
                    if (order) handleVerify(order);
                  }}
                  disabled={isProcessing}
                >
                  {isProcessing ? <Loader2 className="w-5 h-5 animate-spin"/> : 'MATCH & APPROVE'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Sub-components
const OrderCard = ({ order, onApprove, isSelected, onSelect }: { order: Order, onApprove: () => void, isSelected: boolean, onSelect: (id: string) => void, key?: string }) => (
  <Card className={`group p-6 rounded-[2rem] border-none shadow-sm transition-all hover:shadow-xl relative overflow-hidden ${isSelected ? 'ring-2 ring-orange-400' : 'bg-white'}`}>
    <div className="flex items-start justify-between relative z-10">
      <div className="flex gap-4">
        <label className="mt-1 cursor-pointer">
          <input 
            type="checkbox" 
            className="w-5 h-5 rounded-lg border-slate-200 text-orange-500 focus:ring-orange-500" 
            checked={isSelected}
            onChange={() => onSelect(order.id)}
          />
        </label>
        <div className="space-y-3">
          <div className="space-y-1">
            <h4 className="font-black text-lg text-slate-800 tracking-tight leading-none">{order.name}</h4>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              <span className="flex items-center gap-1.5 text-xs text-slate-400 font-bold"><Mail className="w-3 h-3"/> {order.email}</span>
              <span className="flex items-center gap-1.5 text-xs text-slate-400 font-bold"><Phone className="w-3 h-3"/> {order.phone}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg flex items-center gap-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">TxID:</span>
              <span className="text-sm font-black text-orange-500 uppercase">{order.transactionId}</span>
            </div>
            <div className="flex gap-1">
              <Badge className={`text-[8px] font-black uppercase border-none h-6 flex items-center px-2 ${
                order.driveAccess ? 'bg-emerald-500 text-white shadow-sm' : 'bg-slate-100 text-slate-400'
              }`}>
                {order.driveAccess ? 'ACCESS AVAILABLE ✅' : 'ACCESS PENDING'}
              </Badge>
              <Badge className={`text-[8px] font-black uppercase border-none h-6 flex items-center px-2 ${
                order.emailSent ? 'bg-emerald-500 text-white shadow-sm' : 'bg-slate-100 text-slate-400'
              }`}>
                {order.emailSent ? 'EMAIL DELIVERED ✅' : 'EMAIL PENDING'}
              </Badge>
            </div>
            <span className="text-[10px] text-slate-400 font-bold">{format(order.createdAt, 'MMM d, h:mm a')}</span>
          </div>
        </div>
      </div>
      <Button 
        onClick={onApprove}
        className="rounded-2xl h-14 px-6 gradient-bg font-black text-white italic shadow-lg glow-orange hover:scale-105 active:scale-95 transition-all"
      >
        VERIFY <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  </Card>
);

const StatCard = ({ title, count, income, period, color, icon: Icon }: any) => {
  const colorMap: any = {
    orange: { bg: 'bg-orange-500', light: 'bg-orange-50', text: 'text-orange-500' },
    purple: { bg: 'bg-purple-600', light: 'bg-purple-50', text: 'text-purple-600' }
  };
  const theme = colorMap[color];

  return (
    <Card className="p-8 rounded-[2.5rem] border-none shadow-xl bg-white space-y-6 flex flex-col justify-between group overflow-hidden relative">
      <div className={`absolute top-0 right-0 w-24 h-24 ${theme.light} rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500`} />
      <div className="relative z-10 flex flex-col h-full space-y-8">
        <div className="flex items-center justify-between">
          <div className={`w-12 h-12 ${theme.bg} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
            <Icon className="w-6 h-6" />
          </div>
          <Badge className={`${theme.light} ${theme.text} border-none font-bold text-[10px] tracking-widest`}>{period}</Badge>
        </div>
        
        <div className="space-y-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{title}</p>
          <div className="flex items-baseline gap-4">
            <h3 className="text-5xl font-black text-slate-900 tracking-tighter">{count}</h3>
            <span className="text-slate-300 font-bold italic uppercase">Orders</span>
          </div>
        </div>

        <div className={`p-4 ${theme.light} rounded-2xl border border-current opacity-20 group-hover:opacity-100 transition-opacity`}>
           <div className="flex items-center justify-between">
              <span className={`text-xs font-black uppercase tracking-widest ${theme.text}`}>Total Revenue</span>
              <span className={`text-xl font-black ${theme.text}`}>৳ {income.toLocaleString()}</span>
           </div>
        </div>
      </div>
    </Card>
  );
};
