class RecorderProcessor extends AudioWorkletProcessor {
    constructor() {
      super();
      this.buffer = [];
    }
  
    process(inputs) {
      this.port.postMessage(inputs[0][0]);
      return true;
    }
  }
  
  registerProcessor('recorder-processor', RecorderProcessor);
  