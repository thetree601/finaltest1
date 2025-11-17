import { gql } from "@apollo/client";
import { supabase } from '@/lib/supabase-client';
import { SecretsFormData } from '@/components/secrets-form';

export const LOGIN_USER = gql`
	mutation loginUser($email: String!, $password: String!) {
		loginUser(email: $email, password: $password) {
			accessToken
		}
	}
`;

export const CREATE_USER = gql`
	mutation createUser($createUserInput: CreateUserInput!) {
		createUser(createUserInput: $createUserInput) {
			_id
			email
			name
			picture
			userPoint {
				amount
			}
			createdAt
			updatedAt
			deletedAt
		}
	}
`;

// 이미지를 Supabase Storage에 업로드하는 함수
export async function uploadImageToSupabase(file: File): Promise<{ success: boolean; url?: string; error?: string }> {
	try {
		console.log('업로드할 파일:', file.name, file.size, file.type);
		
		// 파일 크기 검증 (50MB 제한)
		const maxSize = 50 * 1024 * 1024; // 50MB
		if (file.size > maxSize) {
			const errorMsg = `파일 크기가 너무 큽니다. 최대 ${maxSize / 1024 / 1024}MB까지 업로드 가능합니다.`;
			console.error(errorMsg);
			return { success: false, error: errorMsg };
		}

		// 파일 타입 검증
		if (!file.type.startsWith('image/')) {
			const errorMsg = '이미지 파일만 업로드 가능합니다.';
			console.error(errorMsg);
			return { success: false, error: errorMsg };
		}
		
		// 파일명 생성 (타임스탬프 + 랜덤 문자열)
		const fileExt = file.name.split('.').pop();
		const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
		const filePath = `secrets/${fileName}`;
		
		console.log('업로드 경로:', filePath);

		// Supabase Storage에 업로드
		const { data, error } = await supabase.storage
			.from('secrets-images')
			.upload(filePath, file, {
				cacheControl: '3600',
				upsert: false
			});

		if (error) {
			console.error('이미지 업로드 실패:', error);
			console.error('에러 상세:', JSON.stringify(error, null, 2));
			console.error('에러 코드:', error.statusCode);
			console.error('에러 메시지:', error.message);
			
			// 에러 메시지 개선
			let errorMessage = '이미지 업로드에 실패했습니다.';
			if (error.message?.includes('row-level security')) {
				errorMessage = 'Storage 권한이 없습니다. Supabase 대시보드에서 Storage 정책을 확인해주세요.';
			} else if (error.message?.includes('Bucket not found')) {
				errorMessage = 'secrets-images 버킷을 찾을 수 없습니다. Supabase 대시보드에서 버킷을 확인해주세요.';
			} else if (error.message?.includes('JWT')) {
				errorMessage = '인증 토큰이 만료되었거나 유효하지 않습니다.';
			} else if (error.message) {
				errorMessage = `이미지 업로드 실패: ${error.message}`;
			}
			
			return { success: false, error: errorMessage };
		}

		console.log('업로드 성공:', data);

		// Public URL 가져오기
		const { data: urlData } = supabase.storage
			.from('secrets-images')
			.getPublicUrl(filePath);

		console.log('Public URL:', urlData.publicUrl);
		return { success: true, url: urlData.publicUrl };
	} catch (error) {
		console.error('이미지 업로드 중 오류 발생:', error);
		const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
		return { success: false, error: `이미지 업로드 중 오류: ${errorMessage}` };
	}
}

// 비밀 등록 함수
export async function createSecret(formData: SecretsFormData): Promise<{ success: boolean; id?: string; error?: string }> {
	try {
		// 이미지 업로드 (최대 3개)
		let imageUrls: string[] = [];
		if (formData.image && formData.image.length > 0) {
			// FileList를 배열로 변환하고 최대 3개까지만 처리
			const filesToUpload = Array.from(formData.image).slice(0, 3);
			
			// 모든 파일에 대한 업로드 Promise 생성
			const uploadPromises = filesToUpload.map(file => 
				uploadImageToSupabase(file)
			);
			
			// Promise.all을 사용하여 동시에 업로드
			const results = await Promise.all(uploadPromises);
			
			// 성공한 이미지 URL만 수집
			imageUrls = results
				.filter(result => result.success && result.url)
				.map(result => result.url!);
			
			// 모든 이미지 업로드 실패 시 에러 반환
			if (imageUrls.length === 0 && filesToUpload.length > 0) {
				return { 
					success: false, 
					error: '이미지 업로드에 실패했습니다.' 
				};
			}
		}

		// 태그 변환 (쉼표로 구분된 문자열 → 배열)
		const tagsArray = formData.tags
			? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
			: null;

		// 숫자 변환
		const price = parseInt(formData.price, 10);
		const latitude = formData.latitude ? parseFloat(formData.latitude) : null;
		const longitude = formData.longitude ? parseFloat(formData.longitude) : null;

		// Supabase에 데이터 삽입
		const insertData = {
			title: formData.title,
			desc: formData.description, // 폼의 description을 desc로 매핑
			description: null, // nullable이므로 null로 저장
			intro: formData.intro,
			price: price,
			img: imageUrls.length > 0 ? imageUrls : null, // JSONB 배열로 저장
			category: 'recommended', // 기본값 'recommended'
			tags: tagsArray,
			address: formData.address || null,
			postal_code: formData.postalCode || null,
			address_detail: formData.addressDetail || null,
			latitude: latitude,
			longitude: longitude,
		};
		
		const { data, error } = await supabase
			.from('secrets')
			.insert(insertData)
			.select()
			.single();

		if (error) {
			console.error('비밀 등록 실패:', error);
			return { success: false, error: error.message };
		}

		return { success: true, id: data.id };
	} catch (error) {
		console.error('비밀 등록 중 오류 발생:', error);
		return { success: false, error: '비밀 등록 중 오류가 발생했습니다.' };
	}
}

