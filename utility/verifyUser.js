const fs = require('fs');
const REGISTERED_USERS_FILE = './registeredUsers.json';

module.exports = {
    testOrCreateRegisteredUsersFile: function() {
        console.log('tbi');
    },

    verifyUser: function(userInfo) {
        let testValue = false;

        const file = JSON.parse(fs.readFileSync(REGISTERED_USERS_FILE));
        const registeredUsers = file.filter( user => user.user === userInfo.username.toString());

        if(registeredUsers.length > 0) {
            testValue = true;
        } 
    
        return testValue;
    }
}
