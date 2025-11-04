export interface Secret {
  id: number;
  title: string;
  desc: string;
  price: number;
  img: string;
  saleEnds?: string; // 할인 상품의 경우 남은 시간
}

