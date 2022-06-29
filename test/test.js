// **************************************
// This file contains tests for solvelrr.
// **************************************

// Import the solvelrr package.
const solveLRR = require('solvelrr'); // npm package import.
//const solveLRR = require('../package/index.min.js'); // Local import.

// big.js isn't a dependency of solvelrr. I'm importing it here to
// test solvelrr's generalized arithmetic parameters. Of course,
// if you want to run the tests in this file, you will want to
// install big.js.
const Big = require('big.js');


// *************************************************************
// Some general utilities.

// Returns true iff the given lists l1 and l2 are
// equivalent (according to some comparison function).
function listElementsAreEqual( l1, l2, compare=((a,b)=>a===b)
){
  let len = l1.length;
  if(l2.length !== len){ return false }

  for(var i = 0; i < len; ++i)
  {
    if(!compare(l1[i], l2[i]))
    { return false }
  }
  return true
}

// Generates a range of test inputs.
function sampleDomain(min, max, step
){
  let dom = []
  for(var i = min; i < max; i+=step)
  { dom.push(i) }
  return dom
}

// *************************************************************
// Correctness tests.

/* Documentation for a few simple recurrences used as correctness tests.

Test 1: First order, homogeneous.
  Recurrence: f(n) = 3f(n-1), f(0) = 1.
  Input: [_=>3], [1]
  Closed Form: (n => 3**n)

Test 2: Second order, homogeneous with values always between -2 and 2; useful for testing very large inputs.
  Recurrence: f(n) = f(n-1) - f(n-2), f(0) = -1, f(1) = 1.
  Input: [_=>1,_=>-1], [-1,1].
  Closed Form: (n => round(sqrt(3)*Math.sin(Math.PI*n/3) - Math.cos(Math.PI*n/3)))

Test 3: First order, non-homogeneous
  Recurrence: f(n) = 2f(n-1) + 2^n, f(0) = 4.
  Input: [_=>2],[4], (n => 3**n)
  Closed Form: (n => 2**n + 3**(n+1))

Test 4: Second order, non-homogeneous
  Recurrence: f(n) = 2f(n-1) - f(n-2) + 2^n + 2, f(0) = 7, f(1) = 19
  Input: [_=>2,_=>-1], [7,19], (n => 2**n + 2)
  Closed Form: (n => n*(n+7) + 2**(n+2) + 3)

Test 5: Fourth order, homogeneous. Generates the repeating sequence -1,1,-1,1,4,1,-1,1,-1,-4.
  Recurrence f(n)=f(n-1)-f(n-2)+f(n-3)-f(n-4), f(0) = -1, f(1)=1, f(2)=-1, f(3)=1
  Input: [_=>1,_=>-1,_=>1,_=>-1], [-1,1,-1,1]
  Closed Form: (n => [-1,1,-1,1,4,1,-1,1,-1,-4][n%10])

Test 6: Second order, homogeneous.
  Recurrence: f(n) = f(n-1) + f(n-2), f(0) = f(1) = 1.
  Input: [_=>1,_=>1], [1,1].
  Closed Form: (n => round(((5+sqrt(5))/10)*((1+sqrt(5))/2)**n + ((5-sqrt(5))/10)*((1-sqrt(5))/2)**n))

Test 7: Third order, homogeneous.
  Recurrence: f(n) = -f(n-1) + 3f(n-2) - 2f(n-3), f(0) = 0, f(1) = 3, f(2) = -1.
  Input: [_=>-1,_=>3,_=>-2], [0,3,-1].
  Expected outputs: [0, 3, -1, 10, -19, 51, -128, 319, -805, 2018, ...]

Test 8: Fourth order, homogeneous.
  Recurrence: f(n) = 5f(n-1) + 0f(n-2) - 7f(n-3) + 2f(n-4), f(0) = 2, f(1) = -1, f(2) = 0, f(3) = 3.
  Input: [_=>5,_=>0,_=>-7,_=>2], [2,-1,0,3].
  Expected outputs: [2, -1, 0, 3, 26, 128, 619, 2919, 13751, 64678, ...]

Test 9: Fifth order, homogeneous.
  Recurrence: f(n) = 2f(n-1) - 3f(n-2) + 4f(n-3) - 5f(n-4) + 6f(n-5), f(0) = 1, f(1) = -2 , f(2) = 3 , f(3) = -4 , f(4) = 5.
  Input: [_=>2,_=>-3,_=>4,_=>-5,_=>6], [1,-2,3,-4,5].
  Expected outputs: [1, -2, 3, -4, 5, 50, 42, -8, 9, -10, ...]

Test 10: Second order, non-homogeneous, non-constant coefficients.
  Recurrence: f(n) = (2n+1)f(n-1) + (n^2)f(n-2) + 2n-1, f(0) = f(1) = 1.
  Input: [n=>2*n+1, n=>n*n], [1,1], (n => 2*n-1)
  Expected outputs: [1, 1, 12, 98, 1081, 14350, 225477, 4085318, 83880949, 1924648806, 48805719845, 1355414061982, 40913375207253, 1333726107070814, 46697078645675221, 1747697812106865030...]
*/
function runSimpleCorrectnessTests( memory_opt = false
){
  let sqrt = Math.sqrt, round = Math.round,
      size_filter = (x => x > Number.MIN_SAFE_INTEGER && x < Number.MAX_SAFE_INTEGER)

  let test_inputs = sampleDomain(0,100,1),
      // Test 1
      t1 = test_inputs.map(solveLRR([_=>3], [1], (_ => 0), memory_opt)).filter(size_filter),
      e1 = test_inputs.map(n => 3**n).filter(size_filter),
      // Test 2
      t2 = test_inputs.map(solveLRR([_=>1,_=>-1], [-1,1], (_ => 0), memory_opt)).filter(size_filter),
      e2 = test_inputs.map(n => round(sqrt(3)*Math.sin(Math.PI*n/3) - Math.cos(Math.PI*n/3))).filter(size_filter),
      // Test 3
      t3 = test_inputs.map(solveLRR([_=>2], [4], (n => 3**n), memory_opt)).filter(size_filter),
      e3 = test_inputs.map(n => 2**n + 3**(n+1)).filter(size_filter),
      // Test 4
      t4 = test_inputs.map(solveLRR([_=>2,_=>-1], [7,19], (n => 2**n + 2), memory_opt)).filter(size_filter),
      e4 = test_inputs.map(n => n*(n+7) + 2**(n+2) + 3).filter(size_filter),
      // Test 5
      t5 = test_inputs.map(solveLRR([_=>1,_=>-1,_=>1,_=>-1], [-1,1,-1,1])),
      e5 = test_inputs.map(n => [-1,1,-1,1,4,1,-1,1,-1,-4][n%10]),
      // Warning: the remaining tests are not as scalable.
      // They depend on explicit values rather than test_inputs and closed forms.
      // Test 6
      t6 = sampleDomain(0,65,1).map(solveLRR([_=>1,_=>1], [1,1], (_ => 0), memory_opt)).filter(size_filter),
      e6 = sampleDomain(0,65,1).map(n => round(((5+sqrt(5))/10)*((1+sqrt(5))/2)**n + ((5-sqrt(5))/10)*((1-sqrt(5))/2)**n) ).filter(size_filter),
      // Test 7
      t7 = [9,8,7,6,5,4,3,2,1,0].map(solveLRR([_=>-1,_=>3,_=>-2], [0,3,-1], (_ => 0), memory_opt)),
      e7 = [2018, -805, 319, -128, 51, -19, 10, -1, 3, 0],
      // Test 8
      t8 = [9,8,7,6,5,4,3,2,1,0].map(solveLRR([_=>5,_=>0,_=>-7,_=>2], [2,-1,0,3], (_ => 0), memory_opt)),
      e8 = [64678, 13751, 2919, 619, 128, 26, 3, 0, -1, 2],
      // Test 9
      t9 = [9,8,7,6,5,4,3,2,1,0].map(solveLRR([_=>2,_=>-3,_=>4,_=>-5,_=>6], [1,-2,3,-4,5], (_ => 0), memory_opt)),
      e9 = [-10, 9, -8, 42, 50, 5, -4, 3, -2, 1],
      // Test 10
      t10 = [9,8,7,6,5,4,3,2,1,0].map(solveLRR([n=>2*n+1, n=>n*n], [1,1], (n => 2*n-1), memory_opt)), 
      e10 = [1924648806,83880949,4085318,225477,14350,1081,98,12,1,1],
      // All tests
      Tests = [t1,t2,t3,t4,t5,t6,t7,t8,t9,t10], Expected=[e1,e2,e3,e4,e5,e6,e7,e8,e9,e10],
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
 
  return failed_tests
}


