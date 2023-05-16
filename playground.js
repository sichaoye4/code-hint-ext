// write an function that debounce in js

// write an function that debounces in typescript
// Debounce function
function debounce(func: () => void, wait: number) {
  let timeout: NodeJS.Timeout;

  return function () {

    const context = this, args = arguments;
    
    clearTimeout(timeout);

    timeout = setTimeout(function () {
      func.apply(context, args);
    }, wait);
  }
}

// Usage:
const myDebounce = debounce(() => { 
  //code you want to execute after certain ammount of time
}, 1000);

myDebounce();