// 비밀 수정 함수
export async function updateSecret(
	secretId: string,
	formData: SecretsFormData,
	existingImageUrl?: string | null | string[] // 기존 이미지 URL 배열 전달받기
): Promise<{ success: boolean; id?: string; error?: string }> {
	try {
		// 1. 기존 데이터 조회 (수정하지 않은 필드 유지하기 위해)
		const { data: existingData, error: fetchError } = await supabase
			.from('secrets')
			.select('*')
			.eq('id', secretId)
			.single();
		
		if (fetchError || !existingData) {
			return { success: false, error: '비밀을 찾을 수 없습니다.' };
		}

		// 2. 이미지 처리
		// 기존 이미지 배열 처리 (호환성 유지)
		// existingImageUrl 파싱
		let existingImages: string[] = [];
		if (existingImageUrl === null || existingImageUrl === undefined) {
			existingImages = [];
		} else if (Array.isArray(existingImageUrl)) {
			existingImages = existingImageUrl;
		} else if (typeof existingImageUrl === 'string') {
			try {
				const parsed = JSON.parse(existingImageUrl);
				existingImages = Array.isArray(parsed) ? parsed : [existingImageUrl];
			} catch {
				existingImages = [existingImageUrl];
			}
		}
		
		// 데이터베이스에서 가져온 기존 이미지도 확인 및 파싱
		let dbImages: string[] = [];
		if (existingData.img === null || existingData.img === undefined) {
			dbImages = [];
		} else if (Array.isArray(existingData.img)) {
			dbImages = existingData.img;
		} else if (typeof existingData.img === 'string') {
			try {
				const parsed = JSON.parse(existingData.img);
				dbImages = Array.isArray(parsed) ? parsed : [existingData.img];
			} catch {
				dbImages = [existingData.img];
			}
		}
		
		// existingImageUrl이 없으면 DB에서 가져온 값 사용
		const currentImages = existingImages.length > 0 ? existingImages : dbImages;
		
		let imageUrls: string[] | null | undefined = undefined; // undefined = 변경 없음
		
		// formData.image가 FileList인 경우 length 체크
		const hasNewImage = formData.image && 
			(formData.image instanceof FileList ? formData.image.length > 0 : false);
		
		if (hasNewImage && formData.image instanceof FileList) {
			// 현재 이미지 개수 확인
			const currentImageCount = currentImages.length;
			const maxAllowed = 3 - currentImageCount;
			
			// 새 이미지 업로드 (남은 공간만큼만)
			const filesToUpload = Array.from(formData.image).slice(0, maxAllowed);
			
			if (filesToUpload.length === 0) {
				imageUrls = currentImages.length > 0 ? currentImages : null;
			} else {
				// 모든 파일에 대한 업로드 Promise 생성
				const uploadPromises = filesToUpload.map(file => 
					uploadImageToSupabase(file)
				);
				
				// Promise.all을 사용하여 동시에 업로드
				const results = await Promise.all(uploadPromises);
				
				// 성공한 이미지 URL만 수집
				const newImageUrls = results
					.filter(result => result.success && result.url)
					.map(result => result.url!);
				
				// 모든 이미지 업로드 실패 시 에러 반환
				if (newImageUrls.length === 0 && filesToUpload.length > 0) {
					return { 
						success: false, 
						error: '이미지 업로드에 실패했습니다.' 
					};
				}
				
				// 기존 이미지와 새 이미지 병합 (최대 3개)
				const mergedImages = [...currentImages, ...newImageUrls].slice(0, 3);
				imageUrls = mergedImages.length > 0 ? mergedImages : null;
			}
		} else if (formData.image === null) {
			// 이미지가 명시적으로 제거된 경우 (사용자가 이미지 제거 버튼 클릭)
			imageUrls = null; // 이미지 제거
		}
		// formData.image가 undefined이거나 빈 FileList이고 기존 이미지가 있으면 imageUrls은 undefined (변경 없음)

		// 3. 데이터 변환 및 업데이트 객체 생성
		// 중요: 사용자가 수정한 필드만 업데이트하고, 수정하지 않은 필드는 기존 값 유지
		const updateData: any = {};
		
		// 필수 필드들은 항상 업데이트 (폼에서 필수 입력이므로)
		updateData.title = formData.title;
		updateData.desc = formData.description;
		updateData.intro = formData.intro;
		updateData.price = parseInt(formData.price, 10);
		
		// 태그 변환
		const tagsArray = formData.tags
			? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
			: null;
		updateData.tags = tagsArray;
		
		// 주소 관련 필드 (빈 문자열이면 null로, 값이 있으면 업데이트)
		updateData.address = formData.address || null;
		updateData.postal_code = formData.postalCode || null;
		updateData.address_detail = formData.addressDetail || null;
		
		// 위도/경도 변환
		updateData.latitude = formData.latitude ? parseFloat(formData.latitude) : null;
		updateData.longitude = formData.longitude ? parseFloat(formData.longitude) : null;

		// 이미지 처리: 새 이미지가 있으면 업데이트, 제거되었으면 null, 없으면 undefined (변경 없음)
		if (imageUrls !== undefined) {
			updateData.img = imageUrls;
		}
		// imageUrls이 undefined이면 updateData에 포함하지 않음 (기존 이미지 유지)

		// 4. Supabase 업데이트
		// 현재는 권한 체크 없이 모든 사용자가 수정 가능
		const { data, error } = await supabase
			.from('secrets')
			.update(updateData)
			.eq('id', secretId)
			.select()
			.single();

		if (error) {
			console.error('비밀 수정 실패:', error);
			return { success: false, error: error.message };
		}

		return { success: true, id: data.id };
	} catch (error) {
		console.error('비밀 수정 중 오류 발생:', error);
		return { success: false, error: '비밀 수정 중 오류가 발생했습니다.' };
	}
}

