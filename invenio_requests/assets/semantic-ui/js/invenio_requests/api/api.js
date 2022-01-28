import { http } from "./config";

export class RequestLinkExtractor {
  constructor(requestLinks) {
    if (!requestLinks) {
      throw TypeError("Request resource links are undefined");
    }
    this.links = requestLinks;
  }

  get timeline () {
    if (!this.links.timeline) {
      throw TypeError("Timeline link missing from resource");
    }
    return this.links.timeline;
  };

  get comments () {
    if (!this.links.comments) {
      throw TypeError("Comments link missing from resource.");
    }
    return this.links.comments;
  };

  get actions () {
    if (!this.links.actions) {
      throw TypeError("Actions link missing from resource.");
    }
    return this.links.actions;
  };
}

export class InvenioRequestsAPI {
  constructor(requestLinkExtractor) {
    this.links = requestLinkExtractor;
  }

  getTimeline = async () => {
    return await http.get(this.links.timeline);
  };


}
