const jwt = require('jsonwebtoken');
const managerModel = require('../Models/managerModel');





export const userTokenVerify = async (req, res, next) => {
  try {

    let token = req.headers.authorization;
    console.log(token);
    if (!token) {
      return res.status(403).json({ message: 'Access Denied' });
    }
    if (token.startsWith('bearer')) {
      token = token.slice(7, token.length).trimLeft();
    }
    const verified = jwt.verify(token, process.env.TOKEN_KEY);
    console.log(verified);

    req.user = verified.id;

    if (verified.role == 'manager') {

      const user = await managerModel.findOne({ _id: verified.id });

      if (!user.isEmailVerified) {
        // add isBlocked instead
        return res.status(403).json({ message: 'Manager is Blocked' });
      } else {
        next();
      }
    } else {
      return res.status(403).json({ message: 'Access denied' });
    }
  } catch (error) {
    console.log(error.message);
  }

}

