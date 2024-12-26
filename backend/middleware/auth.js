const jwt = require("jsonwebtoken")

const Auth = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1]
        if (!token) {
            throw new Error("Token not provided")
        }
        //retrive the user details of logged in user
        const decodedToken = await jwt.verify(token, process.env.JWT_SECRET_KEY)
        req.user = decodedToken
        next()
    }
    catch (err) {
        res.status(400).json({ error: "Authentication failed" })
    }
}

// const Auth = async (req, res, next) => {
//     try {
//         const authHeader = req.headers.authorization;
//         console.log("Authorization Header:", authHeader); // Log the Authorization header

//         if (!authHeader) {
//             throw new Error("Authorization header is missing");
//         }

//         const token = authHeader.split(" ")[1];
//         console.log("Extracted Token:", token); // Log the extracted token

//         const decodedToken = await jwt.verify(token, process.env.JWT_SECRET_KEY);
//         console.log("Decoded Token:", decodedToken); // Log the decoded token

//         if (!decodedToken.id) {
//             throw new Error("ID is missing in token payload");
//         }

//         req.user = decodedToken;
//         console.log("req.user set to:", req.user); // Log req.user
//         next();
//     } catch (err) {
//         console.error("Authentication error:", err.message);
//         res.status(401).json({ error: "Authentication failed" });
//     }
// };




module.exports = { Auth }