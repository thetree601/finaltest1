"use client";

import { useMutation, useQuery } from "@apollo/client";
import { useRouter } from "next/navigation";
import { LIKE_BOARD, DISLIKE_BOARD, FETCH_BOARD_DETAIL } from "./queries";
import type { BoardsDetailProps } from "./types";

export function useBoardsDetail(props: BoardsDetailProps) {
  const router = useRouter();
  const { data, loading, error } = useQuery(FETCH_BOARD_DETAIL, {
    variables: { boardId: props.boardId },
  });

  const [likeBoard] = useMutation(LIKE_BOARD, {
    optimisticResponse: {
      likeBoard: (data?.fetchBoard?.likeCount ?? 0) + 1,
    },
    update: (cache, { data: mutationData }) => {
      // 캐시에서 현재 게시글 데이터 읽기
      const existingData = cache.readQuery({
        query: FETCH_BOARD_DETAIL,
        variables: { boardId: props.boardId },
      });

      if (existingData?.fetchBoard) {
        // 캐시 업데이트: 좋아요 수 증가
        cache.writeQuery({
          query: FETCH_BOARD_DETAIL,
          variables: { boardId: props.boardId },
          data: {
            fetchBoard: {
              ...existingData.fetchBoard,
              likeCount: mutationData?.likeBoard ?? existingData.fetchBoard.likeCount + 1,
            },
          },
        });
      }
    },
    onError: (error) => {
      console.error("좋아요 처리 중 오류 발생:", error);
      // 에러 발생 시 캐시를 원래 상태로 롤백하기 위해 refetch
      // Apollo Client가 자동으로 롤백하지만, 명시적으로 refetch하여 확실히 함
    },
  });

  const [dislikeBoard] = useMutation(DISLIKE_BOARD, {
    optimisticResponse: {
      dislikeBoard: (data?.fetchBoard?.dislikeCount ?? 0) + 1,
    },
    update: (cache, { data: mutationData }) => {
      // 캐시에서 현재 게시글 데이터 읽기
      const existingData = cache.readQuery({
        query: FETCH_BOARD_DETAIL,
        variables: { boardId: props.boardId },
      });

      if (existingData?.fetchBoard) {
        // 캐시 업데이트: 싫어요 수 증가
        cache.writeQuery({
          query: FETCH_BOARD_DETAIL,
          variables: { boardId: props.boardId },
          data: {
            fetchBoard: {
              ...existingData.fetchBoard,
              dislikeCount: mutationData?.dislikeBoard ?? existingData.fetchBoard.dislikeCount + 1,
            },
          },
        });
      }
    },
    onError: (error) => {
      console.error("싫어요 처리 중 오류 발생:", error);
      // 에러 발생 시 캐시를 원래 상태로 롤백하기 위해 refetch
      // Apollo Client가 자동으로 롤백하지만, 명시적으로 refetch하여 확실히 함
    },
  });

  const onClickMoveToEdit = () => {
    router.push(`/boards/${props.boardId}/edit`);
  };

  const onClickMoveToList = () => {
    // 이전 페이지 정보가 있으면 해당 페이지로, 없으면 기본 목록 페이지로
    if (props.fromParams) {
      router.push(`/boards?${props.fromParams}`);
    } else {
      router.push('/boards');
    }
  };

  const onClickLike = async () => {
    try {
      await likeBoard({ variables: { boardId: props.boardId } });
    } catch (e) {
      console.error(e);
    }
  };

  const onClickDislike = async () => {
    try {
      await dislikeBoard({ variables: { boardId: props.boardId } });
    } catch (e) {
      console.error(e);
    }
  };

  return {
    data,
    loading,
    error,
    onClickMoveToEdit,
    onClickMoveToList,
    onClickLike,
    onClickDislike,
  };
}


