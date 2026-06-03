

// const asyncHandler = (requestHandler) => {
//     return (req, res, next) => {
//         Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
//     }
// }


// export { asyncHandler }


const asyncHandler = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next);
    } catch(error) {
        // This explicitly forces Express to send JSON back to your frontend
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Internal Server Error",
            errors: error.errors || []
        });
    }
}

export { asyncHandler };