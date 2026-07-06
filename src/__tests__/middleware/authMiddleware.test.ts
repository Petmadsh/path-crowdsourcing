import { Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../../middleware/authMiddleware';

// Mock di jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
}));

// Mock delle configurazioni per evitare il caricamento dei file
jest.mock('../../config/jwt', () => ({
  PUBLIC_KEY: 'mock-public-key',
  JWT_ALGORITHM: 'RS256',
}));

describe('authMiddleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      headers: {},
    };
    res = {};
    next = jest.fn();
  });

  test('dovrebbe chiamare next con errore 401 se manca header Authorization', () => {
    authMiddleware(req as Request, res as Response, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 401 }));
  });

  test('dovrebbe chiamare next con errore 401 se token non valido', () => {
    req.headers = { authorization: 'Bearer invalid-token' };
    const jwt = require('jsonwebtoken');
    jwt.verify.mockImplementation(() => {
      throw new Error('Invalid token');
    });
    authMiddleware(req as Request, res as Response, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 401 }));
  });

  test('dovrebbe impostare req.user e chiamare next se token valido', () => {
    req.headers = { authorization: 'Bearer valid-token' };
    const decoded = { id: 1, role: 'user' };
    const jwt = require('jsonwebtoken');
    jwt.verify.mockReturnValue(decoded);
    authMiddleware(req as Request, res as Response, next);
    expect(req.user).toEqual(decoded);
    expect(next).toHaveBeenCalledWith(); // senza argomenti
  });
});