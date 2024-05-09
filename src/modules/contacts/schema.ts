import mongoose from 'mongoose';

const { Schema } = mongoose;
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

const ContactModel = mongoose.model('Contact', ContactSchema);

export default ContactModel;
