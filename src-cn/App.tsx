import React, { useState, useEffect, useRef } from 'react';
import { CNService } from './services/cnService';
import { TextService } from './services/textService';
import { AgentState, ChatMessage } from './types';
import AgentAvatar from './components/AgentAvatar';
import VoiceButton from './components/VoiceButton';
import TextInput from './components/TextInput';
import { CONFIG } from './config';
import { decodeAudioData } from './utils/audioUtils';

// 东里村景点数据
const SPOT_DATA = {
  red: { title: '红色之旅', color: 'red', bg: 'bg-red-500', spots: [
    { id: 'r1', name: '辛亥革命纪念馆', desc: '郑氏宗祠，革命摇篮', detailImage: 'https://picsum.photos/seed/r1/600/400' },
    { id: 'r2', name: '旌义状石碑', desc: '孙中山亲颁', detailImage: 'https://picsum.photos/seed/r2/600/400' },
    { id: 'r3', name: '红军古道', desc: '重走长征路', detailImage: 'https://picsum.photos/seed/r3/600/400' }
  ]},
  nature: { title: '自然风景', color: 'emerald', bg: 'bg-emerald-500', spots: [
    { id: 'n1', name: '仙灵瀑布', desc: '落差百米', detailImage: 'https://picsum.photos/seed/n1/600/400' },
    { id: 'n2', name: '东里水库', desc: '湖光山色', detailImage: 'https://picsum.photos/seed/n2/600/400' },
    { id: 'n3', name: '油桐花海', desc: '五月飞雪', detailImage: 'https://picsum.photos/seed/n3/600/400' }
  ]},
  people: { title: '东里名人', color: 'purple', bg: 'bg-purple-500', spots: [
    { 
      id: 'p1', 
      name: '革命先辈', 
      desc: '追忆为国家独立、民族解放奋斗牺牲的英雄人物，传承红色基因。', 
      detailImage: 'https://picsum.photos/seed/p1/600/400',
      directory: [
        { name: '郑玉指', tag: '同盟会会员', desc: '辛亥革命华侨领袖，追随孙中山先生，倾家荡产资助革命。其故居位于东里中路76号，现为县级文物保护单位。' },
        { name: '颜子俊', tag: '爱国侨领', desc: '著名爱国华侨领袖，抗战期间积极组织海外华侨捐资捐物，支持祖国抗战。' },
        { name: '郑义', tag: '红军烈士', desc: '1930年参加红军，在反围剿战斗中英勇牺牲，年仅22岁。' }
      ]
    },
    { 
      id: 'p2', 
      name: '名士乡贤', 
      desc: '介绍德高望重，热心公益，造福桑梓的杰出乡贤事迹。', 
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
      desc: '展现朝气蓬勃，在各行各业崭露头角，建设家乡的新生代力量。', 
      detailImage: 'https://picsum.photos/seed/p3/600/400',
      directory: [
        { name: '2024届 郑晓明', tag: '清华大学', desc: '以优异成绩考入清华大学计算机系，是东里村近十年来第一位考入清北的学生。' },
        { name: '东里青年创业团', tag: '返乡创业', desc: '由5名返乡大学生组成的创业团队，利用电商平台推广东里特产，年销售额破千万。' },
        { name: '林小红', tag: '非遗传承人', desc: '90后剪纸艺术家，致力于将传统剪纸艺术与现代设计结合，作品多次在省市获奖。' }
      ]
    }
  ]},
  industries: { title: '特色产业', color: 'orange', bg: 'bg-orange-500', spots: [
    { id: 'i1', name: '高山铁观音', desc: '云雾缭绕', detailImage: 'https://picsum.photos/seed/i1/600/400' },
    { id: 'i2', name: '百香果基地', desc: '黄金果业', detailImage: 'https://picsum.photos/seed/i2/600/400' }
  ]}
};

