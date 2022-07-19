// This file is part of InvenioRequests
// Copyright (C) 2022 CERN.
//
// Invenio RDM Records is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import { RequestLinksExtractor } from "../../../api";
import React from "react";
import Overridable from "react-overridable";
import { RequestAction } from "../RequestAction";
import { Dropdown } from "semantic-ui-react";

export const MobileRequestActions = ({ request, device }) => {
  const actions = Object.keys(new RequestLinksExtractor(request).actions);
  return (
    <Overridable
      id={`InvenioRequests.RequestActions.layout.${device}`}
      request={request}
      actions={actions}
    >
      <Dropdown
        text="Actions"
        icon="caret down"
        floating
        labeled
        button
        className="icon rel-mt-1"
      >
        <Dropdown.Menu className="fluid-menu-mobile">
          {actions.map((action) => {
            return (
              <Dropdown.Item
                key={action}
                className="dropdown-item"
                content={
                  <RequestAction action={action} requestType={request.type} />
                }
              />
            );
          })}
        </Dropdown.Menu>
      </Dropdown>
    </Overridable>
  );
};
