const functions = require('firebase-functions');
const app = require('express')();
const auth = require('./util/auth');

const cors = require('cors');
const corsOptions ={
    origin:'http://localhost:3000', 
    credentials:true,            //access-control-allow-credentials:true
    optionSuccessStatus:200
}
app.use(cors(corsOptions));

// Users API
const { loginUser, signUpUser, uploadProfilePhoto, getUserDetails, updateUserDetails} = require('./api/users');
app.post('/login', loginUser);
app.post('/signup', signUpUser);
app.post('/user/image', auth, uploadProfilePhoto);
app.get('/user', auth, getUserDetails);
app.post('/user', auth, updateUserDetails);


// Objects API
const { getAllObjects, postOneObject, deleteOneObject, editOneObject, uploadObjectPhoto } = require('./api/objects');

app.get('/objects', auth, getAllObjects);
app.post('/object', auth, postOneObject);
app.post('/object/:objectId/images', auth, uploadObjectPhoto);
app.delete('/object/:objectId', auth, deleteOneObject);
app.put('/object/:objectId', auth, editOneObject);



exports.api = functions.https.onRequest(app);

