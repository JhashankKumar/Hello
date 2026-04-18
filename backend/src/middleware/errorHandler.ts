import type { Request, Response, NextFunction } from "express";

// _req and _next are not used in the error handler middleware
// underscore is used to indicate that the parameter is not used
export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error("Error:",err.message);
    const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
    // if status code is 200 and we still hit the error handler, set the status code to 500
    // it is an internal server error
    res.status(statusCode).json({
        message: err.message || "Internal server error",
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });

};