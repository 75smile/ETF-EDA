# ETF Scope

네이버 금융 ETF 목록 API를 실시간으로 조회해 운용사, 시장, 상품 유형별로 분석하는 단일 HTML 대시보드입니다. 화면의 HTML, CSS, JavaScript는 모두 `index.html` 한 파일에 포함되어 있습니다.

## 주요 기능

- 60초 주기 데이터 자동 갱신 및 수동 새로고침
- 운용사·시장·상품 유형 필터와 종목명·종목코드 검색
- 시장 구성, 운용사 순위, 상품 유형, 당일 등락 분석
- 정렬과 페이지네이션을 지원하는 전체 ETF 조회
- 데스크톱·모바일 반응형 화면
- CSS와 JavaScript를 내장한 단일 `index.html`

## 로컬 실행

```powershell
cd dashboard
node scripts/preview.mjs
```

브라우저에서 `http://127.0.0.1:4173`에 접속합니다.

## 빌드

```powershell
cd dashboard
node build.mjs
```

배포용 Cloudflare Worker가 `dist/server/index.js`에 생성됩니다. Worker의 `/api/etfs` 경로가 네이버 API를 프록시하므로 브라우저 CORS 제한 없이 실시간 데이터를 조회할 수 있습니다.

> 운용사는 상품명 브랜드를 기준으로 분류합니다. 본 대시보드는 정보 제공 목적이며 투자 권유가 아닙니다.

