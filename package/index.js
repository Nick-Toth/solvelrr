/* *************************************************************************************
// solveLRR takes the coefficients and initial terms for any linear recurrence relation
// with functional coefficients, and returns a function from the non-negative integers
// to the sequence defined by the given recurrence.
//
// Warning: By default, this function uses built-in types that won't scale very well.
// For example, if your recurrence attains large values, or high-precision floats, you
// may need to use custom data types. See the "SCALING / CUSTOM DATA TYPES" comment for
// more information.
//
// HOMOGENEOUS RECURRENCES:
// If your recurrence is homogeneous with constant coefficients, then you only need to
// pass a list of coefficients and a list of initial terms. In this case, solutions run
// in worst case linear time. Note that the coefficients are functional in general, so
// constant coefficients should be passed as constant valued functions.
//
// NON-HOMOGENEOUS RECURRENCES:
// If your recurrence is non-homogeneous with constant coefficients, then you must pass
// a third parameter specifying the non-homogeneous term as a function of the sequence
// index. For example, if you want a solution to the non-homogeneous recurrence
// f(n) = 2f(n-1) - f(n-2) + 2^n + 2, with initial terms f(0) = 7 and f(1) = 19, and
// non-homogeneous term 2^n+2, then the call to solveLRR will look something like
// solveLRR([_=>2,_=>-1], [7,19], (n => 2**n+2)). In this case, solutions run in
// O(nh) time, where h represents the time complexity of the non-homogeneous term.
// You should also factor in the complexity of the coefficient functions, if necessary.
//
// MEMORY OPTIMIZATION:
// By default, the returned function will maintain a list of previously calculated
// values (requiring linear space). If you want to conserve memory, you can pass a
// fourth argument (memory_opt = true). In that case, the solution will be slower
// in practice (although the worst-case time complexity is the same in either case),
// but it will only require constant space.
//
// SCALING / CUSTOM DATA TYPES:
// If you experience or anticipate issues with the accuracy of this method, you can
// easily use custom datatypes and arithmetic functions to achieve arbitrary accuracy.
// In particular, let T denote the desired custom datatype. Then the elements of
// coefficients are functions of the term index (regular non-negative integers) that
// return objects of type T, the elements of initial_terms have type T, non_hom_term
// returns an object of type T, the 'add' and 'multiply' arguments have type (T,T) -> T,
// and the 'zero' argument is simply a function with no arguments that returns an
// additive identity of type T. I recommend using big.js. See the README for an example.
//
// *************************************************************************************/
function solveLRR( coefficients
                   // A list containing the recurrence coefficients as functions of the index term.
                   // If you want to use constant coefficients, simply let these functions return constants.
                   // e.g. For the recurrence f(n) = 1*f(n-1) + 2*f(n-2) + 3*f(n-3), you would have coefficients = [_=>1,_=>2,_=>3].
,                  initial_terms
                   // The first terms of the sequence. There must be k initial terms for a k'th order recurrence.
                   // In other words, the size of initial_terms must match the size of coefficients.
,                  non_hom_term = (_ => 0.0)
                   // The constant term (a function of n) in a non-homogeneous recurrence.
                   // Use non_hom_term = (_ => 0) for homogeneous recurrences.
,                  memory_opt = false
                   // If memory_opt is false (default), then the returned function will remember previous calculations and require linear persistent memory.
                   // If memory_opt is true, then the returned function will require constant memory, O(order), but it won't remember earlier calculations.
                   // The time complexity of the returned function is linear in either case (assuming that non_hom_term is constant).
,                  add = ((a,b) => a+b)
,                  multiply = ((a,b) => a*b)
,                  zero = (() => 0.0)
                   // Pass custom add, multiply, and zero functions if you're using custom data types.
){
  // Create a copy of initial_terms so that the original list won't be mutated by this function.
  let initial_terms_og = [...initial_terms]

  // Verify that there are as many coefficients as initial terms.
  if(coefficients.length !== initial_terms_og.length)
  { return Error("solveLRR Error -- coefficients and initial_terms must have the same length! " + [coefficients,initial_terms].toString() ) }

  // Finally, construct a function of non-negative integers representing the sequence. (i.e. construct the solution).
  return (n => {

    let // List containing all known terms in the sequence.
        it = memory_opt? [...initial_terms_og] : initial_terms_og,
        largest_calculated_index = it.length, // Technically largest_calculated_index-1 is the largest calculated index.
        // Loop control variables.
        i=0, j=0,
        // Temporary memory for calculating terms.
        ith_rr_term = zero();

    // If the nth term has already been calculated, then return it.
    if (n < largest_calculated_index){ return it[n]; }

    // At this point, the nth term hasn't been calculated yet, so we need to calculate all of the terms starting from the largest known term.
    for (i = largest_calculated_index; i <= n; ++i)
    {
      // Loop through the coefficients to calculate the ith term in the sequence.
      for (j = 1; j <= coefficients.length; ++j)
      {
        ith_rr_term = add( ith_rr_term,
                           multiply( it[(memory_opt? largest_calculated_index : i)-j],
                                     coefficients[j-1](i)))
      }

      // Add the non-homogeneous term to obtain the ith term in the sequence.
      ith_rr_term = add(ith_rr_term, non_hom_term(i))

      // We have calculated the ith term, so we can add it to the list.
      it.push(ith_rr_term);

      // If we are trying to conserve memory, then we can remove the first value; the next term won't depend on it.
      if(memory_opt){ it.shift() }

      // Reset the temporary memory for calculating the next term.
      ith_rr_term = zero();
    }

    // Finally, return the n'th term in the sequence.
    return memory_opt? it[largest_calculated_index-1] : it[n]
  })
}

module.exports = solveLRR
