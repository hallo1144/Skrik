const UserData = require('./UserDataSchema');
const sha256 = require('crypto-js/sha256');
const base64 = require('crypto-js/enc-base64');
const crypto = require('crypto'); 
// const { profile } = require('console');
// const { use } = require('../../routes/ApiRouter');
const regxstr = /^[ A-Za-z0-9_.-]+$/;
const regxnum = /^[0-9]+$/;
const regxemail = /^[ @A-Za-z0-9_.-]+$/;


// register use
async function createUser(username, password){
    if (typeof(username) !== "string" || username.match(regxstr) === null)
        return { "success": false, "description": "Invalid Username!!!" };
    if (typeof(password) !== "string" || password.match(regxstr) === null)
        return { "success": false, "description": "Invalid Password!!!" };
    
    try{
        var user = await UserData.findOne({Username: username});
    } catch(err) {
        console.error("[db] error querying user for register: " + err);
        return { "success": false, "description": "Querying user Failed!!!" };
    }

    if(user !== null)
        return { "success": false, "description": "Username Existed" };
    const passwordHash = base64.stringify(sha256(password));
    try{
        let obj = { Username: username, Password: passwordHash, Nickname: username, Company: 'Specify it!', Githubname: 'Specify it!', Facebookname: 'Specify it!', Location: 'Specify it!', Email: 'Specify it!'};
        await UserData.create(obj);
    } catch (err) {
        console.error("[db] error creating user in UserDatas database: " + err);
        return { "success": false, "description": "User creation Failed!!!" };
    }

    return { "success": true, "description": "User creation Finished!!!" };
}

// login authentication
async function authUser(username, password){
    if (typeof(username) !== "string" || username.match(regxstr) === null)
        return { "success": false, "description": "Invalid Username!!!" };
    if (typeof(password) !== "string" || password.match(regxstr) === null)
        return { "success": false, "description": "Invalid Password!!!" };
    
    try{
        var user = await UserData.findOne({Username: username});
    } catch(err) {
        console.error("[db] error querying user for login: " + err);
        return { "success": false, "description": "Querying user Failed!!!" };
    }

    if(user === null)
        return { "success": false, "description": "Authentication Failed!!!" };
    const passwordHash = base64.stringify(sha256(password));
    if (passwordHash === user.Password)
        return { "success": true, "description": "Authentication Finished!!!" };
    return { "success": false, "description": "Authentication Failed!!!" };
}

// list project ids in user profile page
async function listProjectids(username){
    if (typeof(username) !== "string" || username.match(regxstr) === null)
        return { "success": false, "description": "Invalid Username!!!", "ids": null };

    try{
        var userdata = await UserData.findOne({Username: username});
    } catch (err) {
        console.error("[db] error querying user in User collection: " + err);
        return { "success": false, "description": "Querying user Failed!!!", "ids": null };
    }
    if (userdata === null)
        return { "success": false, "description": "Username not exsisted", "ids": null };
    return { "success": true, "description": "List Project ids", "ids": userdata.ProjectIds };
}

// for FB authenticate
async function authFB(fbid, profileName){
    if (typeof(fbid) !== "string" || fbid.match(regxnum) === null)
        throw "Invalid fbid!!!";
    
    var user = await UserData.findOne({FacebookId: fbid});

    if(user !== null)
        return { username: user.Username };

    var passwd = crypto.randomBytes(15).toString('hex');
    var username = "user-" + sha256(profileName).toString().substring(0, 10);
    await UserData.create({ Username: username, Password: passwd, FacebookId: fbid, Nickname: username, Facebookname: profileName });

    return { username: username };
}

// for Google authenticate
async function authGoogle(googleid, profileName){
    if (typeof(googleid) !== "string" || googleid.match(regxnum) === null)
        throw "Invalid googleid!!!";
    
    var user = await UserData.findOne({GoogleId: googleid});

    if(user !== null)
        return { username: user.Username };

    var passwd = crypto.randomBytes(15).toString('hex');
    var username = "user-" + sha256(profileName).toString().substring(0, 10);
    await UserData.create({ Username: username, Password: passwd, GoogleId: googleid, Nickname: username });

    return { username: username };
}

// for Github authenticate
async function authGithub(githubid, profileName){
    if (typeof(githubid) !== "string" || githubid.match(regxnum) === null)
        throw "Invalid githubid!!!";
    
    var user = await UserData.findOne({GithubId: githubid});

    if(user !== null)
        return { username: user.Username };

    var passwd = crypto.randomBytes(15).toString('hex');
    var username = "user-" + sha256(profileName).toString().substring(0, 10);
    await UserData.create({ Username: username, Password: passwd, GithubId: githubid, Nickname: username, Githubname: profileName });

    return { username: username };
}

// set user profile
async function setProfile(username, nickname, company, gitname, fbname, loc, email){
    if (typeof(username) !== "string" || username.match(regxstr) === null)
        return { "success": false, "description": "Invalid Username!!!" };
    if (typeof(nickname) !== "string")
        return { "success": false, "description": "Invalid Username!!!" };
    if (typeof(company) !== "string")
        return { "success": false, "description": "Invalid Password!!!" };
    if (typeof(gitname) !== "string")
        return { "success": false, "description": "Invalid Git Name!!!" };
    if (typeof(fbname) !== "string")
        return { "success": false, "description": "Invalid FB Name!!!" };
    if (typeof(loc) !== "string")
        return { "success": false, "description": "Invalid Location!!!" };
    if (typeof(email) !== "string")
        return { "success": false, "description": "Invalid Email!!!" };
    
    try{
        var user = await UserData.findOne({Username: username});
    } catch(err) {
        console.error("[db] error querying user: " + err);
        return { "success": false, "description": "Querying user Failed!!!" };
    }
    if(user === null)
        return { "success": false, "description": "User not Exisited" };
    user.Nickname = nickname;
    user.Company = company;
    user.Githubname = gitname;
    user.Facebookname = fbname;
    user.Location = loc;
    user.Email = email;
    try{
        await user.save();
    } catch (err){
        console.error("[db] error saving user: " + err);
        return { "success": false, "description": "Operation Failed!!!" };
    }

    return { "success": true, "description": "Operation Success!!!" };
}

// get user profile
async function getProfile(username){

    if (typeof(username) !== "string" || username.match(regxstr) === null)
        return { "success": false, "description": "Invalid Username!!!" };
    try{
        var user = await UserData.findOne({Username: username});
    } catch(err) {
        console.error("[db] error querying user: " + err);
        return { "success": false, "description": "Querying user Failed!!!" };
    }

    if(user === null)
        return { "success": fasle, "description": "User Not Existed" };

    const data = {"Nickname": user.Nickname,
                  "Company": user.Company,
                  "Githubname": user.Githubname,
                  "Facebookname": user.Facebookname,
                  "Location": user.Location,
                  "Email": user.Email};
    return { "success": true, "description": "Getting Profile Finished!!!", "Data": data };
}

module.exports = {authUser: authUser,
                  listProjectids:listProjectids,
                  createUser:createUser,
                  authFB:authFB,
                  authGoogle:authGoogle,
                  authGithub:authGithub,
                  setProfile:setProfile,
                  getProfile:getProfile};
