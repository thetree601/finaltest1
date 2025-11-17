"use client";

import React from "react";
import styles from "./SecretContent.module.css";

export default function SecretContent({
	img,
	intro,
}: {
	img: string[] | null | undefined;
	intro: string;
}) {
	// img 배열 처리 (호환성 유지)
	const imageArray = Array.isArray(img) ? img : (img ? [img] : []);
	const isValidImg = imageArray.length > 0;
	
	return (
		<section className={styles.content} data-testid="secret-content">
			{isValidImg && (
				<div className={styles.imageWrap}>
					{/* 메인 이미지 */}
					<img 
						src={imageArray[0]} 
						alt="비밀 이미지" 
						className={styles.mainImage}
						onError={(e) => {
							console.error('이미지 로드 실패:', imageArray[0]);
							// 이미지 로드 실패 시 숨김 처리
							e.currentTarget.style.display = 'none';
						}}
					/>
					
					{/* 추가 이미지 썸네일 (2장 이상인 경우) */}
					{imageArray.length > 1 && (
						<div className={styles.thumbnailGrid}>
							{imageArray.slice(1).map((url, idx) => (
								<img 
									key={idx} 
									src={url} 
									alt={`비밀 이미지 ${idx + 2}`}
									className={styles.thumbnail}
									onError={(e) => {
										console.error('썸네일 이미지 로드 실패:', url);
										e.currentTarget.style.display = 'none';
									}}
								/>
							))}
						</div>
					)}
				</div>
			)}
			<article className={styles.intro}>
				{intro.split("\n\n").map((paragraph, idx) => (
					<p key={idx} className={styles.paragraph}>
						{paragraph}
					</p>
				))}
			</article>
		</section>
	);
}


