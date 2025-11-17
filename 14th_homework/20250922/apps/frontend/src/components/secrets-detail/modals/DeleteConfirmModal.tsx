"use client";

import React from "react";
import styles from "./DeleteConfirmModal.module.css";

interface DeleteConfirmModalProps {
	onConfirm: () => void;
	onCancel: () => void;
}

export default function DeleteConfirmModal({
	onConfirm,
	onCancel,
}: DeleteConfirmModalProps) {
	return (
		<div className={styles.modalContent}>
			<h2 className={styles.title}>삭제 확인</h2>
			<p className={styles.message}>정말로 이 비밀을 삭제하시겠습니까?</p>
			<p className={styles.warning}>삭제된 비밀은 복구할 수 없습니다.</p>
			<div className={styles.buttons}>
				<button
					type="button"
					className={styles.confirmButton}
					onClick={onConfirm}
					data-testid="delete-confirm-button"
				>
					삭제하기
				</button>
				<button
					type="button"
					className={styles.cancelButton}
					onClick={onCancel}
					data-testid="delete-cancel-button"
				>
					취소
				</button>
			</div>
		</div>
	);
}


