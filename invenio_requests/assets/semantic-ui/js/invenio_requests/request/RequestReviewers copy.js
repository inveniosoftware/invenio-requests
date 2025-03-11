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

/**
 * Inline style objects.
 */
const styles = {
  menu: {
    width: "300px",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  closeIcon: {
    cursor: "pointer",
    marginLeft: "auto",
  },
  dropdownSearchItem: {
    padding: "0.5rem 1rem",
  },
  buttonGroupContainer: {
    marginBottom: "0.5rem",
  },
  search: {
    width: "100%",
  },
  avatar: {
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    marginRight: "0.5rem",
  },
  searchResultItem: {
    margin: "0.5em 0",
    display: "flex",
    alignItems: "center",
  },
  selectedReviewersContainer: {
    padding: "0.5rem 1rem",
  },
  selectedList: {
    marginTop: "0.5rem",
    listStyleType: "none",
    padding: 0,
  },
  selectedItem: {
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
    margin: "0.5rem 0",
  },
  removeIcon: {
    marginLeft: "auto",
    cursor: "pointer",
  },
  headerTrigger: {
    cursor: "pointer",
  },
};

/* --- Sub-components --- */

// Renders the header when the menu is collapsed.
const CollapsedHeader = ({ canReview, onOpen, label, headerTriggerStyle }) => {
  if (!canReview) {
    return (
      <Header as="h3" size="tiny">
        {label}
      </Header>
    );
  }
  return (
    <Header as="h3" size="tiny" onClick={onOpen} style={headerTriggerStyle}>
      {label}
      <Icon name="setting" className="right-floated" size="mini" />
    </Header>
  );
};

CollapsedHeader.propTypes = {
  canReview: PropTypes.bool.isRequired,
  onOpen: PropTypes.func,
  label: PropTypes.string.isRequired,
  headerTriggerStyle: PropTypes.object,
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
  styles,
  i18next,
}) => (
  <Menu.Item style={styles.dropdownSearchItem}>
    <div style={styles.buttonGroupContainer}>
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
        style={styles.search}
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
  styles: PropTypes.object.isRequired,
  i18next: PropTypes.object.isRequired,
};

// Renders the list of selected reviewers.
const SelectedReviewersList = ({
  selectedReviewers,
  removeReviewer,
  styles,
  i18next,
}) => {
  if (!selectedReviewers.length) return null;
  return (
    <Menu.Item style={styles.selectedReviewersContainer}>
      <strong>{i18next.t("Selected reviewers:")}</strong>
      <List style={styles.selectedList}>
        {selectedReviewers.map((item) => (
          <List.Item
            key={item.id}
            style={styles.selectedItem}
            onClick={() => removeReviewer(item.id)}
          >
            {item.links?.avatar ? (
              <img
                src={item.links.avatar}
                alt={item.profile?.full_name || item.name || "avatar"}
                style={styles.avatar}
              />
            ) : (
              <Icon name="group" className="mr-5" />
            )}
            {item.profile?.full_name || item.name}
            <Icon name="close" style={styles.removeIcon} />
          </List.Item>
        ))}
      </List>
    </Menu.Item>
  );
};

SelectedReviewersList.propTypes = {
  selectedReviewers: PropTypes.array.isRequired,
  removeReviewer: PropTypes.func.isRequired,
  styles: PropTypes.object.isRequired,
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
    <Menu.Item key={item.id} style={styles.searchResultItem}>
      {item.links?.avatar && (
        <img
          src={item.links.avatar}
          alt={item.profile?.full_name || item.name || "avatar"}
          style={styles.avatar}
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
        headerTriggerStyle={styles.headerTrigger}
      />
    );
  }

  return (
    <Menu vertical fitted style={styles.menu} fluid>
      <Menu.Item header style={styles.header}>
        <Icon name="users" />
        {i18next.t("Reviewers")}
        <Icon
          name="close"
          style={styles.closeIcon}
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
        styles={styles}
        i18next={i18next}
      />

      <SelectedReviewersList
        selectedReviewers={selectedReviewers}
        removeReviewer={removeReviewer}
        styles={styles}
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
