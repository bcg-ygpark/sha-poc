## PoC 앱 마이그레이션 & 구현 가이드

sha-make-bo / sha-make-fm / sha-make-mobile 디렉터리를 참고하여 PoC용 앱 3개를 `apps/` 하위에 구축하기 위한 가이드입니다.  
디자인은 sha-make-* 를 최대한 그대로 옮기되, 버튼/인풋 등 UI 요소는 `packages/ui` 컴포넌트를 적극 활용합니다.

---

## 1. 타깃 앱 구조

- **BO 앱 예시**: `apps/bo`
- **FM 앱 예시**: `apps/fm`
- **모바일 앱**: `apps/mobile` (기존 앱 구조를 기준으로 동일 패턴 유지)

각 앱 기본 구조:

```text
apps/<app-name>/
  index.html
  package.json (필요 시)
  src/
    App.tsx
    main.tsx
    index.css
    styles/
      globals.css
    components/
    pages/
    contexts/
    api/
    imports/
    guidelines/
```

- 디렉터리명은 소문자, 컴포넌트 파일은 PascalCase, 유틸/서비스 파일은 camelCase를 사용합니다.
- 라우팅이 필요한 앱은 `src/App.tsx`에서 `BrowserRouter` + `Routes`를 구성합니다.

---

## 2. sha-make-* → apps/* 마이그레이션 전략

### 2.1 화면/라우트 매핑

1. `sha-make-bo/src/pages`, `sha-make-bo/src/components`에서 **한 화면을 구성하는 컴포넌트**를 식별합니다.
2. 각 화면을 `apps/bo/src/pages`로 복사하고, `App.tsx`의 `Route`에 path를 매핑합니다.
3. `sha-make-fm`에 대해서도 동일하게 화면 목록을 정리하고, `apps/fm`에 라우트를 구성합니다.
4. 각 화면이 **페이지 라우트인지, 모달/바텀시트인지**를 구분하여 구조를 설계합니다.

예시:

- `sha-make-bo/src/pages/Subscription.tsx` → `apps/bo/src/pages/Subscription.tsx` → `/subscription`
- `sha-make-bo/src/pages/Redemption.tsx` → `/redemption`
- `sha-make-bo/src/pages/Monitoring.tsx` → `/monitoring`

### 2.2 레이아웃 & 스타일 마이그레이션

- sha-make-* 의 JSX 구조와 `className`은 **최대한 그대로 복사**합니다.
- 단, 버튼/인풋/셀렉트/토글 등 컨트롤 요소는 HTML 태그 대신 `packages/ui` 컴포넌트로 교체합니다.
- 공통 레이아웃(헤더, 사이드바, 메인 콘텐츠)은 `components/layout` 디렉터리에 분리할 수 있습니다.

---

## 3. `packages/ui` 컴포넌트 활용 가이드

### 3.1 기본 원칙

- 버튼, 인풋, 셀렉트, 체크박스, 라디오, 탭, 다이얼로그 등 **모든 기본 UI 컨트롤은 `packages/ui` 사용을 우선**합니다.
- sha-make-* 코드에서 `<button>`, `<input>`, `<select>` 등 직접 사용 부분은:
  - 스타일은 유지하되,
  - 실제 엘리먼트를 `@template/ui` 또는 설정된 alias의 컴포넌트로 대체합니다.

### 3.2 치환 패턴 예시

```tsx
// 기존 (sha-make-*)
<button className="w-full rounded-lg bg-[#2a3fec] py-3 text-white font-semibold">
  다음
</button>

// 마이그레이션 후 (PoC 앱)
import { Button } from '@template/ui';

<Button className="w-full bg-[#2a3fec] text-white font-semibold">
  다음
</Button>
```

- 필요한 경우 `variant`, `size` 등 `packages/ui`에서 제공하는 prop을 사용하고,
- 나머지 미세 스타일은 `className`으로 Tailwind 유틸을 추가합니다.

---

## 4. BO / FM 앱 구현 가이드

### 4.1 BO 앱 (`apps/bo`)

- **참고 소스**: `sha-make-bo/src`
- **레이아웃**
  - 데스크톱 기준 레이아웃(좌측 내비게이션 + 우측 콘텐츠)을 기본으로 합니다.
  - `WorkspaceLayout` 컴포넌트를 두어 전체 프레임(헤더, 사이드바, 콘텐츠)을 관리합니다.
- **라우팅**
  - `Subscription`, `Redemption`, `Monitoring` 등 주요 페이지를 `Route`로 등록합니다.
  - 예시: `/subscription`, `/redemption`, `/monitoring`
