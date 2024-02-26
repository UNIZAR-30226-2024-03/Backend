const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello world!');
});
app.listen(port, () => {
  console.log(`Server listen on http://localhost:${port}`);
});


// app.use('/api', require('./routes/userRoutes'))
// app.use('/api', require('./routes/departmentRoutes'))