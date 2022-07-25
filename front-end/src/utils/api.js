/**
 * Defines the base URL for the API.
 * The default values is overridden by the `API_BASE_URL` environment variable.
 */
import formatReservationDate from "./format-reservation-date";
import formatReservationTime from "./format-reservation-date";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5001";

/**
 * Defines the default headers for these functions to work with `json-server`
 */
const headers = new Headers();
headers.append("Content-Type", "application/json");

/**
 * Fetch `json` from the specified URL and handle error status codes and ignore `AbortError`s
 *
 * This function is NOT exported because it is not needed outside of this file.
 *
 * @param url
 *  the url for the requst.
 * @param options
 *  any options for fetch
 * @param onCancel
 *  value to return if fetch call is aborted. Default value is undefined.
 * @returns {Promise<Error|any>}
 *  a promise that resolves to the `json` data or an error.
 *  If the response is not in the 200 - 399 range the promise is rejected.
 */
async function fetchJson(url, options, onCancel) {
  try {
    const response = await fetch(url, options);

    if (response.status === 204) {
      return null;
    }

    const payload = await response.json();

    if (payload.error) {
      return Promise.reject({ message: payload.error });
    }
    return payload.data;
  } catch (error) {
    if (error.name !== "AbortError") {
      console.error(error.stack);
      throw error;
    }
    return Promise.resolve(onCancel);
  }
}

/**
 * Retrieves all existing reservation.
 * @returns {Promise<[reservation]>}
 *  a promise that resolves to a possibly empty array of reservation saved in the database.
 */
 export async function listReservations(params, signal) {
  const url = new URL(`${API_BASE_URL}/reservations`);
  Object.entries(params).forEach(([key, value]) =>
    url.searchParams.append(key, value.toString())
  );
  return await fetchJson(url, { headers, signal }, [])
    .then(formatReservationDate)
    .then(formatReservationTime);
}

/**
 * Retrieves all existing tables.
 * @returns {Promise<[table]>}
 *  a promise that resolves to a possibly empty array of tables saved in the database.
 */
export async function listTables(signal) {
  const url = `${API_BASE_URL}/tables`;
  return await fetchJson(url, { headers, signal }, []);
}

/**
 * Creates a new reservation
 * @returns {Promise<[reservation]>}
 *  a promise that resolves to the newly created reservation.
 */
 export async function createReservation(reservation, signal) {
  const url = `${API_BASE_URL}/reservations`;
  const options = {
    method: "POST",
    headers,
    body: JSON.stringify({ data: reservation }),
    signal,
  };
  return await fetchJson(url, options, reservation);
}

/**
 * Creates a new table
 * @returns {Promise<[table]>}
 *  a promise that resolves to the newly created table.
 */
 export async function createTable(table, signal) {
  const url = `${API_BASE_URL}/tables`;
  const options = {
    method: "POST",
    headers,
    body: JSON.stringify({ data: table }),
    signal,
  };
  return await fetchJson(url, options, table);
}

/**
 * Seats the specified reservation at the specified table.
 *
 * @param reservation_id
 *  the reservation_id being seated
 * @param table_id
 *  the table_id where the reservation is being being seated
 * @returns {Promise<Error|*>}
 *  a promise that resolves to the response from the server. Which may be empty.
 */
 export async function seatReservation(reservation_id, table_id) {
  const url = `${API_BASE_URL}/tables/${table_id}/seat`;
  const options = {
    method: "PUT",
    body: JSON.stringify({ data: { reservation_id } }),
    headers,
  };
  return await fetchJson(url, options, {});
}

/**
 * Finishes the specified table.
 *
 * @param table_id
 *  the table_id being finished
 * @param reservation_id
 *  the reservation_id being finished
 * @param table_id
 *  the table_id where the reservation is being being seated
 * @returns {Promise<Error|*>}
 *  a promise that resolves to the response from the server. Which may be empty.
 */
export async function unreserveTable(table_id, reservation_id) {
  const url = `${API_BASE_URL}/tables/${table_id}/seat`;
  const options = {
    method: "DELETE",
    headers,
  };
  return await fetchJson(url, options, {});
}

// search - GET
export async function search(number, signal) {
  const url = new URL(`${API_BASE_URL}/reservations?mobile_number=${number}`);
  const options = {
    method: "GET",
    headers,
    signal
  }
  return await fetchJson(url, options, {});
}

// getReservation - GET
export async function getReservation(reservation_id, signal) {
  const url = new URL(`${API_BASE_URL}/reservations/${reservation_id}`);
  const options = {
    method: "GET",
    headers,
    signal
  }
  return await fetchJson(url, options, {});
}

/**
 * Update an existing reservation
 * @returns {Promise<[reservation]>}
 *  a promise that resolves to the newly updated reservation.
 */
 export async function updateReservation(reservation, signal) {
  const { reservation_date, reservation_time, reservation_id } = reservation;
  const url = `${API_BASE_URL}/reservations/${reservation_id}`;

  const data = {
    ...reservation,
    reservation_date: Array.isArray(reservation_date)
      ? reservation_date[0]
      : reservation_date,
    reservation_time: Array.isArray(reservation_time)
      ? reservation_time[0]
      : reservation_time,
  };

  const options = {
    method: "PUT",
    headers,
    body: JSON.stringify({ data }),
    signal,
  };
  const response = await fetchJson(url, options, reservation);

  return Array.isArray(response) ? response[0] : response;
}

/**
 * Sets the status of the reservation with the specified `reservationId` to cancelled.
 * @param reservationId
 *  the id of the reservation to delete
 * @returns {Promise<null|String>}
 *  a promise that resolves to null or an error message.
 */
export async function changeStatus(reservation_id, status, signal) {
  const url = new URL(`${API_BASE_URL}/reservations/${reservation_id}/status`);
  const options = {
    method: "PUT",
    body: JSON.stringify({ data: { status } }),
    headers,
    signal
  }
  return await fetchJson(url, options, {});
}