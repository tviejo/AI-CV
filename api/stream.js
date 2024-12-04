const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

app.post('/api/stream', async (req, res) => {
  const { prompt, stream } = req.body;

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/completions',
      {
        model: 'text-davinci-003',
        prompt,
        max_tokens: 150,
        stream,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        responseType: 'stream',
      }
    );

    response.data.pipe(res);
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).send('Error communicating with OpenAI API');
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
