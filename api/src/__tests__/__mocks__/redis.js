const data = {};

const mockRedis = {
  createClient: jest.fn(() => mockRedis),
  connect: jest.fn(() => Promise.resolve()),
  setEx: jest.fn((i, _, v) => (data[i] = v) && Promise.resolve()),
  get: jest.fn((i) => Promise.resolve(data[i])),
  disconnect: jest.fn(() => Promise.resolve()),
};

module.exports = mockRedis;
