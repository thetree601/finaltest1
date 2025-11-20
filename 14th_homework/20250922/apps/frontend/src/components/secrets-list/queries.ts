import { apolloClient } from '@/lib/apollo-client';
import { Secret, Travelproduct, mapTravelproductToSecret } from './types';
import { FETCH_TRAVELPRODUCTS, FETCH_TRAVELPRODUCT } from './queries.graphql';

// GraphQL에서 모든 여행 상품을 가져오는 함수
async function fetchAllTravelproducts(
  isSoldout?: boolean,
  search?: string,
  page?: number
): Promise<Travelproduct[]> {
  try {
    const { data } = await apolloClient.query({
      query: FETCH_TRAVELPRODUCTS,
      variables: {
        isSoldout,
        search,
        page,
      },
      fetchPolicy: 'network-only', // 항상 최신 데이터 가져오기
    });

    return data?.fetchTravelproducts || [];
  } catch (error) {
    console.error('Error fetching travelproducts:', error);
    return [];
  }
}

// Hot Secrets: pickedCount가 높은 상위 3개
export async function fetchHotSecrets(): Promise<Secret[]> {
  const travelproducts = await fetchAllTravelproducts(false);
  
  // pickedCount 기준으로 정렬하고 상위 3개 선택
  const sorted = [...travelproducts]
    .filter(tp => tp && tp._id) // null 체크 추가
    .sort((a, b) => (b.pickedCount || 0) - (a.pickedCount || 0))
    .slice(0, 3);
  
  return sorted.map(mapTravelproductToSecret).filter((secret): secret is Secret => secret !== null);
}

// Sale Secrets: 아직 판매되지 않은 상품 중 최근 8개
export async function fetchSaleSecrets(): Promise<Secret[]> {
  const travelproducts = await fetchAllTravelproducts(false);
  
  // soldAt이 null이고 createdAt 기준으로 정렬하여 최근 8개 선택
  const sorted = [...travelproducts]
    .filter(tp => tp && tp._id && !tp.soldAt) // null 체크 추가 및 아직 판매되지 않은 것만
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);
  
  return sorted.map(mapTravelproductToSecret).filter((secret): secret is Secret => secret !== null);
}

// Recommended Secrets: 최근 12개 상품
export async function fetchRecommendedSecrets(): Promise<Secret[]> {
  const travelproducts = await fetchAllTravelproducts(false);
  
  // createdAt 기준으로 정렬하여 최근 12개 선택
  const sorted = [...travelproducts]
    .filter(tp => tp && tp._id) // null 체크 추가
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 12);
  
  return sorted.map(mapTravelproductToSecret).filter((secret): secret is Secret => secret !== null);
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

// 상세페이지용: ID로 travelproduct 조회 (GraphQL 사용)
export async function fetchSecretById(secretId: string) {
  try {
    const { data } = await apolloClient.query({
      query: FETCH_TRAVELPRODUCT,
      variables: {
        travelproductId: secretId,
      },
      fetchPolicy: 'network-only', // 항상 최신 데이터 가져오기
    });

    const travelproduct: Travelproduct = data?.fetchTravelproduct;

    if (!travelproduct) {
      return null;
    }

    // GraphQL Travelproduct를 SecretDetailData 형식으로 변환
    // 이미지 URL을 절대 URL로 변환
    const imgArray = travelproduct.images && travelproduct.images.length > 0 
      ? travelproduct.images.map(img => getImageUrl(img))
      : null;

    // 주소 정보는 travelproductAddress에서 가져오기
    const address = travelproduct.travelproductAddress?.address || '';
    const addressDetail = travelproduct.travelproductAddress?.addressDetail || '';
    const zipcode = travelproduct.travelproductAddress?.zipcode || '';
    const latitude = travelproduct.travelproductAddress?.lat?.toString() || '';
    const longitude = travelproduct.travelproductAddress?.lng?.toString() || '';

    return {
      id: travelproduct._id,
      title: travelproduct.name,
      description: travelproduct.remarks,
      img: imgArray,
      tags: travelproduct.tags || [],
      intro: travelproduct.contents,
      price: travelproduct.price || 0,
      address: address,
      postalCode: zipcode,
      addressDetail: addressDetail,
      latitude: latitude,
      longitude: longitude,
    };
  } catch (error) {
    console.error('Error fetching travelproduct by id:', error);
    return null;
  }
}

