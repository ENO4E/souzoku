<?php
// お問い合わせフォームの送信設定（見本）
//
// 使い方：このファイルをサーバー上で「contact-config.php」という名前にコピーし、値を記入する。
// contact-config.php はリポジトリ・ZIP・公開物には含めないこと（.gitignore 済み）。
return [
  // 送信先メールアドレス（フォームの内容が届くアドレス）
  'to'   => '',

  // 差出人アドレス。迷惑メール判定を避けるため、公開ドメインのメールアドレスを推奨
  // 例：noreply@kakuyasu-souzokuzei.com（お名前.comのメール設定で作成したもの）
  'from' => '',
];
