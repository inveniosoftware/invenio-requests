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
import {
  Header,
  Button,
  Icon,
  Item,
  Grid,
  Search,
  List,
  Image,
  Segment,
} from "semantic-ui-react";
import { UsersApi } from "@js/invenio_communities/api/UsersApi";
import { GroupsApi } from "@js/invenio_communities/api/GroupsApi";
import {
  InvenioRequestsAPI,
  RequestLinksExtractor,
} from "@js/invenio_requests/api/InvenioRequestApi";
import { i18next } from "@translations/invenio_requests/i18next";
import RequestsFeed from "../components/RequestsFeed";
import { EntityDetails, DeletedResource } from "./RequestMetadata";

const isResourceDeleted = (details) => details.is_ghost === true;

/* --- Sub-components --- */

// Renders the header when the menu is collapsed.
const CollapsedHeader = ({ canReview, onOpen, label }) => {
  if (!canReview) {
    return (
      <Header as="h3" size="tiny">
        {label}
      </Header>
    );
  }
  return (
    <Header as="h3" size="tiny" onClick={onOpen} className="cursor-pointer">
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
  <>
    <div className="mb-10">
      <Button.Group fluid basic size="mini">
        <Button active={searchType === "user"} onClick={() => onFilterChange("user")}>
          {i18next.t("People")}
        </Button>
        <Button active={searchType === "group"} onClick={() => onFilterChange("group")}>
          {i18next.t("Groups")}
        </Button>
      </Button.Group>
    </div>

    <div>
      <Search
        placeholder={
          searchType === "user"
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
  </>
);

ReviewerSearch.propTypes = {
  searchType: PropTypes.oneOf(["user", "group"]).isRequired,
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
    <>
      <Header fluid as="h4" className="mb-5" size="tiny">
        {i18next.t("Selected reviewers")}
      </Header>

      <Grid>
        {selectedReviewers.map((reviewer) => (
          <>
            <Grid.Column width={14} className="pb-0">
              <React.Fragment key={reviewer.id}>
                {isResourceDeleted(reviewer) ? (
                  <DeletedResource details={reviewer} />
                ) : (
                  <>
                    <EntityDetails userData={reviewer} details={reviewer} />
                  </>
                )}
              </React.Fragment>
            </Grid.Column>
            <Grid.Column width={2}>
              <Icon name="close" className="right-floated" />
            </Grid.Column>
          </>
        ))}
      </Grid>
    </>
  );
};

SelectedReviewersList.propTypes = {
  selectedReviewers: PropTypes.array.isRequired,
  removeReviewer: PropTypes.func.isRequired,
  i18next: PropTypes.object.isRequired,
};

/* --- Main Component --- */

export const RequestReviewers = ({ request, permissions }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchType, setSearchType] = useState("user");
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);

  const reviewers = request.expanded?.reviewer || [];

  const initialReviewers = reviewers.map((r, index) => {
    return "user" in request.reviewer[index]
      ? { ...r, user: request.reviewer[index].user }
      : { ...r, group: request.reviewer[index].group };
  });

  const [selectedReviewers, setSelectedReviewers] = useState(initialReviewers);
  const requestApi = new InvenioRequestsAPI(new RequestLinksExtractor(request));

  const handleSearchChange = async (e, { value }) => {
    setSearchQuery(value);
    if (value.length > 1) {
      try {
        let suggestions;
        if (searchType === "user") {
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
      const newReviewers = [
        ...selectedReviewers,
        { ...result, [searchType]: result.id },
      ];
      setSelectedReviewers(newReviewers);
      const res = await requestApi.addReviewer(newReviewers);
    }
    setSearchQuery("");
    setResults([]);
  };

  const removeReviewer = async (userId) => {
    const newReviewers = selectedReviewers.filter((r) => r.id !== userId);
    setSelectedReviewers(newReviewers);
    const res = await requestApi.addReviewer(newReviewers);
    setSelectedReviewers(newReviewers);
  };

  // A helper to render a search result item.
  const renderResult = (item) => (
    <List.Item key={item.id}>
      <RequestsFeed.Avatar src={item.links?.avatar} as={Image} circular size="tiny" />
      {item.profile?.full_name || item.name}
    </List.Item>
  );

  return (
    <>
      <CollapsedHeader
        canReview={permissions.can_review}
        onOpen={() => setIsMenuOpen(!isMenuOpen)}
        label={i18next.t("Reviewers")}
      />
      {!isMenuOpen ? (
        <Grid>
          {selectedReviewers.map((reviewer) => (
            <>
              <Grid.Column width={14} className="pb-0">
                <React.Fragment key={reviewer.id}>
                  {isResourceDeleted(reviewer) ? (
                    <DeletedResource details={reviewer} />
                  ) : (
                    <>
                      <EntityDetails userData={reviewer} details={reviewer} />
                    </>
                  )}
                </React.Fragment>
              </Grid.Column>
              {request.last_opiniated_reviews?.user == reviewer.id && (
                <Grid.Column width={2}>
                  <Icon name="green check" className="right-floated" />
                </Grid.Column>
              )}
            </>
          ))}
        </Grid>
      ) : (
        <Segment attached>
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
        </Segment>
      )}
    </>
  );
};

RequestReviewers.propTypes = {
  request: PropTypes.object.isRequired,
  permissions: PropTypes.shape({
    can_review: PropTypes.bool.isRequired,
  }).isRequired,
};
