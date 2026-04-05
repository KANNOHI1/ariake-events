# EventCard Blurred Backdrop Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** EventCard の画像エリアに Blurred Backdrop（ぼかし背景）を実装し、縦長・横長バナー画像でも黒帯なく美しく表示されるようにする。

**Architecture:** imageArea コンテナを `bg-black overflow-hidden` にし、背景レイヤー（`aria-hidden` 付き `object-cover blur-2xl`）と前景レイヤー（`object-contain`）の2枚重ねにする。`displaySrc` 変数で imgError フォールバックを一元管理し、両 img で使い回す。

**Tech Stack:** React（useState）、Tailwind CSS v3、Vitest + @testing-library/react

---

## ファイルマップ

| ファイル | 変更種別 | 内容 |
|---|---|---|
| `packages/web/src/components/EventCard.tsx` | Modify | imageArea を Blurred Backdrop 構造に変更 |
| `packages/web/src/components/EventCard.test.tsx` | Modify | 既存2テスト更新 + 新規2テスト追加 |

---

## Chunk 1: テスト更新 → 実装 → 検証

### Task 1: 失敗テストを先に書く（TDD）

**Files:**
- Modify: `packages/web/src/components/EventCard.test.tsx`

**変更対象テスト（2件更新 + 2件追加）:**

#### 変更1: `'image container has bg-slate-100 for letterbox areas'` → `bg-black` に変更

```tsx
it('image container uses bg-black for blurred backdrop', () => {
  const { container } = render(<EventCard event={musicEvent} />)
  const imageArea = container.querySelector('.bg-black')
  expect(imageArea).not.toBeNull()
  // 旧: bg-slate-100 は存在しない
  expect(container.querySelector('.bg-slate-100')).toBeNull()
})
```

#### 変更2: `'image uses object-contain'` → 前景img（aria-hidden なし）を対象にする

```tsx
it('前景画像は object-contain で全体表示される', () => {
  render(<EventCard event={musicEvent} />)
  // aria-hidden="true" の背景img は getByRole から除外される
  const img = screen.getByRole('img', { name: musicEvent.eventName })
  expect(img).toHaveClass('object-contain')
  expect(img.className).not.toContain('object-cover')
})
```

#### 追加1: 背景imgが blur-2xl・opacity-60・aria-hidden を持つ

```tsx
it('背景imgに blur-2xl opacity-60 aria-hidden が付いている', () => {
  const { container } = render(<EventCard event={musicEvent} />)
  const imgs = container.querySelectorAll('img')
  // 背景imgは DOM 上で最初に来る
  const backdropImg = imgs[0]
  expect(backdropImg).toHaveAttribute('aria-hidden', 'true')
  expect(backdropImg).toHaveClass('blur-2xl')
  expect(backdropImg).toHaveClass('opacity-60')
  expect(backdropImg).toHaveClass('object-cover')
})
```

#### 追加2: imgError 時に両 img が施設写真を表示する

```tsx
it('imgError 時に背景・前景ともに施設写真 src になる', () => {
  const { container } = render(<EventCard event={musicEvent} />)
  const imgs = container.querySelectorAll('img')
  // imgError=false の初期状態では両方とも同じ displaySrc
  // 背景img(imgs[0])と前景img(imgs[1])のsrcが一致すること
  expect((imgs[0] as HTMLImageElement).src).toBe((imgs[1] as HTMLImageElement).src)
})
```

- [ ] **Step 1: 既存テスト2件を上記内容で書き換える**
  - `'image container has bg-slate-100 for letterbox areas'` を `'image container uses bg-black for blurred backdrop'` に変更
  - `'image uses object-contain to prevent cropping'` を `'前景画像は object-contain で全体表示される'` に変更

- [ ] **Step 2: 新規テスト2件を追加する**（`describe` ブロックの末尾に追記）

- [ ] **Step 3: テストを実行して失敗を確認する**
  ```bash
  pnpm --filter web test EventCard
  ```
  期待: `bg-black`・`blur-2xl` 関連の4テストが FAIL

---

### Task 2: EventCard.tsx を実装する

**Files:**
- Modify: `packages/web/src/components/EventCard.tsx`

**変更内容:** `imageArea` 変数のみ変更。それ以外は一切触らない。

