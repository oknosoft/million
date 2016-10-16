/**
 * ### PouchDB для хранения данных в idb браузера и синхронизации с CouchDB
 */
const PouchDB = require('pouchdb-core')
		.plugin(require('pouchdb-adapter-http'))
		.plugin(require('pouchdb-mapreduce'))

//https://million.oknosoft.ru/couchdb/hw_0_remote
//http://cou206:5984/hw_0_remote

const db = new PouchDB("https://million.oknosoft.ru/couchdb/hw_0_remote", {
	skip_setup: true,
	auth: {
		username: "Гость",
		password: "333"
	}
});

export default db;
