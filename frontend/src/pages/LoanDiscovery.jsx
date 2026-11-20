import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ShieldAlert,
  ShieldCheck,
  Banknote,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  Lock,
  PhoneCall,
  Sparkles,
  Mic,
  MicOff,
  RotateCcw,
  ArrowRight,
  ClipboardList,
  FileCheck,
  Search,
  Filter,
  Check,
  SlidersHorizontal
} from 'lucide-react';
import ALL_DEMO_LOANS from '../data/demoLoans.json';

// Local resilient loan matching engine
function matchLoansLocally(query, isHindi, allLoansList) {
  const textLower = (query || '').toLowerCase().trim();
  const words = textLower.split(/[\s,.;:!?]+/).filter(w => w.length >= 2);

  const personaMap = {
    Agriculture: {
      en: '👨‍🌾 Farmer / Cultivator',
      hi: '👨‍🌾 कृषक / किसान',
      needEn: 'Subsidized Crop Credit, Seeds & Fertilizers (KCC)',
      needHi: 'रियायती 4% कृषि साख, फसल व बीज हेतु किसान क्रेडिट कार्ड'
    },
    'Street Vendor': {
      en: '🛒 Urban Street Vendor / Hawker',
      hi: '🛒 रेहड़ी-पटरी विक्रेता / स्ट्रीट वेंडर',
      needEn: 'Collateral-free Working Capital with 7% Interest Subsidy (PM SVANidhi)',
      needHi: 'बिना गारंटी कार्यशील पूंजी व 7% ब्याज सब्सिडी (पीएम स्वनिधि)'
    },
    Artisans: {
      en: '🔨 Artisan / Traditional Craftsman',
      hi: '🔨 कारीगर व पारंपरिक शिल्पकार',
      needEn: 'PM Vishwakarma Concessional 5% Credit & Rs 15,000 Toolkit',
      needHi: 'पीएम विश्वकर्मा 5% रियायती ऋण व ₹15,000 टूल-किट अनुदान'
    },
    Education: {
      en: '🎓 Higher Education / College Student',
      hi: '🎓 उच्च शिक्षा / कॉलेज विद्यार्थी',
      needEn: 'Collateral-free Vidya Lakshmi Education Loan with 100% Moratorium Subsidy',
      needHi: 'बिना गारंटी विद्या लक्ष्मी एजुकेशन लोन व पढ़ाई के दौरान पूर्ण ब्याज छूट'
    },
    Business: {
      en: '🏬 Micro-Entrepreneur / Shopkeeper',
      hi: '🏬 सूक्ष्म उद्यमी / छोटा व्यापारी',
      needEn: 'Collateral-free PM Mudra / PMEGP Capital Assistance',
      needHi: 'बिना गारंटी प्रधानमंत्री मुद्रा व पीएमईजीपी स्वरोजगार ऋण'
    },
    Housing: {
      en: '🏠 Home Construction / EWS Beneficiary',
      hi: '🏠 गृह निर्माण / आवास लाभार्थी',
      needEn: 'PMAY CLSS Upfront Interest Subsidy up to Rs 2.67 Lakh',
      needHi: 'पीएम आवास योजना ₹2.67 लाख तक की अग्रिम ब्याज सब्सिडी'
    }
  };

  const topicKeywords = {
    Agriculture: ['kisan', 'farmer', 'kheti', 'crop', 'fasal', 'land', 'tractor', 'seed', 'fertilizer', 'kcc', 'krishi', 'dairy', 'पशुपालन', 'किसान', 'खेती', 'फसल', 'खाद', 'बीज', 'क्रेडिट कार्ड'],
    'Street Vendor': ['vendor', 'street', 'thela', 'rehri', 'cart', 'fruit', 'vegetable', 'stall', 'svanidhi', 'रेहड़ी', 'पटरी', 'ठेला', 'सब्जी', 'फल', 'स्वनिधि', 'फेरीवाला'],
    Artisans: ['artisan', 'carpenter', 'blacksmith', 'tailor', 'potter', 'barber', 'cobbler', 'toolkit', 'vishwakarma', 'बढ़ई', 'लोहार', 'दर्जी', 'कुम्हार', 'मोची', 'विश्वकर्मा', 'टूलकिट', 'शिल्पकार'],
    Education: ['student', 'college', 'school', 'scholarship', 'btech', 'mbbs', 'degree', 'admission', 'vidya', 'lakshmi', 'fees', 'study', 'विद्यार्थी', 'कॉलेज', 'फीस', 'पढ़ाई', 'दाखिला', 'एजुकेशन'],
    Business: ['business', 'shop', 'dukan', 'store', 'mudra', 'shishu', 'kishore', 'tarun', 'machinery', 'pmegp', 'startup', 'vyapar', 'दुकान', 'व्यापार', 'मुद्रा', 'मशीन', 'स्टार्टअप', 'उद्यम'],
    Housing: ['home', 'house', 'housing', 'makan', 'ghar', 'chhat', 'awas', 'construction', 'clss', 'मकान', 'घर', 'आवास', 'छत', 'निर्माण']
  };

  const categoryScores = {};
  for (const [cat, kws] of Object.entries(topicKeywords)) {
    let count = 0;
    kws.forEach(kw => {
      if (textLower.includes(kw.toLowerCase())) count += 1;
    });
    categoryScores[cat] = count;
  }

  let primaryCategory = null;
  let maxScore = 0;
  for (const [cat, sc] of Object.entries(categoryScores)) {
    if (sc > maxScore) {
      maxScore = sc;
      primaryCategory = cat;
    }
  }

  const list = Array.isArray(allLoansList) && allLoansList.length > 0 ? allLoansList : [];
  const formalLoans = list.filter(l => l.type === 'formal');
  const scored = formalLoans.map(loan => {
    let score = 52;
    if (primaryCategory && loan.category === primaryCategory) {
      score = 88 + Math.min(10, maxScore * 2);
    } else {
      score += (categoryScores[loan.category] || 0) * 8;
    }

    const content = `${loan.name} ${loan.description || ''} ${loan.benefits || ''}`.toLowerCase();
    const contentHi = `${loan.name_hi || ''} ${loan.description_hi || ''} ${loan.benefits_hi || ''}`.toLowerCase();
    words.forEach(w => {
      if (content.includes(w) || contentHi.includes(w)) {
        score += 3;
      }
    });

    return {
      ...loan,
      match_score: Math.min(99, Math.max(45, score)),
      reason: isHindi
        ? 'आपकी वित्तीय आवश्यकता और व्यवसाय/उद्देश्य के अनुसार पूर्णतः उपयुक्त।'
        : 'Directly tailored to your funding needs and occupation profile.'
    };
  });

  const topLoans = scored.sort((a, b) => b.match_score - a.match_score).slice(0, 6);
  const detectedMeta = primaryCategory ? personaMap[primaryCategory] : null;
  const detectedPersona = detectedMeta
    ? (isHindi ? detectedMeta.hi : detectedMeta.en)
    : (isHindi ? 'नागरिक / ऋण आवेदक' : 'Citizen Loan Applicant');
  const detectedNeed = detectedMeta
    ? (isHindi ? detectedMeta.needHi : detectedMeta.needEn)
    : (isHindi ? 'सरकारी संस्थागत ऋण व ब्याज सब्सिडी' : 'Formal Government Credit & Subsidy');

  return {
    success: true,
    situation_analyzed: query,
    detected_category: primaryCategory || 'General',
    detected_persona: detectedPersona,
    detected_need: detectedNeed,
    loans: topLoans
  };
}