// A test (admittedly less-thorough) for recurrences with
// large-value terms using the big.js number library.
function runBigJSCorrectnessTest( memory_opt = false
){
  // A few high-value terms in the Fibonacci sequence.
  let fib100 = Big("573147844013817084101"),
      fib500 = Big("225591516161936330872512695036072072046011324913758190588638866418474627738686883405015987052796968498626"),
      fib1000 = Big("70330367711422815821835254877183549770181269836358732742604905087154537118196933579742249494562611733487750449241765991088186363265450223647106012053374121273867339111198139373125598767690091902245245323403501");

  // Build a high-accuracy solver for the Fibonacci recurrence with big.js.
  let fib = solveLRR( [_=>Big(1), _=>Big(1)],
                      [Big(1), Big(1)],
                      (_ => Big(0)),
                      memory_opt,
                      ((a,b) => a.add(b)),
                      ((a,b) => a.times(b)),
                      (_ => Big(0)));


  // Calculates a high value term from test #10; a second order non-homogeneous recurrence with non-constant coefficients.
  let crazy = solveLRR( [n=>Big(n).times(Big(2)).add(Big(1)), n=>Big(n).times(Big(n))],
                        [Big(1), Big(1)],
                        (n => Big(n).times(Big(2)).add(Big(-1))),
                        memory_opt,
                        ((a,b) => a.add(b)),
                        ((a,b) => a.times(b)),
                        (_ => Big(0)));
  let crazy15 = Big("1747697812106865030")

  return fib(500).eq(fib500)
      && fib(100).eq(fib100)
      && fib(1000).eq(fib1000)
      && crazy(15).eq(crazy15)
}


