import * as React from "react";
import { EmsFdDeputy, Officer, QualificationValueType, UnitQualification } from "@snailycad/types";
import { Button } from "components/Button";
import { AlertModal } from "components/modal/AlertModal";
import { Table } from "components/shared/Table";
import useFetch from "lib/useFetch";
import { useTranslations } from "next-intl";
import { useModal } from "state/modalState";
import { ModalIds } from "types/ModalIds";
import { AddQualificationsModal } from "./AddQualificationsModal";
import { FullDate } from "components/shared/FullDate";
import { QualificationsHoverCard } from "./QualificationHoverCard";

interface Props {
  unit: (EmsFdDeputy | Officer) & { qualifications: UnitQualification[] };
  setUnit: React.Dispatch<React.SetStateAction<any>>;
}

export function QualificationsTable({ setUnit, unit }: Props) {
  const t = useTranslations("Leo");
  const { openModal } = useModal();

  const awards = unit.qualifications.filter(
    (v) => v.qualification.qualificationType === QualificationValueType.AWARD,
  );

  const qualifications = unit.qualifications.filter(
    (v) => v.qualification.qualificationType === QualificationValueType.QUALIFICATION,
  );

  return (
    <div className="mt-10">
      <div id="qualifications">
        <header className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">{t("unitQualifications")}</h2>

          <div>
            <Button
              onClick={() =>
                openModal(ModalIds.ManageUnitQualifications, QualificationValueType.QUALIFICATION)
              }
            >
              {t("addQualification")}
            </Button>
          </div>
        </header>

        {!qualifications.length ? (
          <p className="my-2 text-gray-400">{t("noQualifications")}</p>
        ) : (
          <QualificationAwardsTable setUnit={setUnit} unit={{ ...unit, qualifications }} />
        )}
      </div>

      <div id="awards">
        <header className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">{t("unitAwards")}</h2>
          <div>
            <Button
              onClick={() =>
                openModal(ModalIds.ManageUnitQualifications, QualificationValueType.AWARD)
              }
            >
              {t("addAward")}
            </Button>
          </div>
        </header>

        {!awards.length ? (
          <p className="my-2 text-gray-400">{t("noAwards")}</p>
        ) : (
          <QualificationAwardsTable setUnit={setUnit} unit={{ ...unit, qualifications: awards }} />
        )}
      </div>

      <AddQualificationsModal setUnit={setUnit} unit={unit} />
    </div>
  );
}

function QualificationAwardsTable({ unit, setUnit }: Props) {
  const [tempQualification, setTempQualification] = React.useState<UnitQualification | null>(null);

  const t = useTranslations("Leo");
  const common = useTranslations("Common");
  const { openModal, closeModal } = useModal();
  const { state, execute } = useFetch();

  function handleDeleteClick(qualification: UnitQualification) {
    setTempQualification(qualification);
    openModal(ModalIds.AlertDeleteUnitQualification);
  }

  async function handleSuspendOrUnsuspend(
    type: "suspend" | "unsuspend",
    qualification: UnitQualification,
  ) {
    const { json } = await execute(
      `/admin/manage/units/${unit.id}/qualifications/${qualification.id}`,
      { method: "PUT", data: { type } },
    );

    if (json) {
      setUnit((p: Props["unit"]) => ({
        ...p,
        qualifications: p.qualifications.map((q) => {
          if (q.id === qualification.id) {
            return { ...qualification, ...json };
          }

          return q;
        }),
      }));
    }
  }

  async function handleDelete() {
    if (!tempQualification) return;

    const { json } = await execute(
      `/admin/manage/units/${unit.id}/qualifications/${tempQualification.id}`,
      { method: "DELETE" },
    );

    if (json) {
      setUnit((p: Props["unit"]) => ({
        ...p,
        qualifications: p.qualifications.filter((v) => v.id !== tempQualification.id),
      }));
      setTempQualification(null);
      closeModal(ModalIds.AlertDeleteUnitQualification);
    }
  }

  return (
    <div>
      <Table
        data={unit.qualifications.map((qa) => {
          return {
            image: <QualificationsHoverCard qualification={qa} />,
            name: qa.qualification.value.value,
            assignedAt: <FullDate>{qa.createdAt}</FullDate>,
            actions: (
              <>
                {qa.suspendedAt ? (
                  <Button
                    onClick={() => handleSuspendOrUnsuspend("unsuspend", qa)}
                    disabled={state === "loading"}
                    small
                    variant="success"
                  >
                    {t("unsuspend")}
                  </Button>
                ) : (
                  <Button
                    disabled={state === "loading"}
                    onClick={() => handleSuspendOrUnsuspend("suspend", qa)}
                    small
                    variant="amber"
                  >
                    {t("suspend")}
                  </Button>
                )}
                <Button
                  disabled={state === "loading"}
                  onClick={() => handleDeleteClick(qa)}
                  className="ml-2"
                  small
                  variant="danger"
                >
                  {common("delete")}
                </Button>
              </>
            ),
          };
        })}
        columns={[
          { Header: common("image"), accessor: "image" },
          { Header: common("name"), accessor: "name" },
          { Header: t("assignedAt"), accessor: "assignedAt" },
          { Header: common("actions"), accessor: "actions" },
        ]}
      />

      <AlertModal
        title={t("deleteQualification")}
        description={t("alert_deleteQualification")}
        id={ModalIds.AlertDeleteUnitQualification}
        onDeleteClick={handleDelete}
        state={state}
      />
    </div>
  );
}
