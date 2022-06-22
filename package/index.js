/* ************************************************************
\\ solveLRR takes the coefficients and initial terms for any
// linear recurrence relation with constant coefficients, and
\\ returns a worst-case constant time function from the
// non-negative integers to the sequence defined by the given
\\ recurrence. 
//
\\ If your recurrence is HOMOGENEOUS, then you only need to
// pass a list of coefficients and a list of initial terms.
\\
// If your recurrence is NON-HOMOGENEOUS, then you must pass
\\ a third parameter specifying the non-homogeneous term as
// a function of n (as in: the n'th term of the sequence).
\\ For example, if you want a solution to the non-homogeneous
// recurrence f(n) = 2f(n-1) - f(n-2) + 2^n + 2, with initial
\\ terms f(0) = 7 and f(1) = 19, then the call to solveLRR
// will look like solveLRR([2,-1], [7,19], (n => 2**n + 2)).
\\ 
// By default, the returned function will maintain a list
\\ of previously calculated values (requiring linear space).
// If you want to conserve memory, you can pass a fourth
\\ argument (memory_opt = true). In that case, the function
// will be slower in practice (although the worst-case time
\\ complexity is liner in either case), but it will only
// require constant space.
\\ 
// See internal comments for implementation details.
\\
// ************************************************************/
function solveLRR( coefficients
                   // A list containing the recurrence coefficients.
                   // e.g. For the recurrence f(n) = 1*f(n-1) + 2*f(n-2) + 3*f(n-3), you would have coefficients = [1,2,3].
,                  initial_terms
                   // The first terms of the sequence. There must be k initial terms for a k'th order recurrence.
                   // In other words, the size of initial_terms must match the size of coefficients.
,                  non_homogeneous_term = (_ => 0)
                   // The constant term (a function of n) in a non-homogeneous recurrence.
                   // Use non_homogeneous_term = (_ => 0) for homogeneous recurrences.
,                  memory_opt = false
                   // If memory_opt is false (default), then the returned function will remember previous calculations and require linear persistent memory.
                   // If memory_opt is true, then the returned function will require constant memory, O(order), but it won't remember earlier calculations.
                   // The time complexity of the returned function is linear in either case (assuming that non_homogeneous_term is constant).
){
  // Create a copy of initial_terms so that the list passed to avoid unwanted mutation.
  let initial_terms_og = [...initial_terms]

  // Verify that there are as many coefficients as initial terms.
  if(coefficients.length !== initial_terms_og.length)
  { return Error("solveLRR Error -- coefficients and initial_terms must have the same length! " + [coefficients,initial_terms].toString() ) }

  // Finally, construct a function of non-negative integers representing the sequence. (i.e. construct the solution).
  return (n => {

    let // List containing all known terms in the sequence.
        it = memory_opt? [...initial_terms_og] : initial_terms_og,
        largest_calculated_index = it.length,
        // Loop control variables.
        i=0, j=0,
        // Temporary memory for calculating terms.
        ith_rr_term = 0;

    // If the nth term has already been calculated, then return it.
    if (n < largest_calculated_index){ return it[n]; }

    // At this point, the nth term hasn't been calculated yet, so we need to calculate all of the terms starting from the largest known term.
    for (i = largest_calculated_index; i <= n; ++i)
    {
      // Loop through the coefficients to calculate the ith term in the sequence.
      for (j = 1; j <= coefficients.length; ++j)
      { ith_rr_term += it[(memory_opt? largest_calculated_index : i)-j]*coefficients[j-1] }

      // Add the non-homogeneous term to obtain the ith term in the sequence.
      ith_rr_term += non_homogeneous_term(i)

      // We have calculated the ith term, so we can add it to the list.
      it.push(ith_rr_term);

      // If we are trying to conserve memory, then we can remove the first value; the next term won't depend on it.
      if(memory_opt){ it.shift() }

      // Reset the temporary memory for calculating the next term.
      ith_rr_term = 0
    }

    // Finally, return the nth term in the sequence.
    return memory_opt? it[largest_calculated_index-1] : it[n]
  })
}

module.exports = solveLRR