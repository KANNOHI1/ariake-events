import { describe, expect, it } from 'vitest'
import { timetable } from './timetable'

const NEW_BUS_STOPS = ['有明小中学校前', '有明二丁目', '都橋住宅前'] as const

describe('timetable', () => {
  it('adds the new bus stop routes after the existing Toei bus stop entry', () => {
    const toeiBusIndex = timetable.findIndex(
      (route) => route.name === '都バス' && route.station === '有明テニスの森停留所'
    )
    const brtIndex = timetable.findIndex(
      (route) => route.name === 'BRT' && route.station === '有明BRT停留所'
    )

    expect(toeiBusIndex).toBeGreaterThanOrEqual(0)
    expect(brtIndex).toBeGreaterThan(toeiBusIndex)
    expect(
      timetable.slice(toeiBusIndex + 1, brtIndex).map((route) => ({
        name: route.name,
        station: route.station,
        walkMinutes: route.walkMinutes,
        tabGroup: route.tabGroup,
      }))
    ).toEqual([
      { name: '海01', station: '有明小中学校前', walkMinutes: 5, tabGroup: 'bus' },
      { name: '都05-2', station: '有明小中学校前', walkMinutes: 5, tabGroup: 'bus' },
      { name: '東16', station: '有明小中学校前', walkMinutes: 5, tabGroup: 'bus' },
      { name: '海01', station: '有明二丁目', walkMinutes: 4, tabGroup: 'bus' },
      { name: '都05-2', station: '有明二丁目', walkMinutes: 4, tabGroup: 'bus' },
      { name: '東16', station: '有明二丁目', walkMinutes: 4, tabGroup: 'bus' },
      { name: '海01', station: '都橋住宅前', walkMinutes: 3, tabGroup: 'bus' },
      { name: '東16', station: '都橋住宅前', walkMinutes: 3, tabGroup: 'bus' },
    ])
  })

  it('includes saturday schedules for new 海01 and 東16 stops', () => {
    const routes = timetable.filter(
      (route) =>
        NEW_BUS_STOPS.includes(route.station as (typeof NEW_BUS_STOPS)[number]) &&
        ['海01', '東16'].includes(route.name)
    )

    expect(routes).toHaveLength(6)
    for (const route of routes) {
      for (const direction of route.directions) {
        expect(direction.saturday?.length).toBeGreaterThan(0)
      }
    }
  })

  it('matches representative scheduled times from the plan for each new stop', () => {
    expect(
      timetable.find(
        (route) => route.name === '海01' && route.station === '有明小中学校前'
      )?.directions[0]
    ).toMatchObject({
      weekday: expect.arrayContaining(['06:47', '21:50']),
      saturday: expect.arrayContaining(['06:50', '21:50']),
      holiday: expect.arrayContaining(['06:48', '21:51']),
    })

    expect(
      timetable.find((route) => route.name === '海01' && route.station === '有明二丁目')
        ?.directions[1]
    ).toMatchObject({
      weekday: expect.arrayContaining(['06:35', '22:24']),
      saturday: expect.arrayContaining(['06:50', '22:24']),
      holiday: expect.arrayContaining(['07:05', '22:23']),
    })

    expect(
      timetable.find((route) => route.name === '海01' && route.station === '都橋住宅前')
        ?.directions[1]
    ).toMatchObject({
      weekday: expect.arrayContaining(['06:32', '22:21']),
      saturday: expect.arrayContaining(['06:47', '22:21']),
      holiday: expect.arrayContaining(['07:02', '22:38']),
    })
  })
})
