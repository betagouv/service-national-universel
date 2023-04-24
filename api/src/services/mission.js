const getTutorName = async ({ firstName, lastName }) => {
  return `${firstName} ${lastName}`;
};

module.exports = { getTutorName };
