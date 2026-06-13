import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Filter, ArrowUpDown, X, History, Tag } from 'lucide-react';
import { useItemsStore } from '@/store/itemsStore';
import { useUserStore } from '@/store/userStore';
import { CATEGORIES, STATUS_LABELS, ItemStatus } from '@/types';
import ItemCard from '@/components/ItemCard';

type SortType = 'newest' | 'price-low' | 'price-high';

const List: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { items } = useItemsStore();
  const { currentUser, searchHistory, addSearchHistory, clearSearchHistory } = useUserStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(
    (location.state?.category as string) || '全部'
  );
  const [sortBy, setSortBy] = useState<SortType>('newest');
  const [priceRange, setPriceRange] = useState<[number, number] | null>(null);
  const [statusFilter, setStatusFilter] = useState<ItemStatus | 'all'>('all');
  const [showHistory, setShowHistory] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const handleSearch = () => {
    if (searchQuery.trim()) {
      addSearchHistory(searchQuery.trim());
    }
    setShowHistory(false);
  };

  const applyPriceFilter = () => {
    const min = minPrice ? parseFloat(minPrice) : 0;
    const max = maxPrice ? parseFloat(maxPrice) : Infinity;
    if (minPrice || maxPrice) {
      setPriceRange([min, max]);
    } else {
      setPriceRange(null);
    }
  };

  const clearPriceFilter = () => {
    setPriceRange(null);
    setMinPrice('');
    setMaxPrice('');
  };

  const filteredItems = useMemo(() => {
    let result = [...items];

    // Filter by category
    if (selectedCategory !== '全部') {
      result = result.filter(item => item.category === selectedCategory);
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        item =>
          item.title.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Filter by price range
    if (priceRange) {
      const [min, max] = priceRange;
      result = result.filter(item => item.price >= min && item.price <= max);
    }

    // Filter by status
    if (statusFilter !== 'all') {
      result = result.filter(item => item.status === statusFilter);
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
    }

    return result;
  }, [items, selectedCategory, searchQuery, sortBy, priceRange, statusFilter]);

  return (
    <div className="pb-24 md:pt-20">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Search Bar */}
        <div className="relative mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="搜索物品..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowHistory(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
              className="w-full pl-12 pr-4 py-4 bg-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Search History Dropdown */}
          {showHistory && searchHistory.length > 0 && (
            <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border z-10 shadow-lg z-50">
              <div className="flex items-center justify-between p-4 border-b">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <History size={16} />
                  搜索历史
                </span>
                <button
                  onClick={clearSearchHistory}
                  className="text-xs text-primary hover:text-orange-600"
                >
                  清空
                </button>
              </div>
              <div className="p-3 max-h-64 overflow-y-auto">
                {searchHistory.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSearchQuery(item.keyword);
                      setShowHistory(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-gray-50 text-gray-700 text-sm"
                  >
                    {item.keyword}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter size={18} className="text-gray-600" />
            <span className="font-medium text-gray-700">分类筛选</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Status Filter */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
          <Tag size={18} className="text-gray-600" />
            <span className="font-medium text-gray-700">状态</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                statusFilter === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              全部
            </button>
            {Object.entries(STATUS_LABELS).map(([status, label]) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status as ItemStatus)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  statusFilter === status
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Price Range Filter */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="font-medium text-gray-700">价格区间</span>
            {priceRange && (
              <button
                onClick={clearPriceFilter}
                className="text-xs text-primary"
              >
                清除筛选
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <input
              type="number"
              placeholder="最低"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-24 px-3 py-2 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <span className="text-gray-400">-</span>
            <input
              type="number"
              placeholder="最高"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-24 px-3 py-2 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <button
              onClick={applyPriceFilter}
              className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-orange-600"
            >
              应用
            </button>
          </div>
        </div>

        {/* Sort */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            共找到 <span className="font-semibold text-primary">{filteredItems.length}</span> 件物品
          </p>
          <div className="flex items-center gap-2">
            <ArrowUpDown size={16} className="text-gray-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortType)}
              className="bg-gray-100 px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="newest">最新发布</option>
              <option value="price-low">价格从低到高</option>
              <option value="price-high">价格从高到低</option>
            </select>
          </div>
        </div>

        {/* Items Grid */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-gray-400 mb-4">
              <Search size={64} className="mx-auto opacity-50" />
            </div>
            <p className="text-gray-500 text-lg">没有找到相关物品</p>
            <p className="text-gray-400 text-sm mt-2">试试其他关键词或分类吧</p>
            {!currentUser && (
              <button
                onClick={() => navigate('/publish')}
                className="mt-6 px-6 py-3 bg-primary text-white rounded-full"
              >
                发布第一件物品
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default List;
