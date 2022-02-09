const knex = require('./../db_macs')
var nodemailer = require('nodemailer');

exports.inform = async (req, res) => {

    var dateObj = new Date();
    var time = dateObj.getHours();
    console.log(time);

    knex.from('macs').where('connected', 1).select('*')
        .then(stations_active => {
            console.log('macs: ')
            console.log(stations_active)

            if (stations_active.length > 0) {

                knex.from('blacklist').where({ mac: stations_active[0].mac, time_zone: 0 }).select('*')
                    .then(station => {
                        if (station.length > 0) {
                            console.log('blacklist: ')
                            console.log(station)
                            res.json({ aid: stations_active[0].aid })
                        }
                        else {
                            knex.from('blacklist').where({ mac: stations_active[0].mac, time_zone: 1 }).select('*')
                                .then(station_time => { 
                                    if (station_time.length > 0){
                                        if (time >= station_time[0].from && time < station_time[0].to){
                                            res.json({ aid: stations_active[0].aid })
                                        }

                                    }
                                })
                        }
                    })
            }
        })
}

exports.action = async (req, res) => {
    let aid;
    knex.from('historic_macs')
        .insert({
            mac: req.body.mac,
            aid: req.body.aid,
            action: req.body.action
        })
        .then(() => {

            knex.from('macs').where('mac', req.body.mac).select('*')
                .then(station => {
                    if (station.length > 0) {
                        if (req.body.action === 'join') {
                            knex.from('macs').where('mac', req.body.mac).update({

                                action: req.body.action,
                                connected: true
                            })
                                .then(() => {


                                    const transporter = nodemailer.createTransport({
                                        port: 465,               // true for 465, false for other ports
                                        host: "smtp.gmail.com",
                                        auth: {
                                            user: 'pau.susin@gmail.com',
                                            pass: 'tgkvuyonyxdkjrle',
                                        },
                                        secure: true,
                                    });

                                    const mailData = {
                                        from: 'pau.susin@gmail.com',  // sender address
                                        to: ['pau.susin@gmail.com'],  // list of receivers
                                        subject: 'ESP32 AP ',
                                        text: '',
                                        html: '<b>' + 'Station with MAC: ' + req.body.mac + 'Action: ' + req.body.action + '</b>'
                                    };

                                    transporter.sendMail(mailData, (error, info) => {
                                        if (error) {
                                            console.log({ message: 'Error in sendMail', error: error });
                                        }
                                        console.log({ message: "Mail send", message_id: info.messageId });
                                    });
                                })
                        }
                        else if (req.body.action == 'leave') {

                            knex.from('macs').where('mac', req.body.mac).update({

                                action: req.body.action,
                                connected: false
                            })
                                .then(() => {

                                    const transporter = nodemailer.createTransport({
                                        port: 465,               // true for 465, false for other ports
                                        host: "smtp.gmail.com",
                                        auth: {
                                            user: 'pau.susin@gmail.com',
                                            pass: 'tgkvuyonyxdkjrle',
                                        },
                                        secure: true,
                                    });

                                    const mailData = {
                                        from: 'pau.susin@gmail.com',  // sender address
                                        to: ['pau.susin@gmail.com'],  // list of receivers
                                        subject: 'ESP32 AP ',
                                        text: '',
                                        html: '<b>' + 'Station with MAC: ' + req.body.mac + 'Action: ' + req.body.action + ' </b>'
                                    };

                                    transporter.sendMail(mailData, (error, info) => {
                                        if (error) {
                                            console.log({ message: 'Error in sendMail', error: error });
                                        }
                                        console.log({ message: "Mail send", message_id: info.messageId });
                                    });

                                })
                        }
                    }
                    else {
                        if (req.body.aid < 10) {
                            aid = '0' + req.body.aid;
                        }

                        knex.from('macs').insert({
                            mac: req.body.mac,
                            aid: aid,
                            action: req.body.action,
                            connected: true
                        })
                            .then(() => {

                                const transporter = nodemailer.createTransport({
                                    port: 465,               // true for 465, false for other ports
                                    host: "smtp.gmail.com",
                                    auth: {
                                        user: 'pau.susin@gmail.com',
                                        pass: 'tgkvuyonyxdkjrle',
                                    },
                                    secure: true,
                                });

                                const mailData = {
                                    from: 'pau.susin@gmail.com',  // sender address
                                    to: ['pau.susin@gmail.com'],  // list of receivers
                                    subject: 'ESP32 AP ',
                                    text: '',
                                    html: '<b>' + 'Station with MAC: ' + req.body.mac + 'Action: ' + req.body.action + '</b>'
                                };

                                transporter.sendMail(mailData, (error, info) => {
                                    if (error) {
                                        console.log({ message: 'Error in sendMail', error: error });
                                    }
                                    console.log({ message: "Mail send", message_id: info.messageId });
                                });
                            })
                    }
                })
        })
}


exports.getHistoric = async (req, res) => {
    knex.from('historic_macs').select('*')
        .then(macsData => {
            res.json(macsData)
        })
        .catch(err => {
            res.json({ message: 'Error retrieving macs', error: err })
        })
}

exports.getBlacklist = async (req, res) => {
    knex.from('blacklist').select('*')
        .then(blacklistData => {
            res.json(blacklistData)
        })
        .catch(err => {
            res.json({ message: 'Error retrieving blacklist', error: err })
        })
}

exports.addtoBlacklist = async (req, res) => {

    knex.from('blacklist')
        .insert({
            mac: req.body.mac,
            time_zone: req.body.time_zone,
            from: req.body.from,
            to: req.body.to
        })
        .then(() => {
            res.json('Add to Blacklist mac: ' + req.body.mac)
        })
        .catch(err => {
            console.log(' Error fetching mac ')
        })

}

exports.deletetoBlacklist = async (req, res) => {
    knex.from('blacklist').where('mac', req.body.mac)
        .then(station => {
            console.log(station)
            if (station.length === 0) {
                console.log('mac not registered')
            }
            else {
                knex.from('blacklist').where('mac', req.body.mac)
                    .del()
                    .then(() => {
                        res.json('Delete to Blacklist mac: ' + req.body.mac)
                    })
                    .catch(err => {
                        console.log(' Error fetching mac ')
                    })
            }
        })
        .catch(err => {
            console.log(' Error fetching mac ')
        })
}

exports.clearHistoric = async (req, res) => {
    knex.from('historic_macs')
        .del().where('mac', '!=', 'null')
        .then(() => {
            res.json({ message: `ok` })
        })
        .catch(err => {
            res.json({ message: `Error deleting ${req.body.name}`, error: err })
        })
}

exports.clearBlackList = async (req, res) => {
    knex.from('blacklist')
        .del().where('mac', '!=', 'null')
        .then(() => {
            res.json({ message: `ok` })
        })
        .catch(err => {
            res.json({ message: `Error deleting ${req.body.name}`, error: err })
        })
}

