import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, MessageSquare, Search, User as UserIcon, Clock } from 'lucide-react';
import { useMessageStore } from '@/store/messageStore';
import { useUserStore } from '@/store/userStore';
import { useUIStore } from '@/store/uiStore';
import { useItemsStore } from '@/store/itemsStore';

interface Message {
  id: string;
  fromUserId: string;
  toUserId: string;
  itemId?: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
}

const Messages: React.FC = () => {
  const navigate = useNavigate();
  const { messages, sendMessage: sendMsg, getConversation, getConversationList, markAsRead } = useMessageStore();
  const { currentUser, users } = useUserStore();
  const { showToast } = useUIStore();
  const { items } = useItemsStore();

  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    if (!currentUser) {
      showToast('请先登录', 'warning');
      navigate('/auth');
    }
  }, [currentUser, navigate, showToast]);

  if (!currentUser) return null;

  const conversationList = getConversationList(currentUser.id);
  const activeMessages = activeChat ? getConversation(currentUser.id, activeChat) : [];

  const getUserById = (userId: string) => {
    return users.find(u => u.id === userId) || {
      id: userId,
      name: userId === 'user1' ? '小明同学' : userId === 'user2' ? '同学A' : '同学' + userId.slice(-1),
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop'
    };
  };

  const getItemById = (itemId?: string) => {
    if (!itemId) return null;
    return items.find(i => i.id === itemId);
  };

  const formatTime = (date: Date) => {
    const d = new Date(date);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  const handleSend = () => {
    if (!activeChat || !newMessage.trim()) return;
    sendMsg(activeChat, newMessage.trim());
    setNewMessage('');
    setTimeout(() => {
      const chatEl = document.getElementById('chat-messages');
      if (chatEl) chatEl.scrollTop = chatEl.scrollHeight;
    }, 100);
  };

  const openChat = (userId: string) => {
    setActiveChat(userId);
    markAsRead(userId);
  };

  return (
    <div className="pb-24 md:pt-20 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b z-10 md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h1 className="font-semibold">消息</h1>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto">
        <div className="flex h-[calc(100vh-8rem)] md:h-[calc(100vh-6rem)] bg-white rounded-3xl shadow-lg overflow-hidden md:mt-4">
          {/* Conversation List */}
          <div className={`w-full md:w-80 border-r flex flex-col ${activeChat ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-4 border-b">
              <h2 className="text-xl font-bold text-gray-800 mb-4 hidden md:block">消息中心</h2>
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索联系人..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {conversationList.length === 0 ? (
                <div className="p-6 text-center">
                  <MessageSquare size={48} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500 text-sm">暂无消息</p>
                  <p className="text-gray-400 text-xs mt-1">浏览物品并联系卖家开始聊天</p>
                  <button
                    onClick={() => navigate('/list')}
                    className="mt-4 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium"
                  >
                    去看看
                  </button>
                </div>
              ) : (
                conversationList.map((conv) => {
                  const otherUser = getUserById(conv.userId);
                  return (
                    <button
                      key={conv.userId}
                      onClick={() => openChat(conv.userId)}
                      className={`w-full p-4 flex items-center gap-3 border-b border-gray-100 transition-all hover:bg-gray-50 ${
                        activeChat === conv.userId ? 'bg-orange-50 border-l-4 border-l-primary' : ''
                      }`}
                    >
                      <div className="relative">
                        <img
                          src={otherUser.avatar}
                          alt={otherUser.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        {conv.unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-gray-800 truncate">{otherUser.name}</p>
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Clock size={12} />
                            {formatTime(conv.lastMessage.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 truncate mt-1">{conv.lastMessage.content}</p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className={`flex-1 flex flex-col ${activeChat ? 'flex' : 'hidden md:flex'}`}>
            {activeChat ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b flex items-center gap-3 bg-white">
                  <button
                    onClick={() => setActiveChat(null)}
                    className="md:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <ArrowLeft size={24} />
                  </button>
                  <img
                    src={getUserById(activeChat).avatar}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-gray-800">{getUserById(activeChat).name}</p>
                    <p className="text-xs text-gray-500">在线</p>
                  </div>
                </div>

                {/* Messages */}
                <div id="chat-messages" className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                  {activeMessages.length === 0 ? (
                    <div className="text-center text-gray-400 py-8">
                      <MessageSquare size={32} className="mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">发送消息开始对话</p>
                    </div>
                  ) : (
                    activeMessages.map((msg) => {
                      const isMe = msg.fromUserId === currentUser.id;
                      const item = getItemById(msg.itemId);
                      return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[75%] ${isMe ? 'order-2' : 'order-1'}`}>
                            {item && (
                              <div className={`mb-2 p-3 rounded-2xl border-2 ${isMe ? 'bg-orange-50 border-orange-200' : 'bg-white border-gray-200'}`}>
                                <p className="text-xs text-gray-500 mb-1">关于物品</p>
                                <div className="flex items-center gap-2">
                                  <img src={item.image} alt="" className="w-12 h-12 rounded-lg object-cover" />
                                  <div className="text-left">
                                    <p className="text-sm font-medium text-gray-800 truncate">{item.title}</p>
                                    <p className="text-sm text-primary font-bold">¥{item.price}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                            <div
                              className={`px-4 py-3 rounded-2xl ${
                                isMe
                                  ? 'bg-gradient-to-r from-primary to-orange-400 text-white rounded-br-sm'
                                  : 'bg-white text-gray-800 rounded-bl-sm shadow-sm'
                              }`}
                            >
                              <p className="text-sm">{msg.content}</p>
                            </div>
                            <p className={`text-xs text-gray-400 mt-1 ${isMe ? 'text-right' : 'text-left'}`}>
                              {formatTime(msg.timestamp)}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Input */}
                <div className="p-4 border-t bg-white">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="输入消息..."
                      className="flex-1 px-4 py-3 bg-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    <button
                      onClick={handleSend}
                      disabled={!newMessage.trim()}
                      className="px-6 py-3 bg-gradient-to-r from-primary to-orange-400 text-white rounded-2xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all flex items-center gap-2"
                    >
                      <Send size={18} />
                      发送
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
                <MessageSquare size={64} className="mb-4 text-gray-300" />
                <p className="text-lg font-medium text-gray-600">选择一个对话开始聊天</p>
                <p className="text-sm mt-2">浏览物品并与卖家沟通交易详情</p>
                <button
                  onClick={() => navigate('/list')}
                  className="mt-6 px-6 py-3 bg-primary text-white rounded-2xl font-medium hover:shadow-lg transition-all"
                >
                  去浏览好物
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
