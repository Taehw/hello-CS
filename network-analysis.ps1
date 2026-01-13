# PowerShell용 네트워크 분석 스크립트
# Windows에서 실행

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🔍 네트워크 트래픽 분석 도구" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 메뉴 선택
Write-Host "어떤 방식으로 네트워크를 모니터링하시겠습니까?" -ForegroundColor Yellow
Write-Host ""
Write-Host "1) 모든 트래픽 캡처 (tcpdump - 기본)"
Write-Host "2) HTTP 트래픽만 캡처 (포트 3000)"
Write-Host "3) TCP Handshake만 캡처 (SYN, FIN 플래그)"
Write-Host "4) 상세한 HTTP 내용 보기 (ngrep)"
Write-Host "5) 실시간 연결 상태 보기 (netstat)"
Write-Host "6) 백엔드 로그 실시간 보기"
Write-Host "7) 프론트엔드 (Nginx) 로그 보기"
Write-Host ""
$choice = Read-Host "선택하세요 (1-7)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "📡 모든 네트워크 트래픽 캡처 중..." -ForegroundColor Green
        Write-Host "   (Ctrl+C로 중지)" -ForegroundColor Gray
        Write-Host ""
        docker exec -it network-monitor tcpdump -i any -nn -v
    }
    
    "2" {
        Write-Host ""
        Write-Host "📡 HTTP 트래픽 (포트 3000) 캡처 중..." -ForegroundColor Green
        Write-Host "   ASCII 형식으로 표시됩니다" -ForegroundColor Gray
        Write-Host "   (Ctrl+C로 중지)" -ForegroundColor Gray
        Write-Host ""
        docker exec -it network-monitor tcpdump -i any -nn -A 'port 3000'
    }
    
    "3" {
        Write-Host ""
        Write-Host "🤝 TCP Handshake 캡처 중..." -ForegroundColor Green
        Write-Host "   SYN, FIN, RST 플래그만 표시됩니다" -ForegroundColor Gray
        Write-Host "   (Ctrl+C로 중지)" -ForegroundColor Gray
        Write-Host ""
        docker exec -it network-monitor tcpdump -i any -nn 'tcp[tcpflags] & (tcp-syn|tcp-fin|tcp-rst) != 0'
    }
    
    "4" {
        Write-Host ""
        Write-Host "📝 HTTP 내용 상세 보기..." -ForegroundColor Green
        Write-Host "   요청과 응답 내용이 표시됩니다" -ForegroundColor Gray
        Write-Host "   (Ctrl+C로 중지)" -ForegroundColor Gray
        Write-Host ""
        docker exec -it network-monitor ngrep -q -W byline 'HTTP' 'port 3000'
    }
    
    "5" {
        Write-Host ""
        Write-Host "🔗 실시간 연결 상태..." -ForegroundColor Green
        Write-Host ""
        docker exec -it network-monitor sh -c "while true; do clear; netstat -an | grep 3000; sleep 1; done"
    }
    
    "6" {
        Write-Host ""
        Write-Host "📋 백엔드 로그 실시간 보기..." -ForegroundColor Green
        Write-Host "   (Ctrl+C로 중지)" -ForegroundColor Gray
        Write-Host ""
        docker logs -f login-backend
    }
    
    "7" {
        Write-Host ""
        Write-Host "📋 프론트엔드 (Nginx) 로그 보기..." -ForegroundColor Green
        Write-Host ""
        docker exec -it login-frontend tail -f /var/log/nginx/access.log
    }
    
    default {
        Write-Host "잘못된 선택입니다." -ForegroundColor Red
        exit 1
    }
}
