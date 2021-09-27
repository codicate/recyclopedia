'use strict';

module.exports = {
  /*
    Ticks at the start of every new day
    to clean up recycled articles.

    This obviously doesn't happen quite yet!
  */
   "0 0 0 * * *": function () {
    console.log("Recycle Article collection!");
  }
};
