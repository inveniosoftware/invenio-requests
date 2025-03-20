/*
 * This file is part of Invenio.
 * Copyright (C) 2022-2024 CERN.
 * Copyright (C) 2024      KTH Royal Institute of Technology.
 *
 * Invenio is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

import React, { useState } from "react";
import PropTypes from "prop-types";
import { Header, Button, Icon, Menu, Search, List } from "semantic-ui-react";
import { UsersApi } from "@js/invenio_communities/api/UsersApi";
import { GroupsApi } from "@js/invenio_communities/api/GroupsApi";
import {
  InvenioRequestsAPI,
  RequestLinksExtractor,
} from "@js/invenio_requests/api/InvenioRequestApi";
import { i18next } from "@translations/invenio_requests/i18next";

/* --- Sub-components --- */

// Renders the header when the menu is collapsed.
const CollapsedHeader = ({ canReview, onOpen, label, headerTriggerClass }) => {
  if (!canReview) {
    return (
      <Header as="h3" size="tiny">
        {label}
      </Header>
    );
  }
  return (
    <Header as="h3" size="tiny" onClick={onOpen}>
      {label}
      <Icon name="setting" className="right-floated" size="mini" />
    </Header>
  );
};

CollapsedHeader.propTypes = {
  canReview: PropTypes.bool.isRequired,
  onOpen: PropTypes.func,
  label: PropTypes.string.isRequired,
  headerTriggerClass: PropTypes.string,
};

// Renders the filter buttons and search input.
const ReviewerSearch = ({
  searchType,
  onFilterChange,
  searchQuery,
  results,
  onSearchChange,
  onResultSelect,
  renderResult,
  i18next,
}) => (
  <Menu.Item className="mb-10">
    <div className="mb-10">
      <Button.Group fluid basic size="mini">
        <Button active={searchType === "users"} onClick={() => onFilterChange("users")}>
          {i18next.t("People")}
        </Button>
        <Button
          active={searchType === "groups"}
          onClick={() => onFilterChange("groups")}
        >
          {i18next.t("Groups")}
        </Button>
      </Button.Group>
    </div>
    <div>
      <Search
        placeholder={
          searchType === "users"
            ? i18next.t("Search for user")
            : i18next.t("Search for groups")
        }
        onSearchChange={onSearchChange}
        results={results}
        resultRenderer={renderResult}
        value={searchQuery}
        onResultSelect={onResultSelect}
        showNoResults={false}
        input={{ fluid: true }}
        size="mini"
      />
    </div>
  </Menu.Item>
);

ReviewerSearch.propTypes = {
  searchType: PropTypes.string.isRequired,
  onFilterChange: PropTypes.func.isRequired,
  searchQuery: PropTypes.string.isRequired,
  results: PropTypes.array.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  onResultSelect: PropTypes.func.isRequired,
  renderResult: PropTypes.func.isRequired,
  i18next: PropTypes.object.isRequired,
};

// Renders the list of selected reviewers.
const SelectedReviewersList = ({ selectedReviewers, removeReviewer, i18next }) => {
  if (!selectedReviewers.length) return null;
  return (
    <Menu.Item className="mb-10 mr-5">
      <strong>{i18next.t("Selected reviewers:")}</strong>
      <List className="mt-0 p-0">
        {selectedReviewers.map((item) => (
          <List.Item
            key={item.id}
            className="flex"
            onClick={() => removeReviewer(item.id)}
          >
            {item.links?.avatar ? (
              <img
                src={item.links.avatar}
                alt={item.profile?.full_name || item.name || "avatar"}
              />
            ) : (
              <Icon name="group" className="mr-5" />
            )}
            {item.profile?.full_name || item.name}
            <Icon name="close" className="right-floated" />
          </List.Item>
        ))}
      </List>
    </Menu.Item>
  );
};

SelectedReviewersList.propTypes = {
  selectedReviewers: PropTypes.array.isRequired,
  removeReviewer: PropTypes.func.isRequired,
  i18next: PropTypes.object.isRequired,
};

/* --- Main Component --- */

export const RequestReviewers = ({
  request,
  initialReviewers = [],
  onReviewerAdded,
  permissions,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchType, setSearchType] = useState("users");
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selectedReviewers, setSelectedReviewers] = useState(initialReviewers);

  const requestApi = new InvenioRequestsAPI(new RequestLinksExtractor(request));

  const handleSearchChange = async (e, { value }) => {
    setSearchQuery(value);
    if (value.length > 1) {
      try {
        let suggestions;
        if (searchType === "users") {
          const usersClient = new UsersApi();
          suggestions = await usersClient.suggestUsers(value);
        } else {
          const groupsClient = new GroupsApi();
          suggestions = await groupsClient.getGroups(value);
        }
        setResults(suggestions.data.hits.hits);
      } catch (error) {
        console.error(`Error fetching ${searchType} suggestions:`, error);
        setResults([]);
      }
    } else {
      setResults([]);
    }
  };

  const handleResultSelect = async (e, { result }) => {
    if (!selectedReviewers.find((r) => r.id === result.id)) {
      const newReviewers = [...selectedReviewers, result];
      setSelectedReviewers(newReviewers);
      const res = await requestApi.addReviewer(newReviewers);
      onReviewerAdded({
        newExpandedReviewers: newReviewers,
        newReviewers: res.data.reviewer,
      });
    }
    setSearchQuery("");
    setResults([]);
  };

  const removeReviewer = async (userId) => {
    const newReviewers = selectedReviewers.filter((r) => r.id !== userId);
    setSelectedReviewers(newReviewers);
    const res = await requestApi.addReviewer(newReviewers);
    onReviewerAdded({
      newExpandedReviewers: newReviewers,
      newReviewers: res.data.reviewer,
    });
  };

  // A helper to render a search result item.
  const renderResult = (item) => (
    <Menu.Item key={item.id}>
      {item.links?.avatar && (
        <img
          src={item.links.avatar}
          alt={item.profile?.full_name || item.name || "avatar"}
        />
      )}
      {item.profile?.full_name || item.name}
    </Menu.Item>
  );

  // When the menu is not open, show a collapsed header.
  if (!isMenuOpen) {
    return (
      <CollapsedHeader
        canReview={permissions.can_review}
        onOpen={() => setIsMenuOpen(true)}
        label={i18next.t("Reviewers")}
      />
    );
  }

  return (
    <Menu vertical fitted fluid>
      <Menu.Item header>
        {i18next.t("Reviewers")}
        <Icon
          name="close"
          className="right-aligned"
          onClick={() => setIsMenuOpen(false)}
        />
      </Menu.Item>

      <ReviewerSearch
        searchType={searchType}
        onFilterChange={setSearchType}
        searchQuery={searchQuery}
        results={results}
        onSearchChange={handleSearchChange}
        onResultSelect={handleResultSelect}
        renderResult={renderResult}
        i18next={i18next}
      />

      <SelectedReviewersList
        selectedReviewers={selectedReviewers}
        removeReviewer={removeReviewer}
        i18next={i18next}
      />
    </Menu>
  );
};

RequestReviewers.propTypes = {
  request: PropTypes.object.isRequired,
  initialReviewers: PropTypes.array,
  onReviewerAdded: PropTypes.func.isRequired,
  permissions: PropTypes.shape({
    can_review: PropTypes.bool.isRequired,
  }).isRequired,
};
