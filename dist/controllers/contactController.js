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
exports.ContactController = void 0;
const service_1 = require("../modules/common/service");
const service_2 = __importDefault(require("../modules/contacts/service"));
class ContactController {
    constructor() {
        this.contact_service = new service_2.default();
    }
    create_contact(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            // this check whether all the filds were send through the erquest or not
            if (req.body.phoneNumber && req.body.email) {
                const contact_params = {
                    email: req.body.email,
                    phoneNumber: req.body.phoneNumber,
                };
                const result = yield this.contact_service.createContact(contact_params);
                console.log(result);
                (0, service_1.successResponse)('create contact Successfull', result, res);
            }
            else {
                // error response if some fields are missing in request body
                (0, service_1.insufficientParameters)(res);
            }
        });
    }
    get_contact(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (req.params.id) {
                const contact_filter = { _id: req.params.id };
                const result = yield this.contact_service.filterContact(contact_filter);
                (0, service_1.successResponse)('get contact successfull', result, res);
            }
            else {
                (0, service_1.insufficientParameters)(res);
            }
        });
    }
    update_contact(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (req.params.id && req.body.email || req.body.phoneNumber) {
                const contact_filter = { _id: req.params.id };
                const result = yield this.contact_service.filterContact(contact_filter);
                (0, service_1.successResponse)('updated contact result', null, res);
            }
            else {
                (0, service_1.insufficientParameters)(res);
            }
        });
    }
    delete_user(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (req.params.id) {
                const result = yield this.contact_service.deleteContact(req.params.id);
                (0, service_1.successResponse)('delete contact result', result, res);
            }
            else {
                (0, service_1.insufficientParameters)(res);
            }
        });
    }
}
exports.ContactController = ContactController;
//# sourceMappingURL=contactController.js.map