const PRESET_LOAN_SCENARIOS = [
  {
    icon: '🌾',
    labelEn: 'Kisan Credit Card (KCC Crop Loan)',
    labelHi: 'किसान: फसल व खाद-बीज हेतु KCC ऋण (4% ब्याज)',
    situation: 'I am a farmer with 2 acres of land needing working capital for crop cultivation, fertilizer and seeds under Kisan Credit Card with 4% interest.',
    situationHi: 'मेरे पास 2 एकड़ कृषि भूमि है। मुझे खाद, बीज और फसल हेतु रियायती 4% ब्याज पर किसान क्रेडिट कार्ड (KCC) लोन चाहिए।'
  },
  {
    icon: '🛒',
    labelEn: 'Street Vendor / Hawkers (PM SVANidhi)',
    labelHi: 'रेहड़ी-पटरी विक्रेता: फल-सब्जी ठेले हेतु लोन',
    situation: 'I am a street vendor selling vegetables and fruits and need collateral-free loan of Rs 10,000 to Rs 50,000 with 7% interest subsidy.',
    situationHi: 'मैं सड़क किनारे फल और सब्जी का ठेला लगाता हूँ। मुझे बिना गारंटी 10,000 से 50,000 का सरकारी स्वनिधि लोन चाहिए।'
  },
  {
    icon: '🏬',
    labelEn: 'Small Grocery / Shop (PM Mudra Loan)',
    labelHi: 'दुकानदार: किराना दुकान शुरू करने हेतु मुद्रा लोन',
    situation: 'I want to start a grocery shop and buy stock/inventory. I need a collateral-free loan of Rs 1 Lakh to Rs 5 Lakh under PM Mudra Yojana.',
    situationHi: 'मुझे नई किराना दुकान शुरू करने और माल खरीदने हेतु बिना गारंटी 1 से 5 लाख का प्रधानमंत्री मुद्रा लोन चाहिए।'
  },
  {
    icon: '🔨',
    labelEn: 'Artisans & Craftsmen (PM Vishwakarma)',
    labelHi: 'कारीगर / दर्जी / बढ़ई: 5% ब्याज पर टूल-किट लोन',
    situation: 'I am a traditional carpenter/tailor seeking Rs 15,000 free toolkit grant and Rs 1 Lakh to Rs 3 Lakh enterprise loan at 5% interest.',
    situationHi: 'मैं सिलाई और बढ़ई का कार्य करता हूँ। मुझे ₹15,000 की मुफ्त टूल-किट और मात्र 5% ब्याज पर विश्वकर्मा ऋण चाहिए।'
  },
  {
    icon: '🎓',
    labelEn: 'College Student (Vidya Lakshmi Education Loan)',
    labelHi: 'कॉलेज छात्र: बीटेक/मेडिकल फीस हेतु शिक्षा ऋण',
    situation: 'I am a student admitted to engineering college seeking collateral-free education loan up to Rs 7.5 Lakh with 100% interest subsidy during study.',
    situationHi: 'मुझे कॉलेज फीस व पढ़ाई के लिए बिना किसी संपत्ति बंधक के ₹7.5 लाख तक का सरकारी एजुकेशन लोन चाहिए।'
  }
];

