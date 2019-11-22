const fs = require('fs');
const uuid = require('uuid');
const morgan = require('morgan');
const cors = require('cors');
const multer = require('multer');
const express = require('express');
const hbs = require('express-handlebars');
const path = require('path');
const rp = require('request-promise');

const db = require('./dbutil');
//const mongodb = require('./mongoutil'); 
const { loadConfigs, testConns } = require('./configutil');

//Set up configs for MySQL, Mongo and AWS S3
let configs;

if (fs.existsSync(__dirname + '/config.js')) {
	configs = require('./config');
	configs.mysql.ssl = {
		ca: fs.readFileSync(configs.mysql.cacert)
	};

} else {
	configs.mysql = {
		host: process.env.DB_HOST,
		port: process.env.DB_PORT,
		user: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		database: 'users',
		connectionLimit: 4,
		ssl: {
			ca: process.env.DB_CA
		}
	};
	configs.s3 = {
		accessKey: process.env.ACCESS_KEY,
		secretKey: process.env.SECRET_ACCESS_KEY
	}
	// configs.mongodb = {
	// 	url: process.env.MONGO_CONN_STRING
	// }
}

// TODO - Task 2
// Configure your databases
const loadedConfigs = loadConfigs(configs);
const s3 = loadedConfigs.s3;
const pool = loadedConfigs.pool;
const mongoClient = loadedConfigs.client;
const PORT = parseInt(process.argv[2] || process.env.APP_PORT || process.env.PORT) || 3000;

// SQL
const UPLOAD_SONG = `insert into music_list (music_id, music_url, lyrics, listening_slots, song_title, country)
					 values (?, ?, ?, ?, ?, ?)`;

const GET_SONGS = `select l.music_id, song_title, country, listening_slots, lyrics, count(user_id) as checked_out
					from music_listeners ml right join music_list l on l.music_id = ml.music_id
					group by l.music_id;`

const GET_SONG_BY_ID = `select count(user_id) as playTimes, l.music_id, l.music_url, l.lyrics, l.listening_slots, 
						l.song_title, l.country from music_list l left join music_listeners ml on l.music_id = ml.music_id
						where l.music_id = ?
						group by l.music_id`;

const UPDATE_SONG_STATUS = 'update music_listeners set listening_status = 0 where music_id = ? and user_id = ?';
const GET_USER_ID = 'select user_id from users where username = ?';

const INSERT_LISTENER = 'insert into music_listeners (music_id, user_id, checkout, listening_status) values (?,?,?,?)';

const uploadSong = db.mkQuery(UPLOAD_SONG);
const getSongs = db.mkQueryFromPool(db.mkQuery(GET_SONGS), pool);
const getSongById = db.mkQueryFromPool(db.mkQuery(GET_SONG_BY_ID), pool);
const updateSongStatus = db.mkQuery(UPDATE_SONG_STATUS);
const getUserId = db.mkQuery(GET_USER_ID);
const insertListener = db.mkQuery(INSERT_LISTENER);

//Configure the app
const app = express();

app.use(express.static(__dirname + '/public'));
app.use(cors());

app.use(morgan('tiny'));
const multipart = multer({ dest: path.join(__dirname, '/tmp') });

app.engine('hbs', hbs({ defaultLayout: 'main.hbs' }));
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');

