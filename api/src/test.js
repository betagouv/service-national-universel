try {
  throw "test";
} catch (e) {
  // e is an Error object
  console.log(e.message);
}
