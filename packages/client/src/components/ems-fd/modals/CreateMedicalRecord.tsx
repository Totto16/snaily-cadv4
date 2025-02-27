import { useTranslations } from "use-intl";
import { Form, Formik } from "formik";
import { MEDICAL_RECORD_SCHEMA } from "@snailycad/schemas";
import { Button } from "components/Button";
import { FormField } from "components/form/FormField";
import { Loader } from "components/Loader";
import { Modal } from "components/modal/Modal";
import useFetch from "lib/useFetch";
import { useModal } from "state/modalState";
import { ModalIds } from "types/ModalIds";
import type { Citizen, MedicalRecord } from "@snailycad/types";
import { handleValidate } from "lib/handleValidate";
import { Input } from "components/form/inputs/Input";
import { Textarea } from "components/form/Textarea";
import { Select } from "components/form/Select";
import { useValues } from "context/ValuesContext";
import { InputSuggestions } from "components/form/inputs/InputSuggestions";
import { useImageUrl } from "hooks/useImageUrl";
import { useFeatureEnabled } from "hooks/useFeatureEnabled";

interface Props {
  onCreate?(newV: MedicalRecord): void;
  onClose?(): void;
}

export function CreateMedicalRecordModal({ onClose, onCreate }: Props) {
  const { state, execute } = useFetch();
  const { isOpen, closeModal } = useModal();
  const common = useTranslations("Common");
  const t = useTranslations("MedicalRecords");
  const { bloodGroup } = useValues();
  const { makeImageUrl } = useImageUrl();
  const { SOCIAL_SECURITY_NUMBERS } = useFeatureEnabled();

  const validate = handleValidate(MEDICAL_RECORD_SCHEMA);

  function handleClose() {
    closeModal(ModalIds.CreateMedicalRecord);
    onClose?.();
  }

  async function onSubmit(values: typeof INITIAL_VALUES) {
    const { json } = await execute("/ems-fd/medical-record", {
      method: "POST",
      data: values,
    });

    if (json?.id) {
      onCreate?.(json);
      closeModal(ModalIds.CreateMedicalRecord);
    }
  }

  const INITIAL_VALUES = {
    type: "",
    description: "",
    citizenId: "",
    citizenName: "",
    bloodGroup: null,
  };

  return (
    <Modal
      title={t("addMedicalRecord")}
      onClose={handleClose}
      isOpen={isOpen(ModalIds.CreateMedicalRecord)}
      className="w-[600px]"
    >
      <Formik validate={validate} onSubmit={onSubmit} initialValues={INITIAL_VALUES}>
        {({ handleChange, setValues, errors, values, isValid }) => (
          <Form>
            <FormField errorMessage={errors.citizenId} label={t("citizen")}>
              <InputSuggestions
                onSuggestionClick={(suggestion: Citizen) => {
                  const newValues = {
                    ...values,
                    citizenId: suggestion.id,
                    citizenName: `${suggestion.name} ${suggestion.surname}`,
                  };

                  setValues(newValues, true);
                }}
                Component={({ suggestion }: { suggestion: Citizen }) => (
                  <div className="flex items-center">
                    {suggestion.imageId ? (
                      <img
                        className="rounded-md w-[30px] h-[30px] object-cover mr-2"
                        draggable={false}
                        src={makeImageUrl("citizens", suggestion.imageId)}
                      />
                    ) : null}
                    <p>
                      {suggestion.name} {suggestion.surname}{" "}
                      {SOCIAL_SECURITY_NUMBERS && suggestion.socialSecurityNumber ? (
                        <>(SSN: {suggestion.socialSecurityNumber})</>
                      ) : null}
                    </p>
                  </div>
                )}
                options={{
                  apiPath: "/search/medical-name",
                  method: "POST",
                  dataKey: "name",
                }}
                inputProps={{
                  value: values.citizenName,
                  name: "citizenName",
                  onChange: handleChange,
                }}
              />
            </FormField>

            <FormField errorMessage={errors.bloodGroup} label={t("bloodGroup")}>
              <Select
                values={bloodGroup.values.map((v) => ({
                  value: v.id,
                  label: v.value,
                }))}
                onChange={handleChange}
                name="bloodGroup"
                value={values.bloodGroup}
              />
            </FormField>

            <FormField errorMessage={errors.type} label={common("type")}>
              <Input onChange={handleChange} name="type" value={values.type} />
            </FormField>

            <FormField errorMessage={errors.description} label={common("description")}>
              <Textarea value={values.description} name="description" onChange={handleChange} />
            </FormField>

            <footer className="flex justify-end mt-5">
              <Button
                type="reset"
                onClick={() => closeModal(ModalIds.CreateMedicalRecord)}
                variant="cancel"
              >
                {common("cancel")}
              </Button>
              <Button
                className="flex items-center"
                disabled={!isValid || state === "loading"}
                type="submit"
              >
                {state === "loading" ? <Loader className="mr-2" /> : null}
                {common("create")}
              </Button>
            </footer>
          </Form>
        )}
      </Formik>
    </Modal>
  );
}
