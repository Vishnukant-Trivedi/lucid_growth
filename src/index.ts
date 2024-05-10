import express from 'express';
import mongoose from 'mongoose';
import session from 'express-session';
import axios from 'axios';
import dotenv from "dotenv";
import bodyParser from 'body-parser';
import cors from 'cors';
import { Request, Response } from 'express';
dotenv.config();

let channelSettingsData:any[];
let token:string;
const mongoUrl = 'mongodb+srv://vishnutrd11:qgZvua2xZigWKkcS@cluster0.lrkquyr.mongodb.net/Lucid_db?retryWrites=true&w=majority&appName=Cluster0'
mongoose.connect(mongoUrl);
const app = express();
app.use(cors({
  origin: 'https://slack-notification-six.vercel.app'
}));
declare module 'express-session' {
    interface SessionData {
      slack_access_token?: string;
      slack_user_id?: string;
      // Add any other custom properties here
    }
  }
app.use(
    session({
      secret: process.env.SESSION_SECRET || 'default-secret',
      resave: false,
      saveUninitialized: true,
      cookie: { secure: "auto" },
    }),
);
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));
  // Redirect user to Slack's OAuth authorization page
app.get("/auth/slack", (req: Request, res: Response) => {
    const scopes = "channels:read";
    return res.redirect(
      `https://slack.com/oauth/v2/authorize?client_id=${
        process.env.SLACK_CLIENT_ID
      }&user_scope=${encodeURIComponent(
        scopes,
      )}&redirect_uri=${encodeURIComponent(process.env.SLACK_REDIRECT_URI || 'default-secret')}`,
    );
  });

  app.get("/auth/slack/callback", async (req: Request, res: Response) => {
    const { code } = req.query;
    try {
      const tokenResponse = await axios.post(
        "https://slack.com/api/oauth.v2.access",
        null,
        {
          params: {
            code,
            client_id: process.env.SLACK_CLIENT_ID,
            client_secret: process.env.SLACK_CLIENT_SECRET,
            redirect_uri: process.env.SLACK_REDIRECT_URI,
          },
        },
      );
  
      if (tokenResponse.data.ok) {
        // Save the tokens in session or a secure place
        const accessToken = tokenResponse.data.authed_user.access_token;
        req.session.slack_access_token = accessToken;
        token = accessToken;
        req.session.slack_user_id = tokenResponse.data.authed_user.id;
      
        // Fetch user's channels
        const channelsResponse = await axios.get(
          "https://slack.com/api/conversations.list",
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          },
        );
  
        if (channelsResponse.data.ok) {
          const channels = channelsResponse.data.channels
            .map((channel: { name: any; }) => channel.name)
            .join(", ");

            channelSettingsData = channelsResponse.data.channels.map((channel: { id: string, name: string }) => ({
              id: channel.id,
              name: channel.name
          }));
            
          return res.send(
            `Authorization successful! Here are your channels: ${channels}.<form action="https://slack-notification-six.vercel.app/settings" method="get">
            <button type="submit">Let's Go!</button>
          </form>`,
          );
        } else {
          return res
            .status(500)
            .send("Error fetching channels: " + channelsResponse.data.error);
        }
      } else {
         return res
          .status(500)
          .send("Error authorizing with Slack: " + tokenResponse.data.error);
      }
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .send(
          "Server error when exchanging code for token or fetching channels.",
        );
    }
  });
app.get('/channel-list', async (req: Request, res: Response) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://slack-notification-six.vercel.app');
  res.setHeader('Access-Control-Request-Method', 'GET');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Headers','Content-Type, Authorization');
  return res.send(channelSettingsData);
});

app.get('/', async (req: Request, res: Response) => {
  
  return res.send('Express Typescript on Vercel')
});

app.post('/message', async (req: Request, res: Response) => {
  const apiUrl = "https://slack.com/api/chat.postMessage";
  const headers = {
    Authorization: `Bearer ${token}`
  };
  
  const messageResponse = await axios.post(apiUrl, req.body,
    {
    headers: { Authorization: `Bearer ${token}` },
  });
  res.setHeader('Access-Control-Allow-Origin', 'https://slack-notification-six.vercel.app');
  res.setHeader('Access-Control-Request-Method', 'POST');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if(messageResponse.data.ok){
     return res.send('Notification send! Please check');
  } else {
    return res.status(500).send(messageResponse.data.error);
  }

});
app.listen(1234, () => {
    console.log('The application is listening on port 1234!');
})

export default app;