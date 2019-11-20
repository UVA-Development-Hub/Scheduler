// Contains all methods necessary for communicating with the database

// Define and retrieve necessary database access things
var config = require('./config.js'),
    async = require('async'),
    databases = {
        userdb: 'scheduler-site',
        usercoll: 'users',
        coursedb: 'course_data',
        termcoll: 'terms',
        programcoll: 'programs',
        gradesdb: 'course_grades'
    },
    mongo_options = {
        useNewUrlParser: true,
        keepAlive: 1,
        connectTimeoutMS: 30000,
        reconnectTries: Number.MAX_VALUE,
        reconnectInterval: 1000,
        useUnifiedTopology: true
    };
const mongoUsername = config.mongo_user,
      mongoPass = config.mongo_pass,
      MongoClient = require('mongodb').MongoClient,
      uri = "mongodb+srv://" + mongoUsername + ":" + mongoPass + "@userdata-r5w4z.mongodb.net/test?retryWrites=true&w=majority",
      client = new MongoClient(uri, mongo_options);

var fuseKeys = [{
    name: 'instructors',
  },{
    name: 'subject',
  }, {
    name: 'catalog_number',
  }, {
    name: 'title',
  }, {
    name: 'location',
}];

var fuseOptions = {
  shouldSort: true,
  tokenize: false,
  findAllMatches: true,
  threshold: 0.4,
  location: 0,
  distance: 1000,
  maxPatternLength: 32,
  minMatchCharLength: 1,
  keys: fuseKeys,
};

import Fuse from 'fuse.js';

////////////////////////////////////////////////
///////////// User Data Functions //////////////
////////////////////////////////////////////////

// During an error handling event, this function is called to print
// the error to the console.
function raiseMongoError(err, callback) {
    console.log("--------------------------------\nEncountered a MongoDB Error. See details below");
    console.log(err);
    console.log("End Mongo Error.\n--------------------------------");
    callback(err, null);
}

function raiseFailedPromise(err, place, callback) {
    console.log("--------------------------------\nPromise resolution failed at " + place + ". See details:");
    console.log(err);
    callback(null);
}

// Returns a list of all users in the database.
function getUsers(callback){
    client.connect( (err) => {
        if(err) raiseMongoError(err, callback);
        else {
            let db = client.db(databases.userdb);
            db.collection(databases.usercoll).find().sort().toArray(callback).then(data => {
                console.log("Retrieved list of all users");
                callback(data);
            }).catch(err => {
                raiseFailedPromise(err, "getUsers", callback);
            });
        }
    });
}

// *** Requires a wrapper function which first connects the client ***
// Returns a single user from the database
// @id the id number of the user you wish to retrieve
function getOneUser(id, callback) {
    let return_user;
    let db = client.db(databases.userdb);
    db.collection(databases.usercoll).find({'_id': id}).toArray().then(data => {
        console.log("Returning results for user " + id);
        callback(data);
    }).catch(err => {
        raiseFailedPromise(err, 'getOneUser', callback);
    });
}

// *** Requires a wrapper function which first connects the client ***
// @profile the parsed profile acquired from passport authentication
function createUser(profile, callback) {
    let imageUrl = '';
    if (profile.photos && profile.photos.length) imageUrl = profile.photos[0].value;
    let db = client.db(databases.userdb);
    // Fields which are blank are ones which cannot be filled from provider auth.
    // In other words, they are data fields which we have curated.
    let user = {
        _id: profile.id,
        firstName: profile.name.givenName,
        lastName: profile.name.familyName,
        displayName: '', // The user's preferred name
        profileImg: imageUrl,
        cart: [],
        favorites: [],
        joined: new Date(),
        enrolled: [], // List of classes they are enrolled in
        school: '', // The user's school (College of A&S, School of Engineering, etc)
        major: '', // The user's chosen major
        double_major: '', // The user's double major, if they have one
        minor: '', // The user's chosen minor
        expectedGradYear: '', // The year the user expects to graduate in
    };
    db.collection(databases.usercoll).insertOne(user).then( () => {
        console.log("User " + profile.id + " created");
        callback(user);
    }).catch(err => {
        raiseFailedPromise(err, 'createUser', callback);
    });
}

// Gets or creates a user
function getOrCreateUser(profile, callback) {
    getOneUser(profile.id, found_user => {
        if(found_user.length > 0) {
            // User retrieved, execute callback with the found user
            console.log("User " + profile.id + " is already in the database");
            callback(found_user[0]);
        } else {
            // User not found. Create a new one.
            createUser(profile, created_user => {
                callback(created_user);
            })
        }
    });
}

// @ specifiers a dictionary of fields which you'd like to update
function updateUser(id, specifiers, callback) {
    console.log("Processing update for user " + id);
    let db = client.db(databases.userdb);
    db.collection(databases.usercoll).findOneAndUpdate({ _id : id }, { $set: specifiers }, { returnOriginal: false }).then( status => {
        if(!status.ok) raiseMongoError(status, callback);
        else {
            console.log('Update complete');
            callback(status.value);
        }
    }).catch( fail => {
        raiseFailedPromise(fail, 'updateUser', callback);
    });
}

