export type ItemStatus = 'available' | 'sold' | 'reserved';
export type TradeType = 'sell' | 'exchange' | 'both';

export interface Item {
  id: string;
  title: string;
  category: string;
  description: string;
  price: number;
  image: string;
  contact: string;
  userId: string;
  createdAt: Date;
  status: ItemStatus;
  tags: string[];
  views: number;
  tradeType?: TradeType;
  exchangeWant?: string;
  estimatedPrice?: number;
  qrCode?: string;
  location?: string;
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  password: string;
  bio?: string;
  contactInfo?: string;
}

export interface Favorite {
  id: string;
  userId: string;
  itemId: string;
}

export interface SearchHistoryItem {
  keyword: string;
  timestamp: number;
}

export interface Message {
  id: string;
  fromUserId: string;
  toUserId: string;
  itemId?: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
}

export interface LostFound {
  id: string;
  type: 'lost' | 'found';
  title: string;
  description: string;
  location: string;
  image?: string;
  contact: string;
  userId: string;
  createdAt: Date;
  status: 'open' | 'closed';
}

export interface Feedback {
  id: string;
  userId: string;
  content: string;
  rating: number;
  createdAt: Date;
}

export interface ActivityInfo {
  title: string;
  date: string;
  location: string;
  organizer: string;
  description: string;
}

export const CATEGORIES = [
  '全部',
  '书籍教材',
  '数码产品',
  '生活用品',
  '运动器材',
  '服装配饰',
  '其他'
] as const;

export type Category = typeof CATEGORIES[number];

export const STATUS_LABELS: Record<ItemStatus, string> = {
  available: '在售',
  sold: '已售出',
  reserved: '已预订'
};

export const STATUS_COLORS: Record<ItemStatus, string> = {
  available: 'bg-green-100 text-green-600',
  sold: 'bg-gray-100 text-gray-600',
  reserved: 'bg-yellow-100 text-yellow-600'
};

export const TRADE_TYPE_LABELS: Record<TradeType, string> = {
  sell: '出售',
  exchange: '以物易物',
  both: '出售或交换'
};

export const TRADE_TYPE_COLORS: Record<TradeType, string> = {
  sell: 'bg-blue-100 text-blue-600',
  exchange: 'bg-green-100 text-green-600',
  both: 'bg-purple-100 text-purple-600'
};

export const PRESET_TAGS = [
  '全新',
  '九成新',
  '八成新',
  '有瑕疵',
  '可议价',
  '急出',
  '仅限本校',
  '送赠品'
];

export const PRICE_REFERENCE: Record<string, { min: number; max: number; note: string }> = {
  '书籍教材': { min: 5, max: 50, note: '教材根据新旧程度定价，热门考试书可适当提高' },
  '数码产品': { min: 20, max: 2000, note: '电子产品折旧率较高，建议标注使用时长和功能状况' },
  '生活用品': { min: 5, max: 200, note: '日用品根据完好程度和品牌定价' },
  '运动器材': { min: 20, max: 500, note: '运动器材建议注明是否有配件和使用情况' },
  '服装配饰': { min: 10, max: 300, note: '服饰类建议标注尺码和新旧程度' },
  '其他': { min: 10, max: 500, note: '其他物品请根据实际价值合理定价' }
};

export const ACTIVITY_INFO: ActivityInfo = {
  title: '校园闲置好物交换站',
  date: '2026年6月15日 - 6月30日',
  location: '学生活动中心 / 线上平台',
  organizer: '学生会生活部',
  description: '让闲置物品流动起来，让资源得到更充分的利用。我们致力于打造一个安全、便捷、高效的校园二手交易平台，让每位同学都能在这里找到心仪的物品，也让闲置物品焕发新的生机。'
};

export const ACTIVITY_FLOW = [
  { step: 1, title: '登记物品', desc: '上传闲置物品信息，填写详细描述和期望价格' },
  { step: 2, title: '贴标上架', desc: '物品编号登记后，在平台展示供他人浏览' },
  { step: 3, title: '浏览选购', desc: '通过分类、搜索快速找到心仪物品' },
  { step: 4, title: '沟通交易', desc: '与卖家联系，协商价格和交换方式' },
  { step: 5, title: '完成交易', desc: '线下或线上完成物品与钱款/物品交换' }
];

export const PAST_RESULTS = [
  { period: '2025年秋季', items: 1256, transactions: 892, participants: 345 },
  { period: '2026年春季', items: 1893, transactions: 1421, participants: 567 },
  { period: '2026年夏季', items: 2341, transactions: 1876, participants: 712 }
];

export const ENVIRONMENTAL_STATS = {
  carbonSaved: 156.8,
  itemsReused: 5490,
  participants: 1624,
  moneySaved: 187650
};
