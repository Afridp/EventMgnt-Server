const jwt = require('jsonwebtoken');
const Manager = require('../Models/Manager');

const managerTokenVerify = async (req, res, next) => {
  try {
    let token = req.headers.authorization;
    
    if (!token) {
      return res.status(403).json({ message: 'Access Denied' });
    }

    if (token.startsWith('Bearer')) { // Note the uppercase "Bearer" and the space after it
      token = token.slice(6).trim(); // Remove "Bearer " and trim whitespace
    }

    const verified = jwt.verify(token, process.env.TOKEN_KEY);

    // req.manager = verified.managerId;

    if (verified.role == 'manager') {
      const manager = await Manager.findOne({ _id: verified.managerId });

      if (manager.isBlocked) {
        return res.status(403).json({ message: 'Manager is Blocked' });
      } else {
        next();
      }
    } else {
      return res.status(403).json({ message: 'Access denied' });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(403).json({ message: 'Invalid token please login again' }); // Handle invalid token here
  }
}



const checkSubscription = async (req, res, next) => {
  try {

    const managerId = req.headers.managerid

    const manager = await Manager.findById(managerId);

    if (!manager.subscribed) {
      return res.status(401).json({ success: false, message: ' Subscription required' });
    }
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error('Error checking subscription:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};


const checkPlanValidity = async (req, res, next) => {
  try {
    const managerId = req.headers.managerId

    const manager = await Manager.findById(managerId);

    if (new Date() > manager.subscriptionEnd) {
      return res.status(401).json({ success: false, message: 'Invalid or expired subscription' });
    }
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error('Error checking plan validity:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  managerTokenVerify,
  checkPlanValidity,
  checkSubscription
}