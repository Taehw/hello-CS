const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
const PORT = 3000;

// ============================================
// 네트워크 로깅 미들웨어 (상세 HTTP 로그)
// ============================================
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log('\n' + '='.repeat(80));
  console.log(`[${timestamp}] 📥 수신된 HTTP 요청`);
  console.log('='.repeat(80));
  console.log(`방법: ${req.method}`);
  console.log(`경로: ${req.path}`);
  console.log(`프로토콜: ${req.protocol.toUpperCase()}`);
  console.log(`호스트: ${req.get('host')}`);
  console.log(`원격 주소: ${req.ip}`);
  console.log(`\n헤더:`);
  Object.keys(req.headers).forEach(key => {
    console.log(`  ${key}: ${req.headers[key]}`);
  });
  
  // 응답 로깅
  const originalSend = res.send;
  res.send = function(data) {
    console.log(`\n📤 응답 전송`);
    console.log(`상태 코드: ${res.statusCode}`);
    console.log(`응답 헤더:`, res.getHeaders());
    console.log(`응답 본문:`, typeof data === 'string' ? data.substring(0, 200) : data);
    console.log('='.repeat(80) + '\n');
    originalSend.apply(res, arguments);
  };
  
  next();
});

// Morgan으로 간단한 로그도 추가
app.use(morgan('combined'));

// CORS 설정 (프론트엔드와 백엔드가 다른 컨테이너)
app.use(cors({
  origin: 'http://localhost:8080', // 프론트엔드 주소
  credentials: true // 쿠키 전송 허용
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ============================================
// TCP 연결 정보 로깅
// ============================================
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('\n' + '🚀'.repeat(40));
  console.log(`✅ 백엔드 서버 시작됨`);
  console.log(`   포트: ${PORT}`);
  console.log(`   주소: http://0.0.0.0:${PORT}`);
  console.log('🚀'.repeat(40) + '\n');
});

server.on('connection', (socket) => {
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
      timestamp: new Date().toISOString()
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
    timestamp: new Date().toISOString() 
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
