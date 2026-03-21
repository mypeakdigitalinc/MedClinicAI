'use client';

import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from "@google/genai";
import { MessageSquare, Mic, X, Send, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AIWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState('Click to start conversation');

  const chatEndRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [...messages, userMessage].map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }]
        })),
        config: {
          systemInstruction: "You are a helpful medical clinic assistant for MedClinic AI. You can help patients book appointments, check availability, and answer general clinic questions. Operating hours are Mon-Fri, 9 AM - 5 PM. Appointments are 15 minutes. Be professional and empathetic.",
        }
      });

      const assistantMessage: Message = { 
        role: 'assistant', 
        content: response.text || "I'm sorry, I couldn't process that." 
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI Error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const toggleVoiceMode = async () => {
    if (isVoiceMode) {
      if (sessionRef.current) {
        sessionRef.current.close();
      }
      setIsVoiceMode(false);
      setIsRecording(false);
      return;
    }

    setIsVoiceMode(true);
    setVoiceStatus('Connecting...');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! });
      
      const session = await ai.live.connect({
        model: "gemini-2.5-flash-native-audio-preview-12-2025",
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: "You are a helpful medical clinic assistant for MedClinic AI. You can help patients book appointments, check availability, and answer general clinic questions. Operating hours are Mon-Fri, 9 AM - 5 PM. Appointments are 15 minutes. Be professional and empathetic.",
        },
        callbacks: {
          onopen: () => {
            setVoiceStatus('Listening...');
            setIsRecording(true);
            startAudioCapture(session);
          },
          onmessage: (message: LiveServerMessage) => {
            if (message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data) {
              playAudio(message.serverContent.modelTurn.parts[0].inlineData.data);
            }
          },
          onclose: () => {
            setIsVoiceMode(false);
            setIsRecording(false);
          },
          onerror: (err) => {
            console.error('Voice Error:', err);
            setVoiceStatus('Error. Try again.');
          }
        }
      });

      sessionRef.current = session;
    } catch (error) {
      console.error('Voice connection error:', error);
      setIsVoiceMode(false);
    }
  };

  const startAudioCapture = async (session: any) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new AudioContext({ sampleRate: 16000 });
      const source = audioContextRef.current.createMediaStreamSource(stream);
      const processor = audioContextRef.current.createScriptProcessor(4096, 1, 1);

      source.connect(processor);
      processor.connect(audioContextRef.current.destination);

      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        const pcmData = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
        }
        const base64Data = btoa(String.fromCharCode(...new Uint8Array(pcmData.buffer)));
        session.sendRealtimeInput({ audio: { data: base64Data, mimeType: 'audio/pcm;rate=16000' } });
      };
    } catch (error) {
      console.error('Microphone access error:', error);
    }
  };

  const playAudio = (base64Data: string) => {
    if (!audioContextRef.current) return;
    const binaryString = atob(base64Data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const pcmData = new Int16Array(bytes.buffer);
    const floatData = new Float32Array(pcmData.length);
    for (let i = 0; i < pcmData.length; i++) {
      floatData[i] = pcmData[i] / 0x7FFF;
    }

    const buffer = audioContextRef.current.createBuffer(1, floatData.length, 16000);
    buffer.getChannelData(0).set(floatData);
    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContextRef.current.destination);
    source.start();
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[500px] max-h-[calc(100vh-8rem)]"
          >
            {/* Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <h3 className="font-semibold">MedClinic AI Assistant</h3>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={toggleVoiceMode}
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    isVoiceMode ? "bg-emerald-500 text-white" : "hover:bg-slate-800 text-slate-300"
                  )}
                >
                  <Mic className="w-4 h-4" />
                </button>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-300 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
              {isVoiceMode ? (
                <div className="h-full flex flex-col items-center justify-center space-y-6">
                  <div className="relative">
                    <div className={cn(
                      "w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center transition-all duration-500",
                      isRecording && "scale-110 shadow-[0_0_40px_rgba(16,185,129,0.3)]"
                    )}>
                      <Mic className={cn("w-10 h-10 text-emerald-600", isRecording && "animate-pulse")} />
                    </div>
                    {isRecording && (
                      <div className="absolute -inset-4 border-2 border-emerald-500 rounded-full animate-ping opacity-20" />
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-slate-900 font-medium">{voiceStatus}</p>
                    <p className="text-slate-500 text-sm mt-1">Speak naturally to book an appointment</p>
                  </div>
                  <button 
                    onClick={() => setIsVoiceMode(false)}
                    className="px-6 py-2 bg-slate-900 text-white rounded-full text-sm font-medium hover:bg-slate-800 transition-colors"
                  >
                    Switch to Text
                  </button>
                </div>
              ) : (
                <>
                  {messages.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-slate-500 text-sm">Hello! How can I help you today?</p>
                    </div>
                  )}
                  {messages.map((m, i) => (
                    <div key={i} className={cn("flex", m.role === 'user' ? "justify-end" : "justify-start")}>
                      <div className={cn(
                        "max-w-[80%] p-3 rounded-2xl text-sm",
                        m.role === 'user' 
                          ? "bg-slate-900 text-white rounded-tr-none" 
                          : "bg-white border border-slate-200 text-slate-900 rounded-tl-none shadow-sm"
                      )}>
                        {m.content}
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none shadow-sm">
                        <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </>
              )}
            </div>

            {/* Input */}
            {!isVoiceMode && (
              <div className="p-4 bg-white border-t border-slate-200">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type your message..."
                    className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-slate-900 transition-all"
                  />
                  <button 
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="p-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 disabled:opacity-50 transition-all"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95",
          isOpen ? "bg-slate-900 text-white" : "bg-white text-slate-900 hover:bg-slate-50"
        )}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>
    </div>
  );
}
