"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const express_session_1 = __importDefault(require("express-session"));
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
const body_parser_1 = __importDefault(require("body-parser"));
dotenv_1.default.config();
let channelSettingsData;
let token;
const mongoUrl = 'mongodb+srv://vishnutrd11:qgZvua2xZigWKkcS@cluster0.lrkquyr.mongodb.net/Lucid_db?retryWrites=true&w=majority&appName=Cluster0';
mongoose_1.default.connect(mongoUrl);
const app = (0, express_1.default)();
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET || 'default-secret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: "auto" },
}));
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
// Redirect user to Slack's OAuth authorization page
app.get("/auth/slack", (req, res) => {
    const scopes = "channels:read";
    return res.redirect(`https://slack.com/oauth/v2/authorize?client_id=${process.env.SLACK_CLIENT_ID}&user_scope=${encodeURIComponent(scopes)}&redirect_uri=${encodeURIComponent(process.env.SLACK_REDIRECT_URI || 'default-secret')}`);
});
app.get("/auth/slack/callback", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { code } = req.query;
    try {
        const tokenResponse = yield axios_1.default.post("https://slack.com/api/oauth.v2.access", null, {
            params: {
                code,
                client_id: process.env.SLACK_CLIENT_ID,
                client_secret: process.env.SLACK_CLIENT_SECRET,
                redirect_uri: process.env.SLACK_REDIRECT_URI,
            },
        });
        if (tokenResponse.data.ok) {
            // Save the tokens in session or a secure place
            const accessToken = tokenResponse.data.authed_user.access_token;
            req.session.slack_access_token = accessToken;
            token = accessToken;
            req.session.slack_user_id = tokenResponse.data.authed_user.id;
            // Fetch user's channels
            const channelsResponse = yield axios_1.default.get("https://slack.com/api/conversations.list", {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            if (channelsResponse.data.ok) {
                const channels = channelsResponse.data.channels
                    .map((channel) => channel.name)
                    .join(", ");
                channelSettingsData = channelsResponse.data.channels.map((channel) => ({
                    id: channel.id,
                    name: channel.name
                }));
                return res.send(`Authorization successful! Here are your channels: ${channels}.<form action="https://slack-notification-six.vercel.app/settings" method="get">
            <button type="submit">Let's Go!</button>
          </form>`);
            }
            else {
                return res
                    .status(500)
                    .send("Error fetching channels: " + channelsResponse.data.error);
            }
        }
        else {
            return res
                .status(500)
                .send("Error authorizing with Slack: " + tokenResponse.data.error);
        }
    }
    catch (error) {
        console.error(error);
        return res
            .status(500)
            .send("Server error when exchanging code for token or fetching channels.");
    }
}));
app.get('/channel-list', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    return res.send(channelSettingsData);
}));
app.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    return res.send('Express Typescript on Vercel');
}));
app.post('/message', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const apiUrl = "https://slack.com/api/chat.postMessage";
    const headers = {
        Authorization: `Bearer ${token}`
    };
    const messageResponse = yield axios_1.default.post(apiUrl, req.body, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (messageResponse.data.ok) {
        return res.send('Notification send! Please check');
    }
    else {
        return res.status(500).send(messageResponse.data.error);
    }
}));
app.listen(1234, () => {
    console.log('The application is listening on port 1234!');
});
exports.default = app;
//# sourceMappingURL=index.js.map