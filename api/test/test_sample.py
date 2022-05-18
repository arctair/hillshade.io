def test_play_a_card(client):
    response = client.get('/')
    assert response.status_code == 200
    assert response.text == 'hello world'
