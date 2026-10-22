const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (authHeader) {
    const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.JWT_SEC, { algorithms: ["HS256"] }, (err, user) => {
      if (err) {
        console.error("Token verification failed:", err.message);
        return res.status(403).json("Token is not valid!");
      }
      req.user = user;
      next();
    });
  } else {
    return res.status(401).json("You are not authenticated!");
  }
};

const verifyTokenAndAuthorization = (req, res, next) => {
  verifyToken(req, res, () => {
    if (!req.user) {
      console.error("User not found in request after token verification");
      return res.status(403).json("Token is not valid!");
    }


    // Routes name the owner either :id (users) or :userId (orders, carts).
    const ownerId = req.params.userId ?? req.params.id;
    if (req.user.id === ownerId || req.user.isAdmin) {
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
