import os
import time

import tornado.ioloop
import tornado.web
import tornado.websocket

port = int(os.getenv('PORT', 80))
WIDTH = 80
HEIGHT = 45
mx = [['#000000' for j in range(HEIGHT)] for i in range(WIDTH)]
PRD = 3600 # seconds

class MainHandler(tornado.web.RequestHandler):
    def get(self):
        self.write(open("static/index.html", 'rb').read())


class StaticHandler(tornado.web.RequestHandler):
    def get(self):
        try:
            self.write(open(self.request.uri[1:], 'rb').read())
        except BaseException as ex:
            self.write('404 File not found\n' + str(ex))


class WebSocket(tornado.websocket.WebSocketHandler):
    connections = []
    tmr = time.time()

    def open(self):
        self.connections.append(self)

    def on_message(self, message):
        if self.is_clear_time():
            self.tmr = time.time()
            [client.write_message('clear all') for client in self.connections]
        if message == 'initial update':
            self.write_message('IU' + str(mx))
            return
        try:
            spl = message.split(',')
            mx[int(spl[1])][int(spl[2])] = spl[0]
            if len(self.connections) > 1:
                for client in [i for i in self.connections if i != self]:
                    client.write_message(f"2,{spl[0]},{spl[1]},{spl[2]}")
        except:
            return

    def on_close(self):
        self.connections.remove(self)

    def is_clear_time(self):
        return time.time() - self.tmr >= PRD


def make_app():
    return tornado.web.Application([
        (r"/", MainHandler),
        (r"/static/.*", StaticHandler),
        (r"/websocket", WebSocket)
    ])


if __name__ == "__main__":
    app = make_app()
    print('http://127.0.0.1:' + str(port) + '/')
    app.listen(port=port, address='0.0.0.0')
    tornado.ioloop.IOLoop.current().start()
