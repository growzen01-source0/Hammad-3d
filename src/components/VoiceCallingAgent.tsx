import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Send,
  Calendar,
  MessageSquare,
  ChevronDown,
  X,
  AlertCircle,
  Radio,
  Globe,
} from 'lucide-react';
import { AGENCY_INFO, SERVICES_DATA } from '../data/agencyData';

// Types for SpeechRecognition
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface IWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

export type LanguageMode = 'auto' | 'ur' | 'en';

interface Message {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  lang: 'ur' | 'en';
  timestamp: string;
  action?: 'booking' | 'whatsapp' | 'trial';
}

interface VoiceCallingAgentProps {
  onOpenBooking?: (serviceId?: string) => void;
}

// Conversation context for smart, multi-turn sales consultation
type ServiceTopic =
  | 'card'
  | 'website'
  | 'social_media'
  | 'logo'
  | 'meta_ads'
  | 'menu'
  | 'pricing'
  | 'trial'
  | 'general';

interface ConversationContext {
  topic: ServiceTopic;
  step: number;
  subType?: string;
}

// Language detection: checks Urdu/Arabic script OR common Roman Urdu keywords
export function detectLanguage(text: string): 'ur' | 'en' {
  if (!text || !text.trim()) return 'en';

  // Check 1: Urdu / Arabic Unicode characters
  const urduCharRegex = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/;
  if (urduCharRegex.test(text)) {
    return 'ur';
  }

  // Check 2: Roman Urdu common keywords
  const romanUrduKeywords =
    /\b(kya|kaise|kese|kyun|kyu|hai|hain|haan|han|nahi|nahin|na|shukriya|mujhe|hum|humein|ap|aap|apka|aapka|batao|bataen|bataiye|kitna|kitne|kitni|chahiye|karo|karein|karna|rabta|pesay|paise|pese|kharcha|shuru|theek|salam|assalam|walaikum|kaam|khidmat|khidmaat|waghera|bhi|aur|mein|par|se|ko|wala|wali|wale|kuch|rate|charges|bohat|achha|acha|karwani|banwani|karwana|banwana|chahye|karna|chahata|chahati|shadi|shaadi|card|visiting|dost|bhai|janab)\b/i;

  if (romanUrduKeywords.test(text)) {
    return 'ur';
  }

  return 'en';
}

