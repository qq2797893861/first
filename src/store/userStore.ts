import { create } from 'zustand';
import { User, Favorite, SearchHistoryItem } from '@/types';

interface UserState {
  currentUser: User | null;
  users: User[];
  favorites: Favorite[];
  searchHistory: SearchHistoryItem[];
  isLoggedIn: boolean;
  login: (name: string, password: string) => { success: boolean; message: string };
  register: (name: string, password: string, avatar?: string) => { success: boolean; message: string };
  logout: () => void;
  toggleFavorite: (itemId: string) => void;
  isFavorite: (itemId: string) => boolean;
  addSearchHistory: (keyword: string) => void;
  clearSearchHistory: () => void;
}

const initialUsers: User[] = [
  {
    id: 'user1',
    name: '小明同学',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
    password: '123456'
  }
];

const loadUsers = (): User[] => {
  const saved = localStorage.getItem('campus_users');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {
      console.error('Failed to parse users:', e);
    }
  }
  return initialUsers;
};

const saveUsers = (users: User[]) => {
  localStorage.setItem('campus_users', JSON.stringify(users));
};

const loadCurrentUser = (): User | null => {
  const saved = localStorage.getItem('campus_current_user');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse current user:', e);
    }
  }
  return null;
};

const saveCurrentUser = (user: User | null) => {
  if (user) {
    localStorage.setItem('campus_current_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('campus_current_user');
  }
};

const loadFavorites = (): Favorite[] => {
  const saved = localStorage.getItem('campus_favorites');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {
      console.error('Failed to parse favorites:', e);
    }
  }
  return [];
};

const saveFavorites = (favorites: Favorite[]) => {
  localStorage.setItem('campus_favorites', JSON.stringify(favorites));
};

const loadSearchHistory = (): SearchHistoryItem[] => {
  const saved = localStorage.getItem('campus_search_history');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {
      console.error('Failed to parse search history:', e);
    }
  }
  return [];
};

const saveSearchHistory = (history: SearchHistoryItem[]) => {
  localStorage.setItem('campus_search_history', JSON.stringify(history));
};

export const useUserStore = create<UserState>((set, get) => ({
  users: loadUsers(),
  currentUser: loadCurrentUser(),
  favorites: loadFavorites(),
  searchHistory: loadSearchHistory(),
  isLoggedIn: !!loadCurrentUser(),
  
  register: (name, password, avatar) => {
    const users = get().users;
    const existingUser = users.find(u => u.name === name);
    if (existingUser) {
      return { success: false, message: '用户名已存在' };
    }
    
    const newUser: User = {
      id: 'user_' + Date.now(),
      name,
      avatar: avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
      password
    };
    
    const newUsers = [...users, newUser];
    saveUsers(newUsers);
    saveCurrentUser(newUser);
    
    set({ users: newUsers, currentUser: newUser, isLoggedIn: true });
    return { success: true, message: '注册成功' };
  },
  
  login: (name, password) => {
    const users = get().users;
    const user = users.find(u => u.name === name && u.password === password);
    if (!user) {
      return { success: false, message: '用户名或密码错误' };
    }
    
    saveCurrentUser(user);
    set({ currentUser: user, isLoggedIn: true });
    return { success: true, message: '登录成功' };
  },
  
  logout: () => {
    saveCurrentUser(null);
    set({ currentUser: null, isLoggedIn: false });
  },
  
  toggleFavorite: (itemId) => {
    const { currentUser, favorites } = get();
    if (!currentUser) return;
    
    const existing = favorites.find(
      f => f.userId === currentUser.id && f.itemId === itemId
    );
    
    let newFavorites;
    if (existing) {
      newFavorites = favorites.filter(f => f.id !== existing.id);
    } else {
      newFavorites = [
        ...favorites,
        {
          id: Date.now().toString(),
          userId: currentUser.id,
          itemId
        }
      ];
    }
    
    saveFavorites(newFavorites);
    set({ favorites: newFavorites });
  },
  
  isFavorite: (itemId) => {
    const { currentUser, favorites } = get();
    if (!currentUser) return false;
    return favorites.some(
      f => f.userId === currentUser.id && f.itemId === itemId
    );
  },
  
  addSearchHistory: (keyword) => {
    const history = get().searchHistory;
    const newHistory = [
      { keyword, timestamp: Date.now() },
      ...history.filter(h => h.keyword !== keyword)
    ].slice(0, 10);
    
    saveSearchHistory(newHistory);
    set({ searchHistory: newHistory });
  },
  
  clearSearchHistory: () => {
    saveSearchHistory([]);
    set({ searchHistory: [] });
  }
}));
