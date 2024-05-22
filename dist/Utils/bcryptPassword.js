const bcrypt = require('bcryptjs')


module.exports = {
    hashPassword: async (password) => {
        try {
            const genSalt = await bcrypt.genSalt()
            const phashed = await bcrypt.hash(password, genSalt)
            return phashed
        } catch (error) {
            console.log(error.message)
        }
    }
}

