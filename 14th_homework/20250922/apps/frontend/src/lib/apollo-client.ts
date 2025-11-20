import {
  ApolloClient,
  InMemoryCache,
  from,
} from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import createUploadLink from "apollo-upload-client/createUploadLink.mjs";
import { setContext } from "@apollo/client/link/context";
import { authManager } from "@/lib/auth";

const uploadLink = createUploadLink({
  uri: "https://main-practice.codebootcamp.co.kr/graphql",
  credentials: "include",
});

// 인증 헤더를 추가하는 링크
const authLink = setContext((_, { headers }) => {
  // authManager에서 토큰 가져오기 전에 초기화
  authManager.initializeToken();
  const token = authManager.getToken();
  
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  }
});

// 에러 처리 링크 - 토큰 만료 시 처리
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, extensions }) => {
      // UNAUTHENTICATED 에러 처리 (토큰 만료 등)
      if (extensions?.code === 'UNAUTHENTICATED' || message.includes('토큰 만료')) {
        console.warn('인증 토큰이 만료되었습니다.');
        
        // 토큰 제거
        authManager.clearToken();
      }
    });
  }

  if (networkError) {
    console.error('네트워크 에러:', networkError);
  }
});

export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, uploadLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: "all",
    },
    query: {
      errorPolicy: "all",
    },
  },
});

