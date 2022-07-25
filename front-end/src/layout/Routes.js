import React from "react";

import { Redirect, Route, Switch } from "react-router-dom";
import Dashboard from "../dashboard/Dashboard";

// reservations 
import ReservationSeat from "../reservations/ReservationSeat";
import ReservationNew from "../reservations/ReservationNew";
import ReservationEdit from "../reservations/ReservationEdit";

// table
import TableNew from "../tables/TableNew";

// utils
import NotFound from "./NotFound";
import { today } from "../utils/date-time";
import useQuery from "../utils/useQuery";
import Search from "../search/Search";

/**
 * Defines all the routes for the application.
 *
 * You will need to make changes to this file.
 *
 * @returns {JSX.Element}
 */
function Routes() {
  const query = useQuery();
  return (
    <Switch>
      <Route exact={true} path="/">
        <Redirect to={"/dashboard"} />
      </Route>
      <Route exact={true} path="/reservations">
        <Redirect to={"/dashboard"} />
      </Route>
      <Route path="/dashboard">
        <Dashboard date={query.get("date") || today()} />
      </Route>
      <Route exact={true} path="/reservations/new">
        <ReservationNew />
      </Route>
      <Route exact={true} path="/reservations/:reservation_id/seat">
        <ReservationSeat />
      </Route>
      <Route exact={true} path="/reservations/:reservation_id/edit">
        <ReservationEdit />
      </Route>
      <Route path="/tables/new">
        <TableNew />
      </Route>
      <Route path="/search">
        <Search />
      </Route>
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

export default Routes;