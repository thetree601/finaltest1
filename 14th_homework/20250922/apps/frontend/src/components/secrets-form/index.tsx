"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Script from "next/script";
import DaumPostcode from "react-daum-postcode";
import { useModal } from "@/commons/providers/modal/modal.provider";
import { authManager } from "@/lib/auth";
import LoginModal from "@/components/secrets-list/modals/LoginModal";
import styles from "./styles.module.css";

// 카카오 지도 API 타입 정의
declare global {
  interface Window {
    kakao: any;
  }
}

// 카카오 지도 API 키
const KAKAO_MAP_API_KEY = process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY || 'f9a89aef673fd594f7fef9f9892d883f';

// 폼 데이터 타입
export interface SecretsFormData {
  title: string;
  description: string;
  intro: string;
  price: string;
  tags: string;
  address: string;
  postalCode: string;
  addressDetail: string;
  latitude: string;
  longitude: string;
  image: FileList | null | undefined; // undefined는 수정 모드에서 기존 이미지 유지를 의미
}

// Zod 스키마
const secretsFormSchema = z.object({
  title: z.string().min(1, "비밀명을 입력해주세요"),
  description: z.string().min(1, "한줄 설명을 입력해주세요"),
  intro: z.string().min(1, "비밀 소개를 입력해주세요"),
  price: z.string().min(1, "판매 가격을 입력해주세요"),
  tags: z.string().optional(),
  address: z.string().optional(),
  postalCode: z.string().optional(),
  addressDetail: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  image: z.custom<FileList | null>().optional(),
});

interface SecretsFormProps {
  mode: "create" | "edit";
  initialData?: Partial<SecretsFormData>;
  existingImageUrl?: string | null | string[]; // 기존 이미지 URL 배열 추가
  onSubmit: (data: SecretsFormData, existingImageUrls?: string[]) => void;
  onCancel: () => void;
}

