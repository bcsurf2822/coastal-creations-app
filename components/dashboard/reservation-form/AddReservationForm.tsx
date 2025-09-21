import { ReactElement } from "react";
import ReservationFormBase from "./ReservationFormBase";

const AddReservationForm = (): ReactElement => {
  return (
    <ReservationFormBase
      mode="add"
      title="Create New Reservation Program"
    />
  );
};

export default AddReservationForm;