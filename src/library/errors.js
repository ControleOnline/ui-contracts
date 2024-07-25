class ValidationError extends Error {
  constructor(message, code = 0) {
    super(message)
    this.name    = 'ValidationError'
    this.message = message
    this.code    = code;
  }
}

class PermissionError extends Error {
  constructor(message, code = 0) {
    super(message)
    this.name    = 'PermissionError'
    this.message = message
    this.code    = code;
  }
}

class ViolationError extends Error {
  constructor(message, property, code = null) {
    super(message)
    this.name     = 'ViolationError';
    this.message  = message;
    this.property = property;
    this.code     = code;
  }
}

class NotFoundError extends Error {
  constructor(message, code = null) {
    super(message)
    this.name    = 'NotFoundError';
    this.message = message;
    this.code    = code;
  }
}

class UnauthorizedError extends Error {
  constructor(message, code = null) {
    super(message)
    this.name    = 'UnauthorizedError';
    this.message = message;
    this.code    = code;
  }
}

module.exports = {
  ValidationError  ,
  PermissionError  ,
  ViolationError   ,
  NotFoundError    ,
  UnauthorizedError,
}
