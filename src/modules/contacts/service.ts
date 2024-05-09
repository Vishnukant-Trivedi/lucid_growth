import { IContact } from './model';
import ContactModel from './schema';

export default class ContactService {
    
    public async createContact(contact_params: IContact) {
        try {
            // Check if a contact with the same phone number exists
            const existingContact_phoneNumber = await ContactModel.findOne({ phoneNumber: contact_params.phoneNumber });

            // Check if a contact with the same email exists
            const existingContact_email = await ContactModel.findOne({ email: contact_params.email });
            // If no existing contact found, create a new primary contact
            if (!existingContact_phoneNumber && !existingContact_email) {
                const newContact = await ContactModel.create({ ...contact_params, linkPrecedence: "primary" });
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
                if((existingContact_email && existingContact_phoneNumber) && (existingContact_email?.id != existingContact_phoneNumber?.id)){
                    newSecondaryContact = await ContactModel.updateOne({ _id: existingContact_phoneNumber?._id },
                        { $set: { linkPrecedence: "secondary", linkedId: existingContact_email?._id } }
                    );
                    existingData = existingContact_email;
                } else {
                    newSecondaryContact = await ContactModel.create({ ...contact_params, linkedId: existingContact_phoneNumber?._id, linkPrecedence: "secondary" });
                    existingData = existingContact_phoneNumber;
                }
                
                // Find all secondary contacts linked to the existing contact
                const secondaryContacts = await ContactModel.find({ linkedId: existingData?._id, linkPrecedence: "secondary" });
                console.log(secondaryContacts);
                // Extract the IDs of the secondary contacts
                const secondaryContactIds = secondaryContacts.map(contact => contact._id);

                // Extract the Emails of the same phoneNumber
                const samePhoneNumberContacts = await ContactModel.find({ phoneNumber: existingData?.phoneNumber });
                
                // Extract emails from all contacts with the same phone number
                const emails = secondaryContacts.map(contact => contact.email);

                const phone_number = [...new Set(secondaryContacts.map(contact => contact.phoneNumber))];
                return {
                    contact: {
                        primaryContatctId: existingData?._id,
                        emails: [existingData?.email, ...emails],
                        phoneNumbers: phone_number,
                        secondaryContactIds
                    }
                };
            }
        } catch (error) {
            throw error;
        }
    }

    public async filterContact(query: any) {
        try {
            const contact = await ContactModel.findOne(query);
            return contact;
        } catch (error) {
            throw error;
        }
    }

    public async updateContact(contact_params: IContact) {
        try {
            const updatedContact = await ContactModel.findOneAndUpdate({ _id: contact_params.id }, contact_params, { new: true });
            return updatedContact;
        } catch (error) {
            throw error;
        }
    }
    
    public async deleteContact(_id: String) {
        try {
            await ContactModel.deleteOne({ _id });
        } catch (error) {
            throw error;
        }
    }

}