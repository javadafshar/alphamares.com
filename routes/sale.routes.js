const { getSales, getNumSaleSameDay } = require('../controllers/sale.controller');
const { checkAdmin } = require('../middleware/admin.middleware');

const router = require('express').Router();

router.get("/", checkAdmin, getSales);
router.get("/num-sales/:id", getNumSaleSameDay);

module.exports = router;