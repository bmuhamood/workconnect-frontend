'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search, Send, Phone, Video, MoreVertical, Paperclip,
  Smile, Calendar, CheckCheck, Check, Clock, Filter,
  MessageSquare, Users, Archive, Bell, UserPlus
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  isSent: boolean;
}

interface Conversation {
  id: string;
  participant: {
    id: string;
    name: string;
    role: string;
    avatar?: string;
    lastSeen: Date;
    isOnline: boolean;
  };
  lastMessage: string;
  unreadCount: number;
  timestamp: Date;
  isPinned: boolean;
}

export default function MessagesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: '1',
      participant: {
        id: '101',
        name: 'John Kamya',
        role: 'Electrician',
        avatar: undefined,
        lastSeen: new Date(Date.now() - 300000),
        isOnline: true,
      },
      lastMessage: 'I can start tomorrow at 8 AM',
      unreadCount: 3,
      timestamp: new Date(Date.now() - 60000),
      isPinned: true,
    },
    {
      id: '2',
      participant: {
        id: '102',
        name: 'Sarah Nakato',
        role: 'Cleaner',
        avatar: undefined,
        lastSeen: new Date(Date.now() - 3600000),
        isOnline: false,
      },
      lastMessage: 'Thank you for the opportunity!',
      unreadCount: 0,
      timestamp: new Date(Date.now() - 1800000),
      isPinned: false,
    },
  ]);
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      senderId: '101',
      senderName: 'John Kamya',
      content: 'Hello, I saw your job posting for an electrician. I have 5 years of experience.',
      timestamp: new Date(Date.now() - 3600000),
      isRead: true,
      isSent: false,
    },
    {
      id: '2',
      senderId: '0',
      senderName: 'You',
      content: 'Hi John! Thanks for reaching out. Can you share your portfolio?',
      timestamp: new Date(Date.now() - 1800000),
      isRead: true,
      isSent: true,
    },
    {
      id: '3',
      senderId: '101',
      senderName: 'John Kamya',
      content: 'Yes, I have my certificates and previous work photos. I can send them.',
      timestamp: new Date(Date.now() - 900000),
      isRead: true,
      isSent: false,
    },
    {
      id: '4',
      senderId: '101',
      senderName: 'John Kamya',
      content: 'I can start tomorrow at 8 AM if that works for you?',
      timestamp: new Date(Date.now() - 60000),
      isRead: false,
      isSent: false,
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    // Simulate loading
    setTimeout(() => setLoading(false), 1000);
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedConversation) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: '0',
      senderName: 'You',
      content: messageInput,
      timestamp: new Date(),
      isRead: true,
      isSent: true,
    };

    setMessages([...messages, newMessage]);
    setMessageInput('');

    // Update conversation last message
    setConversations(prev =>
      prev.map(conv =>
        conv.id === selectedConversation
          ? {
              ...conv,
              lastMessage: messageInput,
              timestamp: new Date(),
              unreadCount: 0,
            }
          : conv
      )
    );

    toast.success('Message sent');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredConversations = conversations.filter(conv => {
    if (activeTab === 'unread') return conv.unreadCount > 0;
    if (activeTab === 'pinned') return conv.isPinned;
    return true;
  }).filter(conv =>
    conv.participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.participant.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeConversation = conversations.find(conv => conv.id === selectedConversation);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
              <p className="text-gray-600">Communicate with workers and employers</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline">
                <UserPlus className="h-4 w-4 mr-2" />
                New Chat
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Left Column - Conversations */}
          <div className="lg:col-span-1 flex flex-col border rounded-lg bg-white">
            {/* Search Bar */}
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="px-4 pt-4">
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="unread">
                  Unread
                  {conversations.filter(c => c.unreadCount > 0).length > 0 && (
                    <Badge className="ml-2 bg-red-500 text-white text-xs">
                      {conversations.filter(c => c.unreadCount > 0).length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="pinned">Pinned</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Conversations List */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-2">
                {filteredConversations.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No conversations found</p>
                    <Button variant="outline" className="mt-4">
                      Start New Chat
                    </Button>
                  </div>
                ) : (
                  filteredConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedConversation === conversation.id
                          ? 'bg-blue-50 border border-blue-200'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedConversation(conversation.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="relative">
                          <Avatar className="h-12 w-12">
                            {conversation.participant.avatar ? (
                              <AvatarImage src={conversation.participant.avatar} />
                            ) : (
                              <AvatarFallback className="bg-gradient-to-r from-blue-100 to-purple-100">
                                {conversation.participant.name
                                  .split(' ')
                                  .map(n => n[0])
                                  .join('')}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          {conversation.participant.isOnline && (
                            <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {conversation.participant.name}
                            </h3>
                            <span className="text-xs text-gray-500">
                              {conversation.timestamp.getHours()}:{conversation.timestamp.getMinutes().toString().padStart(2, '0')}
                            </span>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-sm text-gray-600 truncate">
                              {conversation.lastMessage}
                            </p>
                            {conversation.unreadCount > 0 && (
                              <Badge className="bg-blue-600 text-white text-xs">
                                {conversation.unreadCount}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <Badge variant="outline" className="text-xs">
                              {conversation.participant.role}
                            </Badge>
                            {conversation.isPinned && (
                              <div className="text-amber-500">
                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M5.5 17.5v-11l7 7 7-7v11a.5.5 0 01-.5.5h-13a.5.5 0 01-.5-.5z" />
                                </svg>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Right Column - Chat */}
          <div className="lg:col-span-2 flex flex-col border rounded-lg bg-white">
            {selectedConversation && activeConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      {activeConversation.participant.avatar ? (
                        <AvatarImage src={activeConversation.participant.avatar} />
                      ) : (
                        <AvatarFallback className="bg-gradient-to-r from-blue-100 to-purple-100">
                          {activeConversation.participant.name
                            .split(' ')
                            .map(n => n[0])
                            .join('')}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {activeConversation.participant.name}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          {activeConversation.participant.role}
                        </Badge>
                        <div className="flex items-center text-xs text-gray-500">
                          {activeConversation.participant.isOnline ? (
                            <>
                              <div className="h-2 w-2 rounded-full bg-green-500 mr-1"></div>
                              Online
                            </>
                          ) : (
                            <>
                              <Clock className="h-3 w-3 mr-1" />
                              Last seen {activeConversation.participant.lastSeen.getHours()}:{activeConversation.participant.lastSeen.getMinutes().toString().padStart(2, '0')}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Video className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Messages Area */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.senderId === '0' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                            message.senderId === '0'
                              ? 'bg-blue-600 text-white rounded-br-none'
                              : 'bg-gray-100 text-gray-900 rounded-bl-none'
                          }`}
                        >
                          <div className="flex items-center space-x-2 mb-1">
                            {message.senderId !== '0' && (
                              <span className="font-semibold text-sm">
                                {message.senderName}
                              </span>
                            )}
                          </div>
                          <p className="whitespace-pre-wrap">{message.content}</p>
                          <div className={`flex items-center justify-end mt-1 text-xs ${
                            message.senderId === '0' ? 'text-blue-200' : 'text-gray-500'
                          }`}>
                            <span>
                              {message.timestamp.getHours()}:{message.timestamp.getMinutes().toString().padStart(2, '0')}
                            </span>
                            {message.senderId === '0' && (
                              <span className="ml-2">
                                {message.isRead ? (
                                  <CheckCheck className="h-3 w-3" />
                                ) : (
                                  <Check className="h-3 w-3" />
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="p-4 border-t">
                  <div className="flex items-end space-x-2">
                    <Button variant="ghost" size="icon">
                      <Paperclip className="h-5 w-5" />
                    </Button>
                    <div className="flex-1 relative">
                    <Textarea
                        placeholder="Type your message..."
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyDown={handleKeyPress}
                        className="pr-12 min-h-[40px] max-h-[120px] resize-none"
                        rows={1}
                    />
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    >
                        <Smile className="h-5 w-5" />
                    </Button>
                    </div>
                    <Button
                      onClick={handleSendMessage}
                      disabled={!messageInput.trim()}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                    <div className="flex items-center space-x-4">
                      <span>Press Enter to send</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" className="text-xs">
                        <Calendar className="h-3 w-3 mr-1" />
                        Schedule Meeting
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8">
                <MessageSquare className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No conversation selected</h3>
                <p className="text-gray-600 text-center mb-6">
                  Select a conversation from the list or start a new chat
                </p>
                <Button>
                  <Users className="h-4 w-4 mr-2" />
                  Browse Workers to Chat With
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions Bar */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-r from-blue-50 to-white">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Archive className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Archive Chats</h4>
                  <p className="text-sm text-gray-600">Clean up old conversations</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-white">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Bell className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Notifications</h4>
                  <p className="text-sm text-gray-600">Manage message alerts</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-white">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <Filter className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Filter Messages</h4>
                  <p className="text-sm text-gray-600">Sort by date or unread</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-amber-50 to-white">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <CheckCheck className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Mark All Read</h4>
                  <p className="text-sm text-gray-600">Clear unread notifications</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}