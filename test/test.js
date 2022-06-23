const solveLRR = require('solvelrr');

// *****************
// Correctness tests
// *****************

/* Documentation for a few correctness tests.

Test 1: First order, homogeneous.
  Recurrence: f(n) = 3f(n-1), f(0) = 1.
  Input: [3], [1]
  Closed Form: (n => 3**n)

Test 2: Second order, homogeneous with values always between -2 and 2; useful for testing very large inputs.
  Recurrence: f(n) = f(n-1) - f(n-2), f(0) = -1, f(1) = 1.
  Input: [1,-1], [-1,1].
  Closed Form: (n => round(sqrt(3)*Math.sin(Math.PI*n/3) - Math.cos(Math.PI*n/3)))

Test 3: First order, non-homogeneous
  Recurrence: f(n) = 2f(n-1) + 2^n, f(0) = 4.
  Input: [2],[4], (n => 3**n)
  Closed Form: (n => 2**n + 3**(n+1))

Test 4: Second order, non-homogeneous
  Recurrence: f(n) = 2f(n-1) - f(n-2) + 2^n + 2, f(0) = 7, f(1) = 19
  Input: [2,-1], [7,19], (n => 2**n + 2)
  Closed Form: (n => n*(n+7) + 2**(n+2) + 3)

Test 5: Fourth order, homogeneous. Generates the repeating sequence -1,1,-1,1,4,1,-1,1,-1,-4.
  Recurrence f(n)=f(n-1)-f(n-2)+f(n-3)-f(n-4), f(0) = -1, f(1)=1, f(2)=-1, f(3)=1
  Input: [1,-1,1,-1], [-1,1,-1,1]
  Closed Form: (n => [-1,1,-1,1,4,1,-1,1,-1,-4][n%10])

Test 6: Second order, homogeneous.
  Recurrence: f(n) = f(n-1) + f(n-2), f(0) = f(1) = 1.
  Input: [1,1], [1,1].
  Closed Form: (n => round(((5+sqrt(5))/10)*((1+sqrt(5))/2)**n + ((5-sqrt(5))/10)*((1-sqrt(5))/2)**n))

Test 7: Third order, homogeneous.
  Recurrence: f(n) = -f(n-1) + 3f(n-2) - 2f(n-3), f(0) = 0, f(1) = 3, f(2) = -1.
  Input: [-1,3,-2], [0,3,-1].
  Expected outputs: [0, 3, -1, 10, -19, 51, -128, 319, -805, 2018, ...]

Test 8: Fourth order, homogeneous.
  Recurrence: f(n) = 5f(n-1) + 0f(n-2) - 7f(n-3) + 2f(n-4), f(0) = 2, f(1) = -1, f(2) = 0, f(3) = 3.
  Input: [5,0,-7,2], [2,-1,0,3].
  Expected outputs: [2, -1, 0, 3, 26, 128, 619, 2919, 13751, 64678, ...]

Test 9: Fifth order, homogeneous.
  Recurrence: f(n) = 2f(n-1) - 3f(n-2) + 4f(n-3) - 5f(n-4) + 6f(n-5), f(0) = 1, f(1) = -2 , f(2) = 3 , f(3) = -4 , f(4) = 5.
  Input: [2,-3,4,-5,6], [1,-2,3,-4,5].
  Expected outputs: [1, -2, 3, -4, 5, 50, 42, -8, 9, -10, ...]
*/