export const VoiceCallingAgent: React.FC<VoiceCallingAgentProps> = ({ onOpenBooking }) => {
  // Call state
  const [isOpen, setIsOpen] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [agentStatus, setAgentStatus] = useState<'idle' | 'listening' | 'thinking' | 'speaking' | 'connecting'>('idle');
  const [permissionError, setPermissionError] = useState<string | null>(null);

  // Language management: Auto, Roman Urdu, English
  const [langMode, setLangMode] = useState<LanguageMode>('auto');
  const [activeLang, setActiveLang] = useState<'ur' | 'en'>('en');

  // Transcript & messages
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [textInput, setTextInput] = useState('');

  // Lead capture state
  const [leadCaptured, setLeadCaptured] = useState(false);
  const [leadName, setLeadName] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadService, setLeadService] = useState('Website Development');

  // Audio wave visualizer levels
  const [audioLevels, setAudioLevels] = useState<number[]>([12, 24, 18, 30, 20, 15, 26, 14]);

  // Conversational context ref to track active dialogue state
  const convoContextRef = useRef<ConversationContext>({
    topic: 'general',
    step: 0,
  });

  // Speech Recognition & Synthesis references
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const isCallingRef = useRef(false);
  isCallingRef.current = isCalling;
  const isMutedRef = useRef(false);
  isMutedRef.current = isMuted;
  const isSpeakerMutedRef = useRef(false);
  isSpeakerMutedRef.current = isSpeakerMuted;
  const langModeRef = useRef<LanguageMode>(langMode);
  langModeRef.current = langMode;
  const activeLangRef = useRef<'ur' | 'en'>(activeLang);
  activeLangRef.current = activeLang;

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<any>(null);

  // Initialize Speech Synthesis & pre-load available voices
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
      window.speechSynthesis.getVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => {
          window.speechSynthesis.getVoices();
        };
      }
    }
  }, []);

  // Call duration timer
  useEffect(() => {
    if (isCalling) {
      setCallDuration(0);
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isCalling]);

  // Audio wave visualizer animation
  useEffect(() => {
    if (isCalling && (agentStatus === 'speaking' || agentStatus === 'listening')) {
      const interval = setInterval(() => {
        setAudioLevels((prev) =>
          prev.map(() => Math.floor(Math.random() * (agentStatus === 'speaking' ? 36 : 24) + 8))
        );
      }, 120);
      return () => clearInterval(interval);
    } else {
      setAudioLevels([10, 14, 12, 16, 14, 12, 15, 10]);
    }
  }, [isCalling, agentStatus]);

  // Auto-scroll messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, currentTranscript]);

  // Format call duration
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  /**
   * Speak agent response with natural, human-like cadence:
   * 1. Prioritizes South Asian English voices (en-IN, hi-IN) or natural neural voices
   *    which pronounce Roman Urdu vowels and retroflex consonants authentic to Pakistan/South Asia.
   * 2. Sets speech rate to 0.86 (relaxed human conversational pace, avoiding robotic rush).
   * 3. Warms the pitch to 1.02 for friendly consultant tone.
   * 4. Preprocesses abbreviations ($28 -> twenty-eight dollars, 3D -> three D, QR -> Q R)
   *    so the synthesizer never trips or produces robotic artifacts.
   */
  const speakText = useCallback((text: string, lang: 'ur' | 'en') => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setAgentStatus('idle');
      return;
    }

    const synth = window.speechSynthesis;
    if (isSpeakerMutedRef.current) {
      setAgentStatus('idle');
      return;
    }

    // Cancel ongoing speech & resume engine if suspended
    synth.cancel();
    if (synth.paused) {
      synth.resume();
    }

    // Phonetic smoothing for natural vocal flow
    let spokenText = text
      .replace(/[*_#`~[\]()]/g, '')
      .replace(/\$28/g, 'twenty eight dollars')
      .replace(/\$149/g, 'one hundred forty nine dollars')
      .replace(/\$75/g, 'seventy five dollars')
      .replace(/\$15/g, 'fifteen dollars')
      .replace(/\$35/g, 'thirty five dollars')
      .replace(/\$250/g, 'two hundred fifty dollars')
      .replace(/3-day/gi, 'three day')
      .replace(/3D/gi, 'three D')
      .replace(/UI\/UX/gi, 'U I U X')
      .replace(/ROAS/gi, 'R O A S')
      .replace(/QR/gi, 'Q R')
      .replace(/Assalam-o-Alaikum/gi, 'Assalam o Alaikum')
      .replace(/Walaikum Assalam/gi, 'Walaikum Assalam')
      .replace(/\s+/g, ' ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(spokenText);
    currentUtteranceRef.current = utterance;

    // Natural human pacing & warm pitch
    if (lang === 'ur') {
      utterance.lang = 'en-US';
      utterance.rate = 0.86; // Slower, relaxed natural human speed
      utterance.pitch = 1.02; // Warm, friendly conversational tone
    } else {
      utterance.lang = 'en-US';
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
    }

    const voices = synth.getVoices();

    // Voice selection hierarchy:
    // For Roman Urdu: Pick South Asian English (en-IN / hi-IN) or natural/neural voices
    let selectedVoice: SpeechSynthesisVoice | null = null;

    if (lang === 'ur') {
      selectedVoice =
        voices.find(
          (v) =>
            v.lang.toLowerCase().includes('en-in') ||
            v.name.toLowerCase().includes('india') ||
            v.lang.toLowerCase().includes('hi-in') ||
            v.name.toLowerCase().includes('ravi') ||
            v.name.toLowerCase().includes('heera') ||
            v.name.toLowerCase().includes('neerja') ||
            v.name.toLowerCase().includes('sangeeta')
        ) ||
        voices.find(
          (v) =>
            (v.name.toLowerCase().includes('natural') || v.name.toLowerCase().includes('neural')) &&
            v.lang.startsWith('en')
        ) ||
        voices.find(
          (v) =>
            v.name.toLowerCase().includes('google') &&
            (v.lang.includes('en-GB') || v.lang.includes('en-US'))
        ) ||
        voices.find(
          (v) =>
            v.name.toLowerCase().includes('samantha') ||
            v.name.toLowerCase().includes('jenny') ||
            v.name.toLowerCase().includes('karen') ||
            v.name.toLowerCase().includes('serena')
        ) ||
        voices.find((v) => v.lang.startsWith('en')) ||
        voices[0] ||
        null;
    } else {
      selectedVoice =
        voices.find(
          (v) =>
            (v.name.toLowerCase().includes('natural') || v.name.toLowerCase().includes('neural')) &&
            v.lang.startsWith('en')
        ) ||
        voices.find(
          (v) =>
            v.name.toLowerCase().includes('google') &&
            (v.lang.includes('en-US') || v.lang.includes('en-GB'))
        ) ||
        voices.find(
          (v) =>
            v.name.toLowerCase().includes('samantha') ||
            v.name.toLowerCase().includes('jenny') ||
            v.name.toLowerCase().includes('guy')
        ) ||
        voices.find((v) => v.lang.startsWith('en')) ||
        voices[0] ||
        null;
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onstart = () => {
      setAgentStatus('speaking');
    };

    utterance.onend = () => {
      currentUtteranceRef.current = null;
      if (isCallingRef.current && !isMutedRef.current) {
        setAgentStatus('listening');
        try {
          recognitionRef.current?.start();
        } catch {
          // Safe
        }
      } else {
        setAgentStatus('idle');
      }
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis utterance notice:', e);
      currentUtteranceRef.current = null;
      if (isCallingRef.current && !isMutedRef.current) {
        setAgentStatus('listening');
      } else {
        setAgentStatus('idle');
      }
    };

    synth.speak(utterance);
  }, []);

  /**
   * Smart, Attentive Sales Consultant Engine:
   * Directly addresses what the user specifically asks (e.g. card, website, social media, logo, ads),
   * asks relevant follow-up questions, maintains dialogue state across turns,
   * and speaks in a friendly, conversational Pakistani tone.
   */
  const generateAgentReply = useCallback(
    (userQuery: string, targetLang: 'ur' | 'en'): { reply: string; action?: 'booking' | 'whatsapp' | 'trial' } => {
      const q = userQuery.toLowerCase().trim();
      const ctx = convoContextRef.current;

      // =========================================================================
      // 1. ROMAN URDU CONSULTATION FLOW (Warm, Attentive, Context-Aware)
      // =========================================================================
      if (targetLang === 'ur') {
        // -----------------------------------------------------------------------
        // CATEGORY A: CARD DESIGN (Wedding, Birthday, Visiting, Event Cards)
        // -----------------------------------------------------------------------
        const isCardInquiry =
          q.includes('card') ||
          q.includes('visiting') ||
          q.includes('shadi') ||
          q.includes('shaadi') ||
          q.includes('wedding') ||
          q.includes('invitation') ||
          q.includes('birthday') ||
          q.includes('event card') ||
          q.includes('business card') ||
          q.includes('کارڈ');

        if (isCardInquiry || ctx.topic === 'card') {
          // A1: User mentions wedding/shadi card
          if (
            q.includes('shadi') ||
            q.includes('shaadi') ||
            q.includes('wedding') ||
            q.includes('nikkah') ||
            q.includes('barat') ||
            q.includes('walima')
          ) {
            ctx.topic = 'card';
            ctx.step = 2;
            ctx.subType = 'wedding';
            return {
              reply:
                'Bohat mubarak ho! Wedding cards ke liye hum luxury digital video invitations aur elegant print designs dono banate hain. Aap batayein, aap ko digital video card chahiye ya physical print wala design?',
              action: 'whatsapp',
            };
          }

          // A2: User mentions birthday or party
          if (q.includes('birthday') || q.includes('party') || q.includes('salgirah')) {
            ctx.topic = 'card';
            ctx.step = 2;
            ctx.subType = 'birthday';
            return {
              reply:
                'Zabardast! Birthday cards ke liye hum customized photos aur modern animated themes banate hain. Event kab ka hai, aur kya koi specific theme ya color pasand hai?',
              action: 'whatsapp',
            };
          }

          // A3: User mentions business or visiting card
          if (q.includes('visiting') || q.includes('business') || q.includes('office')) {
            ctx.topic = 'card';
            ctx.step = 2;
            ctx.subType = 'visiting';
            return {
              reply:
                'Bohot khoob! Professional business cards aap ke brand ka first impression hote hain. Hum premium minimalist aur NFC digital visiting cards banate hain. Aap ke business ka naam kya hai aur kya aap ka logo ready hai?',
              action: 'whatsapp',
            };
          }

          // A4: Follow-up response in card topic (user answered about digital/print/timeline)
          if (
            ctx.topic === 'card' &&
            ctx.step >= 1 &&
            (q.includes('digital') ||
              q.includes('video') ||
              q.includes('print') ||
              q.includes('dono') ||
              q.includes('both') ||
              q.includes('urgent') ||
              q.includes('jaldi') ||
              q.includes('ready') ||
              q.includes('logo hai') ||
              q.includes('naam'))
          ) {
            ctx.step = 3;
            return {
              reply:
                'Samajh gaya! Hum 24 se 48 hours mein aap ko 2 se 3 custom sample designs deliver kar denge. Main aap ko WhatsApp par hamare recent sample cards share kar deta hoon taake aap apna pasandeeda design choose kar sakein. Aayein WhatsApp par rabta karein ya direct booking form open karoon?',
              action: 'whatsapp',
            };
          }

          // A5: Initial card inquiry (e.g. "mujhe card banwana hai")
          ctx.topic = 'card';
          ctx.step = 1;
          return {
            reply:
              'Theek hai... Hum aapka card zaroor bana sakte hain. Aap batayein, yeh kis event ke liye chahiye? Jaise wedding invitation, birthday, business visiting card, ya koi aur occasion?',
          };
        }

        // -----------------------------------------------------------------------
        // CATEGORY B: WEBSITE & SHOPIFY STORE
        // -----------------------------------------------------------------------
        const isWebsiteInquiry =
          q.includes('website') ||
          q.includes('web') ||
          q.includes('shopify') ||
          q.includes('store') ||
          q.includes('ecommerce') ||
          q.includes('e-commerce') ||
          q.includes('online shop') ||
          q.includes('landing page') ||
          q.includes('ویب') ||
          q.includes('اسٹور');

        if (isWebsiteInquiry || ctx.topic === 'website') {
          // B1: Follow-up about business type or products
          if (
            ctx.topic === 'website' &&
            ctx.step >= 1 &&
            (q.includes('clothing') ||
              q.includes('kapde') ||
              q.includes('restaurant') ||
              q.includes('real estate') ||
              q.includes('services') ||
              q.includes('products') ||
              q.includes('ready') ||
              q.includes('scratch') ||
              q.includes('shuru'))
          ) {
            ctx.step = 3;
            return {
              reply:
                'Bohat zabardast! Hum mobile-friendly fast loading website banate hain jis mein direct WhatsApp order aur online payment gateway integrated hota hai. Aam tor par hum 5 se 7 din mein complete website live kar dete hain. Aayein founders ke sath ek quick meeting schedule karte hain ya WhatsApp par discuss karein?',
              action: 'booking',
            };
          }

          // B2: Initial website inquiry
          ctx.topic = 'website';
          ctx.step = 1;
          return {
            reply:
              'Zaroor! Hum modern 3D websites aur high-converting Shopify stores banate hain. Aap batayein, aap ka business kis cheez ka hai? Jaise clothing brand, restaurant, consultancy, ya online store?',
          };
        }

        // -----------------------------------------------------------------------
        // CATEGORY C: SOCIAL MEDIA MANAGEMENT & 3-DAY TRIAL
        // -----------------------------------------------------------------------
        const isSocialInquiry =
          q.includes('social') ||
          q.includes('instagram') ||
          q.includes('reels') ||
          q.includes('tiktok') ||
          q.includes('facebook page') ||
          q.includes('growth') ||
          q.includes('trial') ||
          q.includes('free trial') ||
          q.includes('muft') ||
          q.includes('posts') ||
          q.includes('سوشل') ||
          q.includes('ٹرائل');

        if (isSocialInquiry || ctx.topic === 'social_media' || ctx.topic === 'trial') {
          // C1: Specifically asking for free trial or claiming it
          if (
            q.includes('trial') ||
            q.includes('free') ||
            q.includes('muft') ||
            q.includes('haan') ||
            q.includes('yes') ||
            q.includes('claim') ||
            q.includes('chahiye')
          ) {
            ctx.topic = 'trial';
            ctx.step = 2;
            return {
              reply:
                'Ji bilkul! Hamara 3-day social media trial 100% free hai baghair kisi advance payment ke. Hum aap ke brand ke liye 3 custom posts, high-converting captions aur hashtag strategy banayenge. Aap neechay diye gaye button se WhatsApp par apna page link share karein, hum kaam shuru kar denge!',
              action: 'trial',
            };
          }

          // C2: Follow-up on social media
          if (ctx.topic === 'social_media' && ctx.step >= 1) {
            ctx.step = 2;
            return {
              reply:
                'Sahi hai! Organic reach aur engagement barhane ke liye hum daily reels aur aesthetic carousels design karte hain. Hamari advice hai ke pehle hamara 3-day free trial test karein taake aap quality dekh sakein. Kya aap trial test karna chahenge?',
              action: 'trial',
            };
          }

          // C3: Initial social media inquiry
          ctx.topic = 'social_media';
          ctx.step = 1;
          return {
            reply:
              'Bohot acha! Social media management hamari specialty hai. Aap ka account kis business ka hai, aur kya aap new start kar rahe hain ya existing page ko grow karna hai?',
          };
        }

        // -----------------------------------------------------------------------
        // CATEGORY D: LOGO & BRANDING DESIGN
        // -----------------------------------------------------------------------
        const isLogoInquiry =
          q.includes('logo') ||
          q.includes('branding') ||
          q.includes('brand identity') ||
          q.includes('graphic design') ||
          q.includes('لوگو') ||
          q.includes('برانڈنگ');

        if (isLogoInquiry || ctx.topic === 'logo') {
          if (ctx.topic === 'logo' && ctx.step >= 1) {
            ctx.step = 2;
            return {
              reply:
                'Samajh gaya! Hum aap ko 3 unique concepts, complete vector files aur social media kit provide karenge. Kya main aap ko WhatsApp par hamara recent design portfolio share karoon?',
              action: 'whatsapp',
            };
          }

          ctx.topic = 'logo';
          ctx.step = 1;
          return {
            reply:
              'Bilkul! Ek professional logo aap ke brand ki pehchan hota hai. Aap ke business ka naam kya hai, aur aap ko minimalist modern style pasand hai ya bold aur colorful look?',
          };
        }

        // -----------------------------------------------------------------------
        // CATEGORY E: META ADS & PAID MARKETING
        // -----------------------------------------------------------------------
        const isAdsInquiry =
          q.includes('meta') ||
          q.includes('ads') ||
          q.includes('ad') ||
          q.includes('facebook ads') ||
          q.includes('campaign') ||
          q.includes('marketing') ||
          q.includes('sales nahi') ||
          q.includes('roas') ||
          q.includes('اشتہار');

        if (isAdsInquiry || ctx.topic === 'meta_ads') {
          if (ctx.topic === 'meta_ads' && ctx.step >= 1) {
            ctx.step = 2;
            return {
              reply:
                'Samajh gaya! Is budget ke sath hum targeted testing campaigns aur retargeting funnels setup kar sakte hain. Aayein WhatsApp par ek quick ad audit discuss karte hain taake aap ka budget waste na ho.',
              action: 'whatsapp',
            };
          }

          ctx.topic = 'meta_ads';
          ctx.step = 1;
          return {
            reply:
              'Theek hai! Hum Meta Ads se target audience ko direct paying customers mein convert karte hain. Aap ka product kya hai, aur aap daily ya monthly kitna ad budget invest karna chahte hain?',
          };
        }

        // -----------------------------------------------------------------------
        // CATEGORY F: RESTAURANT / CAFE MENU DESIGN
        // -----------------------------------------------------------------------
        const isMenuInquiry =
          q.includes('menu') ||
          q.includes('restaurant') ||
          q.includes('cafe') ||
          q.includes('food') ||
          q.includes('مینو');

        if (isMenuInquiry || ctx.topic === 'menu') {
          if (ctx.topic === 'menu' && ctx.step >= 1) {
            ctx.step = 2;
            return {
              reply:
                'Behtareen! Hum high-resolution appetite layout aur instant mobile loading QR menu provide karte hain. Aayein WhatsApp par apna item menu share karein, hum sample layout bhej dete hain.',
              action: 'whatsapp',
            };
          }

          ctx.topic = 'menu';
          ctx.step = 1;
          return {
            reply:
              'Bohot khoob! Restaurant aur cafe menus mein hum visual appetite appeal design karte hain jis se order value barhti hai. Aap ko physical print menu chahiye ya digital QR scan wala menu?',
          };
        }

        // -----------------------------------------------------------------------
        // CATEGORY G: PRICING & RATES (Contextualized to what they asked)
        // -----------------------------------------------------------------------
        const isPricingInquiry =
          q.includes('price') ||
          q.includes('cost') ||
          q.includes('pricing') ||
          q.includes('kitna') ||
          q.includes('kitne') ||
          q.includes('kharcha') ||
          q.includes('rate') ||
          q.includes('charges') ||
          q.includes('package') ||
          q.includes('قیمت') ||
          q.includes('پیکیج');

        if (isPricingInquiry) {
          if (ctx.topic === 'card') {
            return {
              reply:
                'Card design ke charges bohat munasib hain, normally $15 se $35 ke darmiyan hote hain unlimited revisions aur print ready files ke sath. Kya aap sample designs WhatsApp par dekhna chahenge?',
              action: 'whatsapp',
            };
          }
          if (ctx.topic === 'website') {
            return {
              reply:
                'Website packages $75 se start hote hain basic business landing page ke liye, aur full e-commerce store $149 se $250 tak hota hai payment gateway ke sath. Aap ko kis type ki website chahiye?',
              action: 'booking',
            };
          }
          if (ctx.topic === 'social_media') {
            return {
              reply:
                'Social media starter pack sirf $28 se shuru hota hai, aur full monthly management $149 hai. Aur sab se achi baat — pehle 3 din bilkul free trial hain!',
              action: 'trial',
            };
          }
          return {
            reply:
              'Hamare packages bohat reasonable hain! Quick creative tasks sirf $28 se start hote hain, aur complete monthly management $149 se. Aap ko specifically kis service ka estimate chahiye — card, website, social media, ya logo?',
          };
        }

        // -----------------------------------------------------------------------
        // CATEGORY H: BOOKING / WHATSAPP / CLOSING
        // -----------------------------------------------------------------------
        if (
          q.includes('book') ||
          q.includes('meeting') ||
          q.includes('rabta') ||
          q.includes('whatsapp') ||
          q.includes('theek hai') ||
          q.includes('sahi hai') ||
          q.includes('number') ||
          q.includes('phone')
        ) {
          return {
            reply:
              'Bohat khoob! Main aapki direct meeting hamare founders Hammad aur Raza ke sath connect kar deta hoon. Aap neechay diye gaye WhatsApp button par tap karein ya booking form open karein.',
            action: 'whatsapp',
          };
        }

        // -----------------------------------------------------------------------
        // CATEGORY I: GREETINGS
        // -----------------------------------------------------------------------
        if (
          q.includes('salam') ||
          q.includes('assalam') ||
          q.includes('hello') ||
          q.includes('hi') ||
          q.includes('hey') ||
          q.includes('kese') ||
          q.includes('kaise')
        ) {
          return {
            reply:
              'Walaikum Assalam! Main Growzen ka AI assistant hoon. Aap batayein, aaj hum aapke brand ya business ke liye kya bana sakte hain — jaise card design, website, social media, ya logo?',
          };
        }

        // -----------------------------------------------------------------------
        // CATEGORY J: FALLBACK CONVERSATIONAL ROMAN URDU
        // -----------------------------------------------------------------------
        return {
          reply:
            'Theek hai! Hum Graphic Design, Card Invitations, Websites, Social Media aur Meta Ads mein expert hain. Aap batayein aap ko specifically kis cheez mein help chahiye?',
        };
      }

      // =========================================================================
      // 2. ENGLISH CONSULTATION FLOW (Warm, Consultative, Attentive)
      // =========================================================================

      // Card Design in English
      if (
        q.includes('card') ||
        q.includes('invitation') ||
        q.includes('wedding') ||
        q.includes('visiting') ||
        ctx.topic === 'card'
      ) {
        if (q.includes('wedding') || q.includes('marriage')) {
          ctx.topic = 'card';
          ctx.step = 2;
          return {
            reply:
              'Congratulations! For wedding cards, we design luxury digital video invitations as well as premium print-ready cards. Do you prefer a digital video invite or physical printed cards?',
            action: 'whatsapp',
          };
        }
        if (q.includes('business') || q.includes('visiting')) {
          ctx.topic = 'card';
          ctx.step = 2;
          return {
            reply:
              'Awesome! Business cards are the first impression of your brand. We create luxury minimalist and NFC smart cards. What is your business name, and is your logo ready?',
            action: 'whatsapp',
          };
        }
        if (ctx.topic === 'card' && ctx.step >= 1) {
          ctx.step = 3;
          return {
            reply:
              'Understood! We can deliver 2 to 3 custom sample concepts within 24 to 48 hours. Would you like to connect directly on WhatsApp so I can send you recent samples?',
            action: 'whatsapp',
          };
        }

        ctx.topic = 'card';
        ctx.step = 1;
        return {
          reply:
            'Sure, we can definitely design your card! What occasion or event is it for — such as a wedding invitation, birthday party, or a professional business card?',
        };
      }

      // Website in English
      if (q.includes('website') || q.includes('shopify') || q.includes('store') || ctx.topic === 'website') {
        if (ctx.topic === 'website' && ctx.step >= 1) {
          ctx.step = 2;
          return {
            reply:
              'That sounds great! For stores, we build sub-second loading speeds, mobile-first checkouts, and integrated payment gateways. Usually we launch complete stores within 5 to 7 days. Would you like to schedule a 15-minute consultation with our founders?',
            action: 'booking',
          };
        }

        ctx.topic = 'website';
        ctx.step = 1;
        return {
          reply:
            'We would love to build your website! What type of business is this for — like clothing, a restaurant, professional consulting, or an online store?',
        };
      }

      // Social Media & Trial in English
      if (q.includes('social') || q.includes('instagram') || q.includes('trial') || q.includes('free')) {
        ctx.topic = 'social_media';
        return {
          reply:
            'Social media growth is our core specialty! We manage viral short-form video editing, aesthetic grid design, and community engagement. You can also test our 3-day free trial with zero upfront payment. Would you like to claim the trial?',
          action: 'trial',
        };
      }

      // Pricing in English
      if (q.includes('price') || q.includes('cost') || q.includes('pricing') || q.includes('how much')) {
        if (ctx.topic === 'card') {
          return {
            reply:
              'Custom card design ranges from $15 to $35 with unlimited revisions and print-ready files. Would you like to see samples on WhatsApp?',
            action: 'whatsapp',
          };
        }
        return {
          reply:
            'Our pricing starts at $28 for quick creative tasks, $75 for website landing pages, and $149 monthly for full social media management. What specific service would you like an estimate for?',
          action: 'booking',
        };
      }

      // Booking / Contact
      if (q.includes('book') || q.includes('meeting') || q.includes('contact') || q.includes('whatsapp')) {
        return {
          reply: `I can connect you right away! You can reach our founders on WhatsApp at ${AGENCY_INFO.phoneFormatted} or tap the booking button below.`,
          action: 'whatsapp',
        };
      }

      // English Greeting
      if (q.includes('hello') || q.includes('hi') || q.includes('hey')) {
        return {
          reply:
            "Hi there! Welcome to Growzen. I'm your AI consultant. What can we help create for you today — like custom card design, a 3D website, social media growth, or branding?",
        };
      }

      // English Fallback
      return {
        reply:
          'Growzen specializes in Graphic Design, Card Design, Websites, Social Media, and Meta Ads. Tell me specifically what you have in mind and I will guide you with the best approach!',
      };
    },
    []
  );

  // Process user input (from speech or text)
  const handleUserInput = useCallback(
    (input: string) => {
      if (!input.trim()) return;

      // Determine target language
      let targetLang: 'ur' | 'en' = 'en';
      if (langModeRef.current === 'ur') {
        targetLang = 'ur';
      } else if (langModeRef.current === 'en') {
        targetLang = 'en';
      } else {
        targetLang = detectLanguage(input);
      }

      setActiveLang(targetLang);
      activeLangRef.current = targetLang;

      const userMsg: Message = {
        id: Date.now().toString(),
        sender: 'user',
        text: input.trim(),
        lang: targetLang,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, userMsg]);
      setCurrentTranscript('');
      setAgentStatus('thinking');

      setTimeout(() => {
        const { reply, action } = generateAgentReply(input, targetLang);
        const agentMsg: Message = {
          id: (Date.now() + 1).toString(),
          sender: 'agent',
          text: reply,
          lang: targetLang,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          action,
        };

        setMessages((prev) => [...prev, agentMsg]);
        speakText(reply, targetLang);
      }, 400);
    },
    [generateAgentReply, speakText]
  );

  // Setup Speech Recognition
  const setupSpeechRecognition = useCallback(
    (selectedMode: LanguageMode = langModeRef.current) => {
      if (typeof window === 'undefined') return;

      const SpeechRecognitionClass =
        (window as IWindow).SpeechRecognition || (window as IWindow).webkitSpeechRecognition;

      if (!SpeechRecognitionClass) {
        setPermissionError(
          'Voice speech recognition is not supported in this browser. You can still type in English or Roman Urdu below!'
        );
        return;
      }

      try {
        if (recognitionRef.current) {
          try {
            recognitionRef.current.stop();
          } catch {
            // Ignore
          }
        }

        const recognition = new SpeechRecognitionClass();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setPermissionError(null);
          if (agentStatus !== 'speaking') {
            setAgentStatus('listening');
          }
        };

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let interim = '';
          let final = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            if (result.isFinal) {
              final += result[0].transcript;
            } else {
              interim += result[0].transcript;
            }
          }

          if (interim) {
            setCurrentTranscript(interim);
            if (langModeRef.current === 'auto') {
              const detected = detectLanguage(interim);
              if (detected !== activeLangRef.current) {
                setActiveLang(detected);
                activeLangRef.current = detected;
              }
            }
          }

          if (final.trim()) {
            setCurrentTranscript('');
            handleUserInput(final);
          }
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.warn('Speech recognition status:', event.error);
          if (event.error === 'not-allowed') {
            setPermissionError(
              'Microphone access was blocked. Please tap the lock icon in your browser address bar to allow microphone access.'
            );
            setAgentStatus('idle');
          } else if (event.error === 'no-speech') {
            if (isCallingRef.current && !isMutedRef.current && agentStatus !== 'speaking') {
              setAgentStatus('listening');
            }
          }
        };

        recognition.onend = () => {
          if (isCallingRef.current && !isMutedRef.current && agentStatus !== 'speaking') {
            try {
              recognition.start();
            } catch {
              // Already active
            }
          }
        };

        recognitionRef.current = recognition;
      } catch (err) {
        console.error('Speech recognition setup error:', err);
      }
    },
    [agentStatus, handleUserInput]
  );

  // Switch Language Mode manually
  const handleLanguageSwitch = (mode: LanguageMode) => {
    setLangMode(mode);
    langModeRef.current = mode;

    let newLang: 'ur' | 'en' = activeLang;
    if (mode === 'ur') newLang = 'ur';
    if (mode === 'en') newLang = 'en';

    setActiveLang(newLang);
    activeLangRef.current = newLang;

    if (isCalling) {
      setupSpeechRecognition(mode);
      try {
        recognitionRef.current?.start();
      } catch {
        // Ignore
      }
    }
  };

  // Start Call
  const handleStartCall = () => {
    setIsOpen(true);
    setIsCalling(true);
    setAgentStatus('connecting');
    setPermissionError(null);

    // Initial greeting if no messages yet
    if (messages.length === 0) {
      const isUrduInitial = langMode === 'ur';
      const greetingText = isUrduInitial
        ? 'Assalam-o-Alaikum! Welcome to Growzen. Main aap ka AI consultant hoon. Aap batayein, aaj hum aapke business ya event ke liye kya bana sakte hain — jaise card design, website, ya social media?'
        : "Hi there! Welcome to Growzen. I'm your AI consultant. What can we help create for you today — like custom card design, a website, or social media growth?";

      const greeting: Message = {
        id: 'init-1',
        sender: 'agent',
        text: greetingText,
        lang: isUrduInitial ? 'ur' : 'en',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([greeting]);

      setTimeout(() => {
        setupSpeechRecognition(langMode);
        try {
          recognitionRef.current?.start();
        } catch {
          // Handled in onstart
        }
        speakText(greeting.text, isUrduInitial ? 'ur' : 'en');
      }, 500);
    } else {
      setupSpeechRecognition(langMode);
      try {
        recognitionRef.current?.start();
      } catch {
        // Handled in onstart
      }
      setAgentStatus('listening');
    }
  };

  // End Call
  const handleEndCall = () => {
    setIsCalling(false);
    setAgentStatus('idle');
    setCurrentTranscript('');

    if (synthRef.current) {
      synthRef.current.cancel();
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Safe ignore
      }
    }
  };

  // Toggle Mute
  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);

    if (nextMuted) {
      try {
        recognitionRef.current?.stop();
      } catch {
        // Safe
      }
      setAgentStatus('idle');
    } else {
      if (agentStatus !== 'speaking') {
        try {
          recognitionRef.current?.start();
          setAgentStatus('listening');
        } catch {
          // Safe
        }
      }
    }
  };

  // Toggle Speaker
  const handleToggleSpeaker = () => {
    const nextSpeaker = !isSpeakerMuted;
    setIsSpeakerMuted(nextSpeaker);
    if (nextSpeaker && synthRef.current) {
      synthRef.current.cancel();
      if (agentStatus === 'speaking') {
        setAgentStatus('listening');
      }
    }
  };

  // Quick prompt click
  const handleQuickPrompt = (promptText: string) => {
    handleUserInput(promptText);
  };

  // Submit Lead Capture
  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName || !leadPhone) return;

    setLeadCaptured(true);
    const isUrdu = activeLang === 'ur';

    const confirmText = isUrdu
      ? `Bohat shukriya ${leadName}! Aap ki details record ho gayi hain ${leadService} ke liye. Hamare founders Hammad aur Raza jald hi aap se connect karenge. Aap direct WhatsApp par bhi baat kar sakte hain.`
      : `Thank you ${leadName}! I have recorded your details for ${leadService}. You can also connect directly via WhatsApp or view our booking calendar.`;

    const confirmMsg: Message = {
      id: Date.now().toString(),
      sender: 'agent',
      text: confirmText,
      lang: isUrdu ? 'ur' : 'en',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      action: 'booking',
    };
    setMessages((prev) => [...prev, confirmMsg]);
    speakText(confirmMsg.text, isUrdu ? 'ur' : 'en');

    if (onOpenBooking) {
      onOpenBooking();
    }
  };

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. FLOATING TRIGGER BUTTON (Bottom-Right Corner)                          */}
      {/* ========================================================================= */}
      <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-45">
        {!isOpen && (
          <button
            onClick={handleStartCall}
            aria-label="Talk to Growzen AI Assistant"
            id="voice-call-trigger-btn"
            className="relative group flex items-center gap-2.5 px-4 sm:px-5 py-3 sm:py-3.5 rounded-full bg-linear-to-r from-[#0d1712] via-[#091f16] to-[#0d1712] border border-[#10f48e]/50 hover:border-[#10f48e] text-white shadow-[0_10px_35px_rgba(0,0,0,0.85),0_0_25px_rgba(16,244,142,0.35)] hover:shadow-[0_0_45px_rgba(16,244,142,0.6)] transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-xl"
          >
            {/* Pulsing Aura Light Ring */}
            <span className="absolute -inset-1 rounded-full bg-[#10f48e]/20 blur-md pointer-events-none group-hover:bg-[#10f48e]/40 transition-all duration-300 animate-pulse" />

            {/* Live Indicator Radar Dot */}
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10f48e] opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#10f48e]" />
            </span>

            {/* Glowing Icon */}
            <div className="p-1 rounded-full bg-[#10f48e]/20 text-[#10f48e] relative z-10">
              <Mic className="w-4 h-4 animate-pulse" />
            </div>

            {/* Button Text */}
            <div className="flex flex-col text-left relative z-10">
              <span className="font-mono-tech font-bold text-xs sm:text-sm tracking-wider uppercase text-white flex items-center gap-1.5">
                Talk to Us
                <Sparkles className="w-3 h-3 text-[#10f48e]" />
              </span>
              <span className="text-[10px] text-[#10f48e] font-mono-tech hidden sm:inline">
                Voice AI • English & Roman Urdu
              </span>
            </div>
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. CALL-STYLE VOICE AGENT INTERFACE MODAL                                */}
      {/* ========================================================================= */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm transition-all duration-300 animate-fadeIn">
          {/* Main Card Container */}
          <div
            id="voice-calling-modal"
            className="relative w-full sm:max-w-md md:max-w-lg h-[92vh] sm:h-auto sm:max-h-[88vh] rounded-t-3xl sm:rounded-3xl bg-[#070b10] border border-white/15 sm:border-[#10f48e]/40 shadow-[0_20px_70px_rgba(0,0,0,0.95),0_0_50px_rgba(16,244,142,0.2)] flex flex-col overflow-hidden"
          >
            {/* Header: Call Status Bar & Language Toggle */}
            <div className="px-4 sm:px-6 py-3 sm:py-3.5 bg-[#0a1017] border-b border-white/10 flex items-center justify-between z-20 gap-2 flex-wrap">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="w-9 h-9 rounded-2xl bg-[#10f48e]/15 border border-[#10f48e]/40 flex items-center justify-center text-[#10f48e] shadow-[0_0_15px_rgba(16,244,142,0.3)]">
                    <Radio className={`w-4 h-4 ${isCalling ? 'animate-pulse' : ''}`} />
                  </div>
                  {isCalling && (
                    <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10f48e] opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#10f48e]" />
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-bold font-mono-tech text-white flex items-center gap-2">
                    Growzen AI Consultant
                    <span className="text-[9px] font-mono-tech px-2 py-0.5 rounded-full bg-[#10f48e]/20 text-[#10f48e] border border-[#10f48e]/30">
                      LIVE
                    </span>
                  </h3>
                  <p className="text-[11px] font-mono-tech text-neutral-400">
                    {isCalling ? (
                      <span className="text-[#10f48e] font-semibold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#10f48e] animate-ping" />
                        Call Active • {formatTime(callDuration)}
                      </span>
                    ) : (
                      'Call Ended'
                    )}
                  </p>
                </div>
              </div>

              {/* Language Switcher Buttons (Auto / English / Roman Urdu) */}
              <div className="flex items-center gap-1 bg-[#05080c] p-1 rounded-xl border border-white/10 text-[10px] font-mono-tech">
                <button
                  type="button"
                  onClick={() => handleLanguageSwitch('auto')}
                  title="Auto-detect between English & Roman Urdu"
                  className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                    langMode === 'auto'
                      ? 'bg-[#10f48e] text-black font-bold shadow-[0_0_10px_rgba(16,244,142,0.4)]'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Globe className="w-3 h-3" />
                  <span>Auto</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleLanguageSwitch('en')}
                  className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                    langMode === 'en'
                      ? 'bg-[#10f48e] text-black font-bold shadow-[0_0_10px_rgba(16,244,142,0.4)]'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  English
                </button>

                <button
                  type="button"
                  onClick={() => handleLanguageSwitch('ur')}
                  className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                    langMode === 'ur'
                      ? 'bg-[#10f48e] text-black font-bold shadow-[0_0_10px_rgba(16,244,142,0.4)]'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Roman Urdu
                </button>
              </div>

              {/* Close & Minimize buttons */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  title="Minimize"
                  className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <ChevronDown className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleEndCall();
                    setIsOpen(false);
                  }}
                  title="Close Window"
                  className="p-1.5 rounded-xl text-neutral-400 hover:text-rose-400 hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Permission Alert (if mic blocked) */}
            {permissionError && (
              <div className="px-4 py-2.5 bg-rose-500/10 border-b border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300 font-mono-tech">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <div className="flex-1">
                  <span>{permissionError}</span>
                </div>
              </div>
            )}

            {/* Center: Interactive Audio Waveform & Visualizer Stage */}
            <div className="px-4 sm:px-6 py-4 bg-linear-to-b from-[#090e15] to-[#06080d] border-b border-white/10 flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-radial from-[#10f48e]/10 via-transparent to-transparent pointer-events-none" />

              {/* Pulsing Avatar Sphere */}
              <div className="relative mb-3 flex items-center justify-center">
                {isCalling && agentStatus === 'speaking' && (
                  <div className="absolute w-24 h-24 rounded-full border border-[#10f48e]/30 animate-ping pointer-events-none" />
                )}
                {isCalling && agentStatus === 'listening' && (
                  <div className="absolute w-20 h-20 rounded-full border border-sky-400/30 animate-ping pointer-events-none" />
                )}

                <div
                  className={`w-16 h-16 rounded-3xl flex items-center justify-center transition-all duration-300 relative z-10 shadow-2xl ${
                    agentStatus === 'speaking'
                      ? 'bg-linear-to-br from-[#10f48e] to-[#00b05b] text-black shadow-[0_0_35px_rgba(16,244,142,0.6)] scale-105'
                      : agentStatus === 'listening'
                      ? 'bg-linear-to-br from-[#38bdf8] to-[#0284c7] text-white shadow-[0_0_30px_rgba(56,189,248,0.5)] scale-100'
                      : 'bg-[#0f1722] border border-white/20 text-[#10f48e]'
                  }`}
                >
                  {agentStatus === 'speaking' ? (
                    <Volume2 className="w-8 h-8 animate-pulse" />
                  ) : agentStatus === 'listening' ? (
                    <Mic className="w-8 h-8 animate-bounce" />
                  ) : isCalling ? (
                    <Sparkles className="w-7 h-7 text-[#10f48e]" />
                  ) : (
                    <PhoneOff className="w-7 h-7 text-neutral-400" />
                  )}
                </div>
              </div>

              {/* Real-Time Waveform Bars */}
              <div className="flex items-center gap-1.5 h-10 mb-2">
                {audioLevels.map((lvl, idx) => (
                  <div
                    key={idx}
                    className={`w-1.5 rounded-full transition-all duration-150 ${
                      agentStatus === 'speaking'
                        ? 'bg-[#10f48e] shadow-[0_0_8px_#10f48e]'
                        : agentStatus === 'listening'
                        ? 'bg-[#38bdf8] shadow-[0_0_8px_#38bdf8]'
                        : 'bg-white/20'
                    }`}
                    style={{ height: `${lvl}px` }}
                  />
                ))}
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2">
                <span
                  className={`text-[11px] font-mono-tech px-3 py-1 rounded-full uppercase tracking-wider font-semibold flex items-center gap-1.5 ${
                    agentStatus === 'speaking'
                      ? 'bg-[#10f48e]/20 text-[#10f48e] border border-[#10f48e]/40'
                      : agentStatus === 'listening'
                      ? 'bg-[#38bdf8]/20 text-[#38bdf8] border border-[#38bdf8]/40'
                      : agentStatus === 'thinking'
                      ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                      : 'bg-white/10 text-neutral-400 border border-white/10'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full animate-ping ${
                      agentStatus === 'speaking'
                        ? 'bg-[#10f48e]'
                        : agentStatus === 'listening'
                        ? 'bg-[#38bdf8]'
                        : 'bg-amber-400'
                    }`}
                  />
                  {agentStatus === 'speaking'
                    ? activeLang === 'ur'
                      ? 'Agent Bol Raha Hai...'
                      : 'Agent Speaking...'
                    : agentStatus === 'listening'
                    ? activeLang === 'ur'
                      ? 'Aap Ko Sun Raha Hai (Bolein)'
                      : 'Listening (Speak Now)'
                    : agentStatus === 'thinking'
                    ? activeLang === 'ur'
                      ? 'Soch Raha Hai...'
                      : 'Thinking...'
                    : isCalling
                    ? 'Call Active'
                    : 'Call Disconnected'}
                </span>

                <span className="text-[10px] font-mono-tech text-[#10f48e] px-2 py-0.5 rounded-md bg-[#10f48e]/10 border border-[#10f48e]/20">
                  {langMode === 'auto'
                    ? `Auto: ${activeLang === 'ur' ? 'Roman Urdu' : 'English'}`
                    : langMode === 'ur'
                    ? 'Roman Urdu'
                    : 'English'}
                </span>
              </div>

              {/* Interim Live Speech Transcript Bubble */}
              {currentTranscript && (
                <div className="mt-2 text-xs font-mono-tech text-[#38bdf8] bg-[#38bdf8]/10 px-3 py-1.5 rounded-xl border border-[#38bdf8]/30 max-w-sm text-center animate-pulse">
                  "{currentTranscript}..."
                </div>
              )}
            </div>

            {/* Conversation Log Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono-tech text-xs max-h-[36vh] sm:max-h-[30vh]">
              {messages.map((msg) => {
                const isMsgUrdu = msg.lang === 'ur';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 text-[10px] text-neutral-500">
                      <span>{msg.sender === 'user' ? 'You' : 'Growzen AI'}</span>
                      <span>•</span>
                      <span>{msg.timestamp}</span>
                      {isMsgUrdu && (
                        <span className="text-[9px] text-[#10f48e] bg-[#10f48e]/10 px-1.5 rounded">
                          Roman Urdu
                        </span>
                      )}
                    </div>

                    <div
                      className={`px-3.5 py-2.5 rounded-2xl max-w-[88%] sm:max-w-[80%] leading-relaxed font-mono-tech text-xs ${
                        msg.sender === 'user'
                          ? 'bg-[#10f48e] text-black font-medium shadow-[0_4px_15px_rgba(16,244,142,0.3)]'
                          : 'bg-[#0e1622] border border-white/10 text-neutral-200'
                      }`}
                    >
                      {msg.text}
                    </div>

                    {/* Contextual Action Buttons */}
                    {msg.action && (
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {msg.action === 'booking' && (
                          <button
                            type="button"
                            onClick={() => {
                              if (onOpenBooking) onOpenBooking();
                              setIsOpen(false);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-[#10f48e]/20 hover:bg-[#10f48e] text-[#10f48e] hover:text-black border border-[#10f48e]/50 text-[10px] font-bold tracking-wider uppercase transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{isMsgUrdu ? 'Meeting Book Karein' : 'Open Booking Form'}</span>
                          </button>
                        )}

                        <a
                          href={AGENCY_INFO.whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-black border border-emerald-500/50 text-[10px] font-bold tracking-wider uppercase transition-all flex items-center gap-1.5"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>{isMsgUrdu ? 'WhatsApp Par Rabta' : 'Chat on WhatsApp'}</span>
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Contextual Question Pills */}
            <div className="px-4 py-2 border-t border-white/5 bg-black/40 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-[10px] font-mono-tech">
              {activeLang === 'ur' ? (
                <>
                  <button
                    type="button"
                    onClick={() => handleQuickPrompt('Mujhe card banwana hai')}
                    className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white/5 hover:bg-[#10f48e]/20 text-neutral-300 hover:text-[#10f48e] border border-white/10 transition-colors cursor-pointer"
                  >
                    💌 Card Design
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPrompt('Mujhe website ya online store banwana hai')}
                    className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white/5 hover:bg-[#10f48e]/20 text-neutral-300 hover:text-[#10f48e] border border-white/10 transition-colors cursor-pointer"
                  >
                    💻 Website & Store
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPrompt('Mujhe 3-day free social media trial chahiye')}
                    className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white/5 hover:bg-[#10f48e]/20 text-neutral-300 hover:text-[#10f48e] border border-white/10 transition-colors cursor-pointer"
                  >
                    🎁 Free 3-Day Trial
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPrompt('Mujhe logo design karwana hai')}
                    className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white/5 hover:bg-[#10f48e]/20 text-neutral-300 hover:text-[#10f48e] border border-white/10 transition-colors cursor-pointer"
                  >
                    🎨 Logo Design
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => handleQuickPrompt('I need a card designed')}
                    className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white/5 hover:bg-[#10f48e]/20 text-neutral-300 hover:text-[#10f48e] border border-white/10 transition-colors cursor-pointer"
                  >
                    💌 Card Design
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPrompt('I need a website or Shopify store')}
                    className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white/5 hover:bg-[#10f48e]/20 text-neutral-300 hover:text-[#10f48e] border border-white/10 transition-colors cursor-pointer"
                  >
                    💻 Website & Store
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPrompt('Tell me about the 3-day free social trial')}
                    className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white/5 hover:bg-[#10f48e]/20 text-neutral-300 hover:text-[#10f48e] border border-white/10 transition-colors cursor-pointer"
                  >
                    🎁 Free 3-Day Trial
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPrompt('I need a brand logo designed')}
                    className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white/5 hover:bg-[#10f48e]/20 text-neutral-300 hover:text-[#10f48e] border border-white/10 transition-colors cursor-pointer"
                  >
                    🎨 Logo Design
                  </button>
                </>
              )}
            </div>

            {/* Optional Lead Quick Connect Card */}
            {!leadCaptured && (
              <details className="px-4 py-2 border-t border-white/5 bg-[#090d14] text-[10px] font-mono-tech group">
                <summary className="cursor-pointer text-[#10f48e] hover:underline flex items-center justify-between">
                  <span>
                    {activeLang === 'ur'
                      ? 'Callback chahiye? Yahan details darj karein'
                      : 'Want a callback? Leave your details'}
                  </span>
                  <span className="text-neutral-500 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <form onSubmit={handleLeadSubmit} className="mt-2.5 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder={activeLang === 'ur' ? 'Aap ka Naam' : 'Your Name'}
                      value={leadName}
                      onChange={(e) => setLeadName(e.target.value)}
                      required
                      className="px-2.5 py-1.5 rounded-lg bg-black/60 border border-white/15 text-white text-[11px] focus:outline-none focus:border-[#10f48e]"
                    />
                    <input
                      type="tel"
                      placeholder={activeLang === 'ur' ? 'Phone / WhatsApp' : 'Phone / WhatsApp'}
                      value={leadPhone}
                      onChange={(e) => setLeadPhone(e.target.value)}
                      required
                      className="px-2.5 py-1.5 rounded-lg bg-black/60 border border-white/15 text-white text-[11px] focus:outline-none focus:border-[#10f48e]"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={leadService}
                      onChange={(e) => setLeadService(e.target.value)}
                      className="flex-1 px-2.5 py-1.5 rounded-lg bg-black/60 border border-white/15 text-white text-[10px] focus:outline-none focus:border-[#10f48e]"
                    >
                      {SERVICES_DATA.map((s) => (
                        <option key={s.id} value={s.title}>
                          {s.title}
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      className="px-3 py-1.5 rounded-lg bg-[#10f48e] text-black font-bold uppercase text-[10px] hover:bg-[#00e676] transition-colors cursor-pointer"
                    >
                      {activeLang === 'ur' ? 'Submit Karein' : 'Connect'}
                    </button>
                  </div>
                </form>
              </details>
            )}

            {/* Fallback Text Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (textInput.trim()) {
                  handleUserInput(textInput);
                  setTextInput('');
                }
              }}
              className="px-4 py-2.5 bg-[#0a1017] border-t border-white/10 flex items-center gap-2"
            >
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder={
                  isCalling
                    ? activeLang === 'ur'
                      ? 'Microphone mein bolein ya yahan type karein...'
                      : 'Speak in English or Roman Urdu, or type here...'
                    : activeLang === 'ur'
                    ? 'Sawaal poochein ya call connect karein...'
                    : 'Type in English or Roman Urdu...'
                }
                className="flex-1 px-3 py-2 rounded-xl bg-[#06080d] border border-white/15 text-white text-xs font-mono-tech placeholder:text-neutral-500 focus:outline-none focus:border-[#10f48e]"
              />
              <button
                type="submit"
                disabled={!textInput.trim()}
                className="p-2 rounded-xl bg-[#10f48e] text-black disabled:opacity-40 hover:bg-[#00e676] transition-all cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            {/* Bottom Call Controls Bar */}
            <div className="px-4 sm:px-6 py-3.5 bg-[#05070a] border-t border-white/10 flex items-center justify-around z-20">
              {/* Mic Toggle Button */}
              <button
                type="button"
                onClick={handleToggleMute}
                disabled={!isCalling}
                title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
                className={`flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  !isCalling ? 'opacity-40 cursor-not-allowed' : ''
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors ${
                    isMuted
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50'
                      : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
                  }`}
                >
                  {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </div>
                <span className="text-[9px] font-mono-tech text-neutral-400">
                  {isMuted ? 'Unmute' : 'Mute'}
                </span>
              </button>

              {/* Main Call Action: Call / End Call Button */}
              {isCalling ? (
                <button
                  type="button"
                  onClick={handleEndCall}
                  title="End Call"
                  className="px-6 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-mono-tech font-bold text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(225,29,72,0.5)] transition-all flex items-center gap-2 transform hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <PhoneOff className="w-4 h-4" />
                  <span>{activeLang === 'ur' ? 'Call Khatam Karein' : 'End Call'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStartCall}
                  title="Start Call"
                  className="px-6 py-2.5 rounded-full bg-[#10f48e] hover:bg-[#00e676] text-black font-mono-tech font-bold text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(16,244,142,0.5)] transition-all flex items-center gap-2 transform hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <Phone className="w-4 h-4" />
                  <span>{activeLang === 'ur' ? 'Call Shuru Karein' : 'Connect Voice'}</span>
                </button>
              )}

              {/* Speaker Toggle Button */}
              <button
                type="button"
                onClick={handleToggleSpeaker}
                disabled={!isCalling}
                title={isSpeakerMuted ? 'Unmute Audio' : 'Mute Audio'}
                className={`flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  !isCalling ? 'opacity-40 cursor-not-allowed' : ''
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors ${
                    isSpeakerMuted
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50'
                      : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
                  }`}
                >
                  {isSpeakerMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </div>
                <span className="text-[9px] font-mono-tech text-neutral-400">
                  {isSpeakerMuted ? 'Muted' : 'Audio'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
