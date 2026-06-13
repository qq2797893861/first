import { create } from 'zustand';
import { Item, ItemStatus } from '@/types';

interface ItemsState {
  items: Item[];
  addItem: (item: Omit<Item, 'id' | 'createdAt' | 'status' | 'tags' | 'views'> & { status?: ItemStatus; tags?: string[] }) => void;
  deleteItem: (itemId: string) => void;
  getItemById: (itemId: string) => Item | undefined;
  updateItemStatus: (itemId: string, status: ItemStatus) => void;
  incrementViews: (itemId: string) => void;
  getItemsByUser: (userId: string) => Item[];
}

const initialItems: Item[] = [
  {
    id: '1',
    title: '高等数学同济第七版',
    category: '书籍教材',
    description: '九成新，无笔记，附赠习题集。刚考完试用不上了，低价转给需要的同学。',
    price: 25,
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=300&fit=crop',
    contact: '微信: student123',
    userId: 'user1',
    createdAt: new Date(Date.now() - 86400000),
    status: 'available',
    tags: ['九成新', '可议价'],
    views: 42
  },
  {
    id: '2',
    title: '小米蓝牙耳机Air2',
    category: '数码产品',
    description: '使用半年，功能完好，包装齐全，音质很好，原价299元。',
    price: 120,
    image: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=400&h=300&fit=crop',
    contact: 'QQ: 456789',
    userId: 'user2',
    createdAt: new Date(Date.now() - 172800000),
    status: 'available',
    tags: ['九成新', '急出'],
    views: 89
  },
  {
    id: '3',
    title: '台灯护眼灯',
    category: '生活用品',
    description: 'LED护眼灯，三档调节，宿舍必备，买了新的旧的出给需要的同学。',
    price: 35,
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=300&fit=crop',
    contact: '电话: 138xxxx1234',
    userId: 'user1',
    createdAt: new Date(Date.now() - 259200000),
    status: 'available',
    tags: ['八成新', '送赠品'],
    views: 28
  },
  {
    id: '4',
    title: '瑜伽垫加厚',
    category: '运动器材',
    description: '10mm加厚，防滑耐用，送收纳袋，刚买没用过几次。',
    price: 40,
    image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&h=300&fit=crop',
    contact: '微信: yoga2024',
    userId: 'user3',
    createdAt: new Date(Date.now() - 345600000),
    status: 'available',
    tags: ['全新', '仅限本校'],
    views: 56
  }
];

const loadItems = (): Item[] => {
  const saved = localStorage.getItem('campus_items');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.map((item: any) => ({
          ...item,
          createdAt: new Date(item.createdAt)
        }));
      }
    } catch (e) {
      console.error('Failed to parse items:', e);
    }
  }
  return initialItems;
};

const saveItems = (items: Item[]) => {
  localStorage.setItem('campus_items', JSON.stringify(items));
};

export const useItemsStore = create<ItemsState>((set, get) => ({
  items: loadItems(),
  
  addItem: (item) => {
    const newItem: Item = {
      ...item,
      id: Date.now().toString(),
      createdAt: new Date(),
      status: item.status || 'available',
      tags: item.tags || [],
      views: 0
    };
    set((state) => {
      const newItems = [newItem, ...state.items];
      saveItems(newItems);
      return { items: newItems };
    });
  },
  
  deleteItem: (itemId) => {
    set((state) => {
      const newItems = state.items.filter(item => item.id !== itemId);
      saveItems(newItems);
      return { items: newItems };
    });
  },
  
  getItemById: (itemId) => {
    return get().items.find(item => item.id === itemId);
  },
  
  updateItemStatus: (itemId, status) => {
    set((state) => {
      const newItems = state.items.map(item =>
        item.id === itemId ? { ...item, status } : item
      );
      saveItems(newItems);
      return { items: newItems };
    });
  },
  
  incrementViews: (itemId) => {
    set((state) => {
      const newItems = state.items.map(item =>
        item.id === itemId ? { ...item, views: item.views + 1 } : item
      );
      saveItems(newItems);
      return { items: newItems };
    });
  },
  
  getItemsByUser: (userId) => {
    return get().items.filter(item => item.userId === userId);
  }
}));
