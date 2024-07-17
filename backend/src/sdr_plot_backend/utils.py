import pytest
from sdr_plot_backend import create_app

@pytest.fixture
def app():
    app = create_app()
    app.config.update({
        "TESTING": True,
    })
    yield app

@pytest.fixture
def client(app):
    return app.test_client()

def test_get_data(client):
    response = client.get("/api/data")
    assert response.status_code == 200
    data = response.get_json()
    assert "fft" in data
    assert "time" in data
