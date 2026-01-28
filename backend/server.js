const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const morgan = require('morgan');

const app = express(); //서버 객체 - 서버의 본체체
const PORT = 3000;

// ============================================
// 네트워크 로깅 미들웨어 (상세 HTTP 로그)
// ============================================
app.use((req, res, next) => { //app.use - 우리 서버에 이기능을 추가, 모든 요청은 해당 안의 코드를 거쳐감
  //(req, res, next) => {...}; - 함수임.
  //req - 요청 객체(사용자가 보낸정보보), res - 응답 객체(사용자에게 보낼 정보보), next - 다음 미들웨어 호출
  const timestamp = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }); // 한국 시간으로 표시
  console.log('\n' + '='.repeat(80));

  console.log(`[${timestamp}] 📥 수신된 HTTP 요청`);

  console.log('='.repeat(80)); //80개의 = 출력하는 문자열

  console.log(`방법: ${req.method}`);//요청 방법(GET, POST, PUT, DELETE 등)
  console.log(`경로: ${req.path}`); //요청 경로(예: /api/login)
  console.log(`프로토콜: ${req.protocol.toUpperCase()}`); //요청 프로토콜(HTTP/HTTPS)
  console.log(`호스트: ${req.get('host')}`); //요청 호스트(예: localhost:3000)
  console.log(`원격 주소: ${req.ip}`); //요청 주소(예: 127.0.0.1)

  console.log(`\n헤더:`); //헤더 출력

  //반복문: 헤더 정보를 쫘르륵 찍습니다.
  //Object.keys(req.headers) - 헤더 객체의 모든 키를 배열로 반환
  //forEach(key => {...}) - 배열의 각 요소에 대해 함수 실행
  //key - 헤더 키(예: 'Host', 'User-Agent', 'Content-Type' 등)
  //req.headers[key] - 헤더 값(예: 'localhost:3000', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36', 'application/json' 등)
  //console.log(`  ${key}: ${req.headers[key]}`); - 헤더 키와 값 출력 
  Object.keys(req.headers).forEach(key => {
    console.log(`  ${key}: ${req.headers[key]}`); //헤더 키와 값 출력
  });
  
  //프록시(Proxy) 패턴이나 AOP(Aspect Oriented Programming)
  //데이터를 클라이언트에게 보내기 직전 로그를 남기는 기능을 추가
  //res.send -> Express 내장함수 : 수정 불가
  // 응답 로깅 = 응답(Response) 가로채기
  const originalSend = res.send; //기존의 응답 본문 전송 함수 저장, 
  res.send = function(data) { //응답기능 재정의
    console.log(`\n📤 응답 전송`);
    console.log(`상태 코드: ${res.statusCode}`); //응답 상태 코드(200, 404, 500 등)
    console.log(`응답 헤더:`, res.getHeaders()); //응답 헤더 출력
    console.log(`응답 본문:`, typeof data === 'string' ? data.substring(0, 200) : data);
    //응답이 너무 많을때 출력을 줄이기 위해 200자만 출력 -> 이로인해 불필요한 정보보단 필요한 정보를 먼저확인가능능
    console.log('='.repeat(80) + '\n');
    originalSend.apply(res, arguments); //응답 본문 전송
  };
  
  next(); //다음 미들웨어 호출, 미들웨어 체인을 계속 진행
});

// Morgan으로 간단한 로그도 추가
//서버로 들어오는 요청(Request)에 대한 정보를 콘솔이나 파일에 자동으로 기록
//'combined': 로그를 어떤 형식으로 출력할지 결정하는 포맷(Format) 이름 - apache 서버의 표준과 동일, 상세한 정보를 담음음
app.use(morgan('combined'));

// CORS 설정 (프론트엔드와 백엔드가 다른 컨테이너)
app.use(cors({
  origin: [
    'http://localhost:8080', //로컬개발
    // ngrok frontend URL
    /\.ngrok-free\.dev$/,  // ← 추가 필요
    /\.ngrok\.io$/    // 모든 ngrok 도메인 허용
  ], // 프론트엔드 주소, "이 주소에서 오는 요청만 허락해줘"
  credentials: true // 쿠키 전송 허용
}));

//미들웨어 등록
app.use(express.json());
// -> 들어오는 데이터가 JSON이면 자바스크립트 객체(Dict)로 바꿔줘! (Java의 Jackson 같은 역할)
app.use(express.urlencoded({ extended: true }));
// -> 들어오는 데이터가 URL 인코딩 형식이면 자바스크립트 객체(Dict)로 바꿔줘! (Java의 Jackson 같은 역할)
app.use(cookieParser());
// -> 쿠키 파서: 쿠키 문자열을 자바스크립트 객체(Dict)로 바꿔줘! (Java의 Jackson 같은 역할)

