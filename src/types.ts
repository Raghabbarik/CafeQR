export interface HeroConfig {
  badge: string;
  title: string;
  cardTitle: string;
  cardSubtitle: string;
  buttonText: string;
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'staff';
  createdAt: string;
}

export interface CafeInfo {
  name: string;
  tagline: string;
  logo: string;
  coverImage: string;
  address?: string;
  phone?: string;
  wifiSsid?: string;
  wifiPassword?: string;
  currency: string;
  taxRate: number;
  razorpayKeyId: string;
  upiId?: string;
  tablesCount: number;
  hero?: HeroConfig;
  staff?: StaffMember[];
  orderDisplayCode?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  mrp?: number;
  portion?: string;
  description: string;
  whyLoveIt?: string[];
  image: string;
  isVeg: boolean;
  isBestseller: boolean;
  isAvailable: boolean;
  prepTime: string;
  rating?: number;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export type OrderStatus = 'received' | 'preparing' | 'ready' | 'completed' | 'cancelled';

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  isVeg: boolean;
}

export type DiningOption = 'dine_in' | 'parcel';

export interface Order {
  id: string;
  tableNumber?: string;
  diningOption?: DiningOption;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  subtotal: number;
  taxRate: number;
  tax: number;
  total: number;
  notes?: string;
  paymentMethod: string;
  paymentId: string;
  paymentStatus: 'PAID' | 'PENDING' | 'FAILED';
  orderStatus: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface StaffAlert {
  id: string;
  tableNumber: string;
  type: string;
  time: string;
}

