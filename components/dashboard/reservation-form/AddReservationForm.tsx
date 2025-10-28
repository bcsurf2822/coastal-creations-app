import { ReactElement } from "react";
import ReservationFormBase from "./ReservationFormBase";

const AddReservationForm = (): ReactElement => {
  return <ReservationFormBase mode="add" title="Create Reservation" />;
};

export default AddReservationForm;
