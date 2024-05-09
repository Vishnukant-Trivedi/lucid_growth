import express from 'express';
import { CommonRoutes } from './routes/common_routes';
import { ContactRoutes } from './routes/contact_routes';
import mongoose from 'mongoose';
import session from 'express-session';
import axios from 'axios';
import dotenv from "dotenv";
dotenv.config();

let channelSettingsData:any[];
let token:string;
const test_routes: ContactRoutes = new ContactRoutes();
const common_route: CommonRoutes = new CommonRoutes();
const mongoUrl = 'mongodb+srv://vishnutrd11:qgZvua2xZigWKkcS@cluster0.lrkquyr.mongodb.net/Lucid_db?retryWrites=true&w=majority&appName=Cluster0'
mongoose.connect(mongoUrl);
const app = express();
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
app.use(express.urlencoded({extended:false}));
app.use(express.json());
  // Redirect user to Slack's OAuth authorization page
app.get("/auth/slack", (req, res) => {
    const scopes = "channels:read";
    res.redirect(
      `https://slack.com/oauth/v2/authorize?client_id=${
        process.env.SLACK_CLIENT_ID
      }&user_scope=${encodeURIComponent(
        scopes,
      )}&redirect_uri=${encodeURIComponent(process.env.SLACK_REDIRECT_URI || 'default-secret')}`,
    );
  });

  app.get("/auth/slack/callback", async (req, res) => {
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
            
          res.send(
            `Authorization successful! Here are your channels: ${channels}.<form action="https://slack-notification-six.vercel.app/settings" method="get">
            <button type="submit">Let's Go!</button>
          </form>`,
          );
        } else {
          res
            .status(500)
            .send("Error fetching channels: " + channelsResponse.data.error);
        }
      } else {
        res
          .status(500)
          .send("Error authorizing with Slack: " + tokenResponse.data.error);
      }
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .send(
          "Server error when exchanging code for token or fetching channels.",
        );
    }
  });
app.get('/channel-list', async (req, res) => {
  
  res.send(channelSettingsData);
});

app.get('/', async (req, res) => {
  
  res.send("Success");
});

app.post('/message', async (req, res) => {
  const apiUrl = "https://slack.com/api/chat.postMessage";
  const headers = {
    Authorization: `Bearer ${token}`
  };
  
  const messageResponse = await axios.post(apiUrl, req.body,
    {
    headers: { Authorization: `Bearer ${token}` },
  });
  
  if(messageResponse.data.ok){
    res.send('Notification send! Please check');
  } else {
    res.status(500).send(messageResponse.data.error);
  }

});
test_routes.route(app);
common_route.route(app);
app.listen(1234, () => {
    console.log('The application is listening on port 1234!');
})