// Runs all of the correctness tests at once.
function runAllCorrectnessTests()
{
  let failed_mem_opt_tests = runSimpleCorrectnessTests(true),
      failed_no_mem_opt_tests = runSimpleCorrectnessTests(false),
      high_accutacy_mem_opt_test = runBigJSCorrectnessTest(true),
      high_accutacy_no_mem_opt_test = runBigJSCorrectnessTest(false),
      all_tests_passed = true;

  if(failed_mem_opt_tests.length !== 0) { console.log("Simple correctness test with memory optimization failed."); all_tests_passed = false; }
  if(failed_no_mem_opt_tests.length !== 0) { console.log("Simple correctness test without memory optimization failed."); all_tests_passed = false; }
  if(!high_accutacy_mem_opt_test) { console.log("High accuracy correctness test with memory optimization failed."); all_tests_passed = false; }
  if(!high_accutacy_no_mem_opt_test) { console.log("High accuracy correctness test without memory optimization failed."); all_tests_passed = false; }
  if(all_tests_passed) { console.log("All Correctness Tests Passed!"); }
}


// Run the correctness tests.
runAllCorrectnessTests()


/*

function runExecutionTimeTest()
{
  let start, end, f_val;
  let times = [];
  let f = solveLRR( [n=>Big(n).times(Big(2)).add(Big(1)), n=>Big(n).times(Big(n))],
                    [Big(1), Big(1)],
                    (n => Big(n).times(Big(2)).add(Big(-1))),
                    false,
                    ((a,b) => a.add(b)),
                    ((a,b) => a.times(b)),
                    (_ => Big(0)));

  for(var i = 0; i < 10000; i+=1)
  {
    start = performance.now()
    f_val = f(10000-i)
    end = performance.now()
    times.push(end-start)
  }

  console.log(times.toString())

  return times
}

runExecutionTimeTest()

*/
