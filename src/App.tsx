/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import { 
  MousePointer2, 
  Monitor, 
  Cpu, 
  DollarSign, 
  TrendingUp, 
  Mail, 
  Phone, 
  MapPin, 
  ChevronRight,
  Menu,
  X,
  Zap,
  BrainCircuit,
  Briefcase,
  Globe,
  Award,
  ChevronDown,
  Laptop,
  Code,
  Sparkles,
  Database,
  Search,
  Plus,
  Trash2,
  LogOut,
  User as UserIcon,
  ShieldCheck,
  AlertCircle,
  CreditCard,
  Landmark,
  Wallet,
  BookOpen,
  Video,
  Image as ImageIcon,
  Wrench,
  Languages,
  Newspaper
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  query, 
  orderBy, 
  where,
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  Timestamp,
  handleFirestoreError,
  OperationType,
  User
} from './firebase';

// Types
interface Post {
  id: string;
  title: string;
  content: string;
  authorUid: string;
  authorName?: string;
  category: 'Tech' | 'AI' | 'Hustle' | 'Platforms';
  createdAt: any;
}

interface UserProfile {
  uid: string;
  email: string;
  role: 'admin' | 'user';
  displayName?: string;
}

interface BankAccount {
  id: string;
  uid: string;
  bankName: string;
  accountNumber: string;
  routingNumber: string;
  accountHolderName: string;
  createdAt: any;
}

interface Tutorial {
  id: string;
  title: string;
  description: string;
  videoUrl?: string;
  imageUrl?: string;
  steps: string[];
  category: string;
  createdAt: any;
}

interface ToolItem {
  id: string;
  name: string;
  description: string;
  url: string;
  category: string;
  icon?: string;
}

type Language = 'en' | 'om' | 'am';

const TRANSLATIONS = {
  en: {
    home: "Home",
    tech: "Tech",
    platforms: "Platforms",
    aiTools: "AI Tools",
    team: "Team",
    about: "About",
    guide: "Guide",
    contact: "Contact",
    latestUpdates: "Latest Updates",
    educationalHub: "Educational Hub",
    toolsDirectory: "Tools Directory",
    newsletter: "Stay Updated",
    subscribe: "Subscribe",
    tutorials: "Tutorials",
    stepByStep: "Step-by-Step Guide",
    watchVideo: "Watch Video",
    viewImage: "View Image",
    allTools: "All Tools",
    categories: "Categories",
    heroTitle: "Master the Digital Era with",
    heroSubtitle: "Your ultimate gateway to computer mastery, AI earning strategies, and professional software platforms.",
    getStarted: "Get Started",
    learnMore: "Learn More",
    adminDashboard: "Admin Dashboard",
    billing: "Billing & Payouts",
    logout: "Logout",
    login: "Login"
  },
  om: {
    home: "Mana",
    tech: "Teek",
    platforms: "Pilaatfoormii",
    aiTools: "Meeshaalee AI",
    team: "Garee",
    about: "Waa'ee",
    guide: "Qajeelfama",
    contact: "Quunnamtii",
    latestUpdates: "Oduu Haaraa",
    educationalHub: "Giddu-gala Barnootaa",
    toolsDirectory: "Tarree Meeshaalee",
    newsletter: "Haaraa Ta'i",
    subscribe: "Galmaa'i",
    tutorials: "Tutooriyaalii",
    stepByStep: "Qajeelfama Tarkaanfii",
    watchVideo: "Viidiyoo Ilaali",
    viewImage: "Fakkii Ilaali",
    allTools: "Meeshaalee Hunda",
    categories: "Ramaddii",
    heroTitle: "Bara Diijitaalaa kana To'adhu",
    heroSubtitle: "Karra kee isa dhumaa ogummaa kompiitaraa, tarsiimoo galii AI, fi pilaatfoormii sooftiweerii ogummaa.",
    getStarted: "Eegali",
    learnMore: "Dabalata Bari",
    adminDashboard: "Dabshiboordii Admin",
    billing: "Kaffaltii",
    logout: "Ba'i",
    login: "Seeni"
  },
  am: {
    home: "መነሻ",
    tech: "ቴክኖሎጂ",
    platforms: "ፕላትፎርሞች",
    aiTools: "የAI መሣሪያዎች",
    team: "ቡድን",
    about: "ስለ እኛ",
    guide: "መመሪያ",
    contact: "እውቂያ",
    latestUpdates: "የቅርብ ጊዜ ዜናዎች",
    educationalHub: "የትምህርት ማዕከል",
    toolsDirectory: "የመሣሪያዎች ዝርዝር",
    newsletter: "ሁልጊዜ አዳዲስ መረጃዎችን ያግኙ",
    subscribe: "ይመዝገቡ",
    tutorials: "ትምህርቶች",
    stepByStep: "ደረጃ በደረጃ መመሪያ",
    watchVideo: "ቪዲዮ ይመልከቱ",
    viewImage: "ምስል ይመልከቱ",
    allTools: "ሁሉም መሣሪያዎች",
    categories: "ምድቦች",
    heroTitle: "የዲጂታል ዘመንን ይቆጣጠሩ",
    heroSubtitle: "ለኮምፒዩተር ክህሎት፣ ለAI ገቢ ስልቶች እና ለሙያዊ ሶፍትዌር ፕላትፎርሞች የመጨረሻው መግቢያዎ።",
    getStarted: "ይጀምሩ",
    learnMore: "ተጨማሪ ይወቁ",
    adminDashboard: "የአስተዳዳሪ ዳሽቦርድ",
    billing: "ክፍያ",
    logout: "ይውጡ",
    login: "ይግቡ"
  }
};


// Error Boundary removed due to persistent TypeScript issues in this environment