- **상태 관리**
  - 간단한 PoC 수준에서는 페이지 내부 state로 처리하고,
  - 공유 상태가 필요한 경우 `contexts/` 디렉터리에 React Context를 정의합니다.

### 4.2 FM 앱 (`apps/fm`)

- **참고 소스**: `sha-make-fm/src`
- **레이아웃**
  - NAV 업데이트, 토큰 발행 화면 등을 탭 또는 개별 페이지로 구성합니다.
- **라우팅**
  - `TokenIssuance.tsx` → `/token-issuance`
  - NAV 업데이트 관련 컴포넌트들을 `/nav-update` 등으로 매핑합니다.
- **UI 공통화**
  - 발행/수정 폼, 표, 카드 등은 `packages/ui`의 `Form`, `Table`, `Card`, `Button` 등을 최대한 재사용합니다.

---

## 5. 모바일 앱 구조 & Quick Access 패턴

### 5.1 기본 구조 (`apps/mobile`)

기존 `apps/mobile`의 패턴을 그대로 따릅니다.

- `App.tsx`
  - `BrowserRouter` + `Routes`
  - `WorkspaceLayout`:
    - 좌측: `ScreenSummaryPanel` (Quick Access 패널)
    - 중앙: `MobileViewport` (실제 모바일 화면 영역)
    - 우측 하단: `QuickAccessToggle` (패널 토글)
  - `ScrollToTop` + `Outlet` 구조
- `components/layout`
  - `MobileViewport.tsx`, `MobileViewportContext.tsx` 유지/재사용
- `contexts`
  - `WalletContext`, `DepositContext` 등 도메인별 Context 유지

### 5.2 `ScreenSummaryPanel` & Quick Access

- `ScreenSummaryPanel`은 **주요 플로우를 섹션으로 나누고, 각 라우트에 빠르게 접근할 수 있는 패널**입니다.
- 각 앱의 주요 플로우(온보딩, 입금, 출금, 거래 등)를 섹션 단위로 구성하고, 각 단계별 화면을 `path`와 함께 정의합니다.
- 패널 예시 구조:
  - `MY홈 & 메뉴`
  - `지갑 온보딩`
  - `USDC 입금 플로우`
  - `USDC 출금 플로우`
  - `USDC 환전`
  - `토큰 증권 & 거래`

`WorkspaceLayout`에서는 `isQuickAccessVisible` state와 `localStorage`를 사용해 패널 표시 여부를 저장합니다.

```tsx
const [isQuickAccessVisible, setIsQuickAccessVisible] = useState(true);

useEffect(() => {
  const saved = localStorage.getItem('quickAccessVisible');
  if (saved !== null) {
    setIsQuickAccessVisible(saved === 'true');
  }
}, []);
```

필요하다면 단축키(`Cmd/Ctrl + Shift + A`)를 실제로 처리하는 `keydown` 핸들러를 추가하여 패널 토글을 지원할 수 있습니다.

### 5.3 모바일용 UI 컴포넌트 사용

- 모바일 화면에서도 버튼/인풋/탭 등은 `packages/ui` 컴포넌트를 사용합니다.
- sha-make-mobile의 UI 스타일을 유지하면서, DOM 엘리먼트만 `packages/ui` 컴포넌트로 치환합니다.

---

## 6. 구현 순서 체크리스트

1. **현재 변경사항 커밋**
   - sha-make-bo / sha-make-fm / sha-make-mobile 디렉터리를 추가 커밋으로 기록.
2. **이 가이드 커밋**
   - `POC_APPS_MIGRATION_GUIDE.md` 작성 및 `docs` 타입 커밋.
3. **BO 앱 구현**
   - `apps/bo` 디렉터리 생성 및 Vite/React 설정.
   - sha-make-bo 페이지/컴포넌트 마이그레이션.
   - 버튼/인풋 등 `packages/ui`로 치환.
4. **FM 앱 구현**
   - `apps/fm` 디렉터리 생성 및 라우팅/페이지 구성.
   - sha-make-fm 컴포넌트 마이그레이션 및 `packages/ui` 적용.
5. **모바일 앱 확장**
   - `apps/mobile` 구조를 유지하면서 필요한 신규 화면/플로우 추가.
   - `ScreenSummaryPanel` 섹션/라우트 업데이트.
   - `packages/ui` 기반으로 컨트롤 일원화.

위 순서를 따라가면 sha-make-* 디자인을 그대로 유지하면서도, `packages/ui`를 활용한 일관된 PoC 앱 3종을 `apps/` 하위에 구성할 수 있습니다.


