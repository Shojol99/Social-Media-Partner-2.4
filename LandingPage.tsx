import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  MessageCircle, 
  Download, 
  Zap, 
  ShieldCheck, 
  Users, 
  ArrowRight, 
  Star, 
  Play, 
  Clock, 
  Gift,
  Plus,
  Minus,
  Check,
  Facebook,
  Video,
  Instagram,
  Clapperboard,
  ExternalLink,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { db, handleFirestoreError, OperationType } from '@/src/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface LandingPageProps {
  onGetAccess: () => void;
}

export default function LandingPage({ onGetAccess }: LandingPageProps) {
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [countdown, setCountdown] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Countdown timer logic
  useEffect(() => {
    const target = new Date();
    target.setHours(target.getHours() + 4); // 4 hours from now

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = target.getTime() - now;

      if (distance < 0) {
        clearInterval(timer);
        return;
      }

      setCountdown({
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleReportSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmittingReport(true);
    const formData = new FormData(e.currentTarget);
    
    const reportData = {
      name: formData.get('name'),
      email: formData.get('email'),
      message: formData.get('message'),
      createdAt: serverTimestamp(),
      status: 'new'
    };

    try {
      console.log('Sending message to Firestore...', reportData);
      
      const writeTimeout = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('FIRESTORE_WRITE_TIMEOUT')), 30000);
      });

      await Promise.race([
        addDoc(collection(db, 'reports'), reportData),
        writeTimeout
      ]);

      toast.success('মেসেজ পাঠানো হয়েছে! আমরা দ্রুত যোগাযোগ করব।');
      (e.target as HTMLFormElement).reset();
    } catch (error: any) {
      console.error('Report submission error:', error);
      if (error.message === 'FIRESTORE_WRITE_TIMEOUT') {
        toast.error('সার্ভারের সাথে সংযোগ ধীর গতির। আবার চেষ্টা করুন।');
      } else {
        handleFirestoreError(error, OperationType.CREATE, 'reports');
        toast.error('মেসেজ পাঠাতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
      }
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const faqs = [
    {
      q: "এই ভিডিওগুলো কি কপিরাইট ফ্রি?",
      a: "হ্যাঁ, ৩০০০+ ভিডিওর এই বান্ডেলটি সম্পূর্ণ কপিরাইট ফ্রি। আপনি নির্দ্বিধায় ফেসবুক, ইউটিউব, টিকটক এবং ইন্সটাগ্রামে ব্যবহার করতে পারবেন।"
    },
    {
      q: "আমি কিভাবে ভিডিওগুলো ডাউনলোড করব?",
      a: "পেমেন্ট সম্পন্ন করার পর আপনার ইমেইলে একটি গুগল ড্রাইভ লিঙ্ক পাঠানো হবে। সেখান থেকে আপনি সরাসরি ডাউনলোড করতে পারবেন।"
    },
    {
      q: "রিফান্ড পলিসি কি?",
      a: "যেহেতু এটি একটি ডিজিটাল প্রোডাক্ট, তাই একবার লিঙ্ক পেয়ে গেলে রিফান্ড প্রযোজ্য নয়। তবে কোনো টেকনিক্যাল সমস্যা হলে আমাদের সাপোর্ট টিম আপনাকে সাহায্য করবে।"
    },
    {
      q: "আমি কি ভিডিওগুলো এডিট করতে পারব?",
      a: "অবশ্যই! আমরা সাথে ফ্রি CapCut Pro দিচ্ছি যাতে আপনি আপনার নিজের লোগো, টেক্সট এবং ব্র্যান্ডিং যুক্ত করতে পারেন।"
    }
  ];

  const testimonials = [
    { name: "রাকিব হাসান", feedback: "মাত্র ৭ দিনে আমার ফেসবুক পেজে ১০কে ফলোয়ার হয়েছে। ভিডিওগুলোর কোয়ালিটি দারুন!" },
    { name: "সুমাইয়া আক্তার", feedback: "আমি কোনো ভিডিও এডিটিং জানতাম না, কিন্তু এই গাইডলাইন আর ভিডিও দিয়ে খুব সহজেই শুরু করতে পেরেছি।" },
    { name: "ফয়সাল আহমেদ", feedback: "কপিরাইট নিয়ে আগে খুব ভয়ে থাকতাম, কিন্তু এখন নিশ্চিন্তে আপলোড করছি। ইনকামও শুরু হয়েছে!" }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 overflow-x-hidden pt-16 md:pt-20">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass h-16 md:h-20 flex items-center px-4 md:px-8 justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center text-white font-bold text-xl">S</div>
          <span className="font-black text-xl md:text-2xl tracking-tighter uppercase italic">Social Media Partner BD</span>
        </div>
        <Button onClick={onGetAccess} className="hidden md:flex gradient-bg hover:opacity-90 font-bold rounded-full px-6 glow-orange transition-all duration-300">
          এখনই শুরু করুন
        </Button>
      </header>

      {/* Hero Section */}
      <section className="relative py-12 md:py-24 px-4 md:px-8 flex flex-col items-center text-center max-w-7xl mx-auto overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full"
        >
          <h1 className="sr-only">Social Media Partner BD</h1>
          <Badge className="mb-4 bg-orange-100 text-orange-600 border-none px-4 py-1 font-bold animate-pulse">
            🔥 স্পেশাল অফার সীমিত সময়ের জন্য
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-7xl font-black mb-8 leading-[1.5] md:leading-[1.2] tracking-tight text-slate-900">
            <span className="gradient-text">৩০০০+ ভাইরাল এআই ভিডিও</span> <br className="block md:hidden" /> দিয়ে <span className="underline decoration-purple-500 underline-offset-8">Online Income</span> শুরু করুন 🚀
          </h2>
          <p className="text-lg md:text-2xl text-slate-600 mb-10 max-w-3xl mx-auto font-medium leading-[1.5]">
            Social Media Partner BD দিচ্ছে সঠিক গাইডলাইন। ভিডিও বানাতে হবে না, শুধু রেডি ক্লিপস আপলোড করুন আর Views, Followers & Income বাড়ান!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button size="lg" onClick={onGetAccess} className="w-full sm:w-auto h-16 px-10 text-xl font-bold rounded-full gradient-bg glow-orange transition-all hover:scale-105 active:scale-95 group">
              এখনই কিনুন
              <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => document.getElementById('preview')?.scrollIntoView({ behavior: 'smooth' })} className="w-full sm:w-auto h-16 px-10 text-xl font-bold rounded-full border-2 border-slate-200">
              প্রিভিউ দেখুন
            </Button>
          </div>

          <div className="flex items-center justify-center gap-2 text-slate-500 font-semibold text-sm md:text-base">
            <Gift className="w-5 h-5 text-purple-500" />
            🎁 <span className="text-purple-600 font-bold">FREE CapCut Pro</span> দিয়ে নিজের ব্র্যান্ডিংও যোগ করতে পারবেন!
          </div>
        </motion.div>

        {/* Video Preview Overlay */}
        <motion.div 
          id="preview"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mt-16 w-full max-w-4xl relative group"
        >
          <div className="absolute -inset-1 bg-linear-to-r from-orange-400 to-purple-500 rounded-[2.5rem] blur opacity-25 group-hover:opacity-100 transition duration-1000"></div>
          <div className="relative aspect-video rounded-[2rem] overflow-hidden bg-slate-900 shadow-2xl">
            {/* TikTok Embed */}
            <iframe 
              src="https://www.tiktok.com/embed/v2/7610811895506898206"
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
            
            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between pointer-events-none">
              <div className="glass px-4 py-2 rounded-full flex items-center gap-2 text-slate-800">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-widest text-white">VIRAL PREVIEW</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Trust Badges */}
      <section className="py-12 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { icon: Video, label: "3000+ Videos", color: "text-orange-500" },
            { icon: ShieldCheck, label: "Copyright Free", color: "text-emerald-500" },
            { icon: Download, label: "Instant Download", color: "text-blue-500" },
            { icon: Users, label: "Beginner Friendly", color: "text-purple-500" },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center gap-3 text-center">
              <div className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-slate-50 flex items-center justify-center ${item.color} shadow-sm`}>
                <item.icon className="w-6 h-6 md:w-8 md:h-8" />
              </div>
              <span className="font-bold text-slate-700 text-sm md:text-lg">{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Problem Solution */}
      <section className="py-20 px-4 md:px-8 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h2 className="text-3xl md:text-5xl font-black leading-[1.4] md:leading-tight italic transform -skew-x-2 tracking-tight">
              ভিডিও বানাতে পারেন না? <br/>
              <span className="text-orange-400">ভাইরাল হওয়া কি কঠিন মনে হচ্ছে?</span>
            </h2>
            <div className="space-y-4">
              {["ভিডিও বানানোর সময় নেই?", "ক্যামেরা শাইনেস বা জড়তা আছে?", "সঠিক এডিটিং জানেন না?", "কপিরাইটের ভয়ে ভিডিও দিতে পারেন না?"].map((text, i) => (
                <div key={i} className="flex gap-4 items-center">
                  <div className="w-6 h-6 rounded-full bg-rose-500/20 border border-rose-500/50 flex items-center justify-center shrink-0">
                    <Minus className="w-4 h-4 text-rose-500" />
                  </div>
                  <p className="text-slate-400 font-medium text-lg">{text}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="glass-dark p-10 rounded-[2.5rem] space-y-8 border-orange-500/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-3xl -mr-16 -mt-16 group-hover:bg-orange-500/20 transition-all" />
            <h3 className="text-2xl md:text-3xl font-black text-orange-400 uppercase tracking-tight italic leading-[1.6]">আমরা সব READY <br className="block md:hidden"/> করে দিয়েছি! 🚀</h3>
            <p className="text-slate-300 text-lg leading-relaxed font-medium">
              আপনার আর ভিডিও বানানোর টেনশন নেই। আমরা আপনাকে দিচ্ছি হাই-কোয়ালিটি, ভাইরাল ক্লিপস আর গাইডলাইন। আপনি শুধু আপলোড করবেন আর রেজাল্ট দেখবেন!
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col gap-2">
                <Zap className="text-orange-500 w-8 h-8" />
                <span className="font-bold">Instant Growth</span>
              </div>
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col gap-2">
                <CheckCircle2 className="text-emerald-500 w-8 h-8" />
                <span className="font-bold">Ready to Use</span>
              </div>
            </div>
            <Button onClick={onGetAccess} className="w-full h-14 rounded-2xl gradient-bg font-bold text-lg shadow-lg">এখনই শুরু করুন</Button>
          </div>
        </div>
      </section>

      {/* What You Get */}
      <section className="py-24 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black mb-6 tracking-tight leading-[1.4]">এই বান্ডেলে যা যা থাকছে... 🍱</h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-sm leading-[1.5]">সম্পূর্ণ প্যাকেজ আপনার অনলাইন জার্নির জন্য</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { title: "৩০০০+ এআই ফুড ভিডিও", desc: "সেরা কোয়ালিটির টকিং এআই ভিডিও যা দর্শকদের দৃষ্টি আকর্ষণ করবে।", icon: Clapperboard },
            { title: "১০০% কপিরাইট ফ্রি", desc: "কোনো ভয় নেই! স্ট্রাইক বা কপিরাইট ক্লেম ছাড়াই ব্যবহার করুন সব প্ল্যাটফর্মে।", icon: ShieldCheck },
            { title: "ভাইরাল গাইডলাইন", desc: "কিভাবে ভিডিও আপলোড করলে দ্রুত ভাইরাল হবেন তার বিস্তারিত টিউটোরিয়াল।", icon: Star },
            { title: "সকল প্ল্যাটফর্মের জন্য", desc: "Facebook, YouTube, TikTok, Instagram সবগুলোর জন্য রেডি কন্টেন্ট।", icon: Facebook },
            { title: "ভবিষ্যত আপডেট", desc: "নতুন সব ভিডিও এবং টিপস পাবেন একদম ফ্রি আপডেট হিসেবে।", icon: Zap },
            { title: "লাইফটাইম অ্যাক্সেস", desc: "একবার কিনলে আজীবন এই কন্টেন্টগুলো ব্যবহার করতে পারবেন।", icon: Clock },
          ].map((item, i) => (
            <Card key={i} className="p-8 rounded-[2rem] border-none shadow-sm hover:shadow-xl transition-all duration-500 group">
              <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <item.icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-800 tracking-tight">{item.title}</h3>
              <p className="text-slate-500 font-medium leading-relaxed">{item.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* SEO Content Section: Online Income Guide */}
      <section className="py-24 px-4 md:px-8 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1 relative">
              <div className="absolute -inset-4 bg-orange-500/10 blur-3xl rounded-full" />
              <img 
                src="https://i.ytimg.com/vi/g_ZXd-pR67w/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLCtAum01iM3_0PyngCvTVDLVy-h2A" 
                alt="online income bangladesh guide - Social Media Partner BD" 
                className="relative rounded-[2.5rem] shadow-2xl transform md:-rotate-2 hover:rotate-0 transition-transform duration-500 w-full h-auto object-cover"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="order-1 md:order-2 space-y-8">
              <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-[1.4] md:leading-tight italic transform -skew-x-2">
                কিভাবে <span className="text-orange-500">Facebook Reels</span> থেকে ইনকাম করবেন? 💰
              </h2>
              <div className="prose prose-lg text-slate-600 font-medium leading-relaxed">
                <p className="mb-4">
                  বর্তমানে বাংলাদেশে <strong>Online Income Bangladesh</strong> এর অন্যতম জনপ্রিয় মাধ্যম হলো ফেসবুক রিলস। কিন্তু অনেকেই ভিডিও বানাতে পারেন না বা সঠিক কন্টেন্ট খুঁজে পান না। <strong>Social Media Partner BD</strong> আপনাদের জন্য নিয়ে এসেছে ৩০০০+ ভাইরাল এআই ভিডিও বান্ডেল যা দিয়ে আপনি সহজেই <strong>earn money from Facebook reels</strong> শুরু করতে পারেন।
                </p>
                <div className="grid gap-4 mt-6">
                  {[
                    "ইউনিক এআই ভিডিও ক্লিপস ব্যবহার করুন",
                    "ফ্রী CapCut Pro দিয়ে কাস্টম এডিট করুন",
                    "আমাদের ভাইরাল গাইডলাইন ফলো করুন",
                    "রেগুলার ৩-৪টি শর্ট ভিডিও আপলোড দিন"
                  ].map((text, i) => (
                    <div key={i} className="flex gap-3 items-center bg-slate-50 p-4 rounded-xl border border-slate-100 italic font-bold">
                      <Check className="w-5 h-5 text-orange-500" />
                      <span>{text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEO Content Section: AI Video Content */}
      <section className="py-24 px-4 md:px-8 bg-slate-50">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-3xl md:text-5xl font-black tracking-tight italic leading-[1.4] md:leading-tight">কেন বেছে নেবেন <span className="gradient-text">Social Media Partner BD</span>-কে? 🚀</h2>
          <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-xl space-y-6 text-left">
            <h3 className="text-2xl font-bold text-slate-800 leading-[1.4]">Online Earning Without Skill - এটি সম্ভব!</h3>
            <p className="text-slate-600 leading-[1.6] font-medium">
              আমরা জানি নতুনরা ভিডিও এডিটিং বা কন্টেন্ট ক্রিয়েশনে কতটা সমস্যার মুখে পড়েন। তাই আমাদের <strong>AI video content pack</strong> এমনভাবে ডিজাইন করা হয়েছে যাতে কোনো পূর্ব অভিজ্ঞতা ছাড়াই আপনি প্রফেশনাল লেভেলের কন্টেন্ট তৈরি করতে পারেন। এটি কেবল একটি ভিডিও বান্ডেল নয়, এটি আপনার ডিজিটাল ক্যারিয়ারের ফাউন্ডেশন।
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-6 bg-orange-50 rounded-2xl border border-orange-100">
                <h4 className="font-bold text-orange-600 mb-2">Passive Income BD</h4>
                <p className="text-xs text-slate-500">একবার সেটআপ করুন, আর ভিডিওগুলি থেকে আসতে থাকবে নিয়মিত পেজ ভিউ ও ফলোয়ার্স।</p>
              </div>
              <div className="p-6 bg-purple-50 rounded-2xl border border-purple-100">
                <h4 className="font-bold text-purple-600 mb-2">Faceless Video Content</h4>
                <p className="text-xs text-slate-500">চেহারা না দেখিয়েই ইউটিউব শর্টস বা ফেসবুক রিলস থেকে আয় করার সেরা সুযোগ।</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="py-24 relative overflow-hidden px-4 md:px-8">
        <div className="absolute inset-0 gradient-bg opacity-[0.03]" />
        <div className="max-w-5xl mx-auto glass rounded-[3rem] p-10 md:p-20 relative border-purple-200">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <Badge className="bg-purple-100 text-purple-600 font-bold px-4 py-1">🎁 এক্সক্লুসিভ বোনাস</Badge>
              <h2 className="text-3xl md:text-6xl font-black tracking-tight leading-[1.3] md:leading-none italic uppercase transform -skew-x-2">
                🎬 এডিট করুন <br/> নিজের মতো করে!
              </h2>
              <p className="text-lg text-slate-600 font-medium leading-[1.5]">
                আমরা শুধু ভিডিও দিচ্ছি না, সাথে দিচ্ছি <span className="text-purple-600 font-black">CapCut Pro access</span> যাতে আপনি নিজের লোগো, টেক্সট এবং ব্র্যান্ডিং যুক্ত করতে পারেন।
              </p>
              <div className="space-y-4">
                {["নিজের লোগো অ্যাড করুন", "ক্যাপশন বা টেক্সট লিখুন", "ব্যাকগ্রাউন্ড মিউজিক চেঞ্জ করুন", "প্রফেশনাল ফিল্টার ব্যবহার করুন"].map((text, i) => (
                  <div key={i} className="flex gap-3 items-center">
                    <CheckCircle2 className="w-5 h-5 text-purple-500" />
                    <span className="font-bold text-slate-700">{text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-purple-500/20 blur-3xl rounded-full" />
              <img 
                src="https://i.ytimg.com/vi/VQepdeKlV14/maxresdefault.jpg" 
                alt="CapCut Pro free access with social media partner bd ai video pack" 
                className="relative rounded-3xl shadow-2xl skew-y-3 w-full h-auto object-cover"
                referrerPolicy="no-referrer"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Platforms */}
      <section className="py-24 bg-white px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-center gap-6 md:gap-12 opacity-50 grayscale hover:grayscale-0 transition-all">
          <div className="flex items-center gap-3 font-black text-2xl text-slate-900"><Facebook className="w-8 h-8"/> Facebook Reels</div>
          <div className="flex items-center gap-3 font-black text-2xl text-slate-900"><Video className="w-8 h-8"/> TikTok</div>
          <div className="flex items-center gap-3 font-black text-2xl text-slate-900"><Clapperboard className="w-8 h-8"/> YouTube Shorts</div>
          <div className="flex items-center gap-3 font-black text-2xl text-slate-900"><Instagram className="w-8 h-8"/> Instagram Reels</div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tight text-slate-900 leading-[1.4]">কিভাবে শুরু করবেন? 🛠️</h2>
        </div>
        <div className="relative grid md:grid-cols-4 gap-8">
          <div className="hidden md:block absolute top-[4.5rem] left-12 right-12 h-0.5 bg-slate-100 -z-10" />
          {[
            { t: "ডাউনলোড করুন", d: "ইমেইল থেকে ভিডিও লিঙ্ক পেয়ে সাথে সাথে ডাউনলোড করুন।", icon: Download },
            { t: "এডিট করুন", d: "CapCut Pro দিয়ে লোগো ও টেক্সট যুক্ত করুন (অপশনাল)।", icon: Clapperboard },
            { t: "আপলোড করুন", d: "আপনার সোশ্যাল মিডিয়া পেজে ভিডিওটি শেয়ার করুন।", icon: Facebook },
            { t: "আয় শুরু করুন", d: "ভিউস বাড়লে মনিটাইজেশন বা প্রমোশন থেকে আয় শুরু করুন।", icon: Zap },
          ].map((step, i) => (
            <div key={i} className="flex flex-col items-center text-center group">
              <div className="w-20 h-20 rounded-full glass border-2 border-slate-100 flex items-center justify-center mb-6 group-hover:bg-orange-500 group-hover:text-white transition-all duration-500 shadow-lg text-slate-600">
                <step.icon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2 tracking-tight text-slate-900">{step.t}</h3>
              <p className="text-slate-500 text-sm font-medium">{step.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-4 md:px-8 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-orange-500/10 blur-[120px] rounded-full -z-10" />
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-6 bg-orange-500 text-white font-bold h-8 px-6 text-sm border-none">LIMITED TIME OFFER ⌛</Badge>
          <h2 className="text-3xl md:text-6xl font-black mb-12 tracking-tight italic transform -skew-x-2 leading-[1.4] md:leading-tight">আজই শুরু করুন আপনার <br/> <span className="text-orange-400">Online Income Journey 🚀</span></h2>
          
          <Card className="glass-dark border-orange-500/30 p-10 md:p-16 rounded-[3rem] relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-orange-500 text-white font-black text-xs px-12 py-2 rotate-45 translate-x-10 translate-y-3 shadow-lg">৭৫% ছাড়!</div>
            
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-12">
              <div className="text-slate-400 text-2xl font-bold line-through">৳৫০০</div>
              <div className="flex flex-col">
                <div className="text-6xl md:text-9xl font-black text-white italic transform -skew-x-3 tracking-tighter drop-shadow-[0_10px_30px_rgba(249,115,22,0.4)]">৳১০০</div>
                <span className="text-orange-400 font-bold uppercase tracking-widest text-sm mt-2">এককালীন পেমেন্ট | আজীবন মেয়াদ</span>
              </div>
            </div>

            {/* Countdown */}
            <div className="flex gap-4 justify-center mb-12">
              {[
                { label: "Hours", value: countdown.hours },
                { label: "Mins", value: countdown.minutes },
                { label: "Secs", value: countdown.seconds }
              ].map((c, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <div className="w-16 md:w-20 h-16 md:h-20 glass-dark rounded-2xl flex items-center justify-center text-2xl md:text-4xl font-black text-orange-400">
                    {c.value.toString().padStart(2, '0')}
                  </div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">{c.label}</span>
                </div>
              ))}
            </div>

            <Button onClick={onGetAccess} size="lg" className="h-16 md:h-20 w-full text-2xl font-black rounded-3xl gradient-bg glow-orange transition-all hover:scale-105 active:scale-95 shadow-2xl">
              এখনই কিনুন
              <ArrowRight className="ml-3 w-8 h-8 text-white" />
            </Button>
            
            <p className="mt-8 text-slate-400 font-bold flex items-center justify-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              পেমেন্ট করার পর আপনার Email-এ Google Drive link পাঠানো হবে
            </p>
          </Card>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black mb-4 tracking-tight uppercase italic transform -skew-x-2 text-slate-900 leading-[1.4]">আমাদের সাকসেসফুল মেম্বাররা যা বলছেন ✨</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative group hover:border-orange-200 transition-colors">
              <div className="flex gap-1 mb-4">
                {[1,2,3,4,5].map(star => <Star key={star} className="w-4 h-4 text-orange-400 fill-orange-400" />)}
              </div>
              <p className="text-slate-600 font-medium text-lg leading-relaxed mb-6 italic">"{t.feedback}"</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-400">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{t.name}</h4>
                  <span className="text-xs font-bold text-emerald-500">Verified Buyer</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQs */}
      <section className="py-24 px-4 md:px-8 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black mb-12 text-center tracking-tight italic transform -skew-x-2 uppercase text-slate-900 leading-[1.4]">সাধারণ জিজ্ঞাসা 🤔</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="border-2 border-slate-100 rounded-2xl overflow-hidden hover:border-slate-200 transition-colors">
                <button 
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full px-8 py-6 flex items-center justify-between text-left group"
                >
                  <span className="font-bold text-lg text-slate-800">{faq.q}</span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${activeFaq === i ? 'bg-orange-500 text-white rotate-45' : 'bg-slate-50 text-slate-400'}`}>
                    <Plus className="w-5 h-5" />
                  </div>
                </button>
                <AnimatePresence>
                  {activeFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-8 pb-6 text-slate-500 font-medium leading-relaxed"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enquiry Form */}
      <section id="enquiry" className="py-24 px-4 md:px-8 relative overflow-hidden bg-slate-50">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl md:text-6xl font-black tracking-tight leading-[1.3] md:leading-none italic uppercase transform -skew-x-2 text-slate-900">
              কোনো প্রশ্ন আছে? <br/> <span className="text-orange-500">মেসেজ দিন!</span>
            </h2>
            <p className="text-lg text-slate-600 font-medium leading-[1.5]">
              আপনার যদি কোনো কিছু জানার থাকে বা পেমেন্ট নিয়ে সমস্যা হয়, তবে নিচের ফর্মে লিখে পাঠান। আমাদের টিম দ্রুত আপনার সাথে যোগাযোগ করবে।
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-emerald-600">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                <span className="font-black uppercase tracking-widest text-xs">Support: Online</span>
              </div>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Typical Response: 15-30 Minutes</p>
            </div>
          </div>
          <Card className="p-8 md:p-10 rounded-[3rem] border-none shadow-2xl relative bg-white">
            <form onSubmit={handleReportSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">আপনার নাম</label>
                <input name="name" required placeholder="নাম লিখুন" className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-hidden font-bold transition-all text-slate-900" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">ইমেইল</label>
                <input name="email" type="email" required placeholder="email@example.com" className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-hidden font-bold transition-all text-slate-900" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">মেসেজ</label>
                <textarea name="message" required placeholder="আপনার প্রশ্নটি লিখুন..." rows={4} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-6 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-hidden font-bold transition-all resize-none text-slate-900" />
              </div>
              <Button type="submit" disabled={isSubmittingReport} className="w-full h-16 rounded-2xl gradient-bg font-black text-white text-lg shadow-xl shadow-orange-500/20 active:scale-95 transition-all">
                {isSubmittingReport ? <Loader2 className="w-6 h-6 animate-spin" /> : 'মেসেজ পাঠান'}
              </Button>
            </form>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-900 text-white/40 text-center px-4">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center text-white font-bold text-sm">S</div>
          <span className="font-black text-lg tracking-tighter uppercase italic text-white/90">Social Media Partner BD</span>
        </div>
        <p className="font-bold text-xs uppercase tracking-[0.2em] mb-4">© 2026 Social Media Partner BD. All Rights Reserved.</p>
        <p className="max-w-lg mx-auto text-xs leading-relaxed">
          The ultimate digital bundle for creators in Bangladesh. Grow your social presence with copyright-free AI content. Best online income platform in BD.
        </p>
      </footer>

      {/* Sticky CTA (Mobile Only) */}
      <div className="fixed bottom-0 left-0 right-0 p-4 md:hidden z-40 bg-white/10 backdrop-blur-lg border-t border-white/20">
        <Button onClick={onGetAccess} className="w-full h-16 rounded-2xl gradient-bg font-black text-white text-xl shadow-[0_0_30px_rgba(249,115,22,0.4)] active:scale-95">
          এখনই কিনুন - ৳১০০
        </Button>
      </div>

      {/* Floating WhatsApp */}
      <a 
        href="https://wa.me/8801991579084" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-24 right-6 md:bottom-8 md:right-8 w-16 h-16 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform z-40 group"
      >
        <MessageCircle className="w-9 h-9" />
        <span className="absolute right-full mr-4 glass-dark text-white px-4 py-2 rounded-xl text-[10px] font-black opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">সাপোর্ট প্রয়োজন?</span>
      </a>
    </div>
  );
}
