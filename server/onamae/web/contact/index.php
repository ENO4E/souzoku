<?php
// お問い合わせフォームの送信API（お名前.com レンタルサーバー等の PHP 環境用）
// 配置先: 公開ディレクトリ/web/contact/index.php → エンドポイント URL は /web/contact/
//
// 送信先などの設定は同じフォルダの contact-config.php から読む。
// contact-config.php はサーバー上でだけ作成し（contact-config.example.php をコピーして記入）、
// リポジトリや公開物には含めない。PHP ファイルなので中身がブラウザに表示されることはない。
//
// 送信方法：contact-config.php の smtp（host / user / pass）が設定されていれば SMTP 認証で送信し、
// 未設定または失敗した場合は PHP の mail() で送信する。

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

// ---- 最小限の SMTP クライアント（AUTH LOGIN、SSL / STARTTLS 対応） ----
function smtp_read($sock): array {
  $code = 0; $lines = [];
  while (($line = fgets($sock, 1024)) !== false) {
    $lines[] = rtrim($line, "\r\n");
    if (strlen($line) >= 4 && $line[3] === ' ') { $code = (int)substr($line, 0, 3); break; }
    if (strlen($line) < 4) break;
  }
  return [$code, implode(' / ', $lines)];
}

function smtp_cmd($sock, string $cmd, array $expect, ?string &$err): bool {
  fwrite($sock, $cmd . "\r\n");
  [$code, $text] = smtp_read($sock);
  if (!in_array($code, $expect, true)) {
    $label = str_starts_with($cmd, 'AUTH') || preg_match('/^[A-Za-z0-9+\/=]+$/', $cmd) ? '(auth)' : strtok($cmd, ' ');
    $err = "{$label}: {$text}";
    return false;
  }
  return true;
}

function smtp_send(array $smtp, string $from, string $to, string $data, ?string &$err): bool {
  $host   = trim((string)($smtp['host'] ?? ''));
  $port   = (int)($smtp['port'] ?? 465);
  $secure = strtolower(trim((string)($smtp['secure'] ?? 'ssl')));
  $user   = (string)($smtp['user'] ?? '');
  $pass   = (string)($smtp['pass'] ?? '');
  if ($host === '' || $user === '') { $err = 'smtp not configured'; return false; }

  $prefix = $secure === 'ssl' ? 'ssl://' : 'tcp://';
  $sock = @stream_socket_client($prefix . $host . ':' . $port, $errno, $errstr, 15);
  if (!$sock) { $err = "connect: {$errstr} ({$errno})"; return false; }
  stream_set_timeout($sock, 15);

  $ehloHost = preg_replace('/[^A-Za-z0-9.-]/', '', (string)($_SERVER['SERVER_NAME'] ?? '')) ?: 'localhost';
  $ok = false;
  try {
    [$code, $text] = smtp_read($sock);
    if ($code !== 220) throw new RuntimeException("greeting: {$text}");
    if (!smtp_cmd($sock, "EHLO {$ehloHost}", [250], $err)) throw new RuntimeException($err);
    if ($secure === 'tls') {
      if (!smtp_cmd($sock, 'STARTTLS', [220], $err)) throw new RuntimeException($err);
      if (!@stream_socket_enable_crypto($sock, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) throw new RuntimeException('starttls failed');
      if (!smtp_cmd($sock, "EHLO {$ehloHost}", [250], $err)) throw new RuntimeException($err);
    }
    if (!smtp_cmd($sock, 'AUTH LOGIN', [334], $err)) throw new RuntimeException($err);
    if (!smtp_cmd($sock, base64_encode($user), [334], $err)) throw new RuntimeException($err);
    if (!smtp_cmd($sock, base64_encode($pass), [235], $err)) throw new RuntimeException($err);
    if (!smtp_cmd($sock, "MAIL FROM:<{$from}>", [250], $err)) throw new RuntimeException($err);
    if (!smtp_cmd($sock, "RCPT TO:<{$to}>", [250, 251], $err)) throw new RuntimeException($err);
    if (!smtp_cmd($sock, 'DATA', [354], $err)) throw new RuntimeException($err);
    // 行頭のピリオドをエスケープし、CRLF 改行に統一して送信
    $normalized = preg_replace('/\r\n|\r|\n/', "\r\n", $data);
    $normalized = preg_replace('/(^|\r\n)\./', '$1..', $normalized);
    fwrite($sock, $normalized . "\r\n.\r\n");
    [$code, $text] = smtp_read($sock);
    if ($code !== 250) throw new RuntimeException("data: {$text}");
    fwrite($sock, "QUIT\r\n");
    $ok = true;
  } catch (RuntimeException $e) {
    $err = $e->getMessage();
  } finally {
    fclose($sock);
  }
  return $ok;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
  header('Allow: POST');
  respond(405, ['ok' => false, 'error' => 'method_not_allowed']);
}

$configPath = __DIR__ . '/contact-config.php';
$config = is_file($configPath) ? (require $configPath) : null;
$to   = is_array($config) ? trim((string)($config['to'] ?? '')) : '';
$from = is_array($config) ? trim((string)($config['from'] ?? '')) : '';
$smtp = is_array($config) && is_array($config['smtp'] ?? null) ? $config['smtp'] : [];
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

$sent = false;

// 1) SMTP 認証で送信（contact-config.php の smtp が設定されている場合）
if (trim((string)($smtp['host'] ?? '')) !== '' && (string)($smtp['user'] ?? '') !== '') {
  $smtpHeaders  = "Date: " . (new DateTime('now', new DateTimeZone('Asia/Tokyo')))->format(DATE_RFC2822) . "\r\n";
  $smtpHeaders .= "To: <{$to}>\r\n";
  $smtpHeaders .= "Subject: {$encodedSubject}\r\n";
  $smtpHeaders .= $headers;
  $smtpErr = null;
  $sent = smtp_send($smtp, $from, $to, $smtpHeaders . "\r\n" . $text, $smtpErr);
  if (!$sent) error_log('contact.php: SMTP 送信に失敗しました（mail() で再試行）: ' . $smtpErr);
}

// 2) PHP mail() で送信（SMTP 未設定時、または SMTP 失敗時の予備）
if (!$sent) {
  // エンベロープ送信元（-f）を指定すると SPF が通りやすい。許可されないサーバーでは指定なしで再試行
  $sent = @mail($to, $encodedSubject, $text, $headers, '-f' . $from);
  if (!$sent) $sent = @mail($to, $encodedSubject, $text, $headers);
}

if (!$sent) {
  error_log('contact.php: mail() が失敗しました');
  respond(502, ['ok' => false, 'error' => 'send_failed']);
}
respond(200, ['ok' => true]);
