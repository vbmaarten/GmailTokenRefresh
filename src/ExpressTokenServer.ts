import * as express from 'express';
import OAuth2Redis from './OAuth2Redis';

const OAUTH_GOOGLE_GATE = 'https://accounts.google.com/o/oauth2/v2/auth';

export interface IOAuthParameters {
    RESPONSE_TYPE: string;
    SCOPE: string;
    ACCESS_TYPE: string;
    CLIENT_ID: string;
    REDIRECT_URL: string;
    CLIENT_SECRET: string;
}

export default class ExpessTokenServer {
    private _OAuthParameter: IOAuthParameters;
    private _OAuth2Redis: OAuth2Redis;
    private _app: express.Express;

    constructor(OAuthParameters: IOAuthParameters, OAuth2Redis: OAuth2Redis){
        this._OAuthParameter = OAuthParameters;
        this._OAuth2Redis = OAuth2Redis;
        this._app = express();

        this._app.get('/oauth', this.OAuthRoute.bind(this));
        this._app.listen(3000);
    }

    private OAuthRoute(req: express.Request, res: express.Response){
        console.log(this);
        if (!req.param('code')) {
            console.log('x');
            this.showAuthorizationScreen(res);
        } else {
            this.saveTokens(req,res);
        }
    }

    private showAuthorizationScreen(res: express.Response){
        res.redirect(`${OAUTH_GOOGLE_GATE}?` +
        `client_id=${this._OAuthParameter.CLIENT_ID}`
        + `&response_type=${this._OAuthParameter.RESPONSE_TYPE}`
        + `&scope=${this._OAuthParameter.SCOPE}`
        + `&redirect_uri=${this._OAuthParameter.REDIRECT_URL}`
        + `&access_type=${this._OAuthParameter.ACCESS_TYPE}`
        + `&prompt=consent`);
    }

    private saveTokens(req: express.Request, res: express.Response){
        try {
            const code = req.param('code');
            const tokensFetched = this._OAuth2Redis.fetchTokensFromCode(code);
            if(tokensFetched){
                this._OAuth2Redis.startPeriodicTokenRefreshing();
                res.send('Authorization complete');
            } else {
                res.send('No tokens received')
            }
        }
        catch(e){
            res.send(`Error occured: ${e}`)
        }
    }
}