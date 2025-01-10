import {Router} from 'express';
import ContactController from '../controllers/contactController';
import ContactService from '../services/contactService';
import Contact from '../models/Contact';
import userAuth from '../middlewares/userAuth';
const contactService = new ContactService(Contact);

// Initialize the controller with the agent service
const controller = new ContactController(contactService);

// Create a new Express router instance
const router = Router();

router.get('/', userAuth, controller.allContacts);

router.get(`/filter-by-name`, userAuth, controller.filterByName);

router.get(`/search-by-name`, userAuth, controller.searchByname);

router.get(
	`/search-contacts-by-location`,
	userAuth,
	controller.selectByLocation
);

router.get(`/search-contacts-by-service`, userAuth, controller.selectByService);

router.get(`/find-contact-by-email`, userAuth, controller.getContactByEmail);

router.get('/display-contact/:id', userAuth, controller.getContactById);

export default router;
