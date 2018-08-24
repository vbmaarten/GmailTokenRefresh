import OAuth2Redis from './OAuth2Redis';
import ExpressTokenServer, { IOAuthParameters } from './ExpressTokenServer';

const OAuthParameters: IOAuthParameters = {
    RESPONSE_TYPE: 'code',
    SCOPE: 'https://www.googleapis.com/auth/gmail.readonly',
    ACCESS_TYPE: 'offline',
    CLIENT_ID: process.env['CLIENT_ID'] || '',
    REDIRECT_URL: process.env['REDIRECT_URL'] || '',
    CLIENT_SECRET: process.env['CLIENT_SECRET'] || '',
}

const OAuthRedis = new OAuth2Redis(
    OAuthParameters.CLIENT_ID, 
    OAuthParameters.CLIENT_SECRET, 
    OAuthParameters.REDIRECT_URL
);

new ExpressTokenServer(OAuthParameters, OAuthRedis);