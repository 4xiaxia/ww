
import React, { useState, useEffect, useRef } from 'react';
import { LiveService } from './services/liveService';
import { TurnBasedService } from './services/turnBasedService';
import { CNService } from './services/cnService';
import { AgentState, ChatMessage, ServiceMode } from './types';
import AgentAvatar from './components/AgentAvatar';
import { GoogleGenAI } from '@google/genai';
import { CONFIG, getNextApiKey } from './config';
import { decodeAudioData } from './utils/audioUtils';

// --- Data Constants ---
const SPOT_DATA = {
  red: {
    title: '红色之旅',
    subtitle: '分类列表页面',
    color: 'red',
    bg: 'bg-red-500',
    text: 'text-red-600',
    lightBg: 'bg-red-50',
    spots: [
        { id: 'r1', name: '辛亥革命纪念馆', promo: '革命摇篮 薪火相传', desc: '郑氏宗祠，革命摇篮，见证了东里村的觉醒年代。', x: 35, y: 40, detailImage: 'https://picsum.photos/seed/r1/600/400' },
        { id: 'r2', name: '旌义状石碑', promo: '中山亲颁 无上荣光', desc: '孙中山亲颁，表彰海外华侨的爱国义举。', x: 65, y: 25, detailImage: 'https://picsum.photos/seed/r2/600/400' },
        { id: 'r3', name: '红军古道', promo: '重走长征 忆苦思甜', desc: '蜿蜒于山林之间，重走长征路，感受红色记忆。', x: 25, y: 65, detailImage: 'https://picsum.photos/seed/r3/600/400' },
    ]
  },
  nature: {
    title: '自然风景',
    subtitle: '分类列表页面',
    color: 'emerald',
    bg: 'bg-emerald-500',
    text: 'text-emerald-600',
    lightBg: 'bg-emerald-50',
    spots: [
        { id: 'n1', name: '仙灵瀑布', promo: '飞流直下 清凉一夏', desc: '落差百米，飞流直下，是夏日清凉避暑的绝佳胜地。', x: 70, y: 45, detailImage: 'https://picsum.photos/seed/n1/600/400' },
        { id: 'n2', name: '东里水库', promo: '湖光山色 碧波荡漾', desc: '湖光山色，碧波荡漾，适合垂钓与露营。', x: 50, y: 55, detailImage: 'https://picsum.photos/seed/n2/600/400' },
        { id: 'n3', name: '油桐花海', promo: '五月飞雪 浪漫花径', desc: '每年五月，油桐花开，如雪纷飞，浪漫至极。', x: 80, y: 75, detailImage: 'https://picsum.photos/seed/n3/600/400' },
        { id: 'n4', name: '千年古榕', promo: '独木成林 岁月见证', desc: '千年古榕树，独木成林，见证了村庄的沧桑巨变。', x: 30, y: 80, detailImage: 'https://picsum.photos/seed/n4/600/400' },
    ]
  },
  people: {
    title: '东里名人',
    subtitle: '人文荟萃',
    color: 'purple',
    bg: 'bg-purple-500',
    text: 'text-purple-600',
    lightBg: 'bg-purple-50',
    spots: [
        { 
            id: 'p1', 
            name: '革命先辈', 
            promo: '缅怀先烈 浩气长存', 
            desc: '追忆为国家独立、民族解放奋斗牺牲的英雄人物，传承红色基因。', 
            x: 45, y: 35, 
            detailImage: 'https://picsum.photos/seed/p1/600/400',
            directory: [
                { name: '郑玉指', tag: '同盟会会员', desc: '辛亥革命华侨领袖，追随孙中山先生，倾家荡产资助革命。其故居位于东里中路76号，现为县级文物保护单位。' },
                { name: '颜子俊', tag: '爱国侨领', desc: '著名爱国华侨领袖，抗战期间积极组织海外华侨捐资捐物，支持祖国抗战。' },
                { name: '郑义', tag: '红军烈士', desc: '1930年参加红军，在反围剿战斗中英勇牺牲，年仅22岁。' }
            ]
        },
        { 
            id: 'p2', 
            name: '乡贤名人', 
            promo: '德高望重 造福桑梓', 
            desc: '介绍德高望重，热心公益，造福桑梓的杰出乡贤事迹。', 
            x: 75, y: 60, 
            detailImage: 'https://picsum.photos/seed/p2/600/400',
            directory: [
                { name: '郑老先生', tag: '慈善家', desc: '改革开放初期捐资百万修建东里小学教学楼，设立"东里奖学金"，资助贫困学生数百人。' },
                { name: '李教授', tag: '文化学者', desc: '致力于整理东里村族谱与地方志，编撰《东里村史》，为传承村落文化做出巨大贡献。' },
                { name: '张医师', tag: '名医', desc: '悬壶济世五十年，医术精湛，医德高尚，免费为村里老人义诊。' }
            ]
        },
        { 
            id: 'p3', 
            name: '青年后生', 
            promo: '朝气蓬勃 未来可期', 
            desc: '展现朝气蓬勃，在各行各业崭露头角，建设家乡的新生代力量。', 
            x: 20, y: 70, 
            detailImage: 'https://picsum.photos/seed/p3/600/400',
            directory: [
                { name: '2024届 郑晓明', tag: '清华大学', desc: '以优异成绩考入清华大学计算机系，是东里村近十年来第一位考入清北的学生。' },
                { name: '东里青年创业团', tag: '返乡创业', desc: '由5名返乡大学生组成的创业团队，利用电商平台推广东里特产，年销售额破千万。' },
                { name: '林小红', tag: '非遗传承人', desc: '90后剪纸艺术家，致力于将传统剪纸艺术与现代设计结合，作品多次在省市获奖。' }
            ]
        },
    ]
  },
  industries: {
    title: '特色产业',
    subtitle: '乡村振兴',
    color: 'orange',
    bg: 'bg-orange-500',
    text: 'text-orange-600',
    lightBg: 'bg-orange-50',
    spots: [
        { id: 'i1', name: '高山铁观音', promo: '云雾缭绕 醇厚甘鲜', desc: '海拔800米以上的高山茶园，种植铁观音435亩，茶香浓郁，是村里的绿色银行。', x: 30, y: 35, detailImage: 'https://picsum.photos/seed/i1/600/400' },
        { id: 'i2', name: '百香果基地', promo: '黄金果业 致富金果', desc: '种植百香果、黄金果230亩，果肉饱满，香气扑鼻，不仅风景美，更是致富果。', x: 60, y: 55, detailImage: 'https://picsum.photos/seed/i2/600/400' },
        { id: 'i3', name: '防癌黑米', promo: '郑金贵工作室 试验田', desc: '特色黑米种植基地，富含花青素，健康养生，是郑金贵工作室的科研成果。', x: 75, y: 25, detailImage: 'https://picsum.photos/seed/i3/600/400' },
    ]
  }
};

