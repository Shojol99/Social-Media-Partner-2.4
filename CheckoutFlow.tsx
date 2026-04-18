import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, ArrowRight, CheckCircle2, Copy, Info, Loader2, ShieldCheck, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const userInfoSchema = z.object({
  name: z.string().min(2, 'নাম খুব ছোট'),
  email: z.string().email('সঠিক ইমেইল এড্রেস নয়'),
  phone: z.string().min(11, 'সঠিক ফোন নম্বর নয়'),
});

const transactionSchema = z.object({
  transactionId: z.string().min(8, 'সঠিক লেনদেন আইডি নয়'),
});

type UserInfo = z.infer<typeof userInfoSchema>;

interface CheckoutFlowProps {
  onComplete: (data: UserInfo & { transactionId: string }) => Promise<void>;
  onBack: () => void;
}

export default function CheckoutFlow({ onComplete, onBack }: CheckoutFlowProps) {
  const [step, setStep] = useState(1);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userForm = useForm<UserInfo>({
    resolver: zodResolver(userInfoSchema),
  });

  const transactionForm = useForm<{ transactionId: string }>({
    resolver: zodResolver(transactionSchema),
  });

  const handleUserInfoSubmit = (data: UserInfo) => {
    setUserInfo(data);
    setStep(2);
  };

  const handleTransactionSubmit = async (data: { transactionId: string }) => {
    if (!userInfo) return;
    setIsSubmitting(true);
    
    // Create a timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('TIMEOUT')), 20000); // 20 second timeout
    });

    try {
      // Race the submission against the timeout
      await Promise.race([
        onComplete({ ...userInfo, ...data }),
        timeoutPromise
      ]);
      setStep(4);
    } catch (error: any) {
      console.error('Submission failed:', error);
      if (error.message === 'TIMEOUT') {
        toast.error('সার্ভারের সাথে সংযোগ বিচ্ছিন্ন হয়েছে। আপনার ইন্টারনেট চেক করুন এবং আবার চেষ্টা করুন।');
      } else {
        toast.error('অর্ডার জমা দিতে ব্যর্থ হয়েছে। সম্ভবত ট্রানজেকশন আইডি-তে সমস্যা আছে।');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('কপি করা হয়েছে');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <Button variant="ghost" onClick={onBack} className="text-slate-400 hover:text-orange-500 font-bold">
                <ArrowLeft className="mr-2 w-4 h-4" />
                হোমে ফিরে যান
              </Button>
              <div className="text-center md:text-left">
                <h2 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 flex items-center justify-center md:justify-start gap-3 leading-[1.5]">
                    আপনার তথ্য লিখুন 👤
                </h2>
                <p className="text-slate-500 font-medium leading-[1.6]">আপনার অ্যাক্সেস লিঙ্কটি আমরা কোথায় পাঠাব?</p>
              </div>
              
              <Card className="p-8 rounded-[2rem] border-none shadow-xl bg-white space-y-6">
                <form onSubmit={userForm.handleSubmit(handleUserInfoSubmit)} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-slate-400">পুরো নাম</Label>
                    <Input 
                      id="name" 
                      placeholder="আপনার নাম লিখুন" 
                      {...userForm.register('name')}
                      className="h-14 rounded-2xl border-slate-100 focus:ring-orange-500 focus:border-orange-500 font-bold bg-slate-50"
                    />
                    {userForm.formState.errors.name && (
                      <p className="text-orange-500 text-xs font-bold">{userForm.formState.errors.name.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-slate-400">ইমেইল অ্যাড্রেস</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="email@example.com" 
                      {...userForm.register('email')}
                      className="h-14 rounded-2xl border-slate-100 focus:ring-orange-500 focus:border-orange-500 font-bold bg-slate-50"
                    />
                    {userForm.formState.errors.email && (
                      <p className="text-orange-500 text-xs font-bold">{userForm.formState.errors.email.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-widest text-slate-400">ফোন নম্বর</Label>
                    <Input 
                      id="phone" 
                      placeholder="017XXXXXXXX" 
                      {...userForm.register('phone')}
                      className="h-14 rounded-2xl border-slate-100 focus:ring-orange-500 focus:border-orange-500 font-bold bg-slate-50"
                    />
                    {userForm.formState.errors.phone && (
                      <p className="text-orange-500 text-xs font-bold">{userForm.formState.errors.phone.message}</p>
                    )}
                  </div>
                  
                  <Button type="submit" className="w-full h-16 text-lg font-bold rounded-2xl gradient-bg text-white glow-orange shadow-lg transition-all hover:scale-[1.02] active:scale-95">
                    পরবর্তী ধাপ: পেমেন্ট
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </form>
              </Card>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <Button variant="ghost" onClick={() => setStep(1)} className="text-slate-400 hover:text-orange-500 font-bold">
                <ArrowLeft className="mr-2 w-4 h-4" />
                পিছনে
              </Button>
              <div className="text-center md:text-left">
                <h2 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 flex items-center justify-center md:justify-start gap-3 leading-[1.5]">
                  পেমেন্ট করুন 💳
                </h2>
                <p className="text-slate-500 font-medium leading-[1.6]">নিচের বিকাশ নম্বরে <span className="text-orange-500 font-black">৳১০০</span> টাকা সেন্ড মানি বা পেমেন্ট করুন</p>
              </div>
              
              <Card className="glass border-orange-100 p-8 rounded-[2rem] shadow-xl space-y-8 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-3xl rounded-full -mr-16 -mt-16" />
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                     <div className="w-8 h-8 rounded-lg bg-pink-500 flex items-center justify-center text-white">
                       <CreditCard className="w-4 h-4" />
                     </div>
                     <span className="text-xs font-bold uppercase tracking-widest text-slate-400">বিকাশ মার্চেন্ট</span>
                   </div>
                   <Badge className="bg-emerald-100 text-emerald-600 border-none font-bold">OFFICIAL</Badge>
                </div>

                <div className="bg-white border border-orange-100 p-6 rounded-2xl flex items-center justify-between shadow-sm">
                  <span className="text-xl md:text-3xl font-mono font-black text-slate-900 tracking-tight">01991579084</span>
                  <Button size="icon" variant="ghost" className="text-orange-500 hover:bg-orange-50 w-12 h-12 rounded-xl" onClick={() => copyToClipboard('01991579084')}>
                    <Copy className="w-5 h-5" />
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {[
                    "বিকাশ অ্যাপ ওপেন করুন অথবা ডায়াল করুন *২৪৭#",
                    "\"Send Money\" অথবা \"Payment\" সিলেক্ট করুন",
                    "নম্বর এবং টাকার পরিমাণ (৳১০০) লিখুন",
                    "লেনদেন শেষে ট্রানজেকশন আইডি (Transaction ID) নোট করুন"
                  ].map((text, i) => (
                    <div key={i} className="flex gap-4 items-start">
                      <div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">{i+1}</div>
                      <p className="text-sm text-slate-600 font-bold leading-[1.5]">{text}</p>
                    </div>
                  ))}
                </div>

                <Button onClick={() => setStep(3)} className="w-full h-16 text-lg font-bold rounded-2xl gradient-bg text-white shadow-lg glow-orange transition-all hover:scale-[1.02] active:scale-95">
                  আমি পেমেন্ট করেছি!
                </Button>
              </Card>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <Button variant="ghost" onClick={() => setStep(2)} className="text-slate-400 hover:text-orange-500 font-bold">
                <ArrowLeft className="mr-2 w-4 h-4" />
                পিছনে
              </Button>
              <div className="text-center md:text-left">
                <h2 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 flex items-center justify-center md:justify-start gap-3 leading-[1.5]">
                  ভেরিফিকেশন 🔐
                </h2>
                <p className="text-slate-500 font-medium leading-[1.6]">আপনার বিকাশ ট্রানজেকশন আইডিটি লিখুন</p>
              </div>
              
              <Card className="p-8 rounded-[2rem] border-none shadow-xl bg-white space-y-8">
                <form onSubmit={transactionForm.handleSubmit(handleTransactionSubmit)} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="transactionId" className="text-xs font-bold uppercase tracking-widest text-slate-400">ট্রানজেকশন আইডি (Transaction ID)</Label>
                    <Input 
                      id="transactionId" 
                      placeholder="উদাহরণ: AKL9J2K8L" 
                      {...transactionForm.register('transactionId')}
                      className="h-16 rounded-2xl border-slate-100 focus:ring-orange-500 focus:border-orange-500 font-black text-xl bg-slate-50 uppercase tracking-widest"
                    />
                    {transactionForm.formState.errors.transactionId && (
                      <p className="text-orange-500 text-xs font-bold">{transactionForm.formState.errors.transactionId.message}</p>
                    )}
                  </div>
                  
                  <div className="bg-orange-50 p-6 rounded-2xl flex gap-4">
                    <Info className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-600 font-bold leading-normal uppercase tracking-tight">
                      আমাদের টিম আপনার লেনদেন যাচাই করবে। এতে সাধারণত <span className="text-orange-600">৫ মিনিট থেকে ১ ঘন্টা</span> সময় লাগতে পারে। লিঙ্কটি আপনার ইমেইলে যাবে।
                    </p>
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full h-16 text-lg font-bold rounded-2xl gradient-bg text-white shadow-lg glow-orange transition-all hover:scale-[1.02] active:scale-95"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        অর্ডার হচ্ছে...
                      </>
                    ) : (
                      'অর্ডার সম্পন্ন করুন'
                    )}
                  </Button>
                </form>
              </Card>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="text-center space-y-8"
            >
              <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-4 border-emerald-500 shadow-xl glow-orange">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <div className="space-y-4">
                <h2 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 leading-[1.3] uppercase italic transform -skew-x-2">অর্ডার সাবমিট হয়েছে! 🎉</h2>
                <div className="space-y-4 max-w-md mx-auto">
                  <p className="text-slate-600 font-bold text-lg leading-[1.6]">
                    ধন্যবাদ <span className="text-orange-500">{userInfo?.name}</span>, আপনার অর্ডারের জন্য! 
                  </p>
                  <div className="bg-slate-100/50 p-6 rounded-[2rem] border border-slate-200">
                    <p className="text-slate-500 font-bold text-sm leading-[1.8]">
                      আপনার পেমেন্ট বর্তমানে রিভিউ করা হচ্ছে। যাচাইকরণ সম্পন্ন হতে সাধারণত 
                      <span className="text-orange-500"> ৫ মিনিট থেকে ১ ঘন্টা </span> সময় লাগতে পারে। 
                    </p>
                  </div>
                  <p className="text-slate-400 font-medium text-xs uppercase tracking-widest pt-2">
                    লিঙ্কটি আপনার ইমেইল <span className="text-slate-600">({userInfo?.email})</span>-এ পাঠানো হবে।
                  </p>
                </div>
              </div>
              
              <div className="p-6 glass rounded-2xl flex items-center gap-3 justify-center mb-8 border-emerald-100">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">অটোমেটেড অ্যাক্সেস সিস্টেম ভেরিফাইড</span>
              </div>
              
              <Button onClick={onBack} variant="outline" className="h-16 px-12 rounded-2xl border-2 border-slate-200 font-black text-slate-800 hover:bg-slate-50 transition-all uppercase tracking-widest text-xs">
                হোমে ফিরে যান
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
