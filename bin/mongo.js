// Contains all methods necessary for communicating with the database

// Define and retrieve necessary database access things
var config = require('./config.js'),
    databases = {
        userdb: 'scheduler-site',
        usercoll: 'users',
        coursedb: 'course-data',
        termcoll: 'terms'
    },
    mongo_options = {
        useNewUrlParser: true,
        keepAlive: 1,
        connectTimeoutMS: 30000,
        reconnectTries: Number.MAX_VALUE,
        reconnectInterval: 1000
    };
const mongoUsername = config.mongo_user,
      mongoPass = config.mongo_pass,
      MongoClient = require('mongodb').MongoClient;
      uri = "mongodb+srv://" + mongoUsername + ":" + mongoPass + "@userdata-r5w4z.mongodb.net/test?retryWrites=true&w=majority",
      client = new MongoClient(uri, mongo_options);

////////////////////////////////////////////////
///////////// User Data Functions //////////////
////////////////////////////////////////////////

// During an error handling event, this function is called to print
// the error to the console.
function raiseMongoError(err, callback) {
    console.log("Encountered a MongoDB Error. See details below");
    console.log(err);
    console.log("End Mongo Error.\n--------------------------------");
    callback(err, null);
}

// Returns a list of all users in the database.
function getUsers(callback){
    client.connect( (err) => {
        var db = client.db(databases.userdb);
        db.collection(databases.usercoll).find().sort().toArray(callback);
        client.close();
    });
}

// *** Requires a wrapper function which first connects the client ***
// Returns a single user from the database
// @id the id number of the user you wish to retrieve
function getOneUser(id, callback) {
    var return_user;
    var db = client.db(databases.userdb);
    return_promise = db.collection(databases.usercoll).find({'_id': id}).toArray().then(data => {
        callback(data);
    }).catch(err => {
        console.log('getOneUser promise resolution error:');
        console.log(err);
    });
}

// *** Requires a wrapper function which first connects the client ***
// @profile the parsed profile acquired from passport authentication
function createUser(profile, callback) {
    let imageUrl = '';
    if (profile.photos && profile.photos.length) imageUrl = profile.photos[0].value;
    var db = client.db(databases.userdb);
    // Fields which are blank are ones which cannot be filled from provider auth.
    // In other words, they are data fields which we have curated.
    var user = {
        _id: profile.id,
        firstName: profile.name.givenName,
        lastName: profile.name.familyName,
        displayName: '', // The user's preferred name
        profileImg: imageUrl,
        cart: [],
        favorites: [],
        enrollmentData: {
            enrolled: [], // List of classes they are enrolled in
            school: '', // The user's school (College of A&S, School of Engineering, etc)
            major: '', // The user's chosen major
            minor: '', // The user's chosen minor
            expectedGradYear: '', // The year the user expects to graduate in
        },
    };
    db.collection(databases.usercoll).insertOne(user).then( () => {
        callback(user);
    }).catch(err => {
        console.log('createUser promise resolution error:');
        console.log(err);
    });
}

// Gets or creates a user
async function getOrCreateUser(profile, callback) {
    client.connect( err => {
        if(err) raiseMongoError(err, callback);
        else {
            getOneUser(profile.id, found_user => {
                if(found_user.length > 0) {
                    // User retrieved, execute callback with the found user
                    client.close();
                    callback(found_user[0]);
                } else {
                    // User not found. Create a new one
                    createUser(profile, created_user => {
                        client.close();
                        callback(created_user);
                    })
                }
            });
        }
    });
}

////////////////////////////////////////////////
///////////// Course API Functions /////////////
////////////////////////////////////////////////

// @specifiers a dictionary containing any search constraints
function searchTerm(term_id, specifiers, callback) {
    client.connect( (err) => {
        if(err) {
            console.log(err)
            callback(err, null)
        } else {
            var db = client.db(databases.coursedb);
            db.collection('term_' + term_id).find(specifiers).toArray(callback);
        }
        client.close();
    });
}

function getTerms(callback) {
    client.connect( (err) => {
        if(err) {
            console.log(err);
            callback(err, null);
        } else {
            var db = client.db(databases.coursedb);
            db.collection(databases.termcoll).find().toArray(callback);
        }
        client.close();
    });
}

////////////////////////////////////////////////
//////////////// Module Exports ////////////////
////////////////////////////////////////////////
module.exports = {
    getUsers,
    getOrCreateUser,
    searchTerm,
    getTerms
}
