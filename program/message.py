import ujson


class Message:
    def __init__(self, type, payload={}):
        self.type = type
        self.payload = payload

    @staticmethod
    def parse(data):
        return Message(**ujson.loads(data))

    def __str__(self):
        return ujson.dumps({"type": self.type, "payload": self.payload})
