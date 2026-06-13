import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, CheckCircle, X, DollarSign, RefreshCw, ArrowRightLeft, Lightbulb } from 'lucide-react';
import { useItemsStore } from '@/store/itemsStore';
import { useUserStore } from '@/store/userStore';
import { useUIStore } from '@/store/uiStore';
import { CATEGORIES, PRESET_TAGS, TradeType, TRADE_TYPE_LABELS, PRICE_REFERENCE } from '@/types';

const Publish: React.FC = () => {
  const navigate = useNavigate();
  const { addItem } = useItemsStore();
  const { currentUser } = useUserStore();
  const { showToast } = useUIStore();

  const [formData, setFormData] = useState({
    title: '',
    category: CATEGORIES[1],
    description: '',
    price: '',
    contact: '',
    image: '',
    tags: [] as string[],
    tradeType: 'sell' as TradeType,
    exchangeWant: '',
    estimatedPrice: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const priceRef = PRICE_REFERENCE[formData.category] || PRICE_REFERENCE['其他'];

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          let { width, height } = img;
          const maxWidth = 800;
          const maxHeight = 800;

          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          canvas.width = width;
          canvas.height = height;
          ctx?.drawImage(img, 0, 0, width, height);

          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('图片不能超过5MB', 'warning');
        return;
      }

      try {
        const compressedImage = await compressImage(file);
        setFormData(prev => ({ ...prev, image: compressedImage }));
        showToast('图片上传成功', 'success');
      } catch (err) {
        showToast('图片处理失败', 'error');
      }
    }
  };

  const toggleTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = '请输入物品名称';
    } else if (formData.title.length < 2) {
      newErrors.title = '名称至少2个字符';
    }

    if (!formData.description.trim()) {
      newErrors.description = '请输入物品描述';
    } else if (formData.description.length < 10) {
      newErrors.description = '描述至少10个字符';
    }

    if (formData.tradeType !== 'exchange') {
      const price = parseFloat(formData.price);
      if (!formData.price || isNaN(price)) {
        newErrors.price = '请输入有效的价格';
      } else if (price < 0) {
        newErrors.price = '价格不能为负数';
      }
    }

    if (formData.tradeType === 'exchange' && !formData.exchangeWant.trim()) {
      newErrors.exchangeWant = '请说明想交换什么';
    }

    if (!formData.contact.trim()) {
      newErrors.contact = '请输入联系方式';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      showToast('请先登录', 'warning');
      navigate('/auth');
      return;
    }

    if (!validate()) {
      showToast('请检查表单填写', 'error');
      return;
    }

    setIsSubmitting(true);

    const image = formData.image || 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop';

    setTimeout(() => {
      const price = formData.tradeType === 'exchange' ? 0 : parseFloat(formData.price);

      addItem({
        title: formData.title,
        category: formData.category,
        description: formData.description,
        price,
        image,
        contact: formData.contact,
        userId: currentUser.id,
        tags: formData.tags
      });

      showToast('发布成功！', 'success');

      setTimeout(() => {
        navigate('/list');
      }, 1500);
    }, 500);
  };

  return (
    <div className="pb-24 md:pt-20">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">发布闲置物品</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              物品图片 <span className="text-gray-400">(可选)</span>
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-3xl p-8 text-center hover:border-primary transition-colors cursor-pointer">
              {formData.image ? (
                <div className="relative inline-block">
                  <img
                    src={formData.image}
                    alt="预览"
                    className="max-h-64 mx-auto rounded-2xl object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer block">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Upload size={48} className="mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-600 font-medium">点击上传图片</p>
                  <p className="text-gray-400 text-sm mt-1">支持 JPG、PNG 格式，最大 5MB</p>
                </label>
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">物品名称</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, title: e.target.value }));
                if (errors.title) setErrors(prev => ({ ...prev, title: '' }));
              }}
              className={`w-full px-4 py-4 bg-gray-100 rounded-2xl focus:outline-none focus:ring-2 transition-all ${
                errors.title ? 'ring-2 ring-red-300 focus:ring-red-400' : 'focus:ring-primary/50'
              }`}
              placeholder="请输入物品名称，如：高等数学教材"
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">分类</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-4 py-4 bg-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none"
            >
              {CATEGORIES.slice(1).map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Trade Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">交易方式</label>
            <div className="grid grid-cols-3 gap-3">
              {(['sell', 'exchange', 'both'] as TradeType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, tradeType: type }))}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl text-sm font-medium transition-all ${
                    formData.tradeType === type
                      ? 'bg-primary text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type === 'sell' && <DollarSign size={20} />}
                  {type === 'exchange' && <RefreshCw size={20} />}
                  {type === 'both' && <ArrowRightLeft size={20} />}
                  {TRADE_TYPE_LABELS[type]}
                </button>
              ))}
            </div>
          </div>

          {/* Price - only show if not exchange only */}
          {formData.tradeType !== 'exchange' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">价格 (元)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, price: e.target.value }));
                  if (errors.price) setErrors(prev => ({ ...prev, price: '' }));
                }}
                className={`w-full px-4 py-4 bg-gray-100 rounded-2xl focus:outline-none focus:ring-2 transition-all ${
                  errors.price ? 'ring-2 ring-red-300 focus:ring-red-400' : 'focus:ring-primary/50'
                }`}
                placeholder="请输入价格"
              />
              <div className="mt-3 p-4 bg-blue-50 rounded-2xl flex items-start gap-3">
                <Lightbulb size={20} className="text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="text-blue-700 font-medium mb-1">价格建议</p>
                  <p className="text-blue-600">
                    {formData.category}类物品建议价格范围：<span className="font-bold">¥{priceRef.min} - ¥{priceRef.max}</span>
                  </p>
                  <p className="text-blue-500 text-xs mt-1">{priceRef.note}</p>
                </div>
              </div>
              {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
            </div>
          )}

          {/* Exchange Want - only show for exchange/both */}
          {formData.tradeType !== 'sell' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                想交换的物品 <span className="text-gray-400">(可选)</span>
              </label>
              <input
                type="text"
                value={formData.exchangeWant}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, exchangeWant: e.target.value }));
                  if (errors.exchangeWant) setErrors(prev => ({ ...prev, exchangeWant: '' }));
                }}
                className={`w-full px-4 py-4 bg-gray-100 rounded-2xl focus:outline-none focus:ring-2 transition-all ${
                  errors.exchangeWant ? 'ring-2 ring-red-300 focus:ring-red-400' : 'focus:ring-primary/50'
                }`}
                placeholder="例如：想要英语四级资料、U盘、键盘等"
              />
              {errors.exchangeWant && <p className="text-red-500 text-sm mt-1">{errors.exchangeWant}</p>}
            </div>
          )}

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              标签 <span className="text-gray-400">(可选，最多5个)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESET_TAGS.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    if (formData.tags.length < 5 || formData.tags.includes(tag)) {
                      toggleTag(tag);
                    }
                  }}
                  className={`px-4 py-2 rounded-2xl text-sm font-medium transition-all ${
                    formData.tags.includes(tag)
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">物品描述</label>
            <textarea
              value={formData.description}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, description: e.target.value }));
                if (errors.description) setErrors(prev => ({ ...prev, description: '' }));
              }}
              rows={4}
              className={`w-full px-4 py-4 bg-gray-100 rounded-2xl focus:outline-none focus:ring-2 transition-all resize-none ${
                errors.description ? 'ring-2 ring-red-300 focus:ring-red-400' : 'focus:ring-primary/50'
              }`}
              placeholder="详细描述物品的成色、使用情况、购买时间等..."
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>

          {/* Contact */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">联系方式</label>
            <input
              type="text"
              value={formData.contact}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, contact: e.target.value }));
                if (errors.contact) setErrors(prev => ({ ...prev, contact: '' }));
              }}
              className={`w-full px-4 py-4 bg-gray-100 rounded-2xl focus:outline-none focus:ring-2 transition-all ${
                errors.contact ? 'ring-2 ring-red-300 focus:ring-red-400' : 'focus:ring-primary/50'
              }`}
              placeholder="微信/QQ/电话等"
            />
            {errors.contact && <p className="text-red-500 text-sm mt-1">{errors.contact}</p>}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-gradient-to-r from-primary to-orange-400 text-white font-semibold rounded-2xl hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <CheckCircle size={20} />
                发布中...
              </span>
            ) : (
              '立即发布'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Publish;
