import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { listReservations, listTables } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import { previous, next, today } from "../utils/date-time";
import useQuery from "../utils/useQuery";
import ListReservations from "./Reservations";
import ListTables from "./Tables";
import { Link } from "react-router-dom";

/**
 * Defines the dashboard page.
 * @param date
 *  the date for which the user wants to view reservations.
 * @returns {JSX.Element}
 */
function Dashboard({ date }) {
  // const [reservations, setReservations] = useState([]);
  // const [reservationsError, setReservationsError] = useState(null);

  // useEffect(loadDashboard, [date]);

  // function loadDashboard() {
  //   const abortController = new AbortController();
  //   setReservationsError(null);
  //   listReservations({ date }, abortController.signal)
  //     .then(setReservations)
  //     .catch(setReservationsError);
  //   return () => abortController.abort();
  // }


  // return (
  //   <main>
  //     <h1>Dashboard</h1>
  //     <div className="d-md-flex mb-3">
  //       <h4 className="mb-0">Reservations for date</h4>
  //     </div>
  //     <ErrorAlert error={reservationsError} />
  //     {JSON.stringify(reservations)}
  //   </main>
  // );

  const [stateForm, setStateForm] = useState({
    reservations: [],
    tables: [],
    reservationsError: null,
    tablesError: null,
    loading: false,
  });

  const { reservations, tables, reservationsError, tablesError, loading } =
    stateForm;

  // getting the selected date from the url
  const query = useQuery();
  if (query.get("date")) {
    date = query.get("date");
  }

  useEffect(loadDashboard, [date]);

  // sending api calls to list the reservations and tables
  function loadDashboard() {
    const abortController = new AbortController();
    setStateForm((currentStateForm) => ({
      ...currentStateForm,
      reservationsError: null,
      loading: true,
    }));
    listReservations({ date }, abortController.signal)
      .then((reservationResponse) =>
        setStateForm((currentStateForm) => ({
          ...currentStateForm,
          reservations: reservationResponse,
          loading: false,
        }))
      )
      .catch((error) =>
        setStateForm((currentStateForm) => ({
          ...currentStateForm,
          reservationsError: error,
        }))
      )
      .then(() => listTables(abortController.signal))
      .then((tablesResponse) =>
        setStateForm((currentStateForm) => ({
          ...currentStateForm,
          tables: tablesResponse,
        }))
      )
      .catch((error) =>
        setStateForm((currentStateForm) => ({
          ...currentStateForm,
          tablesError: error,
        }))
      );
    return () => abortController.abort();
  }

  const history = useHistory();
  const todaysDate = today();
  const nextDay = next(todaysDate);
  const PreviousDay = previous(todaysDate);

  const loadingSpinner = (
    <div className="d-flex justify-content-center p-5 m-5">
      <div className="spinner-border" role="status">
        <span className="visually-hidden"></span>
      </div>
    </div>
  );

  const addReservationButton = (
    <button
      className="btn btn-success m-3"
      onClick={() => history.push(`/reservations/new`)}
    >
      Add Reservation
    </button>
  );

  const addTableButton = (
    <button
      className="btn btn-success m-3"
      onClick={() => history.push(`/tables/new`)}
    >
      Add Table
    </button>
  );

  return (
    <>
      <div className="padded col-lg-7 col-md-5 col-sm-12 col-xs-6  align-self-start m-3 me-5 pe-5 card-main">
        <div className="text-center">
          <div>
            <div className="row p-0 justify-content-center">
              <div className="col-auto p-1">
                <h2>Reservations</h2>
              </div>
              <div className="col-auto plus-button p-1">
                <Link className="nav-link " to="/reservations/new">
                  <span className="oi oi-plus" />
                  &nbsp;
                </Link>
              </div>
            </div>

            <h6 className="my-2">
              Date:
              {date ? date : todaysDate}
            </h6>
            <div className="mb-3">
              <button
                className="btn btn-secondary m-1"
                onClick={() =>
                  history.push(`/reservations?date=${PreviousDay}`)
                }
              >
                Previous Day
              </button>
              <button
                className="btn btn-secondary m-1"
                onClick={() => history.push(`/reservations?date=${todaysDate}`)}
              >
                Today
              </button>
              <button
                className="btn btn-secondary m-1"
                onClick={() => history.push(`/reservations?date=${nextDay}`)}
              >
                Next Day
              </button>
            </div>
            <div className="text-left">
              {loading ? loadingSpinner : null}
              <ListReservations reservations={reservations} />
              {!reservations.length && !loading ? (
                <div className="container p-3 text-center">
                  <p>No reservations found for this date.</p>
                  {addReservationButton}
                </div>
              ) : null}
              <ErrorAlert error={reservationsError} />
            </div>
          </div>
        </div>
      </div>
      <div className="padded col-lg-3 col-md-5 col-sm-12 col-xs-6 align-self-start m-3 card-main">
        <div className="text-center">
          <div className="row justify-content-center">
            <div className="col-auto p-1">
              <h2>Tables</h2>
            </div>
            <div className="col-auto plus-button p-1">
              <Link className="nav-link" to="/tables/new">
                <span className="oi oi-plus" />
                &nbsp;
              </Link>
            </div>
          </div>
          {loading ? loadingSpinner : null}
          <ListTables tables={tables} />
          {!tables.length && !loading ? (
            <div className="container p-3 text-center">
              <p>No Tables found</p>
              {addTableButton}
            </div>
          ) : null}
          <ErrorAlert error={tablesError} />
        </div>
      </div>
    </>
  );
}
export default Dashboard;