#!/bin/bash

# 네트워크 분석 스크립트
# TCP Handshake와 HTTP 통신을 모니터링합니다

echo "========================================"
echo "🔍 네트워크 트래픽 분석 도구"
echo "========================================"
echo ""

# 메뉴 선택
echo "어떤 방식으로 네트워크를 모니터링하시겠습니까?"
echo ""
echo "1) 모든 트래픽 캡처 (tcpdump - 기본)"
echo "2) HTTP 트래픽만 캡처 (포트 3000)"
echo "3) TCP Handshake만 캡처 (SYN, FIN 플래그)"
echo "4) 상세한 HTTP 내용 보기 (ngrep)"
echo "5) 실시간 연결 상태 보기 (netstat)"
echo ""
read -p "선택하세요 (1-5): " choice

case $choice in
  1)
    echo ""
    echo "📡 모든 네트워크 트래픽 캡처 중..."
    echo "   (Ctrl+C로 중지)"
    echo ""
    docker exec -it network-monitor tcpdump -i any -nn -v
    ;;
  
  2)
    echo ""
    echo "📡 HTTP 트래픽 (포트 3000) 캡처 중..."
    echo "   ASCII 형식으로 표시됩니다"
    echo "   (Ctrl+C로 중지)"
    echo ""
    docker exec -it network-monitor tcpdump -i any -nn -A 'port 3000'
    ;;
  
  3)
    echo ""
    echo "🤝 TCP Handshake 캡처 중..."
    echo "   SYN, FIN, RST 플래그만 표시됩니다"
    echo "   (Ctrl+C로 중지)"
    echo ""
    docker exec -it network-monitor tcpdump -i any -nn 'tcp[tcpflags] & (tcp-syn|tcp-fin|tcp-rst) != 0'
    ;;
  
  4)
    echo ""
    echo "📝 HTTP 내용 상세 보기..."
    echo "   요청과 응답 내용이 표시됩니다"
    echo "   (Ctrl+C로 중지)"
    echo ""
    docker exec -it network-monitor ngrep -q -W byline 'HTTP' 'port 3000'
    ;;
  
  5)
    echo ""
    echo "🔗 실시간 연결 상태..."
    echo ""
    docker exec -it network-monitor watch -n 1 'netstat -an | grep 3000'
    ;;
  
  *)
    echo "잘못된 선택입니다."
    exit 1
    ;;
esac
