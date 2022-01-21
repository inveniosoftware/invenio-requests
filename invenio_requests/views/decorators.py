from functools import wraps

from flask import g

from invenio_requests.proxies import current_requests


def service():
    """Get the requests service."""
    return current_requests.requests_service


def pass_request(f):
    """Decorate to retrieve the community record using the request service.
    """

    @wraps(f)
    def view(**kwargs):
        pid_value = kwargs.get('pid_value')
        request = service().read(
            id_=pid_value, identity=g.identity
        )
        kwargs['request'] = request
        return f(**kwargs)

    return view
