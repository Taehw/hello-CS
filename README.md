# 🐳 Docker 기반 로그인 및 네트워크 분석 프로젝트

## 📋 프로젝트 개요

이 프로젝트는 **Docker 컨테이너**를 사용하여 프론트엔드와 백엔드를 분리하고, 
**쿠키 기반 인증 시스템**을 구현하며, **네트워크 통신 과정**(HTTP, TCP Handshake)을 
실시간으로 모니터링하고 분석할 수 있는 학습용 프로젝트입니다.

---

## 🎯 학습 목표

1. **Docker 컨테이너** 간 통신 이해
2. **쿠키 기반 인증** 메커니즘 학습
3. **TCP 3-Way/4-Way Handshake** 실제 관찰
4. **HTTP 통신 과정** 상세 분석
5. 네트워크 패킷 분석 도구 활용 (tcpdump, ngrep)

---

## 🏗️ 프로젝트 구조

```
helloCS/
├── backend/                    # 백엔드 서버 (Node.js + Express)
│   ├── server.js              # 메인 서버 코드 (상세한 로깅 포함)
│   ├── package.json           # Node.js 의존성
│   └── Dockerfile             # 백엔드 Docker 이미지 설정
│
├── frontend/                   # 프론트엔드 (HTML + Nginx)
│   ├── login.html             # 로그인 페이지
│   ├── main.html              # 메인 페이지 (인증 필요)
│   ├── nginx.conf             # Nginx 설정
│   └── Dockerfile             # 프론트엔드 Docker 이미지 설정
│
├── docker-compose.yml         # Docker Compose 설정
├── network-analysis.sh        # 네트워크 분석 스크립트 (Linux/Mac)
├── network-analysis.ps1       # 네트워크 분석 스크립트 (Windows)
└── README.md                  # 이 파일
```

---

## 🚀 실행 방법

### 1️⃣ 사전 요구사항

- **Docker Desktop** 설치 필요
- Windows, macOS, Linux 모두 지원

### 2️⃣ 프로젝트 시작

프로젝트 루트 디렉토리에서 다음 명령어를 실행하세요:

```bash
# Docker Compose로 모든 컨테이너 시작
docker-compose up --build
```

또는 백그라운드에서 실행:

```bash
docker-compose up -d --build
```

### 3️⃣ 접속 주소

- **프론트엔드 (로그인 페이지)**: http://localhost:8080
- **백엔드 API**: http://localhost:3000

### 4️⃣ 테스트 계정

```
사용자명: admin
비밀번호: password
```

---

## 🔍 네트워크 분석 방법

### 방법 1: 백엔드 로그 확인 (가장 간단)

백엔드 서버에는 **상세한 HTTP 로깅**이 구현되어 있습니다.

```bash
# 백엔드 로그 실시간 보기
docker logs -f login-backend
```

**확인할 수 있는 정보:**
- ✅ TCP 연결 수립 (3-Way Handshake)
- 📥 HTTP 요청 (메서드, 경로, 헤더, 쿠키)
- 📤 HTTP 응답 (상태 코드, 헤더)
- ❌ TCP 연결 종료 (4-Way Handshake)

### 방법 2: 웹 브라우저 개발자 도구

1. 크롬/엣지에서 `F12` 눌러 개발자 도구 열기
2. **Network 탭** 선택
3. 로그인 시도 후 요청/응답 확인
4. **Cookies 탭**에서 `sessionId` 쿠키 확인

### 방법 3: tcpdump를 사용한 패킷 캡처

#### Windows (PowerShell):

```powershell
# 스크립트 실행
.\network-analysis.ps1
```

#### Linux/Mac:

```bash
# 스크립트 실행 권한 부여
chmod +x network-analysis.sh

# 스크립트 실행
./network-analysis.sh
```

#### 수동으로 tcpdump 실행:

