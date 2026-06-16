/*
 * SPDX-FileCopyrightText: 2022 CERN.
 * SPDX-License-Identifier: MIT
 */

import { createContext } from "react";

export const RequestActionContext = createContext({
  modalOpen: false,
  toggleModal: () => {},
  linkExtractor: undefined,
  requestApi: undefined,
  performAction: () => {},
  cleanError: () => {},
  error: undefined,
  loading: false,
});
