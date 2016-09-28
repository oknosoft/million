/**
 * ### Создаёт миллион записей в справочнике номенклатуры
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2016
 * @module  metadata-prebuild
 */

"use strict";

const fs = require('fs')
const path = require('path')

const words = fs.readFileSync('./words.ru.txt', 'utf8').split('\n')
	.concat(fs.readFileSync('./words.en.txt', 'utf8').split('\n'))
	.concat(fs.readFileSync('./words.ru.inverse.txt', 'utf8').split('\n'))
const nom_kinds = [{
  _id: "cat.nom_kinds|012abd41-e241-4f5a-84cf-636750084c95",
  name: "Профиль",
  id: "000020004",
  nom_type: "Товар",
},
  {
    _id: "cat.nom_kinds|24968c79-68eb-4aa8-9239-3d4b280116b8",
    name: "Материал",
    id: "000020010",
    nom_type: "Товар"
  },
  {
    _id: "cat.nom_kinds|2af5f374-704c-46c1-8a5e-50bb32cae1fb",
    name: "Примыкание",
    id: "000020009",
    nom_type: "Товар"
  },
  {
    _id: "cat.nom_kinds|79551d5d-6d0f-455c-ba54-9e751797bebd",
    name: "Работа",
    id: "000010001",
    nom_type: "Работа"
  },
  {
    _id: "cat.nom_kinds|cce2ae52-5f13-11e3-bfa1-206a8a1a5bb0",
    name: "Товар",
    id: "000020015",
    nom_type: "Товар"
  },
  {
    _id: "cat.nom_kinds|d644d4bc-1ab4-4b6a-813b-68628c6e2b0f",
    name: "Услуга",
    id: "000020003",
    nom_type: "Услуга"
  },
  {
    _id: "cat.nom_kinds|e15123ef-de02-4bfd-ae0c-f4afcd18270f",
    name: "Заполнение",
    id: "000020005",
    nom_type: "Товар"
  },
  {
    _id: "cat.nom_kinds|eec9c933-cfc2-4c98-b502-b781ddacd903",
    name: "Продукция",
    id: "000020001",
    nom_type: "Товар"
  }]

const config = require('./config.js')       // подключение к CouchDB
const MetaEngine = require('metadata-core/index.js')
  .default.plugin(require('metadata-pouchdb/index.js').default)


var $p = new MetaEngine();    // подключим метадату

// инициализация и установка параметров
$p.wsql.init(function (prm) {

  // разделитель для localStorage
  prm.local_storage_prefix = config.prefix;

  // по умолчанию, обращаемся к зоне 0
  prm.zone = config.zone;

  // расположение 1C
  if(config.rest_1c)
    prm.rest_path = config.rest_1c;

  // расположение couchdb
  prm.couch_path = config.couchdb;

}, function ($p) {

  const pouch_prm = {
    path: $p.wsql.get_user_param("couch_path", "string") || $p.job_prm.couch_path || "",
    zone: $p.wsql.get_user_param("zone", "number"),
    prefix: $p.job_prm.local_storage_prefix,
    suffix: $p.wsql.get_user_param("couch_suffix", "string") || "",
    user_meta: $p.job_prm.user_meta
  }

  const db = new $p.classes.PouchDB(pouch_prm.path + pouch_prm.zone + "_remote" + pouch_prm.suffix, {
    skip_setup: true,
    auth: {
      username: "Гость",
      password: "333"
    }
  });

  db.info()

    .then(function () {

      let i=0, start = Date.now();

      function put(noms) {
        db.bulkDocs(noms)
          .then(function () {
            console.log(Date.now() - start);
            if(i < 99){
              i++;
              put(create_noms($p, i))
            }else
              process.exit(0);
          })
      }

      // создаём записи
      put(create_noms($p, i));

    })
    .catch(function (err) {
      console.log(err);
      process.exit(1);
    })
})


function create_noms($p, i) {
  var res = [];
  for(let j=1; j<=10000; j++){
    res.push({
      _id: 'cat.nom|' + $p.utils.generate_guid(),
      id: pad(i*10000 + j, 9),
      nom_kind: nom_kind(),
      name: name()
    })
  }
  return res;
}

function name() {
  let count = Math.floor(Math.random() * 3);
  let res = '';
  while(count >=0){
    if(res)
      res += ' ';
    res += words[Math.floor(Math.random() * words.length)];
    count--;
  }
  return res;
}

function nom_kind() {
  const elm = nom_kinds[Math.floor(Math.random() * nom_kinds.length)];
  return elm._id.split('|')[1];
}

function pad(num, size) {
  var s = String(num);
  while (s.length < (size || 2)) {
    s = "0" + s;
  }
  return s;
}
