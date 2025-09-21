import { ReactElement } from "react";
import { usePrivateEventForm } from "./shared/hooks/usePrivateEventForm";
import PrivateEventFormBase from "./shared/PrivateEventFormBase";
import { PrivateEventFormState } from "./shared/types/privateEventForm.types";

interface EditPrivateEventFormProps {
  privateEventId: string;
  initialData?: PrivateEventFormState;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const EditPrivateEventForm = ({
  privateEventId,
  initialData,
  onSuccess,
  onCancel,
}: EditPrivateEventFormProps): ReactElement => {
  const formHook = usePrivateEventForm({
    mode: "edit",
    privateEventId,
    initialData,
    onSuccess,
  });

  return (
    <PrivateEventFormBase
      formHook={formHook}
      mode="edit"
      onCancel={onCancel}
    />
  );
};

export default EditPrivateEventForm;