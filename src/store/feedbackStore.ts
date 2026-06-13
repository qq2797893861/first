import { create } from 'zustand';
import { Feedback } from '@/types';

interface FeedbackState {
  feedbacks: Feedback[];
  addFeedback: (content: string, rating: number) => void;
  getAverageRating: () => number;
  getStats: () => {
    totalItems: number;
    totalTransactions: number;
    totalValue: number;
    totalUsers: number;
    averageRating: number;
    byCategory: { category: string; count: number }[];
  };
}

const loadFeedbacks = (): Feedback[] => {
  const saved = localStorage.getItem('campus_feedbacks');
  if (saved) {
    return JSON.parse(saved).map((f: any) => ({
      ...f,
      createdAt: new Date(f.createdAt)
    }));
  }
  return [
    { id: 'fb1', userId: 'user1', content: '平台非常好用，交易很顺利！', rating: 5, createdAt: new Date(Date.now() - 86400000 * 7) },
    { id: 'fb2', userId: 'user2', content: '物品描述真实，和图片一致', rating: 4, createdAt: new Date(Date.now() - 86400000 * 5) },
    { id: 'fb3', userId: 'user3', content: '建议增加更多分类选项', rating: 4, createdAt: new Date(Date.now() - 86400000 * 3) },
    { id: 'fb4', userId: 'user1', content: '客服响应很快，解决了我的问题', rating: 5, createdAt: new Date(Date.now() - 86400000 * 2) },
    { id: 'fb5', userId: 'user2', content: '希望能有更详细的物品状态说明', rating: 4, createdAt: new Date(Date.now() - 86400000) }
  ];
};

const saveFeedbacks = (feedbacks: Feedback[]) => {
  localStorage.setItem('campus_feedbacks', JSON.stringify(feedbacks));
};

export const useFeedbackStore = create<FeedbackState>((set, get) => ({
  feedbacks: loadFeedbacks(),

  addFeedback: (content, rating) => {
    const { currentUser } = { currentUser: JSON.parse(localStorage.getItem('campus_current_user') || 'null') };
    if (!currentUser) return;

    const newFeedback: Feedback = {
      id: 'fb_' + Date.now(),
      userId: currentUser.id,
      content,
      rating,
      createdAt: new Date()
    };

    set((state) => {
      const newFeedbacks = [newFeedback, ...state.feedbacks];
      saveFeedbacks(newFeedbacks);
      return { feedbacks: newFeedbacks };
    });
  },

  getAverageRating: () => {
    const feedbacks = get().feedbacks;
    if (feedbacks.length === 0) return 0;
    const sum = feedbacks.reduce((acc, f) => acc + f.rating, 0);
    return Math.round((sum / feedbacks.length) * 10) / 10;
  },

  getStats: () => {
    const items = JSON.parse(localStorage.getItem('campus_items') || '[]');
    const users = JSON.parse(localStorage.getItem('campus_users') || '[]');
    const feedbacks = get().feedbacks;

    const byCategoryMap = new Map<string, number>();
    items.forEach((item: any) => {
      const category = item.category || '其他';
      byCategoryMap.set(category, (byCategoryMap.get(category) || 0) + 1);
    });

    const byCategory = Array.from(byCategoryMap.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);

    const avgRating =
      feedbacks.length > 0
        ? Math.round((feedbacks.reduce((acc, f) => acc + f.rating, 0) / feedbacks.length) * 10) / 10
        : 0;

    return {
      totalItems: items.length,
      totalTransactions: Math.floor(items.length * 0.75),
      totalValue: items.reduce((acc: number, item: any) => acc + (item.price || 0), 0),
      totalUsers: users.length,
      averageRating: avgRating,
      byCategory
    };
  }
}));
