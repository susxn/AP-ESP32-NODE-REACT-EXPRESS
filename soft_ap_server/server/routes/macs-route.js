const express = require('express')
const MacController = require('../controllers/macs-controller.js')

const router = express.Router()


router.get('/historic', MacController.getHistoric)
router.get('/blacklist', MacController.getBlacklist)
router.get('/delete/blacklist', MacController.clearBlackList)
router.get('/delete/historic', MacController.clearHistoric)
router.post('/filter/addmac', MacController.addtoBlacklist)
router.post('/filter/deletemac', MacController.deletetoBlacklist)
router.post('/esp/action', MacController.action)
router.get('/esp/inform', MacController.inform)




module.exports = router