// TODO - Task 3
// Song Upload
app.post('/api/upload-song', multipart.single('mp3File'),
	(req, res) => {
		let countryCode = '';
		
		const options = {
			uri: `https://restcountries.eu/rest/v2/name/${req.body.country}?fullText=true`,
			headers: {
				'User-Agent': 'Request-Promise'
			},
			json: true
		}
		//Retrieve ISO 3166 code 
		rp(options)
			.then(result => {
				countryCode = result[0].alpha2Code;
				//Update country code accordingly depending on success or error
				//Start transaction to upload body data to MySQL and file to AWS S3
				//Commit MySQL only if file upload is successful
				pool.getConnection((err, conn) => {
					if (err)
						throw err;
		
					db.startTransaction(conn)
						.then(status => {
							const music_id = uuid().substring(0, 8);
							const params = [music_id, req.file.filename, req.body.lyrics,
								req.body.listenSlots, req.body.title, countryCode];
		
							return uploadSong({ connection: status.connection, params });
						})
						.then(status => {
							return new Promise((resolve, reject) => {
								fs.readFile(req.file.path, (err, mp3File) => {
									if (err)
										reject(err);
									const params = {
										Bucket: 'free-music',
										Key: `anthem/${req.file.filename}`,
										Body: mp3File,
										ACL: 'public-read',
										ContentType: req.file.mimetype
									}
									s3.putObject(params, (err, result) => {
										if (err)
											return reject({ connection: status.connection, error: err });
										resolve({ connection: status.connection, result });
									})
								})
							})
						})
						.then(db.passthru, db.logError)
						.then(db.commit, db.rollback)
						.then(status => {
							fs.unlink(req.file.path, () => {
								res.status(201).json({ message: 'Uploaded song' })
							});
							resolve();
							},
							status => {
								res.status(400).json({ message: 'Error with upload' });
							})
						.finally(() => { conn.release() });
				})
			})
			.catch(error => {
				req.body.country.split(' ').forEach(c => {
					countryCode += c[0];
				})

				pool.getConnection((err, conn) => {
					if (err)
						throw err;
		
					db.startTransaction(conn)
						.then(status => {
							const music_id = uuid().substring(0, 8);
							const params = [music_id, req.file.filename, req.body.lyrics,
								req.body.listenSlots, req.body.title, countryCode];
		
							return uploadSong({ connection: status.connection, params });
						})
						.then(status => {
							return new Promise((resolve, reject) => {
								fs.readFile(req.file.path, (err, mp3File) => {
									if (err)
										reject(err);
									const params = {
										Bucket: 'free-music',
										Key: `anthem/${req.file.filename}`,
										Body: mp3File,
										ACL: 'public-read',
										ContentType: req.file.mimetype
									}
									s3.putObject(params, (err, result) => {
										if (err)
											return reject({ connection: status.connection, error: err });
										resolve({ connection: status.connection, result });
									})
								})
							})
						})
						.then(db.passthru, db.logError)
						.then(db.commit, db.rollback)
						.then(status => {
							fs.unlink(req.file.path, () => {
								res.status(201).json({ message: 'Uploaded song' })
							});
							resolve();
							}
							,
							status => {
								res.status(400).json({ message: 'Error with upload' });
							}
						)
						.finally(() => { conn.release() });
				})
			})	
	}
)

// TODO - Task 4 and TODO - Task 5
// List all songs and List available songs for listening
// Same data but displayed differently in Angular under SongListComponent and AvailableSongsComponent respectively
app.get('/api/songs', (req, res) => {
	getSongs()
		.then(result => {
			res.status(200).json(result);
		})
		.catch(error => {
			res.status(500).json(error);
		})
})

app.get('/api/flag/:countryCode', (req, res) => {
	const countryCode = req.params.countryCode;
	if (fs.existsSync(__dirname + `/public/images/${countryCode}.png`)) {
		return res.status(200).type('image/png').sendFile(__dirname + `/public/images/${countryCode}.png`);
	}
	res.status(500).json({error: 'Cannot find image'});
})

// TODO - Task 6
// Listening a song
app.get('/api/songs/:id', (req, res) => {
	const songId = req.params.id;
	getSongById([songId])
		.then(result => {
			if (result.length === 0) {
				return res.status(404).json({message: 'Cannot find song'})
			}
			res.status(200).json(result[0]);
		})
		.catch(error => {
			res.status(500).json({error: JSON.stringify(error)});
		})
})

app.post('/api/songs', express.json(), (req, res) => {
	console.log(req.query.user);
	pool.getConnection((err, conn) => {
		if (err)
			throw err;

		db.startTransaction(conn)
			.then(status => {
				return (getUserId({
					connection: status.connection,
					params: [req.query.user]
				}))
			})
			.then(status => {
				const userId = status.result[0].user_id;
				return (insertListener({
					connection: status.connection,
                    params: [req.body.music_id, userId, new Date(), 1]
                }))
			})
			.then(db.passthru, db.logError)
			.then(db.commit, db.rollback)
			.then(status => {
				return res.status(201).json({ message: 'Added' })
				}
				,
				status => {
					res.status(400).json({ message: 'Error with insertion' });
				}
			)
			.finally(() => { conn.release() });
	})
})

app.put('/api/songs/:id', express.json(), (req, res) => {
	const userName = req.query.user;
	const musicId = req.params.id;
	
	pool.getConnection((err, conn) => {
		if (err)
			throw err;

		db.startTransaction(conn)
			.then(status => {
				return (getUserId({
					connection: status.connection,
					params: [userName]
				}))
			})
			.then(status => {
				const userId = status.result[0].user_id;
				return (updateSongStatus({
					connection: status.connection,
                    params: [musicId, userId]
                }))
			})
			.then(db.passthru, db.logError)
			.then(db.commit, db.rollback)
			.then(status => {
				return res.status(201).json({ message: 'Updated' })
				}
				,
				status => {
					res.status(400).json({ message: 'Error with  update' });
				}
			)
			.finally(() => { conn.release() });
	})
})

testConns(loadedConfigs)
	.then(result => {
		app.listen(PORT, () => {
			console.info(`Application started on port ${PORT} at ${new Date()}`);
		})
	})
	.catch(error => {
		console.info('error connecting...', error);
		process.exit(-1);
	})	