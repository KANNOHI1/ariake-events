import { describe, expect, it } from 'vitest'
import { buildSearchQuery } from './ticketPlatforms'

describe('buildSearchQuery', () => {
  it('removes a duplicated leading phrase and appends the facility', () => {
    expect(buildSearchQuery('DIR EN GREY DIR EN GREY MORTAL DOWNER', '有明アリーナ')).toBe(
      'DIR EN GREY 有明アリーナ',
    )
  })

  it('keeps non-duplicated English event names and appends the facility', () => {
    expect(buildSearchQuery('JACK IN THE DONUTS', '有明ガーデン')).toBe('JACK IN THE DONUTS 有明ガーデン')
  })

  it('cuts the query before Japanese brackets and appends the facility', () => {
    expect(
      buildSearchQuery('VS.超特急 超特急の冠番組...「ＶＳ.超特急」第３弾！', '有明アリーナ'),
    ).toBe('VS.超特急 超特急の冠番組... 有明アリーナ')
  })

  it('appends the facility to Japanese event names', () => {
    expect(buildSearchQuery('夢の桜プロジェクト', '有明ガーデン')).toBe('夢の桜プロジェクト 有明ガーデン')
  })

  it('does not append the facility when the event name already contains it', () => {
    expect(buildSearchQuery('有明アリーナ オープニングセレモニー', '有明アリーナ')).toBe(
      '有明アリーナ オープニングセレモニー',
    )
  })
})
