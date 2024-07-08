export class Message {
  type: string;
  payload: Record<string, unknown>;

  constructor(type: string, payload = {}) {
    this.type = type;
    this.payload = payload;
  }

  static build(type: string, payload = {}) {
    return new Message(type, payload);
  }

  static parse(data: string) {
    const { type, payload } = JSON.parse(data.toString());
    return new Message(type, payload);
  }

  toString() {
    return JSON.stringify({ type: this.type, payload: this.payload });
  }
}
