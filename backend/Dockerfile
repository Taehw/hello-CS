# Node.js 백엔드 Dockerfile
FROM node:18-alpine 
# 처음에는 baseImage로 시작해야함
# node에서 미리 설치된 이미지를 사용함 (baseImage)
# 18-alpine은 node.js 18버전을 사용하고, alpine은 작은 이미지를 사용함
# 이미지 이름: node:18-alpine
# 이미지 크기: 127MB

WORKDIR /app 
#WORKDIR 명령어는 컨테니어 안에서 실행할 디렉토리를 지정함

# 패키지 파일 복사 및 설치
COPY package*.json ./
RUN npm install

# 소스 코드 복사
COPY . .

# 포트 노출
EXPOSE 3000

# 서버 시작
CMD ["npm", "start"]