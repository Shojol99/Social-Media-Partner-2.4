import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Clock, CheckCircle, XCircle, Loader2, ArrowLeft, Ticket, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { db, handleFirestoreError, OperationType } from '@/src/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Order } from '@/src/types';

interface OrderStatusProps {
  onBack: () => void;
}

export default function OrderStatus({ onBack }: OrderStatusProps) {
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) return;

    setIsLoading(true);
    setError(null);
    setOrder(null);

    try {
      const docRef = doc(db, 'orders', orderId.trim().toUpperCase());
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setOrder(docSnap.data() as Order);
      } else {
        setError('অর্ডার পাওয়া যায়নি। আইডিটি পুনরায় চেক করুন।');
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `orders/${orderId}`);
      setError('অর্ডার লোড করতে সমস্যা হচ্ছে।');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <Button variant="ghost" onClick={onBack} className="mb-6 -ml-2 text-slate-400 hover:text-orange-500 font-bold">
          <ArrowLeft className="mr-2 w-4 h-4" />
          হোমে ফিরে যান
        </Button>
        
        <div className="text-center md:text-left mb-8">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 leading-[1.4] md:leading-tight">অর্ডার ট্র্যাক করুন 🔍</h2>
          <p className="text-slate-500 font-medium leading-[1.5]">আপনার অ্যাক্সেস লিঙ্কের বর্তমান অবস্থা জানুন</p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-3 mb-10">
          <Input 
            placeholder="উদাহরণ: ORD-ABC123XYZ" 
            className="bg-white border-2 border-slate-100 h-16 uppercase font-mono rounded-2xl focus:ring-orange-500 focus:border-orange-500 text-slate-900 font-bold text-lg"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
          />
          <Button type="submit" disabled={isLoading} className="gradient-bg hover:opacity-90 h-16 w-16 shrink-0 rounded-2xl shadow-xl glow-orange text-white transition-all flex items-center justify-center">
            {isLoading ? <Loader2 className="w-7 h-7 animate-spin" /> : <Search className="w-7 h-7" />}
          </Button>
        </form>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-rose-50 border border-rose-100 p-8 rounded-[2rem] text-rose-600 font-bold text-center shadow-lg"
            >
              {error}
            </motion.div>
          )}

          {order && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Card className="bg-white border-none p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 gradient-bg opacity-[0.03] blur-3xl -mr-16 -mt-16" />
                
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10 text-center md:text-left">
                  <div>
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                       <Ticket className="w-4 h-4 text-slate-400" />
                       <p className="text-xs text-slate-400 uppercase font-bold tracking-widest">Kitchen Ticket</p>
                    </div>
                    <h3 className="text-3xl font-mono font-black text-slate-900 tracking-tight">{order.id}</h3>
                  </div>
                  <Badge 
                    className={`h-10 px-6 rounded-full text-white font-bold text-sm border-none ${
                        order.status === 'approved' ? 'bg-emerald-500' :
                        order.status === 'rejected' ? 'bg-rose-500' :
                        'bg-amber-500 animate-pulse'
                    }`}
                  >
                    {order.status === 'approved' ? 'কমপ্লিট' : order.status === 'rejected' ? 'বাতিল' : 'প্রক্রিয়াধীন'}
                  </Badge>
                </div>

                <div className="space-y-8">
                  <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                    <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center shrink-0 shadow-lg ${
                        order.status === 'approved' ? 'bg-emerald-50 text-emerald-500' : 
                        order.status === 'rejected' ? 'bg-rose-50 text-rose-500' :
                        'bg-amber-50 text-amber-500'
                    }`}>
                      {order.status === 'approved' ? <CheckCircle className="w-10 h-10" /> : 
                       order.status === 'rejected' ? <XCircle className="w-10 h-10" /> :
                       <Clock className="w-10 h-10" />}
                    </div>
                    <div>
                      <p className="font-black text-slate-900 text-xl md:text-2xl tracking-tight mb-2 leading-[1.4]">
                        {order.status === 'pending' && 'আপনার অর্ডারটি তৈরি হচ্ছে...'}
                        {order.status === 'approved' && 'অর্ডার সম্পন্ন হয়েছে!'}
                        {order.status === 'rejected' && 'দুঃখিত, সমস্যা হয়েছে!'}
                      </p>
                      <p className="text-slate-500 font-medium leading-[1.6]">
                        {order.status === 'pending' && 'আমাদের টিম আপনার পেমেন্ট যাচাই করছে। সাধারণত ১৫-৩০ মিনিট সময় লাগে। একটু অপেক্ষা করুন!'}
                        {order.status === 'approved' && `অ্যাক্সেস লিঙ্কটি সফলভাবে ${order.email} ঠিকানায় পাঠানো হয়েছে। অনুগ্রহ করে ইনবক্স এবং স্প্যাম ফোল্ডার চেক করুন।`}
                        {order.status === 'rejected' && 'আপনার ট্রানজেকশন তথ্য ভুল হতে পারে। সঠিক তথ্য দিয়ে আবার চেষ্টা করুন অথবা সাপোর্টে কথা বলুন।'}
                      </p>
                    </div>
                  </div>
                </div>

                {order.status === 'approved' && (
                  <div className="mt-10 p-8 glass rounded-[2rem] border-emerald-100 flex items-center gap-4">
                    <Check className="w-6 h-6 text-emerald-500 shrink-0" />
                    <p className="text-emerald-800 font-bold text-sm italic">
                      সফল! অ্যাক্সেস লিঙ্কটি আপনার ইমেইলে পাঠিয়ে দেওয়া হয়েছে।
                    </p>
                  </div>
                )}
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
