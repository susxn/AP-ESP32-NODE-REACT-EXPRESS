const path = require('path')
const dbPath = path.resolve(__dirname, 'db/macs.sqlite')
const knex = require('knex')({
    client: 'sqlite3',
    connection: {
        filename: dbPath,
        user: "accessPoint",
        password: "accessPoint",
    },
    useNullAsDefault: true
})

//macs table
knex.schema.hasTable('macs')
    .then((exists) => {
        if (!exists) {
            return knex.schema.createTable('macs', (table) => {
                table.datetime('time').defaultTo(knex.fn.now())
                table.string('mac')
                table.string('aid')
                table.string('action')
                table.bool('connected')

            })
                .then(() => { console.log('Table macs created') })
                .catch((error) => { console.error(`Error creating table: ${error}`) })
        }
    })
    .then()
    .catch((error) => { console.error(`Error setting up the database: ${error}`) })

    knex.schema.hasTable('historic_macs')
    .then((exists) => {
        if (!exists) {
            return knex.schema.createTable('historic_macs', (table) => {
                table.datetime('time').defaultTo(knex.fn.now())
                table.string('mac')
                table.string('aid')
                table.string('action')
                

            })
                .then(() => { console.log('Table historic_macs created') })
                .catch((error) => { console.error(`Error creating table: ${error}`) })
        }
    })
    .then()
    .catch((error) => { console.error(`Error setting up the database: ${error}`) })


knex.schema.hasTable('blacklist')
    .then((exists) => {
        if (!exists) {
            return knex.schema.createTable('blacklist', (table) => {
                table.string('mac')
                table.int('time_zone') // 1 if filter by time, 0 filter by mac
                table.int('from')
                table.int('to')
            })
                .then(() => { console.log('Table blacklist created') })
                .catch((error) => { console.error(`Error creating table: ${error}`) })
        }
    })
    .then()
    .catch((error) => { console.error(`Error setting up the database: ${error}`) })




knex.select('*').from('macs')
    .then(data => console.log('data:', data))
    .catch(err => console.log(err))

module.exports = knex