// 비밀 삭제 함수
export async function deleteSecret(
	secretId: string
): Promise<{ success: boolean; error?: string }> {
	try {
		console.log('deleteSecret 호출됨, secretId:', secretId);
		
		if (!secretId) {
			console.error('secretId가 없습니다.');
			return { success: false, error: '삭제할 비밀의 ID가 없습니다.' };
		}

		// 삭제 전에 해당 레코드가 존재하는지 확인
		const { data: existingData, error: fetchError } = await supabase
			.from('secrets')
			.select('id')
			.eq('id', secretId)
			.single();

		console.log('삭제 전 레코드 확인:', { existingData, fetchError });

		if (fetchError || !existingData) {
			console.error('삭제할 레코드를 찾을 수 없습니다:', fetchError);
			return { success: false, error: '삭제할 비밀을 찾을 수 없습니다.' };
		}

		// 현재는 권한 체크 없이 모든 사용자가 삭제 가능
		console.log('Supabase 삭제 요청 시작...');
		const { data, error } = await supabase
			.from('secrets')
			.delete()
			.eq('id', secretId);

		console.log('Supabase 삭제 응답:', { data, error });

		if (error) {
			console.error('비밀 삭제 실패:', error);
			console.error('에러 상세:', JSON.stringify(error, null, 2));
			console.error('에러 코드:', error.code);
			console.error('에러 메시지:', error.message);
			console.error('에러 힌트:', error.hint);
			return { success: false, error: error.message || '비밀 삭제에 실패했습니다.' };
		}

		// 삭제 후 확인 (RLS 정책 때문에 select가 안 될 수 있으므로 삭제 후 재확인)
		const { data: verifyData, error: verifyError } = await supabase
			.from('secrets')
			.select('id')
			.eq('id', secretId)
			.single();

		console.log('삭제 후 확인:', { verifyData, verifyError });

		// verifyError가 있고 "PGRST116" (not found)이면 삭제 성공
		if (verifyError && verifyError.code === 'PGRST116') {
			console.log('비밀 삭제 성공 (레코드가 존재하지 않음)');
			return { success: true };
		}

		// verifyData가 null이거나 undefined면 삭제 성공
		if (!verifyData) {
			console.log('비밀 삭제 성공 (레코드가 존재하지 않음)');
			return { success: true };
		}

		// 여기까지 왔다면 삭제가 안 된 것
		console.warn('삭제 후에도 레코드가 존재함:', verifyData);
		return { success: false, error: '삭제가 완료되지 않았습니다. RLS 정책을 확인해주세요.' };
	} catch (error) {
		console.error('비밀 삭제 중 오류 발생:', error);
		const errorMessage = error instanceof Error ? error.message : '비밀 삭제 중 오류가 발생했습니다.';
		return { success: false, error: errorMessage };
	}
}

