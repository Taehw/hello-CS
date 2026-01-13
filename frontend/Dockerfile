# Nginx를 사용한 프론트엔드 Dockerfile
FROM nginx:alpine

# HTML 파일들을 Nginx 웹 루트로 복사
COPY *.html /usr/share/nginx/html/

# Nginx 설정 파일 복사
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 포트 노출
EXPOSE 80

# Nginx 시작
CMD ["nginx", "-g", "daemon off;"]
