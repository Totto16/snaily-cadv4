import { Layout } from "components/Layout";
import { getSessionUser } from "lib/auth";
import { getTranslations } from "lib/getTranslation";
import type { GetServerSideProps } from "next";
import type {
  ExpungementRequest,
  NameChangeRequest,
  Warrant,
  Citizen,
  Record,
} from "@snailycad/types";
import { useTranslations } from "use-intl";
import { requestAll } from "lib/utils";
import { Title } from "components/shared/Title";
import { TabList } from "components/shared/TabList";
import { ExpungementRequestsTab } from "components/courthouse/expungement-requests/ExpungementRequestsTab";
import { NameChangeRequestTab } from "components/courthouse/name-change/NameChangeRequestTab";

export type FullRequest = ExpungementRequest & {
  warrants: Warrant[];
  records: Record[];
  citizen: Citizen;
};

interface Props {
  requests: FullRequest[];
  nameChangeRequests: NameChangeRequest[];
}

export default function Courthouse(props: Props) {
  const t = useTranslations("Courthouse");

  return (
    <Layout className="dark:text-white">
      <Title className="mb-3">{t("courthouse")}</Title>

      <TabList
        tabs={[
          { name: t("expungementRequests"), value: "expungementRequestsTab" },
          { name: t("nameChangeRequests"), value: "nameChangeRequestsTab" },
        ]}
      >
        <ExpungementRequestsTab requests={props.requests} />
        <NameChangeRequestTab requests={props.nameChangeRequests} />
      </TabList>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale, req }) => {
  const [data, nameChangeRequests, citizens] = await requestAll(req, [
    ["/expungement-requests", []],
    ["/name-change", []],
    ["/citizen", []],
  ]);

  return {
    props: {
      requests: data,
      nameChangeRequests,
      citizens,
      session: await getSessionUser(req),
      messages: {
        ...(await getTranslations(["courthouse", "leo", "common"], locale)),
      },
    },
  };
};