const NavLink = ({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) => (
  <a 
    href={href} 
    onClick={onClick}
    className="text-gray-300 hover:text-emerald-500 font-semibold transition-colors duration-200 px-4 py-2"
  >
    {children}
  </a>
);

const DropdownLink = ({ href, children, icon: Icon, onClick }: { href: string; children: React.ReactNode; icon: any; onClick: () => void }) => (
  <a 
    href={href} 
    onClick={onClick}
    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:text-emerald-500 hover:bg-emerald-500/5 transition-all rounded-lg"
  >
    <Icon className="w-4 h-4" />
    {children}
  </a>
);

const PlatformCard = ({ title, description, icon: Icon, tags }: { title: string; description: string; icon: any; tags: string[] }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl shadow-xl backdrop-blur-sm"
  >
    <div className="bg-emerald-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
      <Icon className="text-emerald-500 w-6 h-6" />
    </div>
    <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
    <p className="text-gray-400 leading-relaxed mb-4">{description}</p>
    <div className="flex flex-wrap gap-2">
      {tags.map(tag => (
        <span key={tag} className="text-[10px] font-black uppercase tracking-widest bg-zinc-800 text-zinc-400 px-2 py-1 rounded">
          {tag}
        </span>
      ))}
    </div>
  </motion.div>
);

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isBillingOpen, setIsBillingOpen] = useState(false);
  const [selectedToolCategory, setSelectedToolCategory] = useState('All');
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [tools, setTools] = useState<ToolItem[]>([]);
  const [language, setLanguage] = useState<Language>('en');
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [newsletterSubscriptions, setNewsletterSubscriptions] = useState<any[]>([]);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isTechOpen, setIsTechOpen] = useState(false);
  const [recommendation, setRecommendation] = useState<{ tool: string; desc: string } | null>(null);
  const [selectedSkill, setSelectedSkill] = useState("");
  const techDropdownRef = useRef<HTMLDivElement>(null);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            setUserProfile(userDoc.data() as UserProfile);
          } else {
            // Create profile for new user
            const isDefaultAdmin = currentUser.email === "ictmajlisaoromiyaa@gmail.com";
            const newProfile: UserProfile = {
              uid: currentUser.uid,
              email: currentUser.email || '',
              role: isDefaultAdmin ? 'admin' : 'user',
              displayName: currentUser.displayName || undefined
            };
            await setDoc(doc(db, 'users', currentUser.uid), {
              ...newProfile,
              createdAt: Timestamp.now()
            });
            setUserProfile(newProfile);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${currentUser.uid}`);
        }
      } else {
        setUserProfile(null);
      }
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Posts Listener
  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedPosts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Post[];
      setPosts(fetchedPosts);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'posts');
    });
    return () => unsubscribe();
  }, []);

  // Users Listener (Admins see all, public see admins)
  useEffect(() => {
    let q;
    if (userProfile?.role === 'admin') {
      q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    } else {
      q = query(collection(db, 'users'), where('role', '==', 'admin'), orderBy('createdAt', 'desc'));
    }
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedUsers = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      })) as UserProfile[];
      setAllUsers(fetchedUsers);
    }, (error) => {
      // Silently fail for public if they can't read yet
      if (userProfile?.role === 'admin') {
        handleFirestoreError(error, OperationType.LIST, 'users');
      }
    });
    return () => unsubscribe();
  }, [userProfile]);

  // Bank Accounts Listener (Owner only)
  useEffect(() => {
    if (!user) {
      setBankAccounts([]);
      return;
    }
    const q = query(collection(db, 'bankAccounts'), where('uid', '==', user.uid), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedAccounts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as BankAccount[];
      setBankAccounts(fetchedAccounts);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'bankAccounts');
    });
    return () => unsubscribe();
  }, [user]);

  // Tutorials Listener
  useEffect(() => {
    const q = query(collection(db, 'tutorials'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Tutorial[];
      setTutorials(fetched);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'tutorials');
    });
    return () => unsubscribe();
  }, []);

  // Tools Listener
  useEffect(() => {
    const q = query(collection(db, 'tools'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ToolItem[];
      setTools(fetched);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'tools');
    });
    return () => unsubscribe();
  }, []);

  // Newsletter Subscriptions Listener (Admin only)
  useEffect(() => {
    if (userProfile?.role !== 'admin') {
      setNewsletterSubscriptions([]);
      return;
    }
    const q = query(collection(db, 'newsletter'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setNewsletterSubscriptions(fetched);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'newsletter');
    });
    return () => unsubscribe();
  }, [userProfile]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleNewsletterSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setIsSubscribing(true);
    try {
      await addDoc(collection(db, 'newsletter'), {
        email: newsletterEmail,
        subscribedAt: Timestamp.now()
      });
      setNewsletterEmail("");
      alert("Subscribed successfully!");
    } catch (error) {
      console.error("Newsletter error:", error);
    } finally {
      setIsSubscribing(false);
    }
  };

  const skills = [
    { id: "writing", label: "Writing", tool: "Jasper AI", desc: "Perfect for high-speed content generation and copywriting." },
    { id: "coding", label: "Coding", tool: "GitHub Copilot", desc: "Accelerate your development workflow with AI-powered suggestions." },
    { id: "design", label: "Design", tool: "Midjourney", desc: "Generate stunning visuals and UI assets from text prompts." },
    { id: "data", label: "Data Analysis", tool: "ChatGPT Plus", desc: "Analyze complex datasets and generate insights in seconds." },
  ];

  const handleRecommend = () => {
    const skill = skills.find(s => s.id === selectedSkill);
    if (skill) {
      setRecommendation({ tool: skill.tool, desc: skill.desc });
    }
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (techDropdownRef.current && !techDropdownRef.current.contains(event.target as Node)) {
        setIsTechOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const t = TRANSLATIONS[language];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-emerald-500 selection:text-white relative">
      {/* Global Background Image */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-5">
        <img 
          src="https://images.pexels.com/photos/3521937/pexels-photo-3521937.jpeg?auto=compress&cs=tinysrgb&w=1920" 
          alt="Global Background" 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>
      <div className="relative z-10">
        {/* Header & Navigation */}
      <header className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-2">
              <MousePointer2 className="text-emerald-500 w-8 h-8" />
              <h1 className="text-2xl font-black tracking-tighter uppercase italic">
                Click<span className="text-emerald-500">Computer</span>
              </h1>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center space-x-2">
              <NavLink href="#home">{t.home}</NavLink>
              
              {/* Tech Dropdown */}
              <div className="relative" ref={techDropdownRef}>
                <button 
                  onClick={() => setIsTechOpen(!isTechOpen)}
                  className="flex items-center gap-1 text-gray-300 hover:text-emerald-500 font-semibold transition-colors duration-200 px-4 py-2"
                >
                  {t.tech} <ChevronDown className={`w-4 h-4 transition-transform ${isTechOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {isTechOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden py-2"
                    >
                      <DropdownLink href="#computer" icon={Monitor} onClick={() => setIsTechOpen(false)}>Computer</DropdownLink>
                      <DropdownLink href="#laptop" icon={Laptop} onClick={() => setIsTechOpen(false)}>Laptop</DropdownLink>
                      <DropdownLink href="#software" icon={Code} onClick={() => setIsTechOpen(false)}>Software</DropdownLink>
                      <DropdownLink href="#technology" icon={Database} onClick={() => setIsTechOpen(false)}>Technology</DropdownLink>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <NavLink href="#platforms">{t.platforms}</NavLink>
              <NavLink href="#ai">{t.aiTools}</NavLink>
              <NavLink href="#tutorials">{t.tutorials}</NavLink>
              <NavLink href="#tools">{t.allTools}</NavLink>
              <NavLink href="#team">{t.team}</NavLink>
              <NavLink href="#about">{t.about}</NavLink>
              <NavLink href="#contact">{t.contact}</NavLink>
              
              <div className="flex items-center gap-4 ml-4">
                {/* Language Switcher */}
                <div className="flex items-center gap-1 bg-zinc-800/50 rounded-full p-1 border border-zinc-700">
                  {(['en', 'om', 'am'] as Language[]).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setLanguage(lang)}
                      className={`px-2 py-1 rounded-full text-[10px] font-black uppercase transition-all ${language === lang ? 'bg-emerald-500 text-black' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>

                {isAuthReady && (
                  <>
                    {user ? (
                      <div className="flex items-center gap-3">
                        {userProfile?.role === 'admin' && (
                          <button 
                            onClick={() => setIsAdminPanelOpen(true)}
                            className="bg-zinc-800 hover:bg-zinc-700 text-white p-2.5 rounded-full transition-all"
                            title={t.adminDashboard}
                          >
                            <ShieldCheck className="w-5 h-5 text-emerald-500" />
                          </button>
                        )}
                        <button 
                          onClick={() => setIsBillingOpen(true)}
                          className="bg-zinc-800 hover:bg-zinc-700 text-white p-2.5 rounded-full transition-all"
                          title={t.billing}
                        >
                          <Wallet className="w-5 h-5 text-emerald-500" />
                        </button>
                        <button 
                          onClick={handleLogout}
                          className="bg-zinc-800 hover:bg-zinc-700 text-white p-2.5 rounded-full transition-all"
                          title={t.logout}
                        >
                          <LogOut className="w-5 h-5" />
                        </button>
                        <div className="w-10 h-10 rounded-full border-2 border-emerald-500 overflow-hidden">
                          <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} alt="User" className="w-full h-full object-cover" />
                        </div>
                      </div>
                    ) : (
                      <button 
                        onClick={handleLogin}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-full font-bold transition-all flex items-center gap-2"
                      >
                        <UserIcon className="w-4 h-4" />
                        {t.login}
                      </button>
                    )}
                  </>
                )}
              </div>
            </nav>

            {/* Mobile Menu Button */}
            <button className="md:hidden p-2 text-gray-400" onClick={toggleMenu}>
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-zinc-900 border-b border-zinc-800 overflow-hidden"
            >
              <div className="flex flex-col p-4 space-y-2">
                <NavLink href="#home" onClick={toggleMenu}>{t.home}</NavLink>
                <div className="px-4 py-2">
                  <span className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-2 block">{t.tech}</span>
                  <div className="flex flex-col gap-1 pl-4 border-l border-zinc-800">
                    <NavLink href="#computer" onClick={toggleMenu}>Computer</NavLink>
                    <NavLink href="#laptop" onClick={toggleMenu}>Laptop</NavLink>
                    <NavLink href="#software" onClick={toggleMenu}>Software</NavLink>
                    <NavLink href="#technology" onClick={toggleMenu}>Technology</NavLink>
                  </div>
                </div>
                <NavLink href="#platforms" onClick={toggleMenu}>{t.platforms}</NavLink>
                <NavLink href="#ai" onClick={toggleMenu}>{t.aiTools}</NavLink>
                <NavLink href="#tutorials" onClick={toggleMenu}>{t.tutorials}</NavLink>
                <NavLink href="#tools" onClick={toggleMenu}>{t.allTools}</NavLink>
                <NavLink href="#team" onClick={toggleMenu}>{t.team}</NavLink>
                <NavLink href="#about" onClick={toggleMenu}>{t.about}</NavLink>
                <NavLink href="#contact" onClick={toggleMenu}>{t.contact}</NavLink>
                
                {user && (
                  <div className="pt-4 border-t border-zinc-800 flex flex-col gap-2">
                    <button 
                      onClick={() => { setIsBillingOpen(true); toggleMenu(); }}
                      className="flex items-center gap-3 px-4 py-3 text-emerald-500 font-bold uppercase tracking-widest hover:bg-zinc-800 rounded-xl transition-all"
                    >
                      <Wallet className="w-5 h-5" />
                      {t.billing}
                    </button>
                    {userProfile?.role === 'admin' && (
                      <button 
                        onClick={() => { setIsAdminPanelOpen(true); toggleMenu(); }}
                        className="flex items-center gap-3 px-4 py-3 text-white font-bold uppercase tracking-widest hover:bg-zinc-800 rounded-xl transition-all"
                      >
                        <ShieldCheck className="w-5 h-5 text-emerald-500" />
                        {t.adminDashboard}
                      </button>
                    )}
                    <button 
                      onClick={() => { handleLogout(); toggleMenu(); }}
                      className="flex items-center gap-3 px-4 py-3 text-red-500 font-bold uppercase tracking-widest hover:bg-zinc-800 rounded-xl transition-all"
                    >
                      <LogOut className="w-5 h-5" />
                      {t.logout}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main>
        {/* Admin Dashboard Modal */}
        <AnimatePresence>
          {isAdminPanelOpen && (
            <AdminDashboard 
              onClose={() => setIsAdminPanelOpen(false)} 
              user={user} 
              userProfile={userProfile} 
              tutorials={tutorials}
              tools={tools}
              newsletterSubscriptions={newsletterSubscriptions}
            />
          )}
        </AnimatePresence>

        {/* Billing Modal */}
        <AnimatePresence>
          {isBillingOpen && (
            <BillingModal 
              onClose={() => setIsBillingOpen(false)} 
              user={user} 
              bankAccounts={bankAccounts}
            />
          )}
        </AnimatePresence>

        {/* Dynamic Posts Section */}
        {posts.length > 0 && (
          <section className="py-24 bg-zinc-950 border-b border-zinc-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-3 mb-12">
                <div className="bg-emerald-500 w-2 h-10 rounded-full"></div>
                <h2 className="text-4xl font-black uppercase italic tracking-tighter">
                  Latest <span className="text-emerald-500">Updates</span>
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map(post => (
                  <motion.div 
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl relative overflow-hidden group"
                  >
                    <div className="absolute top-0 right-0 p-4">
                      <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-500 text-white px-3 py-1 rounded-full">
                        {post.category}
                      </span>
                    </div>
                    <h3 className="text-2xl font-black mb-4 group-hover:text-emerald-500 transition-colors uppercase italic">{post.title}</h3>
                    <p className="text-gray-400 leading-relaxed mb-6 line-clamp-4">{post.content}</p>
                    <div className="flex items-center justify-between pt-6 border-t border-zinc-800">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                          <UserIcon className="w-4 h-4 text-zinc-500" />
                        </div>
                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{post.authorName || 'Admin'}</span>
                      </div>
                      <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                        {post.createdAt?.toDate ? post.createdAt.toDate().toLocaleDateString() : 'Just now'}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Admin Team Section */}
        <section id="team" className="py-24 bg-black border-b border-zinc-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-12">
              <div className="bg-emerald-500 w-2 h-10 rounded-full"></div>
              <h2 className="text-4xl font-black uppercase italic tracking-tighter">
                Admin <span className="text-emerald-500">Team</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {allUsers.filter(u => u.role === 'admin').map(admin => (
                <motion.div 
                  key={admin.uid}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-3xl text-center group"
                >
                  <div className="w-20 h-20 rounded-full border-2 border-emerald-500 mx-auto mb-4 overflow-hidden group-hover:scale-110 transition-transform">
                    <img 
                      src={`https://ui-avatars.com/api/?name=${admin.displayName || admin.email}&background=10b981&color=fff`} 
                      alt={admin.displayName} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-lg font-black uppercase italic text-white mb-1">{admin.displayName || 'Admin'}</h3>
                  <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Verified Admin</p>
                </motion.div>
              ))}
              {allUsers.filter(u => u.role === 'admin').length === 0 && (
                <div className="col-span-full text-center py-12 text-zinc-600 border-2 border-dashed border-zinc-800 rounded-3xl">
                  <p className="font-bold uppercase tracking-widest">No admins listed yet</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Hero Section */}
        <section id="home" className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.pexels.com/photos/3521937/pexels-photo-3521937.jpeg?auto=compress&cs=tinysrgb&w=1920" 
              alt="Tech Background" 
              className="w-full h-full object-cover opacity-50"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black via-black/60 to-black"></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block py-1 px-3 rounded-full bg-emerald-500/20 text-emerald-500 text-xs font-bold uppercase tracking-widest mb-6">
                Master the Digital Economy
              </span>
              <h1 className="text-5xl md:text-8xl font-black uppercase italic tracking-tighter leading-none mb-6">
                {t.heroTitle} <br />
                <span className="text-emerald-500">Click Computer</span>
              </h1>
              <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                {t.heroSubtitle}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest transition-all flex items-center gap-3 group">
                  {t.getStarted} <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="bg-zinc-900 hover:bg-zinc-800 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest transition-all border border-zinc-800">
                  {t.learnMore}
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Educational Hub */}
        <section id="tutorials" className="py-24 bg-black border-b border-zinc-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-12">
              <div className="bg-emerald-500 w-2 h-10 rounded-full"></div>
              <h2 className="text-4xl font-black uppercase italic tracking-tighter">
                {t.educationalHub.split(' ')[0]} <span className="text-emerald-500">{t.educationalHub.split(' ')[1]}</span>
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {tutorials.length === 0 ? (
                <div className="col-span-full text-center py-20 border-2 border-dashed border-zinc-800 rounded-3xl">
                  <BookOpen className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                  <p className="text-zinc-500 font-bold uppercase tracking-widest">Tutorials coming soon</p>
                </div>
              ) : (
                tutorials.map(tutorial => (
                  <motion.div 
                    key={tutorial.id}
                    whileHover={{ y: -10 }}
                    className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden group"
                  >
                    <div className="h-48 bg-black relative overflow-hidden">
                      {tutorial.imageUrl ? (
                        <img src={tutorial.imageUrl} alt={tutorial.title} className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-12 h-12 text-zinc-800" />
                        </div>
                      )}
                      <div className="absolute top-4 left-4">
                        <span className="bg-emerald-500 text-black text-[10px] font-black uppercase px-3 py-1 rounded-full">
                          {tutorial.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-8">
                      <h3 className="text-xl font-black uppercase italic mb-4 group-hover:text-emerald-500 transition-colors">{tutorial.title}</h3>
                      <p className="text-zinc-400 text-sm mb-6 line-clamp-2">{tutorial.description}</p>
                      
                      <div className="space-y-3 mb-8">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{t.stepByStep}</p>
                        {tutorial.steps.slice(0, 3).map((step, idx) => (
                          <div key={idx} className="flex items-start gap-3 text-sm">
                            <span className="text-emerald-500 font-black">0{idx + 1}</span>
                            <span className="text-zinc-300">{step}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        {tutorial.videoUrl && (
                          <button className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                            <Video className="w-4 h-4" /> {t.watchVideo}
                          </button>
                        )}
                        <button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                          <BookOpen className="w-4 h-4" /> {t.learnMore}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Tools Directory */}
        <section id="tools" className="py-24 bg-zinc-950 border-b border-zinc-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-500 w-2 h-10 rounded-full"></div>
                <h2 className="text-4xl font-black uppercase italic tracking-tighter">
                  Tools <span className="text-emerald-500">Directory</span>
                </h2>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
                {['All', 'AI', 'Dev', 'Design', 'Marketing'].map(cat => (
                  <button 
                    key={cat} 
                    onClick={() => setSelectedToolCategory(cat)}
                    className={`whitespace-nowrap border px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${selectedToolCategory === cat ? 'bg-emerald-500 text-black border-emerald-500' : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-white'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {tools.filter(t => selectedToolCategory === 'All' || t.category === selectedToolCategory).length === 0 ? (
                <div className="col-span-full text-center py-20 border-2 border-dashed border-zinc-800 rounded-3xl">
                  <Wrench className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                  <p className="text-zinc-500 font-bold uppercase tracking-widest">No tools found for this category</p>
                </div>
              ) : (
                tools.filter(t => selectedToolCategory === 'All' || t.category === selectedToolCategory).map(tool => (
                  <motion.a 
                    key={tool.id}
                    href={tool.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.02 }}
                    className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex items-center gap-4 group hover:border-emerald-500/50 transition-all"
                  >
                    <div className="bg-black p-3 rounded-xl border border-zinc-800 group-hover:border-emerald-500 transition-all">
                      <Wrench className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div>
                      <h4 className="font-black uppercase italic text-sm group-hover:text-emerald-500 transition-colors">{tool.name}</h4>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{tool.category}</p>
                    </div>
                  </motion.a>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-24 bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-emerald-600 rounded-[3rem] p-8 md:p-20 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-10 opacity-10">
                <Newspaper className="w-64 h-64 rotate-12" />
              </div>
              <div className="relative z-10 max-w-2xl">
                <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter leading-none mb-6 text-black">
                  {t.newsletter}
                </h2>
                <p className="text-emerald-950 font-bold mb-10 text-lg">
                  Join 5,000+ tech enthusiasts. Get the latest tutorials, AI tools, and computer tips delivered to your inbox weekly.
                </p>
                <form onSubmit={handleNewsletterSubscribe} className="flex flex-col sm:flex-row gap-4">
                  <input 
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="flex-1 bg-black/20 border-2 border-black/20 rounded-2xl px-6 py-4 text-black placeholder:text-emerald-950/50 focus:outline-none focus:border-black/40 transition-all font-bold"
                    required
                  />
                  <button 
                    type="submit"
                    disabled={isSubscribing}
                    className="bg-black text-emerald-500 px-10 py-4 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all disabled:opacity-50"
                  >
                    {isSubscribing ? '...' : t.subscribe}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* Computer Section */}
        <section id="computer" className="py-24 bg-zinc-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4">
              <div className="max-w-2xl">
                <h2 className="text-4xl md:text-5xl font-black uppercase italic mb-4">
                  Desktop <span className="text-emerald-500">Power</span>
                </h2>
                <p className="text-gray-400 text-lg">
                  High-performance desktop setups for professional earners, developers, and heavy-duty content creators.
                </p>
              </div>
              <Monitor className="text-zinc-800 w-24 h-24 hidden lg:block" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <PlatformCard 
                icon={Monitor}
                title="Workstation Builds"
                description="Custom PC builds optimized for video editing, 3D rendering, and complex software development."
                tags={["Performance", "Custom", "Reliable"]}
              />
              <PlatformCard 
                icon={Cpu}
                title="Multi-Monitor Setup"
                description="Maximize productivity with multi-display configurations for trading and multi-tasking."
                tags={["Productivity", "Trading", "Efficiency"]}
              />
              <PlatformCard 
                icon={Zap}
                title="Server Solutions"
                description="Home server setups for hosting your own digital assets and automated earning scripts."
                tags={["Advanced", "Automation", "Hosting"]}
              />
            </div>
          </div>
        </section>

        {/* Laptop Section */}
        <section id="laptop" className="py-24 bg-black border-y border-zinc-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row-reverse justify-between items-end mb-16 gap-4">
              <div className="max-w-2xl text-right md:text-left">
                <h2 className="text-4xl md:text-5xl font-black uppercase italic mb-4">
                  Mobile <span className="text-emerald-500">Freedom</span>
                </h2>
                <p className="text-gray-400 text-lg">
                  The best portable gear for digital nomads and those who earn on the go.
                </p>
              </div>
              <Laptop className="text-zinc-800 w-24 h-24 hidden lg:block" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <PlatformCard 
                icon={Laptop}
                title="Ultrabooks"
                description="Lightweight, powerful laptops perfect for writing, light design, and managing your online business."
                tags={["Portable", "Battery", "Sleek"]}
              />
              <PlatformCard 
                icon={Globe}
                title="Nomad Gear"
                description="Essential accessories for working from cafes, airports, and co-working spaces globally."
                tags={["Travel", "Connectivity", "Essential"]}
              />
              <PlatformCard 
                icon={TrendingUp}
                title="Remote Security"
                description="VPNs and hardware security keys to keep your earnings safe while using public networks."
                tags={["Security", "Privacy", "Critical"]}
              />
            </div>
          </div>
        </section>

        {/* Software Section */}
        <section id="software" className="py-24 bg-zinc-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4">
              <div className="max-w-2xl">
                <h2 className="text-4xl md:text-5xl font-black uppercase italic mb-4">
                  Essential <span className="text-emerald-500">Software</span>
                </h2>
                <p className="text-gray-400 text-lg">
                  The digital tools and applications that power your online business and maximize your efficiency.
                </p>
              </div>
              <Code className="text-zinc-800 w-24 h-24 hidden lg:block" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <PlatformCard 
                icon={Code}
                title="Development Tools"
                description="IDEs, version control, and automation frameworks to build and deploy your digital products."
                tags={["Coding", "Automation", "DevOps"]}
              />
              <PlatformCard 
                icon={Briefcase}
                title="Project Management"
                description="Stay organized with the best tools for task tracking, team collaboration, and deadline management."
                tags={["Organization", "Teams", "Workflow"]}
              />
              <PlatformCard 
                icon={TrendingUp}
                title="Analytics & SEO"
                description="Software to track your growth, optimize your content, and understand your audience better."
                tags={["Data", "Growth", "Marketing"]}
              />
            </div>
          </div>
        </section>

        {/* Platforms Section */}
        <section id="platforms" className="py-24 bg-zinc-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4">
              <div className="max-w-2xl">
                <h2 className="text-4xl md:text-5xl font-black uppercase italic mb-4">
                  Top Earning <span className="text-emerald-500">Platforms</span>
                </h2>
                <p className="text-gray-400 text-lg">
                  We've curated the most reliable and high-paying platforms for every skill level.
                </p>
              </div>
              <DollarSign className="text-zinc-800 w-24 h-24 hidden lg:block" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <PlatformCard 
                icon={Briefcase}
                title="Freelance Marketplaces"
                description="Connect with global clients on Upwork and Fiverr. Best for developers, designers, and writers."
                tags={["High Pay", "Skill Based", "Global"]}
              />
              <PlatformCard 
                icon={Globe}
                title="Content Monetization"
                description="Build an audience on YouTube, Substack, or Medium. Earn through ads, subs, and sponsorships."
                tags={["Passive", "Creative", "Long Term"]}
              />
              <PlatformCard 
                icon={TrendingUp}
                title="Digital Assets"
                description="Sell stock photos, 3D models, or UI kits on Creative Market and Envato. Create once, earn forever."
                tags={["Scalable", "Design", "Passive"]}
              />
              <PlatformCard 
                icon={Award}
                title="Micro-Tasking"
                description="Earn small amounts for simple tasks on Amazon Mechanical Turk or Prolific. Great for beginners."
                tags={["Easy", "Flexible", "Entry Level"]}
              />
              <PlatformCard 
                icon={Zap}
                title="Affiliate Marketing"
                description="Promote products you love through Amazon Associates or Impact. Earn commissions on every sale."
                tags={["Sales", "Marketing", "High Cap"]}
              />
              <PlatformCard 
                icon={Monitor}
                title="Online Tutoring"
                description="Share your knowledge on platforms like Teachable or VIPKid. Teach languages, coding, or music."
                tags={["Education", "Hourly", "Rewarding"]}
              />
            </div>
          </div>
        </section>

        {/* AI Section */}
        <section id="ai" className="py-24 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-emerald-500/5 blur-3xl rounded-full -mr-20"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-4xl md:text-5xl font-black uppercase italic mb-8">
                  AI-Powered <span className="text-emerald-500">Efficiency</span>
                </h2>
                <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                  Leverage the latest AI tools to automate your workflow and multiply your output. Modern earners don't work harder; they work smarter.
                </p>
                <ul className="space-y-6">
                  {[
                    { icon: BrainCircuit, text: "Automated content generation for blogs and social media" },
                    { icon: Cpu, text: "AI-driven market analysis for trading and investments" },
                    { icon: Zap, text: "Smart productivity tools to reclaim 10+ hours a week" }
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-4">
                      <div className="bg-emerald-500 p-2 rounded-lg">
                        <item.icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xl font-bold text-gray-200">{item.text}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
              <div className="relative">
                <div className="aspect-video rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl">
                  <img 
                    src="https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800" 
                    alt="AI Technology" 
                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="absolute -bottom-6 -left-6 bg-emerald-600 p-8 rounded-2xl shadow-xl">
                  <Cpu className="w-12 h-12 text-white mb-2" />
                  <div className="text-2xl font-black italic">AI FIRST</div>
                </div>
              </div>
            </div>

            {/* AI Recommender Feature */}
            <div className="mt-24 bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 md:p-12">
              <div className="flex items-center gap-3 mb-8">
                <Sparkles className="text-emerald-500 w-8 h-8" />
                <h3 className="text-3xl font-black uppercase italic">AI Hustle <span className="text-emerald-500">Recommender</span></h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <p className="text-gray-400 text-lg">Select your primary skill and let our AI suggest the best tool to multiply your earning potential.</p>
                  <div className="flex flex-wrap gap-3">
                    {skills.map(skill => (
                      <button
                        key={skill.id}
                        onClick={() => setSelectedSkill(skill.id)}
                        className={`px-6 py-3 rounded-xl font-bold transition-all ${
                          selectedSkill === skill.id 
                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                            : 'bg-zinc-800 text-gray-400 hover:bg-zinc-700'
                        }`}
                      >
                        {skill.label}
                      </button>
                    ))}
                  </div>
                  <button 
                    onClick={handleRecommend}
                    disabled={!selectedSkill}
                    className="w-full md:w-auto bg-white text-black px-10 py-4 rounded-xl font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Get Recommendation
                  </button>
                </div>
                <AnimatePresence mode="wait">
                  {recommendation ? (
                    <motion.div
                      key={recommendation.tool}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-emerald-500/10 border border-emerald-500/30 p-8 rounded-2xl text-center"
                    >
                      <div className="bg-emerald-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Search className="text-white w-8 h-8" />
                      </div>
                      <h4 className="text-2xl font-black text-white mb-2 uppercase italic">{recommendation.tool}</h4>
                      <p className="text-emerald-500 font-bold mb-4 uppercase tracking-widest text-sm">Recommended Tool</p>
                      <p className="text-gray-300 leading-relaxed">{recommendation.desc}</p>
                    </motion.div>
                  ) : (
                    <div className="border-2 border-dashed border-zinc-800 rounded-2xl p-12 text-center text-zinc-600">
                      <p className="font-bold uppercase tracking-widest">Select a skill to see results</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </section>

        {/* Technology Section */}
        <section id="technology" className="py-24 bg-black border-y border-zinc-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row-reverse justify-between items-end mb-16 gap-4">
              <div className="max-w-2xl text-right md:text-left">
                <h2 className="text-4xl md:text-5xl font-black uppercase italic mb-4">
                  Core <span className="text-emerald-500">Technology</span>
                </h2>
                <p className="text-gray-400 text-lg">
                  The foundational tech stacks that enable modern digital earning and automation.
                </p>
              </div>
              <Database className="text-zinc-800 w-24 h-24 hidden lg:block" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <PlatformCard 
                icon={Database}
                title="Cloud Infrastructure"
                description="Leverage AWS, Azure, or Google Cloud to scale your digital assets and host complex applications."
                tags={["Scalable", "Reliable", "Global"]}
              />
              <PlatformCard 
                icon={Globe}
                title="Web3 & Blockchain"
                description="Explore decentralized finance, NFTs, and smart contracts as new avenues for digital ownership."
                tags={["Decentralized", "Future", "Secure"]}
              />
              <PlatformCard 
                icon={TrendingUp}
                title="Data Science"
                description="Master the art of data visualization and predictive modeling to gain a competitive edge."
                tags={["Analytics", "Insights", "Strategic"]}
              />
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-24 bg-zinc-900/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl md:text-5xl font-black uppercase italic mb-12">About Click Computer</h2>
            <div className="max-w-3xl mx-auto">
              <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                Click Computer was founded to demystify the digital economy. We believe that with the right tools and information, anyone can build a sustainable income stream online.
              </p>
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-8 rounded-3xl">
                <h4 className="text-emerald-500 font-black uppercase tracking-widest mb-2">Our Vision</h4>
                <p className="text-2xl font-bold italic text-white">
                  "Empowering the next generation of digital entrepreneurs."
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Guide Section */}
        <section id="guide" className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl md:text-5xl font-black uppercase italic mb-16 text-center">How to Start</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                { step: "01", title: "Identify Your Skill", desc: "Determine what you're good at—writing, coding, design, or even just following instructions." },
                { step: "02", title: "Choose a Platform", desc: "Select one of our recommended platforms that matches your skill level and time commitment." },
                { step: "03", title: "Optimize & Scale", desc: "Use AI tools to improve your quality and speed, then scale your income across multiple streams." }
              ].map((item, i) => (
                <div key={i} className="relative p-8 bg-zinc-900/50 border border-zinc-800 rounded-3xl">
                  <span className="text-6xl font-black text-emerald-500/20 absolute top-4 right-4 leading-none">{item.step}</span>
                  <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-24 bg-zinc-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              <div>
                <h2 className="text-4xl md:text-5xl font-black uppercase italic mb-8">Get in Touch</h2>
                <p className="text-gray-400 text-lg mb-12">Have questions about a platform? Our team of experts is here to help you navigate the digital landscape.</p>
                
                <div className="space-y-8">
                  <div className="flex items-start gap-4">
                    <MapPin className="text-emerald-500 w-6 h-6 mt-1" />
                    <div>
                      <h4 className="font-bold text-white uppercase tracking-wider mb-1">HQ</h4>
                      <p className="text-gray-400">Silicon Valley, CA 94025</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Phone className="text-emerald-500 w-6 h-6 mt-1" />
                    <div>
                      <h4 className="font-bold text-white uppercase tracking-wider mb-1">Support</h4>
                      <p className="text-gray-400">+1 (800) CLICK-COMP</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Mail className="text-emerald-500 w-6 h-6 mt-1" />
                    <div>
                      <h4 className="font-bold text-white uppercase tracking-wider mb-1">Email</h4>
                      <p className="text-gray-400">info@clickcomputer.com</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800">
                <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Name</label>
                      <input 
                        type="text" 
                        placeholder="Your Name" 
                        className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Email</label>
                      <input 
                        type="email" 
                        placeholder="Your Email" 
                        className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Message</label>
                    <textarea 
                      placeholder="How can we help you?" 
                      rows={4}
                      className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                    ></textarea>
                  </div>
                  <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 group">
                    Send Message
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-8">
            <MousePointer2 className="text-emerald-500 w-6 h-6" />
            <span className="text-xl font-black tracking-tighter uppercase italic">
              Click<span className="text-emerald-500">Computer</span>
            </span>
          </div>
          <p className="text-gray-500 mb-8">&copy; 2026 Click Computer | All Rights Reserved.</p>
          <div className="flex justify-center gap-6">
            {['LinkedIn', 'Twitter', 'YouTube', 'Medium'].map((social) => (
              <a key={social} href="#" className="text-gray-400 hover:text-emerald-500 transition-colors font-bold uppercase text-xs tracking-widest">
                {social}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  </div>
);
}

// Admin Dashboard Component
const AdminDashboard = ({ 
  onClose, 
  user, 
  userProfile,
  tutorials,
  tools,
  newsletterSubscriptions
}: { 
  onClose: () => void; 
  user: User | null; 
  userProfile: UserProfile | null;
  tutorials: Tutorial[];
  tools: ToolItem[];
  newsletterSubscriptions: any[];
}) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<'Tech' | 'AI' | 'Hustle' | 'Platforms'>('Tech');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [activeTab, setActiveTab] = useState<'posts' | 'users' | 'tutorials' | 'tools' | 'newsletter'>('posts');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Tutorial Form State
  const [tutTitle, setTutTitle] = useState("");
  const [tutDesc, setTutDesc] = useState("");
  const [tutVideo, setTutVideo] = useState("");
  const [tutImage, setTutImage] = useState("");
  const [tutCategory, setTutCategory] = useState("AI");
  const [tutSteps, setTutSteps] = useState<string[]>([""]);

  // Tool Form State
  const [toolName, setToolName] = useState("");
  const [toolDesc, setToolDesc] = useState("");
  const [toolUrl, setToolUrl] = useState("");
  const [toolCategory, setToolCategory] = useState("AI");

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedPosts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Post[];
      setPosts(fetchedPosts);
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (userProfile?.role !== 'admin') return;
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedUsers = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      })) as UserProfile[];
      setUsers(fetchedUsers);
    });
    return () => unsubscribe();
  }, [userProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title || !content) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'posts'), {
        title,
        content,
        category,
        authorUid: user.uid,
        authorName: user.displayName,
        createdAt: Timestamp.now()
      });
      setTitle("");
      setContent("");
      setCategory('Tech');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'posts');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (postId: string) => {
    try {
      await deleteDoc(doc(db, 'posts', postId));
      setDeleteConfirm(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `posts/${postId}`);
    }
  };

  const handleToggleRole = async (targetUser: UserProfile) => {
    if (targetUser.email === "ictmajlisaoromiyaa@gmail.com") return; // Protect default admin
    const newRole = targetUser.role === 'admin' ? 'user' : 'admin';
    try {
      await setDoc(doc(db, 'users', targetUser.uid), { role: newRole }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${targetUser.uid}`);
    }
  };

  const handleAddTutorial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tutTitle || !tutDesc) return;
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'tutorials'), {
        title: tutTitle,
        description: tutDesc,
        videoUrl: tutVideo,
        imageUrl: tutImage,
        category: tutCategory,
        steps: tutSteps.filter(s => s.trim() !== ""),
        createdAt: Timestamp.now()
      });
      setTutTitle("");
      setTutDesc("");
      setTutVideo("");
      setTutImage("");
      setTutSteps([""]);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'tutorials');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTutorial = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'tutorials', id));
      setDeleteConfirm(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `tutorials/${id}`);
    }
  };

  const handleAddTool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!toolName || !toolUrl) return;
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'tools'), {
        name: toolName,
        description: toolDesc,
        url: toolUrl,
        category: toolCategory,
        createdAt: Timestamp.now()
      });
      setToolName("");
      setToolDesc("");
      setToolUrl("");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'tools');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTool = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'tools', id));
      setDeleteConfirm(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `tools/${id}`);
    }
  };

  const handleDeleteSubscription = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'newsletter', id));
      setDeleteConfirm(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `newsletter/${id}`);
    }
  };

  if (userProfile?.role !== 'admin') return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-zinc-900 border border-zinc-800 w-full max-w-6xl h-[90vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl shadow-emerald-500/10"
      >
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-black/50">
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-emerald-500 w-8 h-8" />
            <h2 className="text-2xl font-black uppercase italic">Admin <span className="text-emerald-500">Dashboard</span></h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex bg-zinc-800 p-1 rounded-xl">
              <button 
                onClick={() => setActiveTab('posts')}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'posts' ? 'bg-emerald-500 text-white' : 'text-zinc-400 hover:text-white'}`}
              >
                Posts
              </button>
              <button 
                onClick={() => setActiveTab('tutorials')}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'tutorials' ? 'bg-emerald-500 text-white' : 'text-zinc-400 hover:text-white'}`}
              >
                Tutorials
              </button>
              <button 
                onClick={() => setActiveTab('tools')}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'tools' ? 'bg-emerald-500 text-white' : 'text-zinc-400 hover:text-white'}`}
              >
                Tools
              </button>
              <button 
                onClick={() => setActiveTab('newsletter')}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'newsletter' ? 'bg-emerald-500 text-white' : 'text-zinc-400 hover:text-white'}`}
              >
                Newsletter
              </button>
              <button 
                onClick={() => setActiveTab('users')}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'users' ? 'bg-emerald-500 text-white' : 'text-zinc-400 hover:text-white'}`}
              >
                Users
              </button>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full transition-all">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-8">
          {activeTab === 'posts' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Create Post */}
              <div className="space-y-8">
                <div className="flex items-center gap-2 mb-2">
                  <Plus className="text-emerald-500 w-5 h-5" />
                  <h3 className="text-xl font-bold uppercase tracking-widest">Create New Post</h3>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Title</label>
                    <input 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Post Title"
                      className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Category</label>
                    <select 
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors appearance-none"
                    >
                      <option value="Tech">Tech</option>
                      <option value="AI">AI</option>
                      <option value="Software">Software</option>
                      <option value="Technology">Technology</option>
                      <option value="Hustle">Hustle</option>
                      <option value="Platforms">Platforms</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Content</label>
                    <textarea 
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="What's the update?"
                      rows={6}
                      className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                      required
                    ></textarea>
                  </div>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl font-black uppercase tracking-widest transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? 'Posting...' : 'Publish Update'}
                  </button>
                </form>
              </div>

              {/* Manage Posts */}
              <div className="space-y-8">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="text-emerald-500 w-5 h-5" />
                  <h3 className="text-xl font-bold uppercase tracking-widest">Manage Posts</h3>
                </div>
                <div className="space-y-4">
                  {posts.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-zinc-800 rounded-2xl text-zinc-600">
                      <p className="font-bold uppercase tracking-widest">No posts yet</p>
                    </div>
                  ) : (
                    posts.map(post => (
                      <div key={post.id} className="bg-black border border-zinc-800 p-4 rounded-2xl flex justify-between items-start gap-4 group relative">
                        <div className="flex-1">
                          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-1 block">{post.category}</span>
                          <h4 className="font-bold text-white mb-1">{post.title}</h4>
                          <p className="text-xs text-zinc-500 line-clamp-2">{post.content}</p>
                        </div>
                        <div className="flex flex-col gap-2">
                          {deleteConfirm === post.id ? (
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleDelete(post.id)}
                                className="p-2 bg-red-500 text-white rounded-lg text-[10px] font-black uppercase"
                              >
                                Confirm
                              </button>
                              <button 
                                onClick={() => setDeleteConfirm(null)}
                                className="p-2 bg-zinc-800 text-white rounded-lg text-[10px] font-black uppercase"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => setDeleteConfirm(post.id)}
                              className="p-2 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tutorials' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Create Tutorial */}
              <div className="space-y-8">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="text-emerald-500 w-5 h-5" />
                  <h3 className="text-xl font-bold uppercase tracking-widest">Add New Tutorial</h3>
                </div>
                <form onSubmit={handleAddTutorial} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Title</label>
                    <input 
                      value={tutTitle}
                      onChange={(e) => setTutTitle(e.target.value)}
                      placeholder="Tutorial Title"
                      className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Description</label>
                    <textarea 
                      value={tutDesc}
                      onChange={(e) => setTutDesc(e.target.value)}
                      placeholder="Brief overview"
                      rows={3}
                      className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                      required
                    ></textarea>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Video URL</label>
                      <input 
                        value={tutVideo}
                        onChange={(e) => setTutVideo(e.target.value)}
                        placeholder="YouTube link"
                        className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Image URL</label>
                      <input 
                        value={tutImage}
                        onChange={(e) => setTutImage(e.target.value)}
                        placeholder="Cover image"
                        className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Category</label>
                    <select 
                      value={tutCategory}
                      onChange={(e) => setTutCategory(e.target.value)}
                      className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors appearance-none"
                    >
                      <option value="AI">AI</option>
                      <option value="Development">Development</option>
                      <option value="Design">Design</option>
                      <option value="Marketing">Marketing</option>
                    </select>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Steps</label>
                      <button 
                        type="button"
                        onClick={() => setTutSteps([...tutSteps, ""])}
                        className="text-[10px] font-black uppercase text-emerald-500 hover:text-emerald-400"
                      >
                        + Add Step
                      </button>
                    </div>
                    {tutSteps.map((step, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input 
                          value={step}
                          onChange={(e) => {
                            const newSteps = [...tutSteps];
                            newSteps[idx] = e.target.value;
                            setTutSteps(newSteps);
                          }}
                          placeholder={`Step ${idx + 1}`}
                          className="flex-1 bg-black border border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors"
                        />
                        {tutSteps.length > 1 && (
                          <button 
                            type="button"
                            onClick={() => setTutSteps(tutSteps.filter((_, i) => i !== idx))}
                            className="p-3 text-zinc-600 hover:text-red-500"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl font-black uppercase tracking-widest transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? 'Adding...' : 'Add Tutorial'}
                  </button>
                </form>
              </div>

              {/* Manage Tutorials */}
              <div className="space-y-8">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="text-emerald-500 w-5 h-5" />
                  <h3 className="text-xl font-bold uppercase tracking-widest">Manage Tutorials</h3>
                </div>
                <div className="space-y-4">
                  {tutorials.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-zinc-800 rounded-2xl text-zinc-600">
                      <p className="font-bold uppercase tracking-widest">No tutorials yet</p>
                    </div>
                  ) : (
                    tutorials.map(tut => (
                      <div key={tut.id} className="bg-black border border-zinc-800 p-4 rounded-2xl flex justify-between items-start gap-4 group relative">
                        <div className="flex-1">
                          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-1 block">{tut.category}</span>
                          <h4 className="font-bold text-white mb-1">{tut.title}</h4>
                          <p className="text-xs text-zinc-500 line-clamp-1">{tut.description}</p>
                        </div>
                        <div className="flex flex-col gap-2">
                          {deleteConfirm === tut.id ? (
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleDeleteTutorial(tut.id!)}
                                className="p-2 bg-red-500 text-white rounded-lg text-[10px] font-black uppercase"
                              >
                                Confirm
                              </button>
                              <button 
                                onClick={() => setDeleteConfirm(null)}
                                className="p-2 bg-zinc-800 text-white rounded-lg text-[10px] font-black uppercase"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => setDeleteConfirm(tut.id!)}
                              className="p-2 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tools' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Add Tool */}
              <div className="space-y-8">
                <div className="flex items-center gap-2 mb-2">
                  <Wrench className="text-emerald-500 w-5 h-5" />
                  <h3 className="text-xl font-bold uppercase tracking-widest">Add New Tool</h3>
                </div>
                <form onSubmit={handleAddTool} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Name</label>
                    <input 
                      value={toolName}
                      onChange={(e) => setToolName(e.target.value)}
                      placeholder="Tool Name"
                      className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Description</label>
                    <textarea 
                      value={toolDesc}
                      onChange={(e) => setToolDesc(e.target.value)}
                      placeholder="What does it do?"
                      rows={3}
                      className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                      required
                    ></textarea>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">URL</label>
                    <input 
                      value={toolUrl}
                      onChange={(e) => setToolUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Category</label>
                    <select 
                      value={toolCategory}
                      onChange={(e) => setToolCategory(e.target.value)}
                      className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors appearance-none"
                    >
                      <option value="AI">AI</option>
                      <option value="Productivity">Productivity</option>
                      <option value="Design">Design</option>
                      <option value="Development">Development</option>
                    </select>
                  </div>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl font-black uppercase tracking-widest transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? 'Adding...' : 'Add Tool'}
                  </button>
                </form>
              </div>

              {/* Manage Tools */}
              <div className="space-y-8">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="text-emerald-500 w-5 h-5" />
                  <h3 className="text-xl font-bold uppercase tracking-widest">Manage Tools</h3>
                </div>
                <div className="space-y-4">
                  {tools.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-zinc-800 rounded-2xl text-zinc-600">
                      <p className="font-bold uppercase tracking-widest">No tools yet</p>
                    </div>
                  ) : (
                    tools.map(tool => (
                      <div key={tool.id} className="bg-black border border-zinc-800 p-4 rounded-2xl flex justify-between items-start gap-4 group relative">
                        <div className="flex-1">
                          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-1 block">{tool.category}</span>
                          <h4 className="font-bold text-white mb-1">{tool.name}</h4>
                          <p className="text-xs text-zinc-500 line-clamp-1">{tool.url}</p>
                        </div>
                        <div className="flex flex-col gap-2">
                          {deleteConfirm === tool.id ? (
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleDeleteTool(tool.id!)}
                                className="p-2 bg-red-500 text-white rounded-lg text-[10px] font-black uppercase"
                              >
                                Confirm
                              </button>
                              <button 
                                onClick={() => setDeleteConfirm(null)}
                                className="p-2 bg-zinc-800 text-white rounded-lg text-[10px] font-black uppercase"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => setDeleteConfirm(tool.id!)}
                              className="p-2 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'newsletter' && (
            <div className="space-y-8">
              <div className="flex items-center gap-2 mb-2">
                <Newspaper className="text-emerald-500 w-5 h-5" />
                <h3 className="text-xl font-bold uppercase tracking-widest">Newsletter Subscriptions</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {newsletterSubscriptions.length === 0 ? (
                  <div className="col-span-full text-center py-12 border-2 border-dashed border-zinc-800 rounded-2xl text-zinc-600">
                    <p className="font-bold uppercase tracking-widest">No subscriptions yet</p>
                  </div>
                ) : (
                  newsletterSubscriptions.map(sub => (
                    <div key={sub.id} className="bg-black border border-zinc-800 p-6 rounded-3xl flex flex-col items-center text-center group relative">
                      <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
                        <Mail className="text-emerald-500 w-6 h-6" />
                      </div>
                      <h4 className="font-bold text-white mb-1">{sub.email}</h4>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-4">
                        Subscribed: {sub.subscribedAt?.toDate().toLocaleDateString()}
                      </p>
                      <button 
                        onClick={() => handleDeleteSubscription(sub.id)}
                        className="p-2 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100 absolute top-4 right-4"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-8">
              <div className="flex items-center gap-2 mb-2">
                <UserIcon className="text-emerald-500 w-5 h-5" />
                <h3 className="text-xl font-bold uppercase tracking-widest">User Management</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {users.map(u => (
                  <div key={u.uid} className="bg-black border border-zinc-800 p-6 rounded-3xl flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full border-2 border-emerald-500 mb-4 overflow-hidden">
                      <img src={`https://ui-avatars.com/api/?name=${u.displayName || u.email}&background=10b981&color=fff`} alt={u.displayName} className="w-full h-full object-cover" />
                    </div>
                    <h4 className="font-bold text-white mb-1">{u.displayName || 'Anonymous'}</h4>
                    <p className="text-xs text-zinc-500 mb-4 truncate w-full">{u.email}</p>
                    <div className="flex items-center gap-3 w-full">
                      <span className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${u.role === 'admin' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-zinc-800 text-zinc-400'}`}>
                        {u.role}
                      </span>
                      {u.email !== "ictmajlisaoromiyaa@gmail.com" && (
                        <button 
                          onClick={() => handleToggleRole(u)}
                          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                        >
                          {u.role === 'admin' ? 'Demote' : 'Promote'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

const BillingModal = ({ onClose, user, bankAccounts }: { onClose: () => void; user: User | null; bankAccounts: BankAccount[] }) => {
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [routingNumber, setRoutingNumber] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !bankName || !accountNumber || !routingNumber || !accountHolderName) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'bankAccounts'), {
        uid: user.uid,
        bankName,
        accountNumber,
        routingNumber,
        accountHolderName,
        createdAt: Timestamp.now()
      });
      setBankName("");
      setAccountNumber("");
      setRoutingNumber("");
      setAccountHolderName("");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'bankAccounts');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (accountId: string) => {
    try {
      await deleteDoc(doc(db, 'bankAccounts', accountId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `bankAccounts/${accountId}`);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-zinc-900 border border-zinc-800 w-full max-w-4xl h-[80vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl shadow-emerald-500/10"
      >
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-black/50">
          <div className="flex items-center gap-3">
            <Wallet className="text-emerald-500 w-8 h-8" />
            <h2 className="text-2xl font-black uppercase italic">Billing & <span className="text-emerald-500">Payouts</span></h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Add Bank Account */}
            <div className="space-y-8">
              <div className="flex items-center gap-2 mb-2">
                <Plus className="text-emerald-500 w-5 h-5" />
                <h3 className="text-xl font-bold uppercase tracking-widest">Add Bank Account</h3>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Bank Name</label>
                  <input 
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="e.g. Chase, Bank of America"
                    className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Account Holder Name</label>
                  <input 
                    value={accountHolderName}
                    onChange={(e) => setAccountHolderName(e.target.value)}
                    placeholder="Full Name on Account"
                    className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Account Number</label>
                    <input 
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="Account Number"
                      className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Routing Number</label>
                    <input 
                      value={routingNumber}
                      onChange={(e) => setRoutingNumber(e.target.value)}
                      placeholder="Routing / SWIFT"
                      className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors"
                      required
                    />
                  </div>
                </div>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl font-black uppercase tracking-widest transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Adding...' : 'Add Account'}
                </button>
              </form>
            </div>

            {/* Managed Accounts */}
            <div className="space-y-8">
              <div className="flex items-center gap-2 mb-2">
                <Landmark className="text-emerald-500 w-5 h-5" />
                <h3 className="text-xl font-bold uppercase tracking-widest">Your Accounts</h3>
              </div>
              <div className="space-y-4">
                {bankAccounts.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-zinc-800 rounded-2xl text-zinc-600">
                    <p className="font-bold uppercase tracking-widest">No bank accounts added</p>
                  </div>
                ) : (
                  bankAccounts.map(account => (
                    <div key={account.id} className="bg-black border border-zinc-800 p-6 rounded-2xl relative group">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-emerald-500/10 p-2 rounded-lg">
                            <Landmark className="text-emerald-500 w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-white uppercase italic">{account.bankName}</h4>
                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Active Payout Method</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleDelete(account.id)}
                          className="p-2 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-zinc-500 uppercase tracking-widest">Holder</span>
                          <span className="text-zinc-300 font-bold">{account.accountHolderName}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-zinc-500 uppercase tracking-widest">Account</span>
                          <span className="text-zinc-300 font-bold">•••• {account.accountNumber.slice(-4)}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
