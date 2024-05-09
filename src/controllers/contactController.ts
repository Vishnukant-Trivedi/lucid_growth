import { Request, Response } from 'express';
import { insufficientParameters, mongoError, successResponse, failureResponse } from '../modules/common/service';
import { IContact } from '../modules/contacts/model';
import ContactService from '../modules/contacts/service';
import e = require('express');

export class ContactController {

    private contact_service: ContactService = new ContactService();

    public async create_contact(req: Request, res: Response) {
        // this check whether all the filds were send through the erquest or not
        if (req.body.phoneNumber && req.body.email) {
            const contact_params: IContact = {
                email: req.body.email,
                phoneNumber: req.body.phoneNumber,
            };
            const result = await this.contact_service.createContact(contact_params);
            console.log(result);
            
            successResponse('create contact Successfull', result, res);
        } else {
            // error response if some fields are missing in request body
            insufficientParameters(res);
        }
    }

    public async get_contact(req: Request, res: Response) {
        if (req.params.id) {
            const contact_filter = { _id: req.params.id };
            const result = await this.contact_service.filterContact(contact_filter);
            successResponse('get contact successfull', result, res);
        } else {
            insufficientParameters(res);
        }
    }

    public async update_contact(req: Request, res: Response) {
        if (req.params.id && req.body.email || req.body.phoneNumber) {
            const contact_filter = { _id: req.params.id };
            const result = await this.contact_service.filterContact(contact_filter);
            successResponse('updated contact result', null, res);
        } else {
            insufficientParameters(res);
        }
    }

    public async delete_user(req: Request, res: Response) {
        if (req.params.id) {
            const result = await this.contact_service.deleteContact(req.params.id);
            successResponse('delete contact result', result, res);
        } else {
            insufficientParameters(res);
        }
    }
}
