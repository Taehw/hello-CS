# ⚡ 빠른 시작 가이드

## 🚀 5분 안에 시작하기

### 1단계: Docker 실행 확인

```bash
docker --version
docker-compose --version
```

### 2단계: 프로젝트 시작

프로젝트 폴더에서 실행:

```bash
docker-compose up --build
```

완료될 때까지 기다리세요 (약 1-2분)

### 3단계: 접속하기

브라우저에서 **http://localhost:8080** 열기

### 4단계: 로그인

```
사용자명: admin
비밀번호: password
```

### 5단계: 네트워크 로그 확인

**새 터미널**을 열고:

#### Windows:
```powershell
docker logs -f login-backend
```

#### Linux/Mac:
```bash
docker logs -f login-backend
```

---

## 📊 네트워크 분석 보기

### 방법 1: 백엔드 로그 (가장 쉬움)

```bash
docker logs -f login-backend
```

로그인을 시도하면 다음이 표시됩니다:
- 🔌 TCP 연결 수립
- 📥 HTTP POST /api/login
- 📤 HTTP 응답 + Set-Cookie
- 📥 HTTP GET /api/main (쿠키 포함)
- 🔌 TCP 연결 종료

### 방법 2: 브라우저 개발자 도구

1. **F12** 눌러서 개발자 도구 열기
2. **Network** 탭 선택
3. 로그인하고 요청 확인

### 방법 3: tcpdump (고급)

#### Windows:
```powershell
.\network-analysis.ps1
```

#### Linux/Mac:
```bash
chmod +x network-analysis.sh
./network-analysis.sh
```

---

## 🛑 중지하기

```bash
docker-compose down
```

---

## 🎯 무엇을 관찰해야 하나요?

### 로그인할 때:

1. **TCP 3-Way Handshake** (연결 수립)
   - 백엔드 로그에서 "새로운 TCP 연결 수립" 메시지 확인

2. **HTTP POST 요청** (로그인)
   - 요청 헤더, 본문 (username, password)
   - 응답에서 Set-Cookie 헤더

3. **HTTP GET 요청** (메인 페이지)
   - Cookie 헤더에 sessionId 포함
   - 200 OK 응답

4. **TCP 4-Way Handshake** (연결 종료)
   - "TCP 연결 종료" 메시지 확인

### 브라우저에서:

- **Network 탭**: 모든 HTTP 요청/응답
- **Application 탭 → Cookies**: sessionId 쿠키 확인

---

## 💡 팁

- 백엔드 로그는 **매우 상세**합니다 - 모든 HTTP 통신을 볼 수 있어요
- 프론트엔드 페이지 하단에도 **네트워크 로그**가 있습니다
- tcpdump는 **더 저수준**의 패킷을 봅니다

---

## ❓ 문제가 생기면?

### 포트가 사용 중입니다

```bash
# Windows
netstat -ano | findstr :3000
netstat -ano | findstr :8080

# Linux/Mac
lsof -i :3000
lsof -i :8080
```

해당 포트를 사용하는 프로세스를 종료하거나, `docker-compose.yml`에서 포트를 변경하세요.

### 컨테이너가 시작되지 않습니다

```bash
# 로그 확인
docker-compose logs

# 모든 것 정리하고 다시 시작
docker-compose down
docker system prune -a
docker-compose up --build
```

### 로그인이 작동하지 않습니다

1. 백엔드 로그 확인: `docker logs login-backend`
2. 브라우저 콘솔(F12) 에러 확인
3. CORS 에러인 경우: 브라우저에서 http://localhost:8080 으로 접속했는지 확인

---

## 📚 더 자세한 내용은?

**README.md** 파일을 읽어보세요 - 모든 것이 설명되어 있습니다!
