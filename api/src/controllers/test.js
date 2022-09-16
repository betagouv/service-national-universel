function test() {
  try {
    throw new Error({ test: "test" });
  } catch (e) {
    console.log(e.message);
  }
}

test();
test();
