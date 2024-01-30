const jwt = require('jsonwebtoken');
const Manger = require('../Models/Manager');





export const managerTokenVerify = async (req, res, next) => {
  try {

    let token = req.headers.authorization;
    // console.log(token);
    if (!token) {
      return res.status(403).json({ message: 'Access Denied' });
    }
    if (token.startsWith('bearer')) {
      token = token.slice(7, token.length).trimLeft();
    }
    const verified = jwt.verify(token, process.env.TOKEN_KEY);
    // console.log(verified);

    req.manger = verified.id;

    if (verified.role == 'manager') {

      const manager = await Manger.findOne({ _id: verified.id });

      if (!manager.isEmailVerified) {
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

