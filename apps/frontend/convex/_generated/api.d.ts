/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as activity from "../activity.js";
import type * as auth_integration from "../auth-integration.js";
import type * as auth from "../auth.js";
import type * as budgetService from "../budgetService.js";
import type * as budgets from "../budgets.js";
import type * as families from "../families.js";
import type * as http from "../http.js";
import type * as myFunctions from "../myFunctions.js";
import type * as reliability from "../reliability.js";
import type * as security from "../security.js";
import type * as testSetup from "../testSetup.js";
import type * as transactions from "../transactions.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  activity: typeof activity;
  "auth-integration": typeof auth_integration;
  auth: typeof auth;
  budgetService: typeof budgetService;
  budgets: typeof budgets;
  families: typeof families;
  http: typeof http;
  myFunctions: typeof myFunctions;
  reliability: typeof reliability;
  security: typeof security;
  testSetup: typeof testSetup;
  transactions: typeof transactions;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
