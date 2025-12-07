import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Claude API proxy endpoint
app.post('/api/claude/v1/messages', async (req, res) => {
  console.log('📨 Received request to Claude API proxy');
  
  try {
    const apiKey = process.env.VITE_CLAUDE_API_KEY;
    
    if (!apiKey) {
      console.error('❌ API key not configured');
      return res.status(500).json({ error: { message: 'API key not configured' } });
    }

    console.log('✅ API key found, forwarding to Claude...');
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    console.log(`📥 Claude response: ${response.status}`);
    
    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.json(data);
  } catch (error) {
    console.error('❌ Proxy error:', error);
    res.status(500).json({ error: { message: 'Internal server error' } });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});
