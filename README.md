# Task Manager

## リモート

[こちら](https://sheat-git.github.io/task-manager)のGithub Pagesで公開しています。

## ローカル

### supabase

supabaseを使用しているので、supabase cliが必要です。  
Supabase CLIの[README](https://github.com/supabase/cli/blob/main/README.md)を参照してインストールしてください。

### 起動

以下のコマンドを順に実行してください。

```bash
supabase start
supabase status -o env --override-name api.url=REACT_APP_SUPABASE_URL --override-name auth.anon_key=REACT_APP_SUPABASE_ANON_KEY > .env
supabase functions new deleteUser
supabase functions serve deleteUser &
npm install & npm start
```
