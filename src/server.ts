import app from './app';
import { PORT } from './utils/env-variables';

const port = PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
