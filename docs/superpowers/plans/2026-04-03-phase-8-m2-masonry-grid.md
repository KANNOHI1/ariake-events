# Phase 8 M2 Masonry Grid Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update event card and grid layouts to use a masonry-style columns presentation in grid mode with focused regression coverage.

**Architecture:** Keep the existing component boundaries intact. Adjust `EventCard` styling conditionally by `viewMode`, switch `TodayView` and `MonthView` grid containers from CSS grid to CSS columns, and cover the changed behaviors with narrow component tests.

**Tech Stack:** React, TypeScript, Vitest, Testing Library, pnpm

---

### Task 1: EventCard grid-mode styling

**Files:**
- Modify: `packages/web/src/components/EventCard.test.tsx`
- Modify: `packages/web/src/components/EventCard.tsx`

- [ ] **Step 1: Write the failing tests**
- [ ] **Step 2: Run the EventCard test file to verify the new assertions fail for current behavior**
- [ ] **Step 3: Update `EventCard` link, image, and title class handling**
- [ ] **Step 4: Run the EventCard test file to verify it passes**

### Task 2: Today/Month masonry container updates

**Files:**
- Modify: `packages/web/src/components/TodayView.test.tsx`
- Modify: `packages/web/src/components/TodayView.tsx`
- Modify: `packages/web/src/components/MonthView.tsx`

- [ ] **Step 1: Update `TodayView` tests to pass `viewMode` explicitly and add a failing grid-layout assertion**
- [ ] **Step 2: Run the TodayView test file to verify the new assertion fails for current behavior**
- [ ] **Step 3: Update `TodayView` and `MonthView` grid-mode container classes**
- [ ] **Step 4: Run the TodayView test file to verify it passes**

### Task 3: Final verification

**Files:**
- Verify: `packages/web`

- [ ] **Step 1: Run `pnpm --filter web test`**
- [ ] **Step 2: Confirm the full web test suite passes with no failures**
