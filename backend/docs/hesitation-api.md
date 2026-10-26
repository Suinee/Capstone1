# 망설임 로그 저장·조회 API (v1)

기존 Spring Boot 4 / SQLite 백엔드에 추가한 API이다. 프론트 `scoreEngine.getLogs()`의
각 객체를 변환하지 않고 `{ "logs": [...] }`로 감싸서 전송한다.
현재 Provider가 생성하는 sessionId를 한 엔진 세션으로 취급한다. 체험 시작·종료의
구분은 팀원의 화면 연결 단계에서 정하며, 이 API는 세션 생성/종료를 추측하지 않는다.

## 공통 데이터 계약

| 필드 | 형식 | 의미 |
| --- | --- | --- |
| logId | 문자열 | `sessionId:log:양의정수` 형태의 고유 ID. 순번은 앞자리 0 없이 사용 |
| sessionId | 소문자 UUID | 프론트 엔진 세션 ID |
| screenId | 문자열 또는 null | 화면 종류. 최대 128자 |
| screenVisitId | 소문자 UUID 또는 null | 같은 화면 재방문을 구분하는 ID |
| type | 문자열 | 아래의 로그 유형 |
| activeTime | 0 이상의 유한한 숫자 | 엔진이 누적한 활성 시간(ms), 소수 허용. 서버가 다시 계산하지 않음 |
| recordedAt | 0 이상의 64비트 정수 | 브라우저 Date.now() 값, Unix epoch ms |
| ruleVersion | 문자열 | 적용한 규칙 버전, 최대 64자 |

모든 공통 필드는 반드시 보내야 한다. 화면 등록 전 기록을 위해 screenId와
screenVisitId는 **둘 다 null**을 허용한다. 추가 필드는 중첩 구조까지 원문 JSON으로
보존한다. 서버는 공통 필드를 검증하며 상세 이벤트별 필수 항목까지는 검증하지 않는다.

| type | 현재 엔진이 보내는 추가 필드 |
| --- | --- |
| screen_enter | task |
| screen_exit | finalScore |
| behavior | event (실제 행동은 event.type: click, hover_enter, pointer_move 등) |
| judgment | groupId, signals, addedScore, score, level |
| task_change | task |
| measurement_state | reason, paused |
| help | helpScreenVisitId, status, level, targetId, reason |

입력값 원문이나 개인 식별정보를 추가하지 않는다. 기존 수집기는 입력 행동 유형만 기록한다.

## 저장

`POST /api/hesitation/logs` / `Content-Type: application/json`

```json
{
  "logs": [
    {
      "logId": "123e4567-e89b-42d3-a456-426614174000:log:1",
      "sessionId": "123e4567-e89b-42d3-a456-426614174000",
      "screenId": null,
      "screenVisitId": null,
      "type": "measurement_state",
      "activeTime": 0,
      "recordedAt": 1793000000000,
      "ruleVersion": "initial-1.0",
      "reason": "documentHidden",
      "paused": true
    }
  ]
}
```

성공(HTTP 200):

```json
{"received":1,"inserted":1,"duplicates":0}
```

- 요청당 1~1000개, 로그 하나당 직렬화한 UTF-8 JSON 64 KiB 이하.
- 동일 logId와 동일 내용 재전송은 중복으로 집계하고 성공 처리한다.
- 동일 logId에 다른 내용은 HTTP 409, 해당 요청 전체 롤백.
- 필수 필드 누락/잘못된 값/빈 배열/허용하지 않은 type은 HTTP 400, 전체 미저장.
- 입력 순서가 뒤섞이거나 여러 세션이 한 요청에 있어도 저장 가능하다.
- HTTP 2xx를 받은 묶음만 전송 완료로 처리한다. 실패한 요청은 동일 ID와 내용으로 재전송한다.
- 프론트 전송 코드 자체는 이번 백엔드 작업에 포함하지 않았다.

## 조회

`GET /api/hesitation/sessions/{sessionId}/logs?afterSequence=0&limit=1000`

```json
{
  "sessionId":"123e4567-e89b-42d3-a456-426614174000",
  "logs":[],
  "hasMore":false,
  "nextAfterSequence":null
}
```

- afterSequence: 제외할 마지막 로그 순번(기본 0). limit: 1~1000(기본 1000).
- 세션 안에서 로그 순번 **숫자 오름차순**. 2 다음에 10이 오며 클라이언트 시계 변경에 영향받지 않는다.
- logs에는 POST로 저장한 객체가 그대로 반환된다.
- hasMore=true이면 nextAfterSequence를 다음 요청의 afterSequence로 사용한다.
- 기록이 없는 유효한 세션은 200과 빈 목록. 잘못된 UUID/조회 범위는 400.
- 페이지 조회 중 뒤늦게 이전 순번이 업로드될 수 있다. 완전한 분석은 업로드 완료 후 0부터 조회한다.

## 저장 구조 및 실행

`src/main/resources/db/hesitation.sql`을 시작 시 실행하여 hesitation_log 테이블과
세션·순번 인덱스를 생성한다. 기존 menu 테이블/데이터에는 변경을 가하지 않는다.
log_id는 기본키, (session_id, log_sequence)는 유일키이며 payload_json(TEXT)에 전체
로그를 보존한다. received_at에는 서버 수신 시간(epoch ms)을 별도로 저장한다.
세션 전용 테이블 없이 session_id로 기록을 묶는다.

기존 설정 그대로 backend 폴더에서 실행한다. 상대 경로 mydb.sqlite가 이 폴더를 기준으로 열린다.

```powershell
cd backend
.\gradlew.bat test
.\gradlew.bat bootRun
```

macOS/Linux에서는 `bash gradlew test`, `bash gradlew bootRun`을 사용한다.
기본 API 주소는 http://localhost:8080 이며 CORS는 기존 메뉴 API와 같은
http://localhost:5173 을 허용한다.
테스트는 별도 임시 SQLite 파일을 사용하므로 기존 메뉴 DB에 테스트 기록이 저장되지 않는다.

## 코드 역할

- HesitationLogController: HTTP 요청/응답
- HesitationLogService: 공통 필드 검증, 중복/충돌 처리, 트랜잭션
- HesitationLogRepository: SQLite 저장/조회 SQL
- HesitationSchema: 시작 시 테이블 준비
- HesitationLogApiTests: 실제 HTTP + 임시 SQLite로 저장, 재전송, 롤백, 정렬, 조회 검증

현재 로컬 개발용 API이며 사용자 로그인/관리자 조회 권한은 구현 범위에 포함하지 않는다.

새로운 로그 type을 프론트에 추가할 때는 서비스의 TYPES와 이 계약도 함께 수정한다.
