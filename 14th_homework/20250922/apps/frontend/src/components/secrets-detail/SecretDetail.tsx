"use client";

import React from "react";
import styles from "./SecretDetail.module.css";
import SecretHeader from "./SecretHeader";
import SecretContent from "./SecretContent";
import SecretActions from "./SecretActions";
import SecretGeo from "./SecretGeo";
import SecretComments from "./SecretComments";

export type SecretDetailData = {
	id: string;
	title: string;
	description: string;
	img: string[] | null; // 이미지 배열로 변경
	tags: string[];
	intro: string;
	price: number;
	address?: string;
	postalCode?: string;
	addressDetail?: string;
	latitude?: string;
	longitude?: string;
};

export default function SecretDetail({ data }: { data: SecretDetailData }) {
	const handleDelete = () => {
		// 삭제 후 목록 페이지로 리다이렉트
		window.location.href = "/secrets";
	};

	return (
		<div className={styles.container} data-testid="secret-detail">
			<SecretHeader
				title={data.title}
				description={data.description}
				tags={data.tags}
				secretId={data.id}
				onDelete={handleDelete}
			/>
			<div className={styles.main}>
				<SecretContent img={data.img} intro={data.intro} />
				<div className={styles.side}>
					<SecretActions price={data.price} />
					<SecretGeo
						address={data.address}
						postalCode={data.postalCode}
						addressDetail={data.addressDetail}
						latitude={data.latitude}
						longitude={data.longitude}
					/>
				</div>
			</div>
			<SecretComments />
		</div>
	);
}