```bash
# 1. 모든 트래픽 캡처
docker exec -it network-monitor tcpdump -i any -nn -v

# 2. HTTP 트래픽만 (포트 3000)
docker exec -it network-monitor tcpdump -i any -nn -A 'port 3000'

# 3. TCP Handshake만 (SYN, FIN 플래그)
docker exec -it network-monitor tcpdump -i any -nn 'tcp[tcpflags] & (tcp-syn|tcp-fin|tcp-rst) != 0'

# 4. HTTP 내용 상세 보기
docker exec -it network-monitor ngrep -q -W byline 'HTTP' 'port 3000'
```

---

## 📊 관찰해야 할 네트워크 이벤트

### 1️⃣ TCP 3-Way Handshake (연결 수립)

```
클라이언트 → 서버: SYN (연결 요청)
서버 → 클라이언트: SYN-ACK (연결 수락)
클라이언트 → 서버: ACK (확인)
```

**관찰 방법:**
```bash
docker exec -it network-monitor tcpdump -i any -nn 'tcp[tcpflags] & tcp-syn != 0'
```

### 2️⃣ HTTP POST 요청 (로그인)

```http
POST /api/login HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{"username":"admin","password":"password"}
```

**관찰 방법:**
- 백엔드 로그 확인
- 브라우저 개발자 도구 Network 탭

### 3️⃣ HTTP 응답 + Set-Cookie 헤더

```http
HTTP/1.1 200 OK
Set-Cookie: sessionId=session_1234567890_abc123; Path=/; HttpOnly
Content-Type: application/json

{"success":true,"message":"로그인 성공"}
```

### 4️⃣ 쿠키를 포함한 인증된 요청

```http
GET /api/main HTTP/1.1
Host: localhost:3000
Cookie: sessionId=session_1234567890_abc123
```

### 5️⃣ TCP 4-Way Handshake (연결 종료)

```
클라이언트 → 서버: FIN (종료 요청)
서버 → 클라이언트: ACK (확인)
서버 → 클라이언트: FIN (종료 요청)
클라이언트 → 서버: ACK (확인)
```

**관찰 방법:**
```bash
docker exec -it network-monitor tcpdump -i any -nn 'tcp[tcpflags] & tcp-fin != 0'
```

---

## 🧪 테스트 시나리오

### 시나리오 1: 정상 로그인 플로우

1. **http://localhost:8080** 접속
2. 올바른 계정으로 로그인 (`admin` / `password`)
3. "Hello" 메시지가 표시되는 메인 페이지로 이동
4. 백엔드 로그에서 다음 확인:
   - TCP 연결 수립
   - POST /api/login 요청
   - Set-Cookie 응답
   - GET /api/main 요청 (쿠키 포함)
   - TCP 연결 종료

### 시나리오 2: 로그인 실패

1. 잘못된 계정으로 로그인 시도
2. 401 Unauthorized 응답 확인
3. 에러 메시지 표시 확인

### 시나리오 3: 인증 없이 메인 페이지 접근

1. 쿠키 없이 직접 **http://localhost:8080/main.html** 접속
2. 401 응답 받고 로그인 페이지로 리다이렉트
3. "인증되지 않음" 메시지 확인

---

## 🎓 학습 포인트 정리

### 1. Docker 컨테이너 네트워킹

- **브릿지 네트워크**: `app-network`를 통해 컨테이너 간 통신
- **포트 매핑**: 호스트의 8080 → 프론트엔드 80, 호스트의 3000 → 백엔드 3000
- **서비스 디스커버리**: docker-compose에서 서비스 이름으로 통신

### 2. 쿠키 기반 인증

- **HttpOnly 플래그**: JavaScript에서 쿠키 접근 불가 (XSS 방지)
- **SameSite 속성**: CSRF 공격 방지
- **쿠키 전송**: `credentials: 'include'` 옵션 필요

### 3. TCP/IP 프로토콜

- **3-Way Handshake**: 신뢰할 수 있는 연결 수립
- **4-Way Handshake**: 정상적인 연결 종료
- **상태 머신**: LISTEN → SYN-RECEIVED → ESTABLISHED → FIN-WAIT → CLOSED

### 4. HTTP 프로토콜

- **요청 메서드**: GET (조회), POST (생성/로그인)
- **상태 코드**: 200 (성공), 401 (인증 필요), 404 (없음)
- **헤더**: Content-Type, Cookie, Set-Cookie
- **CORS**: 다른 출처 간 리소스 공유

