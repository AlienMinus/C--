import express from 'express';
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
  });
}

export default app;
