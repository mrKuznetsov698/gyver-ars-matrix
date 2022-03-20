import os
import tornado.ioloop
import tornado.web
import tornado.websocket

WIDTH = 80
HEIGHT = 45
port = int(os.getenv('PORT', 80))
mx = [[0 for j in range(HEIGHT)] for i in range(WIDTH)]


class MainHandler(tornado.web.RequestHandler):
    def get(self):
        self.render("static/index.html")


class StaticHandler(tornado.web.RequestHandler):
    def get(self):
        try:
            MyPath = os.path.abspath('.')
            self.write(open(MyPath+self.request.uri.replace('/', '\\'), 'rb').read())
        except BaseException as ex:
            self.write('404 File not found\n' + str(ex))


class WebSocket(tornado.websocket.WebSocketHandler):
    connections = set()

    def check_origin(self, origin):
        return True

    def open(self):
        self.connections.add(self)

    def on_message(self, message):
        if message == 'initial update':
            self.write_message('IU' + str(mx))
            return
        try:
            spl = message.split(',')
            mx[int(spl[1])][int(spl[2])] = int(spl[0])
            [client.write_message(f"2,{spl[0]},{spl[1]},{spl[2]}") for client in self.connections]
        except:
            return
        # [client.write_message('You send: ' + message) for client in self.connections]

    def on_close(self):
        self.connections.remove(self)


def make_app():
    return tornado.web.Application([
        (r"/", MainHandler),
        (r"/static/.*", StaticHandler),
        (r"/websocket", WebSocket)
    ])


if __name__ == "__main__":
    files = [f for f in os.listdir('.') if os.path.isfile(f)]
    for f in files:
        print (f)
    app = make_app()
    app.listen(port)
    tornado.ioloop.IOLoop.current().start()
