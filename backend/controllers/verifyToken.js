const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  console.log("Headers received:", req.headers);
  const authHeader = req.headers.authorization || req.headers.Authorization;
  console.log("Auth header:", authHeader);

  if (authHeader) {
    const token = authHeader.split(" ")[1];
    console.log("Token extracted:", token);

    jwt.verify(token, process.env.JWT_SEC, (err, user) => {
      if (err) {
        console.error("Token verification failed:", err);
        return res.status(403).json("Token is not valid!");
      }
      console.log("Token verified successfully. User:", user);
      req.user = user;
      next();
    });
  } else {
    console.log("No auth header found");
    return res.status(401).json("You are not authenticated!");
  }
};

const verifyTokenAndAuthorization = (req, res, next) => {
  verifyToken(req, res, () => {
    if (!req.user) {
      console.error("User not found in request after token verification");
      return res.status(403).json("Token is not valid!");
    }

    console.log("User from token:", req.user);

    if (req.user.id === req.params.id || req.user.isAdmin) {
      next();
    } else {
      return res.status(403).json("You are not allowed to do that!");
    }
  });
};

const verifyTokenAndAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (!req.user) {
      console.error("User not found in request after token verification");
      return res.status(403).json("Token is not valid!");
    }

    console.log("User from token:", req.user);

    if (req.user.isAdmin) {
      next();
    } else {
      return res.status(403).json("You are not allowed to do that!");
    }
  });
};

module.exports = {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
};
