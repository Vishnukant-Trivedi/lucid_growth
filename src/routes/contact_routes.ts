
import { Application, Request, Response } from 'express';
import { ContactController } from '../controllers/contactController';

export class ContactRoutes {

    private contact_controller: ContactController = new ContactController();

    public route(app: Application) {
        
        app.post('/identify', (req: Request, res: Response) => {
            this.contact_controller.create_contact(req, res);
        })

    }
}