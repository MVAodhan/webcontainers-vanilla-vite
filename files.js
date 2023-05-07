/** @satisfies {import('@webcontainer/api').FileSystemTree} */

export const files = {
	"index.js": {
		file: {
			contents: `
  import express from 'express';
  import axios from 'axios'
  const app = express();
  const port = 3111;
  
  app.get('/', async (req, res) => {
    const schedule = await axios.get('https://www.learnwithjason.dev/api/v2/schedule')
    res.send(schedule.data);
  });
  
  app.listen(port, () => {
    console.log(\`App is live at http://localhost:\${port}\`);
  });`,
		},
	},
	"package.json": {
		file: {
			contents: `
      {
        "name": "example-app",
        "type": "module",
        "dependencies": {
            "axios": "^1.4.0",
            "express": "latest",
            "nodemon": "latest"
        },
        "scripts": {
            "start": "nodemon --watch './' index.js"
        }
    }`,
		},
	},
};
