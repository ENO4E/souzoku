<?php
// お問い合わせフォームの送信API（お名前.com レンタルサーバー等の PHP 環境用）
// 配置先: 公開ディレクトリ/web/contact/index.php → エンドポイント URL は /web/contact/
//
// 送信先などの設定は同じフォルダの contact-config.php から読む。
// contact-config.php はサーバー上でだけ作成し（contact-config.example.php をコピーして記入）、
// リポジトリや公開物には含めない。PHP ファイルなので中身がブラウザに表示されることはない。

header('Content-Type: application/json; charset=UTF-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

function respond(int $code, array $payload): void {
  http_response_code($code);
  echo json_encode($payload, JSON_UNESCAPED_UNICODE);
  exit;
}

function clean($value, int $max): string {
  $value = is_string($value) ? $value : '';
  // 制御文字を除去（メールヘッダ偽装対策）してから長さを制限
  $value = preg_replace('/[\x00-\x1F\x7F]/u', '', $value) ?? '';
  return mb_substr(trim($value), 0, $max, 'UTF-8');
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
  header('Allow: POST');
  respond(405, ['ok' => false, 'error' => 'method_not_allowed']);
}

$configPath = __DIR__ . '/contact-config.php';
$config = is_file($configPath) ? (require $configPath) : null;
$to   = is_array($config) ? trim((string)($config['to'] ?? '')) : '';
$from = is_array($config) ? trim((string)($config['from'] ?? '')) : '';
if ($to === '' || $from === '') {
  error_log('contact.php: contact-config.php の to / from が未設定です');
  respond(500, ['ok' => false, 'error' => 'not_configured']);
}

$raw  = file_get_contents('php://input');
$body = json_decode($raw ?: '', true);
if (!is_array($body)) $body = $_POST;

// ボット対策：人間には見えない入力欄（website）に値があれば静かに成功を返す
if (clean($body['website'] ?? '', 200) !== '') respond(200, ['ok' => true]);

$name    = clean($body['name'] ?? '', 100);
$tel     = clean($body['tel'] ?? '', 40);
$email   = clean($body['email'] ?? '', 200);
$amount  = clean($body['amount'] ?? '', 50);
$message = clean($body['message'] ?? '', 3000);

if ($name === '' || $tel === '') respond(400, ['ok' => false, 'error' => 'required']);

$validEmail = filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
$receivedAt = (new DateTime('now', new DateTimeZone('Asia/Tokyo')))->format('Y/m/d H:i');
$referer    = clean($_SERVER['HTTP_REFERER'] ?? '', 300);

$subject = "【無料相談のお申込み】{$name} 様";
$text = implode("\n", [
  '相続税申告相談センターのLPから無料相談のお申込みがありました。',
  '',
  "お名前　　　　：{$name}",
  "電話番号　　　：{$tel}",
  'メールアドレス：' . ($email !== '' ? $email : '未入力'),
  '相続財産の概算：' . ($amount !== '' ? $amount : '未選択'),
  '',
  'ご相談内容：',
  $message !== '' ? $message : '（未入力）',
  '',
  '----',
  "受信日時：{$receivedAt}",
  '送信元ページ：' . ($referer !== '' ? $referer : '不明'),
]);

$encodedSubject  = '=?UTF-8?B?' . base64_encode($subject) . '?=';
$encodedFromName = '=?UTF-8?B?' . base64_encode('相続税申告相談センター LP') . '?=';
$headers  = "From: {$encodedFromName} <{$from}>\r\n";
if ($validEmail) $headers .= "Reply-To: {$email}\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "Content-Transfer-Encoding: 8bit\r\n";

// エンベロープ送信元（-f）を指定すると SPF が通りやすい。許可されないサーバーでは指定なしで再試行
$sent = @mail($to, $encodedSubject, $text, $headers, '-f' . $from);
if (!$sent) $sent = @mail($to, $encodedSubject, $text, $headers);

if (!$sent) {
  error_log('contact.php: mail() が失敗しました');
  respond(502, ['ok' => false, 'error' => 'send_failed']);
}
respond(200, ['ok' => true]);
