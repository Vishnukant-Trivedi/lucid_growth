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
const schema_1 = __importDefault(require("./schema"));
class ContactService {
    createContact(contact_params) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Check if a contact with the same phone number exists
                const existingContact_phoneNumber = yield schema_1.default.findOne({ phoneNumber: contact_params.phoneNumber });
                // Check if a contact with the same email exists
                const existingContact_email = yield schema_1.default.findOne({ email: contact_params.email });
                // If no existing contact found, create a new primary contact
                if (!existingContact_phoneNumber && !existingContact_email) {
                    const newContact = yield schema_1.default.create(Object.assign(Object.assign({}, contact_params), { linkPrecedence: "primary" }));
                    return {
                        contact: {
                            primaryContatctId: newContact._id,
                            emails: [newContact.email],
                            phoneNumbers: [newContact.phoneNumber],
                            secondaryContactIds: []
                        }
                    };
                }
                // If an existing contact found, create a secondary contact linked to it
                else {
                    let newSecondaryContact;
                    let existingData;
                    // If both the data is found and are not pointing to same document
                    if ((existingContact_email && existingContact_phoneNumber) && ((existingContact_email === null || existingContact_email === void 0 ? void 0 : existingContact_email.id) != (existingContact_phoneNumber === null || existingContact_phoneNumber === void 0 ? void 0 : existingContact_phoneNumber.id))) {
                        newSecondaryContact = yield schema_1.default.updateOne({ _id: existingContact_phoneNumber === null || existingContact_phoneNumber === void 0 ? void 0 : existingContact_phoneNumber._id }, { $set: { linkPrecedence: "secondary", linkedId: existingContact_email === null || existingContact_email === void 0 ? void 0 : existingContact_email._id } });
                        existingData = existingContact_email;
                    }
                    else {
                        newSecondaryContact = yield schema_1.default.create(Object.assign(Object.assign({}, contact_params), { linkedId: existingContact_phoneNumber === null || existingContact_phoneNumber === void 0 ? void 0 : existingContact_phoneNumber._id, linkPrecedence: "secondary" }));
                        existingData = existingContact_phoneNumber;
                    }
                    // Find all secondary contacts linked to the existing contact
                    const secondaryContacts = yield schema_1.default.find({ linkedId: existingData === null || existingData === void 0 ? void 0 : existingData._id, linkPrecedence: "secondary" });
                    console.log(secondaryContacts);
                    // Extract the IDs of the secondary contacts
                    const secondaryContactIds = secondaryContacts.map(contact => contact._id);
                    // Extract the Emails of the same phoneNumber
                    const samePhoneNumberContacts = yield schema_1.default.find({ phoneNumber: existingData === null || existingData === void 0 ? void 0 : existingData.phoneNumber });
                    // Extract emails from all contacts with the same phone number
                    const emails = secondaryContacts.map(contact => contact.email);
                    const phone_number = [...new Set(secondaryContacts.map(contact => contact.phoneNumber))];
                    return {
                        contact: {
                            primaryContatctId: existingData === null || existingData === void 0 ? void 0 : existingData._id,
                            emails: [existingData === null || existingData === void 0 ? void 0 : existingData.email, ...emails],
                            phoneNumbers: phone_number,
                            secondaryContactIds
                        }
                    };
                }
            }
            catch (error) {
                throw error;
            }
        });
    }
    filterContact(query) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const contact = yield schema_1.default.findOne(query);
                return contact;
            }
            catch (error) {
                throw error;
            }
        });
    }
    updateContact(contact_params) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const updatedContact = yield schema_1.default.findOneAndUpdate({ _id: contact_params.id }, contact_params, { new: true });
                return updatedContact;
            }
            catch (error) {
                throw error;
            }
        });
    }
    deleteContact(_id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield schema_1.default.deleteOne({ _id });
            }
            catch (error) {
                throw error;
            }
        });
    }
}
exports.default = ContactService;
//# sourceMappingURL=service.js.map