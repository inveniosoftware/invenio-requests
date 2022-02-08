export function buildRequestTypeUID(elementName, requestType, overridableId='', appName='') {
  const _overridableId = overridableId ? `.${overridableId}` : '';
  const _requestType = requestType ? `.${requestType}` : '';
  const _appName = appName ? `${appName}.` : '';

  return `${_appName}${elementName}${_requestType}${_overridableId}`;
}