function LoanDiscovery() {
  const { t, i18n } = useTranslation();
  const isHindi = i18n.language === 'hi';

  // Mode: 'smart' (Voice/Type AI Matcher) vs 'manual' (Discover Loans Manually)
  const [activeMode, setActiveMode] = useState('smart');

  // Smart Matcher State
  const [situationText, setSituationText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState('');
  const [matchingLoading, setMatchingLoading] = useState(false);
  const [matchedResults, setMatchedResults] = useState(null);

  // Manual Discovery State
  const [loans, setLoans] = useState(ALL_DEMO_LOANS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [onlyCollateralFree, setOnlyCollateralFree] = useState(false);
  const [selectedMaxAmount, setSelectedMaxAmount] = useState('All');

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      const res = await fetch('/api/loans');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setLoans(data);
          return;
        }
      }
      setLoans(ALL_DEMO_LOANS);
    } catch (e) {
      setLoans(ALL_DEMO_LOANS);
    }
  };

  // Voice Input (Web Speech API)
  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechError(
        isHindi
          ? 'आपके ब्राउज़र में वॉइस इनपुट समर्थित नहीं है। कृपया लिखकर बताएं।'
          : 'Voice input is not supported in this browser. Please type your situation.'
      );
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = isHindi ? 'hi-IN' : 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError('');
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const updated = situationText ? situationText + ' ' + transcript : transcript;
        setSituationText(updated);
        setIsListening(false);
      };

      recognition.onerror = (err) => {
        console.warn('Speech error:', err);
        setSpeechError(
          isHindi
            ? 'ध्वनि स्पष्ट नहीं सुनी जा सकी। कृपया पुनः बोलें अथवा टाइप करें।'
            : 'Could not hear clearly. Please try speaking again or type below.'
        );
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      setSpeechError(isHindi ? 'माइक्रोफ़ोन एक्सेस में समस्या हुई।' : 'Error accessing microphone.');
      setIsListening(false);
    }
  };

  // Run Smart Loan Matcher
  const handleRunLoanMatcher = async (textToMatch = null) => {
    const query = typeof textToMatch === 'string' ? textToMatch : situationText;

    if (!query.trim()) {
      setSpeechError(
        isHindi
          ? 'कृपया अपनी आवश्यकता लिखें या बोलें, फिर "पात्र सरकारी लोन खोजें" पर क्लिक करें।'
          : 'Please describe your loan requirement or tap the mic, then click "Find Eligible Loans".'
      );
      return;
    }

    setMatchingLoading(true);
    setSpeechError('');

    try {
      const res = await fetch('/api/loans/match-situation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          situation: query,
          language: isHindi ? 'hi' : 'en'
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.loans) && data.loans.length > 0) {
          setMatchedResults(data);
          setMatchingLoading(false);
          return;
        }
      }
      const localRes = matchLoansLocally(query, isHindi, ALL_DEMO_LOANS);
      setMatchedResults(localRes);
    } catch (err) {
      console.warn('Backend unavailable, running local loan matcher:', err);
      const localRes = matchLoansLocally(query, isHindi, ALL_DEMO_LOANS);
      setMatchedResults(localRes);
    } finally {
      setMatchingLoading(false);
    }
  };

  const applyPreset = (preset) => {
    const sit = isHindi ? preset.situationHi : preset.situation;
    setSituationText(sit);
    setMatchedResults(null); // CRITICAL: Does NOT auto-show loans! User clicks button.
    setSpeechError('');
  };

  // Filtered Loans for Manual Discovery Mode
  const filteredManualLoans = loans.filter((loan) => {
    if (selectedCategory !== 'All' && loan.category !== selectedCategory) {
      return false;
    }
    if (onlyCollateralFree && !loan.collateral_free) {
      return false;
    }
    if (selectedMaxAmount === '50k' && loan.max_amount && loan.max_amount > 50000) {
      return false;
    }
    if (selectedMaxAmount === '5L' && loan.max_amount && loan.max_amount > 500000) {
      return false;
    }
    if (selectedMaxAmount === '10L_plus' && (!loan.max_amount || loan.max_amount < 1000000)) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        loan.name.toLowerCase().includes(q) ||
        (loan.name_hi && loan.name_hi.includes(q)) ||
        (loan.description && loan.description.toLowerCase().includes(q)) ||
        (loan.category && loan.category.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const categories = [
    { key: 'All', labelEn: 'All Schemes', labelHi: 'सभी ऋण योजनाएं' },
    { key: 'Agriculture', labelEn: '🌾 Agriculture (KCC)', labelHi: '🌾 कृषि (KCC)' },
    { key: 'Business', labelEn: '🏬 Small Business (Mudra)', labelHi: '🏬 सूक्ष्म उद्यम (मुद्रा)' },
    { key: 'Street Vendor', labelEn: '🛒 Street Vendor (SVANidhi)', labelHi: '🛒 स्ट्रीट वेंडर (स्वनिधि)' },
    { key: 'Artisans', labelEn: '🔨 Artisans (Vishwakarma)', labelHi: '🔨 कारीगर (विश्वकर्मा)' },
    { key: 'Education', labelEn: '🎓 Education Loan', labelHi: '🎓 शिक्षा ऋण (विद्या लक्ष्मी)' },
    { key: 'Housing', labelEn: '🏠 Home Loan Subsidy', labelHi: '🏠 आवास ऋण सब्सिडी' },
    { key: 'Scam Alert', labelEn: '🛡️ Scam Alerts', labelHi: '🛡️ धोखाधड़ी चेतावनी' }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16 px-4 sm:px-6">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-taupe-200 text-taupe-950 text-xs font-semibold">
          <Banknote size={14} className="text-taupe-800" />
          <span>{isHindi ? 'सत्यापित सरकारी ऋण • शून्य अग्रिम शुल्क' : 'Verified Formal Loans • Zero Advance Fees'}</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-taupe-950">
          {isHindi ? 'सरकारी ऋण खोजक (Loan Discovery)' : 'Government Loan Discovery Portal'}
        </h1>
        <p className="text-xs sm:text-sm text-taupe-600 leading-relaxed">
          {isHindi
            ? 'अपनी व्यवसाय या कृषि आवश्यकता बताएं। जनसेतु बिना गारंटी वाले सरकारी ऋण, ब्याज सब्सिडी और आवश्यक दस्तावेज़ों की सूची तैयार करेगा।'
            : 'Find genuine government-backed collateral-free credit, subsidized interest rates, and required documents for your enterprise or agriculture need.'}
        </p>

        {/* Mode Switcher Tabs */}
        <div className="inline-flex p-1 bg-taupe-100 rounded-2xl border border-taupe-300 shadow-sm mt-3">
          <button
            type="button"
            onClick={() => setActiveMode('smart')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeMode === 'smart'
                ? 'bg-taupe-900 text-taupe-50 shadow'
                : 'text-taupe-700 hover:text-taupe-950'
            }`}
          >
            <Sparkles size={16} className={activeMode === 'smart' ? 'text-amber-300' : ''} />
            <span>{isHindi ? '🎙️ बोलकर या स्थिति से खोजें (AI)' : '🎙️ Match by Need & Voice (AI)'}</span>
          </button>

          {/* USER SPECIFIED: Discover Loans Manually Mode */}
          <button
            type="button"
            onClick={() => setActiveMode('manual')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeMode === 'manual'
                ? 'bg-taupe-900 text-taupe-50 shadow'
                : 'text-taupe-700 hover:text-taupe-950'
            }`}
          >
            <Search size={16} />
            <span>{isHindi ? '🔍 मैन्युअल ऋण खोजक (Discover Loans Manually)' : '🔍 Discover Loans Manually'}</span>
          </button>
        </div>
      </div>

      {/* Cybercrime Warning Alert Banner */}
      <div className="bg-amber-50 border border-amber-300 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-100 text-amber-900 rounded-xl mt-0.5 shrink-0">
            <ShieldAlert size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-amber-950">
              {isHindi ? 'सावधानी: सरकारी ऋण के नाम पर कभी अग्रिम शुल्क या फाइल चार्ज न दें!' : 'Warning: Never Pay Advance Fees for Government Loans!'}
            </h3>
            <p className="text-xs text-amber-800 leading-relaxed mt-0.5">
              {isHindi
                ? 'मुद्रा, स्वनिधि, केसीसी या किसी भी सरकारी योजना में कोई फाइल चार्ज या बीमा शुल्क पहले नहीं मांगा जाता। अवैध लोन ऐप्स से बचें।'
                : 'The Government of India never charges processing fees or file verification charges via WhatsApp, Telegram, or UPI.'}
            </p>
          </div>
        </div>

        <a
          href="https://cybercrime.gov.in/"
          target="_blank"
          rel="noreferrer"
          className="px-4 py-2 bg-amber-900 hover:bg-amber-950 text-amber-50 text-xs font-bold rounded-xl whitespace-nowrap flex items-center gap-1.5 transition-colors shrink-0"
        >
          <span>Report Cyber Fraud (1930)</span>
          <ExternalLink size={12} />
        </a>
      </div>

      {/* ========================================================= */}
      {/* MODE 1: SMART VOICE / TYPE LOAN FINDER (LIKE SCHEMES)    */}
      {/* ========================================================= */}
      {activeMode === 'smart' && (
        <div className="space-y-6">
          {/* Main Voice/Text Input Card */}
          <div className="bg-white border-2 border-taupe-300 rounded-3xl p-5 sm:p-8 shadow-sm space-y-6">
            
            {/* Quick 1-Click Persona Prompts */}
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-taupe-500 mb-2 flex items-center gap-1.5">
                <Sparkles size={14} className="text-taupe-700" />
                <span>{isHindi ? 'त्वरित उदाहरण (चुनें और खोजें):' : 'Quick Scenarios (Select to Fill):'}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
                {PRESET_LOAN_SCENARIOS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className="p-3 bg-taupe-50 hover:bg-taupe-100 border border-taupe-200 hover:border-taupe-400 rounded-2xl text-left transition-all group"
                  >
                    <div className="text-base mb-1">{preset.icon}</div>
                    <div className="text-xs font-bold text-taupe-900 group-hover:text-taupe-950">
                      {isHindi ? preset.labelHi : preset.labelEn}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Input Box with Animated Mic */}
            <div className="pt-3 border-t border-taupe-200 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <label className="text-sm font-bold text-taupe-950 flex items-center gap-2">
                  <Banknote size={18} className="text-taupe-800" />
                  <span>
                    {isHindi
                      ? 'अपनी ऋण आवश्यकता या व्यवसाय बताएं (माइक पर बोलें या नीचे लिखें)'
                      : 'Describe Your Loan Need or Business (Tap Mic to Speak or Type below)'}
                  </span>
                </label>

                {/* Animated Mic Button */}
                <button
                  type="button"
                  onClick={handleVoiceInput}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all shadow-sm ${
                    isListening
                      ? 'bg-rose-600 text-white animate-pulse ring-4 ring-rose-200'
                      : 'bg-taupe-900 hover:bg-black text-taupe-50'
                  }`}
                >
                  {isListening ? (
                    <>
                      <MicOff size={15} />
                      <span>{isHindi ? 'सुन रहा हूँ... बोलिए' : 'Listening... Speak now'}</span>
                    </>
                  ) : (
                    <>
                      <Mic size={15} />
                      <span>{isHindi ? 'माइक पर बोलें (Voice Input)' : 'Speak Your Need (Voice)'}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Text Area */}
              <div className="relative">
                <textarea
                  rows={3}
                  value={situationText}
                  onChange={(e) => {
                    setSituationText(e.target.value);
                    if (speechError) setSpeechError('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleRunLoanMatcher();
                    }
                  }}
                  placeholder={
                    isHindi
                      ? 'जैसे: "मुझे किराना दुकान के विस्तार हेतु ₹2 लाख का बिना गारंटी मुद्रा लोन चाहिए..." अथवा "2 एकड़ खेती हेतु KCC 4% रियायती लोन चाहिए..." (टाइप करके नीचे "पात्र सरकारी लोन खोजें" पर क्लिक करें)'
                      : 'e.g. "I need a collateral-free loan of Rs 2 Lakh to expand my grocery store..." or "Farmer needing subsidized 4% crop credit under Kisan Credit Card..."'
                  }
                  className="w-full p-4 bg-taupe-50 rounded-2xl border border-taupe-300 text-sm text-taupe-950 focus:outline-none focus:ring-2 focus:ring-taupe-700 leading-relaxed placeholder-taupe-400"
                />
              </div>

              {speechError && (
                <div className="text-xs text-rose-600 flex items-center gap-1.5 font-medium">
                  <AlertTriangle size={14} />
                  <span>{speechError}</span>
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => {
                  setSituationText('');
                  setMatchedResults(null);
                  setSpeechError('');
                }}
                className="text-xs font-semibold text-taupe-500 hover:text-taupe-800 flex items-center gap-1"
              >
                <RotateCcw size={13} />
                <span>{isHindi ? 'साफ़ करें' : 'Clear'}</span>
              </button>

              {/* PRIMARY ACTION BUTTON: Loans ONLY show after clicking this */}
              <button
                type="button"
                disabled={matchingLoading}
                onClick={() => handleRunLoanMatcher()}
                className="px-6 py-3 bg-taupe-900 hover:bg-black text-taupe-50 text-xs sm:text-sm font-bold rounded-xl flex items-center gap-2 shadow-md transition-all disabled:opacity-50 hover:shadow-lg active:scale-95"
              >
                <Sparkles size={16} className="text-amber-300" />
                <span>
                  {matchingLoading
                    ? (isHindi ? 'पात्रता व ब्याज सब्सिडी की गणना जारी...' : 'Finding Eligible Loans...')
                    : (isHindi ? 'पात्र सरकारी लोन खोजें' : 'Find Eligible Loans')}
                </span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>

          {/* STATE 1: INITIAL STATE (NO LOANS BEFORE CLICKING) */}
          {!matchedResults && !matchingLoading && (
            <div className="bg-white border-2 border-dashed border-taupe-300 rounded-3xl p-8 sm:p-12 text-center space-y-4 shadow-2xs">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-taupe-100 border border-taupe-200 flex items-center justify-center text-3xl shadow-inner">
                🏦
              </div>
              <div className="max-w-md mx-auto space-y-1.5">
                <h3 className="text-base sm:text-lg font-extrabold text-taupe-950">
                  {isHindi ? 'पात्र सरकारी लोन खोजने के लिए तैयार' : 'Ready to Discover Your Eligible Government Loans'}
                </h3>
                <p className="text-xs text-taupe-600 leading-relaxed">
                  {isHindi
                    ? 'ऊपर अपनी आवश्यकता लिखें या बोलें, फिर "पात्र सरकारी लोन खोजें" बटन पर क्लिक करें। आपकी पात्रता, अधिकतम ऋण राशि, ब्याज सब्सिडी और आवश्यक दस्तावेज़ तभी प्रदर्शित होंगे।'
                    : 'Describe your funding need above, then click "Find Eligible Loans". Your eligible credit schemes, interest subsidies, and required documents will appear here.'}
                </p>
              </div>

              {/* 3 Step Instruction Pills */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl mx-auto pt-3 text-left">
                <div className="p-3 bg-taupe-50 rounded-2xl border border-taupe-200">
                  <span className="text-[10px] font-bold text-taupe-500 uppercase tracking-wider block">चरण 1</span>
                  <span className="text-xs font-bold text-taupe-900 block mt-0.5">ऋण आवश्यकता बताएं</span>
                  <span className="text-[11px] text-taupe-600 block mt-0.5">दुकान, कृषि, वेंडर या शिक्षा</span>
                </div>
                <div className="p-3 bg-taupe-50 rounded-2xl border border-taupe-200">
                  <span className="text-[10px] font-bold text-taupe-500 uppercase tracking-wider block">चरण 2</span>
                  <span className="text-xs font-bold text-taupe-900 block mt-0.5">बटन पर क्लिक करें</span>
                  <span className="text-[11px] text-taupe-600 block mt-0.5">"पात्र सरकारी लोन खोजें"</span>
                </div>
                <div className="p-3 bg-taupe-50 rounded-2xl border border-taupe-200">
                  <span className="text-[10px] font-bold text-taupe-500 uppercase tracking-wider block">चरण 3</span>
                  <span className="text-xs font-bold text-taupe-900 block mt-0.5">सब्सिडी व दस्तावेज़ देखें</span>
                  <span className="text-[11px] text-taupe-600 block mt-0.5">बिना गारंटी सीमा व आवेदन लिंक</span>
                </div>
              </div>
            </div>
          )}

          {/* STATE 2: LOADING */}
          {matchingLoading && (
            <div className="bg-white border-2 border-taupe-200 rounded-3xl p-10 sm:p-14 text-center space-y-4 shadow-sm animate-pulse">
              <div className="w-14 h-14 mx-auto rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-2xl animate-spin">
                <Sparkles size={26} />
              </div>
              <h3 className="text-base font-extrabold text-taupe-950">
                {isHindi ? 'सरकारी संस्थागत ऋण व ब्याज सब्सिडी की गणना जारी...' : 'Analyzing credit eligibility & interest subsidies...'}
              </h3>
              <p className="text-xs text-taupe-600 max-w-sm mx-auto">
                {isHindi
                  ? 'कृपया प्रतीक्षा करें, जनसेतु आपके व्यवसाय हेतु बिना गारंटी वाले ऋणों की जांच कर रहा है।'
                  : 'Please wait, JanSetu is verifying CGFMU/CGTMSE collateral exemption limits.'}
              </p>
            </div>
          )}

          {/* STATE 3: RESULTS (RENDERED ONLY AFTER BUTTON CLICK) */}
          {matchedResults && !matchingLoading && (
            <div className="space-y-6 animate-fade-in">
              {/* Analysis Banner */}
              <div className="p-4 sm:p-5 bg-emerald-50 border border-emerald-200 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white border border-emerald-300 text-emerald-800 flex items-center justify-center font-extrabold text-lg shrink-0 shadow-xs">
                    🎯
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                      <Sparkles size={11} />
                      <span>{isHindi ? 'ऋण आवश्यकता विश्लेषण' : 'Loan Applicant Profile Analysis'}</span>
                    </div>
                    <div className="text-sm font-extrabold text-taupe-950 flex flex-wrap items-center gap-2 mt-0.5">
                      <span>{matchedResults.detected_persona}</span>
                      <span>•</span>
                      <span className="text-emerald-800 font-semibold text-xs">
                        {matchedResults.detected_need}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-xs font-bold px-3 py-1.5 bg-white text-emerald-800 border border-emerald-300 rounded-xl shadow-xs self-stretch sm:self-auto text-center">
                  {isHindi ? '✓ 100% सत्यापित सरकारी ऋण योजनाएं' : '✓ Verified Government Credit Programs'}
                </div>
              </div>

              {/* Loans Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(matchedResults.loans || []).map((loan) => (
                  <div
                    key={loan.id}
                    className="bg-white border-2 border-taupe-200 hover:border-taupe-400 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Category & Match Score */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-taupe-100 text-taupe-800 px-2.5 py-1 rounded-full border border-taupe-200">
                          {loan.category}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                            {loan.match_score}% {isHindi ? 'पात्रता' : 'Match'}
                          </span>
                          {loan.collateral_free && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                              {isHindi ? 'बिना गारंटी' : 'No Collateral'}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Loan Name & Limit */}
                      <h3 className="text-base font-bold text-taupe-950 mb-1 leading-snug">
                        {isHindi && loan.name_hi ? loan.name_hi : loan.name}
                      </h3>

                      {loan.max_amount && (
                        <div className="text-xs font-bold text-taupe-800 mb-2">
                          {isHindi ? 'ऋण सीमा:' : 'Limit:'} ₹{(loan.max_amount).toLocaleString('en-IN')} {isHindi ? 'तक' : 'Max'}
                        </div>
                      )}

                      <p className="text-xs text-taupe-600 line-clamp-2 leading-relaxed mb-3">
                        {isHindi && loan.description_hi ? loan.description_hi : loan.description}
                      </p>

                      {/* Interest & Benefits */}
                      <div className="bg-taupe-50 border border-taupe-200 rounded-2xl p-3 mb-3 text-xs space-y-1">
                        <div>
                          <strong className="text-taupe-900">{isHindi ? 'ब्याज दर:' : 'Interest Rate:'}</strong>{' '}
                          <span className="text-emerald-800 font-semibold">{loan.interest_rate}</span>
                        </div>
                        <div>
                          <strong className="text-taupe-900">{isHindi ? 'प्रमुख लाभ:' : 'Key Benefits:'}</strong>{' '}
                          <span className="text-taupe-700">{isHindi && loan.benefits_hi ? loan.benefits_hi : loan.benefits}</span>
                        </div>
                        <div>
                          <strong className="text-taupe-900">{isHindi ? 'संस्थान:' : 'Lenders:'}</strong>{' '}
                          <span className="text-taupe-600 text-[11px]">{loan.institution}</span>
                        </div>
                      </div>

                      {/* Required Documents Checklist */}
                      {loan.required_documents && (
                        <div className="bg-taupe-100/60 border border-taupe-200 rounded-2xl p-3.5 mb-4 space-y-1.5">
                          <div className="text-[11px] font-bold text-taupe-900 flex items-center gap-1.5">
                            <ClipboardList size={13} className="text-taupe-700" />
                            <span>{isHindi ? 'आवश्यक दस्तावेज़ चेकलिस्ट:' : 'Required Documents Checklist:'}</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5 pt-0.5">
                            {loan.required_documents.map((doc, dIdx) => (
                              <span
                                key={dIdx}
                                className="inline-flex items-center gap-1 text-[11px] font-medium bg-white text-taupe-800 border border-taupe-300 px-2 py-0.5 rounded-lg shadow-2xs"
                              >
                                <FileCheck size={11} className="text-emerald-700 shrink-0" />
                                <span>{doc}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bottom Action Link */}
                    <div className="pt-3 border-t border-taupe-100">
                      <a
                        href={loan.official_url}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full text-center py-2.5 bg-taupe-900 hover:bg-black text-taupe-50 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95"
                      >
                        <span>{isHindi ? 'आधिकारिक पोर्टल पर आवेदन करें' : 'Apply on Official Portal'}</span>
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* MODE 2: DISCOVER LOANS MANUALLY (CATEGORY & AMOUNT)       */}
      {/* ========================================================= */}
      {activeMode === 'manual' && (
        <div className="space-y-6 animate-fade-in">
          {/* Filter & Search Bar */}
          <div className="bg-white border-2 border-taupe-300 rounded-3xl p-5 sm:p-7 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-taupe-950">
                <SlidersHorizontal size={18} className="text-taupe-800" />
                <span>{isHindi ? 'मैन्युअल ऋण खोज व फिल्टर (Discover Loans Manually)' : 'Discover Loans Manually (Filters)'}</span>
              </div>
              <span className="text-xs font-semibold text-taupe-500">
                {filteredManualLoans.length} {isHindi ? 'योजनाएं उपलब्ध' : 'schemes found'}
              </span>
            </div>

            {/* Keyword Search Input */}
            <div className="relative">
              <Search size={18} className="absolute left-3.5 top-3 text-taupe-400" />
              <input
                type="text"
                placeholder={isHindi ? 'ऋण का नाम, उद्देश्य या बैंक खोजें (जैसे: मुद्रा, KCC, शिक्षा)...' : 'Search loan name, category, or keyword (e.g. Mudra, KCC, Student)...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-taupe-50 rounded-xl border border-taupe-300 text-sm text-taupe-900 focus:outline-none focus:ring-2 focus:ring-taupe-700"
              />
            </div>

            {/* Category Pills */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-taupe-700 uppercase tracking-wider block">
                {isHindi ? 'श्रेणी चुनें (Category):' : 'Select Category:'}
              </label>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs">
                {categories.map((cat) => {
                  const isSelected = selectedCategory === cat.key;
                  return (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => setSelectedCategory(cat.key)}
                      className={`px-3.5 py-1.5 rounded-full font-semibold whitespace-nowrap transition-all ${
                        isSelected
                          ? 'bg-taupe-900 text-taupe-50 shadow-sm'
                          : 'bg-taupe-100 text-taupe-800 hover:bg-taupe-200'
                      }`}
                    >
                      {isHindi ? cat.labelHi : cat.labelEn}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Filters: Amount Range & Collateral */}
            <div className="pt-3 border-t border-taupe-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-taupe-700">{isHindi ? 'ऋण सीमा:' : 'Amount:'}</span>
                <button
                  type="button"
                  onClick={() => setSelectedMaxAmount('All')}
                  className={`px-2.5 py-1 rounded-lg font-semibold border ${
                    selectedMaxAmount === 'All' ? 'bg-taupe-850 text-taupe-50 border-taupe-900' : 'bg-white text-taupe-700 border-taupe-300'
                  }`}
                >
                  {isHindi ? 'सभी' : 'All'}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMaxAmount('50k')}
                  className={`px-2.5 py-1 rounded-lg font-semibold border ${
                    selectedMaxAmount === '50k' ? 'bg-taupe-850 text-taupe-50 border-taupe-900' : 'bg-white text-taupe-700 border-taupe-300'
                  }`}
                >
                  ₹50,000 {isHindi ? 'तक' : 'Max'}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMaxAmount('5L')}
                  className={`px-2.5 py-1 rounded-lg font-semibold border ${
                    selectedMaxAmount === '5L' ? 'bg-taupe-850 text-taupe-50 border-taupe-900' : 'bg-white text-taupe-700 border-taupe-300'
                  }`}
                >
                  ₹5 {isHindi ? 'लाख तक' : 'Lakh Max'}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMaxAmount('10L_plus')}
                  className={`px-2.5 py-1 rounded-lg font-semibold border ${
                    selectedMaxAmount === '10L_plus' ? 'bg-taupe-850 text-taupe-50 border-taupe-900' : 'bg-white text-taupe-700 border-taupe-300'
                  }`}
                >
                  ₹10 {isHindi ? 'लाख+' : 'Lakh+'}
                </button>
              </div>

              {/* Collateral Free Checkbox */}
              <label className="flex items-center gap-2 cursor-pointer font-bold text-taupe-850 bg-taupe-50 px-3 py-1.5 rounded-xl border border-taupe-200">
                <input
                  type="checkbox"
                  checked={onlyCollateralFree}
                  onChange={(e) => setOnlyCollateralFree(e.target.checked)}
                  className="rounded border-taupe-300 text-taupe-900 focus:ring-taupe-700"
                />
                <span>{isHindi ? 'केवल बिना गारंटी वाले लोन (Collateral-Free Only)' : 'Collateral-Free Only'}</span>
              </label>
            </div>
          </div>

          {/* Manual Loans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredManualLoans.map((loan) => {
              const isSuspicious = loan.type === 'suspicious';
              return (
                <div
                  key={loan.id}
                  className={`rounded-3xl p-6 border shadow-sm flex flex-col justify-between transition-all ${
                    isSuspicious
                      ? 'bg-rose-50/70 border-rose-300'
                      : 'bg-white border-taupe-200 hover:border-taupe-400'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                        isSuspicious
                          ? 'bg-rose-100 text-rose-900 border border-rose-300'
                          : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      }`}>
                        {isSuspicious ? (isHindi ? 'धोखाधड़ी चेतावनी' : 'Scam Alert') : (isHindi ? 'सत्यापित सरकारी ऋण' : 'Formal Government Loan')}
                      </span>

                      {loan.max_amount && (
                        <span className="text-xs font-bold text-taupe-900">
                          {isHindi ? 'सीमा:' : 'Limit:'} ₹{(loan.max_amount).toLocaleString('en-IN')} {isHindi ? 'तक' : 'Max'}
                        </span>
                      )}
                    </div>

                    <h3 className={`text-base font-bold mb-1.5 ${isSuspicious ? 'text-rose-950' : 'text-taupe-950'}`}>
                      {isHindi && loan.name_hi ? loan.name_hi : loan.name}
                    </h3>

                    <p className="text-xs text-taupe-700 leading-relaxed mb-4">
                      {isHindi && loan.description_hi ? loan.description_hi : loan.description}
                    </p>

                    {loan.warning && (
                      <div className="p-3 bg-rose-100 border border-rose-300 rounded-xl text-xs text-rose-950 mb-4 font-semibold">
                        {loan.warning}
                      </div>
                    )}

                    <div className="text-xs space-y-1.5 text-taupe-600 border-t border-taupe-100 pt-3 mb-4">
                      <div>
                        <strong className="text-taupe-900">{isHindi ? 'ब्याज दर:' : 'Interest Rate:'}</strong> {loan.interest_rate}
                      </div>
                      <div>
                        <strong className="text-taupe-900">{isHindi ? 'संस्थान:' : 'Lenders:'}</strong> {loan.institution}
                      </div>
                      {loan.collateral_free && (
                        <div className="text-emerald-700 font-bold">
                          ✓ {isHindi ? '100% बिना गारंटी (No Collateral Required)' : '100% Collateral-Free'}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-taupe-200">
                    {isSuspicious ? (
                      <a
                        href="https://cybercrime.gov.in/"
                        target="_blank"
                        rel="noreferrer"
                        className="w-full text-center py-2.5 bg-rose-800 hover:bg-rose-900 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <span>{isHindi ? 'साइबर पुलिस में रिपोर्ट करें (1930)' : 'Report Fraud to Cyber Police (1930)'}</span>
                        <ExternalLink size={12} />
                      </a>
                    ) : (
                      <a
                        href={loan.official_url}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full text-center py-2.5 bg-taupe-900 hover:bg-black text-taupe-50 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                      >
                        <span>{isHindi ? 'आधिकारिक पोर्टल पर आवेदन करें' : 'Apply via Official Portal'}</span>
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredManualLoans.length === 0 && (
            <div className="bg-white border-2 border-dashed border-taupe-300 rounded-3xl p-10 text-center space-y-2">
              <Search size={32} className="mx-auto text-taupe-400" />
              <h3 className="text-sm font-bold text-taupe-900">
                {isHindi ? 'कोई ऋण योजना नहीं मिली' : 'No loans matched your filters'}
              </h3>
              <p className="text-xs text-taupe-500">
                {isHindi ? 'कृपया सर्च क्वेरी या श्रेणी फिल्टर बदलकर पुनः प्रयास करें।' : 'Try resetting your category or amount filter.'}
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('All');
                  setSearchQuery('');
                  setOnlyCollateralFree(false);
                  setSelectedMaxAmount('All');
                }}
                className="mt-2 px-4 py-2 bg-taupe-850 text-taupe-50 text-xs font-bold rounded-xl"
              >
                {isHindi ? 'फिल्टर रीसेट करें' : 'Reset Filters'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Red Flags Checklist for Citizens */}
      <div className="bg-white border border-taupe-300 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <h2 className="text-base sm:text-lg font-bold text-taupe-950 flex items-center gap-2">
          <ShieldAlert size={20} className="text-amber-800" />
          <span>{isHindi ? 'अवैध लोन की पहचान करने के 4 मुख्य लक्षण (Red Flags)' : '4 Red Flags of Predatory Fake Loans'}</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-taupe-800">
          <div className="p-4 bg-taupe-50 rounded-2xl border border-taupe-200 leading-relaxed">
            <strong className="text-taupe-950 block mb-1">1. Demanding Contacts & Gallery Access:</strong>
            {isHindi
              ? 'असली बैंक कभी आपके फोन कॉन्टैक्ट्स या फोटो गैलरी की अनुमति नहीं मांगते। सिर्फ अवैध चीनी व फर्जी ऐप्स ऐसा करते हैं।'
              : 'Legitimate banks never ask for personal phone contacts or photo gallery permissions.'}
          </div>
          <div className="p-4 bg-taupe-50 rounded-2xl border border-taupe-200 leading-relaxed">
            <strong className="text-taupe-950 block mb-1">2. Demanding Advance Money / Processing Fee:</strong>
            {isHindi
              ? 'ठग लोन देने से पहले ₹1,500 से ₹5,000 "फाइल चार्ज" या "जीएसटी" के नाम पर मांगते हैं। सरकार कभी अग्रिम शुल्क नहीं मांगती।'
              : 'Fraudsters ask for Rs 1,500 to Rs 5,000 as "file charge" before disbursing loan.'}
          </div>
          <div className="p-4 bg-taupe-50 rounded-2xl border border-taupe-200 leading-relaxed">
            <strong className="text-taupe-950 block mb-1">3. Short 7-Day Repayment Periods:</strong>
            {isHindi
              ? 'फर्जी इंस्टेंट ऐप्स केवल 7 दिन का समय देते हैं और फिर गंदे मैसेज व धमकियां देकर ब्लैकमेल करते हैं।'
              : 'Fake instant loan apps enforce predatory 7-day deadlines with abusive harassment.'}
          </div>
          <div className="p-4 bg-taupe-50 rounded-2xl border border-taupe-200 leading-relaxed">
            <strong className="text-taupe-950 block mb-1">4. Not Listed on RBI Sachet Portal:</strong>
            {isHindi
              ? 'ऋण लेने से पहले हमेशा sachet.rbi.org.in पर जांचें कि क्या कंपनी भारतीय रिज़र्व बैंक से पंजीकृत है।'
              : 'Always check if the lender is an RBI-registered NBFC on sachet.rbi.org.in.'}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoanDiscovery;
