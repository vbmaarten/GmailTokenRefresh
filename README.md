Server for obtaining and refreshing tokens for using the google Gmail API.

Relies on the following environment variables

* CLIENT_ID = Client id of google API
* CLIENT_SECRET = Client secret of google API
* REDiRECT_URL = URL to redirect to after user has authorized access

* REDIS_PORT = Port redis runs on, defaults to 6379
* REDIS_HOST = Host redis runs on, defaults to 'localhost'