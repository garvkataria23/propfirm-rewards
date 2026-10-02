'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  MessageSquare,
  Send,
  Headphones,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Ticket,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'BOT' | 'USER';
  text: string;
  timestamp: string;
}

export default function LiveSupportPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-1',
      sender: 'BOT',
      text: 'Hello trader! Welcome to PropNation Live Support. I am your 24/7 AI Desk Assistant. How can I assist you with your prop firm verification, points balance, or reward delivery today?',
      timestamp: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState('VERIFICATION');
  const [ticketDescription, setTicketDescription] = useState('');
  const [ticketSuccess, setTicketSuccess] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'USER',
      text: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    const userQuery = input.toLowerCase();
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      let reply = "Thank you for contacting us! An auditor has received your message. You can also view your live submission status directly in the Verification Hub.";

      if (userQuery.includes('points') || userQuery.includes('balance')) {
        reply = "Points are automatically credited within 45 minutes of purchase verification. You can check your available points and transactions on the 'My Points' ledger.";
      } else if (userQuery.includes('tracking') || userQuery.includes('courier') || userQuery.includes('reward')) {
        reply = "Physical rewards are dispatched via DHL Express / FedEx. Tracking numbers update under 'My Rewards' as soon as the item leaves the distribution hub.";
      } else if (userQuery.includes('verify') || userQuery.includes('proof') || userQuery.includes('invoice')) {
        reply = "Please ensure your uploaded proof is an official PDF invoice or uncropped screenshot showing the Order ID, purchase date, and amount paid.";
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'BOT',
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setIsTyping(false);
    }, 1000);
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketDescription.trim()) return;
    setTicketSuccess(true);
    setTimeout(() => {
      setTicketSuccess(false);
      setTicketModalOpen(false);
      setTicketSubject('');
      setTicketDescription('');
    }, 2500);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-[#14234b]/60">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="purple">Desk Status: Live 24/7</Badge>
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-slate-500 dark:text-slate-400">Response time: ~2 mins</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1 flex items-center gap-2.5">
            <MessageSquare className="h-7 w-7 text-blue-500" />
            PropNation Live Support
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time chat with our dedicated verification agents and reward fulfillment managers.
          </p>
        </div>

        <Button
          onClick={() => setTicketModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30"
        >
          <Ticket className="h-4 w-4 mr-1.5" />
          Open Support Ticket
        </Button>
      </div>

      {/* Chat Container */}
      <Card className="h-[520px] bg-white dark:bg-[#070e20] border-slate-200/90 dark:border-[#14234b]/60 flex flex-col overflow-hidden shadow-lg dark:shadow-2xl">
        {/* Chat Header Bar */}
        <div className="p-4 border-b border-slate-200 dark:border-[#14234b]/60 bg-slate-50 dark:bg-[#09122c] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-blue-50 dark:bg-blue-600/20 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Headphones className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>PropNation Support Desk</span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Average reply: Instant</div>
            </div>
          </div>
        </div>

        {/* Message Log */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${
                m.sender === 'USER' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[80%] sm:max-w-[70%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed shadow-sm ${
                  m.sender === 'USER'
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-slate-100 border border-slate-200 text-slate-800 dark:bg-[#0f1d42] dark:border-[#1a3068] dark:text-slate-200 rounded-bl-none'
                }`}
              >
                {m.text}
              </div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 px-1">{m.timestamp}</span>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 italic">
              <div className="flex gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-bounce" />
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:0.2s]" />
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:0.4s]" />
              </div>
              Agent is typing...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={handleSendMessage}
          className="p-3 border-t border-slate-200 dark:border-[#14234b]/60 bg-slate-50 dark:bg-[#060c1c] flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Type your question or order inquiry..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/90 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:outline-none"
          />
          <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-500 text-white px-4">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </Card>

      {/* Ticket Modal */}
      {ticketModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#070e20] border border-slate-200 dark:border-[#14234b] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Ticket className="h-5 w-5 text-blue-500" />
                Open Official Support Ticket
              </h3>
            </div>

            {ticketSuccess ? (
              <div className="p-6 text-center space-y-3">
                <CheckCircle2 className="h-12 w-12 text-emerald-500 dark:text-emerald-400 mx-auto" />
                <h4 className="text-base font-bold text-slate-900 dark:text-white">Ticket Created Successfully!</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Ticket #{Math.floor(100000 + Math.random() * 900000)} has been logged. An auditor will respond to your registered email address shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleCreateTicket} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Category</label>
                  <select
                    value={ticketCategory}
                    onChange={(e) => setTicketCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="VERIFICATION">Purchase Verification Inquiry</option>
                    <option value="POINTS">Points Ledger / Calculation</option>
                    <option value="REWARD_DELIVERY">Reward Delivery / Tracking</option>
                    <option value="AFFILIATE_CODE">Affiliate Code / Discount Issue</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Subject</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Question regarding Order ID #10492"
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Detailed Description</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Provide full details, order timestamps, and any prop firm transaction references..."
                    value={ticketDescription}
                    onChange={(e) => setTicketDescription(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 resize-none focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setTicketModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-500 text-white">
                    Submit Ticket
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
