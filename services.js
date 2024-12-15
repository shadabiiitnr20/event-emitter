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

function demoServices() {
  // const services = Services.getInstance();

  console.log('--- Testing Services Class ---');

  // Define synchronous and asynchronous callbacks
  const syncCallback1 = () => console.log('Sync callback 1 executed.');
  const syncCallback2 = () => console.log('Sync callback 2 executed.');
  const asyncCallback1 = async () => {
    console.log('Async callback 1 started.');
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log('Async callback 1 completed.');
  };
  const asyncCallback2 = async () => {
    console.log('Async callback 2 started.');
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log('Async callback 2 completed.');
  };

  // Add methods
  console.log('Adding methods...');
  Services.addMethods('event1', syncCallback1);
  Services.addMethods('event1', asyncCallback1);
  Services.addMethods('event2', syncCallback2);
  Services.addMethods('event2', asyncCallback2);
  console.log('Methods added.');

  // Invoke methods for event1
  console.log('\nInvoking methods for event1...');
  Services.invokeMethods('event1').then(() => {
    console.log('All event1 callbacks executed.');

    // Invoke methods for event2
    console.log('\nInvoking methods for event2...');
    Services.invokeMethods('event2').then(() => {
      console.log('All event2 callbacks executed.');

      // Remove a specific callback
      console.log('\nRemoving a method...');
      Services.removeMethod('event1', syncCallback1);
      console.log('Sync callback 1 removed from event1.');

      // Invoke methods for event1 after removal
      console.log('\nInvoking methods for event1 after removal...');
      Services.invokeMethods('event1').then(() => {
        console.log('Remaining event1 callbacks executed.');

        // Clear all methods
        console.log('\nClearing all methods...');
        Services.clearAllMethods();
        console.log('All methods cleared.');

        // Attempt to invoke a cleared event
        console.log('\nAttempting to invoke cleared event1...');
        try {
          Services.invokeMethods('event1');
        } catch (error) {
          console.error(error.message);
        }
      });
    });
  });
}

// Run the demo
demoServices();
