"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const { Schema } = mongoose_1.default;
const ContactSchema = new Schema({
    phoneNumber: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    linkedId: {
        type: Schema.Types.ObjectId,
        ref: 'Contact'
    },
    linkPrecedence: {
        type: String,
        enum: ["secondary", "primary"]
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    deletedAt: {
        type: Date,
        default: null
    }
});
const ContactModel = mongoose_1.default.model('Contact', ContactSchema);
exports.default = ContactModel;
//# sourceMappingURL=schema.js.map