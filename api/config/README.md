Copy local-development.example.js to local-development.js

If you want to set up var envs, write them at the end of the file.

You need to have those vars defined in your .env file AT ROOT OF MONOREPO (PM other dev if not):
GITGUARDIAN_API_KEY=
SCW_ACCESS_KEY=
SCW_SECRET_KEY=
SCW_DEFAULT_PROJECT_ID=
DEV=true
