import { FormField } from "components/form/FormField";
import { Input } from "components/form/inputs/Input";
import { Select } from "components/form/Select";
import { useFormikContext } from "formik";
import dynamic from "next/dynamic";
import { QualificationValue, ShouldDoType, StatusValue, WhatPages } from "@snailycad/types";

import { Eyedropper } from "react-bootstrap-icons";
import { Button } from "components/Button";
import { useValues } from "context/ValuesContext";

const HexColorPicker = dynamic(async () => (await import("react-colorful")).HexColorPicker);

export const SHOULD_DO_LABELS: Record<ShouldDoType, string> = {
  [ShouldDoType.SET_STATUS]: "Set Status",
  [ShouldDoType.SET_OFF_DUTY]: "Set Off duty",
  [ShouldDoType.SET_ON_DUTY]: "Set On duty",
  [ShouldDoType.SET_ASSIGNED]: "Set Assigned",
  [ShouldDoType.PANIC_BUTTON]: "Panic Button",
};

export const WHAT_PAGES_LABELS: Record<WhatPages, string> = {
  [WhatPages.LEO]: "LEO",
  [WhatPages.EMS_FD]: "EMS/FD",
  [WhatPages.DISPATCH]: "Dispatch",
};

const SHOULD_DO_VALUES = Object.values(ShouldDoType).map((v) => ({
  label: SHOULD_DO_LABELS[v],
  value: v,
}));

const WHAT_PAGES_VALUES = Object.values(WhatPages).map((v) => ({
  label: WHAT_PAGES_LABELS[v],
  value: v,
}));

export function useDefaultDepartments() {
  const { department } = useValues();

  const DEFAULT_DEPARTMENTS = department.values.map((v) => ({
    value: v.id,
    label: v.value.value,
  }));

  function makeDefaultDepartments(value: StatusValue | QualificationValue | null) {
    if (!value) return [];
    const departments = value.departments ?? [];

    return departments.length <= 0
      ? DEFAULT_DEPARTMENTS
      : departments.map((v) => ({
          label: v.value.value,
          value: v.id,
        }));
  }

  return makeDefaultDepartments;
}

export function StatusValueFields() {
  const { values, errors, setFieldValue, handleChange } = useFormikContext<any>();
  const { department } = useValues();

  return (
    <>
      <FormField errorMessage={errors.shouldDo as string} label="Should Do">
        <Select
          values={SHOULD_DO_VALUES}
          name="shouldDo"
          onChange={handleChange}
          value={values.shouldDo}
        />
      </FormField>

      <FormField errorMessage={errors.whatPages as string} label="What Pages">
        <Select
          values={WHAT_PAGES_VALUES}
          name="whatPages"
          onChange={handleChange}
          value={values.whatPages}
          isMulti
          closeMenuOnSelect={false}
        />
      </FormField>

      {values.shouldDo === ShouldDoType.SET_ON_DUTY ? null : (
        <FormField errorMessage={errors.departments as string} label="Departments">
          <Select
            closeMenuOnSelect={false}
            name="departments"
            onChange={handleChange}
            value={values.departments}
            isMulti
            values={department.values.map((v) => ({
              value: v.id,
              label: v.value.value,
            }))}
          />
        </FormField>
      )}

      <FormField errorMessage={errors.color as string} label="Color (#HEX)">
        <div className={`flex ${values.showPicker ? "items-start" : ""}`}>
          {values.showPicker ? (
            <HexColorPicker
              color={values.color}
              onChange={(color) => setFieldValue("color", color)}
              style={{ width: "100%", height: "150px" }}
            />
          ) : (
            <Input name="color" onChange={handleChange} value={values.color} />
          )}

          <Button
            variant="cancel"
            className="p-0 px-1 ml-2"
            type="button"
            onClick={() => setFieldValue("showPicker", !values.showPicker)}
            aria-label="Color Picker"
            title="Color Picker"
          >
            <Eyedropper />
          </Button>
        </div>
      </FormField>

      <FormField className="mb-0" checkbox label="Status Code">
        <Input
          className="w-[max-content] mr-3"
          type="radio"
          name="type"
          onChange={() => setFieldValue("type", "STATUS_CODE")}
          checked={values.type === "STATUS_CODE"}
        />
      </FormField>

      <FormField checkbox label="Situation Code">
        <Input
          className="w-[max-content] mr-3"
          type="radio"
          name="type"
          onChange={() => setFieldValue("type", "SITUATION_CODE")}
          checked={values.type === "SITUATION_CODE"}
        />
      </FormField>
    </>
  );
}
