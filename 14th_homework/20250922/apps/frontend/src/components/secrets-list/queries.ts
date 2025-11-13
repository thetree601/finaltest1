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
  
  console.log('✅ Supabase에서 hot secrets 가져옴:', data?.length, '개');
  
  return (data as SecretRow[]).map(item => ({
    id: item.id,
    title: item.title,
    desc: item.desc,
    price: item.price,
    img: item.img,
  }));
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
  
  console.log('✅ Supabase에서 sale secrets 가져옴:', data?.length, '개');
  
  return (data as SecretRow[]).map(item => ({
    id: item.id,
    title: item.title,
    desc: item.desc,
    price: item.price,
    img: item.img,
    saleEnds: item.sale_ends || undefined,
  }));
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
  
  console.log('✅ Supabase에서 recommended secrets 가져옴:', data?.length, '개');
  
  return (data as SecretRow[]).map(item => ({
    id: item.id,
    title: item.title,
    desc: item.desc,
    price: item.price,
    img: item.img,
  }));
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
  
  const secret = data as SecretRow;
  
  return {
    id: secret.id,
    title: secret.title,
    description: secret.description || '',
    imageSrc: secret.img,
    tags: secret.tags || [],
    intro: secret.intro || '',
    price: secret.price,
  };
}

