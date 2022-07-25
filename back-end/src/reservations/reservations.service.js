const knex = require("../db/connection");
const hasProperty = require("../errors/hasProperty");
const tableName = "reservations";

const validDate = /\d\d\d\d-\d\d-\d\d/;
const validTime = /\d\d:\d\d/;
const validStatus = ["booked", "seated", "finished", "cancelled"];
const CLOSED_DAYS = [2]; // 0 - Sunday, 1 - Monday, 2 - Tuesday, 3 - Wednesday, 4 - Thursday, 5 - Friday, 6 - Saturday

function hasValidStatus(reservation) {
  if (validStatus.includes(reservation.status)) {
    return reservation;
  }
  const error = new Error(
    `Invalid status: "${reservation.status}". Status must be one of: ${validStatus}`
  );
  error.status = 400;
  throw error;
}

function hasOptionalBookedStatus(reservation) {
  if (reservation.status && reservation.status !== "booked") {
    const error = new Error(
      `Invalid status: ${reservation.status}. A new reservation must have no status or a status of 'booked'`
    );
    error.status = 400;
    throw error;
  }
  return reservation;
}

function convertISOTimeToMinutes(time = "0:0") {
  const result = time.split(":").map((part) => parseInt(part));
  return result[0] * 60 + result[1];
}

function peopleIsGreaterThanZero(reservation = {}) {
  const { people } = reservation;
  if (Number.isInteger(people) && people > 0) {
    return reservation;
  }
  const error = new Error(
    `The 'people' property must be a number greater than zero: ${people}`
  );
  error.status = 400;
  throw error;
}

function hasReservationDate(reservation = {}) {
  const { reservation_date = "" } = reservation;
  if (reservation_date.match(validDate)) {
    return reservation;
  }
  const error = new Error(
    `The 'reservation_date' property must be a valid date: '${reservation_date}'`
  );
  error.status = 400;
  throw error;
}

function hasReservationTime(reservation = {}) {
  const { reservation_time = "" } = reservation;
  if (reservation_time.match(validTime)) {
    return reservation;
  }
  const error = new Error(
    `The 'reservation_time property must be a valid time: '${reservation_time}'`
  );
  error.status = 400;
  throw error;
}

function isFutureDate(reservation) {
  const { reservation_date, reservation_time } = reservation;
  if (
    new Date(
      `${reservation_date.match(validDate)}T${reservation_time.match(
        validTime
      )}`
    ) > new Date()
  ) {
    return reservation;
  }
  const error = new Error(
    `Reservation date/time must occur in the future: ${reservation_date} ${reservation_time}`
  );
  error.status = 400;
  throw error;
}

function isWorkingDay(reservation) {
  const { reservation_date = "" } = reservation;
  const day = new Date(reservation_date).getUTCDay();
  if (CLOSED_DAYS.includes(day)) {
    const error = new Error("The restaurant is closed on the selected day");
    error.status = 400;
    throw error;
  }
  return reservation;
}

function isWithinEligibleTimeframe(reservation) {
  const reservation_time = convertISOTimeToMinutes(
    reservation.reservation_time
  );
  if (
    reservation_time < convertISOTimeToMinutes("10:30") ||
    reservation_time > convertISOTimeToMinutes("22:30") - 60
  ) {
    const error = new Error("Please select a valid time");
    error.status = 400;
    throw error;
  }

  return reservation;
}

function create(newReservation) {
  return knex(tableName)
    .insert(newReservation, "*")
    .then((savedReservations) => savedReservations[0]);
}

function list(date) {
  return knex(tableName)
    .where("reservation_date", date)
    .whereNotIn("status", ["finished", "cancelled"])
    .orderBy("reservation_time");
}

function read(reservation_id) {
  return knex(tableName).where({ reservation_id }).first();
}

function search(mobile_number) {
  return knex(tableName)
    .whereRaw(
      "translate(mobile_number, '() -', '') like ?",
      `%${mobile_number.replace(/\D/g, "")}%`
    )
    .orderBy("reservation_date");
}

function update(reservation) {
  return knex(tableName)
    .where({ reservation_id: reservation.reservation_id })
    .update(reservation, "*")
    .then((records) => records[0]);
}

const validReservationComposition = compose(
  isWithinEligibleTimeframe,
  isWorkingDay,
  isFutureDate,
  peopleIsGreaterThanZero,
  hasReservationTime,
  hasReservationDate,
  hasProperty("mobile_number"),
  hasProperty("last_name"),
  hasProperty("first_name")
);

module.exports = {
  create: [
    create,
    hasOptionalBookedStatus,
    validReservationComposition
  ],
  list,
  read,
  search,
  status: [
    update, 
    hasValidStatus
  ],
  update: [
    update,
    hasValidStatus,
    validReservationComposition
  ]
};

// const knex = require("../db/connection");

// const tableName = "reservations";

// function list(date) {
//   return knex(tableName)
//     .where("reservation_date", date)
//     .whereNotIn("status", ["finished", "cancelled"])
//     .orderBy("reservation_time");
// }

// function create(reservation) {
//   return knex(tableName)
//     .insert(reservation, "*")
//     .then((createdReservations) => createdReservations[0]);
// }

// function read(reservation_id){
//     return knex(tableName)
//       .where("reservation_id", reservation_id)
//       .first();
// }

// function update(reservation) {
//   return knex(tableName)
//     .where({ reservation_id: reservation.reservation_id })
//     .update(reservation, "*")
//     .then((records) => records[0]);
// }

// function status(reservation) {
//     update(reservation);
//     return validStatus(reservation);
// }

// function validStatus(reservation) {
//   if (["booked", "seated", "finished", "cancelled"].includes(reservation.status)) {
//     return reservation;
//   }
//   const error = new Error(
//     `Invalid status:"${reservation.status}"`
//   );
//   error.status = 400;
//   throw error;
// }

// function search(mobile_number) {
//   return knex(tableName)
//     .whereRaw(
//       "translate(mobile_number, '() -', '') like ?",
//       `%${mobile_number.replace(/\D/g, "")}%`
//     )
//     .orderBy("reservation_date");
// }