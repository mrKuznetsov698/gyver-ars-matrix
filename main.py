import os
import tornado.ioloop
import tornado.web
import tornado.websocket

WIDTH = 80
HEIGHT = 45
port = int(os.getenv('PORT', 80))
mx = [['#000000' for j in range(HEIGHT)] for i in range(WIDTH)]


class MainHandler(tornado.web.RequestHandler):
    def get(self):
        self.render("static/index.html")


class StaticHandler(tornado.web.RequestHandler):
    def get(self):
        try:
            self.write(open(self.request.uri[1:], 'rb').read())
        except BaseException as ex:
            self.write('404 File not found\n' + str(ex))


class WebSocket(tornado.websocket.WebSocketHandler):
    connections = []
    #
    # def check_origin(self, origin):
    #     if 'Mozilla/5.0' not in self.request.headers._dict.get('User-Agent'):
    #         return False
    #     return True

    def open(self):
        self.connections.append(self)

    def on_message(self, message):
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


def make_app():
    return tornado.web.Application([
        (r"/", MainHandler),
        (r"/static/.*", StaticHandler),
        (r"/websocket", WebSocket)
    ])


if __name__ == "__main__":
    app = make_app()
    print('http://127.0.0.1:' + str(port) + '/')
    app.listen(port)
    tornado.ioloop.IOLoop.current().start()
