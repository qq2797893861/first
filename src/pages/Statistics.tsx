import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  TrendingUp,
  Package,
  Users,
  DollarSign,
  Eye,
  Heart,
  MessageSquare,
  Calendar,
  ArrowRight,
  Star,
  CheckCircle,
  X
} from 'lucide-react';
import { useItemsStore } from '@/store/itemsStore';
import { useUserStore } from '@/store/userStore';
import { useFeedbackStore } from '@/store/feedbackStore';
import { useUIStore } from '@/store/uiStore';

const Statistics: React.FC = () => {
  const navigate = useNavigate();
  const { items } = useItemsStore();
  const { users, currentUser } = useUserStore();
  const { feedbacks, addFeedback, getAverageRating } = useFeedbackStore();
  const { showToast } = useUIStore();

  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);

  // 计算统计数据
  const totalItems = items.length;
  const availableItems = items.filter(i => i.status === 'available').length;
  const soldItems = items.filter(i => i.status === 'sold').length;
  const reservedItems = items.filter(i => i.status === 'reserved').length;
  const totalValue = items.reduce((sum, i) => sum + i.price, 0);
  const totalViews = items.reduce((sum, i) => sum + i.views, 0);
  const totalUsers = users.length;

  // 按分类统计
  const categoryStats: Record<string, number> = {};
  items.forEach(item => {
    categoryStats[item.category] = (categoryStats[item.category] || 0) + 1;
  });

  const sortedCategories = Object.entries(categoryStats).sort((a, b) => b[1] - a[1]);
  const maxCategoryCount = Math.max(...Object.values(categoryStats), 1);

  // 用户统计
  const userItems = currentUser ? items.filter(i => i.userId === currentUser.id).length : 0;
  const userViews = currentUser ? items.filter(i => i.userId === currentUser.id).reduce((sum, i) => sum + i.views, 0) : 0;

  // 平均评分
  const avgRating = getAverageRating();

  const handleSubmitFeedback = () => {
    if (!currentUser) {
      showToast('请先登录', 'warning');
      navigate('/auth');
      return;
    }
    if (!feedback.trim()) {
      showToast('请填写反馈内容', 'error');
      return;
    }
    addFeedback(feedback.trim(), rating);
    showToast('感谢您的反馈！', 'success');
    setFeedback('');
    setRating(5);
    setShowFeedbackForm(false);
  };

  return (
    <div className="pb-24 md:pt-20 min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">数据统计</h1>
          <p className="text-gray-500">实时了解校园闲置物品交换动态</p>
        </div>

        {/* Main Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-primary to-orange-400 rounded-3xl p-5 text-white shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <Package size={24} />
              </div>
              <span className="text-xs opacity-80">总计</span>
            </div>
            <p className="text-4xl font-bold">{totalItems}</p>
            <p className="text-sm opacity-90 mt-1">发布物品</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-5 text-white shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <CheckCircle size={24} />
              </div>
              <span className="text-xs opacity-80">已售</span>
            </div>
            <p className="text-4xl font-bold">{soldItems}</p>
            <p className="text-sm opacity-90 mt-1">成功交易</p>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl p-5 text-white shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <Users size={24} />
              </div>
              <span className="text-xs opacity-80">活跃</span>
            </div>
            <p className="text-4xl font-bold">{totalUsers}</p>
            <p className="text-sm opacity-90 mt-1">参与用户</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-3xl p-5 text-white shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <DollarSign size={24} />
              </div>
              <span className="text-xs opacity-80">总价值</span>
            </div>
            <p className="text-4xl font-bold">¥{totalValue.toLocaleString()}</p>
            <p className="text-sm opacity-90 mt-1">物品总值</p>
          </div>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Status Distribution */}
          <div className="bg-white rounded-3xl shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <BarChart3 size={20} className="text-primary" />
              物品状态分布
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-700 font-medium">在售中</span>
                  <span className="text-green-600 font-bold">{availableItems} 件</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-500"
                    style={{ width: `${totalItems > 0 ? (availableItems / totalItems) * 100 : 0}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-700 font-medium">已预订</span>
                  <span className="text-yellow-600 font-bold">{reservedItems} 件</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full transition-all duration-500"
                    style={{ width: `${totalItems > 0 ? (reservedItems / totalItems) * 100 : 0}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-700 font-medium">已售出</span>
                  <span className="text-gray-600 font-bold">{soldItems} 件</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-gray-400 to-gray-600 rounded-full transition-all duration-500"
                    style={{ width: `${totalItems > 0 ? (soldItems / totalItems) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Activity Stats */}
          <div className="bg-white rounded-3xl shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp size={20} className="text-primary" />
              平台活跃度
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-2xl text-center">
                <Eye size={28} className="mx-auto text-blue-500 mb-2" />
                <p className="text-2xl font-bold text-blue-700">{totalViews.toLocaleString()}</p>
                <p className="text-xs text-blue-500 mt-1">总浏览次数</p>
              </div>
              <div className="p-4 bg-red-50 rounded-2xl text-center">
                <Heart size={28} className="mx-auto text-red-500 mb-2" />
                <p className="text-2xl font-bold text-red-700">{Math.round(totalViews * 0.15)}</p>
                <p className="text-xs text-red-500 mt-1">收藏次数</p>
              </div>
              <div className="p-4 bg-green-50 rounded-2xl text-center">
                <MessageSquare size={28} className="mx-auto text-green-500 mb-2" />
                <p className="text-2xl font-bold text-green-700">{Math.round(totalViews * 0.08)}</p>
                <p className="text-xs text-green-500 mt-1">消息沟通</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-2xl text-center">
                <TrendingUp size={28} className="mx-auto text-orange-500 mb-2" />
                <p className="text-2xl font-bold text-orange-700">{totalItems > 0 ? Math.round((soldItems / totalItems) * 100) : 0}%</p>
                <p className="text-xs text-orange-500 mt-1">成交率</p>
              </div>
            </div>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-3xl shadow-md p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Package size={20} className="text-primary" />
            分类分布统计
          </h3>
          {sortedCategories.length === 0 ? (
            <p className="text-center text-gray-400 py-8">暂无数据</p>
          ) : (
            <div className="space-y-3">
              {sortedCategories.map(([category, count]) => (
                <div key={category}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-700 font-medium">{category}</span>
                    <span className="text-primary font-bold">{count} 件</span>
                  </div>
                  <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-orange-400 rounded-full transition-all duration-500"
                      style={{ width: `${(count / maxCategoryCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Personal Stats */}
        {currentUser && (
          <div className="bg-white rounded-3xl shadow-md p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Users size={20} className="text-primary" />
              我的统计
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-orange-50 rounded-2xl text-center">
                <p className="text-3xl font-bold text-primary">{userItems}</p>
                <p className="text-sm text-gray-600 mt-1">我发布的物品</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-2xl text-center">
                <p className="text-3xl font-bold text-blue-600">{userViews}</p>
                <p className="text-sm text-gray-600 mt-1">总浏览量</p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-2xl text-center">
                <p className="text-3xl font-bold text-yellow-600">¥{items.filter(i => i.userId === currentUser?.id).reduce((s, i) => s + i.price, 0)}</p>
                <p className="text-sm text-gray-600 mt-1">发布总价值</p>
              </div>
              <div className="p-4 bg-green-50 rounded-2xl text-center">
                <p className="text-3xl font-bold text-green-600">
                  {items.filter(i => i.userId === currentUser?.id && i.status === 'sold').length}
                </p>
                <p className="text-sm text-gray-600 mt-1">成功售出</p>
              </div>
            </div>
          </div>
        )}

        {/* User Ratings */}
        <div className="bg-white rounded-3xl shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Star size={20} className="text-primary" />
              用户评价
            </h3>
            <button
              onClick={() => setShowFeedbackForm(!showFeedbackForm)}
              className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all"
            >
              写评价
            </button>
          </div>

          {/* Average Rating */}
          <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl mb-6">
            <div className="text-center">
              <p className="text-5xl font-bold text-primary">{avgRating.toFixed(1)}</p>
              <div className="flex items-center justify-center gap-1 mt-2">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star
                    key={i}
                    size={20}
                    className={i <= Math.round(avgRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-2">{feedbacks.length} 条评价</p>
            </div>
            <div className="flex-1 h-16 bg-gradient-to-r from-primary to-orange-400 rounded-xl opacity-20" />
          </div>

          {/* Feedback Form */}
          {showFeedbackForm && (
            <div className="mb-6 p-4 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-gray-800">分享您的体验</h4>
                <button
                  onClick={() => setShowFeedbackForm(false)}
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">评分</p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(i => (
                    <button
                      key={i}
                      onClick={() => setRating(i)}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star
                        size={32}
                        className={i <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-white rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none resize-none"
                placeholder="说说您的使用感受和建议..."
              />
              <button
                onClick={handleSubmitFeedback}
                className="mt-3 w-full py-3 bg-gradient-to-r from-primary to-orange-400 text-white rounded-xl font-medium hover:shadow-lg transition-all"
              >
                提交评价
              </button>
            </div>
          )}

          {/* Feedback List */}
          {feedbacks.length === 0 ? (
            <p className="text-center text-gray-400 py-8">暂无评价，成为第一个评价的人吧！</p>
          ) : (
            <div className="space-y-3">
              {feedbacks.slice(0, 5).map((fb) => (
                <div key={fb.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users size={18} className="text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-800">
                          {users.find(u => u.id === fb.userId)?.name || '用户'}
                        </p>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map(i => (
                            <Star
                              key={i}
                              size={14}
                              className={i <= fb.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">
                        {new Date(fb.createdAt).toLocaleDateString('zh-CN')}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm ml-13 pl-13">{fb.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/list')}
            className="bg-white rounded-3xl shadow-sm p-5 text-center hover:shadow-md hover:scale-105 transition-all border-2 border-transparent hover:border-orange-100"
          >
            <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Package size={28} className="text-primary" />
            </div>
            <p className="font-semibold text-gray-800">浏览物品</p>
            <p className="text-xs text-gray-500 mt-1">发现好物</p>
          </button>
          <button
            onClick={() => navigate('/publish')}
            className="bg-white rounded-3xl shadow-sm p-5 text-center hover:shadow-md hover:scale-105 transition-all border-2 border-transparent hover:border-green-100"
          >
            <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <TrendingUp size={28} className="text-green-600" />
            </div>
            <p className="font-semibold text-gray-800">发布物品</p>
            <p className="text-xs text-gray-500 mt-1">分享闲置</p>
          </button>
          <button
            onClick={() => navigate('/lostfound')}
            className="bg-white rounded-3xl shadow-sm p-5 text-center hover:shadow-md hover:scale-105 transition-all border-2 border-transparent hover:border-blue-100"
          >
            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Calendar size={28} className="text-blue-600" />
            </div>
            <p className="font-semibold text-gray-800">失物招领</p>
            <p className="text-xs text-gray-500 mt-1">帮助同学</p>
          </button>
          <button
            onClick={() => navigate('/activity')}
            className="bg-white rounded-3xl shadow-sm p-5 text-center hover:shadow-md hover:scale-105 transition-all border-2 border-transparent hover:border-purple-100"
          >
            <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <ArrowRight size={28} className="text-purple-600" />
            </div>
            <p className="font-semibold text-gray-800">活动介绍</p>
            <p className="text-xs text-gray-500 mt-1">了解更多</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