// ============================================
// TCP 연결 정보 로깅
// ============================================

//app.listen(포트, 주소, 완료함수): "이 포트 번호로 귀를 열고 대기해라(Listen)."
//'0.0.0.0' - 모든 네트워크 인터페이스에서 접근 가능(외부에서 접근 가능)
//완료함수 - 서버가 시작되면 실행되는 함수
//console.log - 콘솔에 메시지 출력
//'\n' - 줄바꿈
//'🚀'.repeat(40) - 40개의 🚀 출력하는 문자열
//'\n' - 줄바꿈
//'✅ 백엔드 서버 시작됨' - 메시지
//'   포트: ${PORT}' - 포트 번호 출력
//'   주소: http://0.0.0.0:${PORT}' - 주소 출력
//'🚀'.repeat(40) - 40개의 🚀 출력하는 문자열
//'\n' - 줄바꿈

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('\n' + '🚀'.repeat(40));
  console.log(`✅ 백엔드 서버 시작됨`);
  console.log(`   포트: ${PORT}`);
  console.log(`   주소: http://0.0.0.0:${PORT}`);
  console.log('🚀'.repeat(40) + '\n');
}); //서버 시작 완료 

//HTTP보다 더 아래 단계인 TCP 연결을 감지하는 이벤트 리스너
server.on('connection', (socket) => { //'connection' 이벤트 발생 시 실행되는 함수
  //(socket) => {...}; - 함수임.
  //socket - 소켓 객체(네트워크 연결 정보)
  //3-Way Handshake가 끝나면 로그를 찍습니다.
  console.log('\n' + '🔌'.repeat(40)); 
  console.log('✅ 새로운 TCP 연결 수립 (3-Way Handshake 완료)'); 
  console.log(`   로컬 주소: ${socket.localAddress}:${socket.localPort}`);
  console.log(`   원격 주소: ${socket.remoteAddress}:${socket.remotePort}`);
  console.log('🔌'.repeat(40) + '\n');
  
  socket.on('close', (hadError) => {
    console.log('\n' + '🔚'.repeat(40));
    console.log('❌ TCP 연결 종료 (4-Way Handshake 시작)');
    console.log(`   에러 여부: ${hadError ? '예' : '아니오'}`);
    console.log('🔚'.repeat(40) + '\n');
  });
});
// ============================================
// 인증 미들웨어
// ============================================
function isAuthenticated(req, res, next) {
  console.log('🔐 인증 확인 중...');
  console.log('   쿠키:', req.cookies);
  
  if (req.cookies.sessionId) {
    console.log('✅ 인증 성공: 유효한 세션 쿠키 발견');
    next();
  } else {
    console.log('❌ 인증 실패: 세션 쿠키 없음');
    res.status(401).json({ 
      success: false, 
      message: '인증되지 않음. 로그인이 필요합니다.' 
    });
  }
}

// ============================================
// API 엔드포인트
// ============================================

// 1. 로그인 엔드포인트
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  console.log('\n🔑 로그인 시도');
  console.log(`   사용자명: ${username}`);
  console.log(`   비밀번호: ${'*'.repeat(password?.length || 0)}`);
  
  // 간단한 인증 (실제로는 DB 확인 필요)
  if (username === 'admin' && password === 'password') {
    // 세션 ID 생성 (실제로는 UUID 등 사용)
    const sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    console.log('✅ 로그인 성공!');
    console.log(`   생성된 세션 ID: ${sessionId}`);
    
    // 쿠키 설정
    res.cookie('sessionId', sessionId, {
      httpOnly: true,  // XSS 공격 방지
      maxAge: 24 * 60 * 60 * 1000, // 24시간
      sameSite: 'none',
      secure: true //HTTPS 사용 시 설정(ngrok은 HTTPS 사용용)
    });
    
    res.json({ 
      success: true, 
      message: '로그인 성공',
      username: username
    });
  } else {
    console.log('❌ 로그인 실패: 잘못된 자격 증명');
    res.status(401).json({ 
      success: false, 
      message: '사용자명 또는 비밀번호가 잘못되었습니다.' 
    });
  }
});

// 2. 인증이 필요한 메인 페이지 데이터
app.get('/api/main', isAuthenticated, (req, res) => {
  console.log('✅ 메인 페이지 데이터 제공');
  res.json({ 
    success: true, 
    message: 'Hello',
    data: {
      welcomeMessage: 'Hello! 로그인에 성공하셨습니다.',
      timestamp: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })
    }
  });
});

