const mockHgetall = jest.fn();
const mockGet = jest.fn();

jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => {
    return {
      hgetall: mockHgetall,
      get: mockGet,
    };
  });
});
const handlers = require('./handlers.js');


describe('handlers', () => {
  beforeEach(() => {
    mockHgetall.mockReset();
    mockHgetall.mockImplementation(() => Promise.resolve('result-from-redis'));
    mockGet.mockReset();
    mockGet.mockImplementation(() => Promise.resolve(42));
  });

  describe('getPornograhpicRatingForHashHandler', () => {
    it('should use the redis client to get the particular hash', async () => {
      const mockRequest = {
        params: {
          md5: 'test-hash',
        },
      };
      const mockJson = jest.fn();
      const mockResponse = {
        json: mockJson,
      };
      await handlers.getPornographicRatingForHashHandler(mockRequest, mockResponse);
      expect(mockJson).toHaveBeenCalledWith('result-from-redis');
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
      const mockJson = jest.fn();
      const mockResponse = {
        json: mockJson,
      };
      await handlers.getPornographicImageCountForBoardHandler(mockRequest, mockResponse);
      expect(mockJson).toHaveBeenCalledWith({'detected_image_count': 42});
      expect(mockGet).toHaveBeenCalledWith('test-board.count');
    });

    it('should default to 0 if there is no image count saved in redis', async () => {
    mockGet.mockImplementation(() => Promise.resolve(null));
      const mockRequest = {
        params: {
          board: 'test-board',
        },
      };
      const mockJson = jest.fn();
      const mockResponse = {
        json: mockJson,
      };
      await handlers.getPornographicImageCountForBoardHandler(mockRequest, mockResponse);
      expect(mockJson).toHaveBeenCalledWith({'detected_image_count': 0});
      expect(mockGet).toHaveBeenCalledWith('test-board.count');
    });
  });
});
