import { ReactElement } from "react";
import { usePrivateEventForm } from "./shared/hooks/usePrivateEventForm";
import PrivateEventFormBase from "./shared/PrivateEventFormBase";

interface AddPrivateEventFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const AddPrivateEventForm = ({
  onSuccess,
  onCancel,
}: AddPrivateEventFormProps): ReactElement => {
  const formHook = usePrivateEventForm({
    mode: "add",
    onSuccess,
  });

  return (
    <PrivateEventFormBase
      formHook={formHook}
      mode="add"
      onCancel={onCancel}
    />
  );
};

export default AddPrivateEventForm;