import { Button } from "components/Button";
import { Loader } from "components/Loader";
import useFetch from "lib/useFetch";
import type { User } from "@snailycad/types";
import { useRouter } from "next/router";
import { ModalIds } from "types/ModalIds";
import { useModal } from "state/modalState";
import { AlertModal } from "components/modal/AlertModal";
import { GiveTempPasswordModal } from "./GiveTempPasswordModal";
import { useTranslations } from "use-intl";
import { useFeatureEnabled } from "hooks/useFeatureEnabled";

interface Props {
  user: User;
}

export function DangerZone({ user }: Props) {
  const { state, execute } = useFetch();
  const router = useRouter();
  const { openModal, closeModal } = useModal();
  const t = useTranslations("Management");
  const { USER_API_TOKENS } = useFeatureEnabled();

  const formDisabled = user.rank === "OWNER";

  async function handleDelete() {
    if (formDisabled) return;

    const { json } = await execute(`/admin/manage/users/${user.id}`, {
      method: "DELETE",
    });

    if (json) {
      router.push("/admin/manage/users");
    }
  }

  async function handleRevoke() {
    if (formDisabled) return;

    const { json } = await execute(`/admin/manage/users/${user.id}/api-token`, {
      method: "DELETE",
    });

    if (json) {
      router.push("/admin/manage/users");
      closeModal(ModalIds.AlertRevokePersonalApiToken);
    }
  }

  return (
    <div className="p-4 mt-5 bg-gray-200 rounded-md dark:bg-gray-2">
      <h1 className="text-2xl font-semibold">Danger Zone</h1>

      <div className="flex mt-3">
        <Button
          variant="danger"
          className="flex items-center"
          disabled={state === "loading"}
          onClick={() => openModal(ModalIds.AlertDeleteUser)}
        >
          {state === "loading" ? <Loader className="mr-3" /> : null}
          Delete User
        </Button>

        <Button
          variant="danger"
          className="flex items-center ml-2"
          disabled={state === "loading"}
          onClick={() => openModal(ModalIds.AlertGiveTempPassword)}
        >
          {state === "loading" ? <Loader className="mr-3" /> : null}
          Temporary Password
        </Button>

        {USER_API_TOKENS && user.apiTokenId ? (
          <Button
            variant="danger"
            className="flex items-center ml-2"
            disabled={state === "loading"}
            onClick={() => openModal(ModalIds.AlertRevokePersonalApiToken)}
          >
            {state === "loading" ? <Loader className="mr-3" /> : null}
            Revoke Personal API Token
          </Button>
        ) : null}
      </div>

      <AlertModal
        onDeleteClick={handleDelete}
        title="Delete User"
        description={`Are you sure you want to delete ${user.username}'s account? All their data will be lost.`}
        id={ModalIds.AlertDeleteUser}
      />

      <AlertModal
        onDeleteClick={() => {
          closeModal(ModalIds.AlertGiveTempPassword);
          openModal(ModalIds.GiveTempPassword);
        }}
        title={t("giveTempPassword")}
        description={`Are you sure you want to give ${user.username} a temporary password? They will not be able to log in to their account with their previous password. They will only be able to login with the password provided in the next step.`}
        id={ModalIds.AlertGiveTempPassword}
        deleteText={t("continue")}
      />

      <AlertModal
        onDeleteClick={handleRevoke}
        title="Revoke Personal API token"
        description={`Are you sure you want to revoke ${user.username}'s personal API Token? They will not be able to use this API token anymore. They are able to re-generate a new one later. You can remove their 'Use Personal Api Token' permissions via 'Manage Permissions'`}
        id={ModalIds.AlertRevokePersonalApiToken}
        deleteText="Revoke"
      />

      <GiveTempPasswordModal user={user} />
    </div>
  );
}
