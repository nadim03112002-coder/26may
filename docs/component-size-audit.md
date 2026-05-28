# Component Size Audit
_Generated: May 2026_

## Current Giant Files

| File | Lines | Size | Risk |
|------|-------|------|------|
| `components/StudentDashboard.tsx` | ~19,570 | 1.1 MB | 🔴 Critical |
| `components/AdminDashboard.tsx` | ~17,713 | 1.3 MB | 🔴 Critical |
| `App.tsx` | ~3,189 | 153 KB | 🟡 Medium |
| `components/PdfView.tsx` | ~2,850 | 180 KB | 🟡 Medium |
| `components/LessonView.tsx` | ~2,368 | 149 KB | 🟡 Medium |

---

## App.tsx — Safe Split Plan

**Current:** 32 state variables, 64 hook calls, 3,189 lines.

### Extracted so far:
- `hooks/useOnlineStatus.ts` — `isOnline` state + event listeners
- `hooks/useLogoutTimer.ts` — logout countdown + pending state
- `hooks/useDailyStudyTimer.ts` — daily study seconds tracker

### Next safe extractions (low risk):
1. **`hooks/usePopupQueue.ts`** — `popupQueue`, streak login, level up notification state
2. **`hooks/useCreditModal.ts`** — `creditModal`, `setCreditModal`, `showPremiumModal`
3. **`components/modals/CloudRecoveryModal.tsx`** — the cloud recovery JSX block (~80 lines)
4. **`components/modals/LogoutOverlay.tsx`** — logout countdown UI block (~40 lines)

### Do NOT split yet:
- The main `handleContentGeneration` function — too many cross-cutting dependencies
- Firebase subscription useEffects — they share `setState` and need the full state shape

---

## StudentDashboard.tsx — Split Plan

**Current:** ~19,570 lines. Vite warns it exceeds 500KB style budget.

### Tabs visible to user (each is a natural split boundary):
| Tab | Rough lines | Suggested file |
|-----|-------------|----------------|
| HOME | ~2,000 | `student/tabs/HomeTab.tsx` |
| STUDY | ~1,500 | `student/tabs/StudyTab.tsx` |
| REVISION | ~1,200 | `student/tabs/RevisionTab.tsx` |
| STORE | ~800 | `student/tabs/StoreTab.tsx` |
| PROFILE | ~1,000 | `student/tabs/ProfileTab.tsx` |
| COMMUNITY | ~600 | `student/tabs/CommunityTab.tsx` |

### Shared logic to extract first (before tab split):
1. **`hooks/student/useMcqSession.ts`** — MCQ session state, wrong answer tracking
2. **`hooks/student/useHomeworkState.ts`** — homework fetch + UI state
3. **`hooks/student/useLeaderboard.ts`** — leaderboard data fetch
4. **`utils/studentDashboardHelpers.ts`** — pure utility functions with no state

### Recommended order:
1. Extract pure utility functions first (zero risk)
2. Extract hooks one at a time (each in a separate PR)
3. Split tab UIs last (after hooks are clean)

### Critical warning:
> `StudentDashboard` has ~184 `.map()` calls. Do NOT do a bulk split. Each extraction must be tested individually against the dev server before committing.

---

## AdminDashboard.tsx — Split Plan

**Current:** ~17,713 lines, 1.3 MB.

### Natural split boundaries (admin sections):
| Section | Suggested file |
|---------|----------------|
| Content Manager | `admin/sections/ContentManager.tsx` |
| User Manager | `admin/sections/UserManager.tsx` |
| Settings Panel | `admin/sections/SettingsPanel.tsx` |
| Analytics | `admin/sections/AnalyticsSection.tsx` |
| Blog/Custom Page | `admin/sections/BlogEditor.tsx` |
| Subscription Manager | `admin/sections/SubscriptionManager.tsx` |

### Already split (good):
- `components/admin/AppSoul.tsx`
- `components/admin/ChallengeCreator20.tsx`
- `components/admin/NstaFeatureManager.tsx`

### Next step:
Extract the `_sp<T,>` helper and other pure functions to `utils/adminHelpers.ts`.

---

## Rules for future contributors

1. **No new file over 500 lines** — split at creation time.
2. **One concern per file** — state hooks go in `hooks/`, pure logic in `utils/`, UI in `components/`.
3. **Giant files are frozen** — do not add new features to StudentDashboard or AdminDashboard. Extract first, then add.
4. **Vite style budget:** Files over 500KB trigger a deopt warning. Target < 300KB per file.