function runCorrectnessTests( memory_opt = false
){
  // Returns true iff the given lists l1 and l2 are equivalent (according to some comparison function).
  function listElementsAreEqual( l1, l2, compare=((a,b)=>a===b)
  ){
    let len = l1.length;
    if(l2.length !== len){ return false }
    for(var i = 0; i < len; ++i)
    { if(!compare(l1[i], l2[i])) { console.log("list elements different; [i,l1[i], l2[i]] = ", [i,l1[i], l2[i]]); return false } }
    return true
  }

  // Generates a range of test inputs.
  function sampleDomain(min, max, step)
  {
    let dom = []
    for(var i = min; i < max; i+=step)
    { dom.push(i) }
    return dom
  }

  let sqrt = Math.sqrt, round = Math.round,
      size_filter = (x => x > Number.MIN_SAFE_INTEGER && x < Number.MAX_SAFE_INTEGER)

  let test_inputs = sampleDomain(0,100,1),
      // Test 1
      t1 = test_inputs.map(solveLRR([3], [1], (_ => 0), memory_opt)).filter(size_filter),
      e1 = test_inputs.map(n => 3**n).filter(size_filter),
      // Test 2
      t2 = test_inputs.map(solveLRR([1,-1], [-1,1], (_ => 0), memory_opt)).filter(size_filter),
      e2 = test_inputs.map(n => round(sqrt(3)*Math.sin(Math.PI*n/3) - Math.cos(Math.PI*n/3))).filter(size_filter),
      // Test 3
      t3 = test_inputs.map(solveLRR([2], [4], (n => 3**n), memory_opt)).filter(size_filter),
      e3 = test_inputs.map(n => 2**n + 3**(n+1)).filter(size_filter),
      // Test 4
      t4 = test_inputs.map(solveLRR([2,-1], [7,19], (n => 2**n + 2), memory_opt)).filter(size_filter),
      e4 = test_inputs.map(n => n*(n+7) + 2**(n+2) + 3).filter(size_filter),
      // Test 5
      t5 = test_inputs.map(solveLRR([1,-1,1,-1], [-1,1,-1,1])),
      e5 = test_inputs.map(n => [-1,1,-1,1,4,1,-1,1,-1,-4][n%10]),
      // Warning: the remaining tests are not as scalable.
      // They depend on explicit values rather than test_inputs and closed forms.
      // Test 6
      t6 = sampleDomain(0,65,1).map(solveLRR([1,1], [1,1], (_ => 0), memory_opt)).filter(size_filter),
      e6 = sampleDomain(0,65,1).map(n => round(((5+sqrt(5))/10)*((1+sqrt(5))/2)**n + ((5-sqrt(5))/10)*((1-sqrt(5))/2)**n) ).filter(size_filter),
      // Test 7
      t7 = [9,8,7,6,5,4,3,2,1,0].map(solveLRR([-1,3,-2], [0,3,-1], (_ => 0), memory_opt)),
      e7 = [2018, -805, 319, -128, 51, -19, 10, -1, 3, 0],
      // Test 8
      t8 = [9,8,7,6,5,4,3,2,1,0].map(solveLRR([5,0,-7,2], [2,-1,0,3], (_ => 0), memory_opt)),
      e8 = [64678, 13751, 2919, 619, 128, 26, 3, 0, -1, 2],
      // Test 9
      t9 = [9,8,7,6,5,4,3,2,1,0].map(solveLRR([2,-3,4,-5,6], [1,-2,3,-4,5], (_ => 0), memory_opt)),
      e9 = [-10, 9, -8, 42, 50, 5, -4, 3, -2, 1],
      // All tests
      Tests = [t1,t2,t3,t4,t5,t6,t7,t8,t9], Expected=[e1,e2,e3,e4,e5,e6,e7,e8,e9],
      failed_tests = [];

  for(var i = 0; i < Tests.length; ++i)
  {
    let ti = Tests[i], ei = Expected[i]
    let num_terms = Math.min(ti.length, ei.length)
    ti = ti.slice(0, num_terms)
    ei = ei.slice(0, num_terms)

    if(!listElementsAreEqual(ti, ei))
    {
      console.log("Correctness Test #" + (i+1).toString() + " Failed!")
      console.log("\tExpected Values: " + ti);
      console.log("\tActual Values: " + ei);
      failed_tests.push(i)
    }
  }

  if(failed_tests.length === 0) { console.log("All Correctness Tests Passed!"); }
 
  return failed_tests
}

// ********************
// Execution time tests
// ********************

function runExecutionTimeTest(coefficients, initial_terms, non_homogeneous_term)
{
  let start, end, f_val, g_val;
  let times_mem_opt = [], times_no_mem_opt = [];
  for(var i = 0; i < 100; ++i)
  {
    let f = solveLRR(coefficients, initial_terms, non_homogeneous_term, true), // Test with memory optimization
        g = solveLRR(coefficients, initial_terms, non_homogeneous_term, false), // Test without memory optimization.
        x = 100000*i;

    start = performance.now()
    f_val = f(x)
    end = performance.now()
    times_mem_opt.push(end-start)

    start = performance.now()
    g_val = g(x)
    end = performance.now()
    times_no_mem_opt.push(end-start)
  }

  console.log(times_mem_opt.toString())
  console.log(times_no_mem_opt.toString())

  return [times_mem_opt, times_no_mem_opt]
}

// *********
// Run tests
// *********

// Tests correctness of solveLRR
let failed_mem_opt_tests = runCorrectnessTests(true),     // with memory optimization
    failed_no_mem_opt_tests = runCorrectnessTests(false); // without memory optimization

// Compares the execution time of solveLRR with and without optimization.
// Uses the recurrence from correctness test 3, whose values are always
// bounded between -2 and 2, so that we can test large inputs. 
//let exe_times1 = runExecutionTimeTest([1,-1], [-1,1], (_ => 0)),
//    exe_times2 = runExecutionTimeTest([1,-1,1,-1], [-1,1,-1,1], (_ => 0));
