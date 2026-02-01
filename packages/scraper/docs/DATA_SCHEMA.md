# データスキーマ定義 (events.json)

## 概要

このドキュメントは、スクレイピング結果として出力される `events.json` のデータ構造を定義します。

## JSONスキーマ

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Ariake Events",
  "description": "有明エリアのイベント情報（配列）",
  "type": "array",
  "items": {
    "$ref": "#/definitions/Event"
  },
  "definitions": {
    "Event": {
      "type": "object",
      "properties": {
        "id": {
          "description": "イベントの一意なID",
          "type": "string"
        },
        "eventName": {
          "description": "イベント名",
          "type": "string"
        },
        "facility": {
          "description": "施設名",
          "type": "string",
          "enum": [
            "有明ガーデン",
            "東京ガーデンシアター",
            "有明アリーナ",
            "TOYOTA ARENA TOKYO",
            "東京ビッグサイト"
          ]
        },
        "category": {
          "description": "カテゴリ（music/sports/exhibition/other）",
          "type": "string"
        },
        "startDate": {
          "description": "イベント開始日 (YYYY-MM-DD)",
          "type": "string",
          "format": "date"
        },
        "endDate": {
          "description": "イベント終了日 (YYYY-MM-DD)",
          "type": "string",
          "format": "date"
        },
        "peakTimeStart": {
          "description": "ピーク開始時間 (HH:MM) / 不明時はnull",
          "type": ["string", "null"]
        },
        "peakTimeEnd": {
          "description": "ピーク終了時間 (HH:MM) / 不明時はnull",
          "type": ["string", "null"]
        },
        "estimatedAttendees": {
          "description": "推定動員数 / 不明時はnull",
          "type": ["number", "null"]
        },
        "congestionRisk": {
          "description": "混雑リスク (1-5) / 未設定はnull",
          "type": ["number", "null"]
        },
        "sourceURL": {
          "description": "情報取得元のURL",
          "type": "string",
          "format": "uri"
        },
        "lastUpdated": {
          "description": "このイベントの最終更新日時 (ISO 8601)",
          "type": "string",
          "format": "date-time"
        }
      },
      "required": [
        "id",
        "eventName",
        "facility",
        "category",
        "startDate",
        "endDate",
        "sourceURL",
        "lastUpdated"
      ]
    }
  }
}
```

## フィールド詳細

| フィールド名 | データ型 | 必須 | 説明 | 例 |
| :--- | :--- | :--- | :--- | :--- |
| `id` | string | ✅ | イベントの一意ID | `toyota-arena-tokyo-20260214-1a2b3c4d` |
| `eventName` | string | ✅ | イベント名 | `Gero Live Tour 2025 「百鬼夜行」` |
| `facility` | string | ✅ | 施設名 | `TOYOTA ARENA TOKYO` |
| `category` | string | ✅ | 分類（`music`/`sports`/`exhibition`/`other`） | `music` |
| `startDate` | string | ✅ | 開始日 (YYYY-MM-DD) | `2026-02-14` |
| `endDate` | string | ✅ | 終了日 (YYYY-MM-DD) | `2026-02-14` |
| `peakTimeStart` | string \/ null |  | ピーク開始時間 | `17:30` |
| `peakTimeEnd` | string \/ null |  | ピーク終了時間 | `19:30` |
| `estimatedAttendees` | number \/ null |  | 推定動員数 | `12000` |
| `congestionRisk` | number \/ null |  | 混雑リスク (1-5) | `4` |
| `sourceURL` | string | ✅ | 情報取得元URL | `https://www.toyota-arena-tokyo.jp/events/` |
| `lastUpdated` | string | ✅ | 最終更新日時 (ISO 8601) | `2026-02-01T00:10:00Z` |

## サンプルデータ

```json
[
  {
    "id": "toyota-arena-tokyo-20260214-1a2b3c4d",
    "eventName": "りそなグループ B.LEAGUE 2025-26シーズン 第23節 アルバルク東京 vs 佐賀バルーナーズ",
    "facility": "TOYOTA ARENA TOKYO",
    "category": "sports",
    "startDate": "2026-02-14",
    "endDate": "2026-02-14",
    "peakTimeStart": null,
    "peakTimeEnd": null,
    "estimatedAttendees": null,
    "congestionRisk": null,
    "sourceURL": "https://www.toyota-arena-tokyo.jp/events/",
    "lastUpdated": "2026-02-01T00:10:00Z"
  }
]
```
