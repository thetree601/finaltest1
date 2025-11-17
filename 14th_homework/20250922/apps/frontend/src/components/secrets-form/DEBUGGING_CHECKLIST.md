# 이미지 업로드 디버깅 체크리스트

## 1단계: 브라우저 콘솔 확인 (가장 먼저!)

### 파일 선택 시점 확인
1. `/secrets/new` 페이지 접속
2. 이미지 파일 선택
3. 콘솔에서 다음 로그 확인:
   - ✅ `"파일 선택됨:"` - FileList 객체가 나와야 함
   - ✅ `"파일 정보:"` - 파일명, 타입이 나와야 함
   - ✅ `"미리보기 URL 생성:"` - blob URL이 생성되어야 함

**문제 발견 시:**
- 파일 선택 로그가 없음 → `handleFileChange` 함수가 호출되지 않음
- FileList가 비어있음 → input 요소 문제 가능성

### 폼 제출 시점 확인
4. 폼 작성 후 "등록하기" 버튼 클릭
5. 콘솔에서 다음 로그 순서대로 확인:

```
✅ "createSecret 호출됨, formData:" - 전체 formData 객체
✅ "formData.image:" - FileList 또는 null
✅ "formData.image 타입:" - "object" 또는 "null"
✅ "formData.image length:" - 숫자 (파일이 있으면 1 이상)
```

**문제 발견 시:**
- `formData.image`가 `null` → react-hook-form에 파일이 전달되지 않음
- `formData.image.length`가 `0` → FileList가 비어있음

### 이미지 업로드 시점 확인
6. 다음 로그 확인:

```
✅ "이미지 업로드 시작:" - 파일명, 크기, 타입
✅ "File 객체 확인:" - true여야 함
✅ "업로드할 파일:" - 파일 정보
✅ "업로드 경로:" - secrets/xxx.jpg 형식
```

**문제 발견 시:**
- "이미지 업로드 시작" 로그가 없음 → `formData.image.length > 0` 조건 실패
- "업로드할 파일" 로그가 없음 → `uploadImageToSupabase` 함수 호출 안 됨

### Supabase 업로드 에러 확인
7. 다음 에러 로그 확인:

```
❌ "이미지 업로드 실패:" - Supabase 에러 메시지
❌ "에러 상세:" - JSON 형태의 상세 에러
```

**주요 에러 코드:**
- `"new row violates row-level security policy"` → RLS 정책 문제
- `"Bucket not found"` → secrets-images bucket이 없음
- `"The resource already exists"` → 같은 파일명이 이미 존재 (upsert: false 때문)
- `"JWT expired"` → 인증 토큰 만료

## 2단계: 네트워크 탭 확인

1. 브라우저 개발자 도구 → Network 탭 열기
2. 폼 제출
3. 다음 요청 확인:

### Storage API 요청 확인
- 필터: `storage` 또는 `supabase` 입력
- `POST` 요청이 `secrets-images` bucket으로 가는지 확인
- Status Code 확인:
  - ✅ `200` 또는 `201` → 업로드 성공
  - ❌ `401` → 인증 문제
  - ❌ `403` → 권한 문제 (RLS 정책)
  - ❌ `404` → Bucket 없음
  - ❌ `409` → 파일 중복 (upsert: false)

### Request Payload 확인
- 요청 본문에 파일 데이터가 포함되어 있는지 확인
- Content-Type이 `multipart/form-data` 또는 적절한 타입인지 확인

## 3단계: Supabase 대시보드 확인

### Storage 설정 확인
1. Supabase 대시보드 → Storage 메뉴
2. `secrets-images` bucket 확인:
   - ✅ Bucket이 존재하는가?
   - ✅ Public으로 설정되어 있는가? (Public bucket이어야 함)

### Storage Policies 확인
1. Storage → `secrets-images` → Policies
2. 다음 정책이 있는지 확인:

**필요한 정책:**
```sql
-- INSERT 정책 (업로드용)
CREATE POLICY "Allow public uploads"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'secrets-images');

-- SELECT 정책 (조회용)
CREATE POLICY "Allow public reads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'secrets-images');
```

**또는 더 간단하게:**
- Bucket을 Public으로 설정하면 자동으로 정책이 생성됨

### RLS 확인
1. Storage → Policies
2. RLS가 활성화되어 있는지 확인
3. Public 업로드를 허용하는 정책이 있는지 확인

## 4단계: 코드 레벨 확인

### react-hook-form 파일 전달 확인
- `handleFileChange`에서 `setValue("image", files)` 호출 확인
- 폼 제출 시 `formData.image`가 FileList인지 확인

### Supabase 클라이언트 확인
- 환경 변수 확인:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` 또는 `NEXT_PUBLIC_SUPABASE_KEY`

## 5단계: 가장 흔한 문제들

### 문제 1: formData.image가 null
**원인:** react-hook-form이 파일을 제대로 저장하지 못함
**해결:** `handleFileChange`에서 `setValue` 호출 확인

### 문제 2: RLS 정책 에러
**원인:** Storage bucket에 업로드 권한이 없음
**해결:** Supabase 대시보드에서 Public bucket으로 설정 또는 정책 추가

### 문제 3: Bucket 이름 불일치
**원인:** 코드의 bucket 이름과 실제 bucket 이름이 다름
**해결:** `mutations.ts`의 `'secrets-images'`와 실제 bucket 이름 일치 확인

### 문제 4: 파일 크기 제한
**원인:** Supabase Storage의 파일 크기 제한 초과
**해결:** 파일 크기 확인 (일반적으로 50MB 제한)

## 체크리스트 요약

- [ ] 1단계: 브라우저 콘솔 로그 확인 완료
- [ ] 2단계: 네트워크 탭에서 요청 확인 완료
- [ ] 3단계: Supabase Storage 설정 확인 완료
- [ ] 4단계: 코드 레벨 확인 완료
- [ ] 5단계: 문제 원인 파악 및 해결

## 다음 단계

위 체크리스트를 순서대로 확인한 후, 발견한 문제와 콘솔 로그를 공유해주시면 더 구체적인 해결책을 제시하겠습니다.


