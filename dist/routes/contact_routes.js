"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactRoutes = void 0;
const contactController_1 = require("../controllers/contactController");
class ContactRoutes {
    constructor() {
        this.contact_controller = new contactController_1.ContactController();
    }
    route(app) {
        app.post('/identify', (req, res) => {
            this.contact_controller.create_contact(req, res);
        });
    }
}
exports.ContactRoutes = ContactRoutes;
//# sourceMappingURL=contact_routes.js.map