const WeatherWidget = () => {
  return (
    <div className="bg-[#facc15] px-3 py-1.5 rounded-full shadow-sm border border-yellow-500/20 transform rotate-1">
      <span className="text-xs font-black text-gray-800 tracking-wide">天气 2025/12/12</span>
    </div>
  );
};

// --- Service Mode Switch Component ---
const ModeSwitch: React.FC<{ mode: ServiceMode, onToggle: (m: ServiceMode) => void }> = ({ mode, onToggle }) => {
    return (
        <div className="flex bg-gray-200/50 p-1 rounded-xl shadow-inner border border-gray-200/50 relative">
            <button 
                onClick={() => onToggle(ServiceMode.GLOBAL)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all relative z-10 ${
                    mode === ServiceMode.GLOBAL
                    ? 'bg-white text-blue-500 shadow-sm'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
            >
                <i className="fas fa-globe-americas mr-1"></i>全球
            </button>
            <button
                onClick={() => onToggle(ServiceMode.CN)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all relative z-10 ${
                    mode === ServiceMode.CN
                    ? 'bg-red-500 text-white shadow-sm shadow-red-200'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
            >
                <i className="fas fa-flag mr-1"></i>CN专线
            </button>
        </div>
    );
}

const App: React.FC = () => {
  // Service Strategy State
  // Default to CN (REST) mode because the Proxy does not support WebSocket (Global/Live)
  const [serviceMode, setServiceMode] = useState<ServiceMode>(ServiceMode.CN);
  
  // Audio States
  const [isCallActive, setIsCallActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false); 
  const [isCheckingMic, setIsCheckingMic] = useState(false); 
  const [agentState, setAgentState] = useState<AgentState>(AgentState.IDLE);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Network Check State
  const [showNetworkModal, setShowNetworkModal] = useState(false);
  const [networkCheckPhase, setNetworkCheckPhase] = useState<'checking' | 'result'>('checking');
  const [networkProgress, setNetworkProgress] = useState(0);

  // Fallback / CN Logic State
  const [isFallbackMode, setIsFallbackMode] = useState(false); 
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Navigation States
  const [currentView, setCurrentView] = useState<'dashboard' | 'map' | 'detail' | 'media'>('dashboard');
  const [activeCategory, setActiveCategory] = useState<'red' | 'nature' | 'people' | 'industries'>('red');
  const [selectedSpot, setSelectedSpot] = useState<any | null>(null); 
  const [detailSpot, setDetailSpot] = useState<any | null>(null); 

  // UI States
  const [showHistory, setShowHistory] = useState(false);
  const [inputMode, setInputMode] = useState<'none' | 'text'>('none');
  const [inputText, setInputText] = useState('');

  // Draggable States
  const [avatarPos, setAvatarPos] = useState<{x: number, y: number} | null>(null);
  const [controlsPos, setControlsPos] = useState<{x: number, y: number} | null>(null);
  
  const activeDrag = useRef<'avatar' | 'controls' | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Services Refs
  const liveService = useRef<LiveService | null>(null);
  const turnBasedService = useRef<TurnBasedService | null>(null);
  const cnService = useRef<CNService | null>(null);
  
  // Central Audio Output Context
  const playbackContext = useRef<AudioContext | null>(null);
  const activeAudioSources = useRef<AudioBufferSourceNode[]>([]);
  const nextStartTime = useRef<number>(0);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  const textChatClient = useRef<any | null>(null);

  // --- Theme Computed Properties ---
  const theme = {
      bg: serviceMode === ServiceMode.CN ? 'bg-[#fff1f2]' : 'bg-[#fdf2f8]', 
      primaryText: serviceMode === ServiceMode.CN ? 'text-red-800' : 'text-gray-700',
      accentColor: serviceMode === ServiceMode.CN ? 'bg-red-500' : 'bg-blue-500',
      buttonText: serviceMode === ServiceMode.CN ? 'text-red-100' : 'text-white',
      bubbleUser: serviceMode === ServiceMode.CN ? 'bg-red-500' : 'bg-blue-500',
      bubbleModel: serviceMode === ServiceMode.CN ? 'border-red-200 bg-red-50 text-red-900' : 'border-gray-100 bg-white text-gray-800',
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, showHistory]);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const startNetworkCheck = () => {
    setShowNetworkModal(true);
    setNetworkCheckPhase('checking');
    setNetworkProgress(0);

    const interval = setInterval(() => {
        setNetworkProgress(prev => {
            if (prev >= 100) {
                clearInterval(interval);
                setTimeout(() => setNetworkCheckPhase('result'), 500);
                return 100;
            }
            return prev + 10; 
        });
    }, 150);
  };

  const finalizeNetworkChoice = (choice: 'live' | 'wechat') => {
      setShowNetworkModal(false);
      if (choice === 'live') {
          setServiceMode(ServiceMode.GLOBAL);
          setIsFallbackMode(false);
          setToastMessage("已切换至全球线路 (实时通话) 🌍");
          addMessage('model', '嘿！我又回来啦，试试实时语音吧~');
      } else {
          setServiceMode(ServiceMode.CN);
          setIsFallbackMode(false);
          setToastMessage("已切换至稳定语音模式 🛡️");
          addMessage('model', '没问题，我们用微信语音的方式聊天吧！');
      }
  };

  const handleModeToggle = (newMode: ServiceMode) => {
      endCall();
      stopFallbackRecording();

      if (newMode === ServiceMode.GLOBAL) {
          startNetworkCheck();
      } else {
          setServiceMode(ServiceMode.CN);
          setToastMessage("已切换至 CN 专线 (稳定优先) 🇨🇳");
          addMessage('model', '您好呀！小萌已切换到国内稳定线路，请按住按钮说话哦~');
      }
  };

  // Dragging Logic
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>, item: 'avatar' | 'controls') => {
      e.preventDefault();
      
      const element = e.currentTarget;
      const rect = element.getBoundingClientRect();
      
      activeDrag.current = item;
      dragOffset.current = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
      };

      if (item === 'avatar' && !avatarPos) {
          setAvatarPos({ x: rect.left, y: rect.top });
      } else if (item === 'controls' && !controlsPos) {
          setControlsPos({ x: rect.left, y: rect.top });
      }
  };

  useEffect(() => {
      const handleGlobalPointerMove = (e: PointerEvent) => {
          if (!activeDrag.current) return;
          e.preventDefault();
          
          const newX = e.clientX - dragOffset.current.x;
          const newY = e.clientY - dragOffset.current.y;
          
          if (activeDrag.current === 'avatar') {
              setAvatarPos({ x: newX, y: newY });
          } else if (activeDrag.current === 'controls') {
              setControlsPos({ x: newX, y: newY });
          }
      };

      const handleGlobalPointerUp = () => {
          activeDrag.current = null;
      };

      window.addEventListener('pointermove', handleGlobalPointerMove);
      window.addEventListener('pointerup', handleGlobalPointerUp);
      
      return () => {
          window.removeEventListener('pointermove', handleGlobalPointerMove);
          window.removeEventListener('pointerup', handleGlobalPointerUp);
      };
  }, [avatarPos, controlsPos]);

  // --- Voice Logic (Router) ---

  const checkMicrophone = async (): Promise<boolean> => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        return true;
    } catch (e) {
        return false;
    }
  };

  const handleVoiceInteraction = async (action: 'press' | 'release') => {
      if (serviceMode === ServiceMode.CN || isFallbackMode) {
          if (action === 'press') {
              startFallbackRecording(); 
          } else if (action === 'release') {
              stopFallbackRecording();
          }
      } else {
          if (action === 'press') {
            if (isCallActive) {
                endCall();
            } else {
                if (isConnecting || isCheckingMic) return;
                setIsCheckingMic(true);
                await new Promise(resolve => setTimeout(resolve, 1500));
                const hasMic = await checkMicrophone();
                setIsCheckingMic(false);
                if (hasMic) {
                    startCall();
                } else {
                    setToastMessage("麦克风不可用");
                }
            }
          }
      }
  };

  const startCall = async () => {
    setIsConnecting(true); 
    
    if (liveService.current) {
        liveService.current.disconnect();
        liveService.current = null;
    }
    
    try {
        liveService.current = new LiveService();
        
        await liveService.current.connect({
            onOpen: () => {
                setIsConnecting(false);
                setIsCallActive(true);
                setAgentState(AgentState.LISTENING);
                addMessage('model', '哈喽呀！我是村官儿小萌，东里村的百事通，随时为您服务哦~ ✨');
                setToastMessage("连接成功！小萌在听啦~");
            },
            onClose: () => {
                setAgentState(AgentState.IDLE);
                setIsCallActive(false);
                setIsConnecting(false);
            },
            onError: (err) => {
                console.error("Live Service Error Triggered:", err);
                handleGracefulDegradation();
            },
            onInterruption: () => {
                stopAllAudio();
                setAgentState(AgentState.LISTENING);
            },
            onTranscription: (role, text) => {
                setMessages(prev => {
                    const lastMsg = prev[prev.length - 1];
                    if (lastMsg && lastMsg.role === role && Date.now() - lastMsg.timestamp < 3000) {
                        return [...prev.slice(0, -1), { ...lastMsg, text: lastMsg.text + " " + text }];
                    }
                    return [...prev, { id: Date.now().toString(), role, text, timestamp: Date.now() }];
                });

                if (role === 'user') {
                    stopAllAudio(); // Interrupt when user speaks
                    setAgentState(AgentState.THINKING);
                } else {
                    setAgentState(AgentState.SPEAKING);
                }
            },
            onAudioData: (data: Uint8Array) => {
                playAudio(data);
            }
        });
    } catch (e) {
      console.error("Connection initiation failed", e);
      handleGracefulDegradation();
    }
  };

  const handleGracefulDegradation = () => {
      console.log("Auto-switching to Fallback due to error");
      if (liveService.current) {
          liveService.current.disconnect();
          liveService.current = null;
      }
      setIsCallActive(false);
      setIsConnecting(false);
      setAgentState(AgentState.IDLE);
      
      setIsFallbackMode(true); 
      setToastMessage("网络拥堵，自动切换至稳定线路 🛡️");
  };

  const initPlaybackContext = async () => {
      if (!playbackContext.current || playbackContext.current.state === 'closed') {
           playbackContext.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      if (playbackContext.current.state === 'suspended') {
          try {
            await playbackContext.current.resume();
          } catch(e) {
            console.error("Failed to resume audio context", e);
          }
      }
      return playbackContext.current;
  };

  const stopAllAudio = () => {
      activeAudioSources.current.forEach(src => {
          try { src.stop(); } catch(e) {}
      });
      activeAudioSources.current = [];
      nextStartTime.current = 0;
  };

  const playAudio = async (data: AudioBuffer | Uint8Array) => {
    const ctx = await initPlaybackContext();
    setAgentState(AgentState.SPEAKING);

    try {
        let bufferToPlay: AudioBuffer;
        if (data instanceof AudioBuffer) {
            bufferToPlay = data;
        } else {
            bufferToPlay = await decodeAudioData(data, ctx);
        }

        const src = ctx.createBufferSource();
        src.buffer = bufferToPlay;
        
        // Add GainNode to ensure volume
        const gainNode = ctx.createGain();
        gainNode.gain.value = 1.0;
        
        src.connect(gainNode);
        gainNode.connect(ctx.destination);

        const currentTime = ctx.currentTime;
        // Reset nextStartTime if it drifted too far behind (interruption or latency)
        if (nextStartTime.current < currentTime) {
            nextStartTime.current = currentTime;
        }
        
        src.start(nextStartTime.current);
        nextStartTime.current += bufferToPlay.duration;
        
        activeAudioSources.current.push(src);

        src.onended = () => {
            activeAudioSources.current = activeAudioSources.current.filter(s => s !== src);
            if (activeAudioSources.current.length === 0) {
                setAgentState(AgentState.IDLE);
            }
        };
    } catch (e) {
        console.error("Audio Playback/Decode Error:", e);
    }
  };

  const endCall = () => {
    if (liveService.current) {
      liveService.current.disconnect();
      liveService.current = null;
    }
    stopAllAudio();
    setIsCallActive(false);
    setIsConnecting(false);
    setAgentState(AgentState.IDLE);
  };

  // --- Recording Logic (Shared for CN Mode & Fallback) ---
  const startFallbackRecording = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (event) => {
            if (event.data.size > 0) {
                audioChunksRef.current.push(event.data);
            }
        };

        mediaRecorderRef.current.onstop = async () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            processRecording(audioBlob);
            stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorderRef.current.start();
        setIsRecording(true);
        setAgentState(AgentState.LISTENING);
        setToastMessage("正在录音... 松开发送");
    } catch (e) {
        setToastMessage("无法访问麦克风");
    }
  };

  const stopFallbackRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
        setAgentState(AgentState.THINKING);
        setToastMessage("正在思考...");
    }
  };

  const processRecording = async (blob: Blob) => {
      try {
          let result;
          
          if (serviceMode === ServiceMode.CN) {
              if (!cnService.current) cnService.current = new CNService();
              result = await cnService.current.processAudioInput(blob);
          } else {
              if (!turnBasedService.current) turnBasedService.current = new TurnBasedService();
              result = await turnBasedService.current.processAudioInput(blob);
          }
          
          if (result.text) {
              addMessage('model', result.text);
          }
          
          if (result.audioData) {
              playAudio(result.audioData);
          } else {
              setAgentState(AgentState.IDLE);
          }

      } catch (e) {
          console.error("Processing failed", e);
          addMessage('model', "小萌刚才没听清，请再说一遍~");
          setAgentState(AgentState.IDLE);
      }
  };

  const addMessage = (role: 'user' | 'model', text: string) => {
      setMessages(prev => [...prev, { id: Date.now().toString(), role, text, timestamp: Date.now() }]);
  };

  const handleSendText = async (e: React.FormEvent) => {
      e.preventDefault();
      const text = inputText.trim();
      if (!text) return;

      setInputText('');
      setInputMode('none');
      setShowHistory(true); 
      addMessage('user', text);
      setAgentState(AgentState.THINKING);

      if (isCallActive) {
          endCall();
      }

      try {
          const apiKey = getNextApiKey();
          const options: any = { apiKey: apiKey || '' };
          if (CONFIG.API_BASE_URL) options.baseUrl = CONFIG.API_BASE_URL;
          
          const ai = new GoogleGenAI(options);
          textChatClient.current = ai.chats.create({
              model: CONFIG.MODELS.TEXT,
              config: {
                  systemInstruction: CONFIG.SYSTEM_INSTRUCTION,
              }
          });
          
          const result = await textChatClient.current.sendMessage({ message: text });
          addMessage('model', result.text);
          setAgentState(AgentState.IDLE);

      } catch (error) {
          console.error("Text chat failed", error);
          addMessage('model', '网络不给力哦~');
          setAgentState(AgentState.IDLE);
      }
  };

  // --- Rendering Helpers ---
  const handleCategoryClick = (category: 'red' | 'nature' | 'people' | 'industries') => {
      setActiveCategory(category);
      setCurrentView('map');
      setSelectedSpot(null); 
  };

  const navigateToDetail = (spot: any) => {
      setDetailSpot(spot);
      setCurrentView('detail');
  };

  const renderNetworkCheckModal = () => (
      <div className="absolute inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
              <div className="flex items-center gap-3 mb-4 flex-shrink-0">
                 <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                     <i className="fas fa-satellite-dish text-blue-500 animate-pulse"></i>
                 </div>
                 <h3 className="font-black text-gray-800 text-lg">环境检测中...</h3>
              </div>

              {networkCheckPhase === 'checking' && (
                  <div className="space-y-4 py-4">
                      <p className="text-gray-500 text-sm font-medium">小萌正在为您探测语音与网络环境...</p>
                      <div className="h-4 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                          <div 
                            className="h-full bg-blue-500 transition-all duration-200 ease-out flex items-center justify-end pr-1"
                            style={{ width: `${networkProgress}%` }}
                          >
                             {networkProgress > 20 && <div className="w-1.5 h-1.5 bg-white rounded-full opacity-50 animate-ping"></div>}
                          </div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-400 font-bold">
                          <span>连接基站</span>
                          <span>{networkProgress}%</span>
                      </div>
                  </div>
              )}

              {networkCheckPhase === 'result' && (
                  <div className="animate-slide-up overflow-y-auto pr-1">
                      <div className="bg-blue-50 rounded-2xl p-4 mb-3 border border-blue-100">
                          <h4 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">当前设备报告</h4>
                          <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                  <span className="text-sm text-gray-600 font-bold"><i className="fas fa-wifi w-6 text-center text-blue-400"></i>实时通话</span>
                                  <span className="text-xs font-bold text-orange-500 bg-orange-100 px-2 py-0.5 rounded">较弱 (网络限制)</span>
                              </div>
                              <div className="flex justify-between items-center">
                                  <span className="text-sm text-gray-600 font-bold"><i className="fas fa-microphone w-6 text-center text-blue-400"></i>语音输入</span>
                                  <span className="text-xs font-bold text-green-500 bg-green-100 px-2 py-0.5 rounded">正常</span>
                              </div>
                              <div className="flex justify-between items-center">
                                  <span className="text-sm text-gray-600 font-bold"><i className="fas fa-volume-up w-6 text-center text-blue-400"></i>语音输出</span>
                                  <span className="text-xs font-bold text-green-500 bg-green-100 px-2 py-0.5 rounded">支持</span>
                              </div>
                          </div>
                      </div>

                      <div className="bg-amber-50 rounded-xl p-3 mb-4 border border-amber-100 text-xs text-amber-800 leading-relaxed relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-2 opacity-10">
                              <i className="fas fa-sad-tear text-4xl"></i>
                          </div>
                          <p className="font-bold mb-1 flex items-center gap-1">
                              <i className="fas fa-hand-holding-heart text-amber-500"></i> 小萌心里话：
                          </p>
                          <p className="mb-1">
                              网络可能有点小情绪，如果听不见小萌的声音，请尝试切换到更稳定的模式哦 (｡•́︿•̀｡)。
                          </p>
                      </div>

                      <div className="flex flex-col gap-3">
                          <button 
                            onClick={() => finalizeNetworkChoice('live')}
                            className="w-full bg-blue-500 text-white py-3 rounded-xl font-bold text-sm shadow-md shadow-blue-200 active:scale-95 transition flex items-center justify-between px-4 shrink-0"
                          >
                              <span>A. 尝试实时通话 (Live)</span>
                              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded text-white">体验流畅</span>
                          </button>
                          
                          <button 
                             onClick={() => finalizeNetworkChoice('wechat')}
                             className="w-full bg-white border-2 border-gray-100 text-gray-600 py-3 rounded-xl font-bold text-sm hover:bg-gray-50 active:scale-95 transition flex items-center justify-between px-4 shrink-0"
                          >
                              <span>B. 语音对话 (微信式)</span>
                              <span className="text-[10px] bg-gray-200 px-2 py-0.5 rounded text-gray-500">更稳定</span>
                          </button>
                      </div>
                  </div>
              )}
          </div>
      </div>
  );

  const renderDashboard = () => (
    <>
      <div className="relative z-20 pt-4 px-6 flex justify-between items-center animate-fade-in">
        <div className="flex flex-col">
           <h1 className={`text-3xl font-black ${theme.primaryText} tracking-tight leading-none`}>东里村</h1>
           <h2 className="text-xs text-gray-400 font-medium mt-1 tracking-wider">村官智能体 伴您游</h2>
        </div>
        <div className="flex flex-col items-end gap-1">
            <ModeSwitch mode={serviceMode} onToggle={handleModeToggle} />
            <WeatherWidget />
        </div>
      </div>

      <div className="relative z-10 flex-1 pl-6 pr-0 py-3 grid grid-cols-[1fr_auto] gap-2 animate-slide-up">
        <div className="grid grid-cols-2 gap-3 auto-rows-min pr-4">
            <div className="col-span-2 h-32 bg-gray-200 rounded-3xl relative overflow-hidden group cursor-pointer hover:bg-gray-300 transition-colors shadow-sm">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-12 bg-yellow-400 rounded-xl border-2 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:translate-y-1 group-hover:shadow-none transition-all">
                        <i className="fas fa-play text-xl"></i>
                    </div>
                </div>
                <span className="absolute left-6 top-6 text-xl font-bold text-gray-600">村子简介</span>
            </div>
            
            {/* Category Cards */}
            {['red', 'nature', 'people', 'industries'].map(cat => (
                <div 
                    key={cat}
                    onClick={() => handleCategoryClick(cat as any)}
                    className="h-40 bg-gray-300 rounded-3xl relative p-6 flex items-end hover:scale-[1.02] transition-transform cursor-pointer shadow-sm group overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                         <i className={`fas ${
                             cat === 'red' ? 'fa-star' : cat === 'nature' ? 'fa-tree' : cat === 'people' ? 'fa-user-graduate' : 'fa-seedling'
                         } text-6xl text-gray-600`}></i>
                    </div>
                    <span className="text-lg font-medium text-gray-600">{SPOT_DATA[cat as keyof typeof SPOT_DATA].title}</span>
                </div>
            ))}
            
             <div onClick={() => setCurrentView('media')} className="h-40 bg-gray-300 rounded-3xl relative p-6 flex items-end hover:scale-[1.02] transition-transform cursor-pointer shadow-sm group overflow-hidden">
                 <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <i className="fas fa-photo-video text-6xl text-gray-600"></i>
                 </div>
                 <span className="text-lg font-medium text-gray-600">视频自媒体</span>
            </div>
        </div>

        <div className="flex flex-col items-end pt-2">
            <div className="flex flex-col gap-5 bg-white/40 backdrop-blur-xl rounded-l-2xl py-4 pl-3 pr-2 border-l border-white/60 shadow-sm mr-0">
                <button onClick={() => setToastMessage("功能开发中")} className="flex flex-col items-center gap-1 group">
                    <div className={`w-12 h-12 ${theme.accentColor} bg-gradient-to-b rounded-2xl shadow-lg flex items-center justify-center text-white text-xl group-hover:scale-110 transition-transform`}>
                        <i className="fas fa-user"></i>
                    </div>
                    <span className="text-[10px] font-bold text-gray-600">我的</span>
                </button>
                <button onClick={() => setShowHistory(true)} className="flex flex-col items-center gap-1 group">
                    <div className={`w-12 h-12 ${theme.accentColor} bg-gradient-to-b rounded-2xl shadow-lg flex items-center justify-center text-white text-xl group-hover:scale-110 transition-transform`}>
                        <i className="fas fa-history"></i>
                    </div>
                    <span className="text-[10px] font-bold text-gray-600">记录</span>
                </button>
            </div>
        </div>
      </div>
    </>
  );

  const renderMapPage = () => {
    const activeData = SPOT_DATA[activeCategory];
    return (
        <div className="flex flex-col h-full relative z-20 animate-fade-in">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 bg-white/80 backdrop-blur-md z-30 sticky top-0 shadow-sm">
                <button onClick={() => setCurrentView('dashboard')} className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-600 active:scale-95 transition hover:bg-gray-50 border border-gray-100"><i className="fas fa-chevron-left"></i></button>
                <span className="font-bold text-xl text-gray-700">村落导览</span>
                <div className="w-10"></div>
            </div>
            <div className="flex-1 overflow-y-auto px-6 pb-32 space-y-4 scrollbar-hide">
                 {activeData.spots.map(spot => (
                     <div key={spot.id} onClick={() => navigateToDetail(spot)} className="bg-white p-5 rounded-3xl shadow-sm flex items-center gap-5 animate-slide-up cursor-pointer active:bg-gray-50 transition border border-gray-50 hover:border-gray-100">
                         <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${activeData.lightBg} ${activeData.text}`}><i className="fas fa-map-marker-alt text-2xl"></i></div>
                         <div className="flex-1"><h4 className="font-bold text-gray-800 text-lg">{spot.name}</h4></div>
                     </div>
                 ))}
             </div>
        </div>
    );
  };

  const renderMediaPage = () => (
      <div className="flex flex-col h-full relative z-20 animate-fade-in">
         <div className="flex items-center justify-between px-6 pt-6 pb-4 bg-white/80 backdrop-blur-md z-30 sticky top-0 shadow-sm">
             <button onClick={() => setCurrentView('dashboard')} className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-600"><i className="fas fa-chevron-left"></i></button>
             <span className="font-bold text-xl text-gray-700">视频自媒体</span>
             <div className="w-10"></div>
         </div>
         <div className="flex-1 flex items-center justify-center text-gray-400">内容暂无</div>
      </div>
  );

  const renderDetailPage = () => {
      if (!detailSpot) return null;
      return (
          <div className="flex flex-col h-full relative z-20 animate-fade-in">
             <div className="flex items-center justify-between px-6 pt-6 pb-2 z-30">
                 <button onClick={() => setCurrentView('map')} className="w-12 h-12 rounded-full bg-yellow-400 shadow-sm flex items-center justify-center text-gray-800"><i className="fas fa-arrow-left text-lg"></i></button>
             </div>
             <div className="flex-1 overflow-y-auto px-4 pb-32 scrollbar-hide">
                 <div className="bg-white rounded-[2rem] shadow-sm mt-4 overflow-hidden border-2 border-blue-500/20 relative">
                     <img src={detailSpot.detailImage} className="w-full h-48 object-cover" />
                     <div className="p-5"><p className="text-gray-600 text-sm leading-relaxed text-justify">{detailSpot.desc}</p></div>
                 </div>
             </div>
          </div>
      );
  };


  return (
    <div className={`h-screen w-full max-w-[980px] mx-auto ${theme.bg} text-gray-800 relative overflow-hidden flex flex-col font-sans select-none shadow-2xl transition-colors duration-500`}>
      
      <div className="absolute inset-0 pointer-events-none opacity-[0.02] z-0 flex items-center justify-center">
         <span className="text-8xl font-black rotate-[-15deg]">非商用使用</span>
      </div>

      {currentView === 'dashboard' ? renderDashboard() : 
       currentView === 'map' ? renderMapPage() : 
       currentView === 'media' ? renderMediaPage() :
       renderDetailPage()}

      {/* Network Check Modal Overlay */}
      {showNetworkModal && renderNetworkCheckModal()}

      {/* Avatar */}
      <div 
          onPointerDown={(e) => handlePointerDown(e, 'avatar')}
          className={`z-50 w-48 h-48 md:w-64 md:h-64 touch-none cursor-move transition-transform active:scale-105 ${!avatarPos ? 'absolute bottom-8 -left-4' : 'fixed'}`}
          style={avatarPos ? { left: avatarPos.x, top: avatarPos.y } : undefined}
      >
          <AgentAvatar state={agentState} volume={0.5} mode={serviceMode} />
      </div>

      {/* Controls Capsule */}
      <div 
          onPointerDown={(e) => handlePointerDown(e, 'controls')}
          className={`z-50 touch-none cursor-move active:scale-105 transition-transform ${!controlsPos ? 'absolute bottom-10 left-1/2 -translate-x-1/2' : 'fixed'}`}
          style={controlsPos ? { left: controlsPos.x, top: controlsPos.y } : undefined}
      >
          {isCheckingMic && (
             <div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-48 bg-black/60 backdrop-blur-md rounded-full p-1 border border-white/20 animate-fade-in z-50">
                 <div className="flex items-center gap-2 px-2 mb-1">
                    <span className="text-[10px] text-white font-bold">检测中...</span>
                 </div>
             </div>
          )}

          {(isCallActive || isRecording) && (
             <div className={`absolute bottom-24 left-1/2 -translate-x-1/2 ${serviceMode === ServiceMode.CN ? 'bg-red-500' : 'bg-blue-500'} text-white text-xs px-4 py-2 rounded-2xl shadow-lg border border-white/20 animate-bounce-slow z-50 flex items-center gap-2 whitespace-nowrap`}>
                 <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                 <span className="font-bold">
                    {isRecording ? "松开结束发送" : "已接通！"}
                 </span>
             </div>
          )}

          <div className="flex items-center bg-black/60 backdrop-blur-xl rounded-full p-1.5 pl-6 shadow-[0_0_20px_rgba(255,255,255,0.2)] gap-4 pointer-events-none ring-1 ring-white/30 border border-white/10">
              <div className="flex flex-col leading-none pointer-events-auto cursor-pointer group" onClick={() => setInputMode('text')}>
                  <span className="text-white font-bold text-lg drop-shadow-md group-hover:text-blue-200 transition-colors">键盘</span>
                  <span className="text-[10px] text-gray-300 transform scale-90 origin-left">拖动</span>
              </div>
              
              <button 
                  onPointerDown={() => handleVoiceInteraction('press')}
                  onPointerUp={() => handleVoiceInteraction('release')}
                  onPointerLeave={() => { if(isRecording) handleVoiceInteraction('release'); }}
                  className={`h-12 px-6 rounded-full font-bold flex items-center gap-2 transition-all pointer-events-auto shadow-lg shadow-white/10 select-none touch-none ${
                      isCallActive || isRecording
                      ? (serviceMode === ServiceMode.CN ? 'bg-red-500 text-white scale-110' : 'bg-blue-500 text-white animate-pulse')
                      : (isConnecting || isCheckingMic)
                        ? 'bg-gray-100 text-gray-500 cursor-wait'
                        : (serviceMode === ServiceMode.CN ? 'bg-gradient-to-r from-red-100 to-white text-red-600 border border-red-200' : 'bg-white text-cyan-600 hover:bg-gray-50')
                  }`}
              >
                  {(isConnecting || isCheckingMic) ? (
                      <i className="fas fa-circle-notch fa-spin"></i>
                  ) : (
                      <>
                          <i className={`fas ${isFallbackMode || serviceMode === ServiceMode.CN ? 'fa-microphone-alt' : 'fa-microphone'}`}></i>
                          <span className="text-lg">
                              {serviceMode === ServiceMode.CN ? '按住说话' : (isCallActive ? '挂断' : '畅聊')}
                          </span>
                      </>
                  )}
              </button>
          </div>
      </div>

      {/* Toast */}
      {toastMessage && (
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-[80] bg-black/70 backdrop-blur-md text-white px-6 py-3 rounded-full shadow-xl animate-slide-up flex items-center gap-2 pointer-events-none whitespace-nowrap">
              <i className="fas fa-info-circle text-yellow-400"></i>
              <span className="font-bold text-sm tracking-wide">{toastMessage}</span>
          </div>
      )}

      {/* Chat History */}
      {showHistory && (
          <div className="absolute inset-y-0 right-0 w-full md:w-96 bg-white/95 backdrop-blur shadow-2xl z-[70] flex flex-col animate-slide-left border-l border-gray-100">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white">
                  <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2"><i className="fas fa-comments text-blue-500"></i>记录</h3>
                  <button onClick={() => setShowHistory(false)} className="w-8 h-8 rounded-full bg-gray-100"><i className="fas fa-times"></i></button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 scrollbar-hide">
                  {messages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm shadow-sm ${
                              msg.role === 'user' ? theme.bubbleUser + ' text-white rounded-tr-none' : theme.bubbleModel + ' rounded-tl-none border'
                          }`}>
                              {msg.text}
                          </div>
                      </div>
                  ))}
                  <div ref={chatEndRef} />
              </div>
          </div>
      )}
      
      <style>{`
        /* Styles kept from previous */
        @keyframes slide-left { from { transform: translateX(100%); } to { transform: translateX(0); } }
        .animate-slide-left { animation: slide-left 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default App;
