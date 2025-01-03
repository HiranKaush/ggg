const axios = require('axios');
//const SmsCount = require('../models/smsCount'); // Import your SMS count model here
const instituteModel = require('../models/instituteModel');

const sendSMS = async (req, res) => {
    try {
        const { to, message,instID } = req.body;


        const user_id = "26730";
        const api_key = "tmGnA2446kmhvuUHjyHl";
        const sender_id = "EDU TEXTA";
       // const _id = id

      

        // Make sure required fields are present
        if (!user_id || !api_key || !sender_id || !to || !message) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Construct the URL
        const url = "https://app.notify.lk/api/v1/send";

        // Construct the request payload
        const payload = {
            user_id,
            api_key,
            sender_id,
            to,
            message,
      type: 'unicode', 
        };

        // Make the POST request to the API
        const response = await axios.post(url, payload);

        // Increment and store the count of sent SMS
        const sMSCount = await instituteModel.findOneAndUpdate({_id: instID }, { $inc: { smsCount: 1 } }, { upsert: true });

        // Send the response back to the client
        res.status(200).json({ ...response.data, sMSCount });

    } catch (error) {
        console.error('Error sending SMS:', error);
        res.status(500).json({ error: 'Failed to send SMS' });
    }
};
const getSmsCount = async (req, res) => {
    try {
        // Query the database for the SMS count
        const smsCount = await instituteModel.findOne();
        
        // If there's no count document yet, return 0
        const count = smsCount ? smsCount.count : 0;

        console.log(count)

        // Send the SMS count as a response
        res.status(200).json({ count });
    } catch (error) {
        console.error('Error retrieving SMS count:', error);
        res.status(500).json({ error: 'Failed to retrieve SMS count' });
    }
};

module.exports = { sendSMS, getSmsCount };
