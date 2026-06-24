export interface ProductSpecs {
  topSpeed: string;
  range: string;
  weight: string;
  maxLoad: string;
  chargingTime: string;
  motorPower: string;
}

export interface Product {
  id: string | number;
  name: string;
  slug: string;
  category?: string;
  category_id?: number;
  category_name?: string;
  categoryName?: string;
  price: number;
  sale_price?: number;
  originalPrice?: number;
  description?: string;
  short_description?: string;
  shortDescription?: string;
  featured_image_url?: string;
  images: string[];
  specs?: any;
  features?: string[];
  inStock?: boolean;
  is_active?: boolean;
  badge?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
