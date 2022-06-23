# solvelrr

A lightweight NPM package for solving linear recurrence relations with constant coefficients.

## Description

solvelrr consists of a single function, solveLRR, which takes the coefficients and initial terms for any linear recurrence relations with constant coefficients, and returns a function from the non-negative integers to the sequence defined by the given recurrence.

If your recurrence is homogeneous, then you only need to pass a list of coefficients and a list of initial terms. For example, if you want a solution to the homogeneous recurrence f(n) = f(n-1) - f(n-2), with initial terms f(0) = -1 and f(1) = 1, then the call to solveLRR will look like ```solveLRR([1,-1], [-1,1])```. In this case, solutions run in worst case linear time. 

If your recurrence is non-homogeneous, then you must pass a third parameter specifying the non-homogeneous term as a function of n (as in: the n'th term of the sequence). For example, if you want a solution to the non-homogeneous recurrence f(n) = 2f(n-1) - f(n-2) + 2^n + 2, with initial terms f(0) = 7 and f(1) = 19, then the call to solveLRR will look like ```solveLRR([2,-1], [7,19], (n => 2**n + 2))```. In this case, solutions run in O(n)*O(h) time, where O(h) denotes the time complexity of evaluating the non-homogeneous term.

By default, the returned function will maintain a list of previously calculated values (requiring linear space). If you want to conserve memory, you can pass a fourth argument (memory_opt = true). In that case, the solution will be slower in practice (although the worst-case time complexity is O(n)*O(h) in either case), but it will only require constant space.

It is possible to achieve more efficient solutions to these problems by solving for the roots of characteristic polynomials, but that method would require unreliable numerical methods when dealing with higher order recurrences. solvelrr was designed to be general, reliable, simple, and dependency-free.

## Getting Started

### Install

```
npm install solvelrr
```

### Executing program

1. Include the following line in your project
```
const solveLRR = require('solvelrr');
```
2. Call solveLRR as directed in the description.

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

* 0.2
    * Various bug fixes and optimizations
    * See [commit change]() or [release history]()
* 0.1
    * Initial Release

## License

This project is licensed under the MIT License - see the LICENSE file for details

## Acknowledgments

Thanks to DomPizzie for the README template!
