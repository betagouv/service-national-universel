const data = {};

const mockRedis = {
  createClient: jest.fn(() => mockRedis),
  connect: jest.fn(() => Promise.resolve()),
  setEx: jest.fn((i, _, v) => (data[i] = v) && Promise.resolve()),
  get: jest.fn((i) => Promise.resolve(data[i])),
  disconnect: jest.fn(() => Promise.resolve()),
};

// ne peux pas être changé en export default car il y a encore des controller en js
module.exports = mockRedis;
