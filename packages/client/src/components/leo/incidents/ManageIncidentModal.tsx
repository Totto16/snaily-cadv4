import { LEO_INCIDENT_SCHEMA } from "@snailycad/schemas";
import { Button } from "components/Button";
import { FormField } from "components/form/FormField";
import { Select, SelectValue } from "components/form/Select";
import { Loader } from "components/Loader";
import { Modal } from "components/modal/Modal";
import { useModal } from "state/modalState";
import { Form, Formik } from "formik";
import { handleValidate } from "lib/handleValidate";
import useFetch from "lib/useFetch";
import { ModalIds } from "types/ModalIds";
import { useTranslations } from "use-intl";
import { useDispatchState } from "state/dispatchState";
import { makeUnitName } from "lib/utils";
import { useGenerateCallsign } from "hooks/useGenerateCallsign";
import { Toggle } from "components/form/Toggle";
import { FormRow } from "components/form/FormRow";
import { useLeoState } from "state/leoState";
import { useRouter } from "next/router";
import { dataToSlate, Editor } from "components/modal/DescriptionModal/Editor";
import { IncidentEventsArea } from "./IncidentEventsArea";
import { classNames } from "lib/classNames";
import { useActiveIncidents } from "hooks/realtime/useActiveIncidents";
import { CombinedLeoUnit, EmsFdDeputy, LeoIncident, StatusValueType } from "@snailycad/types";
import { useValues } from "context/ValuesContext";
import { isUnitCombined } from "@snailycad/utils";
import { Input } from "components/form/inputs/Input";

interface Props {
  incident?: LeoIncident | null;
  onClose?(): void;
  onCreate?(incident: LeoIncident): void;
  onUpdate?(oldIncident: LeoIncident, incident: LeoIncident): void;
}

