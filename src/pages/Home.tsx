import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Smartphone, Home as HomeIcon, Dumbbell, Shirt, MoreHorizontal, Sparkles, ArrowRight, User } from 'lucide-react';
import { useItemsStore } from '@/store/itemsStore';
import { useUserStore } from '@/store/userStore';
import ItemCard from '@/components/ItemCard';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { items } = useItemsStore();
  const { currentUser } = useUserStore();
  
  const categories = [
    { name: '书籍教材', icon: BookOpen, color: 'bg-blue-100 text-blue-600' },
    { name: '数码产品', icon: Smartphone, color: 'bg-purple-100 text-purple-600' },
    { name: '生活用品', icon: HomeIcon, color: 'bg-green-100 text-green-600' },
    { name: '运动器材', icon: Dumbbell, color: 'bg-orange-100 text-orange-600' },
    { name: '服装配饰', icon: Shirt, color: 'bg-pink-100 text-pink-600' },
    { name: '其他', icon: MoreHorizontal, color: 'bg-gray-100 text-gray-600' }
  ];
  
  const handleCategoryClick = (category: string) => {
    navigate('/list', { state: { category } });
  };
  
  return (
    <div className="pb-24 md:pt-20">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary via-orange-400 to-yellow-400 animate-gradient">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full animate-float"></div>
          <div className="absolute bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full animate-float-delay"></div>
        </div>
        
        <div className="relative max-w-6xl mx-auto px-4 py-12 md:py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
              校园闲置好物交换站
              <Sparkles className="inline-block ml-2" size={32} />
            </h1>
            <p className="text-xl text-white/90 mb-8">
              让闲置物品流动起来，找到新的主人
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate('/list')}
                className="px-8 py-4 bg-white text-primary font-semibold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all"
              >
                立即发现好物
              </button>
              <button
                onClick={() => navigate('/publish')}
                className="px-8 py-4 bg-white/20 text-white font-semibold rounded-full hover:bg-white/30 transition-all"
              >
                发布闲置物品
              </button>
            </div>
            
            {/* User Welcome */}
            <div className="mt-8 flex items-center justify-center gap-4 text-white/90">
              {currentUser ? (
                <>
                  <User size={20} />
                  <span>欢迎回来，{currentUser.name}！</span>
                </>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/auth')}
                    className="text-white underline hover:text-white/80"
                  >
                    点击登录
                  </button>
                  <span>以获得完整功能</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Categories */}
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">热门分类</h2>
          <button
            onClick={() => navigate('/list')}
            className="text-primary text-sm font-medium flex items-center gap-1 hover:text-orange-600 transition-colors"
          >
            查看全部
            <ArrowRight size={16} />
          </button>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {categories.map((category, index) => (
            <button
              key={category.name}
              onClick={() => handleCategoryClick(category.name)}
              className="flex flex-col items-center p-4 bg-white rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`w-14 h-14 rounded-full ${category.color} flex items-center justify-center mb-3`}>
                <category.icon size={28} />
              </div>
              <span className="text-sm font-medium text-gray-700">{category.name}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Featured Items */}
      <div className="max-w-6xl mx-auto px-4 pb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">最新发布</h2>
          <button
            onClick={() => navigate('/list')}
            className="text-primary text-sm font-medium flex items-center gap-1 hover:text-orange-600 transition-colors"
          >
            查看更多
            <ArrowRight size={16} />
          </button>
        </div>
        
        {items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.slice(0, 4).map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-3xl">
            <p className="text-gray-500 text-lg mb-4">还没有发布的物品</p>
            <button
              onClick={() => navigate('/publish')}
              className="px-6 py-3 bg-primary text-white rounded-full font-medium"
            >
              成为第一个发布者！
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
