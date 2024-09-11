export function errorHandler(err, req, res, next) {
    console.error(err.stack);
    res.status(500).json({ message: `Internal Server Error: ${err.message}` });
}
//# sourceMappingURL=errorHandler.js.map