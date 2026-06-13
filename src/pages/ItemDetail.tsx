import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Eye, Share2, Flag, Tag, MessageSquare, Phone, RefreshCw, Star, QrCode, Lightbulb } from 'lucide-react';
import { useItemsStore } from '@/store/itemsStore';
import { useUserStore } from '@/store/userStore';
import { useUIStore } from '@/store/uiStore';
import { STATUS_LABELS, STATUS_COLORS, TRADE_TYPE_LABELS, TRADE_TYPE_COLORS, PRICE_REFERENCE } from '@/types';

const ItemDetail: React.FC = () => {
  const { getItemById, incrementViews, updateItemStatus, deleteItem } = useItemsStore();
  const { currentUser, toggleFavorite, isFavorite } = useUserStore();
  const { showToast } = useUIStore();
  const navigate = useNavigate();

  // 获取URL中的ID，这里简化处理
  const searchParams = new URLSearchParams(window.location.search);
  const idFromUrl = searchParams.get('id');
  const id = idFromUrl || (window.location.pathname.split('/').pop() !== 'detail' ? window.location.pathname.split('/').pop() : undefined);

  const [showQR, setShowQR] = useState(false);
  const item = id ? getItemById(id) : null;
  const favorited = id ? isFavorite(id) : false;

  // 估算价格
  const estimatedPrice = item ? (item.price * 0.7) : 0;
  const priceRef = item ? (PRICE_REFERENCE[item.category] || PRICE_REFERENCE['其他']) : null;

  // 增加浏览次数
  React.useEffect(() => {
    if (id) {
      const timer = setTimeout(() => {
        incrementViews(id);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [id]);

  if (!item) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pb-24 px-4">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Eye size={40} className="text-gray-300" />
          </div>
          <h2 className="text-xl font-bold text-gray-700 mb-2">物品不存在或已被删除</h2>
          <p className="text-gray-500 mb-6">该物品可能已被出售或删除</p>
          <button
            onClick={() => navigate('/list')}
            className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:shadow-lg transition-all"
          >
            返回列表
          </button>
        </div>
      </div>
    );
  }

  const isOwner = currentUser && currentUser.id === item.userId;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.title,
          text: item.description,
          url: window.location.href
        });
        showToast('分享成功', 'success');
      } catch (err) {
        // 用户取消分享，不做处理
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('链接已复制到剪贴板', 'success');
    }
  };

  const handleReport = () => {
    showToast('举报已提交，我们会尽快处理', 'info');
  };

  const handleStatusChange = (status: 'available' | 'sold' | 'reserved') => {
    if (id) {
      updateItemStatus(id, status);
      showToast(`已标记为${STATUS_LABELS[status]}`, 'success');
    }
  };

  const handleDelete = () => {
    if (id && confirm('确定要删除这个物品吗？')) {
      deleteItem(id);
      showToast('已删除', 'success');
      navigate('/profile');
    }
  };

  const handleFavorite = () => {
    if (!currentUser) {
      showToast('请先登录', 'warning');
      return;
    }
    if (id) {
      toggleFavorite(id);
      showToast(favorited ? '已取消收藏' : '已收藏', 'success');
    }
  };

  const copyContact = () => {
    navigator.clipboard.writeText(item.contact);
    showToast('联系方式已复制', 'success');
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const tradeType = item.tradeType || 'sell';

  return (
    <div className="pb-24 md:pt-4 md:pb-8 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b z-10 md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="font-semibold">物品详情</h1>
          <button
            onClick={handleShare}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Share2 size={20} />
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Image */}
        <div className="rounded-3xl overflow-hidden shadow-lg mb-6 bg-white">
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-64 md:h-96 object-cover"
          />
        </div>

        {/* Info Card */}
        <div className="bg-white rounded-3xl shadow-md p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[item.status]}`}>
                  {STATUS_LABELS[item.status]}
                </span>
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  {item.category}
                </span>
                {item.tradeType && item.tradeType !== 'sell' && (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${TRADE_TYPE_COLORS[tradeType]}`}>
                    {TRADE_TYPE_LABELS[tradeType]}
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">{item.title}</h1>
              <div className="flex items-baseline gap-3 flex-wrap">
                <p className="text-4xl font-bold text-primary">¥{item.price}</p>
                {item.estimatedPrice && (
                  <p className="text-gray-400 line-through text-lg">原价参考：约¥{Math.round(estimatedPrice * 1.5)}</p>
                )}
              </div>
            </div>
            <div className="flex gap-2 ml-4">
              <button
                onClick={handleFavorite}
                className={`p-3 rounded-full transition-all ${favorited ? 'bg-red-50 shadow-md' : 'bg-gray-100 hover:bg-gray-200'}`}
              >
                <Heart size={24} className={favorited ? 'fill-red-500 text-red-500' : 'text-gray-600'} />
              </button>
              <button
                onClick={handleReport}
                className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
              >
                <Flag size={24} className="text-gray-600" />
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 text-sm text-gray-500 mb-6 pb-6 border-b">
            <div className="flex items-center gap-1">
              <Eye size={18} />
              <span>{item.views} 次浏览</span>
            </div>
            <div>发布于 {formatDate(item.createdAt)}</div>
          </div>

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {item.tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-4 py-2 bg-orange-50 text-primary rounded-full text-sm font-medium"
                >
                  <Tag size={14} />
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-3">物品描述</h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{item.description}</p>
          </div>

          {/* Exchange Info */}
          {tradeType !== 'sell' && item.exchangeWant && (
            <div className="mb-6 p-4 bg-purple-50 rounded-2xl border-2 border-purple-100">
              <div className="flex items-start gap-3">
                <RefreshCw size={20} className="text-purple-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-purple-700 mb-1">以物易物</h4>
                  <p className="text-purple-600 text-sm">期望交换：{item.exchangeWant}</p>
                </div>
              </div>
            </div>
          )}

          {/* Price Reference */}
          {priceRef && (
            <div className="mb-6 p-4 bg-blue-50 rounded-2xl border-2 border-blue-100">
              <div className="flex items-start gap-3">
                <Lightbulb size={20} className="text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-blue-700 mb-1">价格参考</h4>
                  <p className="text-blue-600 text-sm">
                    {item.category}类物品参考价格：¥{priceRef.min} - ¥{priceRef.max}
                  </p>
                  <p className="text-blue-500 text-xs mt-1">{priceRef.note}</p>
                </div>
              </div>
            </div>
          )}

          {/* Contact */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">联系方式</h3>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
              <div className="flex items-center gap-3">
                <MessageSquare size={20} className="text-primary" />
                <span className="text-gray-700 font-medium">{item.contact}</span>
              </div>
              <button
                onClick={copyContact}
                className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-orange-600 transition-colors"
              >
                复制
              </button>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="mt-6 pt-6 border-t">
            <button
              onClick={() => setShowQR(!showQR)}
              className="w-full p-4 bg-gray-50 rounded-2xl flex items-center justify-center gap-2 text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <QrCode size={20} />
              <span className="font-medium">{showQR ? '收起' : '查看'}分享二维码</span>
            </button>
            {showQR && (
              <div className="mt-4 p-6 bg-white rounded-2xl border-2 border-dashed border-gray-200 text-center">
                <div className="w-48 h-48 mx-auto mb-4 bg-gray-100 rounded-2xl flex items-center justify-center">
                  <div className="grid grid-cols-8 gap-1 w-36 h-36">
                    {Array.from({ length: 64 }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-full h-full rounded-sm ${Math.random() > 0.5 ? 'bg-gray-800' : 'bg-transparent'}`}
                        style={{
                          borderTop: i < 8 ? '3px solid #000' : 'none',
                          borderBottom: i > 55 ? '3px solid #000' : 'none',
                          borderLeft: i % 8 === 0 ? '3px solid #000' : 'none',
                          borderRight: i % 8 === 7 ? '3px solid #000' : 'none'
                        }}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 text-sm font-medium">{item.title}</p>
                <p className="text-gray-400 text-xs mt-1">扫码查看物品详情</p>
              </div>
            )}
          </div>
        </div>

        {/* Owner Actions */}
        {isOwner && (
          <div className="bg-white rounded-3xl shadow-md p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">管理物品</h3>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <button
                onClick={() => handleStatusChange('available')}
                className={`py-3 rounded-xl text-sm font-medium transition-all ${
                  item.status === 'available'
                    ? 'bg-green-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                在售
              </button>
              <button
                onClick={() => handleStatusChange('reserved')}
                className={`py-3 rounded-xl text-sm font-medium transition-all ${
                  item.status === 'reserved'
                    ? 'bg-yellow-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                已预订
              </button>
              <button
                onClick={() => handleStatusChange('sold')}
                className={`py-3 rounded-xl text-sm font-medium transition-all ${
                  item.status === 'sold'
                    ? 'bg-gray-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                已售出
              </button>
            </div>
            <button
              onClick={handleDelete}
              className="w-full py-3 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-colors"
            >
              删除物品
            </button>
          </div>
        )}

        {/* Tips Card */}
        <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-3xl p-6 border-2 border-orange-100 mb-6">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Star size={20} className="text-yellow-500" />
            温馨提示
          </h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• 请在校园内公共场所当面交易，确保物品与描述一致</li>
            <li>• 注意保护个人信息，不要泄露过多隐私</li>
            <li>• 建议使用站内消息功能与卖家沟通</li>
            <li>• 如发现问题或违规物品，请及时举报</li>
          </ul>
        </div>

        {/* Desktop Bottom Actions */}
        <div className="hidden md:flex gap-4">
          <button
            onClick={handleFavorite}
            className={`flex-1 py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all ${
              favorited
                ? 'bg-red-50 text-red-600 hover:bg-red-100'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Heart size={20} className={favorited ? 'fill-current' : ''} />
            {favorited ? '已收藏' : '收藏'}
          </button>
          <button
            onClick={copyContact}
            className="flex-[2] py-4 bg-gradient-to-r from-primary to-orange-400 text-white rounded-2xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:scale-[1.02] transition-all"
          >
            <Phone size={20} />
            联系卖家
          </button>
        </div>
      </div>

      {/* Mobile Bottom Actions */}
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t shadow-lg md:hidden">
        <div className="flex gap-3 p-4 max-w-lg mx-auto">
          <button
            onClick={handleFavorite}
            className={`p-4 rounded-2xl ${favorited ? 'bg-red-50' : 'bg-gray-100'}`}
          >
            <Heart size={24} className={favorited ? 'fill-red-500 text-red-500' : 'text-gray-600'} />
          </button>
          <button
            onClick={copyContact}
            className="flex-1 py-4 bg-gradient-to-r from-primary to-orange-400 text-white rounded-2xl font-semibold hover:shadow-lg transition-all"
          >
            联系卖家
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItemDetail;
