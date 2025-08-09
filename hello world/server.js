import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const app = express();
const PORT = 3000;


app.use(express.json());


const dataDir = path.join(process.cwd(), 'data');
const contactsFilePath = path.join(dataDir, 'contacts.json');


const readContacts = async () => {
    try {
        const data = await fs.readFile(contactsFilePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return []; 
    }
};

const writeContacts = async (data) => {
    await fs.mkdir(dataDir, { recursive: true }); 
    await fs.writeFile(contactsFilePath, JSON.stringify(data, null, 2));
};


// 1. CREATE:
app.post('/contacts', async (req, res) => {
    const { name, phone, email, address } = req.body;
    if (!name || !phone) {
        return res.status(400).json({ message: 'name and phone is mandatory' });
    }
    const contacts = await readContacts();
    const newContact = { 
        id: crypto.randomUUID(), 
        name, 
        phone,
        email: email || '',
        address: address || ''
    };
    contacts.push(newContact);
    await writeContacts(contacts);
    res.status(201).json(newContact);
});

// 2. READ:
app.get('/contacts', async (req, res) => {
    const contacts = await readContacts();
    res.json(contacts);
});

// 3. UPDATE: 
app.put('/contacts/:id', async (req, res) => {
    const { id } = req.params;
    const { name, phone, email, address } = req.body;
    const contacts = await readContacts();
    const contactIndex = contacts.findIndex(c => c.id === id);

    if (contactIndex === -1) {
        return res.status(404).json({ message: 'Contact not found' });
    }


    if (name !== undefined) {
    contacts[contactIndex].name = name;
}
if (phone !== undefined) {
    contacts[contactIndex].phone = phone;
}
if (email !== undefined) {
    contacts[contactIndex].email = email;
}
if (address !== undefined) {
    contacts[contactIndex].address = address;
}
    
    await writeContacts(contacts);
    res.json(contacts[contactIndex]);
});

// 4. DELETE:
app.delete('/contacts/:id', async (req, res) => {
    const { id } = req.params;
    const contacts = await readContacts();
    const updatedContacts = contacts.filter(c => c.id !== id);

    if (contacts.length === updatedContacts.length) {
        return res.status(404).json({ message: 'Contact not found' });
    }

    await writeContacts(updatedContacts);
    res.status(200).json({ message: 'Contact deleted succesfully' });
});

// Server ko start karna
app.listen(PORT, () => {
    console.log(`server http://localhost:${PORT}`);
});