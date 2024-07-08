export class JSONBuffer {
  constructor() {
    this.buffer = '';
    this.callback = () => {};
    this.onceCallback = () => {};
  }

  setCallback(callback) {
    this.callback = callback;
  }

  setOnceCallback(callback) {
    this.onceCallback = callback;
  }

  removeCallback() {
    this.callback = () => {};
  }

  runCallbacks(jsonString) {
    this.callback(jsonString);
    this.onceCallback(jsonString);
    this.onceCallback = () => {};
  }

  clear() {
    this.buffer = '';
  }

  feed(data) {
    this.buffer += data;

    let startIndex = 0;
    let validIndex = -1;

    for (let i = 0; i < this.buffer.length; i++) {
      try {
        JSON.parse(this.buffer.slice(startIndex, i + 1));
        validIndex = i;
      } catch (error) {
        // JSON parsing error, continue searching for the next valid JSON string
        continue;
      }

      if (validIndex !== -1) {
        const jsonString = this.buffer.slice(startIndex, validIndex + 1);
        this.runCallbacks(jsonString);
        startIndex = validIndex + 1;
        validIndex = -1;
      }
    }

    // Remove processed JSON strings from the buffer
    this.buffer = this.buffer.slice(startIndex);
  }
}
