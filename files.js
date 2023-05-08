/** @satisfies {import('@webcontainer/api').FileSystemTree} */

export const files = {
	"index.js": {
		file: {
			contents: `
      const browserSync = require("browser-sync");
      browserSync.init({
        server: {
          baseDir: "./",
        },
        files: "*.html",
      });`,
		},
	},
	"index.html": {
		file: {
			contents: `
      <!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title>My Project</title>
	</head>
	<body>
		<h1>Hello Aodhan</h1>
	</body>
</html>
`,
		},
	},
	"package.json": {
		file: {
			contents: `
      {
        "name": "example-app",
        "dependencies": {
          "browser-sync": "^2.29.1"
        },
        "scripts": {
          "dev": "node index.js"
        }
    }`,
		},
	},
};
