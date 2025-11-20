import { gql } from "@apollo/client";
import { supabase } from '@/lib/supabase-client';
import { apolloClient } from '@/lib/apollo-client';
import { SecretsFormData } from '@/components/secrets-form';
import { FETCH_TRAVELPRODUCT } from './queries.graphql';

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

export const CREATE_TRAVELPRODUCT = gql`
	mutation createTravelproduct($createTravelproductInput: CreateTravelproductInput!) {
		createTravelproduct(createTravelproductInput: $createTravelproductInput) {
			_id
			name
			remarks
			contents
			price
			tags
			images
			travelproductAddress {
				_id
				address
				addressDetail
				zipcode
				lat
				lng
			}
			createdAt
		}
	}
`;

export const UPDATE_TRAVELPRODUCT = gql`
	mutation updateTravelproduct($travelproductId: ID!, $updateTravelproductInput: UpdateTravelproductInput!) {
		updateTravelproduct(travelproductId: $travelproductId, updateTravelproductInput: $updateTravelproductInput) {
			_id
			name
			remarks
			contents
			price
			tags
			images
			travelproductAddress {
				_id
				address
				addressDetail
				zipcode
				lat
				lng
			}
			updatedAt
		}
	}
`;

export const DELETE_TRAVELPRODUCT = gql`
	mutation deleteTravelproduct($travelproductId: ID!) {
		deleteTravelproduct(travelproductId: $travelproductId)
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
		
		// updateSecret과 동일하게 FileList 체크
		const hasImage = formData.image && 
			(formData.image instanceof FileList ? formData.image.length > 0 : false);
		
		if (hasImage && formData.image instanceof FileList) {
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

		// 주소 정보 구성 (주소 관련 필드가 하나라도 있으면 객체 생성)
		const travelproductAddress = (formData.address || formData.postalCode || formData.addressDetail || formData.latitude || formData.longitude) ? {
			address: formData.address || null,
			addressDetail: formData.addressDetail || null,
			zipcode: formData.postalCode || null,
			lat: formData.latitude ? parseFloat(formData.latitude) : null,
			lng: formData.longitude ? parseFloat(formData.longitude) : null,
		} : null;

		// GraphQL mutation 실행
		const { data, errors } = await apolloClient.mutate({
			mutation: CREATE_TRAVELPRODUCT,
			variables: {
				createTravelproductInput: {
					name: formData.title,
					remarks: formData.description,
					contents: formData.intro,
					price: parseInt(formData.price, 10),
					tags: tagsArray,
					images: imageUrls.length > 0 ? imageUrls : null,
					travelproductAddress: travelproductAddress,
				},
			},
			// Apollo Client 캐시에 새 상품 추가
			update: (cache, { data: mutationData }) => {
				if (!mutationData?.createTravelproduct) return;

				const newTravelproduct = mutationData.createTravelproduct;

				// fetchTravelproducts 쿼리의 모든 변형(variants)에 새 상품 추가
				cache.modify({
					fields: {
						fetchTravelproducts(existingTravelproducts = [], { readField, toReference }) {
							// 새 상품이 이미 목록에 있는지 확인
							const exists = existingTravelproducts.some(
								(ref: any) => readField('_id', ref) === newTravelproduct._id
							);

							if (exists) {
								return existingTravelproducts;
							}

							// 새 상품을 캐시에 추가하고 목록의 맨 앞에 추가
							const newRef = toReference(newTravelproduct);
							return [newRef, ...existingTravelproducts];
						},
					},
				});
			},
		});

		// GraphQL errors 체크
		if (errors && errors.length > 0) {
			console.error('비밀 등록 실패:', errors);
			return { success: false, error: errors[0].message || '비밀 등록에 실패했습니다.' };
		}

		if (!data?.createTravelproduct?._id) {
			return { success: false, error: '비밀 등록 후 ID를 받아오지 못했습니다.' };
		}

		return { success: true, id: data.createTravelproduct._id };
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
		// 1. 기존 데이터 조회 (GraphQL 사용)
		let existingTravelproduct;
		try {
			const { data } = await apolloClient.query({
				query: FETCH_TRAVELPRODUCT,
				variables: {
					travelproductId: secretId,
				},
				fetchPolicy: 'network-only',
			});
			existingTravelproduct = data?.fetchTravelproduct;
		} catch (error) {
			console.error('기존 데이터 조회 실패:', error);
			return { success: false, error: '비밀을 찾을 수 없습니다.' };
		}

		if (!existingTravelproduct) {
			return { success: false, error: '비밀을 찾을 수 없습니다.' };
		}

		// 2. 이미지 처리
		// 기존 이미지 배열 처리 (호환성 유지)
		// existingImageUrl 파싱 - undefined로 초기화하여 명시적 전달 여부 확인
		let existingImages: string[] | undefined = undefined;
		if (existingImageUrl === null) {
			existingImages = []; // null은 명시적으로 빈 배열로 처리
		} else if (existingImageUrl === undefined) {
			existingImages = undefined; // undefined는 전달되지 않음을 의미
		} else if (Array.isArray(existingImageUrl)) {
			existingImages = existingImageUrl; // 배열이 전달됨 (빈 배열 포함)
		} else if (typeof existingImageUrl === 'string') {
			try {
				const parsed = JSON.parse(existingImageUrl);
				existingImages = Array.isArray(parsed) ? parsed : [existingImageUrl];
			} catch {
				existingImages = [existingImageUrl];
			}
		}
		
		// GraphQL에서 가져온 기존 이미지도 확인
		const dbImages = existingTravelproduct.images && existingTravelproduct.images.length > 0
			? existingTravelproduct.images
			: [];
		
		// existingImageUrl이 명시적으로 전달되었으면 그 값 사용, undefined이면 GraphQL에서 가져온 값 사용
		const currentImages = existingImages !== undefined ? existingImages : dbImages;
		
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
		} else if (existingImages !== undefined) {
			// existingImageUrl이 명시적으로 전달되었고, 새 이미지가 없는 경우
			// 업데이트된 existingImages를 사용 (기존 이미지 삭제 반영)
			imageUrls = existingImages.length > 0 ? existingImages : null;
		}
		// formData.image가 undefined이고 existingImageUrl도 undefined이면 imageUrls은 undefined (변경 없음)

		// 3. 데이터 변환 및 업데이트 객체 생성
		// GraphQL UpdateTravelproductInput 형식으로 변환
		const updateInput: any = {};
		
		// 필수 필드들은 항상 업데이트 (폼에서 필수 입력이므로)
		updateInput.name = formData.title;
		updateInput.remarks = formData.description;
		updateInput.contents = formData.intro;
		updateInput.price = parseInt(formData.price, 10);
		
		// 태그 변환
		const tagsArray = formData.tags
			? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
			: null;
		updateInput.tags = tagsArray;

		// 이미지 처리: 새 이미지가 있으면 업데이트, 제거되었으면 null, 없으면 undefined (변경 없음)
		if (imageUrls !== undefined) {
			updateInput.images = imageUrls.length > 0 ? imageUrls : null;
		}
		// imageUrls이 undefined이면 updateInput에 포함하지 않음 (기존 이미지 유지)

		// 주소 정보 구성
		// 주소 필드가 하나라도 있으면 업데이트, 모두 비어있으면 기존 주소 유지 (undefined로 설정하지 않음)
		const hasAddressData = formData.address || formData.postalCode || formData.addressDetail || formData.latitude || formData.longitude;
		if (hasAddressData) {
			const travelproductAddress = {
				address: formData.address || null,
				addressDetail: formData.addressDetail || null,
				zipcode: formData.postalCode || null,
				lat: formData.latitude ? parseFloat(formData.latitude) : null,
				lng: formData.longitude ? parseFloat(formData.longitude) : null,
			};
			updateInput.travelproductAddress = travelproductAddress;
		}
		// 주소 필드가 모두 비어있으면 updateInput.travelproductAddress를 설정하지 않음 (기존 주소 유지)

		// 4. GraphQL mutation 실행
		const { data, error } = await apolloClient.mutate({
			mutation: UPDATE_TRAVELPRODUCT,
			variables: {
				travelproductId: secretId,
				updateTravelproductInput: updateInput,
			},
		});

		if (error) {
			console.error('비밀 수정 실패:', error);
			return { success: false, error: error.message || '비밀 수정에 실패했습니다.' };
		}

		if (!data?.updateTravelproduct?._id) {
			return { success: false, error: '비밀 수정 후 ID를 받아오지 못했습니다.' };
		}

		return { success: true, id: data.updateTravelproduct._id };
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

		// GraphQL mutation 실행
		const { data, errors } = await apolloClient.mutate({
			mutation: DELETE_TRAVELPRODUCT,
			variables: {
				travelproductId: secretId,
			},
			errorPolicy: 'all', // 캐시 업데이트 에러가 있어도 mutation 결과를 받기
			// Apollo Client 캐시에서 삭제된 항목 제거
			update: (cache, { data: mutationData, errors: mutationErrors }) => {
				// mutation이 실패했거나 응답이 없으면 캐시 업데이트를 건너뜀
				if (mutationErrors && mutationErrors.length > 0) {
					console.warn('mutation 에러로 인해 캐시 업데이트를 건너뜁니다:', mutationErrors);
					return;
				}
				
				if (!mutationData?.deleteTravelproduct) {
					console.warn('삭제 mutation 응답이 없습니다.');
					return;
				}

				try {

					// 1. 상세 페이지 쿼리 캐시 제거
					try {
						cache.evict({
							id: `Travelproduct:${secretId}`,
						});
					} catch (evictError) {
						console.warn('캐시 evict 실패 (무시됨):', evictError);
					}

					// 2. 목록 쿼리 캐시에서 삭제된 항목 제거
					try {
						cache.modify({
							fields: {
								fetchTravelproducts(existingTravelproducts = [], { readField }) {
									// 배열이 아닌 경우 그대로 반환
									if (!Array.isArray(existingTravelproducts)) {
										return existingTravelproducts;
									}
									
									// 안전하게 필터링
									return existingTravelproducts.filter(
										(travelproductRef: any) => {
											// null 체크
											if (!travelproductRef) {
												return false;
											}
											
											try {
												// readField가 null을 반환할 수 있으므로 안전하게 처리
												const id = readField('_id', travelproductRef);
												if (id === null || id === undefined) {
													return false;
												}
												
												return id !== secretId;
											} catch (readError) {
												// readField 에러 발생 시 해당 항목 제거
												console.warn('readField 에러 (항목 제거):', readError);
												return false;
											}
										}
									);
								},
							},
						});
					} catch (modifyError) {
						console.warn('캐시 modify 실패 (무시됨):', modifyError);
					}

					// 3. 가비지 컬렉션 실행
					try {
						cache.gc();
					} catch (gcError) {
						console.warn('캐시 GC 실패 (무시됨):', gcError);
					}
				} catch (error) {
					console.error('캐시 업데이트 중 예외 발생:', error);
					// 캐시 업데이트 실패해도 삭제는 성공할 수 있으므로 에러를 던지지 않음
				}
			},
		});

		// GraphQL errors 체크
		if (errors && errors.length > 0) {
			console.error('비밀 삭제 실패:', errors);
			// 에러 상세 정보 로깅
			errors.forEach((error, index) => {
				console.error(`에러 ${index + 1}:`, {
					message: error.message,
					extensions: error.extensions,
				});
			});
			return { success: false, error: errors[0].message || '비밀 삭제에 실패했습니다.' };
		}

		// GraphQL deleteTravelproduct는 ID를 반환하므로, 반환값이 있으면 성공
		// null이나 undefined가 아닌 경우 성공으로 처리
		const deletedId = data?.deleteTravelproduct;
		if (deletedId) {
			console.log('비밀 삭제 성공, 삭제된 ID:', deletedId);
			return { success: true };
		}

		// 응답이 null이거나 undefined인 경우
		console.warn('삭제 응답이 null입니다:', data);
		return { success: false, error: '삭제가 완료되지 않았습니다.' };
	} catch (error) {
		console.error('비밀 삭제 중 오류 발생:', error);
		const errorMessage = error instanceof Error ? error.message : '비밀 삭제 중 오류가 발생했습니다.';
		return { success: false, error: errorMessage };
	}
}

