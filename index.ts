class MyPromise {
  private callbacksQueue = [];

  constructor(executor: (resolve: (params: any) => void, reject?: (params: any) => void) => void) {
    executor((params: any) => {
      setTimeout(() => {
        this.handleCallbacksQueue(params, false);
      }, 0);
    }, (params: any) => {
      setTimeout(() => {
        this.handleCallbacksQueue(params, true);
      }, 0);
    });
  }

  private handleCallbacksQueue(tempRes: any, fail: boolean): void {
    let callback = undefined;
    while(callback = this.callbacksQueue.shift()) {
      if (callback[0] === 'then' && !fail) {
        try {
          tempRes = callback[1](tempRes);
        } catch (error) {
          fail = true;
          tempRes = error;
        }
      } else if (callback[0] === 'catch' && fail) {
        fail = false;
        try {
          tempRes = callback[1](tempRes);
        } catch (error) {
          fail = true;
          tempRes = error;
        }
      }
    }
    if (fail) {
      throw new Error('Unhandled MyPromise error: ' + tempRes);
    }
  }

  public then(thenCallback: (params: any) => any) {
    this.callbacksQueue.push(['then', thenCallback]);
    return this;
  }

  public catch(catchCallback: (params: any) => any) {
    this.callbacksQueue.push(['catch', catchCallback]);
    return this;
  }
}

function main() {
  console.log('start');

  // test(Promise, 'res');
  test(MyPromise, 'res');

  // test(Promise, 'rej');
  // test(MyPromise, 'rej');

  console.log('end');
}
main();


function test(PromiseClass: { new(callback: (...params: any) => any): Promise<any> | MyPromise }, resOrRej: 'res'| 'rej') {
  console.log('test', PromiseClass.name, resOrRej);

  const promise = new PromiseClass((res, rej) => {
    console.log('promise constructor');
    res('timeout');
  
    setTimeout(() => {
      if (resOrRej === 'res') {
        // res('timeout');
      } else {
        rej('timeout')
      }
    }, 1000);
  })

  promise
  .then(val => {
    console.log('then 1, prev', val);
    return 'then 1'
  })
  .then(val => {
    console.log('then 2, prev', val);
    return 'then 2';
  })
  .then(val => {
    console.log('then 3, prev', val);
    return 'then 3';
  })
  .catch(err => {
    console.log('catch 1', err);
    return 'catch 1';
  })
  .then(val => {
    console.log('then 4', val);
    throw 'then 4';
  })
  .catch(err => {
    console.log('catch 2', err);
  })
  .catch(err => {
    console.log('catch 3', err);
  });

}
