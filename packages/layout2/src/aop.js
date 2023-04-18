export function before(fn, beforefn) {
  return function() {
    beforefn.apply(this, arguments);
    return fn.apply(this, arguments);
  };
}

export function after(fn, beforefn) {
  return function() {
    let result = fn.apply(this, arguments);
    return beforefn.apply(this, [result]);
  };
}
