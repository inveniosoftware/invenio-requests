from flask import current_app, render_template

from invenio_requests.views.decorators import pass_request


@pass_request
def requests_detail(request=None, pid_value=None):
    """Community detail page."""
    return render_template(
        "invenio_requests/details/index.html",
        request=request.to_dict(),  # TODO: use serializer
        # Pass permissions so we can disable partially UI components
        permissions=request.has_permissions_to(['update', 'read']),
    )
