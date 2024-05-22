const jwt = require('jsonwebtoken');
const { getCollection } = require('../Utils/dbHelper');
const { TenantSchemas } = require('../Utils/dbSchemas');
// const TenantSchemas = new Map([['tenant', tenantSchema]])

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



    if (verified.role == 'manager') {

      const manager = await getCollection("AppTenants", "tenant", TenantSchemas)

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


module.exports = {
  managerTokenVerify
}