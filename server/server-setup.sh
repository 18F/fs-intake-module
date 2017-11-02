#!/bin/sh
# Used by Docker

cd /app

sleep 10

/node/node_modules/.bin/sequelize db:migrate

/node/node_modules/.bin/sequelize db:seed:all --seeders-path dba/seeders/prod/

/node/node_modules/.bin/nodemon --harmony_default_parameters app.es6