////////////////////////////////////////////////
///////////// Course API Functions /////////////
////////////////////////////////////////////////

// @specifiers a dictionary containing any search constraints
async function searchTerm(term_id, specifiers, callback, per = 25, fuzzy = false) {
    //let's get fuzzy...
    console.log(fuzzy);
    if(fuzzy){
        var courses = client.db(databases.coursedb).collection('term_' + term_id).find().toArray().then(data => {
            var fuse = new Fuse(data, fuseOptions);
            var result = fuse.search(specifiers.query);
            callback(null, result);
        });
    }
    else{
        let page = 0;
        if("per" in specifiers) {
            per = parseInt(specifiers.per);
            if(!per || per < 1) per = 1;
            delete specifiers.per;
        }
        if("page" in specifiers) {
            page = parseInt(specifiers.page);
            if(!page || page < 0) page = 0;
            delete specifiers.page;
        }
        // Use $where to search for instructors, course title
        if(specifiers.instructor && specifiers.instructor != '') {
            let ins = specifiers.instructor.toLowerCase();
            delete specifiers.instructor;
            specifiers.$where = () => {
                this.instructors.forEach( item => {
                    if( item.toLowerCase().includes('Dugan') ) return true;
                });
                return false;
            };
        }
        // Do the search, then paginate / count in parallel
        let coll = client.db(databases.coursedb).collection('term_' + term_id),
            cursor = coll.find(specifiers);
        async.parallel([
            async.reflect(callback => {
                cursor.count().then( count => {
                    callback(null, Math.ceil(count / per));
                });
            }),
            async.reflect(callback => {
                cursor.skip(page * per).limit(per).toArray().then(results => {
                    callback(null, results);
                }).catch(fail => {
                    raiseFailedPromise(fail, 'searchTerm', callback);
                });
            })
        ], (err, data) => {
            callback(null, data[1].value, data[0].value);
        });
    }
}

function getTerms(callback) {
    let db = client.db(databases.coursedb);
    db.collection(databases.termcoll).find().sort({"_id":1}).toArray().then(data => {
        //console.log("Retrieved terms list from Mongo");
        callback(null, data);
    }).catch(fail => {
        raiseFailedPromise(fail, 'getTerms', callback);
    });
}

// Give an array of program types you want to retrieve
function getPrograms(typelist, callback) {
    let db = client.db(databases.coursedb);
    db.collection(databases.programcoll).find({'type': { '$in': typelist}}).toArray().then(data => {
        let formatted = {};
        data.forEach(doc => {
            if(formatted[doc.type] == undefined) formatted[doc.type] = [doc];
            else formatted[doc.type].push(doc);
        });
        //console.log("Retrieved specified program list from Mongo");
        callback(formatted);
    }).catch(fail => {
        raiseFailedPromise(fail, 'getPrograms', callback);
    });
}

function getProgramInfo(name, callback) {
    let db = client.db(databases.coursedb);
    db.collection(databases.programcoll).find({'name': name}).toArray().then(data => {
        //console.log('Retrieved program info from Mongo.');
        callback(null, data[0]);
    }).catch(fail => {
        raiseFailedPromise(fail, 'getProgramInfo', callback);
    });
}

// Gets the most recent term
async function getRecentTerm(callback) {
    let db = client.db(databases.coursedb);
    let cursor = await db.collection(databases.termcoll).find().sort({_id: -1}).limit(1).toArray().then(data => {
        callback(null, data);
    }).catch(err => {
        raiseFailedPromise(err, 'getRecentTerm', callback);
    });
}

////////////////////////////////////////////////
////////////// Grade Distribution //////////////
////////////////////////////////////////////////

function searchGrades(subject, number, callback) {
    let db = client.db(databases.gradesdb);
    db.collection(subject).find({'catalog_number':number}).toArray().then(results => {
        callback(null, results);
    }).catch(fail => {
        raiseFailedPromise(fail, 'searchGrades', callback);
    });
}

////////////////////////////////////////////////
/////////////////// Subjects ///////////////////
////////////////////////////////////////////////

function getSubjects(callback) {
    let db = client.db(databases.coursedb);
    db.collection("subjects").find().toArray().then(results => {
        callback(null, results);
    }).catch(fail => {
        raiseFailedPromise(fail, 'getSubjects', callback);
    });
}

function searchSubjects(school, callback) {
    let db = client.db(databases.coursedb);
    db.collection("subjects").find({'school':school}).toArray().then(results => {
        callback(null, results);
    }).catch(fail => {
        raiseFailedPromise(fail, 'searchSubjects', callback);
    });
}

////////////////////////////////////////////////
//////////////// Module Exports ////////////////
////////////////////////////////////////////////
module.exports = {
    client,
    getUsers,
    getOneUser,
    getOrCreateUser,
    searchTerm,
    getTerms,
    getRecentTerm,
    getPrograms,
    getProgramInfo,
    updateUser,
    searchGrades,
    getSubjects,
    searchSubjects,
}
