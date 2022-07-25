const router = require("express").Router();
const controller = require("./tables.controller");
const methodNotAllowed = require("../errors/methodNotAllowed");
const reservationController = require("../reservations/reservations.controller");

router
    .route("/")
    .post(controller.create)
    .get(controller.list)
    .all(methodNotAllowed);

router
    .route("/:table_id/seat")
    .put(reservationController.reservationExists, controller.seat)
    .delete(controller.finish)
    .all(methodNotAllowed);

module.exports = router;
