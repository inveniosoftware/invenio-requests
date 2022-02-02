import React, { Component } from "react";
import { Feed, Image } from "semantic-ui-react";
import PropTypes from "prop-types";
import Overridable from "react-overridable";

const TimelineEvent = ({ event }) => {
  // TODO i18n
  return (
    <Overridable id="TimelineEvent.layout" event={event}>
      <Feed.Event>
        <Feed.Label>
          <Image src="/static/images/placeholder.png" as={Image} rounded />
        </Feed.Label>
        <Feed.Content>
          <Feed.Summary>
            {/*TODO replace with event.icon and add a translated event description*/}
            <Feed.User as="a">{event.created_by?.user}</Feed.User> commented
            <Feed.Date>{event.created}</Feed.Date>
          </Feed.Summary>
          <Feed.Extra text>
            {event.payload?.format === "html" ? (
              <div
                dangerouslySetInnerHTML={{ __html: event.payload?.content }}
              />
            ) : (
              event.payload?.content
            )}
          </Feed.Extra>
        </Feed.Content>
      </Feed.Event>
    </Overridable>
  );
};

TimelineEvent.propTypes = {
  event: PropTypes.object.isRequired,
};

export default Overridable.component(
  "TimelineEvent",
  TimelineEvent
);
