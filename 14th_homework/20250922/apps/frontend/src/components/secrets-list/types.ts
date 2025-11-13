export interface Secret {
  id: string; // UUID
  title: string;
  desc: string;
  price: number;
  img: string;
  saleEnds?: string; // 할인 상품의 경우 남은 시간
}

// Supabase에서 받아오는 원본 타입
export interface SecretRow {
  id: string;
  title: string;
  desc: string;
  price: number;
  img: string;
  sale_ends: string | null;
  category: string;
  created_at: string;
  updated_at: string;
  description: string | null;
  tags: string[] | null;
  intro: string | null;
  address: string | null;
  postal_code: string | null;
  address_detail: string | null;
  latitude: number | null;
  longitude: number | null;
}
