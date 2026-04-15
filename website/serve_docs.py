from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import urlparse

BUILD = Path(__file__).resolve().parent / 'build'
BASE = '/docs/'

class Handler(SimpleHTTPRequestHandler):
    def translate_path(self, path):
        path = urlparse(path).path
        if path == '/':
            path = BASE
        if path.startswith(BASE):
            path = path[len(BASE):]
        elif path == '/docs':
            path = ''
        else:
            # serve root requests from build too, so tunnel root still works
            path = path.lstrip('/')
        full = BUILD / path
        if full.is_dir():
            full = full / 'index.html'
        return str(full)

    def do_GET(self):
        if self.path in ('/', '/index.html'):
            self.send_response(302)
            self.send_header('Location', BASE)
            self.end_headers()
            return
        return super().do_GET()

    def do_HEAD(self):
        if self.path in ('/', '/index.html'):
            self.send_response(302)
            self.send_header('Location', BASE)
            self.end_headers()
            return
        return super().do_HEAD()

if __name__ == '__main__':
    ThreadingHTTPServer(('0.0.0.0', 4173), Handler).serve_forever()
