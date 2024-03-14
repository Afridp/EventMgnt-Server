function generateTransactionId() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    const randomString = Array.from({ length: 5 }, () => characters.charAt(Math.floor(Math.random() * charactersLength))).join('');
    const timestamp = Date.now().toString(36);
    return `${randomString}-${timestamp}`;
}

module.exports = generateTransactionId;

