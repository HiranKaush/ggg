const qrcode = require('qrcode');

exports.qrGenerator = (req, res) => {
  const { std_ID } = req.body;

  if (!std_ID || std_ID.length === 0) {
    res.status(400).send("Empty Data or Missing std_ID");
    return;
  }

  const studentDetails = { std_ID};

  try {
    const options = {
      errorCorrectionLevel: 'low',
      scale: 4,
    };

    qrcode.toDataURL(JSON.stringify(studentDetails), options, (err, qrCodeUrl) => {
      if (err) {
        
        res.status(500).send("Error generating QR code");
      } else {
        res.send(qrCodeUrl);
      }
    });
  } catch (err) {
    
    res.status(500).send("Error generating QR code");
  }
};
