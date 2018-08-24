import * as redis from 'redis';
import {google} from 'googleapis';

const REDIS_PORT = process.env['REDIS_PORT'];
const REDIS_HOST = process.env['REDIS_HOST'];

const redisClient = redis.createClient(
    parseInt(REDIS_PORT|| '6379'),
    REDIS_HOST|| 'localhost',
);

export default class OAuth2Redis {
    private _oauth2client: any; 
    private tokenRefreshIntervalActive: Boolean;

    constructor(clientId: string, clientSecret: string, redirectUrl: string){
        this._oauth2client = new google.auth.OAuth2(clientId, clientSecret, redirectUrl);
        this.tokenRefreshIntervalActive = false;
        this.restoreSavedTokens();
    }

    private restoreSavedTokens(){
        redisClient.get('access_token', (err, access_token) => {
            redisClient.get('refresh_token', async (err, refresh_token) => {
                if(access_token && refresh_token){
                    this._oauth2client.setCredentials({
                        access_token,
                        refresh_token,
                    });
    
                    await this.refreshTokens();
                    this.startPeriodicTokenRefreshing();
                }
            })
        })
    }

    private async refreshTokens(){
        const tokens = await this._oauth2client.refreshAccessToken();
        if(tokens.credentials.access_token){
            await this.saveTokensToRedis(tokens.credentials.access_token, tokens.credentials.refresh_token);
        }
    }

    private saveTokensToRedis(access_token: string, refresh_token: string){
        redisClient.set('access_token', access_token);
        refresh_token && redisClient.set('refresh_token', refresh_token);
    }

    public setTokens(access_token: string, refresh_token: string){
        this._oauth2client.setCredentials({
            access_token,
            refresh_token,
        });

        this.saveTokensToRedis(access_token, refresh_token);
    }

    public startPeriodicTokenRefreshing(){
        if(!this.tokenRefreshIntervalActive){
            setInterval(this.refreshTokens, 3600000/2);
            this.tokenRefreshIntervalActive = true;
        }
    }

    public async fetchTokensFromCode(code: string){
        const token = await this._oauth2client.getToken(code);
        if(token.tokens.access_token){
            this._oauth2client.setCredentials(token.tokens);
            this.saveTokensToRedis(token.tokens.access_token, token.tokens.refresh_token);
            return true;
        } else {
            return false;
        }
    }
}