const config = require('../util/config');
const { response } = require('express');
const { db, admin } = require('../util/admin');
const firebase = require('firebase');
const { v4: uuidv4 } = require('uuid');

exports.getAllObjects = (request, response) => {
	db
		.collection('objects')
		.where('userId', '==', request.user.uid)
		.orderBy('createdAt', 'desc')
		.get()
		.then((data) => {
			let objects = [];
			data.forEach((doc) => {
				objects.push({
                    objectId: doc.id,
                    title: doc.data().title,
					body: doc.data().body,
					imagesUrls: doc.data().imagesUrls,
					createdAt: doc.data().createdAt
				});
			});
			return response.json(objects);
		})
		.catch((err) => {
			console.error(err);
			return response.status(500).json({ error: err.code});
		});
};


exports.postOneObject = (request, response) => {
	if (request.body.body.trim() === '') {
		return response.status(400).json({ body: 'Can not not be empty' });
    }
    
    if(request.body.title.trim() === '') {
        return response.status(400).json({ title: 'Can not not be empty' });
    }
    
    const newObject = {
        title: request.body.title,
        body: request.body.body,
		userId: request.user.uid,
		imagesUrls: request.body.imagesUrls,
        createdAt: new Date().toISOString()
    }
    db
        .collection('objects')
        .add(newObject)
        .then((doc)=>{
            const responseObject = newObject;
            responseObject.id = doc.id;
            return response.json(responseObject);
        })
        .catch((err) => {
			response.status(500).json({ error: 'Something went wrong' });
			console.error(err);
		});
};


exports.uploadObjectPhoto = (request, response) => {
    const BusBoy = require('busboy');
	const path = require('path');
	const os = require('os');
	const fs = require('fs');
	const busboy = new BusBoy({ headers: request.headers });
	let imageID = uuidv4();
	let imageFileName;
	let imageToBeUploaded = {};
	
/* 	busboy.on('field', (fieldname, val) => {
	
		console.log(`THis is on field. ${fieldname}: ${val}.`);
		
		fields[fieldname] = val;
		
		//console.log('this is', fields);
	  });  */


	busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
		console.log('this is in on file');
		
		if (mimetype !== 'image/png' && mimetype !== 'image/jpeg' && mimetype !== 'image/webp' && mimetype !== 'image/gif') {
			return response.status(400).json({ error: `Wrong Object file type submited: ${mimetype}` });
		}
		const imageExtension = filename.split('.')[filename.split('.').length - 1];
        imageFileName = `${imageID}.${imageExtension}`;
		const filePath = path.join(os.tmpdir(), imageFileName);
        
		imageToBeUploaded = { filePath, mimetype };
		file.pipe(fs.createWriteStream(filePath));
    });

	busboy.on('finish', () => {
		console.log('this is on finish');
       /*  db.doc(`/objects/${request.params.objectId}`).get()
        .then((userData)=>{ 
             if (userData.data().imageUrl) {
                deleteImage(userData.data().imageUrl, config.objectsStorageBucket) 
              }
        }) 
        .then(()=>{ */
			const tempFilePath = path.join(request.params.objectId, imageFileName);
		admin
			.storage()
			.bucket(config.objectsStorageBucket)
			.upload(imageToBeUploaded.filePath, {
                destination: tempFilePath,
				resumable: false,
				metadata: {
				contentType: imageToBeUploaded.mimetype
				}
			})
        //})
			
/* 	// Здесь будем записывать названия файлов в БД

.then(() => {
				//const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${config.profilesStorageBucket}/o/${imageFileName}?alt=media`;
                
				return db.doc(`/objects/${request.params.objectId}`).get()})
			.then((imageUrlData) => {
				console.log("URL in base", imageUrlData.data().imageUrl);
				const newImageUrl = imageFileName;
                return db.doc(`/objects/${request.params.objectId}`).update({
					imageUrl: newImageUrl
				});
			}) */
			.then(() => {
				//return response.json({ imageId: imageFileName});
				response.type('text/plain');
				return response.send(imageFileName);
			})
			.catch((error) => {
				console.error(error);
				return response.status(500).json({ error: error.code });
			});
	});
	busboy.end(request.rawBody);
};

exports.deleteOneObject = (request, response) => {

	//получаем ссылку на объект, который хотим удалить
	const object = db.doc(`objects/${request.params.objectId}`);
	object.get()
	.then((doc)=> {
		if (!doc.exists) {
			return response.status(404).json({error: "Object not found"})
		} 
		if (doc.data().userId !== request.user.uid) {
			return response.status(403).json({error: "Authorisation needed"})
		}
		return object.delete();
	})
	.then(()=>{
		response.json({message:"Object deleted successfully"})
	})
	.catch((err)=>{
		console.error(err);
		return response.status(500).json({error: err.code});
	})

};

exports.editOneObject = (request, response) => {
if (request.body.createdAt || request.body.userId) {
	return response.status(403).json({message: "You can't edit object id or object creation timestamp"})
}
//можно задавать коллекцию явно, а можно в пути ref к doc (как в deleteOneObject() =>>>	const object = db.doc(`objects/${request.params.objectId}`); )
let object = db.collection("objects").doc(`${request.params.objectId}`)

object.update(request.body)
.then(()=> {
	response.json({message: 'Updated successfully'});
})
.catch((err) => {
	console.error(err);
	return response.status(500).json({ 
			error: err.code 
	});
});
};