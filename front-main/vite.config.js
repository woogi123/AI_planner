import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // 백엔드 Spring Boot 애플리케이션으로 API 요청을 프록시합니다.
    proxy: {
      '/api': { // '/api'로 시작하는 모든 요청을 프록시합니다.
        target: 'http://spring.plannerai.kro.kr/', // 백엔드 서버 주소
        changeOrigin: true, // 대상 서버의 호스트 헤더를 변경합니다.
        // rewrite: (path) => path.replace(/^\/api/, ''), // '/api' 접두사를 제거하고 전달합니다.
      },
      // Calendar.jsx에서 /plans와 같이 /api 접두사 없이 직접 호출하는 경우를 위해 추가
      '/plans': {
        target: 'http://spring.plannerai.kro.kr/',
        changeOrigin: true,
      },
      '/chat': {
        target: 'http://fastapi.plannerai.kro.kr/',
        changeOrigin: true,
      },
      // 만약 다른 최상위 경로 API (예: /logout)가 있다면 여기에 추가합니다.
      // '/logout': {
      //   target: 'http://localhost:8099',
      //   changeOrigin: true,
      // },
    },
    // 프론트엔드 개발 서버가 사용할 포트 (기본값은 5173)
    port: 3000, // 필요에 따라 변경 가능
  },
});