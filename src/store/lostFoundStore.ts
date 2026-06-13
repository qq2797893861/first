import { create } from 'zustand';
import { LostFound } from '@/types';

interface LostFoundState {
  items: LostFound[];
  addItem: (item: Omit<LostFound, 'id' | 'createdAt' | 'status'>) => void;
  toggleStatus: (itemId: string) => void;
  getItemsByType: (type: 'lost' | 'found') => LostFound[];
  getItemsByUser: (userId: string) => LostFound[];
}

const initialItems: LostFound[] = [
  {
    id: 'lf1',
    type: 'lost',
    title: '丢失校园卡一张',
    description: '在三食堂附近丢失，卡号是2023xxxxxx，有拾到者请联系我，非常感谢！',
    location: '三食堂附近',
    contact: '微信: student888',
    userId: 'user1',
    createdAt: new Date(Date.now() - 86400000 * 2),
    status: 'open'
  },
  {
    id: 'lf2',
    type: 'found',
    title: '捡到一把钥匙',
    description: '在图书馆二楼自习区捡到一串钥匙，上面有一个小熊挂件。失主请联系。',
    location: '图书馆二楼',
    contact: 'QQ: 123456789',
    userId: 'user2',
    createdAt: new Date(Date.now() - 86400000),
    status: 'open'
  },
  {
    id: 'lf3',
    type: 'lost',
    title: '丢失蓝色雨伞',
    description: '昨天下雨时把伞忘在教学楼B栋门口了，长柄蓝色伞，请捡到的同学联系~',
    location: '教学楼B栋',
    contact: '微信: findmyumbrella',
    userId: 'user3',
    createdAt: new Date(Date.now() - 3600000 * 5),
    status: 'open'
  }
];

const loadItems = (): LostFound[] => {
  const saved = localStorage.getItem('campus_lostfound');
  if (saved) {
    return JSON.parse(saved).map((item: any) => ({
      ...item,
      createdAt: new Date(item.createdAt)
    }));
  }
  return initialItems;
};

const saveItems = (items: LostFound[]) => {
  localStorage.setItem('campus_lostfound', JSON.stringify(items));
};

export const useLostFoundStore = create<LostFoundState>((set, get) => ({
  items: loadItems(),

  addItem: (item) => {
    const newItem: LostFound = {
      ...item,
      id: 'lf_' + Date.now(),
      createdAt: new Date(),
      status: 'open'
    };
    set((state) => {
      const newItems = [newItem, ...state.items];
      saveItems(newItems);
      return { items: newItems };
    });
  },

  toggleStatus: (itemId) => {
    set((state) => {
      const newItems = state.items.map((item) =>
        item.id === itemId ? { ...item, status: item.status === 'open' ? 'closed' : 'open' } : item
      );
      saveItems(newItems);
      return { items: newItems };
    });
  },

  getItemsByType: (type) => {
    return get().items.filter((item) => item.type === type);
  },

  getItemsByUser: (userId) => {
    return get().items.filter((item) => item.userId === userId);
  }
}));
