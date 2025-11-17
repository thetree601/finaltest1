import { supabase } from '@/lib/supabase-client';
import { Secret, SecretRow } from './types';

export async function fetchHotSecrets(): Promise<Secret[]> {
  const { data, error } = await supabase
    .from('secrets')
    .select('*')
    .eq('category', 'hot')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching hot secrets:', error);
    return [];
  }
  
  return (data as SecretRow[]).map(item => {
    // img 필드 파싱 (JSON 문자열인 경우 배열로 변환)
    let imgArray: string[] | null = null;
    if (item.img === null || item.img === undefined) {
      imgArray = null;
    } else if (Array.isArray(item.img)) {
      imgArray = item.img;
    } else if (typeof item.img === 'string') {
      // JSON 문자열인지 확인하고 파싱
      try {
        const parsed = JSON.parse(item.img);
        imgArray = Array.isArray(parsed) ? parsed : [item.img];
      } catch {
        // JSON 파싱 실패 시 단일 문자열로 처리
        imgArray = [item.img];
      }
    }
    
    return {
      id: item.id,
      title: item.title,
      desc: item.desc,
      price: item.price,
      // 배열인 경우 첫 번째 요소만, null이면 null
      img: imgArray && imgArray.length > 0 ? imgArray[0] : null,
    };
  });
}

export async function fetchSaleSecrets(): Promise<Secret[]> {
  const { data, error } = await supabase
    .from('secrets')
    .select('*')
    .eq('category', 'sale')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching sale secrets:', error);
    return [];
  }
  
  return (data as SecretRow[]).map(item => {
    // img 필드 파싱 (JSON 문자열인 경우 배열로 변환)
    let imgArray: string[] | null = null;
    if (item.img === null || item.img === undefined) {
      imgArray = null;
    } else if (Array.isArray(item.img)) {
      imgArray = item.img;
    } else if (typeof item.img === 'string') {
      // JSON 문자열인지 확인하고 파싱
      try {
        const parsed = JSON.parse(item.img);
        imgArray = Array.isArray(parsed) ? parsed : [item.img];
      } catch {
        // JSON 파싱 실패 시 단일 문자열로 처리
        imgArray = [item.img];
      }
    }
    
    return {
      id: item.id,
      title: item.title,
      desc: item.desc,
      price: item.price,
      // 배열인 경우 첫 번째 요소만, null이면 null
      img: imgArray && imgArray.length > 0 ? imgArray[0] : null,
      saleEnds: item.sale_ends || undefined,
    };
  });
}

export async function fetchRecommendedSecrets(): Promise<Secret[]> {
  const { data, error } = await supabase
    .from('secrets')
    .select('*')
    .eq('category', 'recommended')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching recommended secrets:', error);
    return [];
  }
  
  return (data as SecretRow[]).map(item => {
    // img 필드 파싱 (JSON 문자열인 경우 배열로 변환)
    let imgArray: string[] | null = null;
    if (item.img === null || item.img === undefined) {
      imgArray = null;
    } else if (Array.isArray(item.img)) {
      imgArray = item.img;
    } else if (typeof item.img === 'string') {
      // JSON 문자열인지 확인하고 파싱
      try {
        const parsed = JSON.parse(item.img);
        imgArray = Array.isArray(parsed) ? parsed : [item.img];
      } catch {
        // JSON 파싱 실패 시 단일 문자열로 처리
        imgArray = [item.img];
      }
    }
    
    return {
      id: item.id,
      title: item.title,
      desc: item.desc,
      price: item.price,
      // 배열인 경우 첫 번째 요소만, null이면 null
      img: imgArray && imgArray.length > 0 ? imgArray[0] : null,
    };
  });
}

// 상세페이지용: ID로 secret 조회
export async function fetchSecretById(secretId: string) {
  const { data, error } = await supabase
    .from('secrets')
    .select('*')
    .eq('id', secretId)
    .single();
  
  if (error) {
    console.error('Error fetching secret by id:', error);
    return null;
  }
  
  if (!data) {
    return null;
  }
  
  // 타입 캐스팅 없이 직접 data에서 값 가져오기 (메인 페이지와 동일하게)
  const rawData = data as any;
  
  // img 필드 파싱 (JSON 문자열인 경우 배열로 변환)
  let imgArray: string[] = [];
  if (rawData.img === null || rawData.img === undefined) {
    imgArray = [];
  } else if (Array.isArray(rawData.img)) {
    imgArray = rawData.img;
  } else if (typeof rawData.img === 'string') {
    // JSON 문자열인지 확인하고 파싱
    try {
      const parsed = JSON.parse(rawData.img);
      imgArray = Array.isArray(parsed) ? parsed : [rawData.img];
    } catch {
      // JSON 파싱 실패 시 단일 문자열로 처리
      imgArray = [rawData.img];
    }
  }
  
  const result = {
    id: rawData.id,
    title: rawData.title,
    description: rawData.description || rawData.desc || '',
    img: imgArray.length > 0 ? imgArray : null,
    tags: rawData.tags || [],
    intro: rawData.intro || '',
    price: rawData.price,
    address: rawData.address || '',
    postalCode: rawData.postal_code || '',
    addressDetail: rawData.address_detail || '',
    latitude: rawData.latitude?.toString() || '',
    longitude: rawData.longitude?.toString() || '',
  };
  
  return result;
}

