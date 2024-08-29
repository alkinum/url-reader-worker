# CHANGELOG

## v0.3.2

- fix: cannot get snapshot from browser will intent to a never resolved promise.

- fix: body will be used twice because log output.

- chore: upgrade deps.

## v0.3.1

- breaking: now the `html` mode will return a HTML which stripped `<svg>`, `<script>`, `<img>`, `<link>`, `<style>`, `<meta>`, and only extract the body part. If you want a raw html, please pass `raw_html` to `mode`.

## v0.3.0

- breaking: mode `body` now changed to `text`, the behavior is the same as before, we only changed the param name in the request this version.
- feat: add `get_response` mode to send a `GET` request directly to the target URL and get the text response.
- fix: now `html` mode and the related fallback will return the right format.