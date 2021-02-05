const mockHgetall = jest.fn();
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => {
    return {
      hgetall: mockHgetall,
    };
  });
});
const handlers = require('./handlers.js');


describe('handlers', () => {
  beforeEach(() => {
    mockHgetall.mockReset();
    mockHgetall.mockImplementation(() => Promise.resolve('result-from-redis'));
  });

  describe('getPornograhpicRatingForHashHandler', () => {
    it('should use the redis client to get the particular hash', async () => {
      const mockRequest = {
        params: {
          md5: 'test-hash',
        },
      };
      const mockSend = jest.fn();
      const mockResponse = {
        send: mockSend,
      };
      await handlers.getPornographicRatingForHashHandler(mockRequest, mockResponse);
      expect(mockSend).toHaveBeenCalledWith('result-from-redis');
      expect(mockHgetall).toHaveBeenCalledWith('test-hash');
    });
  });


  describe('getPornographicImageCountForBoardHandler', () => {
    it('should use the redis client to get the board count', async () => {
      const mockRequest = {
        params: {
          board: 'test-board',
        },
      };
      const mockSend = jest.fn();
      const mockResponse = {
        send: mockSend,
      };
      await handlers.getPornographicImageCountForBoardHandler(mockRequest, mockResponse);
      expect(mockSend).toHaveBeenCalledWith('result-from-redis');
      expect(mockHgetall).toHaveBeenCalledWith('test-board');
    });
  });
});
