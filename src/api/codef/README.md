# CODEF API

CODEF API를 사용하기 위한 axios 함수들을 제공합니다.

## API 엔드포인트

### 1. 보안문자 인증 (`/codef/secure`)

#### 요청

```javascript
POST / codef / secure
```

#### Headers

```json
{
  "Authorization": "Bearer {AccessToken}",
  "Content-Type": "application/json"
}
```

#### Body

```json
{
  "sessionKey": "String",
  "secureNo": "String"
}
```

#### 응답 코드

- `200`: "보안문자 인증에 성공하였습니다."
- `404`: "보안문자 인증에 실패했습니다."
- `500`: "서버에서 보안 문자 인증을 처리하는데 오류가 발생했습니다."

### 2. 건물 일련번호 조회 (`/codef/complex`)

#### 요청

```javascript
POST / codef / complex
```

#### Headers

```json
{
  "Authorization": "Bearer {AccessToken}",
  "Content-Type": "application/json"
}
```

#### Body

```json
{
  "addrSido": "서울특별시",
  "addrSigun": "송파구",
  "addrDong": "방이동",
  "buildingName": "송파더센트레"
}
```

#### 응답

```json
{
  "complexNo": "1171010900120277419"
}
```

#### 응답 코드

- `200`: "건물 일련번호를 찾는데 성공하였습니다."
- `404`: "건물 일련번호를 찾는데 실패했습니다."
- `500`: "서버에서 건물 일련번호를 처리하는데 오류가 발생했습니다."

## 사용법

### 기본 사용법

```javascript
import { verifySecureCode, getComplexNo } from '@/api/codef/codef.js'

// 보안문자 인증
const secureData = {
  sessionKey: 'your-session-key',
  secureNo: 'your-secure-number',
}
const secureResponse = await verifySecureCode(secureData)

// 건물 일련번호 조회
const complexData = {
  addrSido: '서울특별시',
  addrSigun: '송파구',
  addrDong: '방이동',
  buildingName: '송파더센트레',
}
const complexResponse = await getComplexNo(complexData)
```

### 토큰을 포함한 사용법

```javascript
import { verifySecureCodeWithToken, getComplexNoWithToken } from '@/api/codef/codef.js'

const accessToken = 'your-access-token'

// 보안문자 인증 (토큰 포함)
const secureResponse = await verifySecureCodeWithToken(secureData, accessToken)

// 건물 일련번호 조회 (토큰 포함)
const complexResponse = await getComplexNoWithToken(complexData, accessToken)
```

## 예제

더 자세한 사용 예제는 `codef.example.js` 파일을 참조하세요.
