import React, { useState, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useCreateMutation } from '../hooks/useCreateMutation';
import { queryKeys, endpoints } from '../endpoints';
import { Send, X, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user'|'assistant', text: string, context?: any}[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const toggleChat = () => setIsOpen(true);
    window.addEventListener('toggle-chat', toggleChat);
    return () => window.removeEventListener('toggle-chat', toggleChat);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const chatMutation = useCreateMutation({
    onSuccess: (data) => {
      setMessages(prev => [...prev, { role: 'assistant', text: data.text, context: data.actionResult }]);
      if (data.proposedAction) {
        queryClient.invalidateQueries({ queryKey: queryKeys.invoices });
        queryClient.invalidateQueries({ queryKey: queryKeys.clients });
      }
      setIsTyping(false);
    },
    onError: () => {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Sorry, I encountered an error.' }]);
      setIsTyping(false);
    }
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isTyping) {
        handleSubmit(e as unknown as React.FormEvent);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;
    
    const msg = input.trim();
    // Capture current history before state update
    const currentHistory = [...messages];
    
    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setInput('');
    setIsTyping(true);
    chatMutation.mutate({ url: endpoints.chat, data: { message: msg, history: currentHistory } });
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-tr from-indigo-600 via-purple-600 to-blue-500 text-white rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 z-50 group ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}
      >
        <div className="absolute inset-0 rounded-full bg-white animate-ping opacity-20 group-hover:opacity-40 duration-1000"></div>
        <Sparkles className="w-6 h-6 relative z-10 animate-pulse" />
      </button>

      <Card className={`h-full border-y-0 border-r-0 rounded-none shadow-xl flex flex-col z-40 border-border bg-card transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] overflow-hidden flex-shrink-0 ${isOpen ? 'w-[400px] border-l' : 'w-0 border-l-0'}`}>
        <CardHeader className="bg-gradient-to-r from-indigo-600 to-blue-600 text-primary-foreground p-4 flex flex-row justify-between items-center space-y-0 flex-shrink-0 rounded-none">
          <CardTitle className="font-semibold flex items-center gap-2 text-base text-white">
            <Sparkles className="w-5 h-5 text-purple-200" /> AI Assistant
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-white hover:bg-white/20 hover:text-white h-8 w-8 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-muted/30">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground mt-10">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Sparkles className="w-8 h-8 text-indigo-500/50" />
            </div>
            <p>Hi! I can help you create clients and invoices.</p>
            <p className="text-xs mt-2">Try: "Create an invoice for John Doe for 5 hours of design at $100/hr"</p>
          </div>
        )}
        
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-xl p-3 text-sm ${
              msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-background border border-border text-foreground rounded-bl-none shadow-sm'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-background border border-border text-muted-foreground rounded-xl rounded-bl-none p-4 shadow-sm flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </CardContent>

      <div className="p-4 bg-background border-t border-border">
        <form onSubmit={handleSubmit} className="flex gap-2 relative items-center">
          <Textarea 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask AI to create an invoice... (Shift+Enter for new line)"
            className="flex-1 pr-12 min-h-[40px] max-h-[120px] rounded-xl resize-none py-3"
            disabled={isTyping}
            rows={1}
          />
          <Button 
            type="submit"
            disabled={isTyping || !input.trim()}
            size="icon"
            className="absolute right-2 bottom-2 h-8 w-8 rounded-full"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </Card>
    </>
  );
}
