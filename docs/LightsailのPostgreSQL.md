LightsailのPostgreSQLは開発用DBとして適しています：

- 無料枠12ヶ月間
- 固定IPで安定接続
- VPCピアリング不要
- セットアップが簡単

設定のみ注意：
```
postgresql.conf
listen_addresses = '*'

pg_hba.conf
host all all 0.0.0.0/0 md5
```