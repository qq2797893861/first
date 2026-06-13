import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Heart, Package, Settings, LogOut, Edit3, Trash2, Eye, CheckCircle, Clock } from 'lucide-react';
import { useItemsStore } from '@/store/itemsStore';
import { useUserStore } from '@/store/userStore';
import { useUIStore } from '@/store/uiStore';
import { STATUS_LABELS, ItemStatus } from '@/types';
import ItemCard from '@/components/ItemCard';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, favorites, logout } = useUserStore();
  const { items, deleteItem, getItemsByUser, updateItemStatus } = useItemsStore();
  const { showToast } = useUIStore();
  
  const [activeTab, setActiveTab] = useState<'published' | 'favorites'>('published');
  
  const myItems = currentUser ? getItemsByUser(currentUser.id) : [];
  const favoriteItems = items.filter(item =>
    favorites.some(f => f.userId === currentUser?.id && f.itemId === item.id)
  );
  
  const handleLogout = () => {
    if (confirm('确定要退出登录吗？')) {
      logout();
      showToast('已退出登录', 'success');
      navigate('/');
    }
  };
  
  const handleStatusChange = (itemId: string, status: ItemStatus) => {
    updateItemStatus(itemId, status);
    showToast(`已标记为${STATUS_LABELS[status]}`, 'success');
  };
  
  const handleDelete = (itemId: string) => {
    if (confirm('确定要删除这个物品吗？')) {
      deleteItem(itemId);
      showToast('已删除', 'success');
    }
  };
  
  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pb-24 px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <User size={40} className="text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">请先登录</h1>
          <p className="text-gray-500 mb-8">登录后可以发布物品、收藏喜欢的物品</p>
          <button
            onClick={() => navigate('/auth')}
            className="w-full py-4 bg-gradient-to-r from-primary to-orange-400 text-white font-semibold rounded-2xl"
          >
            立即登录
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="pb-24 md:pt-20">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* User Info */}
        <div className="bg-gradient-to-br from-primary to-orange-400 rounded-3xl p-8 mb-8 text-white">
          <div className="flex items-center gap-6">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-24 h-24 rounded-full border-4 border-white/50 object-cover"
            />
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-1">{currentUser.name}</h1>
              <p className="text-white/80">校园闲置好物分享者</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-3 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
              title="退出登录"
            >
              <LogOut size={20} />
            </button>
          </div>
          
          <div className="flex gap-8 mt-8 pt-6 border-t border-white/20">
            <div className="text-center">
              <p className="text-3xl font-bold">{myItems.length}</p>
              <p className="text-white/80 text-sm">发布物品</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">{favoriteItems.length}</p>
              <p className="text-white/80 text-sm">收藏物品</p>
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('published')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'published'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Package size={20} />
            我的发布
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'favorites'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Heart size={20} />
            我的收藏
          </button>
        </div>
        
        {/* Tab Content */}
        {activeTab === 'published' ? (
          <div>
            {myItems.length > 0 ? (
              <div className="space-y-6">
                {myItems.map((item) => (
                  <div key={item.id} className="bg-white rounded-2xl shadow-sm p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full sm:w-32 h-32 object-cover rounded-xl"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-gray-800 text-lg">{item.title}</h3>
                          <span className="text-2xl font-bold text-primary">¥{item.price}</span>
                        </div>
                        <p className="text-gray-500 text-sm mb-3 line-clamp-2">{item.description}</p>
                        
                        <div className="flex items-center gap-3 mb-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            item.status === 'available' ? 'bg-green-100 text-green-600' :
                            item.status === 'reserved' ? 'bg-yellow-100 text-yellow-600' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {STATUS_LABELS[item.status]}
                          </span>
                          <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                            {item.category}
                          </span>
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Eye size={14} />
                            {item.views}
                          </span>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => navigate(`/item/${item.id}`)}
                            className="flex items-center gap-1 px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
                          >
                            <Eye size={16} />
                            查看
                          </button>
                          {item.status === 'available' && (
                            <button
                              onClick={() => handleStatusChange(item.id, 'reserved')}
                              className="flex items-center gap-1 px-4 py-2 bg-yellow-100 text-yellow-600 rounded-xl text-sm font-medium hover:bg-yellow-200 transition-colors"
                            >
                              <Clock size={16} />
                              标记已预订
                            </button>
                          )}
                          {item.status !== 'sold' && (
                            <button
                              onClick={() => handleStatusChange(item.id, 'sold')}
                              className="flex items-center gap-1 px-4 py-2 bg-green-100 text-green-600 rounded-xl text-sm font-medium hover:bg-green-200 transition-colors"
                            >
                              <CheckCircle size={16} />
                              标记已售出
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="flex items-center gap-1 px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors"
                          >
                            <Trash2 size={16} />
                            删除
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <Package size={64} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg">还没有发布过物品</p>
                <p className="text-gray-400 text-sm mt-2 mb-6">快去发布你的第一件闲置物品吧</p>
                <button
                  onClick={() => navigate('/publish')}
                  className="px-6 py-3 bg-primary text-white rounded-full font-medium hover:bg-orange-600 transition-colors"
                >
                  发布物品
                </button>
              </div>
            )}
          </div>
        ) : (
          <div>
            {favoriteItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {favoriteItems.map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <Heart size={64} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg">还没有收藏任何物品</p>
                <p className="text-gray-400 text-sm mt-2 mb-6">去发现页面看看有什么好东西吧</p>
                <button
                  onClick={() => navigate('/list')}
                  className="px-6 py-3 bg-primary text-white rounded-full font-medium hover:bg-orange-600 transition-colors"
                >
                  去发现
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
