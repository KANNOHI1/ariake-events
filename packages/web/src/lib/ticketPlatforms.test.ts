import { describe, expect, it } from 'vitest'
import { buildSearchQuery, TICKET_PLATFORMS } from './ticketPlatforms'

describe('TICKET_PLATFORMS', () => {
  it('builds Rakuten Ticket search URLs with required s and q parameters', () => {
    const rakuten = TICKET_PLATFORMS.find((platform) => platform.id === 'rakuten')

    expect(rakuten?.buildUrl('有明 ライブ')).toBe(
      `https://ticket.rakuten.co.jp/?s=&q=${encodeURIComponent('有明 ライブ')}`,
    )
  })
})

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

describe('enhanced query patterns', () => {
  it.each([
    ['TM NETWORK TM NETWORK TOUR 2026 QUANTUM', '有明アリーナ', 'TM NETWORK 有明アリーナ'],
    ['Paradox Live Paradox Live Dope Show 2026', '有明アリーナ', 'Paradox Live 有明アリーナ'],
    [
      'Saucy Dog Saucy Dog ONEMAN LIVE 2026「NOW LOADING…」',
      '東京ガーデンシアター',
      'Saucy Dog 東京ガーデンシアター',
    ],
    ['桑田佳祐 LIVE TOUR 2026', 'TOYOTA ARENA TOKYO', '桑田佳祐 TOYOTA ARENA TOKYO'],
    [
      'MAZZEL 1st Arena Tour 2026 "Shall we hit the Banquet?"',
      'TOYOTA ARENA TOKYO',
      'MAZZEL TOYOTA ARENA TOKYO',
    ],
    [
      '中島健人 "IDOL1ST 中島健人" LIVE TOUR 2026',
      '東京ガーデンシアター',
      '中島健人 東京ガーデンシアター',
    ],
    [
      'iKON(JAY, BOBBY, SONG, CHAN) iKON FOUREVER TOUR IN JAPAN',
      '東京ガーデンシアター',
      'iKON 東京ガーデンシアター',
    ],
    [
      'ねぽっくす！ 〜ねぽらぼ×秘密結社holoX〜 ホロライブ5期生',
      '有明アリーナ',
      'ねぽっくす！ 有明アリーナ',
    ],
    [
      'THE YELLOW MONKEY FAN CLUB 10th Anniversary THE YELLOW MONKEY TOUR 2026',
      '有明アリーナ',
      'THE YELLOW MONKEY FAN CLUB 有明アリーナ',
    ],
    ['桃鈴ねね 桃鈴ねね 1st Live', '東京ガーデンシアター', '桃鈴ねね 東京ガーデンシアター'],
    [
      'マルシィ マルシィ one man live 2026 Hall Tour',
      '東京ガーデンシアター',
      'マルシィ 東京ガーデンシアター',
    ],
    [
      "FUNKY MONKEY BΛBY'S×いきものがかり FUNKY MONKEY BΛBY'S × いきものがかり LIVE",
      '東京ガーデンシアター',
      "FUNKY MONKEY BΛBY'S × いきものがかり 東京ガーデンシアター",
    ],
  ])('builds a focused ticket search query for %s', (eventName, facility, expected) => {
    expect(buildSearchQuery(eventName, facility)).toBe(expected)
  })
})
