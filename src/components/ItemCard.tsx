import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Eye } from 'lucide-react';
import { Item, STATUS_LABELS, STATUS_COLORS } from '@/types';
import { useUserStore } from '@/store/userStore';
import { useUIStore } from '@/store/uiStore';

interface ItemCardProps {
  item: Item;
  onDelete?: (itemId: string) => void;
  showDelete?: boolean;
}

const ItemCard: React.FC<ItemCardProps> = ({ item, onDelete, showDelete = false }) => {
  const navigate = useNavigate();
  const { toggleFavorite, isFavorite, currentUser } = useUserStore();
  const { showToast } = useUIStore();
  
  const favorited = isFavorite(item.id);
  
  const handleCardClick = () => {
    navigate(`/item/${item.id}`);
  };
  
  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      showToast('请先登录', 'warning');
      navigate('/auth');
      return;
    }
    toggleFavorite(item.id);
    showToast(favorited ? '已取消收藏' : '已收藏', 'success');
  };
  
  return (
    <div 
      onClick={handleCardClick}
      className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
    >
      <div className="relative overflow-hidden">
        <img
          src={item.image}
          alt={item.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Overlay Actions */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleFavorite}
            className="absolute top-3 right-3 p-2 bg-white/90 rounded-full shadow-md hover:bg-white transition-all hover:scale-110"
          >
            <Heart
              size={20}
              className={favorited ? 'fill-red-500 text-red-500' : 'text-gray-400'}
            />
          </button>
        </div>
        
        {/* Status Badge */}
        <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium ${
          STATUS_COLORS[item.status]
        }`}>
          {STATUS_LABELS[item.status]}
        </span>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 h-12 group-hover:text-primary transition-colors">
          {item.title}
        </h3>
        
        {/* Tags */}
        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {item.tags.slice(0, 2).map(tag => (
              <span 
                key={tag}
                className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        
        <p className="text-gray-500 text-sm mb-3 line-clamp-2 h-10">
          {item.description}
        </p>
        
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-primary">
            ¥{item.price}
          </span>
          {showDelete && onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(item.id);
              }}
              className="text-red-500 hover:text-red-600 text-sm font-medium"
            >
              删除
            </button>
          )}
        </div>
        
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-400 flex items-center gap-1">
            <Eye size={12} />
            {item.views} 次浏览
          </p>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
