import { PORT } from './utils/env-variables';
import app from './app';

const port = PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
