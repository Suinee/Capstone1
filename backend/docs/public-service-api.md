# 공공서비스 모의 신청 시연

`suin` 브랜치에서 실행합니다. 실제 정부기관 접수·증명서 발급은 하지 않습니다.
주민등록등본/초본, 전입신고, 가족관계증명서 계열, 납세증명의 신청 결과를
기존 SQLite DB의 `public_application` 테이블에 저장합니다. 메뉴 및 망설임 로그는 변경하지 않습니다.

## 실행 (Windows PowerShell, 별도 터미널 두 개)

Java 21을 설치하고 `java -version`으로 확인합니다.

```powershell
cd backend
.\gradlew.bat test
.\gradlew.bat bootRun
```

```powershell
cd frontend
npm install
npm run test:public-service
npm run dev
```

http://localhost:5173/public-service 에서 서비스를 선택해 신청합니다.
모든 필수 선택을 마친 후 신청하면 서버 저장 성공 뒤에만 완료/내역 화면으로 이동합니다.
가족관계증명은 같은 화면에 접수번호를 표시합니다. 상단 신청내역에서 네 서비스의 결과를 조회하고,
날짜·민원명으로 필터링하거나 체험 확인서를 미리보기·인쇄할 수 있습니다.
백엔드는 반드시 backend 폴더를 작업 디렉터리로 실행합니다 (`./mydb.sqlite`).
테이블은 최초 실행 시 자동 생성됩니다. 별도 SQL 실행이나 DB 파일 교체는 필요 없습니다.

## API

- `POST /api/public-service/applications`
- `GET /api/public-service/applications?sessionId=<UUID>`

POST 예시:
```json
{
  "requestId": "5e737f58-96dc-4b9b-9488-616bab365515",
  "sessionId": "837ec66a-0356-4f96-a12d-829f7f4c5d53",
  "serviceCode": "moving-in-report",
  "name": "전입신고"
}
```

서비스 코드는 `resident-registration`, `moving-in-report`, `family-relationship`, `tax-payment`입니다.
서비스명은 화면에서 제공하는 허용 목록과 일치해야 합니다. 신청 번호와 한국 시간 기준 접수시각은 서버가 생성합니다.
응답에는 `requestId`, `receiptNo`, `receivedAt`, `serviceCode`, `name`, `count`, `status`가 포함됩니다.
동일 requestId와 동일 내용 재전송은 같은 접수 결과를 반환합니다. 다른 내용/세션으로 재사용하면 409,
잘못된 식별자나 서비스는 400을 반환합니다. 통신 실패 후 재시도는 기존 요청 ID를 사용합니다.

주소·전화번호·주민번호·가족 정보 등 입력 원문은 API로 보내지 않습니다.
선택 상세값 전체 저장이나 실제 민원 처리가 아닌, 모의 신청 완료 결과 저장 범위입니다.
신청 기록은 DB에 유지되고, 프론트의 sessionStorage에는 익명 세션 ID와 실패 요청 ID만 보관합니다.
같은 탭에서는 새로고침/서버 재시작 후에도 조회됩니다. 탭 종료 등으로 세션 ID를 잃으면 기존 기록이
자동 복원되지 않습니다. 세션 ID는 로그인 인증을 대체하지 않으며 로컬 시연용입니다.

API 기본 주소는 `http://localhost:8080`이며 프론트 `VITE_API_BASE_URL`로 바꿀 수 있습니다.
CORS 허용 주소는 기존 API와 동일한 `http://localhost:5173`입니다.

## 검증

- 백엔드 `PublicApplicationApiTests`: 네 서비스 저장, 별도 DB 연결 조회, 세션 분리,
  재전송 중복 방지, 충돌 및 잘못된 요청 거부.
- 프론트 `npm run test:public-service`: 실패 후 같은 ID 재시도, 새 신청 ID 발급,
  조회 세션 유지, HTTP 오류 처리, 전송 필드 확인.
- 수동: 각 서비스 신청 → 내역 → 새로고침 → 동일 기록 확인.
- 수동: 서버 정지 상태로 신청 → 오류 표시 및 화면 유지 → 서버 재시작 후 재시도.

공공서비스 망설임 감지·단계별 도움 UI 연결은 별도 프론트 작업입니다.
이 커밋은 모의 신청·조회 백엔드와 네 서비스 화면의 API 연결을 제공합니다.
