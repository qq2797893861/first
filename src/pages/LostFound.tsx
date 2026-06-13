import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Plus, CheckCircle, AlertCircle, RefreshCw, X } from 'lucide-react';
import { useLostFoundStore } from '@/store/lostFoundStore';
import { useUserStore } from '@/store/userStore';
import { useUIStore } from '@/store/uiStore';

const LostFound: React.FC = () => {
  const navigate = useNavigate();
  const { items, addItem, toggleStatus } = useLostFoundStore();
  const { currentUser } = useUserStore();
  const { showToast } = useUIStore();

  const [filter, setFilter] = useState<'all' | 'lost' | 'found'>('all');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'lost' as 'lost' | 'found',
    title: '',
    description: '',
    location: '',
    contact: '',
    image: ''
  });

  const filteredItems = items.filter(item => {
    const matchType = filter === 'all' || item.type === filter;
    const matchSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      showToast('请先登录', 'warning');
      navigate('/auth');
      return;
    }
    if (!formData.title || !formData.description || !formData.location || !formData.contact) {
      showToast('请填写完整信息', 'error');
      return;
    }
    addItem({
      type: formData.type,
      title: formData.title,
      description: formData.description,
      location: formData.location,
      contact: formData.contact,
      image: formData.image || undefined,
      userId: currentUser.id
    });
    showToast('发布成功！', 'success');
    setFormData({ type: 'lost', title: '', description: '', location: '', contact: '', image: '' });
    setShowForm(false);
  };

  return (
    <div className="pb-24 md:pt-20 min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">失物招领</h1>
            <p className="text-gray-500 text-sm mt-1">帮助同学找回丢失的物品</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-primary text-white rounded-xl font-medium flex items-center gap-2 hover:shadow-lg transition-all"
          >
            <Plus size={18} />
            发布
          </button>
        </div>

        {/* Publish Form */}
        {showForm && (
          <div className="bg-white rounded-3xl shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">发布信息</h2>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type Selection */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type: 'lost' }))}
                  className={`p-4 rounded-2xl text-sm font-medium transition-all ${
                    formData.type === 'lost'
                      ? 'bg-red-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <AlertCircle size={24} className="mx-auto mb-2" />
                  我丢了东西
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type: 'found' }))}
                  className={`p-4 rounded-2xl text-sm font-medium transition-all ${
                    formData.type === 'found'
                      ? 'bg-green-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <CheckCircle size={24} className="mx-auto mb-2" />
                  我捡到东西
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {formData.type === 'lost' ? '物品名称' : '捡到物品'}
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder={formData.type === 'lost' ? '例如：校园卡、钥匙、雨伞' : '例如：捡到一个蓝色水杯'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <MapPin size={16} />
                  {formData.type === 'lost' ? '丢失地点' : '捡到地点'}
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="例如：图书馆二楼、三食堂门口"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">详细描述</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  placeholder="描述物品特征、颜色、品牌、其他识别信息..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">联系方式</label>
                <input
                  type="text"
                  value={formData.contact}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="微信/QQ/电话"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-primary to-orange-400 text-white rounded-xl font-medium hover:shadow-lg hover:scale-[1.02] transition-all"
              >
                立即发布
              </button>
            </form>
          </div>
        )}

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索物品名称或描述..."
              className="w-full pl-10 pr-4 py-3 bg-white rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'lost', 'found'] as const).map(type => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                  filter === type
                    ? type === 'lost'
                      ? 'bg-red-500 text-white shadow-lg'
                      : type === 'found'
                      ? 'bg-green-500 text-white shadow-lg'
                      : 'bg-primary text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm'
                }`}
              >
                {type === 'all' ? '全部' : type === 'lost' ? '寻物' : '招领'}
              </button>
            ))}
          </div>
        </div>

        {/* Items List */}
        <div className="space-y-4">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl shadow-sm">
              <AlertCircle size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">暂无相关信息</p>
              <p className="text-gray-400 text-sm mt-1">点击右上角按钮发布第一条信息</p>
            </div>
          ) : (
            filteredItems.map(item => (
              <div
                key={item.id}
                className="bg-white rounded-3xl shadow-sm p-5 hover:shadow-md transition-all border-2 border-transparent hover:border-orange-100"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                      item.type === 'lost' ? 'bg-red-100 text-red-500' : 'bg-green-100 text-green-500'
                    }`}
                  >
                    {item.type === 'lost' ? <AlertCircle size={24} /> : <CheckCircle size={24} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-bold text-gray-800 text-lg truncate">{item.title}</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                          item.status === 'closed'
                            ? 'bg-gray-100 text-gray-500'
                            : item.type === 'lost'
                            ? 'bg-red-100 text-red-600'
                            : 'bg-green-100 text-green-600'
                        }`}
                      >
                        {item.status === 'closed'
                          ? '已解决'
                          : item.type === 'lost'
                          ? '寻物中'
                          : '待认领'}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <MapPin size={14} />
                        {item.location}
                      </span>
                      <span>联系：{item.contact}</span>
                      <span className="flex items-center gap-1">
                        <RefreshCw size={14} />
                        {new Date(item.createdAt).toLocaleDateString('zh-CN')}
                      </span>
                    </div>
                    {currentUser && currentUser.id === item.userId && item.status === 'open' && (
                      <button
                        onClick={() => {
                          toggleStatus(item.id);
                          showToast('状态已更新', 'success');
                        }}
                        className="mt-3 px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors"
                      >
                        标记为已解决
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default LostFound;
