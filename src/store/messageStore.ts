import { create } from 'zustand';
import { Message } from '@/types';

interface MessageState {
  messages: Message[];
  sendMessage: (toUserId: string, content: string, itemId?: string) => void;
  getConversation: (userId1: string, userId2: string) => Message[];
  getConversationList: (userId: string) => { userId: string; lastMessage: Message; unreadCount: number }[];
  markAsRead: (conversationId: string) => void;
  getUnreadCount: (userId: string) => number;
}

const initialMessages: Message[] = [
  {
    id: 'msg1',
    fromUserId: 'user2',
    toUserId: 'user1',
    itemId: '1',
    content: '你好，我想买你的高等数学教材，可以便宜点吗？',
    timestamp: new Date(Date.now() - 3600000),
    isRead: true
  },
  {
    id: 'msg2',
    fromUserId: 'user1',
    toUserId: 'user2',
    itemId: '1',
    content: '可以的，20元怎么样？书很新的',
    timestamp: new Date(Date.now() - 3500000),
    isRead: true
  },
  {
    id: 'msg3',
    fromUserId: 'user2',
    toUserId: 'user1',
    itemId: '1',
    content: '好的，那我们约个时间在图书馆门口见面吧',
    timestamp: new Date(Date.now() - 600000),
    isRead: false
  }
];

const loadMessages = (): Message[] => {
  const saved = localStorage.getItem('campus_messages');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }));
      }
    } catch (e) {
      console.error('Failed to parse messages:', e);
    }
  }
  return initialMessages;
};

const saveMessages = (messages: Message[]) => {
  localStorage.setItem('campus_messages', JSON.stringify(messages));
};

export const useMessageStore = create<MessageState>((set, get) => ({
  messages: loadMessages(),

  sendMessage: (toUserId, content, itemId) => {
    const { currentUser } = { currentUser: JSON.parse(localStorage.getItem('campus_current_user') || 'null') };
    if (!currentUser) return;

    const newMessage: Message = {
      id: 'msg_' + Date.now(),
      fromUserId: currentUser.id,
      toUserId,
      content,
      itemId,
      timestamp: new Date(),
      isRead: false
    };

    set((state) => {
      const newMessages = [...state.messages, newMessage];
      saveMessages(newMessages);
      return { messages: newMessages };
    });
  },

  getConversation: (userId1, userId2) => {
    return get().messages
      .filter(
        (m) =>
          (m.fromUserId === userId1 && m.toUserId === userId2) ||
          (m.fromUserId === userId2 && m.toUserId === userId1)
      )
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  },

  getConversationList: (userId) => {
    const { messages } = get();
    const conversationMap = new Map<string, { lastMessage: Message; unreadCount: number }>();

    messages.forEach((msg) => {
      const otherUserId = msg.fromUserId === userId ? msg.toUserId : msg.fromUserId;
      const existing = conversationMap.get(otherUserId);

      if (!existing || new Date(msg.timestamp).getTime() > new Date(existing.lastMessage.timestamp).getTime()) {
        const unreadCount = messages.filter(
          (m) =>
            ((m.fromUserId === userId && m.toUserId === otherUserId) ||
              (m.fromUserId === otherUserId && m.toUserId === userId)) &&
            m.isRead === false &&
            m.toUserId === userId
        ).length;

        conversationMap.set(otherUserId, {
          lastMessage: msg,
          unreadCount
        });
      }
    });

    return Array.from(conversationMap.entries())
      .map(([otherUserId, data]) => ({
        userId: otherUserId,
        lastMessage: data.lastMessage,
        unreadCount: data.unreadCount
      }))
      .sort((a, b) => new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime());
  },

  markAsRead: (conversationId) => {
    const { currentUser } = { currentUser: JSON.parse(localStorage.getItem('campus_current_user') || 'null') };
    if (!currentUser) return;

    set((state) => {
      const newMessages = state.messages.map((m) => {
        if (
          (m.fromUserId === conversationId && m.toUserId === currentUser.id) ||
          (m.fromUserId === currentUser.id && m.toUserId === conversationId)
        ) {
          return { ...m, isRead: true };
        }
        return m;
      });
      saveMessages(newMessages);
      return { messages: newMessages };
    });
  },

  getUnreadCount: (userId) => {
    return get().messages.filter((m) => m.toUserId === userId && !m.isRead).length;
  }
}));
