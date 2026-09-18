<?php
// お問い合わせフォームの送信設定（見本）
//
// 使い方：このファイルをサーバー上で「contact-config.php」という名前にコピーし、値を記入する。
// contact-config.php はリポジトリ・ZIP・公開物には含めないこと（.gitignore 済み）。
return [
  // 送信先メールアドレス（フォームの内容が届くアドレス）
  'to'   => '',

  // 差出人アドレス。SMTP を使う場合は SMTP アカウントと同じアドレスにする
  'from' => '',

  // SMTP 送信設定（任意）。host と user を入れると SMTP 認証で送信し、
  // 失敗した場合や未設定の場合は PHP の mail() で送信する。
  'smtp' => [
    'host'   => '',        // 例：mail.example.com
    'port'   => 465,       // 465（SSL）または 587（STARTTLS）
    'secure' => 'ssl',     // 'ssl' | 'tls' | 'none'
    'user'   => '',        // メールアカウント（メールアドレス）
    'pass'   => '',        // そのパスワード
  ],
];
