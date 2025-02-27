import { TabList } from "components/shared/TabList";
import { useFeatureEnabled } from "hooks/useFeatureEnabled";
import { NameSearchVehiclesTab } from "./VehiclesTab";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { NameSearchWarrantsTab } from "./WarrantsTab";
import { RecordsTab } from "./RecordsTab";
import { useNameSearch } from "state/search/nameSearchState";
import { RecordType } from "@snailycad/types";

const NameSearchWeaponsTab = dynamic(
  async () => (await import("./WeaponsTab")).NameSearchWeaponsTab,
);

export function NameSearchTabsContainer() {
  const { WEAPON_REGISTRATION } = useFeatureEnabled();
  const t = useTranslations();
  const { currentResult } = useNameSearch();

  if (!currentResult) {
    return null;
  }

  const vehiclesLength = currentResult.vehicles.length;
  const weaponsLength = currentResult.weapons.length;

  const ticketsLength = currentResult.Record.filter((v) => v.type === RecordType.TICKET).length;
  const arrestReportsLength = currentResult.Record.filter(
    (v) => v.type === RecordType.ARREST_REPORT,
  ).length;
  const writtenWarningsLength = currentResult.Record.filter(
    (v) => v.type === RecordType.WRITTEN_WARNING,
  ).length;
  const warrantsLength = currentResult.warrants.length;

  const TABS = [
    { value: "vehicles", name: `${t("Vehicles.registeredVehicles")} (${vehiclesLength})` },
    { value: "weapons", name: `${t("Weapons.registeredWeapons")} (${weaponsLength})` },
    { value: "tickets", name: `${t("Leo.tickets")} (${ticketsLength})` },
    { value: "arrestReports", name: `${t("Leo.arrestReports")} (${arrestReportsLength})` },
    { value: "writtenWarnings", name: `${t("Leo.writtenWarnings")} (${writtenWarningsLength})` },
    { value: "warrants", name: `${t("Leo.warrants")} (${warrantsLength})` },
  ];

  return (
    <TabList defaultValue="" tabs={TABS}>
      <NameSearchVehiclesTab />
      {WEAPON_REGISTRATION ? <NameSearchWeaponsTab /> : null}
      <RecordsTab records={currentResult.Record} />
      <NameSearchWarrantsTab />
    </TabList>
  );
}
