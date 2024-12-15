console.log('Services');

class Services {
  static methodsStore = {};

  constructor() {
    if (Services.instance) {
      return Services.instance;
    }
    Services.instance = this;
  }

  static getInstance() {
    if (!Services.instance) {
      return (Services.instance = new Services());
    }
    return Services.instance;
  }

  static addMethods(eventName, cb) {
    if (typeof eventName !== 'string') {
      throw new Error('Event Name is not string');
    }
    if (typeof cb !== 'function') {
      throw new Error('Callback is not a function');
    }
    if (Services.methodsStore[eventName]) {
      Services.methodsStore[eventName].push(cb);
    } else {
      Services.methodsStore[eventName] = [cb];
    }
  }

  static removeMethod(eventName, cb) {
    if (typeof eventName !== 'string') {
      throw new Error('Event Name is not string');
    }
    if (typeof cb !== 'function') {
      throw new Error('Callback is not a function');
    }
    if (
      !Services.methodsStore[eventName] ||
      !Services.methodsStore[eventName].length
    ) {
      throw new Error('No Method is registered for this eventName');
    }
    Services.methodsStore[eventName] = Services.methodsStore[eventName].filter(
      (callback) => callback !== cb
    );
    if (!Services.methodsStore[eventName].length) {
      delete Services.methodsStore[eventName];
    }
  }

  static async invokeMethods(eventName, ...args) {
    if (typeof eventName !== 'string') {
      throw new Error('Event Name is not string');
    }
    if (
      !Services.methodsStore[eventName] ||
      !Services.methodsStore[eventName].length
    ) {
      throw new Error('No Method is registered for this eventName');
    }
    const promises = Services.methodsStore[eventName].map((callback) => {
      try {
        const result = callback(...args);
        return result instanceof Promise ? result : Promise.resolve(result);
      } catch (error) {
        console.log(`Some error occured for event name ${eventName}, ${error}`);
        return Promise.resolve();
      }
    });
    await Promise.all(promises);
  }

  static clearAllMethods() {
    Services.methodsStore = {};
  }
}
