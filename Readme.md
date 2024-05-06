# url-reader-worker

A url reader for AI on Cloudflare worker.

## Usage

**IMPORTANT: You need Worker Paid plan to use this worker due to the limitation of Browser ability.**



### Security

Please using WAF / Rules on Cloudflare to secure your worker because it can access any url from any source by default, THIS WORKER CAN BE ABUSED POTENTIALLY.

If you want to add some extra logic to block some evil requests, please fork it and modify the code.

## Inspired by

[jina-ai/reader](https://github.com/jina-ai/reader)

## License

Apache-2.0
