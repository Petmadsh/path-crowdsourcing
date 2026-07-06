import { Request, Response, NextFunction } from 'express';
import { errorMiddleware } from '../../middleware/errorMiddleware';
import createError from 'http-errors';

describe('errorMiddleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  test('dovrebbe restituire status 500 e messaggio di default per errore generico', () => {
    const err = new Error('Generic error');
    errorMiddleware(err, req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Generic error' });
  });

  test('dovrebbe restituire status e messaggio corretti per HttpError', () => {
    const err = createError(400, 'Bad request');
    errorMiddleware(err, req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Bad request' });
  });
});