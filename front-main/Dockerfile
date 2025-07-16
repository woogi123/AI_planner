# --- Stage 1: Build the React application ---
FROM node:20-alpine AS build-stage

WORKDIR /app

COPY package*.json ./
# yarn.lock 파일이 있다면 이 라인도 주석 해제하여 복사합니다.
# COPY yarn.lock ./

# 기존 node_modules 및 package-lock.json 제거 (깨끗한 설치를 위해)
RUN rm -rf node_modules package-lock.json

# 의존성 설치 (개발 의존성 포함)
# `npm cache clean --force`를 먼저 실행하여 캐시 문제를 방지합니다.
RUN npm cache clean --force && \
    NODE_OPTIONS="--max-old-space-size=4096" npm install --force

# 모든 소스 코드 복사 (dependencies 설치 후 복사하여 불필요한 재빌드 방지)
COPY . .

# React 애플리케이션 빌드
# 프로젝트에 맞는 실제 빌드 명령어로 변경해주세요.
# 예: npm run build 대신 `npm run dev` 또는 `yarn build` 등
RUN NODE_OPTIONS="--max-old-space-size=4096" npm run build

# --- Stage 2: Serve the built application with Nginx ---
FROM nginx:alpine AS production-stage

# Nginx 기본 설정 파일 제거
RUN rm /etc/nginx/conf.d/default.conf
# 사용자 정의 Nginx 설정 파일 복사
# nginx.conf 파일이 src/nginx/ 경로에 있으므로 해당 경로를 명시합니다.
COPY src/nginx/nginx.conf /etc/nginx/conf.d/my-app.conf

# 빌드 스테이지에서 빌드된 애플리케이션 파일을 Nginx 서빙 디렉토리로 복사
# Vite의 기본 빌드 출력 경로는 'dist'입니다.
# 만약 build 스크립트나 vite.config.js에서 변경했다면 해당 경로로 수정하세요.
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Nginx가 수신할 포트 설정
EXPOSE 80
# Nginx를 포그라운드에서 실행하여 컨테이너가 계속 실행되도록 함
CMD ["nginx", "-g", "daemon off;"]