---

## 🛠️ 유용한 Docker 명령어

```bash
# 모든 컨테이너 상태 확인
docker-compose ps

# 특정 컨테이너 로그 보기
docker logs login-backend
docker logs login-frontend
docker logs network-monitor

# 실시간 로그 스트리밍
docker logs -f login-backend

# 컨테이너 내부 접속
docker exec -it login-backend sh
docker exec -it network-monitor bash

# 컨테이너 중지 및 제거
docker-compose down

# 볼륨까지 완전 삭제
docker-compose down -v

# 이미지 재빌드 (코드 수정 후)
docker-compose up --build
```

---

## 📝 과제 제출 체크리스트

- [ ] 프로젝트가 정상적으로 실행되는가?
- [ ] 로그인 기능이 작동하는가?
- [ ] 로그인 성공 시 "Hello" 메시지가 표시되는가?
- [ ] 로그인 실패 시 에러 처리가 되는가?
- [ ] 백엔드 로그에서 HTTP 통신을 확인했는가?
- [ ] TCP 3-Way Handshake를 관찰했는가?
- [ ] TCP 4-Way Handshake를 관찰했는가?
- [ ] 쿠키가 올바르게 설정되고 전송되는가?
- [ ] 네트워크 패킷을 캡처해봤는가? (tcpdump)

---

## 💡 추가 학습 자료

### TCP/IP 이해하기

- **3-Way Handshake**: 클라이언트와 서버가 연결을 수립하는 과정
- **4-Way Handshake**: 연결을 정상적으로 종료하는 과정
- **패킷**: 네트워크를 통해 전송되는 데이터의 단위

### HTTP 프로토콜

- **Stateless**: HTTP는 상태를 유지하지 않음 (쿠키/세션으로 보완)
- **요청-응답 모델**: 클라이언트가 요청하면 서버가 응답
- **헤더와 바디**: 메타데이터(헤더) + 실제 데이터(바디)

### Docker 네트워킹

- **브릿지 네트워크**: 기본 네트워크 모드, 같은 네트워크의 컨테이너끼리 통신 가능
- **DNS**: 컨테이너 이름으로 다른 컨테이너에 접근 가능
- **격리**: 각 컨테이너는 독립적인 네트워크 스택을 가짐

---

## 🐛 문제 해결 (Troubleshooting)

### 문제: 컨테이너가 시작되지 않음

```bash
# 로그 확인
docker-compose logs

# 포트가 이미 사용 중인지 확인 (Windows)
netstat -ano | findstr :3000
netstat -ano | findstr :8080

# 기존 컨테이너 정리
docker-compose down
docker system prune -a
```

### 문제: CORS 에러 발생

- `backend/server.js`에서 CORS origin 확인
- 프론트엔드 주소가 `http://localhost:8080`인지 확인

### 문제: 쿠키가 저장되지 않음

- `credentials: 'include'` 옵션 확인 (frontend)
- CORS 설정에서 `credentials: true` 확인 (backend)
- 브라우저 개발자 도구 → Application → Cookies 확인

### 문제: network-monitor 컨테이너 접근 불가

```bash
# 컨테이너 상태 확인
docker ps -a | grep network-monitor

# 컨테이너 재시작
docker restart network-monitor

# 직접 tcpdump 실행
docker exec -it network-monitor tcpdump -i any -nn
```

---

## 📅 제출 기한

**2026년 1월 24일(토)**까지 제출

---

## 🎉 완성!

이제 Docker 기반 로그인 시스템과 네트워크 분석 환경이 구축되었습니다!

**다음 단계:**

1. `docker-compose up --build` 실행
2. http://localhost:8080 접속
3. 로그인 테스트
4. 백엔드 로그 확인 (`docker logs -f login-backend`)
5. 네트워크 패킷 분석 (`.\network-analysis.ps1` 또는 `./network-analysis.sh`)
6. 브라우저 개발자 도구로 HTTP 요청/응답 확인

**질문이나 문제가 있다면 README를 다시 읽어보세요!** 🚀
