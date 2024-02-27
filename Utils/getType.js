
function getType(type) {
    switch (type) {
        case 'text':
            return String;
        case 'number':
            return Number;
        case 'date':
            return Date;
        // Add more cases for other types as needed
        default:
            return String;
    }
}

module.exports = getType;