const App: React.FC = () => {
  // 核心状态
  const [agentState, setAgentState] = useState<AgentState>(AgentState.IDLE);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  
  // 录音状态
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  // 导航状态
  const [currentView, setCurrentView] = useState<'dashboard' | 'map' | 'category' | 'detail'>('dashboard');
  const [activeCategory, setActiveCategory] = useState<'red' | 'nature' | 'people' | 'industries'>('red');
  const [selectedCategory, setSelectedCategory] = useState<any | null>(null); // 选中的分类（如革命先辈）
  const [detailSpot, setDetailSpot] = useState<any | null>(null);
  
  // UI状态
  const [inputMode, setInputMode] = useState<'none' | 'text'>('none');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // 服务引用
  const cnService = useRef<CNService | null>(null);
  const textService = useRef<TextService | null>(null);
  const playbackContext = useRef<AudioContext | null>(null);
  const activeAudioSources = useRef<AudioBufferSourceNode[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, showHistory]);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const initPlaybackContext = async () => {
    if (!playbackContext.current || playbackContext.current.state === 'closed') {
      playbackContext.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    if (playbackContext.current.state === 'suspended') {
      await playbackContext.current.resume();
    }
    return playbackContext.current;
  };

  const playAudio = async (data: Uint8Array) => {
    const ctx = await initPlaybackContext();
    setAgentState(AgentState.SPEAKING);
    try {
      const bufferToPlay = await decodeAudioData(data, ctx);
      const src = ctx.createBufferSource();
      src.buffer = bufferToPlay;
      const gainNode = ctx.createGain();
      gainNode.gain.value = 1.0;
      src.connect(gainNode);
      gainNode.connect(ctx.destination);
      src.start();
      activeAudioSources.current.push(src);
      src.onended = () => {
        activeAudioSources.current = activeAudioSources.current.filter(s => s !== src);
        if (activeAudioSources.current.length === 0) setAgentState(AgentState.IDLE);
      };
    } catch (e) {
      console.error("Audio playback error:", e);
      setAgentState(AgentState.IDLE);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        processRecording(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setAgentState(AgentState.LISTENING);
    } catch (e) {
      setToastMessage("无法访问麦克风");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setAgentState(AgentState.THINKING);
    }
  };

  const processRecording = async (blob: Blob) => {
    try {
      if (!cnService.current) cnService.current = new CNService();
      const result = await cnService.current.processAudioInput(blob);
      if (result.text) addMessage('model', result.text);
      if (result.audioData) playAudio(result.audioData);
      else setAgentState(AgentState.IDLE);
    } catch (e) {
      console.error("Processing failed", e);
      addMessage('model', "小萌刚才没听清，请再说一遍~");
      setAgentState(AgentState.IDLE);
    }
  };

  const handleTextSubmit = async (text: string) => {
    setInputMode('none');
    setShowHistory(true);
    addMessage('user', text);
    setAgentState(AgentState.THINKING);
    try {
      if (!textService.current) textService.current = new TextService();
      const result = await textService.current.sendMessage(text);
      addMessage('model', result.text);
      if (result.audioData) playAudio(result.audioData);
      else setAgentState(AgentState.IDLE);
    } catch (error) {
      console.error("Text chat failed", error);
      addMessage('model', '网络不给力哦~');
      setAgentState(AgentState.IDLE);
    }
  };

  const addMessage = (role: 'user' | 'model', text: string) => {
    setMessages(prev => [...prev, { id: Date.now().toString(), role, text, timestamp: Date.now() }]);
  };

  return (
    <div className="h-screen w-full max-w-[980px] mx-auto bg-[#fff1f2] text-gray-800 relative overflow-hidden flex flex-col font-sans select-none shadow-2xl">
      {/* 主界面 */}
      {currentView === 'dashboard' && (
        <>
          <div className="relative z-20 pt-4 px-6 flex justify-between items-center">
            <div><h1 className="text-3xl font-black text-red-800">东里村</h1><h2 className="text-xs text-gray-400 font-medium mt-1">国内版智能导览</h2></div>
          </div>
          <div className="relative z-10 flex-1 px-6 py-3 grid grid-cols-2 gap-3">
            {(['red', 'nature', 'people', 'industries'] as const).map(cat => (
              <div key={cat} onClick={() => { 
                setActiveCategory(cat); 
                // 东里人物需要先显示分类选择，其他直接显示列表
                setCurrentView(cat === 'people' ? 'category' : 'map'); 
              }}
                className="h-40 bg-gray-300 rounded-3xl p-6 flex items-end cursor-pointer hover:scale-105 transition-transform">
                <span className="text-lg font-medium text-gray-600">{SPOT_DATA[cat].title}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* 分类选择页 - 仅用于东里人物 */}
      {currentView === 'category' && (
        <div className="flex flex-col h-full relative z-20">
          <div className="flex items-center justify-between px-6 pt-6 pb-4 bg-white/80">
            <button onClick={() => setCurrentView('dashboard')} className="w-10 h-10 rounded-full bg-white shadow-sm"><i className="fas fa-chevron-left"></i></button>
            <span className="font-bold text-xl">{SPOT_DATA[activeCategory].title}</span><div className="w-10"></div>
          </div>
          <div className="flex-1 overflow-y-auto px-6 pb-32 space-y-4">
            {SPOT_DATA[activeCategory].spots.map(category => (
              <div key={category.id} onClick={() => { setSelectedCategory(category); setCurrentView('map'); }} 
                className="bg-white p-5 rounded-3xl shadow-sm cursor-pointer hover:bg-gray-50 transition">
                <h4 className="font-bold text-gray-800 text-lg">{category.name}</h4>
                <p className="text-gray-500 text-sm mt-1">{category.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {currentView === 'map' && (
        <div className="flex flex-col h-full relative z-20">
          <div className="flex items-center justify-between px-6 pt-6 pb-4 bg-white/80">
            <button onClick={() => setCurrentView(activeCategory === 'people' ? 'category' : 'dashboard')} className="w-10 h-10 rounded-full bg-white shadow-sm"><i className="fas fa-chevron-left"></i></button>
            <span className="font-bold text-xl">{activeCategory === 'people' && selectedCategory ? selectedCategory.name : '村落导览'}</span><div className="w-10"></div>
          </div>
          <div className="flex-1 overflow-y-auto px-6 pb-32 space-y-4">
            {activeCategory === 'people' && selectedCategory && selectedCategory.directory ? (
              // 显示人物卡片列表
              selectedCategory.directory.map((person: any) => (
                <div key={person.name} onClick={() => { setDetailSpot(person); setCurrentView('detail'); }} 
                  className="bg-white p-5 rounded-3xl shadow-sm cursor-pointer hover:bg-gray-50 transition">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-gray-800 text-lg">{person.name}</h4>
                    <span className="text-xs bg-purple-100 text-purple-600 px-3 py-1 rounded-full">{person.tag}</span>
                  </div>
                  <p className="text-gray-500 text-sm mt-2 line-clamp-2">{person.desc}</p>
                </div>
              ))
            ) : (
              // 其他分类显示景点列表
              SPOT_DATA[activeCategory].spots.map(spot => (
                <div key={spot.id} onClick={() => { setDetailSpot(spot); setCurrentView('detail'); }} 
                  className="bg-white p-5 rounded-3xl shadow-sm cursor-pointer hover:bg-gray-50 transition">
                  <h4 className="font-bold text-gray-800 text-lg">{spot.name}</h4>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {currentView === 'detail' && detailSpot && (
        <div className="flex flex-col h-full relative z-20">
          <button onClick={() => setCurrentView('map')} className="absolute top-6 left-6 z-30 w-12 h-12 rounded-full bg-yellow-400 shadow-sm"><i className="fas fa-arrow-left"></i></button>
          <div className="flex-1 overflow-y-auto px-4 pb-32 pt-20">
            <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
              {detailSpot.detailImage && <img src={detailSpot.detailImage} className="w-full h-48 object-cover" />}
              <div className="p-5">
                {detailSpot.tag && <span className="inline-block text-xs bg-purple-100 text-purple-600 px-3 py-1 rounded-full mb-3">{detailSpot.tag}</span>}
                <p className="text-gray-600">{detailSpot.desc}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 头像 */}
      <div className="absolute bottom-8 -left-4 z-50 w-48 h-48">
        <AgentAvatar state={agentState} volume={0.5} />
      </div>

      {/* 控制按钮 */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 flex items-center bg-black/60 backdrop-blur-xl rounded-full p-1.5 pl-6 shadow-lg gap-4 ring-1 ring-white/30">
        <div className="cursor-pointer" onClick={() => setInputMode('text')}><span className="text-white font-bold text-lg">键盘</span></div>
        <VoiceButton isRecording={isRecording} agentState={agentState} onPointerDown={startRecording} onPointerUp={stopRecording} onPointerLeave={() => { if(isRecording) stopRecording(); }} />
      </div>

      {/* 历史记录按钮 */}
      <button onClick={() => setShowHistory(true)} className="absolute top-6 right-6 z-40 w-12 h-12 rounded-full bg-red-500 text-white shadow-lg"><i className="fas fa-history"></i></button>

      {/* Toast */}
      {toastMessage && <div className="absolute top-20 left-1/2 -translate-x-1/2 z-80 bg-black/70 text-white px-6 py-3 rounded-full"><span className="font-bold">{toastMessage}</span></div>}

      {/* 聊天记录 */}
      {showHistory && (
        <div className="absolute inset-y-0 right-0 w-full md:w-96 bg-white/95 z-70 flex flex-col">
          <div className="p-4 border-b flex items-center justify-between"><h3 className="font-bold text-lg">记录</h3><button onClick={() => setShowHistory(false)} className="w-8 h-8 rounded-full bg-gray-100"><i className="fas fa-times"></i></button></div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-red-500 text-white' : 'bg-red-50 border border-red-200 text-red-900'}`}>{msg.text}</div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
        </div>
      )}

      {/* 文字输入 */}
      {inputMode === 'text' && <TextInput onSend={handleTextSubmit} onClose={() => setInputMode('none')} />}
    </div>
  );
};

export default App;
