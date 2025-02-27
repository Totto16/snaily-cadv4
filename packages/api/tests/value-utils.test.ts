/* eslint-disable quotes */
import { BadRequest } from "@tsed/exceptions";
import { expect, test } from "vitest";
import { getPermissionsForValuesRequest, getTypeFromPath } from "../src/lib/values/utils";

const testPath1 = "vehicle";
const testPath2 = "vehicle_flag";

test(`Should parse type from request path -> ${testPath1}`, () => {
  expect(getTypeFromPath(testPath1)).toMatchInlineSnapshot('"VEHICLE"');
});

test(`Should parse type from request path -> ${testPath2}`, () => {
  expect(getTypeFromPath(testPath2)).toMatchInlineSnapshot('"VEHICLE_FLAG"');
});

test(`Should parse type from request path -> ${testPath2} (Uppercase)`, () => {
  expect(getTypeFromPath(testPath2.toUpperCase())).toMatchInlineSnapshot('"VEHICLE_FLAG"');
});

test(`Should return permissions for type ${testPath1}`, () => {
  const req = { params: { path: testPath1 } } as any;
  expect(getPermissionsForValuesRequest(req)).toMatchInlineSnapshot(`
    {
      "fallback": [Function],
      "permissions": [
        "ManageValueVehicle",
      ],
    }
  `);
});

test("Should throw error if no params provided", () => {
  const req = { params: { path: null } } as any;
  expect(() => getPermissionsForValuesRequest(req)).toThrow(BadRequest);
});
