import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, ArrowLeft } from 'lucide-react';
import { useUserStore } from '@/store/userStore';
import { useUIStore } from '@/store/uiStore';

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const { login, register } = useUserStore();
  const { showToast } = useUIStore();
  
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    confirmPassword: ''
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.password) {
      showToast('请填写完整信息', 'warning');
      return;
    }
    
    if (formData.name.length < 2) {
      showToast('用户名至少2个字符', 'warning');
      return;
    }
    
    if (formData.password.length < 6) {
      showToast('密码至少6个字符', 'warning');
      return;
    }
    
    if (!isLogin && formData.password !== formData.confirmPassword) {
      showToast('两次密码不一致', 'warning');
      return;
    }
    
    const result = isLogin
      ? login(formData.name, formData.password)
      : register(formData.name, formData.password);
    
    showToast(result.message, result.success ? 'success' : 'error');
    
    if (result.success) {
      setTimeout(() => {
        navigate('/');
      }, 1000);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-orange-400 to-yellow-400">
      {/* Header */}
      <div className="p-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
        >
          <ArrowLeft size={24} className="text-white" />
        </button>
      </div>
      
      <div className="flex flex-col items-center justify-center px-4 pt-10 pb-20">
        {/* Logo & Title */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">🎓</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">校园闲置好物</h1>
          <p className="text-white/80">让闲置物品流动起来</p>
        </div>
        
        {/* Form Card */}
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">
          {/* Tabs */}
          <div className="flex bg-gray-100 rounded-2xl p-1 mb-8">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                isLogin ? 'bg-white shadow-md text-primary' : 'text-gray-500'
              }`}
            >
              登录
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                !isLogin ? 'bg-white shadow-md text-primary' : 'text-gray-500'
              }`}
            >
              注册
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                用户名
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="请输入用户名"
                  className="w-full pl-12 pr-4 py-4 bg-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>
            </div>
            
            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                密码
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="请输入密码"
                  className="w-full pl-12 pr-4 py-4 bg-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>
            </div>
            
            {/* Confirm Password */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  确认密码
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="请再次输入密码"
                    className="w-full pl-12 pr-4 py-4 bg-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>
              </div>
            )}
            
            {/* Submit */}
            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-primary to-orange-400 text-white font-semibold rounded-2xl hover:shadow-lg hover:scale-[1.02] transition-all mt-6"
            >
              {isLogin ? '登录' : '注册'}
            </button>
          </form>
          
          {/* Test Account Hint */}
          {isLogin && (
            <div className="mt-6 p-4 bg-blue-50 rounded-2xl">
              <p className="text-sm text-blue-600">
                <span className="font-medium">测试账号：</span>
                用户名：小明同学，密码：123456
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