// 3. 로그아웃
app.post('/api/logout', (req, res) => {
  console.log('👋 로그아웃 요청');
  res.clearCookie('sessionId');
  res.json({ 
    success: true, 
    message: '로그아웃 되었습니다.' 
  });
});

// 4. 헬스체크
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })
  });
});

// ============================================
// 5. SSE (Server-Sent Events) 알림 엔드포인트
// ============================================
// SSE란?
// - 서버에서 클라이언트로 실시간 데이터를 push하는 기술
// - WebSocket과 달리 단방향 통신 (서버 → 클라이언트만)
// - HTTP 프로토콜 기반이라 방화벽 친화적
// - 자동 재연결 기능 내장
app.get('/api/notifications', isAuthenticated, (req, res) => {
  console.log('🔔 SSE 알림 연결 시작');
  
  // ----------------------------------------
  // SSE를 위한 HTTP 헤더 설정
  // ----------------------------------------
  
  // 1. Content-Type을 'text/event-stream'으로 설정
  // - 브라우저에게 "이건 SSE 스트림이야"라고 알려줌
  // - 일반 HTTP 응답과 다르게 연결을 계속 유지
  res.setHeader('Content-Type', 'text/event-stream');
  
  // 2. Cache-Control: 'no-cache'
  // - 프록시나 브라우저가 이 응답을 캐싱하지 못하게 함
  // - 실시간 데이터이므로 캐싱하면 안됨
  res.setHeader('Cache-Control', 'no-cache');
  
  // 3. Connection: 'keep-alive'
  // - TCP 연결을 계속 유지하라고 지시
  // - 일반 HTTP는 응답 후 연결을 끊지만, SSE는 연결 유지 필요
  res.setHeader('Connection', 'keep-alive');
  
  // 4. CORS 헤더 설정
  // - 프론트엔드(8080포트)에서 백엔드(3000포트)로의 접근 허용
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
  
  // 5. 쿠키 전송 허용 (인증을 위해 필요)
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // ----------------------------------------
  // 초기 연결 확인 메시지 전송
  // ----------------------------------------
  // SSE 데이터 형식:
  // data: {JSON 데이터}
  // (빈 줄 2개로 메시지 구분: \n\n)
  res.write('data: {"type":"connected","message":"알림 서비스에 연결되었습니다"}\n\n');
  
  // ----------------------------------------
  // 알림 카운터 초기화
  // ----------------------------------------
  let notificationCount = 0;
  
  // ----------------------------------------
  // 10초마다 알림 전송 (setInterval 사용)
  // ----------------------------------------
  const intervalId = setInterval(() => {
    // 카운터 증가
    notificationCount++;
    
    // 전송할 알림 데이터 생성
    const notification = {
      id: Date.now(),                  // 고유 ID (현재 시간의 밀리초)
      type: 'info',                     // 알림 타입 (info, success, warning, error)
      title: '새로운 알림',             // 알림 제목
      message: `${notificationCount}번째 알림입니다`,  // 알림 내용
      timestamp: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }), // 한국 시간
      count: notificationCount          // 알림 번호
    };
    
    // 서버 콘솔에 로그 출력
    console.log(`📤 알림 전송 (${notificationCount}번째):`, notification);
    
    // SSE 형식으로 클라이언트에게 데이터 전송
    // - data: 로 시작
    // - JSON.stringify로 객체를 문자열로 변환
    // - \n\n으로 메시지 종료 (중요!)
    res.write(`data: ${JSON.stringify(notification)}\n\n`);
  }, 10000); // 10000ms = 10초
  
  // ----------------------------------------
  // 클라이언트 연결 종료 처리
  // ----------------------------------------
  // 사용자가 브라우저를 닫거나 페이지를 이동하면 'close' 이벤트 발생
  req.on('close', () => {
    console.log('❌ SSE 연결 종료');
    
    // setInterval 정리 (메모리 누수 방지!)
    // - 타이머를 멈추지 않으면 서버 메모리를 계속 사용
    clearInterval(intervalId);
    
    // 응답 스트림 종료
    res.end();
  });
});

// 404 처리
app.use((req, res) => {
  console.log('❌ 404: 경로를 찾을 수 없음');
  res.status(404).json({ 
    success: false, 
    message: '요청한 경로를 찾을 수 없습니다.' 
  });
});

// 에러 처리
app.use((err, req, res, next) => {
  console.error('💥 서버 에러:', err);
  res.status(500).json({ 
    success: false, 
    message: '서버 내부 오류가 발생했습니다.',
    error: err.message 
  });
});
