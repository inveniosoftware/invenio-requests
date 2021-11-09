import pytest


@pytest.fixture()
def example_record(app, db, input_data):
    """Example data layer record."""
    record = Record.create({}, **input_data)
    db.session.commit()
    return record


@pytest.fixture()
def comments_service_data():
    """Input data for the Comments Service."""
    return {}