export function ManageIncidentModal({
  onClose,
  onCreate,
  onUpdate,
  incident: tempIncident,
}: Props) {
  const { activeIncidents } = useActiveIncidents();
  const foundIncident = activeIncidents.find((v) => v.id === tempIncident?.id);
  const incident = foundIncident ?? tempIncident ?? null;

  const { isOpen, closeModal } = useModal();
  const common = useTranslations("Common");
  const t = useTranslations("Leo");
  const { generateCallsign } = useGenerateCallsign();
  const { activeOfficer } = useLeoState();
  const { codes10 } = useValues();
  const router = useRouter();
  const { state, execute } = useFetch();
  const { allOfficers, allDeputies, activeDeputies, activeOfficers } = useDispatchState();

  const isDispatch = router.pathname.includes("/dispatch");
  const isLeoIncidents = router.pathname === "/officer/incidents";
  const creator = isDispatch || !incident?.creator ? null : incident.creator;
  const areEventsReadonly = !isDispatch || isLeoIncidents;
  const areFieldsDisabled = !isDispatch && !isLeoIncidents;

  const allUnits = [...allOfficers, ...allDeputies] as (EmsFdDeputy | CombinedLeoUnit)[];
  const activeUnits = [...activeOfficers, ...activeDeputies] as (EmsFdDeputy | CombinedLeoUnit)[];
  const unitsForSelect = isDispatch ? activeUnits : allUnits;

  function handleClose() {
    closeModal(ModalIds.ManageIncident);
    onClose?.();
  }

  function makeLabel(value: string) {
    const unit = allUnits.find((v) => v.id === value) ?? activeUnits.find((v) => v.id === value);

    if (unit && isUnitCombined(unit)) {
      return generateCallsign(unit, "pairedUnitTemplate");
    }

    return unit ? `${generateCallsign(unit)} ${makeUnitName(unit)}` : "";
  }

  async function onSubmit(values: typeof INITIAL_VALUES) {
    const data = {
      ...values,
      unitsInvolved: values.unitsInvolved.map((v) => v.value),
    };

    let id = "";

    if (incident) {
      const { json } = await execute(`/incidents/${incident.id}`, {
        method: "PUT",
        data,
      });

      id = json.id;
      onUpdate?.(incident, json);
    } else {
      const { json } = await execute("/incidents", {
        method: "POST",
        data,
      });

      id = json.id;
      onCreate?.(json);
    }

    if (id) {
      closeModal(ModalIds.ManageIncident);
    }
  }

  const validate = handleValidate(LEO_INCIDENT_SCHEMA);
  const INITIAL_VALUES = {
    description: incident?.description ?? "",
    postal: incident?.postal ?? "",
    descriptionData: dataToSlate(incident),
    firearmsInvolved: incident?.firearmsInvolved ?? false,
    injuriesOrFatalities: incident?.injuriesOrFatalities ?? false,
    arrestsMade: incident?.arrestsMade ?? false,
    isActive: isDispatch ? true : incident?.isActive ?? false,
    situationCodeId: incident?.situationCodeId ?? null,
    unitsInvolved:
      incident?.unitsInvolved.map((unit) => ({
        label: makeLabel(unit.unit?.id),
        value: unit.unit?.id,
      })) ?? ([] as SelectValue[]),
  };

  return (
    <Modal
      title={incident ? t("manageIncident") : t("createIncident")}
      onClose={handleClose}
      isOpen={isOpen(ModalIds.ManageIncident)}
      className={incident ? "w-[1000px] " : "w-[600px]"}
    >
      <div className={classNames(incident && "flex flex-col md:flex-row min-h-[450px] gap-3")}>
        <Formik validate={validate} initialValues={INITIAL_VALUES} onSubmit={onSubmit}>
          {({ handleChange, setFieldValue, errors, values, isValid }) => (
            <Form className="w-full flex flex-col justify-between">
              <div>
                <FormField errorMessage={errors.unitsInvolved as string} label={t("unitsInvolved")}>
                  <Select
                    disabled={areFieldsDisabled}
                    isMulti
                    value={values.unitsInvolved}
                    name="unitsInvolved"
                    onChange={handleChange}
                    values={unitsForSelect
                      .filter((v) => (creator ? v.id !== activeOfficer?.id : true))
                      .map((unit) => ({
                        label: makeLabel(unit.id),
                        value: unit.id,
                      }))}
                  />
                </FormField>
                <FormRow>
                  <FormField errorMessage={errors.firearmsInvolved} label={t("firearmsInvolved")}>
                    <Toggle
                      disabled={areFieldsDisabled}
                      toggled={values.firearmsInvolved}
                      name="firearmsInvolved"
                      onClick={handleChange}
                    />
                  </FormField>
                  <FormField
                    errorMessage={errors.injuriesOrFatalities}
                    label={t("injuriesOrFatalities")}
                  >
                    <Toggle
                      disabled={areFieldsDisabled}
                      toggled={values.injuriesOrFatalities}
                      name="injuriesOrFatalities"
                      onClick={handleChange}
                    />
                  </FormField>
                  <FormField errorMessage={errors.arrestsMade} label={t("arrestsMade")}>
                    <Toggle
                      disabled={areFieldsDisabled}
                      toggled={values.arrestsMade}
                      name="arrestsMade"
                      onClick={handleChange}
                    />
                  </FormField>
                </FormRow>
                <FormRow className="mt-1">
                  <FormField
                    optional
                    errorMessage={errors.situationCodeId}
                    label={t("situationCode")}
                  >
                    <Select
                      disabled={areFieldsDisabled}
                      isClearable
                      values={codes10.values
                        .filter((v) => v.type === StatusValueType.SITUATION_CODE)
                        .map((v) => ({
                          label: v.value.value,
                          value: v.id,
                        }))}
                      onChange={handleChange}
                      name="situationCodeId"
                      value={values.situationCodeId}
                    />
                  </FormField>
                  <FormField errorMessage={errors.postal} label={t("postal")}>
                    <Input
                      disabled={areFieldsDisabled}
                      name="postal"
                      value={values.postal}
                      onChange={handleChange}
                    />
                  </FormField>
                </FormRow>
                <FormField errorMessage={errors.description} label={common("description")}>
                  <Editor
                    isReadonly={areFieldsDisabled}
                    value={values.descriptionData}
                    onChange={(v) => setFieldValue("descriptionData", v)}
                  />
                </FormField>
              </div>

              <footer className="flex justify-end mt-5">
                <Button type="reset" onClick={handleClose} variant="cancel">
                  {common("cancel")}
                </Button>
                <Button
                  className="flex items-center"
                  disabled={areFieldsDisabled || !isValid || state === "loading"}
                  type="submit"
                >
                  {state === "loading" ? <Loader className="mr-2" /> : null}
                  {incident ? common("save") : common("create")}
                </Button>
              </footer>
            </Form>
          )}
        </Formik>

        {incident ? <IncidentEventsArea disabled={areEventsReadonly} incident={incident} /> : null}
      </div>
    </Modal>
  );
}
