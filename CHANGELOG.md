# CHANGELOG

## v0.3.0

- breaking: mode `body` now changed to `text`, the behavior is the same as before, we only changed the param name in the request this version.
- feat: add `get_response` mode to send a `GET` request directly to the target URL and get the text response.
- fix: now `html` mode and the related fallback will return the right format.