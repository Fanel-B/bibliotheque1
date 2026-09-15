import { HttpError } from '../utils/HttpError.js';

export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const message = result.error.issues
        .map((issue) => issue.message)
        .join(', ');
      return next(new HttpError(400, message));
    }
    req.body = result.data;
    next();
  };
}
