const { admin, db } = require('../util/admin');
const config = require('../util/config');
const firebase = require('firebase');

firebase.initializeApp(config);

const { validateLoginData, validateSignUpData } = require('../util/validators');

// Login
exports.loginUser = (request, response) => {
    const user = {
        email: request.body.email,
        password: request.body.password
    }

    const { valid, errors } = validateLoginData(user);
	if (!valid) return response.status(400).json(errors);

    firebase
        .auth()
        .signInWithEmailAndPassword(user.email, user.password)
        .then((data) => {
            return data.user.getIdToken();
        })
        .then((token) => {
            return response.json({ token });
        })
        .catch((error) => {
            console.error(error);
            return response.status(403).json({ general: 'wrong credentials, please try again'});
        })
};

//Sign up

exports.signUpUser = (request, response) => {
    const newUser = {
        firstName: request.body.firstName,
        lastName: request.body.lastName,
        email: request.body.email,
        phoneNumber: request.body.phoneNumber,
        country: request.body.country,
		password: request.body.password,
		confirmPassword: request.body.confirmPassword,
		//username: request.body.username
    };

    const { valid, errors } = validateSignUpData(newUser);

	if (!valid) return response.status(400).json(errors);

    let token, userId;
    // проверка есть ли в базе юзер с таким же email
    db
        .doc(`/users/${newUser.email}`)
        .get()
        .then((doc) => {
          //  if (doc.exists) {
          //      return response.status(400).json({ email: 'this email is already taken' });
          //  } else {
                return firebase
                        .auth()
                        .createUserWithEmailAndPassword(
                            newUser.email, 
                            newUser.password
                    );
           // }
        })
        .then((data) => {
            userId = data.user.uid;
            return data.user.getIdToken();
        })
        .then((idtoken) => {
            token = idtoken;
            const userCredentials = {
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                //username: newUser.username,
                phoneNumber: newUser.phoneNumber,
                country: newUser.country,
                email: newUser.email,
                createdAt: new Date().toISOString(),
                userId
            };
            return db
                    .doc(`/users/${userCredentials.userId}`)
                    .set(userCredentials);
        })
        .then(()=>{
            return response.status(201).json({ token });
        })
        .catch((err) => {
			console.error(err);
			if (err.code === 'auth/email-already-in-use') {
				return response.status(400).json({ email: 'Email already in use' });
			} else {
				return response.status(500).json({ general: 'Something went wrong, please try again' });
			}
		});
}


const deleteImage = (imageName, storageBucket) => {
    const bucket = admin.storage().bucket(storageBucket);
    const path = `${imageName}`;
    return bucket.file(path).delete()
    .then(() => {
        return
    })
    .catch((error) => {
        return
    })
}

// Upload profile picture
exports.uploadProfilePhoto = (request, response) => {
    const BusBoy = require('busboy');
	const path = require('path');
	const os = require('os');
	const fs = require('fs');
	const busboy = new BusBoy({ headers: request.headers });
    console.log(request.headers)

	let imageFileName;
	let imageToBeUploaded = {};

	busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
		if (mimetype !== 'image/png' && mimetype !== 'image/jpeg' && mimetype !== 'image/webp' && mimetype !== 'image/gif') {
			return response.status(400).json({ error: `Wrong file type submited: ${mimetype}` });
		}
		const imageExtension = filename.split('.')[filename.split('.').length - 1];
        imageFileName = `${request.user.uid}.${imageExtension}`;
		const filePath = path.join(os.tmpdir(), imageFileName);
        
		imageToBeUploaded = { filePath, mimetype };
		file.pipe(fs.createWriteStream(filePath));
    });

	busboy.on('finish', () => {
        
        db.doc(`/users/${request.user.uid}`).get()
        .then((userData)=>{ 
             if (userData.data().imageUrl) {
                deleteImage(userData.data().imageUrl, config.profilesStorageBucket) 
              }
        }) 
        .then(()=>{
		admin
			.storage()
			.bucket(config.profilesStorageBucket)
			.upload(imageToBeUploaded.filePath, {
              //  destination: `users/${imageFileName}`,
				resumable: false,
				metadata: {
					
				contentType: imageToBeUploaded.mimetype
					
				}
			})
        })
			.then(() => {
				//const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${config.profilesStorageBucket}/o/${imageFileName}?alt=media`;
				// записываем в БД урл фото профиля
                const newImageUrl = imageFileName;
                return db.doc(`/users/${request.user.uid}`).update({
					imageUrl: newImageUrl
                    //imageUrl
				});
			})
			.then(() => {
				return response.json({ message: 'Image uploaded successfully' });
			})
			.catch((error) => {
				console.error(error);
				return response.status(500).json({ error: error.code });
			});
	});
	busboy.end(request.rawBody);
};


exports.getUserDetails = (request, response) => {
    let userData = {};
	db
		.doc(`/users/${request.user.uid}`)
		.get()
		.then((doc) => {
			if (doc.exists) {
                userData.userCredentials = doc.data();
                console.log(userData.userCredentials);
                return response.json(userData);
			}	
		})
		.catch((error) => {
			console.error(error);
			return response.status(500).json({ error: error.code });
		});
}

exports.updateUserDetails = (request, response) => {
    let document = db.collection('users').doc(`${request.user.uid}`);
    document.update(request.body)
    .then(()=> {
        response.json({message: 'Updated successfully'});
    })
    .catch((error) => {
        console.error(error);
        return response.status(500).json({ 
            message: "Cannot Update the value"
        });
    });
}