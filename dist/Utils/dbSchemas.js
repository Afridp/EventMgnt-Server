const bookingSchema = require("../Models/Booking")
const customerSchema = require("../Models/Customer")
const employeeSchema = require("../Models/Employee")
const eventSchema = require("../Models/Event")
const formsSchema = require("../Models/Form")
const formSubmissionsSchema = require("../Models/FormSubmissions")
const otp = require("../Models/Otp")
const tenantSchema = require("../Models/Tenants")
const walletSchema = require("../Models/Wallet")

const TenantSchemas = new Map([['tenant', tenantSchema],['otp', otp]])
const CompanySchemas = new Map([['customer', customerSchema], ['booking', bookingSchema], ['event', eventSchema], ['form', formsSchema], ['formSubmissions', formSubmissionsSchema], ['wallet', walletSchema], ['employee', employeeSchema]])

module.exports = {
    TenantSchemas,
    CompanySchemas
}

