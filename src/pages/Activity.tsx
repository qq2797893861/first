import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, Gift, ArrowRight, Leaf, Recycle, Star } from 'lucide-react';
import { ACTIVITY_INFO, ACTIVITY_FLOW, PAST_RESULTS, ENVIRONMENTAL_STATS } from '@/types';

const Activity: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="pb-24 md:pt-20">
      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary via-orange-400 to-yellow-400">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full animate-pulse"></div>
          <div className="absolute bottom-10 left-10 w-24 h-24 bg-white/10 rounded-full animate-pulse delay-300"></div>
        </div>
        <div className="relative max-w-4xl mx-auto px-4 py-16 text-center text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{ACTIVITY_INFO.title}</h1>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">{ACTIVITY_INFO.description}</p>
          <div className="flex flex-wrap gap-6 justify-center mb-8">
            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
              <Calendar size={20} />
              <span>{ACTIVITY_INFO.date}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
              <MapPin size={20} />
              <span>{ACTIVITY_INFO.location}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
              <Users size={20} />
              <span>主办方：{ACTIVITY_INFO.organizer}</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/list')}
              className="px-8 py-4 bg-white text-primary font-semibold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2"
            >
              浏览闲置好物
              <ArrowRight size={20} />
            </button>
            <button
              onClick={() => navigate('/publish')}
              className="px-8 py-4 bg-white/20 text-white font-semibold rounded-full hover:bg-white/30 transition-all flex items-center justify-center gap-2 border-2 border-white/50"
            >
              <Gift size={20} />
              发布我的闲置
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Activity Flow */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center">
              <ArrowRight size={24} className="text-primary" />
            </div>
            活动流程指引
          </h2>
          <div className="bg-white rounded-3xl shadow-md p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {ACTIVITY_FLOW.map((step, index) => (
                <div key={step.step} className="relative">
                  <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl p-4 h-full border-2 border-orange-100 hover:border-orange-300 transition-all hover:shadow-md">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg mb-3">
                      {step.step}
                    </div>
                    <h3 className="font-bold text-gray-800 mb-2">{step.title}</h3>
                    <p className="text-sm text-gray-600">{step.desc}</p>
                  </div>
                  {index < ACTIVITY_FLOW.length - 1 && (
                    <div className="hidden md:flex absolute top-1/2 -right-2 transform -translate-y-1/2 z-10">
                      <ArrowRight size={20} className="text-orange-300" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Environmental Impact */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <div className="w-10 h-10 bg-green-100 rounded-2xl flex items-center justify-center">
              <Leaf size={24} className="text-green-600" />
            </div>
            环保倡议墙
          </h2>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl shadow-md p-6 border-2 border-green-100">
            <p className="text-gray-700 mb-6 leading-relaxed">
              每一件闲置物品的重新利用，都是对地球资源的珍惜。通过交换和共享，我们不仅减少了浪费，
              还培养了可持续消费的习惯。加入我们，一起为环保贡献力量！
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-2xl p-4 text-center shadow-sm hover:shadow-md transition-all">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Leaf size={24} className="text-green-600" />
                </div>
                <p className="text-2xl font-bold text-green-600">{ENVIRONMENTAL_STATS.carbonSaved}kg</p>
                <p className="text-xs text-gray-500 mt-1">减排二氧化碳</p>
              </div>
              <div className="bg-white rounded-2xl p-4 text-center shadow-sm hover:shadow-md transition-all">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Recycle size={24} className="text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-blue-600">{ENVIRONMENTAL_STATS.itemsReused}+</p>
                <p className="text-xs text-gray-500 mt-1">物品循环利用</p>
              </div>
              <div className="bg-white rounded-2xl p-4 text-center shadow-sm hover:shadow-md transition-all">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Users size={24} className="text-yellow-600" />
                </div>
                <p className="text-2xl font-bold text-yellow-600">{ENVIRONMENTAL_STATS.participants}+</p>
                <p className="text-xs text-gray-500 mt-1">参与人数</p>
              </div>
              <div className="bg-white rounded-2xl p-4 text-center shadow-sm hover:shadow-md transition-all">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Star size={24} className="text-orange-600" />
                </div>
                <p className="text-2xl font-bold text-orange-600">¥{ENVIRONMENTAL_STATS.moneySaved.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">节省资金</p>
              </div>
            </div>
            <div className="bg-white/60 rounded-2xl p-4 text-sm text-gray-600">
              <p className="font-medium text-gray-800 mb-2">💡 小贴士</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>购买二手物品可以减少约60%的碳足迹</li>
                <li>每交换一件物品，就减少了新资源的开采和生产</li>
                <li>校园内的共享和交换，让闲置物品焕发新生</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Past Results */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center">
              <Star size={24} className="text-blue-600" />
            </div>
            往期成果展示
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PAST_RESULTS.map((result, index) => (
              <div
                key={result.period}
                className="bg-white rounded-3xl shadow-md p-6 hover:shadow-lg transition-all border-2 border-transparent hover:border-orange-200"
              >
                <div className="text-sm font-medium text-primary mb-4 bg-orange-50 px-3 py-1 rounded-full inline-block">
                  {result.period}
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-sm">发布物品</span>
                    <span className="text-2xl font-bold text-gray-800">{result.items}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-sm">成功交易</span>
                    <span className="text-2xl font-bold text-green-600">{result.transactions}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-sm">参与学生</span>
                    <span className="text-2xl font-bold text-blue-600">{result.participants}</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                  <span className="text-sm text-gray-600">
                    成交率 <span className="font-bold text-primary">
                      {Math.round((result.transactions / result.items) * 100)}%
                    </span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Links */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <div className="w-10 h-10 bg-purple-100 rounded-2xl flex items-center justify-center">
              <Users size={24} className="text-purple-600" />
            </div>
            快速入口
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => navigate('/list')}
              className="bg-white rounded-3xl shadow-md p-6 text-center hover:shadow-lg hover:scale-105 transition-all"
            >
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Gift size={28} className="text-blue-600" />
              </div>
              <p className="font-semibold text-gray-800">浏览好物</p>
              <p className="text-sm text-gray-500 mt-1">发现心仪物品</p>
            </button>
            <button
              onClick={() => navigate('/publish')}
              className="bg-white rounded-3xl shadow-md p-6 text-center hover:shadow-lg hover:scale-105 transition-all"
            >
              <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <ArrowRight size={28} className="text-orange-600" />
              </div>
              <p className="font-semibold text-gray-800">发布闲置</p>
              <p className="text-sm text-gray-500 mt-1">分享你的好物</p>
            </button>
            <button
              onClick={() => navigate('/messages')}
              className="bg-white rounded-3xl shadow-md p-6 text-center hover:shadow-lg hover:scale-105 transition-all"
            >
              <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Users size={28} className="text-green-600" />
              </div>
              <p className="font-semibold text-gray-800">站内消息</p>
              <p className="text-sm text-gray-500 mt-1">与卖家沟通</p>
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="bg-white rounded-3xl shadow-md p-6 text-center hover:shadow-lg hover:scale-105 transition-all"
            >
              <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Users size={28} className="text-purple-600" />
              </div>
              <p className="font-semibold text-gray-800">个人中心</p>
              <p className="text-sm text-gray-500 mt-1">管理你的发布</p>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Activity;