export default function SecretsForm({
  mode,
  initialData,
  existingImageUrl: propExistingImageUrl,
  onSubmit,
  onCancel,
}: SecretsFormProps) {
  const { openModal, closeModal } = useModal();
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>(
    Array.isArray(propExistingImageUrl) 
      ? propExistingImageUrl 
      : (propExistingImageUrl ? [propExistingImageUrl] : [])
  );
  const [isPostcodeModalOpen, setIsPostcodeModalOpen] = useState(false);
  const [isKakaoMapLoaded, setIsKakaoMapLoaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null) as React.MutableRefObject<HTMLInputElement | null>;
  const mapRef = useRef<any>(null) as React.MutableRefObject<any>;
  const markerRef = useRef<any>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<SecretsFormData>({
    resolver: zodResolver(secretsFormSchema),
    defaultValues: initialData || {
      title: "",
      description: "",
      intro: "",
      price: "",
      tags: "",
      address: "",
      postalCode: "",
      addressDetail: "",
      latitude: "",
      longitude: "",
      image: null,
    },
  });

  const watchedImage = watch("image");
  const watchedLatitude = watch("latitude");
  const watchedLongitude = watch("longitude");
  const watchedAddress = watch("address");

  // 파일 선택 핸들러: 이제 제한된 FileList를 받음
  const handleFileChange = (limitedFileList: FileList | null) => {
    // 기존 미리보기 URL 해제
    previewUrls.forEach(url => URL.revokeObjectURL(url));

    if (limitedFileList && limitedFileList.length > 0) {
      // 새로운 미리보기 URL 생성
      const newUrls = Array.from(limitedFileList).map(file => URL.createObjectURL(file));
      
      // 새 URL 설정
      setPreviewUrls(newUrls);

    } else {
      // 파일이 없으면 새 미리보기만 제거
      setPreviewUrls([]);
    }
  };

  // 수정 모드일 때 initialData로 폼 초기화
  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  // 수정 모드일 때 기존 이미지 URL 설정
  useEffect(() => {
    if (mode === "edit") {
      const existingUrls = Array.isArray(propExistingImageUrl) 
        ? propExistingImageUrl 
        : (propExistingImageUrl ? [propExistingImageUrl] : []);
      setExistingImageUrls(existingUrls);
    }
  }, [mode, propExistingImageUrl]);

  // 주소를 좌표로 변환하는 함수 (Geocoding)
  const geocodeAddress = useCallback((address: string) => {
    console.log('주소 변환 시작:', address);
    
    // 🟢 핵심 수정: 카카오 API 로드 상태를 체크하며 재시도하는 로직 추가
    const checkKakaoLoad = (attempt = 0) => {
        if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
            
            // 이 시점에서 Geocoder 접근 가능
            const geocoder = new window.kakao.maps.services.Geocoder();
            geocoder.addressSearch(address, (result: any, status: any) => {
                console.log('주소 변환 결과:', result, status);
                if (status === window.kakao.maps.services.Status.OK) {
                    const lat = result[0].y;
                    const lng = result[0].x;
                    console.log('변환된 좌표:', lat, lng);
                    setValue("latitude", lat);
                    setValue("longitude", lng);
                } else {
                    console.error('주소 변환 실패:', status);
                }
            });
        } else if (attempt < 10) { // 최대 10번 (5초)까지 재시도
            console.log(`카카오 지도 API 로드 대기 중... 재시도 ${attempt + 1}`);
            setTimeout(() => checkKakaoLoad(attempt + 1), 500);
        } else {
            console.error('카카오 지도 API (services) 라이브러리 로드 시간 초과.');
        }
    };
    
    checkKakaoLoad(); // 체크 시작
  }, [setValue]); // isKakaoMapLoaded 의존성 제거

  // 지도 초기화 및 마커 표시 함수
  const initMap = useCallback((latitude: number, longitude: number) => {
    if (!isKakaoMapLoaded || !window.kakao || !window.kakao.maps) {
      console.log('지도 초기화 실패: API가 로드되지 않음');
      return;
    }
    
    // 지도 컨테이너가 DOM에 있는지 확인
    const container = document.getElementById('map');
    if (!container) {
      console.log('지도 컨테이너를 찾을 수 없음, 재시도 예정');
      // 컨테이너가 없으면 잠시 후 다시 시도
      setTimeout(() => {
        initMap(latitude, longitude);
      }, 100);
      return;
    }
    
    console.log('지도 초기화 시작:', latitude, longitude);
    
    // 기존 마커가 있으면 제거
    if (markerRef.current) {
      markerRef.current.setMap(null);
      markerRef.current = null;
    }
    
    const options = {
      center: new window.kakao.maps.LatLng(latitude, longitude),
      level: 3
    };
    
    // 기존 지도가 있으면 재사용, 없으면 새로 생성
    if (mapRef.current) {
      mapRef.current.setCenter(new window.kakao.maps.LatLng(latitude, longitude));
      console.log('기존 지도 중심 이동');
    } else {
      const map = new window.kakao.maps.Map(container, options);
      mapRef.current = map;
      console.log('새 지도 생성');
    }
    
    // 마커 표시
    const markerPosition = new window.kakao.maps.LatLng(latitude, longitude);
    const marker = new window.kakao.maps.Marker({
      position: markerPosition
    });
    marker.setMap(mapRef.current);
    markerRef.current = marker;
    console.log('마커 표시 완료');
  }, [isKakaoMapLoaded]);

  // 지도 업데이트 함수 (좌표 변경 시)
  const updateMap = useCallback((latitude: number, longitude: number) => {
    if (!isKakaoMapLoaded || !window.kakao || !window.kakao.maps) return;
    
    if (mapRef.current && markerRef.current) {
      const moveLatLon = new window.kakao.maps.LatLng(latitude, longitude);
      mapRef.current.setCenter(moveLatLon);
      markerRef.current.setPosition(moveLatLon);
    } else {
      initMap(latitude, longitude);
    }
  }, [isKakaoMapLoaded, initMap]);

  // 컴포넌트 언마운트 시 메모리 정리만 수행
  useEffect(() => {
    // 최신 값 참조를 위해 클로저에 저장
    const currentPreviewUrls = previewUrls;
    
    return () => {
      currentPreviewUrls.forEach(url => URL.revokeObjectURL(url));
      
      // 지도 인스턴스 정리
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
      mapRef.current = null;
    };
  }, [previewUrls]); // ✅ previewUrls 추가: ESLint 경고 및 메모리 정리 보장

  // 카카오 지도 API 로드 완료 핸들러
  const handleKakaoMapLoad = () => {
    console.log('카카오 지도 API 로드 시작');
    if (window.kakao && window.kakao.maps) {
      window.kakao.maps.load(() => {
        if (window.kakao.maps.services) {
            console.log('카카오 지도 API 로드 완료 (services 포함)');
            setIsKakaoMapLoaded(true);
        } else {
             console.error('카카오 지도 API 로드 완료, 하지만 services 라이브러리가 누락되었습니다.'); 
        }
      });
    } else {
      console.error('카카오 지도 API를 찾을 수 없습니다');
    }
  };

  // 주소 변경 시 좌표 변환 (주소가 변경되고 좌표가 없거나, 주소가 변경되었을 때)
  useEffect(() => {
    // 🟢 수정: isKakaoMapLoaded 조건 제거 (geocodeAddress가 내부적으로 로드 상태 체크)
    if (watchedAddress && watchedAddress.trim() !== '') {
      // debounce를 위해 setTimeout 사용
      const timer = setTimeout(() => {
        // 좌표가 없거나 주소가 변경되었을 때만 변환
        if (!watchedLatitude || !watchedLongitude) {
          geocodeAddress(watchedAddress);
        }
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [watchedAddress, geocodeAddress, watchedLatitude, watchedLongitude]); // 🟢 isKakaoMapLoaded 의존성 제거

  // 좌표 변경 시 지도 업데이트
  useEffect(() => {
    if (watchedLatitude && watchedLongitude && isKakaoMapLoaded) {
      const lat = parseFloat(watchedLatitude);
      const lng = parseFloat(watchedLongitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        // 지도 컨테이너가 렌더링된 후에 초기화
        setTimeout(() => {
          updateMap(lat, lng);
        }, 100);
      }
    }
  }, [watchedLatitude, watchedLongitude, isKakaoMapLoaded, updateMap]);

  // 이미지 제거 핸들러 (특정 인덱스의 이미지 제거)
  const handleRemoveImage = (index: number, isExisting: boolean) => {
    if (isExisting) {
      // 기존 이미지 제거
      setExistingImageUrls((prevUrls) => {
        const newUrls = [...prevUrls];
        newUrls.splice(index, 1);
        return newUrls;
      });
    } else {
      // 새로 선택한 이미지 제거
      const currentFileList = watchedImage;
      if (currentFileList && currentFileList.length > 0) {
        const fileArray = Array.from(currentFileList);
        const fileToRemove = fileArray[index];
        URL.revokeObjectURL(URL.createObjectURL(fileToRemove)); 

        fileArray.splice(index, 1); 

        // 새로운 FileList 생성
        const dataTransfer = new DataTransfer();
        fileArray.forEach(file => dataTransfer.items.add(file));
        const newFileList = dataTransfer.files;

        setValue("image", newFileList, { shouldValidate: true });
        handleFileChange(newFileList); // 미리보기 업데이트
      }
    }
    
    // 모든 이미지가 제거된 경우
    const remainingPreviewCount = isExisting ? (watchedImage?.length || 0) : ((watchedImage?.length || 1) - 1);
    const remainingExistingCount = isExisting ? (existingImageUrls.length - 1) : existingImageUrls.length;
    
    if (remainingPreviewCount === 0 && remainingExistingCount === 0) {
      setValue("image", null, { shouldValidate: false });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setPreviewUrls([]); 
    }
  };
  
  // 모든 이미지 제거 핸들러
  const handleRemoveAllImages = () => {
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    setPreviewUrls([]);
    setExistingImageUrls([]);
    setValue("image", null, { shouldValidate: false });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // 이미지 선택 핸들러
  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  // 주소 검색 핸들러
  const handlePostcodeSearch = () => {
    setIsPostcodeModalOpen(true);
  };

  // 우편번호 검색 완료 핸들러
  const handleCompletePostcode = (data: any) => {
    setValue("postalCode", data.zonecode);
    setValue("address", data.address);
    setIsPostcodeModalOpen(false);
    
    // 주소를 좌표로 변환
    if (data.address) {
      geocodeAddress(data.address);
    }
  };

  // 모달 닫기 핸들러
  const handleClosePostcodeModal = () => {
    setIsPostcodeModalOpen(false);
  };

  const handleFormSubmit = (data: SecretsFormData) => {
    let processedData = { ...data };
    
    // 수정 모드에서 업데이트된 existingImageUrls state 사용 (기존 이미지 제거 반영)
    const currentExistingImages = mode === "edit" ? existingImageUrls : [];
    const hasExistingImages = currentExistingImages.length > 0;
      
    // 수정 모드에서 이미지를 새로 선택하지 않았고, 기존 이미지가 있다면 undefined (변경 없음)
    if (mode === "edit" && 
        (!processedData.image || (processedData.image instanceof FileList && processedData.image.length === 0)) &&
        hasExistingImages) {
      processedData.image = undefined; 
    } else if (processedData.image && processedData.image instanceof FileList && processedData.image.length === 0) {
      // 빈 FileList를 null로 변환 (명시적으로 이미지를 제거한 경우)
      processedData.image = null;
    }
    
    // 수정 모드에서 업데이트된 existingImageUrls를 함께 전달
    onSubmit(processedData, mode === "edit" ? existingImageUrls : undefined);
  };

  const titleText = mode === "create" ? "비밀 등록하기" : "비밀 수정하기";
  const submitButtonText = mode === "create" ? "등록하기" : "수정하기";

  return (
    <div className={styles.container} data-testid="secrets-form">
      {/* 카카오 지도 API 스크립트 로드 */}
      <Script
        src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_API_KEY}&libraries=services&autoload=false`}
        strategy="lazyOnload"
        onLoad={handleKakaoMapLoad}
      />
      
      <div className={styles.header}>
        <h1 className={styles.mainTitle}>{titleText}</h1>
      </div>

      <section className={styles.formSection}>
        <form onSubmit={handleSubmit(handleFormSubmit)} className={styles.form}>
          <div className={styles.formGrid}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>비밀명</label>
              <input
                {...register("title")}
                className={styles.input}
                placeholder="비밀의 제목을 입력하세요"
                data-testid="form-title"
              />
              {errors.title && (
                <span className={styles.error}>{errors.title.message}</span>
              )}
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>한줄 설명</label>
              <input
                {...register("description")}
                className={styles.input}
                placeholder="간단한 설명을 입력하세요"
                data-testid="form-description"
              />
              {errors.description && (
                <span className={styles.error}>{errors.description.message}</span>
              )}
            </div>

            <div className={styles.fieldGroupFull}>
              <label className={styles.label}>비밀 소개</label>
              <textarea
                {...register("intro")}
                className={styles.textarea}
                placeholder="이 비밀에 대해 자세히 소개해 주세요"
                data-testid="form-intro"
              />
              {errors.intro && (
                <span className={styles.error}>{errors.intro.message}</span>
              )}
            </div>

            <div className={styles.fieldRow}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>판매 가격</label>
                <input
                  {...register("price")}
                  className={styles.input}
                  placeholder="예: 10000"
                  inputMode="numeric"
                  data-testid="form-price"
                />
                {errors.price && (
                  <span className={styles.error}>{errors.price.message}</span>
                )}
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>태그 입력</label>
                <input
                  {...register("tags")}
                  className={styles.input}
                  placeholder="쉼표(,)로 구분하여 입력"
                  data-testid="form-tags"
                />
              </div>
            </div>

            <div className={styles.fieldGroupFull}>
              <label className={styles.label}>비밀과 관련된 주소</label>
              <div className={styles.addressRow}>
                <input
                  {...register("address")}
                  className={styles.input}
                  placeholder="주소"
                  data-testid="form-address"
                />
                <button
                  className={styles.secondaryButton}
                  type="button"
                  onClick={handlePostcodeSearch}
                  data-testid="form-address-search"
                >
                  주소 검색
                </button>
              </div>
              <div className={styles.fieldRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.labelSm}>우편번호</label>
                  <input
                    {...register("postalCode")}
                    className={styles.input}
                    placeholder="우편번호"
                    data-testid="form-postal-code"
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.labelSm}>상세 위치</label>
                  <input
                    {...register("addressDetail")}
                    className={styles.input}
                    placeholder="상세 주소"
                    data-testid="form-address-detail"
                  />
                </div>
              </div>
              <div className={styles.fieldRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.labelSm}>위도 (LAT)</label>
                  <input
                    {...register("latitude")}
                    className={styles.input}
                    placeholder="예: 37.5665"
                    inputMode="decimal"
                    data-testid="form-latitude"
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.labelSm}>경도 (LNG)</label>
                  <input
                    {...register("longitude")}
                    className={styles.input}
                    placeholder="예: 126.9780"
                    inputMode="decimal"
                    data-testid="form-longitude"
                  />
                </div>
              </div>
              
              {/* 카카오 지도 표시 영역 - 항상 렌더링하되, 지도 초기화는 조건부 */}
              <div className={styles.mapContainer}>
                <div id="map" className={styles.map}></div>
              </div>
            </div>

            <div className={styles.fieldGroupFull}>
              <label className={styles.label}>사진 첨부 (최대 3장)</label>
              <div className={styles.imagePreviewContainer}>
                {/* 기존 이미지 미리보기 */}
                {existingImageUrls.map((url, idx) => (
                  <div key={`existing-${idx}`} className={styles.imagePreview}>
                    <img src={url} alt={`기존 이미지 ${idx + 1}`} className={styles.previewImage} />
                    <button
                      type="button"
                      className={styles.removeImageButton}
                      onClick={() => handleRemoveImage(idx, true)}
                      data-testid={`form-image-remove-existing-${idx}`}
                    >
                      ✕
                    </button>
                  </div>
                ))}
                
                {/* 새로 선택한 이미지 미리보기 */}
                {previewUrls.map((url, idx) => (
                  <div key={`preview-${idx}`} className={styles.imagePreview}>
                    <img src={url} alt={`미리보기 ${idx + 1}`} className={styles.previewImage} />
                    <button
                      type="button"
                      className={styles.removeImageButton}
                      onClick={() => handleRemoveImage(idx, false)}
                      data-testid={`form-image-remove-preview-${idx}`}
                    >
                      ✕
                    </button>
                  </div>
                ))}
                
                {/* 이미지 업로드 박스 (3개 미만일 때만 표시) */}
                {(existingImageUrls.length + previewUrls.length) < 3 && (
                  <div
                    className={styles.uploadBox}
                    role="button"
                    onClick={handleImageClick}
                    data-testid="form-image-upload-box"
                  >
                    <span>클릭해서 사진 업로드 ({(existingImageUrls.length + previewUrls.length)}/3)</span>
                    <Controller
                      name="image"
                      control={control}
                      render={({ field }) => {
                        return (
                          <input
                            ref={(e) => {
                              fileInputRef.current = e;
                              field.ref(e); 
                            }}
                            onChange={(e) => {
                              const files = e.target.files;
                              
                              if (files && files.length > 0) {
                                // 최대 3개까지만 처리
                                const currentCount = existingImageUrls.length + (watchedImage?.length || 0);
                                const maxAllowed = 3 - currentCount;
                                const fileArray = Array.from(files).slice(0, maxAllowed);
                                
                                if (files.length > maxAllowed) {
                                  alert(`이미지는 최대 3장까지 업로드 가능합니다. (현재 ${currentCount}장, 추가 가능 ${maxAllowed}장)`);
                                }
                                
                                // fileArray를 사용해서 새로운 FileList 생성
                                const dataTransfer = new DataTransfer();
                                // 기존 파일 + 새로 선택된 파일 병합 (다중 선택 시 누적 처리)
                                const existingFiles = Array.from(watchedImage || []);
                                const allFiles = [...existingFiles, ...fileArray];

                                allFiles.forEach(file => dataTransfer.items.add(file));
                                const limitedFileList = dataTransfer.files;
                                
                                // 제한된 FileList를 field.onChange에 직접 저장 
                                field.onChange(limitedFileList);
                                
                                // 미리보기 업데이트
                                handleFileChange(limitedFileList);
                              } else {
                                field.onChange(null);
                                handleFileChange(null);
                              }
                            }}
                            name={field.name}
                            className={styles.fileInput}
                            type="file"
                            accept="image/*"
                            multiple
                            data-testid="form-image"
                            value="" 
                          />
                        );
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.ghostButton}
              onClick={onCancel}
              data-testid="form-cancel"
            >
              취소
            </button>
            <button
              type="submit"
              className={styles.primaryButton}
              data-testid="form-submit"
            >
              {submitButtonText}
            </button>
          </div>
        </form>

        {/* 우편번호 검색 모달 */}
        {isPostcodeModalOpen && (
          <div className={styles.modalOverlay} onClick={handleClosePostcodeModal}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3>우편번호 검색</h3>
                <button
                  type="button"
                  className={styles.closeButton}
                  onClick={handleClosePostcodeModal}
                >
                  ×
                </button>
              </div>
              <DaumPostcode
                onComplete={handleCompletePostcode}
                style={{ width: "100%", height: "400px" }}
              />
            </div>
          </div>
        )}
      </section>
    </div>
  );
}