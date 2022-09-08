const test = { fromUser: { firstName: "test" } };

const person = {
  test: function () {
    console.log(this.fromUser);
  },
};

const updatePlacesCenter = (center, fromUser) => {
  console.log(center, fromUser);
  console.log("🚀 ~ file: test.js ~ line 5 ~ updatePlacesCenter ~ fromUser", fromUser);
  console.log("🚀 ~ file: test.js ~ line 5 ~ updatePlacesCenter ~ fromUser", { fromUser });
  //   const me = Object.create(person);
  test2({ fromUser });
};

const test2 = (params) => {
  console.log("🚀 ~ file: test.js ~ line 11 ~ test2 ~ fromUser", params.fromUser.firstName);
};

const test3 = { firstName: "test3fsfse" };

updatePlacesCenter("test", test3);
