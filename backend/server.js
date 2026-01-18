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
  origin: 'http://localhost:8080', // 프론트엔드 주소, "이 주소에서 오는 요청만 허락해줘"
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
      sameSite: 'lax'
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