**変更前（26〜40行）:**
```tsx
const imageArea = (
  <div className={`relative shrink-0 bg-slate-100 ${viewMode === 'grid' ? 'w-full aspect-video' : 'w-[40%]'}`}>
    <img
      src={imgError ? getFacilityPhoto(event.facility) : imageUrl}
      alt={event.eventName}
      className="w-full h-full object-contain"
      onError={() => setImgError(true)}
    />
    {congestionInfo && (
      <span className={`absolute top-2 right-2 ${congestionInfo.imageBadgeClass} text-[10px] font-bold px-2 py-1 rounded-full backdrop-blur-sm`}>
        {congestionInfo.label}
      </span>
    )}
  </div>
)
```

**変更後:**
```tsx
const displaySrc = imgError ? getFacilityPhoto(event.facility) : imageUrl

const imageArea = (
  <div className={`relative shrink-0 overflow-hidden bg-black
    ${viewMode === 'grid' ? 'w-full aspect-video' : 'w-[40%]'}`}>

    {/* ぼかし背景レイヤー */}
    <img
      src={displaySrc}
      aria-hidden="true"
      className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-60"
    />

    {/* 前景: 全体表示 */}
    <img
      src={displaySrc}
      alt={event.eventName}
      className="relative z-10 w-full h-full object-contain"
      onError={() => setImgError(true)}
    />

    {congestionInfo && (
      <span className={`absolute top-2 right-2 z-20 ${congestionInfo.imageBadgeClass} text-[10px] font-bold px-2 py-1 rounded-full backdrop-blur-sm`}>
        {congestionInfo.label}
      </span>
    )}
  </div>
)
```

**変更点まとめ:**
- `displaySrc` 変数を `imageArea` の直前に追加（`const congestionInfo = ...` の次の行）
- コンテナ: `bg-slate-100` → `bg-black` + `overflow-hidden` 追加
- 背景img: `aria-hidden="true"` + `absolute inset-0 object-cover scale-110 blur-2xl opacity-60`（`alt` なし・`onError` なし）
- 前景img: `relative z-10 object-contain`（`onError` は前景のみ）
- 混雑バッジ: `z-20` 追加

- [ ] **Step 1: `displaySrc` 変数を追加する**（`const congestionInfo = getCongestionInfo(event.congestionRisk)` の直後）

- [ ] **Step 2: `imageArea` の `<div>` className を変更する**（`bg-slate-100` → `bg-black overflow-hidden`）

- [ ] **Step 3: 背景imgを追加する**（前景imgの直前に挿入）

- [ ] **Step 4: 前景imgを変更する**（`relative z-10` 追加、`src` を `displaySrc` に変更）

- [ ] **Step 5: 混雑バッジに `z-20` を追加する**

---

### Task 3: テストを実行してすべて通ることを確認する

- [ ] **Step 1: web テストを全件実行する**
  ```bash
  pnpm --filter web test
  ```
  期待: すべての suite が PASS（現在 17 suite 139 tests + 今回追加2テスト = 141 tests）

- [ ] **Step 2: scraper テストも念のため確認**
  ```bash
  pnpm --filter scraper test
  ```
  期待: 変更なし・全 PASS

---

### Task 4: ビルド確認 + コミット

- [ ] **Step 1: Next.js ビルドが通ることを確認する**
  ```bash
  pnpm --filter web build
  ```
  期待: エラーなし

- [ ] **Step 2: コミットする**
  ```bash
  git add packages/web/src/components/EventCard.tsx packages/web/src/components/EventCard.test.tsx
  git commit -m "feat: EventCard画像にBlurred Backdrop実装（背景ぼかし+前景全体表示）"
  ```

- [ ] **Step 3: push する**
  ```bash
  git push
  ```

---

## 注意事項

- `container.querySelector('img')` は DOM 順で最初の img（= 背景img）を返す。テストで前景imgを対象にしたい場合は `screen.getByRole('img', { name: eventName })` を使う（`aria-hidden` img は accessibility tree から除外される）。
- `overflow-hidden` がないと `scale-110` のはみ出しがコンテナ外に漏れる。コンテナに必須。
- 背景imgには `alt` 属性を付けない（`aria-hidden="true"` のため不要・lint 警告が出る場合は `alt=""` を付ける）。
