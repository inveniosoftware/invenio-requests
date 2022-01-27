import React, { Component } from "react";
import { Feed, Image } from "semantic-ui-react";
import PropTypes from "prop-types";

const TimelineEvent = ({ event }) => {
  // TODO i18n
  return (
    <Feed.Event>
      <Feed.Label>
        <Image src="/static/images/placeholder.png" as={Image} rounded />
      </Feed.Label>
      <Feed.Content>
        <Feed.Summary>
          <Feed.User as="a">{event.created_by?.user}</Feed.User>
          <Feed.Date>{event.created}</Feed.Date>
        </Feed.Summary>
        <Feed.Extra text>
          {event.payload?.format === "html" ? (
            <div dangerouslySetInnerHTML={{ __html: event.payload?.content }} />
          ) : (
            event.payload?.content
          )}
        </Feed.Extra>
      </Feed.Content>
    </Feed.Event>
  );
};

TimelineEvent.propTypes = {
  event: PropTypes.object.isRequired
};

export default TimelineEvent;
