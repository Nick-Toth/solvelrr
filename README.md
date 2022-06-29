# solvelrr

A lightweight and flexible NPM package for solving linear recurrence relations.

## Description

solvelrr consists of a single function, solveLRR, which takes a list of functional coefficients and a list of constant initial terms for any linear recurrence relations with functional coefficients, and returns a function from the non-negative integers to the sequence defined by the given recurrence.

If your recurrence is homogeneous, then you only need to pass a list of coefficients and a list of initial terms. For example, if you want a solution to the recurrence f(n) = f(n-1) - 2f(n-2), with initial terms f(0) = -1 and f(1) = 1, then the call to solveLRR will look something like ```solveLRR([_=>1,_=>-2], [-1,1])```.

If your recurrence is non-homogeneous, then you must pass a third parameter specifying the non-homogeneous term as a function of the term index. For example, if you want a solution to the non-homogeneous recurrence f(n) = 2f(n-1) - f(n-2) + 2^n + 2, with initial terms f(0) = 7 and f(1) = 19, then the call to solveLRR will look something like ```solveLRR([_=>2,_=>-1], [7,19], (n => 2**n + 2))```.

Each of the recurrences described above have constant coefficients, but functional coefficients should work in exactly the way you would expect. For example, if you recurrence is f(n) = (2n+1)f(n-1) + (n^2)f(n-2) + 2n-1, f(0) = f(1) = 1, then the call to solveLRR will look something like ```solveLRR([n=>2*n+1, n=>n*n], [1,1], (n => 2*n-1))```.

By default, the returned function will maintain a list of previously calculated values (requiring linear space). If you want to conserve memory, you can pass a fourth argument (memory_opt = true). In that case, the solution will be slower in practice (although the worst-case time complexity is the same in either case), but it will only require constant space.

### Warning About Default Precision

solvelrr does not use any special data types, so calculations requiring high-precision may fail with default settings. To combat this issue, I've designed solvelrr to allow for easy integration with generalized numeric types. Simply ensure that numeric arguments have the desired custom type, and pass custom arithmetic functions to solveLRR. Keep reading or checkout test/test.js to see how you can use a library like <a href="https://github.com/MikeMcl/big.js/" target="_blank">big.js</a> to achieve arbitrary precision with solvelrr.

## Getting Started

### Install

```
npm install solvelrr
```

### Usage

1. Include the following line in your project
```
const solveLRR = require('solvelrr');
```
2. Construct a solution by calling solveLRR as directed in the description.
```
const fibonacci = solveLRR([_=>1,_=>1], [1,1])
```
3. Call your solution on any non-negative integer k to obtain the k'th term in the sequence.
```
[0,1,2,3,4,5].map(fibonacci) // [1,1,2,3,5,8]
```

### Example of integration with <a href="https://github.com/MikeMcl/big.js/" target="_blank">big.js</a>.

First install big.js with the command ```npm install big.js```
```
const Big = require('big.js'),
      coefficients = [_=>Big(1), _=>Big(1)], // Coefficients as functions from a Non-Negative-Integer to a number of type Big.
      initial_terms = [Big(1), Big(1)],      // Initial terms of type Big.
      non_hom_term = (_ => Big(0)),          // A non-homogeneous term as a function from a Non-Negative-Integer to a number of type Big.
      use_mem_opt = false,                   // Or true, if you want to use the low-memory option.
      add = ((a,b) => a.add(b)),             // A binary operator representing addition of Big types.
      multiply = ((a,b) => a.times(b)),      // A binary operator representing multiplication of Big types.
      zero = (_ => Big(0));                  // A function that always returns zero (for resetting an internal sum).

let fibonacci = solveLRR(coefficients, initial_terms, non_hom_term, use_mem_opt, add, multiply, zero);

// Note: At this point, calls to fibonacci are the same as they were before; you should NOT pass values of type Big to the function returned by solveLRR.
// Outputs, however, will have type Big, so you will need to interface with big.js to deal with the result. For example:

let fib100 = fibonacci(100);
console.log("The 100th Fibonacci number is ", fib100.toString())
console.log("test: ", fib100.eq(Big("573147844013817084101")))
```
Integrating other generalized number types should work in almost exactly the same way.

<!--
## Help

Any advise for common problems or issues.
```
command to run if program contains helper info
```
-->
## Authors

  Nick G. Toth

## Version History
<!--
* 0.2
    * Various bug fixes and optimizations
    * See [commit change]() or [release history]()
-->
* 0.1
    * Initial Release

## License

This project is licensed under the MIT License - see the LICENSE file for details

## Acknowledgments

Thanks to DomPizzie for the README template!
