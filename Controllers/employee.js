const Employees = require("../Models/Employee");



const employeeRegister = async (req, res) => {
    try {
        const { email,name } = req.body
    
        const isEmployeeExist = await Employees.findOne({ email: email })

        if (!isEmployeeExist) {

            const newEmployee = new Employees({
                email: email ,
                name : name
            })
            newEmployee.save()

            res.status(200).json({ message: "You have successfully registered,Your employee Id and password will be sent to your email soon" })
        } else {
            res.status(409).json({ message: 'This email is already registered,try to login with credentials' })
        }

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Internal Server Error" })
    }
}

module.exports = {
    employeeRegister,
}