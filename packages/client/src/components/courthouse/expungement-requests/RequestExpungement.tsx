import * as React from "react";
import { Button } from "components/Button";
import { FormField } from "components/form/FormField";
import { Loader } from "components/Loader";
import { Modal } from "components/modal/Modal";
import { useModal } from "state/modalState";
import { Form, Formik } from "formik";
import useFetch from "lib/useFetch";
import { useTranslations } from "next-intl";
import { ModalIds } from "types/ModalIds";
import type { Citizen, Record, Warrant } from "@snailycad/types";
import { useCitizen } from "context/CitizenContext";
import { Select, SelectValue } from "components/form/Select";

type Result = Citizen & { Record: Record[]; warrants: Warrant[] };

export function RequestExpungement({ onSuccess }: { onSuccess(json: any): void }) {
  const { state, execute } = useFetch();
  const { closeModal, isOpen } = useModal();
  const { citizens } = useCitizen();

  const [result, setResult] = React.useState<false | null | Result>(null);

  const t = useTranslations("Courthouse");
  const leo = useTranslations("Leo");
  const common = useTranslations("Common");

  function handleClose() {
    setResult(null);
    closeModal(ModalIds.RequestExpungement);
  }

  async function onSubmit(values: typeof INITIAL_VALUES) {
    const { json } = await execute(`/expungement-requests/${values.citizenId}`, {
      method: "GET",
      noToast: true,
    });

    if (json.id) {
      setResult(json);
    } else {
      setResult(false);
    }
  }

  const INITIAL_VALUES = {
    citizenId: "",
  };

  return (
    <Modal
      isOpen={isOpen(ModalIds.RequestExpungement)}
      onClose={handleClose}
      title={t("requestExpungement")}
      className="w-[600px]"
    >
      <div>
        <Formik onSubmit={onSubmit} initialValues={INITIAL_VALUES}>
          {({ handleChange, values, errors }) => (
            <Form className="flex items-center gap-2">
              <FormField className="w-full" errorMessage={errors.citizenId} label={leo("citizen")}>
                <Select
                  values={citizens.map((v) => ({
                    value: v.id,
                    label: `${v.name} ${v.surname}`,
                  }))}
                  value={values.citizenId}
                  autoFocus
                  name="citizenId"
                  onChange={handleChange}
                />
              </FormField>

              <Button
                className="flex items-center mt-4"
                disabled={!values.citizenId || state === "loading"}
                type="submit"
              >
                {state === "loading" ? <Loader className="mr-2" /> : null}
                {common("search")}
              </Button>
            </Form>
          )}
        </Formik>
      </div>

      {result === false ? (
        <p>Citizen not found</p>
      ) : result ? (
        <ResultsForm onSuccess={onSuccess} handleClose={handleClose} result={result} />
      ) : null}
    </Modal>
  );
}

interface ResultProps {
  handleClose(): void;
  result: Result;
  onSuccess(json: any): void;
}

function ResultsForm({ result, onSuccess, handleClose }: ResultProps) {
  const { state, execute } = useFetch();
  const leo = useTranslations("Leo");
  const t = useTranslations("Courthouse");
  const common = useTranslations("Common");

  const arrestReports = result.Record.filter((v) => v.type === "ARREST_REPORT");
  const tickets = result.Record.filter((v) => v.type === "TICKET");

  const isDisabled =
    arrestReports.length <= 0 && tickets.length <= 0 && result.warrants.length <= 0;

  async function onSubmit(values: typeof INITIAL_VALUES) {
    const { json } = await execute(`/expungement-requests/${result.id}`, {
      data: Object.entries(values).reduce(
        (ac, [key, data]) => ({
          ...ac,
          [key]: data.map((v) => v.value),
        }),
        {},
      ),
      method: "POST",
    });

    if (json.id) {
      handleClose();
      onSuccess(json);
    }
  }

  const INITIAL_VALUES = {
    warrants: [] as SelectValue[],
    tickets: [] as SelectValue[],
    arrestReports: [] as SelectValue[],
  };

  return (
    <Formik onSubmit={onSubmit} initialValues={INITIAL_VALUES}>
      {({ handleChange, values, errors, isValid }) => (
        <Form>
          <FormField
            className="w-full"
            errorMessage={errors.warrants as string}
            label={leo("warrants")}
          >
            {result.warrants.length <= 0 ? (
              <p>{leo("noWarrants")}</p>
            ) : (
              <Select
                values={result.warrants.map((v) => ({
                  value: v.id,
                  label: v.description,
                }))}
                value={values.warrants}
                name="warrants"
                isMulti
                onChange={handleChange}
              />
            )}
          </FormField>

          <FormField
            className="w-full"
            errorMessage={errors.arrestReports as string}
            label={leo("arrestReports")}
          >
            {arrestReports.length <= 0 ? (
              <p>{leo("noArrestReports")}</p>
            ) : (
              <Select
                values={arrestReports.map((v) => ({
                  value: v.id,
                  label: getTitles(v),
                }))}
                value={values.arrestReports}
                name="arrestReports"
                isMulti
                onChange={handleChange}
              />
            )}
          </FormField>

          <FormField
            className="w-full"
            errorMessage={errors.tickets as string}
            label={leo("tickets")}
          >
            {tickets.length <= 0 ? (
              <p>{leo("noTicketsCitizen")}</p>
            ) : (
              <Select
                values={tickets.map((v) => ({
                  value: v.id,
                  label: getTitles(v),
                }))}
                value={values.tickets}
                name="tickets"
                isMulti
                onChange={handleChange}
              />
            )}
          </FormField>

          <footer className="flex justify-end mt-5">
            <Button onClick={handleClose} variant="cancel" type="reset">
              {common("cancel")}
            </Button>
            <Button
              className="flex items-center"
              disabled={isDisabled || !isValid || state === "loading"}
              type="submit"
            >
              {state === "loading" ? <Loader className="mr-2" /> : null}
              {t("request")}
            </Button>
          </footer>
        </Form>
      )}
    </Formik>
  );
}

export function getTitles(record: Record) {
  const titles = record.violations.map((v) => v.penalCode.title);
  return titles.join(", ");
}
