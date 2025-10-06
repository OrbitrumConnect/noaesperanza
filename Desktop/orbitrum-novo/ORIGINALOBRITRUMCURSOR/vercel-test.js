export default function handler(req, res) {
  res.status(200).json({ 
    success: true, 
    message: 'VERCEL FUNCTIONS FUNCIONANDO!',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    test: 'RAIZ DO PROJETO'
  });
} 