export interface Secret {
  id: string; // UUID
  title: string;
  desc: string;
  price: number;
  img: string | null;
  saleEnds?: string; // 할인 상품의 경우 남은 시간
}

// Supabase에서 받아오는 원본 타입 (레거시)
export interface SecretRow {
  id: string;
  title: string;
  desc: string;
  price: number;
  img: string[] | null; // JSONB 배열 타입으로 변경
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

// GraphQL에서 받아오는 Travelproduct 타입
export interface Travelproduct {
  _id: string;
  name: string;
  remarks: string;
  contents: string;
  price?: number | null;
  tags?: string[] | null;
  images?: string[] | null;
  pickedCount?: number | null;
  travelproductAddress?: {
    _id: string;
    address?: string | null;
    addressDetail?: string | null;
    zipcode?: string | null;
    lat?: number | null;
    lng?: number | null;
  } | null;
  buyer?: {
    _id: string;
    name?: string | null;
    email?: string | null;
  } | null;
  seller?: {
    _id: string;
    name?: string | null;
    email?: string | null;
  } | null;
  soldAt?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

// 이미지 URL을 절대 URL로 변환하는 함수
function getImageUrl(imagePath: string): string {
  // 이미 절대 URL인 경우 그대로 반환
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // codecamp-file-storage 경로인 경우 Google Cloud Storage URL로 변환
  if (imagePath.startsWith('codecamp-file-storage/')) {
    return `https://storage.googleapis.com/${imagePath}`;
  }
  
  // Supabase Storage URL인 경우 그대로 반환
  if (imagePath.includes('supabase.co') || imagePath.includes('supabase')) {
    return imagePath;
  }
  
  // 상대 경로인 경우 GraphQL 서버의 기본 URL과 결합
  const baseUrl = 'https://main-practice.codebootcamp.co.kr';
  return `${baseUrl}/${imagePath}`;
}

// GraphQL Travelproduct를 Secret 타입으로 변환하는 유틸리티 함수
export function mapTravelproductToSecret(travelproduct: Travelproduct | null | undefined): Secret | null {
  // null 체크 추가
  if (!travelproduct || !travelproduct._id) {
    return null;
  }

  // images 배열의 첫 번째 이미지를 사용, 없으면 null
  // 이미지 URL을 절대 URL로 변환
  const firstImage = travelproduct.images && travelproduct.images.length > 0 
    ? getImageUrl(travelproduct.images[0])
    : null;

  return {
    id: travelproduct._id,
    title: travelproduct.name,
    desc: travelproduct.remarks,
    price: travelproduct.price || 0,
    img: firstImage,
    // saleEnds는 soldAt이 있으면 계산하거나, 필요시 다른 로직 추가
    saleEnds: travelproduct.soldAt ? undefined : undefined, // 필요시 구현
  };
}
